-- ============================================================================
-- Nova Finance — Supabase schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Fully idempotent: safe to run again on a project that already applied it —
-- every statement either uses IF NOT EXISTS/OR REPLACE or drops its own
-- policy/trigger before recreating it, so re-running never errors.
-- ============================================================================

-- Extension needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: one row per authenticated user, kept in sync with auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  -- Maps expense category name -> percentage of income allocated to it, e.g. {"Food": 15}
  budget_allocation jsonb not null default '{}'::jsonb,
  -- ISO 4217 currency code used to format amounts across the app, e.g. "USD", "EUR", "MAD"
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds columns for projects that ran an earlier version of this script.
alter table public.profiles
  add column if not exists budget_allocation jsonb not null default '{}'::jsonb;
alter table public.profiles
  add column if not exists currency text not null default 'USD';

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- transactions: income & expense entries, one row per transaction
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null default 'Other',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_date_idx
  on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;

drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own transactions" on public.transactions;
create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own transactions" on public.transactions;
create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- recurring_transactions: templates the client expands into real transaction
-- rows (rent, subscriptions, salary) each time it detects an occurrence is due
-- ----------------------------------------------------------------------------
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null default 'Other',
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  start_date date not null,
  -- Date of the last occurrence turned into a real transaction row; null until the first run.
  last_generated_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists recurring_transactions_user_id_idx
  on public.recurring_transactions (user_id);

alter table public.recurring_transactions enable row level security;

drop policy if exists "Users can view their own recurring transactions" on public.recurring_transactions;
create policy "Users can view their own recurring transactions"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own recurring transactions" on public.recurring_transactions;
create policy "Users can insert their own recurring transactions"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own recurring transactions" on public.recurring_transactions;
create policy "Users can update their own recurring transactions"
  on public.recurring_transactions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own recurring transactions" on public.recurring_transactions;
create policy "Users can delete their own recurring transactions"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- savings_goals: a target amount + deadline, with manually tracked progress
-- ----------------------------------------------------------------------------
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  deadline date,
  created_at timestamptz not null default now()
);

create index if not exists savings_goals_user_id_idx
  on public.savings_goals (user_id);

alter table public.savings_goals enable row level security;

drop policy if exists "Users can view their own savings goals" on public.savings_goals;
create policy "Users can view their own savings goals"
  on public.savings_goals for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own savings goals" on public.savings_goals;
create policy "Users can insert their own savings goals"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own savings goals" on public.savings_goals;
create policy "Users can update their own savings goals"
  on public.savings_goals for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own savings goals" on public.savings_goals;
create policy "Users can delete their own savings goals"
  on public.savings_goals for delete
  using (auth.uid() = user_id);
