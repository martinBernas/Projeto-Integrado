-- Read-only diagnosis for a rejected single-rule migration.
-- Lists only open tournaments whose newest revision does not cover their full period.
select t.id tournament_id,t.name tournament_name,t.starts_at tournament_start,t.ends_at tournament_end,
 v.id latest_revision_id,v.version latest_revision,v.effective_from revision_start,v.effective_to revision_end,
 v.scoring_mode,v.absence_penalty,v.weekly_schedule,v.exclusions,v.reason
from public.tournaments t
left join lateral (
 select * from public.tournament_rule_versions r where r.tournament_id=t.id order by r.id desc limit 1
) v on true
where t.closed_at is null and (v.id is null or v.effective_from is distinct from t.starts_at or v.effective_to is distinct from t.ends_at)
order by t.name,t.id;
