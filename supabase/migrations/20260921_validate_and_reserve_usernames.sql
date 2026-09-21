alter table public.profiles
  drop constraint if exists profiles_username_format_check;

alter table public.profiles
  add constraint profiles_username_format_check
  check (username ~ '^[a-z0-9._]{3,30}$');

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
    );
$$;

revoke all on function public.check_username_available(text) from public;
grant execute on function public.check_username_available(text)
to anon, authenticated, service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  explicit_username text :=
    nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), '');
  requested_username text;
  generated_username text;
  suffix text := substr(new.id::text, 1, 6);
begin
  if explicit_username is not null then
    requested_username :=
      lower(regexp_replace(explicit_username, '^@', ''));

    if requested_username !~ '^[a-z0-9._]{3,30}$' then
      raise exception 'Username must be 3-30 characters and use only a-z, 0-9, dot or underscore';
    end if;

    if exists (
      select 1
      from public.profiles p
      where p.username = requested_username
    ) then
      raise exception 'Username already taken';
    end if;

    insert into public.profiles (id, username, full_name)
    values (
      new.id,
      requested_username,
      coalesce(new.raw_user_meta_data->>'full_name', '')
    );

    return new;
  end if;

  requested_username :=
    lower(
      regexp_replace(
        coalesce(split_part(new.email, '@', 1), 'user'),
        '[^a-zA-Z0-9_.]+',
        '',
        'g'
      )
    );

  if requested_username !~ '^[a-z0-9._]{3,24}$' then
    requested_username := 'user';
  end if;

  generated_username := requested_username;

  if exists (
    select 1
    from public.profiles p
    where p.username = generated_username
  ) then
    generated_username :=
      left(requested_username, 23) || '_' || suffix;
  end if;

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    generated_username,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    )
  );

  return new;
end;
$$;
