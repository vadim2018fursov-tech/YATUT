const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

const FALLBACK_PULSE_THUMBNAIL =
  "/assets/yatut/cities/kyiv/hero.jpg";

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
      data?.error ||
      "Помилка PULSE."
    );
  }

  return data;
}

function formatDuration(
  seconds
) {
  const value =
    Math.max(
      0,
      Math.round(
        Number(
          seconds ||
          0
        )
      )
    );

  if (!value) {
    return null;
  }

  const minutes =
    Math.floor(
      value /
      60
    );

  const rest =
    value %
    60;

  return `${minutes}:${String(
    rest
  ).padStart(
    2,
    "0"
  )}`;
}

function isShortFormat(
  kind
) {
  return [
    "clip",
    "moment",
    "wave",
  ].includes(
    kind
  );
}

async function loadProfiles(
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

  if (!unique.length) {
    return new Map();
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

  url.searchParams.set(
    "select",
    "id,username,full_name,avatar_url,verified"
  );

  url.searchParams.set(
    "id",
    `in.(${unique.join(
      ","
    )})`
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

function mapPulseRow(
  row,
  profile = null
) {
  if (!row) {
    return null;
  }

  const username =
    profile?.username ||
    "yatut";

  const fullName =
    profile?.full_name ||
    username ||
    "Користувач";

  return {
    id:
      row.id,
    backend:
      true,
    pulseKind:
      row.kind,
    type:
      isShortFormat(
        row.kind
      )
        ? "clip"
        : "video",
    title:
      row.title ||
      (
        row.kind ===
          "clip"
          ? "Новий Clip"
          : row.kind ===
            "moment"
          ? "PULSE Момент"
          : row.kind ===
            "wave"
          ? "Хвиля PULSE"
          : "Нове відео"
      ),
    description:
      row.description ||
      "",
    videoUrl:
      row.media_url,
    video:
      row.media_url,
    mediaPath:
      row.media_path,
    mimeType:
      row.mime_type ||
      "video/mp4",
    thumbnail:
      row.thumbnail_url ||
      FALLBACK_PULSE_THUMBNAIL,
    thumbnailPath:
      row.thumbnail_path ||
      null,
    duration:
      formatDuration(
        row.trim_end_seconds &&
        row.trim_start_seconds !==
          null
          ? Number(
              row.trim_end_seconds
            ) -
            Number(
              row.trim_start_seconds ||
              0
            )
          : row.duration_seconds
      ),
    durationSeconds:
      Number(
        row.duration_seconds ||
        0
      ) ||
      null,
    trimStart:
      Number(
        row.trim_start_seconds ||
        0
      ) ||
      0,
    trimEnd:
      Number(
        row.trim_end_seconds ||
        0
      ) ||
      null,
    views:
      Number(
        row.views ||
        0
      ),
    likes:
      Number(
        row.likes_count ||
        0
      ),
    comments:
      Number(
        row.comments_count ||
        0
      ),
    shares:
      Number(
        row.shares_count ||
        0
      ),
    location:
      row.location_name
        ? {
            name:
              row.location_name,
          }
        : {
            name:
              "Україна",
          },
    author: {
      id:
        row.author_id,
      username,
      name:
        fullName,
      fullName,
      avatar:
        profile?.avatar_url ||
        null,
      verified:
        Boolean(
          profile?.verified
        ),
    },
    createdAt:
      row.created_at
        ? Date.parse(
            row.created_at
          )
        : Date.now(),
  };
}

export async function loadPulseMedia(
  session,
  {
    limit = 30,
    kind = null,
  } = {}
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/pulse_media`
    );

  url.searchParams.set(
    "select",
    "id,author_id,kind,title,description,media_url,media_path,thumbnail_url,thumbnail_path,mime_type,duration_seconds,trim_start_seconds,trim_end_seconds,location_name,visibility,views,likes_count,comments_count,shares_count,created_at,updated_at"
  );

  url.searchParams.set(
    "order",
    "created_at.desc"
  );

  url.searchParams.set(
    "limit",
    String(
      Math.max(
        1,
        Math.min(
          100,
          Number(
            limit ||
            30
          )
        )
      )
    )
  );

  if (
    [
      "clip",
      "video",
      "moment",
      "wave",
    ].includes(
      kind
    )
  ) {
    url.searchParams.set(
      "kind",
      `eq.${kind}`
    );
  }

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

  const list =
    Array.isArray(
      rows
    )
      ? rows
      : [];

  const profiles =
    await loadProfiles(
      session,
      list.map(
        (
          row
        ) =>
          row.author_id
      )
    );

  return list
    .map(
      (
        row
      ) =>
        mapPulseRow(
          row,
          profiles.get(
            row.author_id
          ) ||
            null
        )
    )
    .filter(
      Boolean
    );
}

export async function getPulseMediaById(
  session,
  mediaId
) {
  if (!mediaId) {
    return null;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/pulse_media`
    );

  url.searchParams.set(
    "select",
    "id,author_id,kind,title,description,media_url,media_path,thumbnail_url,thumbnail_path,mime_type,duration_seconds,trim_start_seconds,trim_end_seconds,location_name,visibility,views,likes_count,comments_count,shares_count,created_at,updated_at"
  );

  url.searchParams.set(
    "id",
    `eq.${mediaId}`
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
    await loadProfiles(
      session,
      [
        row.author_id,
      ]
    );

  return mapPulseRow(
    row,
    profiles.get(
      row.author_id
    ) ||
      null
  );
}

export async function createPulseMedia(
  session,
  {
    kind = "video",
    title = "",
    description = "",
    mediaUrl,
    mediaPath,
    thumbnailUrl = null,
    thumbnailPath = null,
    mimeType = "video/mp4",
    durationSeconds = null,
    trimStartSeconds = null,
    trimEndSeconds = null,
    locationName = null,
    visibility = "public",
  }
) {
  if (
    !session?.user?.id
  ) {
    throw new Error(
      "Потрібно увійти в акаунт."
    );
  }

  if (
    !mediaUrl ||
    !mediaPath
  ) {
    throw new Error(
      "Спочатку оберіть відео."
    );
  }

  const safeKind =
    [
      "clip",
      "video",
      "moment",
      "wave",
    ].includes(
      kind
    )
      ? kind
      : "video";

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/pulse_media`,
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
            kind:
              safeKind,
            title:
              String(
                title ||
                ""
              ).trim(),
            description:
              String(
                description ||
                ""
              ).trim(),
            media_url:
              mediaUrl,
            media_path:
              mediaPath,
            thumbnail_url:
              thumbnailUrl,
            thumbnail_path:
              thumbnailPath,
            mime_type:
              mimeType ||
              "video/mp4",
            duration_seconds:
              durationSeconds
                ? Math.round(
                    Number(
                      durationSeconds
                    )
                  )
                : null,
            trim_start_seconds:
              Number.isFinite(
                Number(
                  trimStartSeconds
                )
              )
                ? Math.max(
                    0,
                    Number(
                      trimStartSeconds
                    )
                  )
                : null,
            trim_end_seconds:
              Number.isFinite(
                Number(
                  trimEndSeconds
                )
              )
                ? Math.max(
                    0,
                    Number(
                      trimEndSeconds
                    )
                  )
                : null,
            location_name:
              String(
                locationName ||
                ""
              ).trim() ||
              null,
            visibility:
              [
                "public",
                "friends",
                "private",
              ].includes(
                visibility
              )
                ? visibility
                : "public",
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

  return getPulseMediaById(
    session,
    row.id
  );
}
