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

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.hint ||
      data?.details ||
      data?.error ||
      "PULSE social request failed."
    );
  }

  return data;
}

export function isPulseBackendId(
  value
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(
      value ||
      ""
    )
  );
}

async function fetchRows(
  session,
  table,
  params
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/${table}`
    );

  Object.entries(
    params || {}
  ).forEach(
    ([
      key,
      value,
    ]) => {
      if (
        value !==
          undefined &&
        value !==
          null
      ) {
        url.searchParams.set(
          key,
          String(
            value
          )
        );
      }
    }
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

  return parseResponse(
    response
  );
}

async function countFollowers(
  session,
  authorId
) {
  if (!authorId) {
    return 0;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/follows`
    );

  url.searchParams.set(
    "following_id",
    `eq.${authorId}`
  );

  url.searchParams.set(
    "select",
    "follower_id"
  );

  const response =
    await fetch(
      url,
      {
        headers:
          headers(
            session,
            {
              Prefer:
                "count=exact",
              Range:
                "0-0",
            }
          ),
      }
    );

  await parseResponse(
    response
  );

  const contentRange =
    response.headers.get(
      "content-range"
    ) ||
    "";

  const total =
    Number(
      contentRange.split(
        "/"
      )[1]
    );

  return Number.isFinite(
    total
  )
    ? total
    : 0;
}

export async function loadPulseCreatorSocialState(
  session,
  authorId
) {
  if (!authorId) {
    return {
      following:
        false,
      followersCount:
        0,
    };
  }

  const followersCount =
    await countFollowers(
      session,
      authorId
    );

  if (
    !session?.user?.id ||
    session.user.id ===
      authorId
  ) {
    return {
      following:
        false,
      followersCount,
    };
  }

  const rows =
    await fetchRows(
      session,
      "follows",
      {
        follower_id:
          `eq.${session.user.id}`,
        following_id:
          `eq.${authorId}`,
        select:
          "following_id",
        limit:
          1,
      }
    );

  return {
    following:
      Array.isArray(
        rows
      ) &&
      rows.length >
        0,
    followersCount,
  };
}

export async function loadPulseInteractionState(
  session,
  {
    mediaId,
    authorId,
  }
) {
  if (
    !session?.user?.id ||
    !isPulseBackendId(
      mediaId
    )
  ) {
    return {
      liked:
        false,
      saved:
        false,
      following:
        false,
      followersCount:
        0,
    };
  }

  const userId =
    session.user.id;

  const reactionUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/pulse_reactions`
    );

  reactionUrl.searchParams.set(
    "media_id",
    `eq.${mediaId}`
  );

  reactionUrl.searchParams.set(
    "user_id",
    `eq.${userId}`
  );

  reactionUrl.searchParams.set(
    "select",
    "media_id"
  );

  reactionUrl.searchParams.set(
    "limit",
    "1"
  );

  const savedUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/saved_items`
    );

  savedUrl.searchParams.set(
    "user_id",
    `eq.${userId}`
  );

  savedUrl.searchParams.set(
    "item_type",
    "eq.pulse"
  );

  savedUrl.searchParams.set(
    "source_id",
    `eq.${mediaId}`
  );

  savedUrl.searchParams.set(
    "select",
    "source_id"
  );

  savedUrl.searchParams.set(
    "limit",
    "1"
  );

  const followUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/follows`
    );

  followUrl.searchParams.set(
    "follower_id",
    `eq.${userId}`
  );

  followUrl.searchParams.set(
    "following_id",
    `eq.${authorId || ""}`
  );

  followUrl.searchParams.set(
    "select",
    "following_id"
  );

  followUrl.searchParams.set(
    "limit",
    "1"
  );

  const requests =
    [
      fetch(
        reactionUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        savedUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      authorId &&
      authorId !==
        userId
        ? fetch(
            followUrl,
            {
              headers:
                headers(
                  session
                ),
            }
          )
        : Promise.resolve(
            null
          ),
      countFollowers(
        session,
        authorId
      ),
    ];

  const [
    reactionResponse,
    savedResponse,
    followResponse,
    followersCount,
  ] =
    await Promise.all(
      requests
    );

  const [
    reactions,
    savedRows,
    followRows,
  ] =
    await Promise.all([
      parseResponse(
        reactionResponse
      ),
      parseResponse(
        savedResponse
      ),
      followResponse
        ? parseResponse(
            followResponse
          )
        : [],
    ]);

  return {
    liked:
      Array.isArray(
        reactions
      ) &&
      reactions.length >
        0,
    saved:
      Array.isArray(
        savedRows
      ) &&
      savedRows.length >
        0,
    following:
      Array.isArray(
        followRows
      ) &&
      followRows.length >
        0,
    followersCount:
      Number(
        followersCount ||
        0
      ),
  };
}

export async function setPulseLike(
  session,
  mediaId,
  shouldLike
) {
  if (
    !session?.user?.id ||
    !isPulseBackendId(
      mediaId
    )
  ) {
    return false;
  }

  const userId =
    session.user.id;

  if (
    shouldLike
  ) {
    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/pulse_reactions?on_conflict=media_id,user_id`,
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
              media_id:
                mediaId,
              user_id:
                userId,
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

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/pulse_reactions`
    );

  url.searchParams.set(
    "media_id",
    `eq.${mediaId}`
  );

  url.searchParams.set(
    "user_id",
    `eq.${userId}`
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

export async function setPulseSaved(
  session,
  video,
  shouldSave
) {
  const mediaId =
    video?.id;

  if (
    !session?.user?.id ||
    !isPulseBackendId(
      mediaId
    )
  ) {
    return false;
  }

  const userId =
    session.user.id;

  if (
    shouldSave
  ) {
    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/saved_items?on_conflict=user_id,item_type,source_id`,
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
              user_id:
                userId,
              item_type:
                "pulse",
              source_id:
                mediaId,
              snapshot: {
                id:
                  mediaId,
                type:
                  "pulse",
                source:
                  "pulse",
                sourceId:
                  mediaId,
                title:
                  video?.title ||
                  "ЯТУТ PULSE",
                subtitle:
                  video?.type ===
                    "clip"
                    ? "PULSE · Clip"
                    : "PULSE · Відео",
                description:
                  video?.description ||
                  "",
                text:
                  video?.description ||
                  "",
                thumbnail:
                  video?.thumbnail ||
                  null,
                image:
                  video?.thumbnail ||
                  null,
                imageUrl:
                  video?.thumbnail ||
                  null,
                cover:
                  video?.thumbnail ||
                  null,
                mediaType:
                  "video",
                videoUrl:
                  video?.videoUrl ||
                  video?.video ||
                  null,
                author:
                  video?.author ||
                  null,
                route:
                  video?.type ===
                    "clip"
                    ? "clips"
                    : "watch",
                routePayload: {
                  videoId:
                    mediaId,
                },
                city:
                  video?.location
                    ?.name ||
                  "",
                location:
                  video?.location
                    ?.name ||
                  "",
                createdAt:
                  video?.createdAt ||
                  Date.now(),
                savedAt:
                  Date.now(),
                updatedAt:
                  Date.now(),
              },
              updated_at:
                new Date().toISOString(),
            }),
        }
      );

    await parseResponse(
      response
    );

    return true;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/saved_items`
    );

  url.searchParams.set(
    "user_id",
    `eq.${userId}`
  );

  url.searchParams.set(
    "item_type",
    "eq.pulse"
  );

  url.searchParams.set(
    "source_id",
    `eq.${mediaId}`
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

export async function recordPulseView(
  session,
  mediaId
) {
  if (
    !session?.user?.id ||
    !isPulseBackendId(
      mediaId
    )
  ) {
    return false;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/pulse_views?on_conflict=media_id,user_id`,
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
            media_id:
              mediaId,
            user_id:
              session.user.id,
          }),
      }
    );

  await parseResponse(
    response
  );

  return true;
}

export async function loadPulseWatchSignals(
  session
) {
  if (
    !session?.user?.id
  ) {
    return new Map();
  }

  const rows =
    await fetchRows(
      session,
      "pulse_watch_signals",
      {
        user_id:
          `eq.${session.user.id}`,
        select:
          "media_id,impressions,total_watch_ms,max_watch_ms,completions,quick_swipes,replays,last_seen_at",
        order:
          "last_seen_at.desc.nullslast",
        limit:
          1200,
      }
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
        row
      ) => [
        row.media_id,
        {
          impressions:
            Number(
              row.impressions ||
              0
            ),
          totalWatchMs:
            Number(
              row.total_watch_ms ||
              0
            ),
          maxWatchMs:
            Number(
              row.max_watch_ms ||
              0
            ),
          completions:
            Number(
              row.completions ||
              0
            ),
          quickSwipes:
            Number(
              row.quick_swipes ||
              0
            ),
          replays:
            Number(
              row.replays ||
              0
            ),
          lastSeenAt:
            row.last_seen_at ||
            null,
        },
      ]
    )
  );
}

export async function recordPulseWatchSignal(
  session,
  {
    mediaId,
    watchMs = 0,
    impression = false,
    completed = false,
    quickSwipe = false,
    replay = false,
  }
) {
  if (
    !session?.user?.id ||
    !isPulseBackendId(
      mediaId
    )
  ) {
    return null;
  }

  const safeWatch =
    Math.max(
      0,
      Math.min(
        180000,
        Math.round(
          Number(
            watchMs ||
            0
          )
        )
      )
    );

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/record_pulse_watch_signal`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            target_media_id:
              mediaId,
            watch_delta_ms:
              safeWatch,
            impression_delta:
              impression
                ? 1
                : 0,
            completion_delta:
              completed
                ? 1
                : 0,
            quick_swipe_delta:
              quickSwipe
                ? 1
                : 0,
            replay_delta:
              replay
                ? 1
                : 0,
          }),
      }
    );

  const data =
    await parseResponse(
      response
    );

  const row =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!row) {
    return null;
  }

  return {
    impressions:
      Number(
        row.impressions ||
        0
      ),
    totalWatchMs:
      Number(
        row.total_watch_ms ||
        0
      ),
    maxWatchMs:
      Number(
        row.max_watch_ms ||
        0
      ),
    completions:
      Number(
        row.completions ||
        0
      ),
    quickSwipes:
      Number(
        row.quick_swipes ||
        0
      ),
    replays:
      Number(
        row.replays ||
        0
      ),
    lastSeenAt:
      row.last_seen_at ||
      null,
  };
}

export async function recordPulseShare(
  session,
  mediaId
) {
  if (
    !session?.user?.id ||
    !isPulseBackendId(
      mediaId
    )
  ) {
    return false;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/pulse_share_events`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "return=minimal",
            }
          ),
        body:
          JSON.stringify({
            media_id:
              mediaId,
            user_id:
              session.user.id,
          }),
      }
    );

  await parseResponse(
    response
  );

  return true;
}

export async function togglePulseFollow(
  session,
  authorId
) {
  if (
    !session?.user?.id ||
    !authorId ||
    authorId ===
      session.user.id
  ) {
    return false;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/toggle_follow`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            target_user_id:
              authorId,
          }),
      }
    );

  return Boolean(
    await parseResponse(
      response
    )
  );
}

function mapComment(
  row,
  profile
) {
  const name =
    profile?.full_name ||
    profile?.username ||
    "Користувач";

  return {
    id:
      row.id,
    mediaId:
      row.media_id,
    parentId:
      row.parent_id ||
      null,
    text:
      row.text ||
      "",
    createdAt:
      row.created_at
        ? Date.parse(
            row.created_at
          )
        : Date.now(),
    author: {
      id:
        row.author_id,
      name,
      username:
        profile?.username ||
        "user",
      avatar:
        profile?.avatar_url ||
        null,
      initials:
        name
          .trim()
          .charAt(
            0
          )
          .toUpperCase() ||
        "Я",
      verified:
        Boolean(
          profile?.verified
        ),
    },
  };
}

async function loadProfilesByIds(
  session,
  ids
) {
  const unique =
    [
      ...new Set(
        (
          ids ||
          []
        ).filter(
          Boolean
        )
      ),
    ];

  if (
    !unique.length
  ) {
    return new Map();
  }

  const rows =
    await fetchRows(
      session,
      "profiles",
      {
        id:
          `in.(${unique.join(
            ","
          )})`,
        select:
          "id,username,full_name,avatar_url,verified",
      }
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

export async function loadPulseComments(
  session,
  mediaId,
  {
    limit = 100,
    newestFirst = true,
  } = {}
) {
  if (
    !isPulseBackendId(
      mediaId
    )
  ) {
    return [];
  }

  const rows =
    await fetchRows(
      session,
      "pulse_comments",
      {
        media_id:
          `eq.${mediaId}`,
        select:
          "id,media_id,author_id,parent_id,text,created_at,updated_at",
        order:
          newestFirst
            ? "created_at.desc"
            : "created_at.asc",
        limit:
          Math.max(
            1,
            Math.min(
              200,
              Number(
                limit ||
                100
              )
            )
          ),
      }
    );

  const list =
    Array.isArray(
      rows
    )
      ? rows
      : [];

  const profiles =
    await loadProfilesByIds(
      session,
      list.map(
        (
          row
        ) =>
          row.author_id
      )
    );

  return list.map(
    (
      row
    ) =>
      mapComment(
        row,
        profiles.get(
          row.author_id
        ) ||
          null
      )
  );
}

export async function createPulseComment(
  session,
  mediaId,
  text,
  parentId = null
) {
  const clean =
    String(
      text ||
      ""
    ).trim();

  if (
    !session?.user?.id ||
    !isPulseBackendId(
      mediaId
    ) ||
    !clean
  ) {
    return null;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/pulse_comments`,
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
            media_id:
              mediaId,
            author_id:
              session.user.id,
            parent_id:
              parentId ||
              null,
            text:
              clean.slice(
                0,
                2000
              ),
          }),
      }
    );

  const rows =
    await parseResponse(
      response
    );

  const row =
    Array.isArray(
      rows
    )
      ? rows[0] ||
        null
      : null;

  if (!row) {
    return null;
  }

  const profiles =
    await loadProfilesByIds(
      session,
      [
        row.author_id,
      ]
    );

  return mapComment(
    row,
    profiles.get(
      row.author_id
    ) ||
      null
  );
}

export async function deletePulseComment(
  session,
  commentId
) {
  if (
    !session?.user?.id ||
    !commentId
  ) {
    return;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/pulse_comments`
    );

  url.searchParams.set(
    "id",
    `eq.${commentId}`
  );

  url.searchParams.set(
    "author_id",
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
}
