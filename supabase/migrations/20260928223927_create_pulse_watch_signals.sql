create index if not exists pulse_watch_signals_user_seen_idx
on public.pulse_watch_signals(user_id, last_seen_at desc);

create or replace function public.record_pulse_watch_signal(
  target_media_id uuid,
  watch_delta_ms integer default 0,
  impression_delta integer default 0,
  completion_delta integer default 0,
  quick_swipe_delta integer default 0,
  replay_delta integer default 0
)
returns table (
  media_id uuid,
  impressions integer,
  total_watch_ms bigint,
  max_watch_ms integer,
  completions integer,
  quick_swipes integer,
  replays integer,
  last_seen_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $function$
declare
  current_user_id uuid := auth.uid();
  safe_watch integer := greatest(0, least(coalesce(watch_delta_ms, 0), 7200000));
  safe_impression integer := greatest(0, least(coalesce(impression_delta, 0), 1));
  safe_completion integer := greatest(0, least(coalesce(completion_delta, 0), 1));
  safe_quick_swipe integer := greatest(0, least(coalesce(quick_swipe_delta, 0), 1));
  safe_replay integer := greatest(0, least(coalesce(replay_delta, 0), 1));
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.pulse_media pm
    where pm.id = target_media_id
  ) then
    raise exception 'PULSE media is not visible';
  end if;

  insert into public.pulse_watch_signals (
    user_id, media_id, impressions, total_watch_ms, max_watch_ms,
    completions, quick_swipes, replays, last_seen_at, updated_at
  )
  values (
    current_user_id, target_media_id, safe_impression, safe_watch, safe_watch,
    safe_completion, safe_quick_swipe, safe_replay, now(), now()
  )
  on conflict on constraint pulse_watch_signals_pkey
  do update set
    impressions = pulse_watch_signals.impressions + excluded.impressions,
    total_watch_ms = pulse_watch_signals.total_watch_ms + excluded.total_watch_ms,
    max_watch_ms = greatest(pulse_watch_signals.max_watch_ms, excluded.max_watch_ms),
    completions = pulse_watch_signals.completions + excluded.completions,
    quick_swipes = pulse_watch_signals.quick_swipes + excluded.quick_swipes,
    replays = pulse_watch_signals.replays + excluded.replays,
    last_seen_at = now(),
    updated_at = now();

  return query
  select
    s.media_id, s.impressions, s.total_watch_ms, s.max_watch_ms,
    s.completions, s.quick_swipes, s.replays, s.last_seen_at
  from public.pulse_watch_signals s
  where s.user_id = current_user_id
    and s.media_id = target_media_id;
end;
$function$;
