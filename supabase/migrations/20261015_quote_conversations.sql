-- International shipping quote conversations (async chat + Shopify draft checkout)

do $$ begin
  create type public.quote_conversation_status as enum (
    'collecting',
    'reviewing',
    'quoted',
    'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.quote_message_role as enum ('bot', 'customer', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.quote_message_type as enum ('text', 'offer', 'system');
exception when duplicate_object then null; end $$;

create table if not exists public.quote_conversations (
  id uuid primary key default gen_random_uuid(),
  access_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  product_slug text not null,
  product_name text not null,
  product_part text,
  merchandise_id text,
  variant_sku text,
  unit_price_cents bigint,
  currency char(3) not null default 'USD',
  customer_email text not null,
  customer_name text not null,
  locale text not null default 'en',
  status public.quote_conversation_status not null default 'collecting',
  country text,
  city text,
  region text,
  postal_code text,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 99),
  phone text,
  notes text,
  shopify_draft_order_id text,
  invoice_url text,
  offer_shipping_cents bigint check (offer_shipping_cents is null or offer_shipping_cents >= 0),
  offer_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_conversations_status_created_idx
  on public.quote_conversations (status, created_at desc);

create index if not exists quote_conversations_email_idx
  on public.quote_conversations (customer_email);

create table if not exists public.quote_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.quote_conversations(id) on delete cascade,
  role public.quote_message_role not null,
  message_type public.quote_message_type not null default 'text',
  body text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quote_messages_conversation_created_idx
  on public.quote_messages (conversation_id, created_at asc);

alter table public.quote_conversations enable row level security;
alter table public.quote_messages enable row level security;

create or replace function public.touch_quote_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.quote_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists quote_messages_touch_conversation on public.quote_messages;
create trigger quote_messages_touch_conversation
after insert on public.quote_messages
for each row execute function public.touch_quote_conversation_updated_at();

grant all on public.quote_conversations to service_role;
grant all on public.quote_messages to service_role;
notify pgrst, 'reload schema';
