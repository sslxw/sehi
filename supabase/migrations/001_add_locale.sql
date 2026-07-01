-- Run if profiles table already exists without locale column
alter table public.profiles add column if not exists locale text not null default 'en';
