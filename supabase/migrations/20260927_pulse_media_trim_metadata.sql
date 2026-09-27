alter table public.pulse_media
  add column if not exists trim_start_seconds numeric(10,3),
  add column if not exists trim_end_seconds numeric(10,3);

alter table public.pulse_media
  drop constraint if exists pulse_media_trim_range_check;

alter table public.pulse_media
  add constraint pulse_media_trim_range_check
  check (
    (trim_start_seconds is null or trim_start_seconds >= 0)
    and
    (trim_end_seconds is null or trim_end_seconds >= 0)
    and
    (
      trim_start_seconds is null
      or trim_end_seconds is null
      or trim_end_seconds > trim_start_seconds
    )
  );
