-- Execute in the Supabase SQL Editor as postgres after the form tests.
-- Tests database authorization with the same roles used by the API.
-- Simulated claims do not replace the already performed real login tests.
-- All test writes are inside a transaction that is rolled back.
begin;
do $$
begin
  if not exists(select 1 from private.sprint3_form_test where id='form-test-v1' and restored_at is null
    and test_day=(now() at time zone 'America/Sao_Paulo')::date) then
    raise exception 'Backup ativo do dia nao encontrado; revisar antes do teste';
  end if;
  if not exists(select 1 from public.personal_scores where player_id='b3afc09f-8eb4-4d1d-ab46-0113b3a7968d'
    and played_on=(now() at time zone 'America/Sao_Paulo')::date and score=12000)
    or not exists(select 1 from public.personal_scores where player_id='af91b88b-46c0-4c8a-9dd3-be5787b90517'
    and played_on=(now() at time zone 'America/Sao_Paulo')::date and score=15000) then
    raise exception 'Esperados 12000 na conta A e 15000 na conta B hoje';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub','b3afc09f-8eb4-4d1d-ab46-0113b3a7968d',true);
select set_config('request.jwt.claims','{"sub":"b3afc09f-8eb4-4d1d-ab46-0113b3a7968d","role":"authenticated"}',true);
do $$
declare affected integer;
begin
  if auth.uid() <> 'b3afc09f-8eb4-4d1d-ab46-0113b3a7968d'::uuid then raise exception 'Identidade simulada incorreta'; end if;
  if not exists(select 1 from public.personal_scores where player_id=auth.uid() and score=12000
    and played_on=(now() at time zone 'America/Sao_Paulo')::date) then raise exception 'Leitura propria bloqueada'; end if;
  if exists(select 1 from public.personal_scores where player_id='af91b88b-46c0-4c8a-9dd3-be5787b90517') then
    raise exception 'FALHA: conta A leu historico pessoal de B';
  end if;
  begin
    update public.personal_scores set score=12345 where player_id='af91b88b-46c0-4c8a-9dd3-be5787b90517';
    get diagnostics affected=row_count;
    if affected<>0 then raise exception 'FALHA: conta A alterou dados de B'; end if;
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.personal_scores where player_id='af91b88b-46c0-4c8a-9dd3-be5787b90517';
    get diagnostics affected=row_count;
    if affected<>0 then raise exception 'FALHA: conta A excluiu dados de B'; end if;
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.submit_personal_score((now() at time zone 'America/Sao_Paulo')::date-1,10000);
    raise exception 'FALHA: envio para dia passado aceito';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.submit_personal_score((now() at time zone 'America/Sao_Paulo')::date+1,10000);
    raise exception 'FALHA: envio para dia futuro aceito';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.submit_personal_score((now() at time zone 'America/Sao_Paulo')::date,-1);
    raise exception 'FALHA: valor negativo aceito';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.submit_personal_score((now() at time zone 'America/Sao_Paulo')::date,25001);
    raise exception 'FALHA: valor acima de 25000 aceito';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.submit_personal_score((now() at time zone 'America/Sao_Paulo')::date,null);
    raise exception 'FALHA: valor nulo aceito';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform private.complete_september_history();
    raise exception 'FALHA: conta comum concluiu carga administrativa';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Account B was restored to nonparticipant after the earlier rehearsal.
select set_config('request.jwt.claim.sub','af91b88b-46c0-4c8a-9dd3-be5787b90517',true);
select set_config('request.jwt.claims','{"sub":"af91b88b-46c0-4c8a-9dd3-be5787b90517","role":"authenticated"}',true);
do $$
begin
  if exists(select 1 from public.personal_scores where player_id='b3afc09f-8eb4-4d1d-ab46-0113b3a7968d') then
    raise exception 'FALHA: conta B leu historico pessoal de A';
  end if;
  if (public.get_september_dashboard()->>'access')::boolean is distinct from false then
    raise exception 'FALHA: conta B nao deveria estar vinculada neste ensaio';
  end if;
end $$;

reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$
begin
  begin
    perform public.get_september_dashboard();
    raise exception 'FALHA: acesso anonimo ao torneio aceito';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.submit_personal_score((now() at time zone 'America/Sao_Paulo')::date,10000);
    raise exception 'FALHA: lancamento anonimo aceito';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
rollback;

select 'APROVADO' as resultado,
  'Isolamento entre contas, escrita/exclusao de terceiro, datas, limites inteiros, funcao administrativa e acesso anonimo' as verificacoes,
  'Transacao revertida; pontuacoes preservadas' as dados;
