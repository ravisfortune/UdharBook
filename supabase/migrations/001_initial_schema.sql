-- ============================================================
-- UdharBook — Supabase Initial Schema + RLS
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ─── Enable UUID extension ────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ─── CONTACTS ─────────────────────────────────────────────────
create table if not exists public.contacts (
  id             text primary key,               -- matches local SQLite UUID
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  phone          text,
  avatar_color   text default '#000666',
  avatar_letter  text not null,
  created_at     bigint not null,                -- unix ms (matches SQLite)
  updated_at     bigint not null,
  deleted        boolean default false
);

-- Indexes
create index if not exists idx_contacts_user_id  on public.contacts(user_id);
create index if not exists idx_contacts_deleted  on public.contacts(user_id, deleted);


-- ─── TRANSACTIONS ─────────────────────────────────────────────
create table if not exists public.transactions (
  id            text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  contact_id    text not null references public.contacts(id) on delete cascade,
  type          text not null check (type in ('gave', 'received')),
  amount        numeric(12, 2) not null check (amount > 0),
  note          text,
  date          bigint not null,
  split_id      text,
  created_at    bigint not null,
  deleted       boolean default false
);

-- Indexes
create index if not exists idx_txn_user_id    on public.transactions(user_id);
create index if not exists idx_txn_contact_id on public.transactions(contact_id);
create index if not exists idx_txn_date       on public.transactions(date desc);


-- ─── SPLITS ───────────────────────────────────────────────────
create table if not exists public.splits (
  id            text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text,
  emoji         text default '💸',
  split_type    text not null check (split_type in ('bill', 'loan', 'group')),
  split_method  text,
  total_amount  numeric(12, 2) not null,
  created_at    bigint not null,
  settled       boolean default false
);

create index if not exists idx_splits_user_id on public.splits(user_id);


-- ─── SPLIT MEMBERS ────────────────────────────────────────────
create table if not exists public.split_members (
  id           text primary key,
  split_id     text not null references public.splits(id) on delete cascade,
  contact_id   text not null references public.contacts(id) on delete cascade,
  amount       numeric(12, 2) not null,
  percentage   numeric(6, 2),
  paid         boolean default false
);

create index if not exists idx_split_members_split_id on public.split_members(split_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.contacts       enable row level security;
alter table public.transactions   enable row level security;
alter table public.splits         enable row level security;
alter table public.split_members  enable row level security;


-- ─── Contacts RLS ─────────────────────────────────────────────
create policy "contacts: user can select own"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "contacts: user can insert own"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "contacts: user can update own"
  on public.contacts for update
  using (auth.uid() = user_id);

create policy "contacts: user can delete own"
  on public.contacts for delete
  using (auth.uid() = user_id);


-- ─── Transactions RLS ─────────────────────────────────────────
create policy "transactions: user can select own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions: user can insert own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions: user can update own"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "transactions: user can delete own"
  on public.transactions for delete
  using (auth.uid() = user_id);


-- ─── Splits RLS ───────────────────────────────────────────────
create policy "splits: user can select own"
  on public.splits for select
  using (auth.uid() = user_id);

create policy "splits: user can insert own"
  on public.splits for insert
  with check (auth.uid() = user_id);

create policy "splits: user can update own"
  on public.splits for update
  using (auth.uid() = user_id);

create policy "splits: user can delete own"
  on public.splits for delete
  using (auth.uid() = user_id);


-- ─── Split Members RLS (via splits.user_id join) ──────────────
create policy "split_members: user can select own"
  on public.split_members for select
  using (
    exists (
      select 1 from public.splits s
      where s.id = split_id and s.user_id = auth.uid()
    )
  );

create policy "split_members: user can insert own"
  on public.split_members for insert
  with check (
    exists (
      select 1 from public.splits s
      where s.id = split_id and s.user_id = auth.uid()
    )
  );

create policy "split_members: user can update own"
  on public.split_members for update
  using (
    exists (
      select 1 from public.splits s
      where s.id = split_id and s.user_id = auth.uid()
    )
  );

create policy "split_members: user can delete own"
  on public.split_members for delete
  using (
    exists (
      select 1 from public.splits s
      where s.id = split_id and s.user_id = auth.uid()
    )
  );


-- ============================================================
-- SYNC HELPER VIEW (optional — useful for debugging)
-- Shows each user's total contacts + transactions count
-- ============================================================
create or replace view public.user_summary as
  select
    u.id as user_id,
    count(distinct c.id) filter (where c.deleted = false) as contact_count,
    count(distinct t.id) filter (where t.deleted = false) as transaction_count
  from auth.users u
  left join public.contacts c on c.user_id = u.id
  left join public.transactions t on t.user_id = u.id
  group by u.id;
