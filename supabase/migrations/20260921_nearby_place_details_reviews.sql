create table if not exists public.nearby_place_reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.nearby_places(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(place_id,user_id)
);

create index if not exists nearby_place_reviews_place_idx
  on public.nearby_place_reviews(place_id, updated_at desc);

alter table public.nearby_place_reviews enable row level security;

drop policy if exists nearby_place_reviews_read on public.nearby_place_reviews;
create policy nearby_place_reviews_read
on public.nearby_place_reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.nearby_places np
    where np.id = place_id
      and (
        np.moderation_status='approved'
        or np.creator_id=(select auth.uid())
      )
  )
);

create or replace function private.can_moderate_nearby()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.founder
      from public.profiles p
      where p.id=auth.uid()
    ),
    false
  );
$$;

revoke all on function private.can_moderate_nearby()
from public, anon, authenticated;
grant execute on function private.can_moderate_nearby()
to postgres, service_role;

create or replace function public.set_nearby_place_image(
  target_place_id uuid,
  place_image_url text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.nearby_places np
  set image_url=nullif(trim(place_image_url),''),
      updated_at=now()
  where np.id=target_place_id
    and (
      np.creator_id=auth.uid()
      or private.can_moderate_nearby()
    );

  if not found then
    raise exception 'Place not found or access denied';
  end if;
end;
$$;

create or replace function public.upsert_nearby_place_review(
  target_place_id uuid,
  review_rating integer,
  review_text text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  review_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if review_rating < 1 or review_rating > 5 then
    raise exception 'Rating must be from 1 to 5';
  end if;

  if not exists (
    select 1
    from public.nearby_places np
    where np.id=target_place_id
      and np.moderation_status='approved'
  ) then
    raise exception 'Place is not available for reviews';
  end if;

  insert into public.nearby_place_reviews(
    place_id,user_id,rating,review_text,updated_at
  )
  values(
    target_place_id,
    auth.uid(),
    review_rating,
    left(coalesce(review_text,''),1500),
    now()
  )
  on conflict(place_id,user_id)
  do update set
    rating=excluded.rating,
    review_text=excluded.review_text,
    updated_at=now()
  returning id into review_id;

  return review_id;
end;
$$;

create or replace function public.delete_my_nearby_place_review(
  target_place_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.nearby_place_reviews
  where place_id=target_place_id
    and user_id=auth.uid();
$$;

create or replace function public.get_nearby_place_detail(
  target_place_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  place_row public.nearby_places;
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into place_row
  from public.nearby_places np
  where np.id=target_place_id
    and (
      np.moderation_status='approved'
      or np.creator_id=caller_id
      or private.can_moderate_nearby()
    );

  if place_row.id is null then
    raise exception 'Place not found';
  end if;

  select jsonb_build_object(
    'place',
    jsonb_build_object(
      'id',place_row.id,
      'title',place_row.title,
      'category',place_row.category,
      'description',place_row.description,
      'address',place_row.address,
      'city',place_row.city,
      'latitude',place_row.latitude,
      'longitude',place_row.longitude,
      'websiteUrl',place_row.website_url,
      'imageUrl',place_row.image_url,
      'status',place_row.moderation_status,
      'ownSubmission',place_row.creator_id=caller_id,
      'creatorId',place_row.creator_id,
      'averageRating',
        (
          select round(avg(r.rating)::numeric,1)
          from public.nearby_place_reviews r
          where r.place_id=place_row.id
        ),
      'reviewCount',
        (
          select count(*)
          from public.nearby_place_reviews r
          where r.place_id=place_row.id
        )
    ),
    'reviews',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id',r.id,
            'userId',r.user_id,
            'name',coalesce(nullif(p.full_name,''),p.username,'Користувач'),
            'username',p.username,
            'avatarUrl',p.avatar_url,
            'rating',r.rating,
            'text',r.review_text,
            'createdAt',r.created_at,
            'updatedAt',r.updated_at,
            'own',r.user_id=caller_id
          )
          order by r.updated_at desc
        )
        from public.nearby_place_reviews r
        join public.profiles p on p.id=r.user_id
        where r.place_id=place_row.id
      ),
      '[]'::jsonb
    ),
    'myReview',
      (
        select jsonb_build_object(
          'id',r.id,
          'rating',r.rating,
          'text',r.review_text
        )
        from public.nearby_place_reviews r
        where r.place_id=place_row.id
          and r.user_id=caller_id
      ),
    'canModerate',private.can_moderate_nearby()
  )
  into result;

  return result;
end;
$$;

create or replace function public.get_nearby_moderation_queue()
returns jsonb
language sql
stable
security definer
set search_path = public, private
as $$
  select case
    when not private.can_moderate_nearby()
      then '[]'::jsonb
    else coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id',np.id,
            'title',np.title,
            'category',np.category,
            'description',np.description,
            'address',np.address,
            'city',np.city,
            'imageUrl',np.image_url,
            'creatorId',np.creator_id,
            'creatorName',coalesce(nullif(p.full_name,''),p.username,'Користувач'),
            'createdAt',np.created_at
          )
          order by np.created_at asc
        )
        from public.nearby_places np
        join public.profiles p on p.id=np.creator_id
        where np.moderation_status='pending'
      ),
      '[]'::jsonb
    )
  end;
$$;

create or replace function public.moderate_nearby_place(
  target_place_id uuid,
  decision text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  place_row public.nearby_places;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_moderate_nearby() then
    raise exception 'Moderation access denied';
  end if;

  if decision not in ('approved','rejected') then
    raise exception 'Invalid moderation decision';
  end if;

  select *
  into place_row
  from public.nearby_places
  where id=target_place_id;

  if place_row.id is null then
    raise exception 'Place not found';
  end if;

  update public.nearby_places
  set moderation_status=decision,
      approved_at=case when decision='approved' then now() else null end,
      updated_at=now()
  where id=target_place_id;

  insert into public.notifications(
    user_id,actor_id,type,title,body,route,payload,read,group_key
  )
  values(
    place_row.creator_id,
    auth.uid(),
    case when decision='approved' then 'nearby_place_approved' else 'nearby_place_rejected' end,
    case when decision='approved' then 'Місце опубліковано' else 'Місце не пройшло модерацію' end,
    case
      when decision='approved'
        then 'Місце «'||place_row.title||'» тепер доступне у «Поруч».'
      else 'Місце «'||place_row.title||'» відхилено модератором.'
    end,
    'nearby',
    jsonb_build_object('placeId',target_place_id),
    false,
    'nearby-moderation:'||target_place_id::text||':'||decision
  );
end;
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
    'canModerate', private.can_moderate_nearby(),
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
              'distanceKm',
                private.nearby_distance_km(
                  user_lat,user_lng,np.latitude,np.longitude
                ),
              'averageRating',
                (
                  select round(avg(r.rating)::numeric,1)
                  from public.nearby_place_reviews r
                  where r.place_id=np.id
                ),
              'reviewCount',
                (
                  select count(*)
                  from public.nearby_place_reviews r
                  where r.place_id=np.id
                ),
              'ownSubmission',np.creator_id=caller_id
            )
            order by
              private.nearby_distance_km(
                user_lat,user_lng,np.latitude,np.longitude
              ) nulls last,
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
              'id',e.id,
              'title',e.title,
              'description',e.description,
              'category',e.category,
              'city',e.city,
              'place',e.place,
              'startsAt',e.starts_at,
              'coverUrl',e.cover_url,
              'communityId',e.community_id,
              'status',e.status
            )
            order by e.starts_at asc
          )
          from public.events e
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
              'memberCount',
                (
                  select count(*)
                  from public.community_members cm
                  where cm.community_id=c.id
                )
            )
            order by c.updated_at desc
          )
          from public.communities c
          where (
            c.privacy='public'
            or exists (
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

revoke all on function public.set_nearby_place_image(uuid,text) from public,anon;
revoke all on function public.upsert_nearby_place_review(uuid,integer,text) from public,anon;
revoke all on function public.delete_my_nearby_place_review(uuid) from public,anon;
revoke all on function public.get_nearby_place_detail(uuid) from public,anon;
revoke all on function public.get_nearby_moderation_queue() from public,anon;
revoke all on function public.moderate_nearby_place(uuid,text) from public,anon;
revoke all on function public.get_nearby_feed(text,double precision,double precision,double precision)
from public,anon;

grant execute on function public.set_nearby_place_image(uuid,text) to authenticated,service_role;
grant execute on function public.upsert_nearby_place_review(uuid,integer,text) to authenticated,service_role;
grant execute on function public.delete_my_nearby_place_review(uuid) to authenticated,service_role;
grant execute on function public.get_nearby_place_detail(uuid) to authenticated,service_role;
grant execute on function public.get_nearby_moderation_queue() to authenticated,service_role;
grant execute on function public.moderate_nearby_place(uuid,text) to authenticated,service_role;
grant execute on function public.get_nearby_feed(text,double precision,double precision,double precision)
to authenticated,service_role;

grant select on public.nearby_place_reviews to authenticated;

alter publication supabase_realtime add table public.nearby_place_reviews;
