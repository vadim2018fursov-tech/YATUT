create or replace function public.get_system_admin_dashboard(
  module_filter text default null,
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
  clean_module text := nullif(trim(coalesce(module_filter,'')),'');
  clean_query text := nullif(trim(coalesce(search_query,'')),'');
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id=caller_id
      and coalesce(p.founder,false)
  ) then
    raise exception 'Admin access denied';
  end if;

  if clean_module is not null
     and clean_module not in (
       'users','reports','communities','events','posts','nearby'
     )
  then
    raise exception 'Invalid admin module';
  end if;

  select jsonb_build_object(
    'stats',jsonb_build_object(
      'users',(select count(*) from public.profiles),
      'reportsOpen',(select count(*) from public.user_reports where status in ('open','reviewing')),
      'communities',(select count(*) from public.communities),
      'events',(select count(*) from public.events),
      'posts',(select count(*) from public.posts),
      'nearbyPending',(select count(*) from public.nearby_places where moderation_status='pending')
    ),
    'users',
      case when clean_module is null or clean_module='users' then
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id',p.id,
              'username',p.username,
              'name',coalesce(nullif(p.full_name,''),p.username,'Користувач'),
              'avatarUrl',p.avatar_url,
              'city',p.city,
              'verified',p.verified,
              'founder',p.founder,
              'createdAt',p.created_at,
              'reportsAgainst',(
                select count(*)
                from public.user_reports ur
                where ur.target_user_id=p.id
                  and ur.status in ('open','reviewing')
              )
            )
            order by p.created_at desc
          )
          from (
            select *
            from public.profiles p
            where clean_query is null
               or p.username ilike '%'||clean_query||'%'
               or p.full_name ilike '%'||clean_query||'%'
               or p.city ilike '%'||clean_query||'%'
            order by p.created_at desc
            limit 100
          ) p
        ),'[]'::jsonb)
      else '[]'::jsonb end,
    'reports',
      case when clean_module is null or clean_module='reports' then
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id',ur.id,
              'status',ur.status,
              'reason',ur.reason,
              'details',ur.details,
              'createdAt',ur.created_at,
              'reporterId',ur.reporter_id,
              'reporterName',coalesce(nullif(rp.full_name,''),rp.username,'Користувач'),
              'targetUserId',ur.target_user_id,
              'targetName',coalesce(nullif(tp.full_name,''),tp.username,'Користувач'),
              'targetUsername',tp.username
            )
            order by
              case ur.status when 'open' then 0 when 'reviewing' then 1 else 2 end,
              ur.created_at desc
          )
          from public.user_reports ur
          join public.profiles rp on rp.id=ur.reporter_id
          join public.profiles tp on tp.id=ur.target_user_id
          where clean_query is null
             or ur.reason ilike '%'||clean_query||'%'
             or ur.details ilike '%'||clean_query||'%'
             or tp.username ilike '%'||clean_query||'%'
             or tp.full_name ilike '%'||clean_query||'%'
        ),'[]'::jsonb)
      else '[]'::jsonb end,
    'communities',
      case when clean_module is null or clean_module='communities' then
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id',c.id,
              'title',c.title,
              'city',c.city,
              'privacy',c.privacy,
              'type',c.community_type,
              'createdAt',c.created_at,
              'ownerId',c.owner_id,
              'ownerName',coalesce(nullif(p.full_name,''),p.username,'Користувач'),
              'members',(select count(*) from public.community_members cm where cm.community_id=c.id)
            )
            order by c.created_at desc
          )
          from public.communities c
          join public.profiles p on p.id=c.owner_id
          where clean_query is null
             or c.title ilike '%'||clean_query||'%'
             or c.city ilike '%'||clean_query||'%'
        ),'[]'::jsonb)
      else '[]'::jsonb end,
    'events',
      case when clean_module is null or clean_module='events' then
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id',e.id,
              'title',e.title,
              'city',e.city,
              'status',e.status,
              'startsAt',e.starts_at,
              'creatorId',e.creator_id,
              'creatorName',coalesce(nullif(p.full_name,''),p.username,'Користувач')
            )
            order by e.created_at desc
          )
          from public.events e
          join public.profiles p on p.id=e.creator_id
          where clean_query is null
             or e.title ilike '%'||clean_query||'%'
             or e.city ilike '%'||clean_query||'%'
        ),'[]'::jsonb)
      else '[]'::jsonb end,
    'posts',
      case when clean_module is null or clean_module='posts' then
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id',po.id,
              'text',left(coalesce(po.text,''),220),
              'mediaUrl',po.media_url,
              'mediaType',po.media_type,
              'createdAt',po.created_at,
              'authorId',po.author_id,
              'authorName',coalesce(nullif(p.full_name,''),p.username,'Користувач')
            )
            order by po.created_at desc
          )
          from public.posts po
          join public.profiles p on p.id=po.author_id
          where clean_query is null
             or po.text ilike '%'||clean_query||'%'
             or p.username ilike '%'||clean_query||'%'
             or p.full_name ilike '%'||clean_query||'%'
        ),'[]'::jsonb)
      else '[]'::jsonb end,
    'nearby',
      case when clean_module is null or clean_module='nearby' then
        coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id',np.id,
              'title',np.title,
              'city',np.city,
              'status',np.moderation_status,
              'creatorId',np.creator_id,
              'creatorName',coalesce(nullif(p.full_name,''),p.username,'Користувач'),
              'updatedAt',np.updated_at
            )
            order by
              case np.moderation_status when 'pending' then 0 when 'rejected' then 1 else 2 end,
              np.updated_at desc
          )
          from public.nearby_places np
          join public.profiles p on p.id=np.creator_id
          where clean_query is null
             or np.title ilike '%'||clean_query||'%'
             or np.city ilike '%'||clean_query||'%'
             or p.username ilike '%'||clean_query||'%'
        ),'[]'::jsonb)
      else '[]'::jsonb end
  )
  into result;

  return result;
end;
$$;

create or replace function public.set_user_report_status(
  target_report_id uuid,
  next_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id=auth.uid()
      and coalesce(p.founder,false)
  ) then
    raise exception 'Admin access denied';
  end if;

  if next_status not in ('open','reviewing','resolved','dismissed') then
    raise exception 'Invalid report status';
  end if;

  update public.user_reports
  set status=next_status
  where id=target_report_id;

  if not found then
    raise exception 'Report not found';
  end if;
end;
$$;

revoke all on function public.get_system_admin_dashboard(text,text) from public,anon;
revoke all on function public.set_user_report_status(uuid,text) from public,anon;
grant execute on function public.get_system_admin_dashboard(text,text) to authenticated,service_role;
grant execute on function public.set_user_report_status(uuid,text) to authenticated,service_role;
