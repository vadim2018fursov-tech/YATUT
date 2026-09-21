import {
  uploadEventCover,
} from "./storageService";

const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

function headers(
  session
) {
  return {
    apikey:
      SUPABASE_KEY,
    Authorization:
      `Bearer ${session?.access_token || SUPABASE_KEY}`,
    "Content-Type":
      "application/json",
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
        ? JSON.parse(text)
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
      "Event backend request failed."
    );
  }

  return data;
}

async function rpc(
  session,
  name,
  body = {}
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method:
          "POST",
        headers:
          headers(session),
        body:
          JSON.stringify(body),
      }
    );

  return parseResponse(
    response
  );
}

function localDateParts(
  value
) {
  const date =
    new Date(value);

  const pad =
    (part) =>
      String(part)
        .padStart(
          2,
          "0"
        );

  return {
    date:
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time:
      `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

const CATEGORY_META = {
  sport: {
    label:
      "Спорт",
    emoji:
      "🏃",
  },
  technology: {
    label:
      "Технології",
    emoji:
      "🚀",
  },
  creative: {
    label:
      "Творчість",
    emoji:
      "🎨",
  },
  music: {
    label:
      "Музика",
    emoji:
      "🎵",
  },
  business: {
    label:
      "Бізнес",
    emoji:
      "💼",
  },
  education: {
    label:
      "Навчання",
    emoji:
      "🎓",
  },
  food: {
    label:
      "Їжа",
    emoji:
      "🍕",
  },
  other: {
    label:
      "Інше",
    emoji:
      "✨",
  },
};

function mapEvent(
  row,
  session
) {
  const parts =
    localDateParts(
      row.starts_at
    );

  const category =
    row.category ||
    "other";

  const meta =
    CATEGORY_META[
      category
    ] ||
    CATEGORY_META.other;

  return {
    id:
      row.id,
    backend:
      true,
    title:
      row.title,
    description:
      row.description ||
      "",
    category,
    categoryLabel:
      meta.label,
    emoji:
      meta.emoji,
    city:
      row.city ||
      "",
    place:
      row.place ||
      "",
    date:
      parts.date,
    time:
      parts.time,
    cover:
      row.cover_url ||
      null,
    visibility:
      row.visibility ||
      "public",
    communityId:
      row.community_id ||
      null,
    communityName:
      row.community_name ||
      null,
    communityAvatar:
      row.community_avatar ||
      null,
    organizerId:
      row.creator_id ===
      session?.user?.id
        ? "me"
        : row.creator_id,
    organizerBackendId:
      row.creator_id,
    organizerName:
      row.organizer_name ||
      "Користувач ЯТУТ",
    organizerAvatar:
      row.organizer_avatar ||
      null,
    attendees:
      row.my_status ===
      "going"
        ? [
            "me",
          ]
        : [],
    interested:
      row.my_status ===
      "interested"
        ? [
            "me",
          ]
        : [],
    goingCount:
      Number(
        row.going_count ||
        0
      ),
    interestedCount:
      Number(
        row.interested_count ||
        0
      ),
    likes:
      Number(
        row.likes_count ||
        0
      ),
    liked:
      Boolean(
        row.liked
      ),
  };
}

export async function loadBackendEvents(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const rows =
    await rpc(
      session,
      "get_events_feed"
    );

  return (
    Array.isArray(rows)
      ? rows
      : []
  ).map(
    (row) =>
      mapEvent(
        row,
        session
      )
  );
}

export async function createBackendEvent(
  session,
  event,
  {
    publishToFeed = true,
    coverFile = null,
  } = {}
) {
  if (
    !session?.user?.id
  ) {
    return null;
  }

  const startsAt =
    new Date(
      `${event.date}T${event.time || "00:00"}:00`
    );

  const eventId =
    await rpc(
      session,
      "create_event",
      {
        event_title:
          event.title,
        event_description:
          event.description ||
          "",
        event_category:
          event.category ||
          "other",
        event_city:
          event.city ||
          null,
        event_place:
          event.place ||
          null,
        event_starts_at:
          startsAt.toISOString(),
        event_visibility:
          event.visibility ||
          (
            event.communityId
              ? "community"
              : "public"
          ),
        target_community_id:
          event.communityId ||
          null,
        publish_to_feed:
          Boolean(
            publishToFeed
          ),
      }
    );

  if (
    eventId &&
    coverFile
  ) {
    const uploaded =
      await uploadEventCover(
        session,
        eventId,
        coverFile
      );

    if (
      uploaded?.url
    ) {
      await rpc(
        session,
        "set_event_cover",
        {
          target_event_id:
            eventId,
          event_cover_url:
            uploaded.url,
        }
      );
    }
  }

  const events =
    await loadBackendEvents(
      session
    );

  return (
    events.find(
      (item) =>
        item.id ===
        eventId
    ) ||
    null
  );
}

export async function setBackendEventParticipation(
  session,
  eventId,
  status
) {
  await rpc(
    session,
    "set_event_participation",
    {
      target_event_id:
        eventId,
      participation_status:
        status ||
        null,
    }
  );
}

export async function toggleBackendEventLike(
  session,
  eventId
) {
  return Boolean(
    await rpc(
      session,
      "toggle_event_like",
      {
        target_event_id:
          eventId,
      }
    )
  );
}

export async function deleteBackendEvent(
  session,
  eventId
) {
  await rpc(
    session,
    "delete_event",
    {
      target_event_id:
        eventId,
    }
  );
}


export async function loadEventInviteCandidates(
  session,
  eventId
) {
  if (
    !session?.user?.id ||
    !eventId
  ) {
    return [];
  }

  const rows =
    await rpc(
      session,
      "get_event_invite_candidates",
      {
        target_event_id:
          eventId,
      }
    );

  return (
    Array.isArray(
      rows
    )
      ? rows
      : []
  ).map(
    (
      row
    ) => {
      const name =
        row.full_name ||
        row.username ||
        "Користувач";

      return {
        id:
          row.user_id,
        name,
        username:
          row.username ||
          "user",
        initials:
          name
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "?",
        avatar:
          row.avatar_url ||
          null,
        city:
          row.city ||
          "",
        inviteStatus:
          row.invite_status ||
          null,
      };
    }
  );
}

export async function inviteBackendEventFriends(
  session,
  eventId,
  personIds
) {
  if (
    !session?.user?.id ||
    !eventId
  ) {
    return 0;
  }

  return Number(
    await rpc(
      session,
      "invite_event_friends",
      {
        target_event_id:
          eventId,
        invitee_ids:
          Array.isArray(
            personIds
          )
            ? personIds
            : [],
      }
    ) ||
    0
  );
}
