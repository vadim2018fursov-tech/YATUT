create table if not exists public.pulse_views (
  media_id uuid not null references public.pulse_media(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (media_id, user_id)
);

create index if not exists pulse_views_user_idx
  on public.pulse_views(user_id, viewed_at desc);

alter table public.pulse_views enable row level security;

grant select, insert on public.pulse_views to authenticated;
grant select, insert, update, delete on public.pulse_views to service_role;

drop policy if exists "pulse view owner reads" on public.pulse_views;
create policy "pulse view owner reads"
on public.pulse_views
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "pulse view owner inserts" on public.pulse_views;
create policy "pulse view owner inserts"
on public.pulse_views
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.pulse_media pm
    where pm.id = media_id
  )
);

create table if not exists public.pulse_share_events (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.pulse_media(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  shared_at timestamptz not null default now()
);

create index if not exists pulse_share_events_media_idx
  on public.pulse_share_events(media_id, shared_at desc);

create index if not exists pulse_share_events_user_idx
  on public.pulse_share_events(user_id, shared_at desc);

alter table public.pulse_share_events enable row level security;

grant select, insert on public.pulse_share_events to authenticated;
grant select, insert, update, delete on public.pulse_share_events to service_role;

drop policy if exists "pulse share owner reads" on public.pulse_share_events;
create policy "pulse share owner reads"
on public.pulse_share_events
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "pulse share owner inserts" on public.pulse_share_events;
create policy "pulse share owner inserts"
on public.pulse_share_events
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.pulse_media pm
    where pm.id = media_id
  )
);

create or replace function private.sync_pulse_view_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.pulse_media
  set views = views + 1
  where id = new.media_id;

  return new;
end;
$$;

revoke all on function private.sync_pulse_view_count()
from public, anon, authenticated;

drop trigger if exists sync_pulse_view_count on public.pulse_views;
create trigger sync_pulse_view_count
after insert on public.pulse_views
for each row execute function private.sync_pulse_view_count();

create or replace function private.sync_pulse_share_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.pulse_media
  set shares_count = shares_count + 1
  where id = new.media_id;

  return new;
end;
$$;

revoke all on function private.sync_pulse_share_count()
from public, anon, authenticated;

drop trigger if exists sync_pulse_share_count on public.pulse_share_events;
create trigger sync_pulse_share_count
after insert on public.pulse_share_events
for each row execute function private.sync_pulse_share_count();
