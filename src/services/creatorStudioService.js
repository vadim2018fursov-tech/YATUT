import {
  loadPulseMedia,
} from "./pulseBackendService";

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
      "Creator Studio request failed."
    );
  }

  return data;
}

function isoDate(
  date
) {
  return date
    .toISOString()
    .slice(
      0,
      10
    );
}

function dateDaysAgo(
  days
) {
  const date =
    new Date();

  date.setHours(
    0,
    0,
    0,
    0
  );

  date.setDate(
    date.getDate() -
    days
  );

  return date;
}

function normalizeMetricRow(
  row
) {
  return {
    day:
      row.day,
    views:
      Number(
        row.views ||
        0
      ),
    likes:
      Number(
        row.likes ||
        0
      ),
    comments:
      Number(
        row.comments ||
        0
      ),
    saves:
      Number(
        row.saves ||
        0
      ),
    shares:
      Number(
        row.shares ||
        0
      ),
  };
}

function sumRows(
  rows
) {
  return (
    rows ||
    []
  ).reduce(
    (
      total,
      row
    ) => ({
      views:
        total.views +
        Number(
          row.views ||
          0
        ),
      likes:
        total.likes +
        Number(
          row.likes ||
          0
        ),
      comments:
        total.comments +
        Number(
          row.comments ||
          0
        ),
      saves:
        total.saves +
        Number(
          row.saves ||
          0
        ),
      shares:
        total.shares +
        Number(
          row.shares ||
          0
        ),
    }),
    {
      views:
        0,
      likes:
        0,
      comments:
        0,
      saves:
        0,
      shares:
        0,
    }
  );
}

function percentChange(
  current,
  previous
) {
  const now =
    Number(
      current ||
      0
    );

  const before =
    Number(
      previous ||
      0
    );

  if (
    before <=
    0
  ) {
    return now >
      0
      ? 100
      : 0;
  }

  return Math.round(
    (
      (
        now -
        before
      ) /
      before
    ) *
      100
  );
}

async function loadDailyMetrics(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/pulse_creator_daily_metrics`
    );

  url.searchParams.set(
    "author_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "day",
    `gte.${isoDate(
      dateDaysAgo(
        55
      )
    )}`
  );

  url.searchParams.set(
    "select",
    "author_id,day,views,likes,comments,saves,shares"
  );

  url.searchParams.set(
    "order",
    "day.asc"
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
    normalizeMetricRow
  );
}

async function loadFollowersCount(
  session
) {
  if (
    !session?.user?.id
  ) {
    return 0;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/follows`
    );

  url.searchParams.set(
    "following_id",
    `eq.${session.user.id}`
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

  const range =
    response.headers.get(
      "content-range"
    ) ||
    "";

  const total =
    Number(
      range.split(
        "/"
      )[1]
    );

  return Number.isFinite(
    total
  )
    ? total
    : 0;
}

function chartForLast28Days(
  rows
) {
  const byDay =
    new Map(
      (
        rows ||
        []
      ).map(
        (
          row
        ) => [
          row.day,
          row,
        ]
      )
    );

  const result =
    [];

  for (
    let offset =
      27;
    offset >=
    0;
    offset -=
      1
  ) {
    const date =
      dateDaysAgo(
        offset
      );

    const key =
      isoDate(
        date
      );

    const row =
      byDay.get(
        key
      );

    result.push({
      day:
        key,
      label:
        date.toLocaleDateString(
          "uk-UA",
          {
            day:
              "numeric",
            month:
              "short",
          }
        ),
      views:
        Number(
          row?.views ||
          0
        ),
      likes:
        Number(
          row?.likes ||
          0
        ),
      comments:
        Number(
          row?.comments ||
          0
        ),
      saves:
        Number(
          row?.saves ||
          0
        ),
      shares:
        Number(
          row?.shares ||
          0
        ),
    });
  }

  return result;
}

export async function loadCreatorStudioData(
  session
) {
  if (
    !session?.user?.id
  ) {
    return {
      videos:
        [],
      followersCount:
        0,
      daily:
        [],
      current28:
        sumRows(
          []
        ),
      previous28:
        sumRows(
          []
        ),
      changes:
        {},
      cumulative:
        sumRows(
          []
        ),
      today:
        sumRows(
          []
        ),
    };
  }

  const [
    videos,
    metrics,
    followersCount,
  ] =
    await Promise.all([
      loadPulseMedia(
        session,
        {
          limit:
            100,
          authorId:
            session.user.id,
        }
      ),
      loadDailyMetrics(
        session
      ),
      loadFollowersCount(
        session
      ),
    ]);

  const boundary =
    isoDate(
      dateDaysAgo(
        27
      )
    );

  const previousBoundary =
    isoDate(
      dateDaysAgo(
        55
      )
    );

  const currentRows =
    metrics.filter(
      (
        row
      ) =>
        row.day >=
        boundary
    );

  const previousRows =
    metrics.filter(
      (
        row
      ) =>
        row.day >=
          previousBoundary &&
        row.day <
          boundary
    );

  const current28 =
    sumRows(
      currentRows
    );

  const previous28 =
    sumRows(
      previousRows
    );

  const cumulative =
    (
      videos ||
      []
    ).reduce(
      (
        total,
        video
      ) => ({
        views:
          total.views +
          Number(
            video.views ||
            0
          ),
        likes:
          total.likes +
          Number(
            video.likes ||
            0
          ),
        comments:
          total.comments +
          Number(
            video.comments ||
            0
          ),
        saves:
          total.saves +
          Number(
            video.saves ||
            0
          ),
        shares:
          total.shares +
          Number(
            video.shares ||
            0
          ),
      }),
      {
        views:
          0,
        likes:
          0,
        comments:
          0,
        saves:
          0,
        shares:
          0,
      }
    );

  const todayKey =
    isoDate(
      new Date()
    );

  const today =
    sumRows(
      metrics.filter(
        (
          row
        ) =>
          row.day ===
          todayKey
      )
    );

  const changes = {
    views:
      percentChange(
        current28.views,
        previous28.views
      ),
    likes:
      percentChange(
        current28.likes,
        previous28.likes
      ),
    comments:
      percentChange(
        current28.comments,
        previous28.comments
      ),
    saves:
      percentChange(
        current28.saves,
        previous28.saves
      ),
    shares:
      percentChange(
        current28.shares,
        previous28.shares
      ),
  };

  return {
    videos,
    followersCount,
    daily:
      chartForLast28Days(
        metrics
      ),
    current28,
    previous28,
    changes,
    cumulative,
    today,
  };
}
