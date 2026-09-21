create table if not exists public.user_sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  sanction_type text not null check (
    sanction_type in ('warning','temporary_block','permanent_block')
  ),
  reason text not null check (char_length(trim(reason)) between 3 and 1500),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  acknowledged_at timestamptz,
  lifted_at timestamptz,
  lifted_by uuid references public.profiles(id) on delete set null,
  lift_note text,
  created_at timestamptz not null default now(),
  constraint user_sanctions_expiry_check check (
    (sanction_type='temporary_block' and expires_at is not null)
    or
    (sanction_type in ('warning','permanent_block'))
  )
);

create index if not exists user_sanctions_user_created_idx
  on public.user_sanctions(user_id, created_at desc);

create index if not exists user_sanctions_active_block_idx
  on public.user_sanctions(user_id, expires_at)
  where lifted_at is null
    and sanction_type in ('temporary_block','permanent_block');

alter table public.user_sanctions enable row level security;

revoke all on table public.user_sanctions from public,anon,authenticated;

create or replace function private.user_has_active_block(
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_sanctions s
    where s.user_id=target_user_id
      and s.lifted_at is null
      and s.starts_at<=now()
      and s.sanction_type in ('temporary_block','permanent_block')
      and (
        s.sanction_type='permanent_block'
        or s.expires_at>now()
      )
  );
$$;

revoke all on function private.user_has_active_block(uuid)
from public,anon,authenticated;
grant execute on function private.user_has_active_block(uuid)
to postgres,service_role;

create or replace function private.user_account_active(
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id=target_user_id
      and u.confirmed_at is not null
      and (
        u.banned_until is null
        or u.banned_until<=now()
      )
  )
  and not private.user_has_active_block(target_user_id);
$$;

create or replace function private.enforce_active_actor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null
     and not private.user_account_active(auth.uid())
  then
    raise exception 'ACCOUNT_RESTRICTED'
      using errcode='P0001';
  end if;

  if tg_op='DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_active_actor()
from public,anon,authenticated;
grant execute on function private.enforce_active_actor()
to postgres,service_role;

do $$
declare
  table_name text;
  guarded_tables text[] := array[
    'blocks',
    'comments',
    'communities',
    'community_join_requests',
    'community_members',
    'community_post_comments',
    'community_post_reactions',
    'community_posts',
    'conversation_members',
    'conversations',
    'event_invites',
    'event_likes',
    'event_participants',
    'events',
    'follows',
    'friend_requests',
    'friendships',
    'messages',
    'nearby_place_reviews',
    'nearby_places',
    'post_reactions',
    'posts',
    'profiles',
    'saved_items',
    'stories',
    'story_views',
    'user_reports',
    'user_settings'
  ];
begin
  foreach table_name in array guarded_tables
  loop
    execute format(
      'drop trigger if exists enforce_active_actor on public.%I',
      table_name
    );

    execute format(
      'create trigger enforce_active_actor
       before insert or update or delete
       on public.%I
       for each row
       execute function private.enforce_active_actor()',
      table_name
    );
  end loop;
end;
$$;

create or replace function public.get_my_account_access_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  active_block public.user_sanctions;
  warning_row public.user_sanctions;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into active_block
  from public.user_sanctions s
  where s.user_id=caller_id
    and s.lifted_at is null
    and s.starts_at<=now()
    and s.sanction_type in ('temporary_block','permanent_block')
    and (
      s.sanction_type='permanent_block'
      or s.expires_at>now()
    )
  order by s.created_at desc
  limit 1;

  select *
    into warning_row
  from public.user_sanctions s
  where s.user_id=caller_id
    and s.sanction_type='warning'
    and s.acknowledged_at is null
    and s.lifted_at is null
  order by s.created_at desc
  limit 1;

  return jsonb_build_object(
    'status',
      case
        when active_block.id is not null then 'blocked'
        when warning_row.id is not null then 'warning'
        else 'active'
      end,
    'block',
      case when active_block.id is not null then
        jsonb_build_object(
          'id',active_block.id,
          'type',active_block.sanction_type,
          'reason',active_block.reason,
          'startsAt',active_block.starts_at,
          'expiresAt',active_block.expires_at,
          'createdAt',active_block.created_at
        )
      else null end,
    'warning',
      case when warning_row.id is not null then
        jsonb_build_object(
          'id',warning_row.id,
          'reason',warning_row.reason,
          'createdAt',warning_row.created_at
        )
      else null end
  );
end;
$$;

create or replace function public.acknowledge_my_warning(
  target_sanction_id uuid
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

  update public.user_sanctions
  set acknowledged_at=coalesce(acknowledged_at,now())
  where id=target_sanction_id
    and user_id=auth.uid()
    and sanction_type='warning'
    and lifted_at is null;

  if not found then
    raise exception 'Warning not found';
  end if;
end;
$$;

create or replace function public.get_admin_user_sanctions(
  target_user_id uuid
)
returns jsonb
language plpgsql
stable
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

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id',s.id,
          'type',s.sanction_type,
          'reason',s.reason,
          'startsAt',s.starts_at,
          'expiresAt',s.expires_at,
          'acknowledgedAt',s.acknowledged_at,
          'liftedAt',s.lifted_at,
          'liftNote',s.lift_note,
          'createdAt',s.created_at,
          'createdBy',coalesce(nullif(cp.full_name,''),cp.username,'Система'),
          'liftedBy',coalesce(nullif(lp.full_name,''),lp.username,null),
          'active',
            s.lifted_at is null
            and s.starts_at<=now()
            and (
              (
                s.sanction_type='warning'
                and s.acknowledged_at is null
              )
              or s.sanction_type='permanent_block'
              or (
                s.sanction_type='temporary_block'
                and s.expires_at>now()
              )
            )
        )
        order by s.created_at desc
      )
      from public.user_sanctions s
      left join public.profiles cp on cp.id=s.created_by
      left join public.profiles lp on lp.id=s.lifted_by
      where s.user_id=target_user_id
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.get_my_account_access_state() from public,anon;
revoke all on function public.acknowledge_my_warning(uuid) from public,anon;
revoke all on function public.get_admin_user_sanctions(uuid) from public,anon;

grant execute on function public.get_my_account_access_state()
to authenticated,service_role;
grant execute on function public.acknowledge_my_warning(uuid)
to authenticated,service_role;
grant execute on function public.get_admin_user_sanctions(uuid)
to authenticated,service_role;
