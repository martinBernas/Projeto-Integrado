-- Read-only. Run before 202609270001_public_profiles.sql.
-- Empty collision list is required. Never rename or merge accounts automatically.
select lower(normalize(btrim(display_name, E' \t\n\r\f\013'), NFC)) as normalized_name,
  count(*) as accounts, array_agg(id order by id) as account_ids
from public.profiles
where nullif(btrim(display_name, E' \t\n\r\f\013'),'') is not null
group by lower(normalize(btrim(display_name, E' \t\n\r\f\013'), NFC)) having count(*) > 1;

select count(*) as existing_accounts,
  count(*) filter (where display_name is null or char_length(btrim(display_name)) not between 1 and 80
    or display_name ~ '[@[:cntrl:]]') as names_requiring_replacement
from public.profiles;
