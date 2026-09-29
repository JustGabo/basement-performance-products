# Supabase setup

## 1. Environment variables

Copy `.env.example` to `.env.local` and obtain these values from **Supabase Dashboard → Connect**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

- Use the base project URL without `/rest/v1`.
- The URL and publishable key are safe for browser code because Row Level Security restricts access.
- The secret key bypasses RLS. Keep it server-only and add it directly to the deployment platform's encrypted environment variables.
- Do not use the legacy `anon` or `service_role` JWT keys for a new project.

## 2. Database

Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it once. It creates commerce tables, indexes, triggers, storage buckets, grants, and RLS policies.

After the owner has created an account, promote that account from the SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = '<AUTH_USER_UUID>';
```

## 3. Authentication

In **Authentication → Providers → Email**, keep email/password sign-up enabled and turn **Confirm Email** off. New users will be considered confirmed and Supabase will return an authenticated session immediately after sign-up.

Because this project does not use email confirmation, no `/auth/confirm` redirect URL or confirmation email template is required.

## 4. Current cart behavior

Guest cart state is persisted in the browser through `CartProvider`. The database includes `carts` and `cart_items` so a future checkout action can merge the local cart into the signed-in user's active cart before payment.

Orders must be created by trusted server code using the secret key after the payment provider confirms the transaction. Customers receive read-only access to their own orders through RLS.

## 5. Admin dashboard

The dashboard is available at `/admin` only to authenticated profiles whose `role` is `admin`. After promoting the owner with the SQL command above, sign out and sign back in so the session is refreshed.

For a project that already ran `schema.sql` before the dashboard was added, run this migration in **SQL Editor**:

```text
supabase/migrations/20260923_admin_dashboard.sql
supabase/migrations/20260924_hero_slides.sql
```

The dashboard uses `SUPABASE_SECRET_KEY` only in Server Components and Server Actions. Never prefix this key with `NEXT_PUBLIC_` or expose it in client-side code.
