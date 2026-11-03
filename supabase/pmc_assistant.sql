-- CliPr study assistant (Clippy) insights, opt-in. Records only WHERE a learner asked (module, step, button,
-- selected course passage). Typed questions, replies and the learner's OpenRouter key are never stored.
alter table public.profiles add column if not exists pmc_insights_consent_at timestamptz;

create table if not exists public.pmc_assistant_asks (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  cohort_id  uuid references public.cohorts(id) on delete set null,
  module_id  text not null check (char_length(module_id) <= 40),
  step       text check (char_length(step) <= 40),
  action     text not null check (action in ('explain', 'example', 'why', 'quiz', 'question')),
  excerpt    text check (char_length(excerpt) <= 400),
  created_at timestamptz not null default now()
);
create index if not exists pmc_assistant_asks_mod on public.pmc_assistant_asks (module_id);
create index if not exists pmc_assistant_asks_cohort on public.pmc_assistant_asks (cohort_id, created_at);

create or replace function public.pmc_assistant_asks_fill() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  select cohort_id into new.cohort_id from public.profiles where id = auth.uid();
  new.created_at := now();
  return new;
end $$;
drop trigger if exists pmc_assistant_asks_fill on public.pmc_assistant_asks;
create trigger pmc_assistant_asks_fill before insert on public.pmc_assistant_asks
  for each row execute function public.pmc_assistant_asks_fill();

alter table public.pmc_assistant_asks enable row level security;
drop policy if exists "pmc asks: insert own with consent" on public.pmc_assistant_asks;
create policy "pmc asks: insert own with consent" on public.pmc_assistant_asks for insert to authenticated
  with check (user_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.pmc_insights_consent_at is not null));
drop policy if exists "pmc asks: instructor read" on public.pmc_assistant_asks;
create policy "pmc asks: instructor read" on public.pmc_assistant_asks for select to authenticated using ((select public.is_instructor()));
drop policy if exists "pmc asks: instructor delete" on public.pmc_assistant_asks;
create policy "pmc asks: instructor delete" on public.pmc_assistant_asks for delete to authenticated using ((select public.is_instructor()));

-- set (true) or withdraw (false) consent; withdrawing deletes the learner's records. Returns the consent time or null.
create or replace function public.pmc_set_insights_consent(on_ boolean) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare t timestamptz;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if on_ then
    update public.profiles set pmc_insights_consent_at = coalesce(pmc_insights_consent_at, now()) where id = auth.uid() returning pmc_insights_consent_at into t;
  else
    update public.profiles set pmc_insights_consent_at = null where id = auth.uid();
    delete from public.pmc_assistant_asks where user_id = auth.uid();
    t := null;
  end if;
  return t;
end $$;
revoke all on function public.pmc_set_insights_consent(boolean) from public, anon;
grant execute on function public.pmc_set_insights_consent(boolean) to authenticated;
revoke all on function public.pmc_assistant_asks_fill() from public, anon, authenticated;

-- number of learners who consented (no identities), for the instructor dashboard
create or replace function public.pmc_insights_consent_count() returns integer
language sql security definer set search_path = public as $$
  select case when public.is_instructor() then (select count(*)::int from public.profiles where pmc_insights_consent_at is not null) else null end
$$;
revoke all on function public.pmc_insights_consent_count() from public, anon;
grant execute on function public.pmc_insights_consent_count() to authenticated;
