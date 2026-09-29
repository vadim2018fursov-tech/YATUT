alter table public.messages
  add column if not exists client_message_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'messages_sender_client_message_key'
      and conrelid = 'public.messages'::regclass
  ) then
    alter table public.messages
      add constraint messages_sender_client_message_key
      unique (sender_id, client_message_id);
  end if;
end
$$;
