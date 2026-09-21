alter table public.conversations
  add column if not exists event_id uuid
  references public.events(id)
  on delete cascade;

create unique index if not exists conversations_event_unique
  on public.conversations(event_id)
  where event_id is not null;

create or replace function private.sync_event_participant_to_conversation()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_event_id uuid;
  v_user_id uuid;
  v_status text;
  v_conversation_id uuid;
  v_owner_id uuid;
begin
  v_event_id := coalesce(new.event_id, old.event_id);
  v_user_id := coalesce(new.user_id, old.user_id);
  v_status :=
    case
      when tg_op = 'DELETE' then null
      else new.status
    end;

  select c.id, e.creator_id
    into v_conversation_id, v_owner_id
  from public.events e
  left join public.conversations c on c.event_id = e.id
  where e.id = v_event_id;

  if v_conversation_id is null then
    return coalesce(new, old);
  end if;

  if v_user_id = v_owner_id then
    insert into public.conversation_members(
      conversation_id,user_id,role
    )
    values (
      v_conversation_id,v_user_id,'owner'
    )
    on conflict (conversation_id,user_id)
    do update set role='owner';

    return coalesce(new, old);
  end if;

  if v_status in ('going','interested') then
    insert into public.conversation_members(
      conversation_id,user_id,role
    )
    values (
      v_conversation_id,v_user_id,'member'
    )
    on conflict (conversation_id,user_id)
    do nothing;
  else
    delete from public.conversation_members cm
    where cm.conversation_id = v_conversation_id
      and cm.user_id = v_user_id;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_event_participant_to_conversation
on public.event_participants;

create trigger sync_event_participant_to_conversation
after insert or update or delete
on public.event_participants
for each row execute function private.sync_event_participant_to_conversation();

create or replace function public.get_or_create_event_conversation(
  target_event_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  event_row public.events;
  conversation_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_view_event(target_event_id) then
    raise exception 'Event not found';
  end if;

  select *
    into event_row
  from public.events
  where id = target_event_id;

  select id
    into conversation_id
  from public.conversations
  where event_id = target_event_id
  limit 1;

  if conversation_id is null then
    insert into public.conversations(
      type,title,created_by,event_id,updated_at
    )
    values (
      'group',
      left('Подія · ' || event_row.title,120),
      event_row.creator_id,
      target_event_id,
      now()
    )
    returning id into conversation_id;
  end if;

  insert into public.conversation_members(
    conversation_id,user_id,role,last_read_at
  )
  values (
    conversation_id,event_row.creator_id,'owner',now()
  )
  on conflict (conversation_id,user_id)
  do update set role='owner';

  insert into public.conversation_members(
    conversation_id,user_id,role
  )
  select
    conversation_id,
    ep.user_id,
    case
      when ep.user_id = event_row.creator_id then 'owner'
      else 'member'
    end
  from public.event_participants ep
  where ep.event_id = target_event_id
    and ep.status in ('going','interested')
  on conflict (conversation_id,user_id)
  do nothing;

  insert into public.conversation_members(
    conversation_id,user_id,role
  )
  values (
    conversation_id,
    caller_id,
    case
      when caller_id = event_row.creator_id then 'owner'
      else 'member'
    end
  )
  on conflict (conversation_id,user_id)
  do nothing;

  return conversation_id;
end;
$$;

revoke all on function public.get_or_create_event_conversation(uuid)
from public, anon;

grant execute on function public.get_or_create_event_conversation(uuid)
to authenticated, service_role;

revoke all on function private.sync_event_participant_to_conversation()
from public, anon, authenticated;

grant execute on function private.sync_event_participant_to_conversation()
to postgres, service_role;
