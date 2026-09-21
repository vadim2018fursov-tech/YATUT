create or replace function public.check_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    candidate is not null
    and candidate ~ '^[a-z0-9._]{3,30}$'
    and not exists (
      select 1
      from public.profiles p
      where p.username = candidate
        and (
          auth.uid() is null
          or p.id <> auth.uid()
        )
    );
$$;

revoke all on function public.check_username_available(text) from public;
grant execute on function public.check_username_available(text)
to anon, authenticated, service_role;
