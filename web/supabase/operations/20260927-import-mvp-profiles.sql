-- Carga pontual autorizada pelo Dono do produto em 27/09/2026.
-- Fonte: GeoGuaras.xlsx / Diario!A2:C16 (nome publico e hyperlink da coluna B).
-- SHA256: e74d1a6560a56ee1f7d3103df641199fbf308b2a5e735a46b6e0082bf93efcc4
-- Identidades: coluna C confirmada na carga MVP; Luca/Zade usam UUIDs confirmados.
-- Executar INTEGRALMENTE como administrador no SQL Editor, apos S4-04/S4-05.
-- 12 nomes, 11 URLs; Martin fora da carga: perfil preenchido pelo titular.
-- Luca sem URL na fonte: preserva a URL atual.
-- Valores manuais divergentes ou contas ausentes/ambiguas abortam tudo.
-- Auditoria privada existente guarda o antes/depois; nao altera o backup original.
begin;
lock table auth.users in share mode;
lock table public.profiles in share row exclusive mode;
create temporary table mvp_profile_import (
  legacy_name text primary key, account text unique, player_id uuid unique,
  public_name text not null, profile_url text
) on commit drop;
insert into mvp_profile_import values
('Leo', 'leonardohuffo', null, 'Leonardo H', 'https://www.geoguessr.com/user/60dbd573c3313c000146a66e'),
('Luca', null, '8d899496-3cb0-41f6-b67d-4e57bb1185c4', 'Lucacavalhojeo', null),
('Fabio', 'fabio.teixeira.sap', null, 'FabaoPoa', 'https://www.geoguessr.com/user/69e8f1aa1559fe8cf58b629e'),
('Arthur', 'arthur.andrade', null, 'Andrade', 'https://www.geoguessr.com/user/6a4e3bc7440b64f34c10fd80'),
('Tales', 'tales.ocampos', null, 'taleco', 'https://www.geoguessr.com/user/6a4bb52b2c1f4e777e88ec73'),
('Diana', 'dianaseibt', null, 'Didi98', 'https://www.geoguessr.com/user/6a1719163c0aebced0e20f4e'),
('Zade', null, '55a4aeaf-30bc-403a-a5e6-563328466313', 'Zader', 'https://www.geoguessr.com/user/6a8dc3b4a003de6e408d5ff9'),
('Luiz', 'luizf9844', null, 'Luiz Fernando', 'https://www.geoguessr.com/user/620703192314ea0001de8bc2'),
('Vinicius', 'ramos.viniciusuriel', null, 'Vinícius Ramos', 'https://www.geoguessr.com/user/5da9962290bbda1624640733'),
('Eduardo', 'eduardobrohr2', null, 'Rohr1', 'https://www.geoguessr.com/user/671d0e95fe130faf8e40b4df'),
('Cristina', 'crisbobsin', null, 'Weissheimer', 'https://www.geoguessr.com/user/69ea41e2ec57ecc505bcc565'),
('Bastian', 'math.9711', null, 'Matheus Bastian', 'https://www.geoguessr.com/user/5d7d89ae1d19ab7b7ce3ccc2');

do $$
declare item record; matches integer; resolved uuid; current_profile public.profiles;
begin
  for item in select * from mvp_profile_import order by legacy_name loop
    if item.player_id is null then
      select count(*), min(u.id::text)::uuid into matches, resolved
      from auth.users u join public.profiles p on p.id=u.id
      where split_part(u.email,'@',1)=item.account;
    else
      select count(*), min(u.id::text)::uuid into matches, resolved
      from auth.users u join public.profiles p on p.id=u.id where u.id=item.player_id;
    end if;
    if matches <> 1 then
      raise exception 'mvp_profile_identity: % tem % correspondencias', item.legacy_name, matches;
    end if;
    update mvp_profile_import set player_id=resolved,
      public_name=private.validate_public_name(item.public_name),
      profile_url=private.clean_geoguessr_url(item.profile_url)
      where legacy_name=item.legacy_name;
    select * into strict current_profile from public.profiles where id=resolved;
    if current_profile.display_name is distinct from item.legacy_name
       and current_profile.display_name is distinct from item.public_name then
      raise exception 'mvp_profile_name_changed: %; conferir nome atual antes da carga', item.legacy_name;
    end if;
    if item.profile_url is not null and current_profile.geoguessr_url is not null
       and current_profile.geoguessr_url is distinct from private.clean_geoguessr_url(item.profile_url) then
      raise exception 'mvp_profile_url_changed: %; conferir URL atual antes da carga', item.legacy_name;
    end if;
  end loop;
  if exists(select 1 from mvp_profile_import i join public.profiles p
    on private.public_name_key(p.display_name)=private.public_name_key(i.public_name)
    and p.id<>i.player_id) then
    raise exception 'mvp_profile_name_unavailable: nome da planilha reservado por outra conta';
  end if;
end $$;

-- A trigger private.log_profile_change registra somente perfis efetivamente alterados.
update public.profiles p set display_name=i.public_name, public_name_confirmed=true,
  geoguessr_url=coalesce(i.profile_url,p.geoguessr_url)
from mvp_profile_import i where p.id=i.player_id
  and (p.display_name,p.public_name_confirmed,p.geoguessr_url)
    is distinct from (i.public_name,true,coalesce(i.profile_url,p.geoguessr_url));

do $$ begin
  if (select count(*) from public.profiles p join mvp_profile_import i on i.player_id=p.id
    where p.display_name=i.public_name and p.public_name_confirmed
      and (i.profile_url is null or p.geoguessr_url=i.profile_url)) <> 12 then
    raise exception 'mvp_profile_reconciliation_failed';
  end if;
end $$;

select i.legacy_name as nome_mvp, p.id, p.display_name as nome_publico,
  p.geoguessr_url, p.public_name_confirmed as confirmado,
  case when i.profile_url is null then 'Sem URL na planilha; valor atual preservado'
       else 'Nome e URL conferidos' end as conferencia
from mvp_profile_import i join public.profiles p on p.id=i.player_id order by i.legacy_name;
commit;
