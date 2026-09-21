create or replace function public.update_my_nearby_place(
  target_place_id uuid,
  place_title text,
  place_category text,
  place_description text,
  place_address text,
  place_city text,
  place_latitude double precision default null,
  place_longitude double precision default null,
  place_website_url text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  old_row public.nearby_places;
  clean_title text;
  resolved_city text;
  identity_or_location_changed boolean;
  next_status text;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into old_row
  from public.nearby_places
  where id=target_place_id
  for update;

  if old_row.id is null then
    raise exception 'Place not found';
  end if;

  if old_row.creator_id<>caller_id then
    raise exception 'Only the place owner can edit it';
  end if;

  clean_title := left(trim(coalesce(place_title,'')),120);

  if clean_title='' then
    raise exception 'Place title is required';
  end if;

  resolved_city :=
    nullif(trim(coalesce(place_city,old_row.city)),'');

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

  identity_or_location_changed :=
    old_row.title is distinct from clean_title
    or old_row.category is distinct from coalesce(nullif(trim(place_category),''),'other')
    or old_row.address is distinct from nullif(trim(place_address),'')
    or old_row.city is distinct from resolved_city
    or old_row.latitude is distinct from place_latitude
    or old_row.longitude is distinct from place_longitude;

  next_status :=
    case
      when old_row.moderation_status='rejected'
        or identity_or_location_changed
        then 'pending'
      else old_row.moderation_status
    end;

  update public.nearby_places
  set title=clean_title,
      category=coalesce(nullif(trim(place_category),''),'other'),
      description=coalesce(place_description,''),
      address=nullif(trim(place_address),''),
      city=resolved_city,
      latitude=place_latitude,
      longitude=place_longitude,
      website_url=nullif(trim(place_website_url),''),
      moderation_status=next_status,
      approved_at=
        case
          when next_status='approved' then old_row.approved_at
          else null
        end,
      updated_at=now()
  where id=target_place_id;

  return next_status;
end;
$$;

revoke all on function public.update_my_nearby_place(
  uuid,text,text,text,text,text,double precision,double precision,text
) from public,anon;

grant execute on function public.update_my_nearby_place(
  uuid,text,text,text,text,text,double precision,double precision,text
) to authenticated,service_role;
