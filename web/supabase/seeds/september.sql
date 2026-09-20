-- Run in the Supabase SQL Editor AFTER both Sprint 3 migrations.
-- Organizer account identified by the Dono do produto for this project.
-- The matching public.profiles row must exist before provisioning.
begin;
do $$
declare organizer uuid := 'b3afc09f-8eb4-4d1d-ab46-0113b3a7968d';
begin
  if organizer is null then raise exception 'Informe o UUID da conta do organizador antes de executar'; end if;
  perform private.provision_september(organizer);
end $$;
commit;
