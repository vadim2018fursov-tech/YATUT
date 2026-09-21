create table if not exists public.nearby_place_history (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.nearby_places(id) on delete set null,
  place_snapshot_id uuid not null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (
    action in (
      'created',
      'edited',
      'approved',
      'rejected',
      'reopened',
      'deleted'
    )
  ),
  note text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists nearby_place_history_place_idx
  on public.nearby_place_history(place_snapshot_id, created_at desc);

alter table public.nearby_place_history enable row level security;

revoke all on table public.nearby_place_history from public,anon,authenticated;

create or replace function private.log_nearby_place_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  action_name text;
begin
  if tg_op='INSERT' then
    insert into public.nearby_place_history(
      place_id,place_snapshot_id,actor_id,action,new_data
    )
    values(
      new.id,new.id,actor,'created',to_jsonb(new)
    );
    return new;
  end if;

  if tg_op='DELETE' then
    insert into public.nearby_place_history(
      place_id,place_snapshot_id,actor_id,action,old_data
    )
    values(
      old.id,old.id,actor,'deleted',to_jsonb(old)
    );
    return old;
  end if;

  if old.moderation_status is distinct from new.moderation_status then
    action_name :=
      case new.moderation_status
        when 'approved' then 'approved'
        when 'rejected' then 'rejected'
        when 'pending' then 'reopened'
        else 'edited'
      end;
  else
    action_name := 'edited';
  end if;

  insert into public.nearby_place_history(
    place_id,place_snapshot_id,actor_id,action,old_data,new_data
  )
  values(
    new.id,new.id,actor,action_name,to_jsonb(old),to_jsonb(new)
  );

  return new;
end;
$$;

drop trigger if exists nearby_places_history_insert_update on public.nearby_places;
create trigger nearby_places_history_insert_update
after insert or update
on public.nearby_places
for each row
execute function private.log_nearby_place_history();

drop trigger if exists nearby_places_history_delete on public.nearby_places;
create trigger nearby_places_history_delete
before delete
on public.nearby_places
for each row
execute function private.log_nearby_place_history();

insert into public.nearby_place_history(
  place_id,place_snapshot_id,actor_id,action,new_data,created_at
)
select
  np.id,np.id,np.creator_id,'created',to_jsonb(np),np.created_at
from public.nearby_places np
where not exists (
  select 1
  from public.nearby_place_history h
  where h.place_snapshot_id=np.id
    and h.action='created'
);

create or replace function public.get_nearby_place_history(
  target_place_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  place_row public.nearby_places;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into place_row
  from public.nearby_places
  where id=target_place_id;

  if place_row.id is null then
    raise exception 'Place not found';
  end if;

  if place_row.creator_id<>caller_id
     and not private.can_moderate_nearby()
  then
    raise exception 'History access denied';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id',h.id,
          'action',h.action,
          'note',h.note,
          'createdAt',h.created_at,
          'actorId',h.actor_id,
          'actorName',
            coalesce(
              nullif(p.full_name,''),
              p.username,
              'Система'
            ),
          'oldData',h.old_data,
          'newData',h.new_data
        )
        order by h.created_at desc
      )
      from public.nearby_place_history h
      left join public.profiles p on p.id=h.actor_id
      where h.place_snapshot_id=target_place_id
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.delete_my_nearby_place(
  target_place_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  place_row public.nearby_places;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into place_row
  from public.nearby_places
  where id=target_place_id
  for update;

  if place_row.id is null then
    raise exception 'Place not found';
  end if;

  if place_row.creator_id<>caller_id then
    raise exception 'Only the place owner can delete it';
  end if;

  delete from public.saved_items
  where item_type='place'
    and source_id=target_place_id::text;

  delete from public.nearby_places
  where id=target_place_id;
end;
$$;

drop function if exists public.moderate_nearby_place(uuid,text);

create or replace function public.moderate_nearby_place(
  target_place_id uuid,
  decision text,
  moderation_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  place_row public.nearby_places;
  history_action text;
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
      approved_at=
        case
          when decision='approved' then now()
          else null
        end,
      updated_at=now()
  where id=target_place_id;

  history_action :=
    case
      when decision='approved' then 'approved'
      else 'rejected'
    end;

  update public.nearby_place_history h
  set note=nullif(left(trim(coalesce(moderation_note,'')),1000),'')
  where h.id=(
    select h2.id
    from public.nearby_place_history h2
    where h2.place_snapshot_id=target_place_id
      and h2.action=history_action
    order by h2.created_at desc
    limit 1
  );

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
    jsonb_build_object(
      'placeId',target_place_id,
      'moderationNote',nullif(trim(coalesce(moderation_note,'')),'')
    ),
    false,
    'nearby-moderation:'||target_place_id::text||':'||decision
  )
  on conflict do nothing;
end;
$$;

revoke all on function public.get_nearby_place_history(uuid) from public,anon;
revoke all on function public.delete_my_nearby_place(uuid) from public,anon;
revoke all on function public.moderate_nearby_place(uuid,text,text) from public,anon;

grant execute on function public.get_nearby_place_history(uuid) to authenticated,service_role;
grant execute on function public.delete_my_nearby_place(uuid) to authenticated,service_role;
grant execute on function public.moderate_nearby_place(uuid,text,text) to authenticated,service_role;
