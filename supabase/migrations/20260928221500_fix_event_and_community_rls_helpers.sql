-- Restore RLS helper execution required by authenticated policies.
-- Helpers remain in the private schema and are not exposed to anon users.

revoke all on function private.can_view_event(uuid) from public;
revoke all on function private.can_view_event(uuid) from anon;
grant execute on function private.can_view_event(uuid) to authenticated;

alter policy "events_select"
on public.events
using (
  private.can_view_event(id)
);

revoke all on function private.can_view_community(uuid) from public;
revoke all on function private.can_view_community(uuid) from anon;
grant execute on function private.can_view_community(uuid) to authenticated;

revoke all on function private.is_community_member(uuid, uuid) from public;
revoke all on function private.is_community_member(uuid, uuid) from anon;
grant execute on function private.is_community_member(uuid, uuid) to authenticated;

revoke all on function private.is_community_owner(uuid) from public;
revoke all on function private.is_community_owner(uuid) from anon;
grant execute on function private.is_community_owner(uuid) to authenticated;

revoke all on function private.can_manage_community_content(uuid, uuid) from public;
revoke all on function private.can_manage_community_content(uuid, uuid) from anon;
grant execute on function private.can_manage_community_content(uuid, uuid) to authenticated;
