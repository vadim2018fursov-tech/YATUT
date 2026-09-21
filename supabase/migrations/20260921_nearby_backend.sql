create table if not exists public.nearby_places (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 120),
  category text not null default 'other',
  description text not null default '',
  address text,
  city text not null,
  latitude double precision,
  longitude double precision,
  website_url text,
  image_url text,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  constraint nearby_places_lat_check
    check (latitude is null or latitude between -90 and 90),
  constraint nearby_places_lng_check
    check (longitude is null or longitude between -180 and 180)
);

create index if not exists nearby_places_city_status_idx
  on public.nearby_places(lower(city), moderation_status);

create index if not exists nearby_places_creator_idx
  on public.nearby_places(creator_id, created_at desc);

alter table public.nearby_places enable row level security;

drop policy if exists nearby_places_select on public.nearby_places;
create policy nearby_places_select
on public.nearby_places
for select
to authenticated
using (
  moderation_status = 'approved'
  or creator_id = (select auth.uid())
);

create or replace function private.nearby_distance_km(
  from_lat double precision,
  from_lng double precision,
  to_lat double precision,
  to_lng double precision
)
returns double precision
language sql
immutable
as $$
  select case
    when from_lat is null
      or from_lng is null
      or to_lat is null
      or to_lng is null
      then null
    else
      6371.0 * 2.0 * asin(
        sqrt(
          power(sin(radians((to_lat - from_lat) / 2.0)),2)
          + cos(radians(from_lat))
          * cos(radians(to_lat))
          * power(sin(radians((to_lng - from_lng) / 2.0)),2)
        )
      )
  end;
$$;

revoke all on function private.nearby_distance_km(double precision,double precision,double precision,double precision)
from public, anon, authenticated;
grant execute on function private.nearby_distance_km(double precision,double precision,double precision,double precision)
to postgres, service_role;

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
set search_path = public, private
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

  select nullif(trim(coalesce(search_city, p.city)), '')
    into effective_city
  from public.profiles p
  where p.id = caller_id;

  safe_radius := greatest(1, least(coalesce(radius_km, 10), 50));

  select jsonb_build_object(
    'city', effective_city,
    'radiusKm', safe_radius,
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
              'id', np.id,
              'title', np.title,
              'category', np.category,
              'description', np.description,
              'address', np.address,
              'city', np.city,
              'latitude', np.latitude,
              'longitude', np.longitude,
              'websiteUrl', np.website_url,
              'imageUrl', np.image_url,
              'status', np.moderation_status,
              'distanceKm',
                private.nearby_distance_km(
                  user_lat,user_lng,np.latitude,np.longitude
                ),
              'ownSubmission', np.creator_id = caller_id
            )
            order by
              private.nearby_distance_km(
                user_lat,user_lng,np.latitude,np.longitude
              ) nulls last,
              np.created_at desc
          )
          from public.nearby_places np
          where (
            np.moderation_status = 'approved'
            or np.creator_id = caller_id
          )
          and (
            effective_city is null
            or lower(np.city) = lower(effective_city)
          )
          and (
            user_lat is null
            or user_lng is null
            or np.latitude is null
            or np.longitude is null
            or private.nearby_distance_km(
              user_lat,user_lng,np.latitude,np.longitude
            ) <= safe_radius
          )
        ),
        '[]'::jsonb
      ),
    'events',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', e.id,
              'title', e.title,
              'description', e.description,
              'category', e.category,
              'city', e.city,
              'place', e.place,
              'startsAt', e.starts_at,
              'coverUrl', e.cover_url,
              'communityId', e.community_id,
              'status', e.status
            )
            order by e.starts_at asc
          )
          from public.events e
          where e.status = 'scheduled'
            and e.starts_at >= now()
            and private.can_view_event(e.id)
            and (
              effective_city is null
              or lower(coalesce(e.city,'')) = lower(effective_city)
            )
        ),
        '[]'::jsonb
      ),
    'communities',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'title', c.title,
              'description', c.description,
              'city', c.city,
              'avatarUrl', c.avatar_url,
              'privacy', c.privacy,
              'communityType', c.community_type,
              'memberCount',
                (
                  select count(*)
                  from public.community_members cm
                  where cm.community_id = c.id
                )
            )
            order by c.updated_at desc
          )
          from public.communities c
          where (
            c.privacy = 'public'
            or exists (
              select 1
              from public.community_members cm
              where cm.community_id = c.id
                and cm.user_id = caller_id
            )
          )
          and (
            effective_city is null
            or lower(coalesce(c.city,'')) = lower(effective_city)
          )
        ),
        '[]'::jsonb
      )
  )
  into result;

  return result;
end;
$$;

create or replace function public.submit_nearby_place(
  place_title text,
  place_category text,
  place_description text,
  place_address text,
  place_city text,
  place_latitude double precision default null,
  place_longitude double precision default null,
  place_website_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  new_id uuid;
  is_founder boolean := false;
  resolved_city text;
  initial_status text := 'pending';
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(place_title),'') is null then
    raise exception 'Place title is required';
  end if;

  select
    coalesce(p.founder,false),
    nullif(trim(coalesce(place_city,p.city)), '')
  into
    is_founder,
    resolved_city
  from public.profiles p
  where p.id = caller_id;

  if resolved_city is null then
    raise exception 'City is required';
  end if;

  if place_latitude is not null
     and (place_latitude < -90 or place_latitude > 90)
  then
    raise exception 'Invalid latitude';
  end if;

  if place_longitude is not null
     and (place_longitude < -180 or place_longitude > 180)
  then
    raise exception 'Invalid longitude';
  end if;

  if is_founder then
    initial_status := 'approved';
  end if;

  insert into public.nearby_places(
    creator_id,title,category,description,address,city,
    latitude,longitude,website_url,moderation_status,approved_at
  )
  values (
    caller_id,
    left(trim(place_title),120),
    coalesce(nullif(trim(place_category),''),'other'),
    coalesce(place_description,''),
    nullif(trim(place_address),''),
    resolved_city,
    place_latitude,
    place_longitude,
    nullif(trim(place_website_url),''),
    initial_status,
    case when initial_status='approved' then now() else null end
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.get_nearby_feed(text,double precision,double precision,double precision)
from public, anon;
revoke all on function public.submit_nearby_place(text,text,text,text,text,double precision,double precision,text)
from public, anon;

grant execute on function public.get_nearby_feed(text,double precision,double precision,double precision)
to authenticated, service_role;
grant execute on function public.submit_nearby_place(text,text,text,text,text,double precision,double precision,text)
to authenticated, service_role;
