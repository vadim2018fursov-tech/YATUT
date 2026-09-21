create or replace function public.get_nearby_admin_dashboard(
  status_filter text default null,
  city_filter text default null,
  search_query text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  clean_status text := nullif(trim(coalesce(status_filter,'')),'');
  clean_city text := nullif(trim(coalesce(city_filter,'')),'');
  clean_query text := nullif(trim(coalesce(search_query,'')),'');
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_moderate_nearby() then
    raise exception 'Moderation access denied';
  end if;

  if clean_status is not null
     and clean_status not in ('pending','approved','rejected')
  then
    raise exception 'Invalid status filter';
  end if;

  select jsonb_build_object(
    'stats',
      jsonb_build_object(
        'total',(select count(*) from public.nearby_places),
        'pending',(select count(*) from public.nearby_places where moderation_status='pending'),
        'approved',(select count(*) from public.nearby_places where moderation_status='approved'),
        'rejected',(select count(*) from public.nearby_places where moderation_status='rejected'),
        'cities',(select count(distinct city) from public.nearby_places where nullif(trim(city),'') is not null)
      ),
    'cities',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'city',city,
              'count',count_value
            )
            order by count_value desc, city asc
          )
          from (
            select
              city,
              count(*) as count_value
            from public.nearby_places
            where nullif(trim(city),'') is not null
            group by city
          ) city_stats
        ),
        '[]'::jsonb
      ),
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
              'imageUrl',np.image_url,
              'status',np.moderation_status,
              'creatorId',np.creator_id,
              'creatorName',coalesce(nullif(p.full_name,''),p.username,'Користувач'),
              'creatorUsername',p.username,
              'createdAt',np.created_at,
              'updatedAt',np.updated_at,
              'approvedAt',np.approved_at,
              'reviewCount',(
                select count(*)
                from public.nearby_place_reviews r
                where r.place_id=np.id
              ),
              'averageRating',(
                select round(avg(r.rating)::numeric,1)
                from public.nearby_place_reviews r
                where r.place_id=np.id
              ),
              'linkedEvents',(
                select count(*)
                from public.events e
                where e.nearby_place_id=np.id
              ),
              'lastModeration',(
                select jsonb_build_object(
                  'action',h.action,
                  'note',h.note,
                  'createdAt',h.created_at,
                  'actorName',coalesce(nullif(hp.full_name,''),hp.username,'Система')
                )
                from public.nearby_place_history h
                left join public.profiles hp on hp.id=h.actor_id
                where h.place_snapshot_id=np.id
                  and h.action in ('approved','rejected')
                order by h.created_at desc
                limit 1
              )
            )
            order by
              case np.moderation_status
                when 'pending' then 0
                when 'rejected' then 1
                else 2
              end,
              np.updated_at desc
          )
          from public.nearby_places np
          join public.profiles p on p.id=np.creator_id
          where (
            clean_status is null
            or np.moderation_status=clean_status
          )
          and (
            clean_city is null
            or lower(np.city)=lower(clean_city)
          )
          and (
            clean_query is null
            or np.title ilike '%'||clean_query||'%'
            or np.address ilike '%'||clean_query||'%'
            or np.city ilike '%'||clean_query||'%'
            or np.category ilike '%'||clean_query||'%'
            or p.username ilike '%'||clean_query||'%'
            or p.full_name ilike '%'||clean_query||'%'
          )
        ),
        '[]'::jsonb
      )
  )
  into result;

  return result;
end;
$$;

create or replace function public.bulk_moderate_nearby_places(
  target_place_ids uuid[],
  decision text,
  moderation_note text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  target_id uuid;
  processed integer := 0;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_moderate_nearby() then
    raise exception 'Moderation access denied';
  end if;

  if decision not in ('approved','rejected') then
    raise exception 'Invalid moderation decision';
  end if;

  if target_place_ids is null
     or cardinality(target_place_ids)=0
  then
    return 0;
  end if;

  if cardinality(target_place_ids)>50 then
    raise exception 'Too many places in one batch';
  end if;

  foreach target_id in array target_place_ids
  loop
    if exists (
      select 1
      from public.nearby_places np
      where np.id=target_id
        and np.moderation_status='pending'
    ) then
      perform public.moderate_nearby_place(
        target_id,
        decision,
        moderation_note
      );
      processed := processed + 1;
    end if;
  end loop;

  return processed;
end;
$$;

revoke all on function public.get_nearby_admin_dashboard(text,text,text)
from public,anon;
revoke all on function public.bulk_moderate_nearby_places(uuid[],text,text)
from public,anon;

grant execute on function public.get_nearby_admin_dashboard(text,text,text)
to authenticated,service_role;
grant execute on function public.bulk_moderate_nearby_places(uuid[],text,text)
to authenticated,service_role;
