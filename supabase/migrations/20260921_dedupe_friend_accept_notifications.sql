-- Keep friend-accept notifications single-sourced through
-- private.notify_friend_request_change().

create or replace function public.accept_friend_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  request_row public.friend_requests;
begin
  select *
    into request_row
  from public.friend_requests
  where id = request_id
  for update;

  if request_row.id is null then
    raise exception 'Friend request not found';
  end if;

  if request_row.receiver_id <> auth.uid() then
    raise exception 'Not allowed';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Friend request is not pending';
  end if;

  update public.friend_requests
  set status = 'accepted',
      updated_at = now()
  where id = request_id;

  insert into public.friendships (
    user_id,
    friend_id
  )
  values
    (request_row.sender_id, request_row.receiver_id),
    (request_row.receiver_id, request_row.sender_id)
  on conflict do nothing;
end;
$$;

revoke all on function public.accept_friend_request(uuid)
from public, anon;

grant execute on function public.accept_friend_request(uuid)
to authenticated, service_role;
