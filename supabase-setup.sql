-- ==============================================================================
-- HUMU KABBA VARIETY VAULT - SUPABASE DATABASE SETUP & POLICIES
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create 'admins' table for authorized business owners
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 3. Security Definer function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

-- 4. Create 'products' table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Phone Cases',
  colors text default '',
  price numeric default null,
  description text default '',
  image_url text default '',
  in_stock boolean default true,
  created_at timestamptz default now()
);

-- 5. Create 'reviews' table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  item text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  created_at timestamptz default now()
);

-- 6. Create 'orders' table (logs when customers initiate an order via WhatsApp)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  customer_name text default 'Anonymous Customer',
  phone text default '',
  order_type text default 'retail',
  notes text default '',
  status text not null default 'new',
  created_at timestamptz default now()
);

-- 7. Create 'push_tokens' table for Firebase Cloud Messaging tokens
create table if not exists public.push_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text primary key,
  updated_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.push_tokens enable row level security;

-- --- ADMINS POLICIES ---
create policy "Admins can view admins list"
  on public.admins for select
  using (public.is_admin());

-- --- PRODUCTS POLICIES ---
create policy "Public can view products"
  on public.products for select
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- --- REVIEWS POLICIES ---
create policy "Public can view reviews"
  on public.reviews for select
  using (true);

create policy "Admins can insert reviews"
  on public.reviews for insert
  with check (public.is_admin());

create policy "Admins can update reviews"
  on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete reviews"
  on public.reviews for delete
  using (public.is_admin());

-- --- ORDERS POLICIES ---
create policy "Anyone can log an order"
  on public.orders for insert
  with check (true);

create policy "Only admins can view orders"
  on public.orders for select
  using (public.is_admin());

create policy "Only admins can update orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Only admins can delete orders"
  on public.orders for delete
  using (public.is_admin());

-- --- PUSH TOKENS POLICIES ---
create policy "Admins can manage push tokens"
  on public.push_tokens for all
  using (public.is_admin())
  with check (public.is_admin());

-- ==============================================================================
-- STORAGE SETUP (Bucket: product-images)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' and
    public.is_admin()
  );

create policy "Admins can update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images' and
    public.is_admin()
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images' and
    public.is_admin()
  );

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Allow public realtime updates on products and reviews so live visitors see new items
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.orders;

-- ==============================================================================
-- HELPER QUERY: ADD OWNER TO ADMINS (Run after creating user in Auth -> Users)
-- ==============================================================================
-- Replace 'owner-email@example.com' with the owner's email address:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'owner-email@example.com'
-- on conflict do nothing;
