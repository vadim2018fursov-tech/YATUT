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
        data?.error_description ||
        data?.error ||
        "Backend request failed."
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

function personFromProfile(
  profile
) {
  const name =
    profile.full_name ||
    profile.username ||
    "Користувач ЯТУТ";

  return {
    id:
      profile.id,
    type:
      "person",
    backend:
      true,
    name,
    username:
      profile.username ||
      "user",
    initials:
      name
        .trim()
        .charAt(0)
        .toUpperCase() ||
      "Я",
    city:
      profile.city ||
      "",
    hometown:
      "",
    bio:
      profile.bio ||
      "",
    school:
      "",
    university:
      "",
    work:
      "",
    interests:
      [],
    mutual:
      0,
    reason:
      profile.city
        ? `ЯТУТ • ${profile.city}`
        : "Користувач ЯТУТ",
    online:
      false,
    hasStory:
      false,
    storyViewed:
      true,
    verified:
      Boolean(
        profile.verified
      ),
    friendsCount:
      0,
    followersCount:
      0,
    avatar:
      profile.avatar_url ||
      null,
    cover:
      profile.cover_url ||
      null,
    initial:
      name
        .trim()
        .charAt(0)
        .toUpperCase() ||
      "Я",
    nearby:
      false,
    distance:
      null,
    relation:
      profile.city
        ? `ЯТУТ • ${profile.city}`
        : "Користувач ЯТУТ",
    common:
      [],
  };
}

export async function searchBackendProfiles(
  session,
  query = ""
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

  url.searchParams.set(
    "select",
    "id,username,full_name,avatar_url,cover_url,bio,city,country,status,verified,created_at"
  );

  url.searchParams.set(
    "id",
    `neq.${session.user.id}`
  );

  const clean =
    String(
      query ||
      ""
    ).trim();

  if (
    clean
  ) {
    const pattern =
      `*${clean.replace(
        /[(),]/g,
        ""
      )}*`;

    url.searchParams.set(
      "or",
      `(username.ilike.${pattern},full_name.ilike.${pattern},city.ilike.${pattern})`
    );
  }

  url.searchParams.set(
    "order",
    "created_at.desc"
  );

  url.searchParams.set(
    "limit",
    "30"
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

  return (
    Array.isArray(
      rows
    )
      ? rows
      : []
  ).map(
    personFromProfile
  );
}

export async function getBackendUserProfile(
  session,
  personId
) {
  if (
    !session?.user?.id ||
    !personId
  ) {
    return null;
  }

  const profileUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

  profileUrl.searchParams.set(
    "id",
    `eq.${personId}`
  );

  profileUrl.searchParams.set(
    "select",
    "id,username,full_name,avatar_url,cover_url,bio,city,country,status,verified,created_at"
  );

  profileUrl.searchParams.set(
    "limit",
    "1"
  );

  const friendsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/friendships`
    );

  friendsUrl.searchParams.set(
    "user_id",
    `eq.${personId}`
  );

  friendsUrl.searchParams.set(
    "select",
    "friend_id"
  );

  const followersUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/follows`
    );

  followersUrl.searchParams.set(
    "following_id",
    `eq.${personId}`
  );

  followersUrl.searchParams.set(
    "select",
    "follower_id"
  );

  const followingUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/follows`
    );

  followingUrl.searchParams.set(
    "follower_id",
    `eq.${personId}`
  );

  followingUrl.searchParams.set(
    "select",
    "following_id"
  );

  const postsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/posts`
    );

  postsUrl.searchParams.set(
    "author_id",
    `eq.${personId}`
  );

  postsUrl.searchParams.set(
    "select",
    "id,text,media_url,media_type,location_text,visibility,shares_count,created_at"
  );

  postsUrl.searchParams.set(
    "order",
    "created_at.desc"
  );

  postsUrl.searchParams.set(
    "limit",
    "20"
  );

  const [
    profileResponse,
    friendsResponse,
    followersResponse,
    followingResponse,
    postsResponse,
  ] =
    await Promise.all([
      fetch(
        profileUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        friendsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        followersUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        followingUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        postsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
    ]);

  const [
    profileRows,
    friends,
    followers,
    following,
    posts,
  ] =
    await Promise.all([
      parseResponse(
        profileResponse
      ),
      parseResponse(
        friendsResponse
      ),
      parseResponse(
        followersResponse
      ),
      parseResponse(
        followingResponse
      ),
      parseResponse(
        postsResponse
      ),
    ]);

  const profile =
    Array.isArray(
      profileRows
    )
      ? profileRows[0] ||
        null
      : null;

  if (!profile) {
    return null;
  }

  const person =
    personFromProfile(
      profile
    );

  return {
    ...person,
    country:
      profile.country ||
      "",
    status:
      profile.status ||
      "",
    friendsCount:
      Array.isArray(
        friends
      )
        ? friends.length
        : 0,
    followersCount:
      Array.isArray(
        followers
      )
        ? followers.length
        : 0,
    followingCount:
      Array.isArray(
        following
      )
        ? following.length
        : 0,
    posts:
      (
        Array.isArray(
          posts
        )
          ? posts
          : []
      ).map(
        (
          post
        ) => ({
          id:
            post.id,
          text:
            post.text ||
            "",
          media:
            post.media_url ||
            null,
          mediaType:
            post.media_type ||
            null,
          location:
            post.location_text ||
            null,
          visibility:
            post.visibility ||
            "public",
          shares:
            Number(
              post.shares_count ||
              0
            ),
          createdAt:
            Date.parse(
              post.created_at
            ),
        })
      ),
  };
}

export async function getBackendFollowState(
  session,
  personId
) {
  if (
    !session?.user?.id ||
    !personId
  ) {
    return false;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/follows`
    );

  url.searchParams.set(
    "follower_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "following_id",
    `eq.${personId}`
  );

  url.searchParams.set(
    "select",
    "following_id"
  );

  url.searchParams.set(
    "limit",
    "1"
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

  return Boolean(
    Array.isArray(
      rows
    ) &&
    rows.length
  );
}

export async function toggleBackendFollow(
  session,
  personId
) {
  return callRpc(
    session,
    "toggle_follow",
    {
      target_user_id:
        personId,
    }
  );
}

export async function getBackendFollowGraph(
  session
) {
  if (
    !session?.user?.id
  ) {
    return {
      followers: [],
      following: [],
    };
  }

  const userId =
    session.user.id;

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/follows`
    );

  url.searchParams.set(
    "select",
    "follower_id,following_id"
  );

  url.searchParams.set(
    "or",
    `(follower_id.eq.${userId},following_id.eq.${userId})`
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

  const followers =
    [];

  const following =
    [];

  (
    Array.isArray(
      rows
    )
      ? rows
      : []
  ).forEach(
    (
      row
    ) => {
      if (
        row.following_id ===
        userId
      ) {
        followers.push(
          row.follower_id
        );
      }

      if (
        row.follower_id ===
        userId
      ) {
        following.push(
          row.following_id
        );
      }
    }
  );

  return {
    followers: [
      ...new Set(
        followers
      ),
    ],
    following: [
      ...new Set(
        following
      ),
    ],
  };
}

export async function getBackendRelationships(
  session
) {
  if (
    !session?.user?.id
  ) {
    return {};
  }

  const userId =
    session.user.id;

  const friendshipsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/friendships`
    );

  friendshipsUrl.searchParams.set(
    "select",
    "friend_id"
  );

  friendshipsUrl.searchParams.set(
    "user_id",
    `eq.${userId}`
  );

  const requestsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/friend_requests`
    );

  requestsUrl.searchParams.set(
    "select",
    "id,sender_id,receiver_id,status,created_at"
  );

  requestsUrl.searchParams.set(
    "status",
    "eq.pending"
  );

  requestsUrl.searchParams.set(
    "or",
    `(sender_id.eq.${userId},receiver_id.eq.${userId})`
  );

  const blocksUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/blocks`
    );

  blocksUrl.searchParams.set(
    "select",
    "blocker_id,blocked_id"
  );

  blocksUrl.searchParams.set(
    "or",
    `(blocker_id.eq.${userId},blocked_id.eq.${userId})`
  );

  const [
    friendshipsResponse,
    requestsResponse,
    blocksResponse,
  ] =
    await Promise.all([
      fetch(
        friendshipsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        requestsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        blocksUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
    ]);

  const [
    friendships,
    requests,
    blocks,
  ] =
    await Promise.all([
      parseResponse(
        friendshipsResponse
      ),
      parseResponse(
        requestsResponse
      ),
      parseResponse(
        blocksResponse
      ),
    ]);

  const relationships =
    {};

  (
    Array.isArray(
      friendships
    )
      ? friendships
      : []
  ).forEach(
    (row) => {
      relationships[
        row.friend_id
      ] = {
        friendStatus:
          "friends",
        following:
          true,
        follower:
          true,
        blocked:
          false,
      };
    }
  );

  (
    Array.isArray(
      requests
    )
      ? requests
      : []
  ).forEach(
    (row) => {
      const incoming =
        row.receiver_id ===
        userId;

      const personId =
        incoming
          ? row.sender_id
          : row.receiver_id;

      if (
        relationships[
          personId
        ]?.friendStatus ===
        "friends"
      ) {
        return;
      }

      relationships[
        personId
      ] = {
        friendStatus:
          incoming
            ? "incoming"
            : "outgoing",
        following:
          !incoming,
        follower:
          incoming,
        blocked:
          false,
        requestId:
          row.id,
      };
    }
  );

  (
    Array.isArray(
      blocks
    )
      ? blocks
      : []
  ).forEach(
    (
      row
    ) => {
      const iBlocked =
        row.blocker_id ===
        userId;

      const personId =
        iBlocked
          ? row.blocked_id
          : row.blocker_id;

      relationships[
        personId
      ] = {
        ...(
          relationships[
            personId
          ] ||
          {
            friendStatus:
              "none",
            following:
              false,
            follower:
              false,
          }
        ),
        blocked:
          iBlocked,
        blockedByThem:
          !iBlocked,
        friendStatus:
          "none",
        following:
          false,
        follower:
          false,
      };
    }
  );

  return relationships;
}

export async function setBackendBlocked(
  session,
  personId,
  blocked
) {
  return callRpc(
    session,
    "set_user_blocked",
    {
      target_user_id:
        personId,
      should_block:
        Boolean(
          blocked
        ),
    }
  );
}

export async function reportBackendUser(
  session,
  personId,
  {
    reason = "profile",
    details = "",
  } = {}
) {
  return callRpc(
    session,
    "report_user",
    {
      target_user_id:
        personId,
      report_reason:
        reason,
      report_details:
        details,
    }
  );
}

async function findPendingRequest(
  session,
  personId,
  direction
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/friend_requests`
    );

  url.searchParams.set(
    "select",
    "id,sender_id,receiver_id,status"
  );

  url.searchParams.set(
    "status",
    "eq.pending"
  );

  if (
    direction ===
    "incoming"
  ) {
    url.searchParams.set(
      "sender_id",
      `eq.${personId}`
    );

    url.searchParams.set(
      "receiver_id",
      `eq.${session.user.id}`
    );
  } else {
    url.searchParams.set(
      "sender_id",
      `eq.${session.user.id}`
    );

    url.searchParams.set(
      "receiver_id",
      `eq.${personId}`
    );
  }

  url.searchParams.set(
    "limit",
    "1"
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

  return Array.isArray(
    rows
  )
    ? rows[0] ||
        null
    : null;
}

async function callRpc(
  session,
  name,
  body
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify(
            body
          ),
      }
    );

  return parseResponse(
    response
  );
}

export async function sendBackendFriendRequest(
  session,
  personId
) {
  return callRpc(
    session,
    "send_friend_request",
    {
      receiver_user_id:
        personId,
    }
  );
}

export async function acceptBackendFriendRequest(
  session,
  personId
) {
  const request =
    await findPendingRequest(
      session,
      personId,
      "incoming"
    );

  if (
    !request?.id
  ) {
    throw new Error(
      "Запит у друзі вже недоступний."
    );
  }

  await callRpc(
    session,
    "accept_friend_request",
    {
      request_id:
        request.id,
    }
  );
}

export async function declineBackendFriendRequest(
  session,
  personId
) {
  const request =
    await findPendingRequest(
      session,
      personId,
      "incoming"
    );

  if (
    !request?.id
  ) {
    return;
  }

  await callRpc(
    session,
    "decline_friend_request",
    {
      request_id:
        request.id,
    }
  );
}

export async function cancelBackendFriendRequest(
  session,
  personId
) {
  const request =
    await findPendingRequest(
      session,
      personId,
      "outgoing"
    );

  if (
    !request?.id
  ) {
    return;
  }

  await callRpc(
    session,
    "cancel_friend_request",
    {
      request_id:
        request.id,
    }
  );
}

export async function removeBackendFriend(
  session,
  personId
) {
  await callRpc(
    session,
    "remove_friend",
    {
      other_user_id:
        personId,
    }
  );
}
