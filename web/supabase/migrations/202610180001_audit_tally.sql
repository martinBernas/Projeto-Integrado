-- Apply after score_audits, before publishing the two-step audit interface.
begin;
create function public.preview_score_audit(audit uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a private.score_audits; invalid integer; valid integer;
begin
 a:=private.require_audit(audit,true);
 if a.status<>'open' or clock_timestamp()<a.deadline then raise exception 'audit_not_ready'; end if;
 select count(*) filter(where choice='invalidate'),count(*) filter(where choice='maintain') into invalid,valid
 from private.audit_votes where audit_id=audit;
 return jsonb_build_object('invalid_votes',invalid,'maintain_votes',valid);
end $$;
revoke all on function public.preview_score_audit(uuid) from public,anon;
grant execute on function public.preview_score_audit(uuid) to authenticated;
commit;
