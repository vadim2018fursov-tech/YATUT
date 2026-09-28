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
    const error =
      new Error(
        data?.message ||
        data?.hint ||
        data?.details ||
        data?.error ||
        "Feed signal request failed."
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

export async function loadFeedPostSignals(
  session
) {
  if (
    !session?.user?.id
  ) {
    return new Map();
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/feed_post_signals`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "select",
    "post_id,impressions,total_dwell_ms,max_dwell_ms,quick_skips,engaged_views,last_seen_at"
  );

  url.searchParams.set(
    "order",
    "last_seen_at.desc.nullslast"
  );

  url.searchParams.set(
    "limit",
    "1500"
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
      Array.isArray(rows)
        ? rows
        : []
    ).map(
      (
        row
      ) => [
        row.post_id,
        {
          impressions:
            Number(
              row.impressions ||
              0
            ),
          totalDwellMs:
            Number(
              row.total_dwell_ms ||
              0
            ),
          maxDwellMs:
            Number(
              row.max_dwell_ms ||
              0
            ),
          quickSkips:
            Number(
              row.quick_skips ||
              0
            ),
          engagedViews:
            Number(
              row.engaged_views ||
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

export async function recordFeedPostSignal(
  session,
  {
    postId,
    dwellMs = 0,
    impression = false,
    quickSkip = false,
    engaged = false,
  }
) {
  if (
    !session?.user?.id ||
    !postId
  ) {
    return null;
  }

  const safeDwell =
    Math.max(
      0,
      Math.min(
        60000,
        Math.round(
          Number(
            dwellMs ||
            0
          )
        )
      )
    );

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/record_feed_post_signal`,
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
            dwell_delta_ms:
              safeDwell,
            impression_delta:
              impression
                ? 1
                : 0,
            quick_skip_delta:
              quickSkip
                ? 1
                : 0,
            engaged_view_delta:
              engaged
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
    totalDwellMs:
      Number(
        row.total_dwell_ms ||
        0
      ),
    maxDwellMs:
      Number(
        row.max_dwell_ms ||
        0
      ),
    quickSkips:
      Number(
        row.quick_skips ||
        0
      ),
    engagedViews:
      Number(
        row.engaged_views ||
        0
      ),
    lastSeenAt:
      row.last_seen_at ||
      null,
  };
}
