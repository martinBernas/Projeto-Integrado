-- Emergency schema recovery ONLY before S5 use and with unchanged business data.
-- Do not use after revisions, normal writes or creation of new tournaments.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_participants,public.personal_scores,
 public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
 public.tournament_rule_versions in access exclusive mode;
do $$ declare b private.sprint5_backups;
begin
 select * into b from private.sprint5_backups where id='before-s5-v1';
 if not found then raise exception 'Backup S5 nao encontrado'; end if;
 if b.snapshot is distinct from private.sprint5_snapshot(b.as_of) then
   raise exception 'Dados mudaram; recuperacao automatica recusada'; end if;
 if exists(select 1 from private.rule_revision_changes) or
   exists(select 1 from public.tournament_rule_versions where actor_id is not null) or
   (select count(*) from public.tournament_rule_versions)<>(select count(*) from public.tournaments) then
   raise exception 'S5 utilizada; recuperacao automatica recusada'; end if;
end $$;
drop function public.apply_tournament_rules(uuid,jsonb,text);
drop function public.preview_tournament_rules(uuid,jsonb);
drop function public.create_configured_tournament(text,date,date,jsonb);
drop function public.get_tournament_dashboard(uuid);
alter function public.get_legacy_tournament_dashboard(uuid) rename to get_tournament_dashboard;
drop trigger initialize_tournament_rules on public.tournaments;
drop function private.initialize_tournament_rules();
drop function private.rule_preview(uuid,jsonb);
drop function private.validate_rule_proposal(public.tournaments,jsonb);
-- Restore the old calculation before dropping its S5 dependency.
do $$ declare definition text;
begin
 for definition in select jsonb_array_elements_text(function_definitions) from private.sprint5_backups where id='before-s5-v1'
 loop execute definition; end loop;
end $$;
drop function private.calculate_versioned_tournament(uuid,date,jsonb);
drop function private.rule_on_day(uuid,date);
drop table public.tournament_rule_versions;
drop table private.rule_revision_changes;
alter table public.tournaments drop constraint tournament_fixed_timezone;
revoke all on function public.get_tournament_dashboard(uuid) from public,anon;
grant execute on function public.get_tournament_dashboard(uuid) to authenticated;
do $$ declare b private.sprint5_backups;
begin
 select * into b from private.sprint5_backups where id='before-s5-v1';
 if b.snapshot is distinct from private.sprint5_snapshot(b.as_of) then raise exception 'Recuperacao nao conciliou'; end if;
end $$;
commit;
