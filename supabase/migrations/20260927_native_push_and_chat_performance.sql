-- Native push registration and faster chat summaries.

create table if not exists public.native_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('ios','android')),
  token text not null,
  device_label text,
  app_version text,
  active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, token)
);

create index if not exists native_push_tokens_user_active_idx
  on public.native_push_tokens(user_id, active);

alter table public.native_push_tokens enable row level security;

grant select, insert, update, delete
on public.native_push_tokens
to authenticated;

drop policy if exists "native push owner select" on public.native_push_tokens;
create policy "native push owner select"
on public.native_push_tokens
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "native push owner insert" on public.native_push_tokens;
create policy "native push owner insert"
on public.native_push_tokens
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "native push owner update" on public.native_push_tokens;
create policy "native push owner update"
on public.native_push_tokens
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "native push owner delete" on public.native_push_tokens;
create policy "native push owner delete"
on public.native_push_tokens
for delete to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.touch_native_push_token_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  new.last_seen_at = now();
  return new;
end;
$$;

drop trigger if exists touch_native_push_tokens_updated_at
on public.native_push_tokens;

create trigger touch_native_push_tokens_updated_at
before update on public.native_push_tokens
for each row execute function public.touch_native_push_token_updated_at();

revoke all on function public.touch_native_push_token_updated_at()
from public, anon, authenticated;
grant execute on function public.touch_native_push_token_updated_at()
to service_role;

create or replace function public.get_my_chat_summaries()
returns table (
  conversation_id uuid,
  conversation_type text,
  conversation_title text,
  community_id uuid,
  event_id uuid,
  updated_at timestamptz,
  person_id uuid,
  person_username text,
  person_name text,
  person_avatar_url text,
  person_verified boolean,
  member_ids jsonb,
  member_roles jsonb,
  latest_body text,
  latest_kind text,
  unread_count bigint,
  last_read_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  with mine as (
    select
      c.id,
      c.type,
      c.title,
      c.community_id,
      c.event_id,
      c.created_at,
      c.updated_at,
      cm.last_read_at
    from public.conversation_members cm
    join public.conversations c
      on c.id = cm.conversation_id
    where cm.user_id = auth.uid()
  )
  select
    m.id,
    m.type,
    m.title,
    m.community_id,
    m.event_id,
    greatest(m.updated_at, coalesce(latest.created_at, m.created_at)),
    other_member.user_id,
    other_member.username,
    other_member.full_name,
    other_member.avatar_url,
    coalesce(other_member.verified, false),
    coalesce(
      (
        select jsonb_agg(cm2.user_id order by cm2.joined_at)
        from public.conversation_members cm2
        where cm2.conversation_id = m.id
      ),
      '[]'::jsonb
    ),
    coalesce(
      (
        select jsonb_object_agg(
          cm3.user_id::text,
          coalesce(cm3.role, 'member')
        )
        from public.conversation_members cm3
        where cm3.conversation_id = m.id
      ),
      '{}'::jsonb
    ),
    latest.body,
    latest.kind,
    (
      select count(*)
      from public.messages unread
      where unread.conversation_id = m.id
        and unread.deleted_at is null
        and unread.sender_id <> auth.uid()
        and unread.created_at > coalesce(
          m.last_read_at,
          '1970-01-01'::timestamptz
        )
    ),
    m.last_read_at
  from mine m
  left join lateral (
    select
      cm_other.user_id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.verified
    from public.conversation_members cm_other
    left join public.profiles p
      on p.id = cm_other.user_id
    where cm_other.conversation_id = m.id
      and cm_other.user_id <> auth.uid()
    order by cm_other.joined_at asc
    limit 1
  ) other_member on true
  left join lateral (
    select
      msg.body,
      msg.kind,
      msg.created_at
    from public.messages msg
    where msg.conversation_id = m.id
      and msg.deleted_at is null
    order by msg.created_at desc
    limit 1
  ) latest on true
  order by greatest(m.updated_at, coalesce(latest.created_at, m.created_at)) desc;
$$;

revoke all on function public.get_my_chat_summaries()
from public, anon;
grant execute on function public.get_my_chat_summaries()
to authenticated;

drop policy if exists "push subscriptions owner read" on public.push_subscriptions;
create policy "push subscriptions owner read"
on public.push_subscriptions
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "push subscriptions owner insert" on public.push_subscriptions;
create policy "push subscriptions owner insert"
on public.push_subscriptions
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "push subscriptions owner update" on public.push_subscriptions;
create policy "push subscriptions owner update"
on public.push_subscriptions
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "push subscriptions owner delete" on public.push_subscriptions;
create policy "push subscriptions owner delete"
on public.push_subscriptions
for delete to authenticated
using ((select auth.uid()) = user_id);

alter function public.touch_push_subscription_updated_at()
set search_path = public;

revoke all on function public.touch_push_subscription_updated_at()
from public, anon, authenticated;
grant execute on function public.touch_push_subscription_updated_at()
to service_role;

revoke all on function public.dispatch_yatut_push_notification()
from public, anon, authenticated;
grant execute on function public.dispatch_yatut_push_notification()
to service_role;
