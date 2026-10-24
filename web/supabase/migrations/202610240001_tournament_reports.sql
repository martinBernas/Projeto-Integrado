-- RF19: immutable closure snapshot, private delivery outbox and logical withdrawal.
-- Installation does not close, enqueue or withdraw existing tournaments.
begin;
set local lock_timeout='10s';

create table private.tournament_reports (
 tournament_id uuid primary key references public.tournaments(id),
 snapshot jsonb, pdf_base64 text, generated_at timestamptz,
 created_at timestamptz not null default now(), due_at timestamptz not null,
 withdrawn_at timestamptz, withdrawn_by uuid,
 lease_token uuid, lease_until timestamptz, last_error text,
 next_attempt_at timestamptz not null default now(),
 check ((lease_token is null) = (lease_until is null))
);
create table private.tournament_report_deliveries (
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references private.tournament_reports(tournament_id),
 player_id uuid not null, email text,
 state text not null default 'pending' check(state in('pending','sending','accepted','sent','failed','uncertain')),
 first_attempt_at timestamptz, sent_at timestamptz, provider_id text,
 unique(tournament_id,player_id)
);
alter table private.tournament_reports enable row level security;
alter table private.tournament_report_deliveries enable row level security;
revoke all on private.tournament_reports,private.tournament_report_deliveries from public,anon,authenticated;
create index tournament_report_due on private.tournament_reports(due_at) where withdrawn_at is null;
create table private.tournament_mail_events (
 provider_id text primary key, event text not null check(event in('email.delivered','email.bounced','email.failed')),
 event_at timestamptz not null, received_at timestamptz not null default now()
);
alter table private.tournament_mail_events enable row level security;
revoke all on private.tournament_mail_events from public,anon,authenticated;

-- A private filtered relation also serves SECURITY DEFINER read endpoints,
-- whose owner bypasses RLS. Do not rely on UI filtering to withdraw access.
create view private.available_tournaments as
 select t.* from public.tournaments t where not exists
 (select 1 from private.tournament_reports r where r.tournament_id=t.id and r.withdrawn_at is not null);
revoke all on private.available_tournaments from public,anon,authenticated;
create or replace function private.can_view_tournament(target uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from private.available_tournaments t where t.id=target and
 (t.organizer_id=auth.uid() or exists(select 1 from public.tournament_participants p where p.tournament_id=t.id and p.player_id=auth.uid())));
$$;

-- Retain exact existing response contracts and permissions. Rebind only the
-- explicit read endpoints and private list helper to the filtered relation.
-- No mutation or calculation function is rewritten by this block.
do $$
declare signature text; definition text;
begin
 foreach signature in array array[
  'public.get_legacy_tournament_dashboard(uuid)',
  'public.get_managed_participants(uuid)',
  'public.list_participant_candidates(uuid,text,integer)',
  'public.get_score_change_summary()',
  'public.get_score_changes(integer)',
  'public.get_tournament_notifications()',
  'public.get_tournament_score_changes(uuid,integer)',
  'private.list_score_changes(integer,text)'
 ] loop
  definition:=pg_get_functiondef(signature::regprocedure);
  if position('public.tournaments' in definition)=0 then raise exception 'unexpected_read_endpoint: %',signature; end if;
  execute replace(definition,'public.tournaments','private.available_tournaments');
 end loop;
end $$;

create function private.prepare_tournament_report(target uuid) returns void
language plpgsql security definer set search_path='' as $$
declare t public.tournaments;
begin
 select * into t from public.tournaments where id=target for update;
 if not found or t.closed_at is null then raise exception 'tournament_not_closed'; end if;
 if exists(select 1 from private.tournament_reports where tournament_id=target) then return; end if;
  insert into private.tournament_reports(tournament_id,due_at,snapshot)
  values(t.id,t.closed_at+interval '168 hours',jsonb_build_object(
   'tournament',jsonb_build_object('id',t.id,'name',t.name,'starts_at',t.starts_at,'ends_at',t.ends_at,'closed_at',t.closed_at),
   'participants',coalesce((select jsonb_agg(jsonb_build_object('id',p.player_id,'name',private.visible_player_name(pr),'eligible_from',p.eligible_from) order by p.player_id)
     from public.tournament_participants p join public.profiles pr on pr.id=p.player_id where p.tournament_id=t.id),'[]'),
   'results',coalesce((select jsonb_agg(jsonb_build_object('player_id',r.player_id,'played_on',r.played_on,
    'raw_score',r.raw_score,'applied_score',r.applied_score,'result_kind',r.result_kind,'provisional',r.provisional,
    'applied_rule_snapshot',r.applied_rule_snapshot) order by r.played_on,r.player_id)
    from public.tournament_score_results r where r.tournament_id=t.id),'[]')));
  insert into private.tournament_report_deliveries(tournament_id,player_id,email)
   select t.id,p.player_id,nullif(btrim(u.email),'') from public.tournament_participants p
   left join auth.users u on u.id=p.player_id where p.tournament_id=t.id;

end $$;
revoke all on function private.prepare_tournament_report(uuid) from public,anon,authenticated;
create function private.capture_tournament_report() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if old.closed_at is null and new.closed_at is not null then perform private.prepare_tournament_report(new.id); end if;
 return new;
end $$;
revoke all on function private.capture_tournament_report() from public,anon,authenticated;
create trigger capture_final_report after update of closed_at on public.tournaments
 for each row execute function private.capture_tournament_report();

create function private.withdraw_tournament_report(target uuid, actor uuid default null) returns void
language plpgsql set search_path='' as $$
declare r private.tournament_reports;
begin
 perform 1 from public.tournaments where id=target for update;
 select * into r from private.tournament_reports where tournament_id=target for update;
 if not found then raise exception 'report_missing'; end if;
 if r.withdrawn_at is not null then return; end if;
 perform 1 from private.tournament_report_deliveries where tournament_id=target order by id for update;
 if r.generated_at is null or exists(select 1 from private.tournament_report_deliveries where tournament_id=target and state<>'sent')
  then raise exception 'report_delivery_pending'; end if;
 if r.lease_until>clock_timestamp() then raise exception 'report_busy'; end if;
 update private.tournament_reports set withdrawn_at=clock_timestamp(),withdrawn_by=actor,
  snapshot=null,pdf_base64=null,last_error=null where tournament_id=target;
 -- No PDF or recipient address is retained by this outbox after withdrawal.
 update private.tournament_report_deliveries set email=null where tournament_id=target;
end $$;
revoke all on function private.withdraw_tournament_report(uuid,uuid) from public,anon,authenticated;

create function public.withdraw_tournament(target uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.tournaments where id=target and organizer_id=auth.uid() and closed_at is not null)
  then raise exception 'tournament_not_allowed' using errcode='42501'; end if;
 perform private.withdraw_tournament_report(target,auth.uid());
end $$;
revoke all on function public.withdraw_tournament(uuid) from public,anon;
grant execute on function public.withdraw_tournament(uuid) to authenticated;

create function public.get_tournament_report_status(target uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not private.can_view_tournament(target) or not exists(select 1 from public.tournaments where id=target and organizer_id=auth.uid())
  then raise exception 'tournament_not_allowed' using errcode='42501'; end if;
 return (select jsonb_build_object('generated',r.generated_at is not null,'due_at',r.due_at,'error',r.last_error,
  'busy',coalesce(r.lease_until>clock_timestamp(),false),'recipients',(select count(*) from private.tournament_report_deliveries d where d.tournament_id=target),
  'sent',(select count(*) from private.tournament_report_deliveries d where d.tournament_id=target and state='sent'),
  'uncertain',(select count(*) from private.tournament_report_deliveries d where d.tournament_id=target and state='uncertain'))
  from private.tournament_reports r where r.tournament_id=target);
end $$;
revoke all on function public.get_tournament_report_status(uuid) from public,anon;
grant execute on function public.get_tournament_report_status(uuid) to authenticated;

-- Dedicated server-only RPCs. Never return snapshot, PDF or addresses to a user client.
create function public.claim_tournament_report(target uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r private.tournament_reports; token uuid:=gen_random_uuid();
begin
 select * into r from private.tournament_reports q where q.withdrawn_at is null
  and (target is not null or q.next_attempt_at<=clock_timestamp())
  and (target is null or q.tournament_id=target) and coalesce(q.lease_until,'-infinity')<clock_timestamp()
  and (q.generated_at is null or exists(select 1 from private.tournament_report_deliveries d where d.tournament_id=q.tournament_id and d.state in('pending','failed','sending')))
  order by q.created_at for update skip locked limit 1;
 if not found then return null; end if;
 update private.tournament_reports set lease_token=token,lease_until=clock_timestamp()+interval '5 minutes',last_error=null where tournament_id=r.tournament_id;
 -- An ambiguous send is never automatically retried outside the provider's
 -- 24h idempotency window. Keep the tournament and require reconciliation.
 update private.tournament_report_deliveries set state='uncertain'
  where tournament_id=r.tournament_id and state='sending' and first_attempt_at<clock_timestamp()-interval '23 hours';
 return jsonb_build_object('id',r.tournament_id,'token',token,'snapshot',r.snapshot,'pdf',r.pdf_base64,
  'deliveries',coalesce((select jsonb_agg(to_jsonb(d) order by id) from private.tournament_report_deliveries d
    where d.tournament_id=r.tournament_id and d.state in('pending','failed','sending')),'[]'));
end $$;

create function public.save_tournament_report(target uuid, token uuid, pdf text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if pdf is null or length(pdf) not between 100 and 12000000 or pdf !~ '^[A-Za-z0-9+/=\r\n]+$' then raise exception 'invalid_pdf'; end if;
 update private.tournament_reports set pdf_base64=pdf,generated_at=clock_timestamp(),last_error=null
 where tournament_id=target and lease_token=token and lease_until>clock_timestamp() and withdrawn_at is null and generated_at is null;
 if not found then raise exception 'report_lease_lost'; end if;
end $$;

create function public.begin_tournament_delivery(target uuid, token uuid, delivery uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from private.tournament_reports where tournament_id=target and lease_token=token and lease_until>clock_timestamp() and withdrawn_at is null and generated_at is not null for update;
 if not found then raise exception 'report_lease_lost'; end if;
 update private.tournament_report_deliveries set state='sending',first_attempt_at=coalesce(first_attempt_at,clock_timestamp())
 where id=delivery and tournament_id=target and state in('pending','failed','sending')
 and (state<>'sending' or first_attempt_at>clock_timestamp()-interval '23 hours');
 if not found then raise exception 'delivery_not_retryable'; end if;
end $$;

create function public.complete_tournament_delivery(target uuid, token uuid, delivery uuid, provider text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from private.tournament_reports where tournament_id=target and lease_token=token and lease_until>clock_timestamp() and withdrawn_at is null for update;
 if not found then raise exception 'report_lease_lost'; end if;
 if nullif(provider,'') is null then raise exception 'provider_id_required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(provider,0));
 update private.tournament_report_deliveries set state=coalesce((select case when e.event='email.delivered' then 'sent' else 'uncertain' end from private.tournament_mail_events e where e.provider_id=provider),'accepted'),
 sent_at=(select case when e.event='email.delivered' then e.event_at end from private.tournament_mail_events e where e.provider_id=provider),provider_id=provider
 where id=delivery and tournament_id=target and state='sending';
 if not found then raise exception 'delivery_not_sending'; end if;
end $$;

-- Store minimal verified events even when a webhook races the API response.
create function public.record_tournament_mail_event(provider text, event_type text, occurred timestamptz) returns void
language plpgsql security definer set search_path='' as $$
begin
 if event_type not in('email.delivered','email.bounced','email.failed') or length(provider)>200 or nullif(provider,'') is null
  or occurred is null or occurred>clock_timestamp()+interval '5 minutes' then raise exception 'invalid_mail_event'; end if;
 perform pg_advisory_xact_lock(hashtextextended(provider,0));
 insert into private.tournament_mail_events(provider_id,event,event_at) values(provider,event_type,occurred)
 on conflict(provider_id) do update set event=excluded.event,event_at=excluded.event_at
 where excluded.event_at>=tournament_mail_events.event_at;
 update private.tournament_report_deliveries d set state=case when e.event='email.delivered' then 'sent' else 'uncertain' end,
 sent_at=case when e.event='email.delivered' then e.event_at end
 from private.tournament_mail_events e where d.provider_id=provider and e.provider_id=provider;
end $$;

create function public.release_tournament_report(target uuid, token uuid, failure text default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 update private.tournament_reports set lease_token=null,lease_until=null,
 last_error=case when failure is not null then 'processing_failed' end,
 next_attempt_at=case when failure is not null then clock_timestamp()+interval '30 minutes' else clock_timestamp() end
 where tournament_id=target and lease_token=token;
end $$;

create function private.withdraw_due_tournaments() returns integer
language plpgsql security definer set search_path='' as $$
declare target uuid; processed integer:=0;
begin
 for target in select r.tournament_id from private.tournament_reports r where r.withdrawn_at is null and r.due_at<=clock_timestamp()
 and r.generated_at is not null and coalesce(r.lease_until,'-infinity')<clock_timestamp()
 and not exists(select 1 from private.tournament_report_deliveries d where d.tournament_id=r.tournament_id and d.state<>'sent')
 order by r.due_at limit 100 loop
  perform private.withdraw_tournament_report(target); processed:=processed+1;
 end loop;
 return processed;
end $$;
create function public.withdraw_due_tournaments() returns integer
language sql security definer set search_path='' as $$ select private.withdraw_due_tournaments(); $$;
revoke all on function private.withdraw_due_tournaments() from public,anon,authenticated;
revoke all on function public.claim_tournament_report(uuid),public.save_tournament_report(uuid,uuid,text),
 public.begin_tournament_delivery(uuid,uuid,uuid),public.complete_tournament_delivery(uuid,uuid,uuid,text),
 public.release_tournament_report(uuid,uuid,text),public.withdraw_due_tournaments(),public.record_tournament_mail_event(text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.claim_tournament_report(uuid),public.save_tournament_report(uuid,uuid,text),
 public.begin_tournament_delivery(uuid,uuid,uuid),public.complete_tournament_delivery(uuid,uuid,uuid,text),
 public.release_tournament_report(uuid,uuid,text),public.withdraw_due_tournaments(),public.record_tournament_mail_event(text,text,timestamptz) to service_role;
commit;
