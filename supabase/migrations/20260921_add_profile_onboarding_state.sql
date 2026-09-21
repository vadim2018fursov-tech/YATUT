alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

create or replace function public.complete_my_onboarding()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  completed_at timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  update public.profiles
  set onboarding_completed_at = completed_at,
      updated_at = now()
  where id = auth.uid();

  return completed_at;
end;
$$;

revoke all on function public.complete_my_onboarding()
from public, anon;

grant execute on function public.complete_my_onboarding()
to authenticated, service_role;


-- Backfill existing accounts so onboarding is only shown to new signups.
update public.profiles
set onboarding_completed_at = coalesce(onboarding_completed_at, now())
where onboarding_completed_at is null;
