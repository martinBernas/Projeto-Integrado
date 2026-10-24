-- Incremental: 001 is already installed remotely. No business data changes.
-- Success now means SMTP acceptance by Gmail, per product-owner decision.
begin;
set local lock_timeout='10s';

create or replace function public.claim_tournament_report(target uuid default null) returns jsonb
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
 -- SMTP has no idempotency key. An interrupted attempt is quarantined
 -- immediately, even within 24h; never automatically resend an uncertain mail.
 update private.tournament_report_deliveries set state='uncertain' where tournament_id=r.tournament_id and state='sending';
 return jsonb_build_object('id',r.tournament_id,'token',token,'snapshot',r.snapshot,'pdf',r.pdf_base64,
  'deliveries',coalesce((select jsonb_agg(to_jsonb(d) order by id) from private.tournament_report_deliveries d
    where d.tournament_id=r.tournament_id and d.state in('pending','failed')),'[]'));
end $$;

create function public.begin_gmail_tournament_delivery(target uuid, token uuid, delivery uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from private.tournament_reports where tournament_id=target and lease_token=token and lease_until>clock_timestamp()
  and withdrawn_at is null and generated_at is not null for update;
 if not found then raise exception 'report_lease_lost'; end if;
 update private.tournament_report_deliveries set state='sending',first_attempt_at=coalesce(first_attempt_at,clock_timestamp())
 where id=delivery and tournament_id=target and state in('pending','failed');
 if not found then raise exception 'delivery_not_retryable'; end if;
end $$;

create function public.complete_gmail_tournament_delivery(target uuid, token uuid, delivery uuid, provider text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from private.tournament_reports where tournament_id=target and lease_token=token and lease_until>clock_timestamp() and withdrawn_at is null for update;
 if not found then raise exception 'report_lease_lost'; end if;
 if nullif(provider,'') is null or length(provider)>200 then raise exception 'smtp_message_id_required'; end if;
 update private.tournament_report_deliveries set state='sent',sent_at=clock_timestamp(),provider_id=provider
 where id=delivery and tournament_id=target and state='sending';
 if not found then raise exception 'delivery_not_sending'; end if;
end $$;

create function public.fail_gmail_tournament_delivery(target uuid, token uuid, delivery uuid, retryable boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from private.tournament_reports where tournament_id=target and lease_token=token and lease_until>clock_timestamp() and withdrawn_at is null for update;
 if not found then raise exception 'report_lease_lost'; end if;
 -- Never roll back a completion if its acknowledgement was lost in transit.
 update private.tournament_report_deliveries set state=case when retryable is true then 'failed' else 'uncertain' end
 where id=delivery and tournament_id=target and state='sending';
end $$;

revoke all on function public.begin_gmail_tournament_delivery(uuid,uuid,uuid),
 public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text),public.fail_gmail_tournament_delivery(uuid,uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.begin_gmail_tournament_delivery(uuid,uuid,uuid),
 public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text),public.fail_gmail_tournament_delivery(uuid,uuid,uuid,boolean) to service_role;
-- Old deployments fail closed before sending; late Resend events cannot change
-- the SMTP success state. Retain tables/functions solely for historical records.
revoke all on function public.begin_tournament_delivery(uuid,uuid,uuid),public.complete_tournament_delivery(uuid,uuid,uuid,text),
 public.record_tournament_mail_event(text,text,timestamptz) from service_role;
commit;
