-- ==============================================================================
-- HUMU KABBA VARIETY VAULT — E-COMMERCE SCHEMA UPGRADE
-- Run in Supabase SQL Editor after supabase-setup.sql
-- Safe to re-run (idempotent column/policy additions).
-- ==============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- PRODUCTS ----------
alter table public.products add column if not exists stock_quantity integer default 10;
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists is_sample boolean default false;
alter table public.products add column if not exists gallery jsonb default '[]'::jsonb;
alter table public.products add column if not exists sort_order integer default 0;
alter table public.products add column if not exists updated_at timestamptz default now();

-- ---------- ORDERS ----------
alter table public.orders add column if not exists order_reference text;
alter table public.orders add column if not exists customer_email text default '';
alter table public.orders add column if not exists delivery_instructions text default '';
alter table public.orders add column if not exists items jsonb default '[]'::jsonb;
alter table public.orders add column if not exists quantity integer default 1;
alter table public.orders add column if not exists amount numeric default null;
alter table public.orders add column if not exists currency text default 'SLE';
alter table public.orders add column if not exists payment_method text default 'whatsapp';
alter table public.orders add column if not exists payment_reference text default '';
alter table public.orders add column if not exists payment_status text default 'pending';
alter table public.orders add column if not exists delivery_address text default '';

create unique index if not exists orders_order_reference_uidx
  on public.orders (order_reference)
  where order_reference is not null;

-- Never allow public clients to mark an order as paid
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pending', 'awaiting_manual_payment', 'paid', 'failed', 'refunded'));

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('new', 'processing', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled'));

-- ---------- BANNERS ----------
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text default '',
  image_url text default '',
  link_url text default '',
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.banners enable row level security;

drop policy if exists "Public can view active banners" on public.banners;
create policy "Public can view active banners"
  on public.banners for select
  using (active = true or public.is_admin());

drop policy if exists "Admins manage banners" on public.banners;
create policy "Admins manage banners"
  on public.banners for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- BUSINESS SETTINGS ----------
create table if not exists public.business_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.business_settings enable row level security;

drop policy if exists "Public can view settings" on public.business_settings;
create policy "Public can view settings"
  on public.business_settings for select
  using (true);

drop policy if exists "Admins manage settings" on public.business_settings;
create policy "Admins manage settings"
  on public.business_settings for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.business_settings (key, value)
values (
  'store',
  jsonb_build_object(
    'name', 'Humu Kabba Variety Vault',
    'phone', '+232 77 416008',
    'whatsapp', '23277416008',
    'address', '4B Johnson Land, Aberdeen, Freetown, Sierra Leone (Back of the Field)',
    'payments_note', 'Card and mobile-money gateways are not connected yet. Customers may choose cash on delivery or confirm payment with the shop on WhatsApp.'
  )
)
on conflict (key) do nothing;

-- ---------- ORDER REFERENCE GENERATOR ----------
create or replace function public.generate_order_reference()
returns text
language plpgsql
as $$
declare
  ref text;
  n int := 0;
begin
  loop
    n := n + 1;
    ref := 'HKV-' || to_char(timezone('Africa/Freetown', now()), 'YYYYMMDD') || '-' ||
           upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 4));
    exit when not exists (select 1 from public.orders where order_reference = ref);
    if n > 12 then
      raise exception 'Could not allocate order reference';
    end if;
  end loop;
  return ref;
end;
$$;

-- ---------- PLACE ORDER (server-side validation) ----------
create or replace function public.place_customer_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
  v_email text;
  v_address text;
  v_notes text;
  v_method text;
  v_items jsonb;
  v_amount numeric;
  v_item_count int;
  v_ref text;
  v_id uuid;
  v_recent int;
begin
  if payload is null then
    raise exception 'Missing order payload';
  end if;

  v_name := nullif(btrim(payload->>'customer_name'), '');
  v_phone := regexp_replace(coalesce(payload->>'phone', ''), '[^0-9+]', '', 'g');
  v_email := coalesce(btrim(payload->>'customer_email'), '');
  v_address := nullif(btrim(payload->>'delivery_address'), '');
  v_notes := coalesce(btrim(payload->>'notes'), '');
  v_method := coalesce(nullif(payload->>'payment_method', ''), 'cash_on_delivery');
  v_items := coalesce(payload->'items', '[]'::jsonb);

  if v_name is null or char_length(v_name) < 2 then
    raise exception 'Customer name is required';
  end if;
  if char_length(v_phone) < 8 then
    raise exception 'A valid phone number is required';
  end if;
  if v_address is null or char_length(v_address) < 4 then
    raise exception 'Delivery address is required';
  end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) < 1 then
    raise exception 'At least one product is required';
  end if;
  if v_method not in ('orange_money', 'afrimoney', 'card', 'cash_on_delivery', 'whatsapp', 'cash_delivery') then
    raise exception 'Unsupported payment method';
  end if;

  select count(*) into v_recent
  from public.orders
  where phone = v_phone
    and created_at > now() - interval '1 hour';
  if v_recent >= 8 then
    raise exception 'Too many orders from this number. Please wait or contact the shop on WhatsApp.';
  end if;

  v_item_count := 0;
  v_amount := 0;
  for i in 0 .. jsonb_array_length(v_items) - 1 loop
    v_item_count := v_item_count + greatest(1, coalesce((v_items->i->>'qty')::int, 1));
    v_amount := v_amount + (coalesce((v_items->i->>'price')::numeric, 0) * greatest(1, coalesce((v_items->i->>'qty')::int, 1)));
  end loop;
  v_amount := v_amount + coalesce((payload->>'delivery_fee')::numeric, 0);

  v_ref := public.generate_order_reference();

  insert into public.orders (
    product_name, customer_name, phone, customer_email, order_type,
    amount, currency, payment_method, payment_reference, payment_status,
    delivery_address, delivery_instructions, notes, status, quantity,
    order_reference, items
  ) values (
    (
      select string_agg(coalesce(i->>'name', 'Item') || ' ×' || coalesce(i->>'qty', '1'), ', ')
      from jsonb_array_elements(v_items) i
    ),
    v_name,
    v_phone,
    v_email,
    'online',
    v_amount,
    'SLE',
    v_method,
    v_ref,
    'pending',
    v_address,
    coalesce(payload->>'delivery_instructions', ''),
    v_notes,
    'new',
    v_item_count,
    v_ref,
    v_items
  )
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id,
    'order_reference', v_ref,
    'payment_status', 'pending',
    'status', 'new',
    'amount', v_amount
  );
end;
$$;

revoke all on function public.place_customer_order(jsonb) from public;
grant execute on function public.place_customer_order(jsonb) to anon, authenticated;

-- ---------- CUSTOMER ORDER LOOKUP (limited fields) ----------
create or replace function public.lookup_customer_order(p_ref text, p_phone text)
returns table (
  order_reference text,
  status text,
  payment_status text,
  payment_method text,
  amount numeric,
  product_name text,
  items jsonb,
  created_at timestamptz,
  delivery_address text
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  phone_digits text;
  ref_clean text;
begin
  phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  ref_clean := upper(btrim(coalesce(p_ref, '')));
  if char_length(phone_digits) < 8 or char_length(ref_clean) < 6 then
    return;
  end if;

  return query
  select
    o.order_reference,
    o.status,
    o.payment_status,
    o.payment_method,
    o.amount,
    o.product_name,
    o.items,
    o.created_at,
    o.delivery_address
  from public.orders o
  where (
      o.order_reference = ref_clean
      or o.payment_reference = ref_clean
    )
    and right(regexp_replace(coalesce(o.phone, ''), '[^0-9]', '', 'g'), 8)
        = right(phone_digits, 8)
  order by o.created_at desc
  limit 5;
end;
$$;

revoke all on function public.lookup_customer_order(text, text) from public;
grant execute on function public.lookup_customer_order(text, text) to anon, authenticated;

-- ---------- ADMIN ORDER STATUS ----------
create or replace function public.admin_set_order_status(p_id uuid, p_status text, p_payment_status text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;
  if p_status not in ('new', 'processing', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled') then
    raise exception 'Invalid status';
  end if;
  update public.orders
  set
    status = p_status,
    payment_status = coalesce(p_payment_status, payment_status)
  where id = p_id;
  return found;
end;
$$;

revoke all on function public.admin_set_order_status(uuid, text, text) from public;
grant execute on function public.admin_set_order_status(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
