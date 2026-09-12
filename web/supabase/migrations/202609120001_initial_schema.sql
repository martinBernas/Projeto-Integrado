create type public.scoring_mode as enum ('absolute', 'relative_to_lowest');
create type public.weekly_schedule as enum ('monday_to_friday', 'monday_to_friday_and_sunday');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, created_at timestamptz not null default now());
create table public.personal_scores (id uuid primary key default gen_random_uuid(), player_id uuid not null references public.profiles(id) on delete cascade, score integer not null check (score >= 0), occurred_at timestamptz not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.tournaments (id uuid primary key default gen_random_uuid(), organizer_id uuid not null references public.profiles(id) on delete restrict, name text not null check (char_length(name) between 3 and 100), starts_at date not null, ends_at date not null check (ends_at >= starts_at), timezone text not null default 'America/Sao_Paulo', scoring_mode public.scoring_mode not null default 'absolute', absence_penalty integer not null default 0, weekly_schedule public.weekly_schedule not null default 'monday_to_friday', created_at timestamptz not null default now());
create table public.tournament_participants (tournament_id uuid not null references public.tournaments(id) on delete cascade, player_id uuid not null references public.profiles(id) on delete cascade, joined_at timestamptz not null default now(), primary key (tournament_id, player_id));
create table public.tournament_excluded_dates (id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade, excluded_date date not null, reason text, unique (tournament_id, excluded_date));
create table public.tournament_score_results (id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade, personal_score_id uuid not null references public.personal_scores(id) on delete restrict, player_id uuid not null references public.profiles(id) on delete cascade, applied_score integer not null, applied_rule_snapshot jsonb not null, created_at timestamptz not null default now(), unique (tournament_id, personal_score_id));

create index personal_scores_player_occurred_at_idx on public.personal_scores (player_id, occurred_at desc);
create index tournament_participants_player_idx on public.tournament_participants (player_id);

alter table public.profiles enable row level security;
alter table public.personal_scores enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.tournament_excluded_dates enable row level security;
alter table public.tournament_score_results enable row level security;

create policy "profiles are visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "players manage own scores" on public.personal_scores for all to authenticated using ((select auth.uid()) = player_id) with check ((select auth.uid()) = player_id);
create policy "participants view tournament" on public.tournaments for select to authenticated using (organizer_id = (select auth.uid()) or exists (select 1 from public.tournament_participants p where p.tournament_id = id and p.player_id = (select auth.uid())));
create policy "users create own tournaments" on public.tournaments for insert to authenticated with check (organizer_id = (select auth.uid()));
create policy "organizers manage own tournaments" on public.tournaments for update to authenticated using (organizer_id = (select auth.uid())) with check (organizer_id = (select auth.uid()));
create policy "organizers delete own tournaments" on public.tournaments for delete to authenticated using (organizer_id = (select auth.uid()));
create policy "participants view memberships" on public.tournament_participants for select to authenticated using (player_id = (select auth.uid()) or exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = (select auth.uid())));
create policy "organizers manage memberships" on public.tournament_participants for all to authenticated using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = (select auth.uid()))) with check (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = (select auth.uid())));
create policy "participants view exclusions" on public.tournament_excluded_dates for select to authenticated using (exists (select 1 from public.tournaments t left join public.tournament_participants p on p.tournament_id = t.id where t.id = tournament_id and (t.organizer_id = (select auth.uid()) or p.player_id = (select auth.uid()))));
create policy "organizers manage exclusions" on public.tournament_excluded_dates for all to authenticated using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = (select auth.uid()))) with check (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = (select auth.uid())));
create policy "participants view results" on public.tournament_score_results for select to authenticated using (exists (select 1 from public.tournament_participants p where p.tournament_id = tournament_id and p.player_id = (select auth.uid())) or exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = (select auth.uid())));

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$ begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
