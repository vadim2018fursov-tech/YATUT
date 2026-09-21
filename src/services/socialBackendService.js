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
    "id,username,full_name,avatar_url,bio,city,country,status,verified,created_at"
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

  const [
    friendshipsResponse,
    requestsResponse,
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
    ]);

  const [
    friendships,
    requests,
  ] =
    await Promise.all([
      parseResponse(
        friendshipsResponse
      ),
      parseResponse(
        requestsResponse
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

  return relationships;
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
