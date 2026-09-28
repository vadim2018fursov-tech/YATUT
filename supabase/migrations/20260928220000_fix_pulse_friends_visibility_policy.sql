-- Fix PULSE friends visibility without relying on direct EXECUTE
-- access to private.is_friend() from authenticated sessions.

alter policy "authenticated pulse media readable"
on public.pulse_media
using (
  visibility = 'public'
  or author_id = (select auth.uid())
  or (
    visibility = 'friends'
    and exists (
      select 1
      from public.friendships f
      where f.user_id = (select auth.uid())
        and f.friend_id = pulse_media.author_id
    )
  )
);
