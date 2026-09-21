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
        "Feed backend request failed."
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

function inFilter(
  values
) {
  return `in.(${[
    ...new Set(
      values.filter(
        Boolean
      )
    ),
  ].join(",")})`;
}

async function fetchProfiles(
  session,
  ids
) {
  const unique =
    [
      ...new Set(
        ids.filter(
          Boolean
        )
      ),
    ];

  if (
    unique.length ===
    0
  ) {
    return {};
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

  url.searchParams.set(
    "id",
    inFilter(
      unique
    )
  );

  url.searchParams.set(
    "select",
    "id,username,full_name,avatar_url,city,verified"
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

  return Object.fromEntries(
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

function authorView(
  profile,
  fallbackId
) {
  const name =
    profile?.full_name ||
    profile?.username ||
    "Користувач ЯТУТ";

  return {
    id:
      profile?.id ||
      fallbackId,
    name,
    username:
      profile?.username ||
      "user",
    initial:
      name
        .trim()
        .charAt(0)
        .toUpperCase() ||
      "Я",
    avatar:
      profile?.avatar_url ||
      null,
    verified:
      Boolean(
        profile?.verified
      ),
  };
}

function groupComments(
  comments,
  profiles
) {
  const roots =
    [];

  const byId =
    new Map();

  for (
    const row of
    comments
  ) {
    const author =
      authorView(
        profiles[
          row.author_id
        ],
        row.author_id
      );

    const comment = {
      id:
        row.id,
      backend:
        true,
      authorId:
        row.author_id,
      authorName:
        author.name,
      authorUsername:
        author.username,
      authorInitial:
        author.initial,
      authorAvatar:
        author.avatar ||
        null,
      text:
        row.text ||
        "",
      createdAt:
        Date.parse(
          row.created_at
        ),
      liked:
        false,
      likes:
        0,
      replies:
        [],
      parentId:
        row.parent_id ||
        null,
    };

    byId.set(
      comment.id,
      comment
    );
  }

  for (
    const comment of
    byId.values()
  ) {
    if (
      comment.parentId &&
      byId.has(
        comment.parentId
      )
    ) {
      byId
        .get(
          comment.parentId
        )
        .replies.push(
          comment
        );
    } else {
      roots.push(
        comment
      );
    }
  }

  roots.sort(
    (
      left,
      right
    ) =>
      Number(
        left.createdAt
      ) -
      Number(
        right.createdAt
      )
  );

  roots.forEach(
    (
      comment
    ) => {
      comment.replies.sort(
        (
          left,
          right
        ) =>
          Number(
            left.createdAt
          ) -
          Number(
            right.createdAt
          )
      );
    }
  );

  return roots;
}

export async function loadBackendFeed(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const postsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/posts`
    );

  postsUrl.searchParams.set(
    "select",
    "id,author_id,text,media_url,media_type,location_text,visibility,poll,shares_count,event_id,created_at,updated_at"
  );

  postsUrl.searchParams.set(
    "order",
    "created_at.desc"
  );

  postsUrl.searchParams.set(
    "limit",
    "60"
  );

  const postsResponse =
    await fetch(
      postsUrl,
      {
        headers:
          headers(
            session
          ),
      }
    );

  const postRows =
    await parseResponse(
      postsResponse
    );

  const posts =
    Array.isArray(
      postRows
    )
      ? postRows
      : [];

  if (
    posts.length ===
    0
  ) {
    return [];
  }

  const postIds =
    posts.map(
      (
        post
      ) =>
        post.id
    );

  const commentsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/comments`
    );

  commentsUrl.searchParams.set(
    "post_id",
    inFilter(
      postIds
    )
  );

  commentsUrl.searchParams.set(
    "select",
    "id,post_id,author_id,parent_id,text,created_at,updated_at"
  );

  commentsUrl.searchParams.set(
    "order",
    "created_at.asc"
  );

  const reactionsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/post_reactions`
    );

  reactionsUrl.searchParams.set(
    "post_id",
    inFilter(
      postIds
    )
  );

  reactionsUrl.searchParams.set(
    "select",
    "post_id,user_id,reaction,created_at"
  );

  const [
    commentsResponse,
    reactionsResponse,
  ] =
    await Promise.all([
      fetch(
        commentsUrl,
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
    ]);

  const [
    commentRowsRaw,
    reactionRowsRaw,
  ] =
    await Promise.all([
      parseResponse(
        commentsResponse
      ),
      parseResponse(
        reactionsResponse
      ),
    ]);

  const commentRows =
    Array.isArray(
      commentRowsRaw
    )
      ? commentRowsRaw
      : [];

  const reactionRows =
    Array.isArray(
      reactionRowsRaw
    )
      ? reactionRowsRaw
      : [];

  const profileIds = [
    ...posts.map(
      (
        post
      ) =>
        post.author_id
    ),
    ...commentRows.map(
      (
        comment
      ) =>
        comment.author_id
    ),
  ];

  const profiles =
    await fetchProfiles(
      session,
      profileIds
    );

  const commentsByPost =
    new Map();

  for (
    const postId of
    postIds
  ) {
    commentsByPost.set(
      postId,
      groupComments(
        commentRows.filter(
          (
            comment
          ) =>
            comment.post_id ===
            postId
        ),
        profiles
      )
    );
  }

  const reactionsByPost =
    new Map();

  for (
    const reaction of
    reactionRows
  ) {
    if (
      !reactionsByPost.has(
        reaction.post_id
      )
    ) {
      reactionsByPost.set(
        reaction.post_id,
        []
      );
    }

    reactionsByPost
      .get(
        reaction.post_id
      )
      .push(
        reaction
      );
  }

  return posts.map(
    (
      row
    ) => {
      const author =
        authorView(
          profiles[
            row.author_id
          ],
          row.author_id
        );

      const reactions =
        reactionsByPost.get(
          row.id
        ) ||
        [];

      return {
        id:
          row.id,
        backend:
          true,
        authorId:
          row.author_id,
        authorName:
          author.name,
        authorUsername:
          author.username,
        authorInitial:
          author.initial,
        authorAvatar:
          author.avatar,
        verified:
          author.verified,
        own:
          row.author_id ===
          session.user.id,
        text:
          row.text ||
          "",
        media:
          row.media_url ||
          null,
        mediaType:
          row.media_type ||
          null,
        location:
          row.location_text ||
          null,
        audience:
          row.visibility ||
          "public",
        poll:
          row.poll ||
          null,
        eventId:
          row.event_id ||
          null,
        liked:
          reactions.some(
            (
              reaction
            ) =>
              reaction.user_id ===
                session.user.id &&
              reaction.reaction ===
                "like"
          ),
        likes:
          reactions.filter(
            (
              reaction
            ) =>
              reaction.reaction ===
              "like"
          ).length,
        reactionCounts:
          reactions.reduce(
            (
              counts,
              reaction
            ) => ({
              ...counts,
              [reaction.reaction]:
                Number(
                  counts[
                    reaction.reaction
                  ] ||
                  0
                ) +
                1,
            }),
            {}
          ),
        comments:
          commentsByPost.get(
            row.id
          ) ||
          [],
        shares:
          Number(
            row.shares_count ||
            0
          ),
        createdAt:
          Date.parse(
            row.created_at
          ),
      };
    }
  );
}

export async function createBackendPost(
  session,
  {
    text = "",
    media = null,
    mediaType = null,
    location = null,
    poll = null,
    visibility = "public",
    eventId = null,
  }
) {
  const safeVisibility =
    [
      "public",
      "friends",
      "private",
    ].includes(
      visibility
    )
      ? visibility
      : "public";

  const cloudMedia =
    typeof media ===
      "string" &&
    !media.startsWith(
      "data:"
    ) &&
    !media.startsWith(
      "blob:"
    )
      ? media
      : null;

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/posts`,
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
            author_id:
              session.user.id,
            text:
              text ||
              "",
            media_url:
              cloudMedia,
            media_type:
              cloudMedia
                ? mediaType
                : null,
            location_text:
              location ||
              null,
            visibility:
              safeVisibility,
            poll:
              poll ||
              null,
            event_id:
              eventId ||
              null,
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

export async function deleteBackendPost(
  session,
  postId
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/posts?id=eq.${encodeURIComponent(
        postId
      )}`,
      {
        method:
          "DELETE",
        headers:
          headers(
            session
          ),
      }
    );

  return parseResponse(
    response
  );
}

export async function toggleBackendPostLike(
  session,
  postId,
  liked
) {
  if (
    liked
  ) {
    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/post_reactions?post_id=eq.${encodeURIComponent(
          postId
        )}&user_id=eq.${encodeURIComponent(
          session.user.id
        )}`,
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
      `${SUPABASE_URL}/rest/v1/post_reactions`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "resolution=merge-duplicates,return=minimal",
            }
          ),
        body:
          JSON.stringify({
            post_id:
              postId,
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

export async function addBackendComment(
  session,
  postId,
  text,
  parentId = null
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/comments`,
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
            author_id:
              session.user.id,
            parent_id:
              parentId,
            text,
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

export async function incrementBackendShare(
  session,
  postId
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/increment_post_share`,
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

  return parseResponse(
    response
  );
}
