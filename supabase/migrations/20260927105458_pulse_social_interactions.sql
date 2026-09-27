alter table public.pulse_media
  add column if not exists saves_count integer not null default 0;

alter table public.pulse_media
  drop constraint if exists pulse_media_saves_count_nonnegative;

alter table public.pulse_media
  add constraint pulse_media_saves_count_nonnegative
  check (saves_count >= 0);

create table if not exists public.pulse_reactions (
  media_id uuid not null references public.pulse_media(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  primary key (media_id, user_id),
  constraint pulse_reactions_like_only check (reaction = 'like')
);

create index if not exists pulse_reactions_user_idx
  on public.pulse_reactions(user_id, created_at desc);

alter table public.pulse_reactions enable row level security;

grant select, insert, delete on public.pulse_reactions to authenticated;
grant select, insert, update, delete on public.pulse_reactions to service_role;

drop policy if exists "pulse reactions owner reads" on public.pulse_reactions;
create policy "pulse reactions owner reads"
on public.pulse_reactions
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "pulse reactions owner inserts" on public.pulse_reactions;
create policy "pulse reactions owner inserts"
on public.pulse_reactions
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

drop policy if exists "pulse reactions owner deletes" on public.pulse_reactions;
create policy "pulse reactions owner deletes"
on public.pulse_reactions
for delete
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.pulse_comments (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.pulse_media(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.pulse_comments(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pulse_comments_text_length
    check (char_length(btrim(text)) between 1 and 2000)
);

create index if not exists pulse_comments_media_created_idx
  on public.pulse_comments(media_id, created_at desc);

create index if not exists pulse_comments_author_created_idx
  on public.pulse_comments(author_id, created_at desc);

create index if not exists pulse_comments_parent_idx
  on public.pulse_comments(parent_id)
  where parent_id is not null;

alter table public.pulse_comments enable row level security;

grant select on public.pulse_comments to anon;
grant select, insert, update, delete on public.pulse_comments to authenticated;
grant select, insert, update, delete on public.pulse_comments to service_role;

drop policy if exists "public pulse comments readable" on public.pulse_comments;
create policy "public pulse comments readable"
on public.pulse_comments
for select
to anon
using (
  exists (
    select 1
    from public.pulse_media pm
    where pm.id = media_id
      and pm.visibility = 'public'
  )
);

drop policy if exists "authenticated pulse comments readable" on public.pulse_comments;
create policy "authenticated pulse comments readable"
on public.pulse_comments
for select
to authenticated
using (
  exists (
    select 1
    from public.pulse_media pm
    where pm.id = media_id
  )
);

drop policy if exists "pulse comment owner inserts" on public.pulse_comments;
create policy "pulse comment owner inserts"
on public.pulse_comments
for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1
    from public.pulse_media pm
    where pm.id = media_id
  )
);

drop policy if exists "pulse comment owner updates" on public.pulse_comments;
create policy "pulse comment owner updates"
on public.pulse_comments
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

drop policy if exists "pulse comment owner deletes" on public.pulse_comments;
create policy "pulse comment owner deletes"
on public.pulse_comments
for delete
to authenticated
using ((select auth.uid()) = author_id);

create or replace function public.touch_pulse_comment_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_pulse_comment_updated_at on public.pulse_comments;
create trigger touch_pulse_comment_updated_at
before update on public.pulse_comments
for each row execute function public.touch_pulse_comment_updated_at();

revoke all on function public.touch_pulse_comment_updated_at() from public, anon, authenticated;
grant execute on function public.touch_pulse_comment_updated_at() to service_role;

create or replace function private.sync_pulse_like_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    update public.pulse_media
    set likes_count = likes_count + 1
    where id = new.media_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.pulse_media
    set likes_count = greatest(0, likes_count - 1)
    where id = old.media_id;
    return old;
  end if;

  return null;
end;
$$;

revoke all on function private.sync_pulse_like_count() from public, anon, authenticated;

drop trigger if exists sync_pulse_like_count on public.pulse_reactions;
create trigger sync_pulse_like_count
after insert or delete on public.pulse_reactions
for each row execute function private.sync_pulse_like_count();

create or replace function private.sync_pulse_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    update public.pulse_media
    set comments_count = comments_count + 1
    where id = new.media_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.pulse_media
    set comments_count = greatest(0, comments_count - 1)
    where id = old.media_id;
    return old;
  end if;

  return null;
end;
$$;

revoke all on function private.sync_pulse_comment_count() from public, anon, authenticated;

drop trigger if exists sync_pulse_comment_count on public.pulse_comments;
create trigger sync_pulse_comment_count
after insert or delete on public.pulse_comments
for each row execute function private.sync_pulse_comment_count();

create or replace function private.sync_pulse_save_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_id uuid;
begin
  if tg_op = 'INSERT' then
    if new.item_type <> 'pulse' then
      return new;
    end if;

    if new.source_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      return new;
    end if;

    target_id := new.source_id::uuid;

    update public.pulse_media
    set saves_count = saves_count + 1
    where id = target_id;

    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.item_type <> 'pulse' then
      return old;
    end if;

    if old.source_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      return old;
    end if;

    target_id := old.source_id::uuid;

    update public.pulse_media
    set saves_count = greatest(0, saves_count - 1)
    where id = target_id;

    return old;
  end if;

  return null;
end;
$$;

revoke all on function private.sync_pulse_save_count() from public, anon, authenticated;

drop trigger if exists sync_pulse_save_count on public.saved_items;
create trigger sync_pulse_save_count
after insert or delete on public.saved_items
for each row execute function private.sync_pulse_save_count();

update public.pulse_media pm
set saves_count = (
  select count(*)::integer
  from public.saved_items si
  where si.item_type = 'pulse'
    and si.source_id = pm.id::text
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='pulse_reactions'
  ) then
    alter publication supabase_realtime add table public.pulse_reactions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='pulse_comments'
  ) then
    alter publication supabase_realtime add table public.pulse_comments;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='saved_items'
  ) then
    alter publication supabase_realtime add table public.saved_items;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='follows'
  ) then
    alter publication supabase_realtime add table public.follows;
  end if;
end
$$;
