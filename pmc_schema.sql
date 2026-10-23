-- Clinical Prediction Models course: tables for the shared Supabase project.
-- Reuses profiles, cohorts, is_instructor() and instructor_set_password() from the EpiCompass schema.
-- Reconstructed from the applied migration; run once in the SQL editor of a project that already has EpiCompass.

create table if not exists public.pmc_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 800000),
  updated_at timestamptz not null default now()
);
create table if not exists public.pmc_overrides (
  key text primary key check (key ~ '^[a-z0-9_]{1,16}:[0-9]{1,5}$'),
  html text not null check (length(html) < 20000),
  base_hash text not null check (length(base_hash) < 32),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create table if not exists public.pmc_settings (
  key text primary key check (length(key) < 40),
  value jsonb not null default '{}'::jsonb check (pg_column_size(value) < 20000),
  updated_at timestamptz not null default now()
);
create table if not exists public.pmc_feedback (
  id bigint generated always as identity primary key,
  learner uuid not null references auth.users(id) on delete cascade,
  item text not null check (length(item) < 80),
  body text not null check (length(body) between 1 and 4000),
  author uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists pmc_feedback_learner_idx on public.pmc_feedback(learner);
create index if not exists pmc_feedback_author_idx on public.pmc_feedback(author);
create index if not exists pmc_overrides_updated_by_idx on public.pmc_overrides(updated_by);

alter table public.pmc_progress enable row level security;
alter table public.pmc_overrides enable row level security;
alter table public.pmc_settings enable row level security;
alter table public.pmc_feedback enable row level security;

create policy "pmc_progress read" on public.pmc_progress for select using (user_id = (select auth.uid()) or (select is_instructor()));
create policy "pmc_progress insert own" on public.pmc_progress for insert with check (user_id = (select auth.uid()));
create policy "pmc_progress update own" on public.pmc_progress for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "pmc_overrides read" on public.pmc_overrides for select using (true);
create policy "pmc_overrides ins" on public.pmc_overrides for insert with check ((select is_instructor()));
create policy "pmc_overrides upd" on public.pmc_overrides for update using ((select is_instructor())) with check ((select is_instructor()));
create policy "pmc_overrides del" on public.pmc_overrides for delete using ((select is_instructor()));

create policy "pmc_settings read" on public.pmc_settings for select using (true);
create policy "pmc_settings ins" on public.pmc_settings for insert with check ((select is_instructor()));
create policy "pmc_settings upd" on public.pmc_settings for update using ((select is_instructor())) with check ((select is_instructor()));
create policy "pmc_settings del" on public.pmc_settings for delete using ((select is_instructor()));

create policy "pmc_feedback read" on public.pmc_feedback for select using (learner = (select auth.uid()) or (select is_instructor()));
create policy "pmc_feedback ins" on public.pmc_feedback for insert with check ((select is_instructor()));
create policy "pmc_feedback del" on public.pmc_feedback for delete using ((select is_instructor()));

-- Join code: add a row to the existing cohorts table with code PMC-2026 (see the instructor dashboard, Setup tab).
