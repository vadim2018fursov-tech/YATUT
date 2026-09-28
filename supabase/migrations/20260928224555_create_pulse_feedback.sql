create table if not exists public.pulse_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_id uuid references public.pulse_media(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  kind text not null check (
    kind in ('not_interested','less_from_author')
  ),
  created_at timestamptz not null default now(),
  constraint pulse_feedback_target_check check (
    (
      kind = 'not_interested'
      and media_id is not null
      and author_id is null
    )
    or
    (
      kind = 'less_from_author'
      and author_id is not null
      and media_id is null
    )
  )
);

create unique index if not exists pulse_feedback_user_media_unique
on public.pulse_feedback(user_id, media_id)
where kind='not_interested';

create unique index if not exists pulse_feedback_user_author_unique
on public.pulse_feedback(user_id, author_id)
where kind='less_from_author';

alter table public.pulse_feedback enable row level security;

drop policy if exists "pulse feedback readable" on public.pulse_feedback;
create policy "pulse feedback readable"
on public.pulse_feedback
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "pulse feedback insertable" on public.pulse_feedback;
create policy "pulse feedback insertable"
on public.pulse_feedback
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "pulse feedback deletable" on public.pulse_feedback;
create policy "pulse feedback deletable"
on public.pulse_feedback
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, delete
on public.pulse_feedback
to authenticated;
