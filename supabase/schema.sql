-- Basement Performance Products - initial commerce schema
-- Run this file in Supabase Dashboard > SQL Editor on a new project.
-- Monetary values are stored in integer cents. Never store card data here.

create extension if not exists pgcrypto;

do $$ begin
  create type public.profile_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cart_status as enum ('active', 'converted', 'abandoned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'partially_refunded', 'refunded');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  marketing_opt_in boolean not null default false,
  role public.profile_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_es text not null,
  description_en text,
  description_es text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name_en text not null,
  name_es text not null,
  description_en text,
  description_es text,
  short_description_en text,
  short_description_es text,
  price_cents bigint not null check (price_cents >= 0),
  compare_at_price_cents bigint check (compare_at_price_cents is null or compare_at_price_cents >= price_cents),
  currency char(3) not null default 'USD',
  inventory_quantity integer not null default 0 check (inventory_quantity >= 0),
  track_inventory boolean not null default true,
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  primary_image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_en text,
  alt_es text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.builds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  vehicle_brand text not null,
  vehicle_model text,
  modification_en text not null,
  modification_es text not null,
  description_en text,
  description_es text,
  cover_image_url text not null,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.build_images (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.builds(id) on delete cascade,
  image_url text not null,
  alt_en text,
  alt_es text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient_name text not null,
  company text,
  line_1 text not null,
  line_2 text,
  city text not null,
  state_region text,
  postal_code text,
  country_code char(2) not null,
  phone text,
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_token uuid,
  status public.cart_status not null default 'active',
  currency char(3) not null default 'USD',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_owner_check check (user_id is not null or guest_token is not null)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create sequence if not exists public.order_number_seq start 1001;

create or replace function public.generate_order_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'BPP-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  user_id uuid not null references auth.users(id) on delete restrict,
  email text not null,
  phone text,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  currency char(3) not null default 'USD',
  subtotal_cents bigint not null check (subtotal_cents >= 0),
  shipping_cents bigint not null default 0 check (shipping_cents >= 0),
  tax_cents bigint not null default 0 check (tax_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  total_cents bigint not null check (total_cents >= 0),
  shipping_address jsonb not null,
  billing_address jsonb not null,
  customer_note text,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text not null,
  product_name text not null,
  product_description text,
  image_url text,
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents bigint not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_order_id text,
  provider_capture_id text,
  status public.payment_status not null default 'pending',
  amount_cents bigint not null check (amount_cents >= 0),
  currency char(3) not null default 'USD',
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'en' check (locale in ('en', 'es')),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create unique index if not exists one_active_cart_per_user on public.carts(user_id) where user_id is not null and status = 'active';
create unique index if not exists one_active_cart_per_guest on public.carts(guest_token) where guest_token is not null and status = 'active';
create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists product_categories_category_id_idx on public.product_categories(category_id);
create index if not exists build_images_build_id_idx on public.build_images(build_id);
create index if not exists addresses_user_id_idx on public.addresses(user_id);
create index if not exists carts_user_id_idx on public.carts(user_id);
create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists order_status_history_order_id_idx on public.order_status_history(order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','categories','products','builds','addresses','carts','cart_items','orders','payments']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, marketing_opt_in)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_categories enable row level security;
alter table public.builds enable row level security;
alter table public.build_images enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.order_status_history enable row level security;
alter table public.favorites enable row level security;
alter table public.newsletter_subscribers enable row level security;

revoke all on table public.profiles, public.categories, public.products, public.product_images, public.product_categories,
  public.builds, public.build_images, public.addresses, public.carts, public.cart_items, public.orders, public.order_items,
  public.payments, public.order_status_history, public.favorites, public.newsletter_subscribers from anon, authenticated;

grant select on public.categories, public.products, public.product_images, public.product_categories, public.builds, public.build_images to anon, authenticated;
grant select on public.profiles, public.addresses, public.carts, public.cart_items, public.orders, public.order_items, public.payments, public.order_status_history, public.favorites to authenticated;
grant insert on public.addresses, public.carts, public.cart_items, public.favorites to authenticated;
grant update on public.addresses, public.carts, public.cart_items to authenticated;
grant delete on public.addresses, public.carts, public.cart_items, public.favorites to authenticated;
grant update (first_name, last_name, phone, marketing_opt_in) on public.profiles to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images, public.product_categories, public.builds, public.build_images to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

drop policy if exists "customers read own profile" on public.profiles;
create policy "customers read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id or private.is_admin());
drop policy if exists "customers update own profile" on public.profiles;
create policy "customers update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "public reads active categories" on public.categories;
create policy "public reads active categories" on public.categories for select to anon, authenticated using (is_active or private.is_admin());
drop policy if exists "admins insert categories" on public.categories;
create policy "admins insert categories" on public.categories for insert to authenticated with check (private.is_admin());
drop policy if exists "admins update categories" on public.categories;
create policy "admins update categories" on public.categories for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins delete categories" on public.categories;
create policy "admins delete categories" on public.categories for delete to authenticated using (private.is_admin());

drop policy if exists "public reads active products" on public.products;
create policy "public reads active products" on public.products for select to anon, authenticated using (status = 'active' or private.is_admin());
drop policy if exists "admins insert products" on public.products;
create policy "admins insert products" on public.products for insert to authenticated with check (private.is_admin());
drop policy if exists "admins update products" on public.products;
create policy "admins update products" on public.products for update to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admins delete products" on public.products;
create policy "admins delete products" on public.products for delete to authenticated using (private.is_admin());

drop policy if exists "public reads product images" on public.product_images;
create policy "public reads product images" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'active' or private.is_admin())));
drop policy if exists "admins manage product images" on public.product_images;
create policy "admins manage product images" on public.product_images for all to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "public reads product categories" on public.product_categories;
create policy "public reads product categories" on public.product_categories for select to anon, authenticated using (true);
drop policy if exists "admins manage product categories" on public.product_categories;
create policy "admins manage product categories" on public.product_categories for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "public reads published builds" on public.builds;
create policy "public reads published builds" on public.builds for select to anon, authenticated using (is_published or private.is_admin());
drop policy if exists "admins manage builds" on public.builds;
create policy "admins manage builds" on public.builds for all to authenticated using (private.is_admin()) with check (private.is_admin());
drop policy if exists "public reads build images" on public.build_images;
create policy "public reads build images" on public.build_images for select to anon, authenticated using (exists (select 1 from public.builds b where b.id = build_id and (b.is_published or private.is_admin())));
drop policy if exists "admins manage build images" on public.build_images;
create policy "admins manage build images" on public.build_images for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "customers read own addresses" on public.addresses;
create policy "customers read own addresses" on public.addresses for select to authenticated using ((select auth.uid()) = user_id or private.is_admin());
drop policy if exists "customers insert own addresses" on public.addresses;
create policy "customers insert own addresses" on public.addresses for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "customers update own addresses" on public.addresses;
create policy "customers update own addresses" on public.addresses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "customers delete own addresses" on public.addresses;
create policy "customers delete own addresses" on public.addresses for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "customers read own carts" on public.carts;
create policy "customers read own carts" on public.carts for select to authenticated using ((select auth.uid()) = user_id or private.is_admin());
drop policy if exists "customers insert own carts" on public.carts;
create policy "customers insert own carts" on public.carts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "customers update own carts" on public.carts;
create policy "customers update own carts" on public.carts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "customers delete own carts" on public.carts;
create policy "customers delete own carts" on public.carts for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "customers read own cart items" on public.cart_items;
create policy "customers read own cart items" on public.cart_items for select to authenticated using (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = (select auth.uid()) or private.is_admin())));
drop policy if exists "customers insert own cart items" on public.cart_items;
create policy "customers insert own cart items" on public.cart_items for insert to authenticated with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));
drop policy if exists "customers update own cart items" on public.cart_items;
create policy "customers update own cart items" on public.cart_items for update to authenticated using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid()))) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));
drop policy if exists "customers delete own cart items" on public.cart_items;
create policy "customers delete own cart items" on public.cart_items for delete to authenticated using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));

drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders" on public.orders for select to authenticated using ((select auth.uid()) = user_id or private.is_admin());
drop policy if exists "customers read own order items" on public.order_items;
create policy "customers read own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or private.is_admin())));
drop policy if exists "customers read own payments" on public.payments;
create policy "customers read own payments" on public.payments for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or private.is_admin())));
drop policy if exists "customers read own order history" on public.order_status_history;
create policy "customers read own order history" on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or private.is_admin())));

drop policy if exists "customers read own favorites" on public.favorites;
create policy "customers read own favorites" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "customers insert own favorites" on public.favorites;
create policy "customers insert own favorites" on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "customers delete own favorites" on public.favorites;
create policy "customers delete own favorites" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "anyone subscribes to newsletter" on public.newsletter_subscribers;
create policy "anyone subscribes to newsletter" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true), ('build-images', 'build-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public reads commerce images" on storage.objects;
create policy "public reads commerce images" on storage.objects for select to anon, authenticated using (bucket_id in ('product-images', 'build-images'));
drop policy if exists "admins upload commerce images" on storage.objects;
create policy "admins upload commerce images" on storage.objects for insert to authenticated with check (bucket_id in ('product-images', 'build-images') and private.is_admin());
drop policy if exists "admins update commerce images" on storage.objects;
create policy "admins update commerce images" on storage.objects for update to authenticated using (bucket_id in ('product-images', 'build-images') and private.is_admin()) with check (bucket_id in ('product-images', 'build-images') and private.is_admin());
drop policy if exists "admins delete commerce images" on storage.objects;
create policy "admins delete commerce images" on storage.objects for delete to authenticated using (bucket_id in ('product-images', 'build-images') and private.is_admin());

-- After creating the first owner account, promote it once from the SQL Editor:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
