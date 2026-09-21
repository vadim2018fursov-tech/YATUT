create or replace function private.user_account_active(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = auth, public, private
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = target_user_id
      and u.confirmed_at is not null
  );
$$;

revoke all on function private.user_account_active(uuid)
from public, anon, authenticated;

grant execute on function private.user_account_active(uuid)
to postgres, service_role;

create or replace function private.can_view_profile(target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  mode text;
begin
  if target_user_id = auth.uid() then
    return true;
  end if;

  if not private.user_account_active(target_user_id) then
    return false;
  end if;

  if private.users_blocked(auth.uid(), target_user_id) then
    return false;
  end if;

  mode := private.setting_text(
    target_user_id,
    'profileVisibility',
    'everyone'
  );

  if mode = 'nobody' then
    return false;
  end if;

  if mode = 'friends' then
    return private.is_friend(auth.uid(), target_user_id);
  end if;

  return true;
end;
$$;

create or replace function private.friend_request_allowed(target_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  mode text;
begin
  if target_user_id is null
     or target_user_id = auth.uid() then
    return false;
  end if;

  if not private.user_account_active(target_user_id) then
    return false;
  end if;

  if private.users_blocked(auth.uid(), target_user_id) then
    return false;
  end if;

  mode := private.setting_text(
    target_user_id,
    'friendRequests',
    'everyone'
  );

  if mode = 'nobody' then
    return false;
  end if;

  if mode = 'mutual' then
    return exists (
      select 1
      from public.friendships mine
      join public.friendships theirs
        on theirs.friend_id = mine.friend_id
      where mine.user_id = auth.uid()
        and theirs.user_id = target_user_id
        and mine.friend_id <> target_user_id
        and theirs.friend_id <> auth.uid()
    );
  end if;

  return true;
end;
$$;

create or replace function private.message_allowed(target_user_id uuid, sender_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, private
as $$
declare
  mode text;
begin
  if target_user_id is null
     or sender_user_id is null
     or target_user_id = sender_user_id then
    return false;
  end if;

  if not private.user_account_active(target_user_id) then
    return false;
  end if;

  if private.users_blocked(sender_user_id, target_user_id) then
    return false;
  end if;

  mode := private.setting_text(
    target_user_id,
    'messages',
    'friends'
  );

  if mode = 'nobody' then
    return false;
  end if;

  if mode = 'everyone' then
    return true;
  end if;

  return private.is_friend(sender_user_id, target_user_id);
end;
$$;
