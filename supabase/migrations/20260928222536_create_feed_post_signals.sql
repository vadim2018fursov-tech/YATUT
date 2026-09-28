create table if not exists public.feed_post_signals (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  impressions integer not null default 0 check (impressions >= 0),
  total_dwell_ms bigint not null default 0 check (total_dwell_ms >= 0),
  max_dwell_ms integer not null default 0 check (max_dwell_ms >= 0),
  quick_skips integer not null default 0 check (quick_skips >= 0),
  engaged_views integer not null default 0 check (engaged_views >= 0),
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.feed_post_signals enable row level security;

drop policy if exists "feed post signals readable" on public.feed_post_signals;
create policy "feed post signals readable"
on public.feed_post_signals
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "feed post signals insertable" on public.feed_post_signals;
create policy "feed post signals insertable"
on public.feed_post_signals
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "feed post signals updatable" on public.feed_post_signals;
create policy "feed post signals updatable"
on public.feed_post_signals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update
on public.feed_post_signals
to authenticated;

create or replace function public.record_feed_post_signal(
  target_post_id uuid,
  dwell_delta_ms integer default 0,
  impression_delta integer default 0,
  quick_skip_delta integer default 0,
  engaged_view_delta integer default 0
)
returns table (
  post_id uuid,
  impressions integer,
  total_dwell_ms bigint,
  max_dwell_ms integer,
  quick_skips integer,
  engaged_views integer,
  last_seen_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $function$
declare
  current_user_id uuid := auth.uid();
  safe_dwell integer := greatest(0, least(coalesce(dwell_delta_ms, 0), 60000));
  safe_impression integer := greatest(0, least(coalesce(impression_delta, 0), 1));
  safe_quick_skip integer := greatest(0, least(coalesce(quick_skip_delta, 0), 1));
  safe_engaged integer := greatest(0, least(coalesce(engaged_view_delta, 0), 1));
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.posts p
    where p.id = target_post_id
  ) then
    raise exception 'Post is not visible';
  end if;

  insert into public.feed_post_signals (
    user_id,
    post_id,
    impressions,
    total_dwell_ms,
    max_dwell_ms,
    quick_skips,
    engaged_views,
    last_seen_at,
    updated_at
  )
  values (
    current_user_id,
    target_post_id,
    safe_impression,
    safe_dwell,
    safe_dwell,
    safe_quick_skip,
    safe_engaged,
    now(),
    now()
  )
  on conflict on constraint feed_post_signals_pkey
  do update set
    impressions = feed_post_signals.impressions + excluded.impressions,
    total_dwell_ms = feed_post_signals.total_dwell_ms + excluded.total_dwell_ms,
    max_dwell_ms = greatest(feed_post_signals.max_dwell_ms, excluded.max_dwell_ms),
    quick_skips = feed_post_signals.quick_skips + excluded.quick_skips,
    engaged_views = feed_post_signals.engaged_views + excluded.engaged_views,
    last_seen_at = now(),
    updated_at = now();

  return query
  select
    s.post_id,
    s.impressions,
    s.total_dwell_ms,
    s.max_dwell_ms,
    s.quick_skips,
    s.engaged_views,
    s.last_seen_at
  from public.feed_post_signals s
  where s.user_id = current_user_id
    and s.post_id = target_post_id;
end;
$function$;

revoke all on function public.record_feed_post_signal(uuid,integer,integer,integer,integer) from public;
revoke all on function public.record_feed_post_signal(uuid,integer,integer,integer,integer) from anon;
grant execute on function public.record_feed_post_signal(uuid,integer,integer,integer,integer) to authenticated;
