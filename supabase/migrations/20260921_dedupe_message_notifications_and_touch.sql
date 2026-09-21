create or replace function private.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  sender_name text;
  conversation_title text;
  linked_community_id uuid;
  recipient record;
  preview text;
begin
  update public.conversations
  set updated_at = greatest(
    coalesce(updated_at, new.created_at),
    new.created_at
  )
  where id = new.conversation_id;

  select
    coalesce(nullif(p.full_name, ''), p.username, 'Користувач'),
    c.title,
    c.community_id
  into
    sender_name,
    conversation_title,
    linked_community_id
  from public.conversations c
  left join public.profiles p
    on p.id = new.sender_id
  where c.id = new.conversation_id;

  preview :=
    case new.kind
      when 'image' then '🖼 Фото'
      when 'video' then '🎥 Відео'
      when 'audio' then '🎙 Голосове'
      when 'file' then coalesce(new.file_name, '📎 Файл')
      else left(coalesce(nullif(new.body, ''), 'Нове повідомлення'), 140)
    end;

  for recipient in
    select cm.user_id
    from public.conversation_members cm
    where cm.conversation_id = new.conversation_id
      and cm.user_id <> new.sender_id
  loop
    if private.notification_allowed(recipient.user_id, 'message') then
      insert into public.notifications (
        user_id, actor_id, type, title, body, route,
        payload, read, created_at, group_key
      )
      values (
        recipient.user_id,
        new.sender_id,
        'message',
        case
          when linked_community_id is not null then
            coalesce(conversation_title, 'Спільнота')
          when conversation_title is not null and conversation_title <> '' then
            conversation_title
          else
            coalesce(sender_name, 'Нове повідомлення')
        end,
        preview,
        'chats',
        jsonb_build_object(
          'conversationId', new.conversation_id,
          'chatId', new.conversation_id,
          'communityId', linked_community_id,
          'senderId', new.sender_id,
          'personId', new.sender_id,
          'messageId', new.id
        ),
        false,
        new.created_at,
        'message:' || new.id::text
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists notify_new_message on public.messages;
drop trigger if exists messages_touch_conversation on public.messages;

drop trigger if exists handle_new_message on public.messages;
create trigger handle_new_message
after insert on public.messages
for each row execute function private.handle_new_message();

revoke all on function private.handle_new_message()
from public, anon, authenticated;

grant execute on function private.handle_new_message()
to postgres, service_role;
