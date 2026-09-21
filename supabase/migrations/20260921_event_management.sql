alter table public.events
  add column if not exists status text not null default 'scheduled'
    check (status in ('scheduled','cancelled'));

alter table public.events
  add column if not exists cancelled_at timestamptz;

create index if not exists events_status_starts_idx
  on public.events(status, starts_at);

create or replace function public.update_event(
  target_event_id uuid,
  event_title text,
  event_description text,
  event_category text,
  event_city text,
  event_place text,
  event_starts_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  old_row public.events;
  clean_title text;
  clean_description text;
  changed_schedule boolean;
  changed_location boolean;
  changed_title boolean;
  notice_body text;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;

  select * into old_row
  from public.events
  where id = target_event_id
  for update;

  if old_row.id is null then raise exception 'Event not found'; end if;
  if old_row.creator_id <> caller_id then raise exception 'Only the event owner can edit it'; end if;
  if old_row.status = 'cancelled' then raise exception 'Cancelled event cannot be edited'; end if;

  clean_title := left(trim(coalesce(event_title,'')),120);
  clean_description := coalesce(event_description,'');

  if clean_title = '' then raise exception 'Event title is required'; end if;
  if event_starts_at is null then raise exception 'Event start time is required'; end if;

  changed_schedule := old_row.starts_at is distinct from event_starts_at;
  changed_location :=
    old_row.city is distinct from nullif(trim(event_city),'')
    or old_row.place is distinct from nullif(trim(event_place),'');
  changed_title := old_row.title is distinct from clean_title;

  update public.events
  set title = clean_title,
      description = clean_description,
      category = coalesce(nullif(trim(event_category),''),'other'),
      city = nullif(trim(event_city),''),
      place = nullif(trim(event_place),''),
      starts_at = event_starts_at,
      updated_at = now()
  where id = target_event_id;

  update public.posts
  set text =
        '📅 ' || clean_title ||
        case
          when nullif(trim(clean_description),'') is not null
            then E'\n\n' || clean_description
          else ''
        end,
      location_text = coalesce(
        nullif(trim(event_place),''),
        nullif(trim(event_city),'')
      ),
      updated_at = now()
  where event_id = target_event_id
    and author_id = caller_id;

  update public.conversations
  set title = left('Подія · ' || clean_title,120),
      updated_at = now()
  where event_id = target_event_id;

  if changed_schedule or changed_location or changed_title then
    notice_body :=
      case
        when changed_schedule and changed_location
          then 'Організатор змінив час і місце події «' || clean_title || '»'
        when changed_schedule
          then 'Організатор змінив дату або час події «' || clean_title || '»'
        when changed_location
          then 'Організатор змінив місце події «' || clean_title || '»'
        else 'Організатор оновив подію «' || clean_title || '»'
      end;

    delete from public.notifications n
    where n.group_key =
      'event-update:' || target_event_id::text || ':' || n.user_id::text;

    insert into public.notifications(
      user_id, actor_id, type, title, body, route, payload, read, group_key
    )
    select
      ep.user_id,
      caller_id,
      'event_updated',
      'Подію оновлено',
      notice_body,
      'events',
      jsonb_build_object(
        'eventId', target_event_id,
        'changedSchedule', changed_schedule,
        'changedLocation', changed_location
      ),
      false,
      'event-update:' || target_event_id::text || ':' || ep.user_id::text
    from public.event_participants ep
    where ep.event_id = target_event_id
      and ep.user_id <> caller_id;
  end if;
end;
$$;

create or replace function public.cancel_event(
  target_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  event_row public.events;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;

  select * into event_row
  from public.events
  where id = target_event_id
  for update;

  if event_row.id is null then raise exception 'Event not found'; end if;
  if event_row.creator_id <> caller_id then raise exception 'Only the event owner can cancel it'; end if;
  if event_row.status = 'cancelled' then return; end if;

  update public.events
  set status = 'cancelled',
      cancelled_at = now(),
      updated_at = now()
  where id = target_event_id;

  delete from public.notifications n
  where n.group_key =
    'event-cancelled:' || target_event_id::text || ':' || n.user_id::text;

  insert into public.notifications(
    user_id, actor_id, type, title, body, route, payload, read, group_key
  )
  select
    recipients.user_id,
    caller_id,
    'event_cancelled',
    'Подію скасовано',
    'Організатор скасував подію «' || event_row.title || '»',
    'events',
    jsonb_build_object(
      'eventId', target_event_id,
      'cancelled', true
    ),
    false,
    'event-cancelled:' || target_event_id::text || ':' || recipients.user_id::text
  from (
    select ep.user_id
    from public.event_participants ep
    where ep.event_id = target_event_id
      and ep.user_id <> caller_id
    union
    select ei.invitee_id
    from public.event_invites ei
    where ei.event_id = target_event_id
      and ei.invitee_id <> caller_id
      and ei.status = 'pending'
  ) recipients;

  update public.event_invites
  set status = 'declined',
      updated_at = now()
  where event_id = target_event_id
    and status = 'pending';
end;
$$;

create or replace function public.get_event_participants(
  target_event_id uuid
)
returns table (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  city text,
  participation_status text,
  joined_at timestamptz,
  is_owner boolean
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
    ep.status,
    ep.created_at,
    e.creator_id = p.id
  from public.events e
  join public.event_participants ep on ep.event_id = e.id
  join public.profiles p on p.id = ep.user_id
  where e.id = target_event_id
    and private.can_view_event(target_event_id)
  order by
    case when e.creator_id = p.id then 0 else 1 end,
    case when ep.status = 'going' then 0 else 1 end,
    ep.created_at asc;
$$;

create or replace function public.remove_event_participant(
  target_event_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  event_row public.events;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;

  select * into event_row
  from public.events
  where id = target_event_id;

  if event_row.id is null then raise exception 'Event not found'; end if;
  if event_row.creator_id <> caller_id then raise exception 'Only the event owner can manage participants'; end if;
  if target_user_id = caller_id then raise exception 'Event owner cannot remove themselves'; end if;

  delete from public.event_participants
  where event_id = target_event_id
    and user_id = target_user_id;

  if found then
    insert into public.notifications(
      user_id, actor_id, type, title, body, route, payload, read, group_key
    )
    values (
      target_user_id,
      caller_id,
      'event_participant_removed',
      'Участь у події змінено',
      'Організатор видалив вас з події «' || event_row.title || '»',
      'events',
      jsonb_build_object(
        'eventId', target_event_id,
        'removed', true
      ),
      false,
      'event-removed:' || target_event_id::text || ':' || target_user_id::text
    );
  end if;
end;
$$;

drop function if exists public.get_events_feed();

create function public.get_events_feed()
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
  status text,
  cancelled_at timestamptz,
  going_count bigint,
  interested_count bigint,
  likes_count bigint,
  my_status text,
  liked boolean
)
language sql
stable
security definer
set search_path = public, private
as $$
  select
    e.id,
    e.creator_id,
    coalesce(nullif(p.full_name,''), p.username, 'Користувач ЯТУТ'),
    p.avatar_url,
    e.community_id,
    c.title,
    c.avatar_url,
    e.title,
    e.description,
    e.category,
    e.city,
    e.place,
    e.starts_at,
    e.cover_url,
    e.visibility,
    e.status,
    e.cancelled_at,
    (select count(*) from public.event_participants ep where ep.event_id=e.id and ep.status='going'),
    (select count(*) from public.event_participants ep where ep.event_id=e.id and ep.status='interested'),
    (select count(*) from public.event_likes el where el.event_id=e.id),
    (select ep.status from public.event_participants ep where ep.event_id=e.id and ep.user_id=auth.uid()),
    exists(select 1 from public.event_likes el where el.event_id=e.id and el.user_id=auth.uid())
  from public.events e
  join public.profiles p on p.id=e.creator_id
  left join public.communities c on c.id=e.community_id
  where private.can_view_event(e.id)
  order by
    case when e.status='scheduled' then 0 else 1 end,
    e.starts_at asc,
    e.created_at desc;
$$;

revoke all on function public.update_event(uuid,text,text,text,text,text,timestamptz)
from public, anon;
revoke all on function public.cancel_event(uuid)
from public, anon;
revoke all on function public.get_event_participants(uuid)
from public, anon;
revoke all on function public.remove_event_participant(uuid,uuid)
from public, anon;
revoke all on function public.get_events_feed()
from public, anon;

grant execute on function public.update_event(uuid,text,text,text,text,text,timestamptz)
to authenticated, service_role;
grant execute on function public.cancel_event(uuid)
to authenticated, service_role;
grant execute on function public.get_event_participants(uuid)
to authenticated, service_role;
grant execute on function public.remove_event_participant(uuid,uuid)
to authenticated, service_role;
grant execute on function public.get_events_feed()
to authenticated, service_role;
