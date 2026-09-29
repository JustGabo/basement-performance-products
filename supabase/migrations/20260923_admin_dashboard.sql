-- Admin dashboard permissions for projects that already ran the initial schema.
-- The application still verifies the signed-in user's admin role server-side
-- before using privileged credentials.

grant update on public.orders to authenticated;
grant insert on public.order_status_history to authenticated;

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders"
on public.orders for update to authenticated
using (private.is_admin())
with check (private.is_admin());

drop policy if exists "admins insert order history" on public.order_status_history;
create policy "admins insert order history"
on public.order_status_history for insert to authenticated
with check (private.is_admin());
