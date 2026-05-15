-- Run this in the Supabase SQL Editor

-- resumes table
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  original_filename text,
  original_text text,
  created_at timestamp with time zone default now()
);

alter table resumes enable row level security;

create policy "Users can only access their own resumes"
  on resumes for all
  using (auth.uid() = user_id);

-- optimizations table
create table if not exists optimizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  resume_id uuid references resumes(id) on delete cascade,
  job_title text,
  job_company text,
  job_input_type text check (job_input_type in ('url', 'text')),
  job_url text,
  job_description_raw text,
  optimized_cv_json jsonb,
  ats_score integer check (ats_score >= 0 and ats_score <= 100),
  ats_keywords jsonb,
  tips jsonb,
  created_at timestamp with time zone default now()
);

alter table optimizations enable row level security;

create policy "Users can only access their own optimizations"
  on optimizations for all
  using (auth.uid() = user_id);

-- user_credits table
create table if not exists user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  credits integer default 1,
  is_pro boolean default false,
  plan text not null default 'free',
  pro_expires_at timestamp with time zone,
  updated_at timestamp with time zone default now()
);

alter table user_credits enable row level security;

create policy "Users can only access their own credits"
  on user_credits for all
  using (auth.uid() = user_id);

-- Auto-create credit row on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_credits (user_id, credits, is_pro, plan)
  values (new.id, 1, false, 'free');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
