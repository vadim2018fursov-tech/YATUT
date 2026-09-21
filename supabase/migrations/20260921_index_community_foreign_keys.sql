create index if not exists community_join_requests_requester_idx
  on public.community_join_requests(requester_id);

create index if not exists community_post_comments_author_idx
  on public.community_post_comments(author_id);

create index if not exists community_post_reactions_user_idx
  on public.community_post_reactions(user_id);

create index if not exists community_posts_author_idx
  on public.community_posts(author_id);
