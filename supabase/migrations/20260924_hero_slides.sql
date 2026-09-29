-- Admin-managed storefront hero gallery (maximum enforced by the application: 10).
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null unique,
  alt_en text not null default 'Basement Performance Products featured build',
  alt_es text,
  object_position text not null default 'center',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_hero_slides_updated_at on public.hero_slides;
create trigger set_hero_slides_updated_at before update on public.hero_slides for each row execute function public.set_updated_at();

alter table public.hero_slides enable row level security;
revoke all on table public.hero_slides from anon, authenticated;
grant select on public.hero_slides to anon, authenticated;
grant insert, update, delete on public.hero_slides to authenticated;
grant all on public.hero_slides to service_role;

drop policy if exists "public reads active hero slides" on public.hero_slides;
create policy "public reads active hero slides" on public.hero_slides for select to anon, authenticated using (is_active or private.is_admin());
drop policy if exists "admins manage hero slides" on public.hero_slides;
create policy "admins manage hero slides" on public.hero_slides for all to authenticated using (private.is_admin()) with check (private.is_admin());

insert into storage.buckets (id, name, public)
values ('hero-images', 'hero-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public reads commerce images" on storage.objects;
create policy "public reads commerce images" on storage.objects for select to anon, authenticated using (bucket_id in ('product-images', 'build-images', 'hero-images'));
drop policy if exists "admins upload commerce images" on storage.objects;
create policy "admins upload commerce images" on storage.objects for insert to authenticated with check (bucket_id in ('product-images', 'build-images', 'hero-images') and private.is_admin());
drop policy if exists "admins update commerce images" on storage.objects;
create policy "admins update commerce images" on storage.objects for update to authenticated using (bucket_id in ('product-images', 'build-images', 'hero-images') and private.is_admin()) with check (bucket_id in ('product-images', 'build-images', 'hero-images') and private.is_admin());
drop policy if exists "admins delete commerce images" on storage.objects;
create policy "admins delete commerce images" on storage.objects for delete to authenticated using (bucket_id in ('product-images', 'build-images', 'hero-images') and private.is_admin());

insert into public.hero_slides (image_url, alt_en, alt_es, object_position, sort_order)
values
  ('/images/gallery-blue-civic.png', 'Blue modified Civic displayed with its hood open', 'Civic azul modificado exhibido con el capó abierto', 'center', 0),
  ('/images/gallery-white-open.png', 'White modified sedan displayed with its hood open', 'Sedán blanco modificado exhibido con el capó abierto', 'center', 1),
  ('/images/gallery-white-closed.png', 'White lowered sedan in a covered parking structure', 'Sedán blanco rebajado en un estacionamiento cubierto', 'center', 2)
on conflict (image_url) do nothing;
