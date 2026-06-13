-- =============================================================================
-- HomeVault — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: it uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto (enabled by default on Supabase).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table if not exists public.rooms (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  room_id    uuid not null references public.rooms (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  room_id         uuid not null references public.rooms (id) on delete cascade,
  category_id     uuid not null references public.categories (id) on delete cascade,
  name            text not null,
  serial_number   text not null default '',
  estimated_value numeric not null default 0,
  notes           text not null default '',
  photo_path      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists rooms_user_id_idx       on public.rooms (user_id);
create index if not exists categories_user_id_idx  on public.categories (user_id);
create index if not exists categories_room_id_idx  on public.categories (room_id);
create index if not exists items_user_id_idx       on public.items (user_id);
create index if not exists items_room_id_idx       on public.items (room_id);
create index if not exists items_category_id_idx   on public.items (category_id);
-- Lightweight search support over the free-text item fields.
create index if not exists items_name_idx          on public.items (lower(name));
create index if not exists items_serial_idx        on public.items (lower(serial_number));

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security: every user only ever sees / writes their own rows.
-- -----------------------------------------------------------------------------
alter table public.rooms      enable row level security;
alter table public.categories enable row level security;
alter table public.items      enable row level security;

-- rooms
drop policy if exists "rooms_select_own" on public.rooms;
create policy "rooms_select_own" on public.rooms
  for select using (auth.uid() = user_id);
drop policy if exists "rooms_insert_own" on public.rooms;
create policy "rooms_insert_own" on public.rooms
  for insert with check (auth.uid() = user_id);
drop policy if exists "rooms_update_own" on public.rooms;
create policy "rooms_update_own" on public.rooms
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "rooms_delete_own" on public.rooms;
create policy "rooms_delete_own" on public.rooms
  for delete using (auth.uid() = user_id);

-- categories
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- items
drop policy if exists "items_select_own" on public.items;
create policy "items_select_own" on public.items
  for select using (auth.uid() = user_id);
drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own" on public.items
  for insert with check (auth.uid() = user_id);
drop policy if exists "items_update_own" on public.items;
create policy "items_update_own" on public.items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own" on public.items
  for delete using (auth.uid() = user_id);

-- =============================================================================
-- Storage: item photos
-- =============================================================================
-- Create a PRIVATE bucket. Files are read through short-lived signed URLs that
-- the app generates for the logged-in owner only.
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false)
on conflict (id) do nothing;

-- Photos are stored at:  <user_id>/<item_id>/<filename>
-- so the first path segment is the owner's user id. Policies below compare that
-- segment to auth.uid() so users can only touch their own folder.
drop policy if exists "item_photos_select_own" on storage.objects;
create policy "item_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "item_photos_insert_own" on storage.objects;
create policy "item_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "item_photos_update_own" on storage.objects;
create policy "item_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "item_photos_delete_own" on storage.objects;
create policy "item_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
