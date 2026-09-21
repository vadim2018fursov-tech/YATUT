-- ЯТУТ backend foundation
-- IMPORTANT:
-- This file is the original bootstrap schema and is NOT a complete snapshot
-- of the current production database. Production has evolved through Supabase
-- migrations. New database changes must be added under supabase/migrations/.
-- Do not use this file alone to recreate production YATUT.
--
-- Run in Supabase SQL editor / migration runner.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  avatar_url text,
  cover_url text,
  bio text not null default '',
  city text,
  country text default 'Україна',
  status text default 'Я тут',
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(sender_id, receiver_id),
  check (sender_id <> receiver_id)
);

create table if not exists public.friendships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null default '',
  media_url text,
  media_type text,
  location_text text,
  visibility text not null default 'public'
    check (visibility in ('public','friends','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  body text not null default '',
  route text,
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists posts_author_created_idx
  on public.posts(author_id, created_at desc);

create index if not exists comments_post_created_idx
  on public.comments(post_id, created_at asc);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

create index if not exists friend_requests_receiver_status_idx
  on public.friend_requests(receiver_id, status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username :=
    lower(
      regexp_replace(
        coalesce(
          new.raw_user_meta_data->>'username',
          split_part(new.email, '@', 1),
          'user'
        ),
        '[^a-zA-Z0-9_\.]+',
        '',
        'g'
      )
    );

  if requested_username = '' then
    requested_username := 'user';
  end if;

  insert into public.profiles (
    id,
    username,
    full_name
  )
  values (
    new.id,
    requested_username || case
      when exists (
        select 1
        from public.profiles
        where username = requested_username
      )
      then '_' || substr(new.id::text, 1, 6)
      else ''
    end,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      ''
    )
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
  on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profile owner updates" on public.profiles;
create policy "profile owner updates"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "friend requests involved users read" on public.friend_requests;
create policy "friend requests involved users read"
on public.friend_requests
for select
to authenticated
using (
  auth.uid() = sender_id
  or auth.uid() = receiver_id
);

drop policy if exists "friend request sender inserts" on public.friend_requests;
create policy "friend request sender inserts"
on public.friend_requests
for insert
to authenticated
with check (
  auth.uid() = sender_id
);

drop policy if exists "friend requests involved users update" on public.friend_requests;
create policy "friend requests involved users update"
on public.friend_requests
for update
to authenticated
using (
  auth.uid() = sender_id
  or auth.uid() = receiver_id
)
with check (
  auth.uid() = sender_id
  or auth.uid() = receiver_id
);

drop policy if exists "friendships readable" on public.friendships;
create policy "friendships readable"
on public.friendships
for select
to authenticated
using (
  auth.uid() = user_id
  or auth.uid() = friend_id
);

drop policy if exists "posts readable" on public.posts;
create policy "posts readable"
on public.posts
for select
to authenticated
using (
  visibility = 'public'
  or author_id = auth.uid()
  or (
    visibility = 'friends'
    and exists (
      select 1
      from public.friendships f
      where f.user_id = auth.uid()
        and f.friend_id = posts.author_id
    )
  )
);

drop policy if exists "post author inserts" on public.posts;
create policy "post author inserts"
on public.posts
for insert
to authenticated
with check (
  auth.uid() = author_id
);

drop policy if exists "post author updates" on public.posts;
create policy "post author updates"
on public.posts
for update
to authenticated
using (
  auth.uid() = author_id
)
with check (
  auth.uid() = author_id
);

drop policy if exists "post author deletes" on public.posts;
create policy "post author deletes"
on public.posts
for delete
to authenticated
using (
  auth.uid() = author_id
);

drop policy if exists "comments readable" on public.comments;
create policy "comments readable"
on public.comments
for select
to authenticated
using (true);

drop policy if exists "comment author inserts" on public.comments;
create policy "comment author inserts"
on public.comments
for insert
to authenticated
with check (
  auth.uid() = author_id
);

drop policy if exists "comment author changes" on public.comments;
create policy "comment author changes"
on public.comments
for update
to authenticated
using (
  auth.uid() = author_id
)
with check (
  auth.uid() = author_id
);

drop policy if exists "comment author deletes" on public.comments;
create policy "comment author deletes"
on public.comments
for delete
to authenticated
using (
  auth.uid() = author_id
);

drop policy if exists "reactions readable" on public.post_reactions;
create policy "reactions readable"
on public.post_reactions
for select
to authenticated
using (true);

drop policy if exists "reaction owner inserts" on public.post_reactions;
create policy "reaction owner inserts"
on public.post_reactions
for insert
to authenticated
with check (
  auth.uid() = user_id
);

drop policy if exists "reaction owner changes" on public.post_reactions;
create policy "reaction owner changes"
on public.post_reactions
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop policy if exists "reaction owner deletes" on public.post_reactions;
create policy "reaction owner deletes"
on public.post_reactions
for delete
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "notification owner reads" on public.notifications;
create policy "notification owner reads"
on public.notifications
for select
to authenticated
using (
  auth.uid() = user_id
);

drop policy if exists "notification owner updates" on public.notifications;
create policy "notification owner updates"
on public.notifications
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);
