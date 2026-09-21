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
    throw new Error(
      data?.message ||
      data?.hint ||
      data?.details ||
      data?.error ||
      "Notification backend request failed."
    );
  }

  return data;
}

function categoryForType(
  type
) {
  if (
    [
      "friend_request",
      "friend_accepted",
    ].includes(
      type
    )
  ) {
    return "people";
  }

  if (
    [
      "like",
      "comment",
      "reply",
      "mention",
    ].includes(
      type
    )
  ) {
    return "activity";
  }

  if (
    type ===
    "message"
  ) {
    return "messages";
  }

  if (
    String(
      type ||
      ""
    ).startsWith(
      "event"
    )
  ) {
    return "events";
  }

  if (
    String(
      type ||
      ""
    ).startsWith(
      "community"
    )
  ) {
    return "communities";
  }

  if (
    type ===
    "business"
  ) {
    return "business";
  }

  if (
    type ===
    "nearby"
  ) {
    return "nearby";
  }

  return "system";
}

function actionsForType(
  type
) {
  if (
    type ===
    "friend_request"
  ) {
    return [
      "accept",
      "decline",
    ];
  }

  return undefined;
}

async function fetchActors(
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
    `in.(${unique.join(",")})`
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

  return Object.fromEntries(
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
        row.id,
        row,
      ]
    )
  );
}

export async function loadBackendNotifications(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/notifications`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "select",
    "id,user_id,actor_id,type,title,body,route,payload,read,group_key,created_at"
  );

  url.searchParams.set(
    "order",
    "created_at.desc"
  );

  url.searchParams.set(
    "limit",
    "250"
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

  const safeRows =
    Array.isArray(
      rows
    )
      ? rows
      : [];

  const actors =
    await fetchActors(
      session,
      safeRows.map(
        (
          row
        ) =>
          row.actor_id
      )
    );

  return safeRows.map(
    (
      row
    ) => {
      const actor =
        row.actor_id
          ? actors[
              row.actor_id
            ] ||
            null
          : null;

      const actorName =
        actor?.full_name ||
        actor?.username ||
        (
          row.actor_id
            ? "Користувач"
            : "ЯТУТ"
        );

      return {
        id:
          row.id,
        backend:
          true,
        type:
          row.type ||
          "system",
        category:
          categoryForType(
            row.type
          ),
        priority:
          "normal",
        title:
          row.title ||
          "Нове сповіщення",
        text:
          row.body ||
          "",
        authorId:
          row.actor_id ||
          null,
        authorName:
          actorName,
        authorInitial:
          actorName
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "Я",
        authorAvatar:
          actor?.avatar_url ||
          null,
        createdAt:
          Date.parse(
            row.created_at
          ),
        read:
          Boolean(
            row.read
          ),
        route:
          row.route ||
          null,
        payload:
          row.payload ||
          null,
        actions:
          actionsForType(
            row.type
          ),
        groupKey:
          row.group_key ||
          null,
        metadata: {},
      };
    }
  );
}

export async function markBackendNotificationRead(
  session,
  notificationId
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/notifications?id=eq.${encodeURIComponent(
        notificationId
      )}`,
      {
        method:
          "PATCH",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            read:
              true,
          }),
      }
    );

  return parseResponse(
    response
  );
}

export async function markAllBackendNotificationsRead(
  session
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${encodeURIComponent(
        session.user.id
      )}&read=eq.false`,
      {
        method:
          "PATCH",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            read:
              true,
          }),
      }
    );

  return parseResponse(
    response
  );
}

export async function deleteBackendNotification(
  session,
  notificationId
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/notifications?id=eq.${encodeURIComponent(
        notificationId
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

export async function deleteBackendNotifications(
  session,
  {
    readOnly = false,
  } = {}
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/notifications`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  if (
    readOnly
  ) {
    url.searchParams.set(
      "read",
      "eq.true"
    );
  }

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

  return parseResponse(
    response
  );
}
