-- Server-backed events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '',
  category text not null default 'other',
  city text,
  place text,
  starts_at timestamptz not null,
  cover_url text,
  visibility text not null default 'public'
    check (visibility in ('public','community','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_participants (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('interested','going')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id,user_id)
);

create table if not exists public.event_likes (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id,user_id)
);

create index if not exists events_creator_idx on public.events(creator_id);
create index if not exists events_community_idx on public.events(community_id);
create index if not exists events_starts_at_idx on public.events(starts_at);
create index if not exists event_participants_user_idx on public.event_participants(user_id);
create index if not exists event_likes_user_idx on public.event_likes(user_id);

alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.event_likes enable row level security;

create or replace function private.can_view_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and (
        e.visibility = 'public'
        or e.creator_id = auth.uid()
        or (
          e.community_id is not null
          and exists (
            select 1
            from public.community_members cm
            where cm.community_id = e.community_id
              and cm.user_id = auth.uid()
          )
        )
      )
  );
$$;

revoke all on function private.can_view_event(uuid) from public, anon, authenticated;
grant execute on function private.can_view_event(uuid) to postgres, service_role;

drop policy if exists events_select on public.events;
create policy events_select on public.events for select to authenticated
using (private.can_view_event(id));

drop policy if exists event_participants_select on public.event_participants;
create policy event_participants_select on public.event_participants for select to authenticated
using (private.can_view_event(event_id));

drop policy if exists event_likes_select on public.event_likes;
create policy event_likes_select on public.event_likes for select to authenticated
using (private.can_view_event(event_id));

create or replace function public.create_event(
  event_title text,
  event_description text,
  event_category text,
  event_city text,
  event_place text,
  event_starts_at timestamptz,
  event_visibility text default 'public',
  target_community_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  new_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;
  if nullif(trim(event_title),'') is null then raise exception 'Event title is required'; end if;
  if event_starts_at is null then raise exception 'Event start time is required'; end if;
  if event_visibility not in ('public','community','private') then raise exception 'Invalid event visibility'; end if;

  if target_community_id is not null and not exists (
    select 1 from public.community_members cm
    where cm.community_id = target_community_id
      and cm.user_id = caller_id
      and cm.role in ('owner','admin','moderator')
  ) then
    raise exception 'Community event requires moderation rights';
  end if;

  insert into public.events (
    creator_id, community_id, title, description, category,
    city, place, starts_at, visibility
  )
  values (
    caller_id, target_community_id, left(trim(event_title),120),
    coalesce(event_description,''), coalesce(nullif(trim(event_category),''),'other'),
    nullif(trim(event_city),''), nullif(trim(event_place),''),
    event_starts_at, event_visibility
  )
  returning id into new_id;

  insert into public.event_participants(event_id,user_id,status)
  values (new_id,caller_id,'going')
  on conflict (event_id,user_id) do update
    set status='going', updated_at=now();

  return new_id;
end;
$$;

create or replace function public.set_event_participation(
  target_event_id uuid,
  participation_status text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not private.can_view_event(target_event_id) then raise exception 'Event not found'; end if;

  if participation_status is null or participation_status = '' then
    delete from public.event_participants
    where event_id = target_event_id and user_id = auth.uid();
    return;
  end if;

  if participation_status not in ('interested','going') then
    raise exception 'Invalid participation status';
  end if;

  insert into public.event_participants(event_id,user_id,status)
  values (target_event_id,auth.uid(),participation_status)
  on conflict (event_id,user_id) do update
    set status=excluded.status, updated_at=now();
end;
$$;

create or replace function public.toggle_event_like(target_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
declare
  removed boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not private.can_view_event(target_event_id) then raise exception 'Event not found'; end if;

  delete from public.event_likes
  where event_id=target_event_id and user_id=auth.uid();
  get diagnostics removed = row_count;

  if removed then return false; end if;

  insert into public.event_likes(event_id,user_id)
  values (target_event_id,auth.uid());

  return true;
end;
$$;

create or replace function public.delete_event(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  delete from public.events
  where id=target_event_id and creator_id=auth.uid();

  if not found then
    raise exception 'Event not found or not owned by caller';
  end if;
end;
$$;

create or replace function public.get_events_feed()
returns table (
  id uuid,
  creator_id uuid,
  organizer_name text,
  organizer_avatar text,
  community_id uuid,
  community_name text,
  community_avatar text,
  title text,
  description text,
  category text,
  city text,
  place text,
  starts_at timestamptz,
  cover_url text,
  visibility text,
  going_count bigint,
  interested_count bigint,
  likes_count bigint,
  my_status text,
  liked boolean
)
language sql
stable
security invoker
set search_path = public, private
as $$
  select
    e.id, e.creator_id,
    coalesce(nullif(p.full_name,''), p.username, 'Користувач ЯТУТ'),
    p.avatar_url,
    e.community_id, c.title, c.avatar_url,
    e.title, e.description, e.category, e.city, e.place,
    e.starts_at, e.cover_url, e.visibility,
    (select count(*) from public.event_participants ep where ep.event_id=e.id and ep.status='going'),
    (select count(*) from public.event_participants ep where ep.event_id=e.id and ep.status='interested'),
    (select count(*) from public.event_likes el where el.event_id=e.id),
    (select ep.status from public.event_participants ep where ep.event_id=e.id and ep.user_id=auth.uid()),
    exists(select 1 from public.event_likes el where el.event_id=e.id and el.user_id=auth.uid())
  from public.events e
  join public.profiles p on p.id=e.creator_id
  left join public.communities c on c.id=e.community_id
  where private.can_view_event(e.id)
  order by e.starts_at asc, e.created_at desc;
$$;

revoke all on function public.create_event(text,text,text,text,text,timestamptz,text,uuid) from public, anon;
revoke all on function public.set_event_participation(uuid,text) from public, anon;
revoke all on function public.toggle_event_like(uuid) from public, anon;
revoke all on function public.delete_event(uuid) from public, anon;
revoke all on function public.get_events_feed() from public, anon;

grant execute on function public.create_event(text,text,text,text,text,timestamptz,text,uuid) to authenticated, service_role;
grant execute on function public.set_event_participation(uuid,text) to authenticated, service_role;
grant execute on function public.toggle_event_like(uuid) to authenticated, service_role;
grant execute on function public.delete_event(uuid) to authenticated, service_role;
grant execute on function public.get_events_feed() to authenticated, service_role;
