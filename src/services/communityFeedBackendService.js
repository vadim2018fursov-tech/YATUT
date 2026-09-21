const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

function headers(
  session,
  extra = {}
) {
  return {
    apikey:
      SUPABASE_KEY,
    Authorization:
      `Bearer ${
        session?.access_token ||
        SUPABASE_KEY
      }`,
    "Content-Type":
      "application/json",
    ...extra,
  };
}

async function parseResponse(
  response
) {
  const text =
    await response.text();

  let data =
    null;

  try {
    data =
      text
        ? JSON.parse(
            text
          )
        : null;
  } catch {
    data =
      text;
  }

  if (
    !response.ok
  ) {
    const error =
      new Error(
        data?.message ||
        data?.hint ||
        data?.details ||
        data?.error ||
        "Community feed request failed."
      );

    error.status =
      response.status;

    throw error;
  }

  return data;
}

function profileName(
  profile
) {
  return (
    profile?.full_name ||
    profile?.username ||
    "Користувач"
  );
}

async function loadProfiles(
  session,
  ids
) {
  const uniqueIds =
    [
      ...new Set(
        (
          Array.isArray(
            ids
          )
            ? ids
            : []
        ).filter(
          Boolean
        )
      ),
    ];

  if (
    !uniqueIds.length
  ) {
    return new Map();
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

  url.searchParams.set(
    "id",
    `in.(${uniqueIds.join(",")})`
  );

  url.searchParams.set(
    "select",
    "id,username,full_name,avatar_url"
  );

  const response =
    await fetch(
      url,
      {
        headers:
          headers(
            session
          ),
      }
    );

  const rows =
    await parseResponse(
      response
    );

  return new Map(
    (
      Array.isArray(
        rows
      )
        ? rows
        : []
    ).map(
      (
        profile
      ) => [
        profile.id,
        profile,
      ]
    )
  );
}

export async function loadBackendCommunityFeed(
  session,
  communityId
) {
  if (
    !session?.user?.id ||
    !communityId
  ) {
    return [];
  }

  const postsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_posts`
    );

  postsUrl.searchParams.set(
    "community_id",
    `eq.${communityId}`
  );

  postsUrl.searchParams.set(
    "select",
    "id,community_id,author_id,text,pinned,created_at,updated_at"
  );

  postsUrl.searchParams.set(
    "order",
    "pinned.desc,created_at.desc"
  );

  postsUrl.searchParams.set(
    "limit",
    "100"
  );

  const reactionsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_post_reactions`
    );

  reactionsUrl.searchParams.set(
    "community_id",
    `eq.${communityId}`
  );

  reactionsUrl.searchParams.set(
    "select",
    "post_id,user_id,reaction"
  );

  const commentsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_post_comments`
    );

  commentsUrl.searchParams.set(
    "community_id",
    `eq.${communityId}`
  );

  commentsUrl.searchParams.set(
    "select",
    "id,post_id,author_id,text,created_at"
  );

  commentsUrl.searchParams.set(
    "order",
    "created_at.asc"
  );

  const [
    postsResponse,
    reactionsResponse,
    commentsResponse,
  ] =
    await Promise.all([
      fetch(
        postsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        reactionsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        commentsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
    ]);

  const [
    posts,
    reactions,
    comments,
  ] =
    await Promise.all([
      parseResponse(
        postsResponse
      ),
      parseResponse(
        reactionsResponse
      ),
      parseResponse(
        commentsResponse
      ),
    ]);

  const safePosts =
    Array.isArray(
      posts
    )
      ? posts
      : [];

  const safeReactions =
    Array.isArray(
      reactions
    )
      ? reactions
      : [];

  const safeComments =
    Array.isArray(
      comments
    )
      ? comments
      : [];

  const profiles =
    await loadProfiles(
      session,
      [
        ...safePosts.map(
          (
            post
          ) =>
            post.author_id
        ),
        ...safeComments.map(
          (
            comment
          ) =>
            comment.author_id
        ),
      ]
    );

  return safePosts.map(
    (
      post
    ) => {
      const author =
        profiles.get(
          post.author_id
        );

      const postReactions =
        safeReactions.filter(
          (
            reaction
          ) =>
            reaction.post_id ===
            post.id
        );

      const postComments =
        safeComments.filter(
          (
            comment
          ) =>
            comment.post_id ===
            post.id
        );

      const name =
        profileName(
          author
        );

      return {
        id:
          post.id,
        backend:
          true,
        communityId:
          post.community_id,
        authorId:
          post.author_id,
        author:
          name,
        authorInitial:
          name
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "Я",
        authorAvatar:
          author?.avatar_url ||
          null,
        text:
          post.text ||
          "",
        createdAt:
          Date.parse(
            post.created_at
          ),
        likes:
          postReactions.length,
        liked:
          postReactions.some(
            (
              reaction
            ) =>
              reaction.user_id ===
              session.user.id
          ),
        comments:
          postComments.length,
        commentItems:
          postComments.map(
            (
              comment
            ) => {
              const commentAuthor =
                profiles.get(
                  comment.author_id
                );

              return {
                id:
                  comment.id,
                authorId:
                  comment.author_id,
                author:
                  profileName(
                    commentAuthor
                  ),
                authorAvatar:
                  commentAuthor?.avatar_url ||
                  null,
                text:
                  comment.text ||
                  "",
                createdAt:
                  Date.parse(
                    comment.created_at
                  ),
              };
            }
          ),
        pinned:
          Boolean(
            post.pinned
          ),
      };
    }
  );
}

export async function createBackendCommunityPost(
  session,
  communityId,
  text
) {
  if (
    !session?.user?.id ||
    !communityId ||
    !String(
      text ||
      ""
    ).trim()
  ) {
    return null;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/community_posts`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "return=representation",
            }
          ),
        body:
          JSON.stringify({
            community_id:
              communityId,
            author_id:
              session.user.id,
            text:
              String(
                text
              ).trim(),
            pinned:
              false,
          }),
      }
    );

  const rows =
    await parseResponse(
      response
    );

  return Array.isArray(
    rows
  )
    ? rows[0] ||
      null
    : null;
}

export async function toggleBackendCommunityPostLike(
  session,
  communityId,
  postId,
  liked
) {
  if (
    !session?.user?.id ||
    !communityId ||
    !postId
  ) {
    return false;
  }

  if (
    liked
  ) {
    const url =
      new URL(
        `${SUPABASE_URL}/rest/v1/community_post_reactions`
      );

    url.searchParams.set(
      "post_id",
      `eq.${postId}`
    );

    url.searchParams.set(
      "user_id",
      `eq.${session.user.id}`
    );

    const response =
      await fetch(
        url,
        {
          method:
            "DELETE",
          headers:
            headers(
              session
            ),
        }
      );

    await parseResponse(
      response
    );

    return false;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/community_post_reactions?on_conflict=post_id,user_id`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "resolution=ignore-duplicates,return=minimal",
            }
          ),
        body:
          JSON.stringify({
            post_id:
              postId,
            community_id:
              communityId,
            user_id:
              session.user.id,
            reaction:
              "like",
          }),
      }
    );

  await parseResponse(
    response
  );

  return true;
}

export async function addBackendCommunityComment(
  session,
  communityId,
  postId,
  text
) {
  if (
    !session?.user?.id ||
    !communityId ||
    !postId ||
    !String(
      text ||
      ""
    ).trim()
  ) {
    return null;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/community_post_comments`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "return=representation",
            }
          ),
        body:
          JSON.stringify({
            post_id:
              postId,
            community_id:
              communityId,
            author_id:
              session.user.id,
            text:
              String(
                text
              ).trim(),
          }),
      }
    );

  const rows =
    await parseResponse(
      response
    );

  return Array.isArray(
    rows
  )
    ? rows[0] ||
      null
    : null;
}

export async function toggleBackendCommunityPostPin(
  session,
  postId
) {
  if (
    !session?.user?.id ||
    !postId
  ) {
    return false;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/toggle_community_post_pin`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            target_post_id:
              postId,
          }),
      }
    );

  return Boolean(
    await parseResponse(
      response
    )
  );
}
