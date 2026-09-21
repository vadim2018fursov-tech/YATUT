create or replace function public.create_group_conversation(
  group_title text,
  member_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  conversation_id uuid;
  clean_title text := nullif(trim(group_title), '');
  clean_members uuid[];
  member_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if clean_title is null then
    raise exception 'Group title is required';
  end if;

  select coalesce(array_agg(distinct value), '{}'::uuid[])
    into clean_members
  from unnest(coalesce(member_ids, '{}'::uuid[])) as value
  where value is not null
    and value <> caller_id;

  if cardinality(clean_members) < 2 then
    raise exception 'Select at least two friends';
  end if;

  if cardinality(clean_members) > 49 then
    raise exception 'Group is too large';
  end if;

  foreach member_id in array clean_members
  loop
    if not exists (
      select 1
      from public.profiles p
      where p.id = member_id
    ) then
      raise exception 'Group member not found';
    end if;

    if not private.is_friend(caller_id, member_id) then
      raise exception 'Only friends can be added to a group';
    end if;
  end loop;

  insert into public.conversations (
    type,
    title,
    created_by,
    updated_at
  )
  values (
    'group',
    left(clean_title, 120),
    caller_id,
    now()
  )
  returning id into conversation_id;

  insert into public.conversation_members (
    conversation_id,
    user_id,
    role,
    last_read_at
  )
  values (
    conversation_id,
    caller_id,
    'owner',
    now()
  );

  insert into public.conversation_members (
    conversation_id,
    user_id,
    role
  )
  select
    conversation_id,
    value,
    'member'
  from unnest(clean_members) as value
  on conflict do nothing;

  return conversation_id;
end;
$$;

revoke all on function public.create_group_conversation(text, uuid[])
from public, anon;

grant execute on function public.create_group_conversation(text, uuid[])
to authenticated, service_role;
