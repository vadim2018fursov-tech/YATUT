create table if not exists public.pulse_media (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('clip','video','moment','wave')),
  title text not null default '',
  description text not null default '',
  media_url text not null,
  media_path text not null,
  thumbnail_url text,
  thumbnail_path text,
  mime_type text not null default 'video/mp4',
  duration_seconds integer,
  location_name text,
  visibility text not null default 'public'
    check (visibility in ('public','friends','private')),
  views integer not null default 0 check (views >= 0),
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  shares_count integer not null default 0 check (shares_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pulse_media_created_idx
  on public.pulse_media(created_at desc);

create index if not exists pulse_media_author_created_idx
  on public.pulse_media(author_id, created_at desc);

create index if not exists pulse_media_kind_created_idx
  on public.pulse_media(kind, created_at desc);

alter table public.pulse_media enable row level security;

grant select on public.pulse_media to anon;
grant select, insert, update, delete on public.pulse_media to authenticated;

drop policy if exists "public pulse media readable" on public.pulse_media;
create policy "public pulse media readable"
on public.pulse_media
for select
to anon
using (visibility = 'public');

drop policy if exists "authenticated pulse media readable" on public.pulse_media;
create policy "authenticated pulse media readable"
on public.pulse_media
for select
to authenticated
using (
  visibility = 'public'
  or author_id = (select auth.uid())
  or (
    visibility = 'friends'
    and private.is_friend(author_id, (select auth.uid()))
  )
);

drop policy if exists "owners create pulse media" on public.pulse_media;
create policy "owners create pulse media"
on public.pulse_media
for insert
to authenticated
with check (
  author_id = (select auth.uid())
);

drop policy if exists "owners update pulse media" on public.pulse_media;
create policy "owners update pulse media"
on public.pulse_media
for update
to authenticated
using (
  author_id = (select auth.uid())
)
with check (
  author_id = (select auth.uid())
);

drop policy if exists "owners delete pulse media" on public.pulse_media;
create policy "owners delete pulse media"
on public.pulse_media
for delete
to authenticated
using (
  author_id = (select auth.uid())
);

create or replace function public.touch_pulse_media_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_pulse_media_updated_at on public.pulse_media;
create trigger touch_pulse_media_updated_at
before update on public.pulse_media
for each row execute function public.touch_pulse_media_updated_at();

revoke all on function public.touch_pulse_media_updated_at()
from public, anon, authenticated;
grant execute on function public.touch_pulse_media_updated_at()
to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pulse_media'
  ) then
    alter publication supabase_realtime add table public.pulse_media;
  end if;
end
$$;
