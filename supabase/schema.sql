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

-- ----------------------------------------------------------------------------
-- trips: end-to-end trip planning — budget, expenses, itinerary, packing list
-- ----------------------------------------------------------------------------
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  destination text,
  start_date date,
  end_date date,
  budget_amount numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips (user_id);

alter table public.trips enable row level security;

drop policy if exists "Users can view their own trips" on public.trips;
create policy "Users can view their own trips"
  on public.trips for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own trips" on public.trips;
create policy "Users can insert their own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own trips" on public.trips;
create policy "Users can update their own trips"
  on public.trips for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own trips" on public.trips;
create policy "Users can delete their own trips"
  on public.trips for delete
  using (auth.uid() = user_id);

-- trip_expenses: spending logged against a specific trip's budget
create table if not exists public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null default 'Other',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists trip_expenses_trip_id_idx on public.trip_expenses (trip_id);

alter table public.trip_expenses enable row level security;

drop policy if exists "Users can view their own trip expenses" on public.trip_expenses;
create policy "Users can view their own trip expenses"
  on public.trip_expenses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own trip expenses" on public.trip_expenses;
create policy "Users can insert their own trip expenses"
  on public.trip_expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own trip expenses" on public.trip_expenses;
create policy "Users can delete their own trip expenses"
  on public.trip_expenses for delete
  using (auth.uid() = user_id);

-- trip_itinerary_items: day-by-day plan for a trip
create table if not exists public.trip_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_date date not null,
  item_time text,
  title text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists trip_itinerary_items_trip_id_idx on public.trip_itinerary_items (trip_id);

alter table public.trip_itinerary_items enable row level security;

drop policy if exists "Users can view their own itinerary items" on public.trip_itinerary_items;
create policy "Users can view their own itinerary items"
  on public.trip_itinerary_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own itinerary items" on public.trip_itinerary_items;
create policy "Users can insert their own itinerary items"
  on public.trip_itinerary_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own itinerary items" on public.trip_itinerary_items;
create policy "Users can delete their own itinerary items"
  on public.trip_itinerary_items for delete
  using (auth.uid() = user_id);

-- trip_checklist_items: packing / to-do list for a trip
create table if not exists public.trip_checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists trip_checklist_items_trip_id_idx on public.trip_checklist_items (trip_id);

alter table public.trip_checklist_items enable row level security;

drop policy if exists "Users can view their own checklist items" on public.trip_checklist_items;
create policy "Users can view their own checklist items"
  on public.trip_checklist_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own checklist items" on public.trip_checklist_items;
create policy "Users can insert their own checklist items"
  on public.trip_checklist_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own checklist items" on public.trip_checklist_items;
create policy "Users can update their own checklist items"
  on public.trip_checklist_items for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own checklist items" on public.trip_checklist_items;
create policy "Users can delete their own checklist items"
  on public.trip_checklist_items for delete
  using (auth.uid() = user_id);
