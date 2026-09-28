create table if not exists public.feed_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  kind text not null check (
    kind in ('not_interested','less_from_author')
  ),
  created_at timestamptz not null default now(),
  constraint feed_feedback_target_check check (
    (
      kind = 'not_interested'
      and post_id is not null
      and author_id is null
    )
    or
    (
      kind = 'less_from_author'
      and author_id is not null
      and post_id is null
    )
  )
);

create unique index if not exists feed_feedback_user_post_unique
on public.feed_feedback(user_id, post_id)
where kind='not_interested';

create unique index if not exists feed_feedback_user_author_unique
on public.feed_feedback(user_id, author_id)
where kind='less_from_author';

alter table public.feed_feedback enable row level security;

drop policy if exists "feed feedback readable" on public.feed_feedback;
create policy "feed feedback readable"
on public.feed_feedback
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "feed feedback insertable" on public.feed_feedback;
create policy "feed feedback insertable"
on public.feed_feedback
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "feed feedback deletable" on public.feed_feedback;
create policy "feed feedback deletable"
on public.feed_feedback
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, delete
on public.feed_feedback
to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='feed_feedback'
  ) then
    alter publication supabase_realtime
      add table public.feed_feedback;
  end if;
end
$$;
