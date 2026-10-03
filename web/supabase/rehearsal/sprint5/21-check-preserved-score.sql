-- Read-only: compare the legitimate 03/10 score with the pre-cleanup capture.
with reference as (
 select e.value saved from private.sprint5_backups b,
 lateral jsonb_array_elements(b.snapshot->'scores') e
 where b.id='before-s5-test-cleanup-v1' and e.value->>'id'='01e70aa5-7f15-4971-b493-fb639d2293ba'
)
select 'preserved_live_score' check_name,
 r.saved->>'played_on' played_on,(r.saved->>'score')::integer score_before,
 s.score score_current,s.id is not null score_present,
 to_jsonb(s) is not distinct from r.saved unchanged_from_cleanup_backup
from reference r left join public.personal_scores s on s.id=(r.saved->>'id')::uuid;
