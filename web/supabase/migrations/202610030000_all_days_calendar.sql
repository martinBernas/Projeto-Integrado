-- Apply before 202610030001_versioned_rules.sql. New enum value must be
-- committed before PostgreSQL permits its use in subsequent transactions.
begin;
alter type public.weekly_schedule add value if not exists 'every_day';
commit;
