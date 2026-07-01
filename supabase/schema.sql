-- Sehi / صحي — run in Supabase SQL Editor
-- Enables auth + per-user health data with Row Level Security

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null default '',
  onboarding_complete boolean not null default false,
  profile jsonb,
  macro_targets jsonb,
  medications jsonb default '[]'::jsonb,
  calendar_events jsonb default '[]'::jsonb,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generic user data blobs (food log, workouts, check-ins, etc.)
create table if not exists public.user_data (
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  data_key text not null default 'default',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, data_key)
);

create index if not exists user_data_kind_idx on public.user_data (user_id, kind);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists user_data_updated_at on public.user_data;
create trigger user_data_updated_at
  before update on public.user_data
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users read own data" on public.user_data;
drop policy if exists "Users insert own data" on public.user_data;
drop policy if exists "Users update own data" on public.user_data;
drop policy if exists "Users delete own data" on public.user_data;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users update own data"
  on public.user_data for update
  using (auth.uid() = user_id);

create policy "Users delete own data"
  on public.user_data for delete
  using (auth.uid() = user_id);
