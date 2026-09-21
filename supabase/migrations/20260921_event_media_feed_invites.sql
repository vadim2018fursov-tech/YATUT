alter table public.posts
  add column if not exists event_id uuid
  references public.events(id)
  on delete cascade;

create index if not exists posts_event_idx
  on public.posts(event_id)
  where event_id is not null;

create table if not exists public.event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, invitee_id)
);

create index if not exists event_invites_invitee_idx
  on public.event_invites(invitee_id, status);

create index if not exists event_invites_inviter_idx
  on public.event_invites(inviter_id, created_at desc);

alter table public.event_invites enable row level security;

drop policy if exists event_invites_read on public.event_invites;
create policy event_invites_read
on public.event_invites
for select
to authenticated
using (
  (select auth.uid()) = inviter_id
  or (select auth.uid()) = invitee_id
);

create or replace function public.set_event_cover(
  target_event_id uuid,
  event_cover_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.events
  set cover_url = nullif(trim(event_cover_url), ''),
      updated_at = now()
  where id = target_event_id
    and creator_id = auth.uid();

  if not found then
    raise exception 'Event not found or not owned by caller';
  end if;

  update public.posts
  set media_url = nullif(trim(event_cover_url), ''),
      media_type = case
        when nullif(trim(event_cover_url), '') is null then null
        else 'image'
      end,
      updated_at = now()
  where event_id = target_event_id
    and author_id = auth.uid();
end;
$$;

drop function if exists public.create_event(
  text,text,text,text,text,timestamptz,text,uuid
);

create or replace function public.create_event(
  event_title text,
  event_description text,
  event_category text,
  event_city text,
  event_place text,
  event_starts_at timestamptz,
  event_visibility text default 'public',
  target_community_id uuid default null,
  publish_to_feed boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  new_id uuid;
  clean_title text;
  clean_description text;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  clean_title := left(trim(coalesce(event_title,'')),120);
  clean_description := coalesce(event_description,'');

  if clean_title = '' then
    raise exception 'Event title is required';
  end if;

  if event_starts_at is null then
    raise exception 'Event start time is required';
  end if;

  if event_visibility not in ('public','community','private') then
    raise exception 'Invalid event visibility';
  end if;

  if target_community_id is not null and not exists (
    select 1
    from public.community_members cm
    where cm.community_id = target_community_id
      and cm.user_id = caller_id
      and cm.role in ('owner','admin','moderator')
  ) then
    raise exception 'Community event requires moderation rights';
  end if;

  insert into public.events (
    creator_id,
    community_id,
    title,
    description,
    category,
    city,
    place,
    starts_at,
    visibility
  )
  values (
    caller_id,
    target_community_id,
    clean_title,
    clean_description,
    coalesce(nullif(trim(event_category),''),'other'),
    nullif(trim(event_city),''),
    nullif(trim(event_place),''),
    event_starts_at,
    case
      when target_community_id is not null then 'community'
      else event_visibility
    end
  )
  returning id into new_id;

  insert into public.event_participants(
    event_id,
    user_id,
    status
  )
  values (
    new_id,
    caller_id,
    'going'
  )
  on conflict (event_id,user_id)
  do update set
    status='going',
    updated_at=now();

  if coalesce(publish_to_feed,false)
     and target_community_id is null
     and event_visibility = 'public'
  then
    insert into public.posts (
      author_id,
      text,
      location_text,
      visibility,
      event_id
    )
    values (
      caller_id,
      '📅 ' || clean_title ||
      case
        when nullif(trim(clean_description),'') is not null
          then E'\n\n' || clean_description
        else ''
      end,
      coalesce(
        nullif(trim(event_place),''),
        nullif(trim(event_city),'')
      ),
      'public',
      new_id
    );
  end if;

  return new_id;
end;
$$;

create or replace function public.get_event_invite_candidates(
  target_event_id uuid
)
returns table (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  city text,
  invite_status text
)
language sql
stable
security definer
set search_path = public, private
as $$
  select
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.city,
    ei.status
  from public.friendships f
  join public.profiles p
    on p.id = f.friend_id
  left join public.event_invites ei
    on ei.event_id = target_event_id
   and ei.invitee_id = p.id
  where f.user_id = auth.uid()
    and auth.uid() is not null
    and private.can_view_event(target_event_id)
  order by
    case when ei.status = 'pending' then 0 else 1 end,
    p.full_name,
    p.username;
$$;

create or replace function public.invite_event_friends(
  target_event_id uuid,
  invitee_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  invitee uuid;
  inserted_count integer := 0;
  event_row public.events;
  invite_group_key text;
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

  if caller_id <> event_row.creator_id
     and not exists (
       select 1
       from public.event_participants ep
       where ep.event_id = target_event_id
         and ep.user_id = caller_id
         and ep.status in ('going','interested')
     )
  then
    raise exception 'Join or follow the event before inviting friends';
  end if;

  foreach invitee in array coalesce(invitee_ids, array[]::uuid[])
  loop
    if invitee = caller_id then
      continue;
    end if;

    if not exists (
      select 1
      from public.friendships f
      where f.user_id = caller_id
        and f.friend_id = invitee
    ) then
      continue;
    end if;

    insert into public.event_invites(
      event_id,
      inviter_id,
      invitee_id,
      status,
      updated_at
    )
    values (
      target_event_id,
      caller_id,
      invitee,
      'pending',
      now()
    )
    on conflict (event_id,invitee_id)
    do update set
      inviter_id = excluded.inviter_id,
      status = 'pending',
      updated_at = now();

    invite_group_key :=
      'event-invite:' || target_event_id::text || ':' || invitee::text;

    delete from public.notifications
    where user_id = invitee
      and group_key = invite_group_key;

    insert into public.notifications(
      user_id,
      actor_id,
      type,
      title,
      body,
      route,
      payload,
      read,
      group_key
    )
    values (
      invitee,
      caller_id,
      'event_invite',
      'Запрошення на подію',
      'Вас запросили на подію «' || event_row.title || '»',
      'events',
      jsonb_build_object(
        'eventId',
        target_event_id,
        'inviterId',
        caller_id
      ),
      false,
      invite_group_key
    );

    inserted_count := inserted_count + 1;
  end loop;

  return inserted_count;
end;
$$;

create or replace function private.accept_event_invite_on_participation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('going','interested') then
    update public.event_invites
    set status = 'accepted',
        updated_at = now()
    where event_id = new.event_id
      and invitee_id = new.user_id
      and status = 'pending';
  end if;

  return new;
end;
$$;

drop trigger if exists accept_event_invite_on_participation
on public.event_participants;

create trigger accept_event_invite_on_participation
after insert or update of status
on public.event_participants
for each row execute function private.accept_event_invite_on_participation();

revoke all on function public.set_event_cover(uuid,text)
from public, anon;
revoke all on function public.create_event(text,text,text,text,text,timestamptz,text,uuid,boolean)
from public, anon;
revoke all on function public.get_event_invite_candidates(uuid)
from public, anon;
revoke all on function public.invite_event_friends(uuid,uuid[])
from public, anon;
revoke all on function private.accept_event_invite_on_participation()
from public, anon, authenticated;

grant execute on function public.set_event_cover(uuid,text)
to authenticated, service_role;
grant execute on function public.create_event(text,text,text,text,text,timestamptz,text,uuid,boolean)
to authenticated, service_role;
grant execute on function public.get_event_invite_candidates(uuid)
to authenticated, service_role;
grant execute on function public.invite_event_friends(uuid,uuid[])
to authenticated, service_role;
grant execute on function private.accept_event_invite_on_participation()
to postgres, service_role;

grant select on public.event_invites to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
