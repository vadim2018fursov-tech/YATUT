alter table public.events
  add column if not exists nearby_place_id uuid
  references public.nearby_places(id)
  on delete set null;

create index if not exists events_nearby_place_idx
  on public.events(nearby_place_id)
  where nearby_place_id is not null;

revoke all on table public.nearby_places from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.nearby_places
  from authenticated;
grant select on table public.nearby_places to authenticated;

create or replace function public.get_event_place_options(
  search_city text default null
)
returns table (
  id uuid,
  title text,
  address text,
  city text,
  latitude double precision,
  longitude double precision,
  image_url text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    np.id,
    np.title,
    np.address,
    np.city,
    np.latitude,
    np.longitude,
    np.image_url
  from public.nearby_places np
  where np.moderation_status='approved'
    and (
      nullif(trim(search_city),'') is null
      or lower(np.city)=lower(trim(search_city))
    )
  order by np.title asc
  limit 100;
$$;

drop function if exists public.create_event(
  text,text,text,text,text,timestamptz,text,uuid,boolean
);

create function public.create_event(
  event_title text,
  event_description text,
  event_category text,
  event_city text,
  event_place text,
  event_starts_at timestamptz,
  event_visibility text default 'public',
  target_community_id uuid default null,
  publish_to_feed boolean default true,
  target_nearby_place_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  new_id uuid;
  clean_title text;
  clean_description text;
  resolved_city text;
  resolved_place text;
  linked_place public.nearby_places;
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
    where cm.community_id=target_community_id
      and cm.user_id=caller_id
      and cm.role in ('owner','admin','moderator')
  ) then
    raise exception 'Community event requires moderation rights';
  end if;

  if target_nearby_place_id is not null then
    select *
      into linked_place
    from public.nearby_places np
    where np.id=target_nearby_place_id
      and np.moderation_status='approved';

    if linked_place.id is null then
      raise exception 'Selected nearby place is not available';
    end if;

    resolved_city := linked_place.city;
    resolved_place := coalesce(
      nullif(trim(linked_place.address),''),
      linked_place.title
    );
  else
    resolved_city := nullif(trim(event_city),'');
    resolved_place := nullif(trim(event_place),'');
  end if;

  insert into public.events (
    creator_id,
    community_id,
    nearby_place_id,
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
    target_nearby_place_id,
    clean_title,
    clean_description,
    coalesce(nullif(trim(event_category),''),'other'),
    resolved_city,
    resolved_place,
    event_starts_at,
    case
      when target_community_id is not null then 'community'
      else event_visibility
    end
  )
  returning id into new_id;

  insert into public.event_participants(
    event_id,user_id,status
  )
  values(
    new_id,caller_id,'going'
  )
  on conflict(event_id,user_id)
  do update set
    status='going',
    updated_at=now();

  if coalesce(publish_to_feed,false)
     and target_community_id is null
     and event_visibility='public'
  then
    insert into public.posts(
      author_id,text,location_text,visibility,event_id
    )
    values(
      caller_id,
      '📅 '||clean_title||
      case
        when nullif(trim(clean_description),'') is not null
          then E'\n\n'||clean_description
        else ''
      end,
      coalesce(resolved_place,resolved_city),
      'public',
      new_id
    );
  end if;

  return new_id;
end;
$$;

drop function if exists public.update_event(
  uuid,text,text,text,text,text,timestamptz
);

create function public.update_event(
  target_event_id uuid,
  event_title text,
  event_description text,
  event_category text,
  event_city text,
  event_place text,
  event_starts_at timestamptz,
  target_nearby_place_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  old_row public.events;
  linked_place public.nearby_places;
  clean_title text;
  clean_description text;
  resolved_city text;
  resolved_place text;
  changed_schedule boolean;
  changed_location boolean;
  changed_title boolean;
  notice_body text;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into old_row
  from public.events
  where id=target_event_id
  for update;

  if old_row.id is null then
    raise exception 'Event not found';
  end if;

  if old_row.creator_id<>caller_id then
    raise exception 'Only the event owner can edit it';
  end if;

  if old_row.status='cancelled' then
    raise exception 'Cancelled event cannot be edited';
  end if;

  clean_title := left(trim(coalesce(event_title,'')),120);
  clean_description := coalesce(event_description,'');

  if clean_title='' then
    raise exception 'Event title is required';
  end if;

  if event_starts_at is null then
    raise exception 'Event start time is required';
  end if;

  if target_nearby_place_id is not null then
    select *
      into linked_place
    from public.nearby_places np
    where np.id=target_nearby_place_id
      and np.moderation_status='approved';

    if linked_place.id is null then
      raise exception 'Selected nearby place is not available';
    end if;

    resolved_city := linked_place.city;
    resolved_place := coalesce(
      nullif(trim(linked_place.address),''),
      linked_place.title
    );
  else
    resolved_city := nullif(trim(event_city),'');
    resolved_place := nullif(trim(event_place),'');
  end if;

  changed_schedule := old_row.starts_at is distinct from event_starts_at;
  changed_location :=
    old_row.city is distinct from resolved_city
    or old_row.place is distinct from resolved_place
    or old_row.nearby_place_id is distinct from target_nearby_place_id;
  changed_title := old_row.title is distinct from clean_title;

  update public.events
  set title=clean_title,
      description=clean_description,
      category=coalesce(nullif(trim(event_category),''),'other'),
      city=resolved_city,
      place=resolved_place,
      nearby_place_id=target_nearby_place_id,
      starts_at=event_starts_at,
      updated_at=now()
  where id=target_event_id;

  update public.posts
  set text=
        '📅 '||clean_title||
        case
          when nullif(trim(clean_description),'') is not null
            then E'\n\n'||clean_description
          else ''
        end,
      location_text=coalesce(resolved_place,resolved_city),
      updated_at=now()
  where event_id=target_event_id
    and author_id=caller_id;

  update public.conversations
  set title=left('Подія · '||clean_title,120),
      updated_at=now()
  where event_id=target_event_id;

  if changed_schedule or changed_location or changed_title then
    notice_body :=
      case
        when changed_schedule and changed_location
          then 'Організатор змінив час і місце події «'||clean_title||'»'
        when changed_schedule
          then 'Організатор змінив дату або час події «'||clean_title||'»'
        when changed_location
          then 'Організатор змінив місце події «'||clean_title||'»'
        else 'Організатор оновив подію «'||clean_title||'»'
      end;

    delete from public.notifications n
    where n.group_key=
      'event-update:'||target_event_id::text||':'||n.user_id::text;

    insert into public.notifications(
      user_id,actor_id,type,title,body,route,payload,read,group_key
    )
    select
      ep.user_id,
      caller_id,
      'event_updated',
      'Подію оновлено',
      notice_body,
      'events',
      jsonb_build_object(
        'eventId',target_event_id,
        'changedSchedule',changed_schedule,
        'changedLocation',changed_location
      ),
      false,
      'event-update:'||target_event_id::text||':'||ep.user_id::text
    from public.event_participants ep
    where ep.event_id=target_event_id
      and ep.user_id<>caller_id;
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
  nearby_place_id uuid,
  event_latitude double precision,
  event_longitude double precision,
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
set search_path = ''
as $$
  select
    e.id,
    e.creator_id,
    coalesce(nullif(p.full_name,''),p.username,'Користувач ЯТУТ'),
    p.avatar_url,
    e.community_id,
    c.title,
    c.avatar_url,
    e.nearby_place_id,
    np.latitude,
    np.longitude,
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
  left join public.nearby_places np
    on np.id=e.nearby_place_id
   and np.moderation_status='approved'
  where private.can_view_event(e.id)
  order by
    case when e.status='scheduled' then 0 else 1 end,
    e.starts_at asc,
    e.created_at desc;
$$;

create or replace function public.get_nearby_feed(
  search_city text default null,
  user_lat double precision default null,
  user_lng double precision default null,
  radius_km double precision default 10
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  effective_city text;
  safe_radius double precision;
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select nullif(trim(coalesce(search_city,p.city)),'')
    into effective_city
  from public.profiles p
  where p.id=caller_id;

  safe_radius := greatest(1,least(coalesce(radius_km,10),50));

  select jsonb_build_object(
    'city',effective_city,
    'radiusKm',safe_radius,
    'canModerate',private.can_moderate_nearby(),
    'locationMode',
      case
        when user_lat is not null and user_lng is not null then 'precise'
        when effective_city is not null then 'city'
        else 'none'
      end,
    'places',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id',np.id,
              'title',np.title,
              'category',np.category,
              'description',np.description,
              'address',np.address,
              'city',np.city,
              'latitude',np.latitude,
              'longitude',np.longitude,
              'websiteUrl',np.website_url,
              'imageUrl',np.image_url,
              'status',np.moderation_status,
              'distanceKm',private.nearby_distance_km(user_lat,user_lng,np.latitude,np.longitude),
              'averageRating',(select round(avg(r.rating)::numeric,1) from public.nearby_place_reviews r where r.place_id=np.id),
              'reviewCount',(select count(*) from public.nearby_place_reviews r where r.place_id=np.id),
              'ownSubmission',np.creator_id=caller_id
            )
            order by private.nearby_distance_km(user_lat,user_lng,np.latitude,np.longitude) nulls last,
                     np.created_at desc
          )
          from public.nearby_places np
          where (
            np.moderation_status='approved'
            or np.creator_id=caller_id
            or (
              private.can_moderate_nearby()
              and np.moderation_status='pending'
            )
          )
          and (
            effective_city is null
            or lower(np.city)=lower(effective_city)
          )
          and (
            user_lat is null
            or user_lng is null
            or np.latitude is null
            or np.longitude is null
            or private.nearby_distance_km(user_lat,user_lng,np.latitude,np.longitude)<=safe_radius
          )
        ),
        '[]'::jsonb
      ),
    'events',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id',e.id,
              'title',e.title,
              'description',e.description,
              'category',e.category,
              'city',e.city,
              'place',e.place,
              'startsAt',e.starts_at,
              'coverUrl',e.cover_url,
              'communityId',e.community_id,
              'status',e.status,
              'nearbyPlaceId',e.nearby_place_id,
              'latitude',np.latitude,
              'longitude',np.longitude
            )
            order by e.starts_at asc
          )
          from public.events e
          left join public.nearby_places np
            on np.id=e.nearby_place_id
           and np.moderation_status='approved'
          where e.status='scheduled'
            and e.starts_at>=now()
            and private.can_view_event(e.id)
            and (
              effective_city is null
              or lower(coalesce(e.city,''))=lower(effective_city)
            )
        ),
        '[]'::jsonb
      ),
    'communities',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id',c.id,
              'title',c.title,
              'description',c.description,
              'city',c.city,
              'avatarUrl',c.avatar_url,
              'privacy',c.privacy,
              'communityType',c.community_type,
              'memberCount',(select count(*) from public.community_members cm where cm.community_id=c.id)
            )
            order by c.updated_at desc
          )
          from public.communities c
          where (
            c.privacy='public'
            or exists(
              select 1
              from public.community_members cm
              where cm.community_id=c.id
                and cm.user_id=caller_id
            )
          )
          and (
            effective_city is null
            or lower(coalesce(c.city,''))=lower(effective_city)
          )
        ),
        '[]'::jsonb
      )
  )
  into result;

  return result;
end;
$$;

revoke all on function public.get_event_place_options(text) from public,anon;
revoke all on function public.create_event(text,text,text,text,text,timestamptz,text,uuid,boolean,uuid) from public,anon;
revoke all on function public.update_event(uuid,text,text,text,text,text,timestamptz,uuid) from public,anon;
revoke all on function public.get_events_feed() from public,anon;
revoke all on function public.get_nearby_feed(text,double precision,double precision,double precision) from public,anon;

grant execute on function public.get_event_place_options(text) to authenticated,service_role;
grant execute on function public.create_event(text,text,text,text,text,timestamptz,text,uuid,boolean,uuid) to authenticated,service_role;
grant execute on function public.update_event(uuid,text,text,text,text,text,timestamptz,uuid) to authenticated,service_role;
grant execute on function public.get_events_feed() to authenticated,service_role;
grant execute on function public.get_nearby_feed(text,double precision,double precision,double precision) to authenticated,service_role;
