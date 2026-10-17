-- Read receipts + activity timestamps for quote unread indicators

alter table public.quote_conversations
  add column if not exists customer_last_read_at timestamptz,
  add column if not exists staff_last_read_at timestamptz,
  add column if not exists last_customer_message_at timestamptz,
  add column if not exists last_staff_side_message_at timestamptz;

create or replace function public.quote_messages_update_activity()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'customer' then
    update public.quote_conversations
    set last_customer_message_at = new.created_at
    where id = new.conversation_id;
  elsif new.role in ('staff', 'bot') then
    update public.quote_conversations
    set last_staff_side_message_at = new.created_at
    where id = new.conversation_id;
  end if;
  return new;
end;
$$;

drop trigger if exists quote_messages_update_activity on public.quote_messages;
create trigger quote_messages_update_activity
after insert on public.quote_messages
for each row execute function public.quote_messages_update_activity();

update public.quote_conversations c
set
  last_customer_message_at = sub.customer_at,
  last_staff_side_message_at = sub.staff_at
from (
  select
    conversation_id,
    max(created_at) filter (where role = 'customer') as customer_at,
    max(created_at) filter (where role in ('staff', 'bot')) as staff_at
  from public.quote_messages
  group by conversation_id
) sub
where c.id = sub.conversation_id;

notify pgrst, 'reload schema';
