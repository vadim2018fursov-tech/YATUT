import {
  loadPulseMedia,
} from "./pulseBackendService";

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
      `Bearer ${
        session?.access_token ||
        SUPABASE_KEY
      }`,
    "Content-Type":
      "application/json",
  };
}

async function readRows(
  session,
  table,
  params = {}
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/${table}`
    );

  Object.entries(
    params
  ).forEach(
    ([
      key,
      value,
    ]) => {
      if (
        value !==
          null &&
        value !==
          undefined
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

  if (!response.ok) {
    throw new Error(
      `PULSE feed request failed: ${response.status}`
    );
  }

  const data =
    await response.json();

  return Array.isArray(
    data
  )
    ? data
    : [];
}

function stableNoise(
  value
) {
  const text =
    String(
      value ||
      ""
    );

  let hash =
    0;

  for (
    let index =
      0;
    index <
    text.length;
    index +=
      1
  ) {
    hash =
      (
        (
          hash *
          31
        ) +
        text.charCodeAt(
          index
        )
      ) >>>
      0;
  }

  return (
    hash %
    1000
  ) /
    1000;
}

function freshnessScore(
  createdAt
) {
  const ageHours =
    Math.max(
      0,
      (
        Date.now() -
        Number(
          createdAt ||
          Date.now()
        )
      ) /
        3600000
    );

  return (
    85 *
    Math.exp(
      -ageHours /
        42
    )
  );
}

function engagementScore(
  video
) {
  const views =
    Number(
      video?.views ||
      0
    );

  const likes =
    Number(
      video?.likes ||
      0
    );

  const comments =
    Number(
      video?.comments ||
      0
    );

  const saves =
    Number(
      video?.saves ||
      0
    );

  const shares =
    Number(
      video?.shares ||
      0
    );

  const weighted =
    views *
      0.16 +
    likes *
      3.2 +
    comments *
      5.6 +
    saves *
      6.4 +
    shares *
      7.5;

  return (
    Math.log1p(
      weighted
    ) *
    11
  );
}

function reasonFor(
  video,
  {
    followedAuthors,
    viewedIds,
  }
) {
  if (
    followedAuthors.has(
      video?.author?.id
    )
  ) {
    return "Ви підписані";
  }

  if (
    !viewedIds.has(
      video?.id
    )
  ) {
    const ageHours =
      (
        Date.now() -
        Number(
          video?.createdAt ||
          0
        )
      ) /
      3600000;

    if (
      ageHours <=
      24
    ) {
      return "Нове у PULSE";
    }
  }

  const activity =
    Number(
      video?.likes ||
      0
    ) +
    Number(
      video?.comments ||
      0
    ) *
      2 +
    Number(
      video?.saves ||
      0
    ) *
      2 +
    Number(
      video?.shares ||
      0
    ) *
      3;

  if (
    activity >
    0
  ) {
    return "Набирає зараз";
  }

  return "Відкрий нового автора";
}

function rankForYou(
  videos,
  signals
) {
  const {
    followedAuthors,
    viewedIds,
    likedIds,
    savedIds,
    currentUserId,
  } =
    signals;

  const scored =
    (
      videos ||
      []
    ).map(
      (
        video
      ) => {
        const authorId =
          video?.author?.id;

        let score =
          freshnessScore(
            video.createdAt
          ) +
          engagementScore(
            video
          ) +
          stableNoise(
            video.id
          ) *
            6;

        if (
          followedAuthors.has(
            authorId
          )
        ) {
          score +=
            42;
        }

        if (
          viewedIds.has(
            video.id
          )
        ) {
          score -=
            36;
        } else {
          score +=
            18;
        }

        if (
          likedIds.has(
            video.id
          )
        ) {
          score -=
            8;
        }

        if (
          savedIds.has(
            video.id
          )
        ) {
          score -=
            5;
        }

        if (
          currentUserId &&
          authorId ===
            currentUserId
        ) {
          score -=
            18;
        }

        return {
          ...video,
          recommendationScore:
            Number(
              score.toFixed(
                3
              )
            ),
          recommendationReason:
            reasonFor(
              video,
              signals
            ),
        };
      }
    )
      .sort(
        (
          first,
          second
        ) =>
          second.recommendationScore -
          first.recommendationScore
      );

  const result =
    [];

  const deferred =
    [];

  scored.forEach(
    (
      video
    ) => {
      const previous =
        result[
          result.length -
          1
        ];

      const beforePrevious =
        result[
          result.length -
          2
        ];

      const repeatsAuthor =
        previous?.author?.id &&
        beforePrevious?.author?.id &&
        previous.author.id ===
          video.author?.id &&
        beforePrevious.author.id ===
          video.author?.id;

      if (
        repeatsAuthor
      ) {
        deferred.push(
          video
        );
      } else {
        result.push(
          video
        );
      }
    }
  );

  return [
    ...result,
    ...deferred,
  ];
}

async function loadSignals(
  session
) {
  const userId =
    session?.user?.id ||
    null;

  if (!userId) {
    return {
      currentUserId:
        null,
      followedAuthors:
        new Set(),
      viewedIds:
        new Set(),
      likedIds:
        new Set(),
      savedIds:
        new Set(),
    };
  }

  const [
    followRows,
    viewRows,
    reactionRows,
    savedRows,
  ] =
    await Promise.all([
      readRows(
        session,
        "follows",
        {
          follower_id:
            `eq.${userId}`,
          select:
            "following_id",
          limit:
            1000,
        }
      ),
      readRows(
        session,
        "pulse_views",
        {
          user_id:
            `eq.${userId}`,
          select:
            "media_id",
          order:
            "viewed_at.desc",
          limit:
            500,
        }
      ),
      readRows(
        session,
        "pulse_reactions",
        {
          user_id:
            `eq.${userId}`,
          select:
            "media_id",
          order:
            "created_at.desc",
          limit:
            500,
        }
      ),
      readRows(
        session,
        "saved_items",
        {
          user_id:
            `eq.${userId}`,
          item_type:
            "eq.pulse",
          select:
            "source_id",
          order:
            "updated_at.desc",
          limit:
            500,
        }
      ),
    ]);

  return {
    currentUserId:
      userId,
    followedAuthors:
      new Set(
        followRows.map(
          (
            row
          ) =>
            row.following_id
        )
      ),
    viewedIds:
      new Set(
        viewRows.map(
          (
            row
          ) =>
            row.media_id
        )
      ),
    likedIds:
      new Set(
        reactionRows.map(
          (
            row
          ) =>
            row.media_id
        )
      ),
    savedIds:
      new Set(
        savedRows.map(
          (
            row
          ) =>
            row.source_id
        )
      ),
  };
}

export async function loadRankedPulseFeeds(
  session,
  {
    limit = 80,
  } = {}
) {
  const [
    videos,
    signals,
  ] =
    await Promise.all([
      loadPulseMedia(
        session,
        {
          limit:
            Math.max(
              20,
              Math.min(
                100,
                Number(
                  limit ||
                  80
                )
              )
            ),
        }
      ),
      loadSignals(
        session
      ),
    ]);

  const forYou =
    rankForYou(
      videos,
      signals
    );

  const following =
    forYou
      .filter(
        (
          video
        ) =>
          signals.followedAuthors.has(
            video?.author?.id
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          Number(
            second.createdAt ||
            0
          ) -
          Number(
            first.createdAt ||
            0
          )
      )
      .map(
        (
          video
        ) => ({
          ...video,
          recommendationReason:
            "Ви підписані",
        })
      );

  const trending =
    [
      ...videos,
    ]
      .sort(
        (
          first,
          second
        ) => {
          const score =
            (
              engagementScore(
                second
              ) +
              freshnessScore(
                second.createdAt
              ) *
                0.42
            ) -
            (
              engagementScore(
                first
              ) +
              freshnessScore(
                first.createdAt
              ) *
                0.42
            );

          return score;
        }
      )
      .map(
        (
          video
        ) => ({
          ...video,
          recommendationReason:
            "Набирає зараз",
        })
      );

  return {
    all:
      videos,
    forYou,
    following,
    trending,
    followedAuthorIds:
      [
        ...signals.followedAuthors,
      ],
  };
}
