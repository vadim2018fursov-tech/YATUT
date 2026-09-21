create or replace function public.toggle_event_like(target_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
declare
  removed_count bigint;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_view_event(target_event_id) then
    raise exception 'Event not found';
  end if;

  delete from public.event_likes
  where event_id=target_event_id
    and user_id=auth.uid();

  get diagnostics removed_count = row_count;

  if removed_count > 0 then
    return false;
  end if;

  insert into public.event_likes(event_id,user_id)
  values (target_event_id,auth.uid());

  return true;
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
security definer
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

revoke all on function public.toggle_event_like(uuid) from public, anon;
revoke all on function public.get_events_feed() from public, anon;
grant execute on function public.toggle_event_like(uuid) to authenticated, service_role;
grant execute on function public.get_events_feed() to authenticated, service_role;
