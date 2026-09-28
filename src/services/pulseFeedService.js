import {
  loadPulseMedia,
} from "./pulseBackendService";

import {
  loadPulseWatchSignals,
} from "./pulseSocialService";

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

function watchSignalStrength(
  signal,
  video,
  {
    likedIds,
    savedIds,
    commentedIds,
  }
) {
  if (!signal) {
    return (
      (
        likedIds.has(
          video?.id
        )
          ? 7
          : 0
      ) +
      (
        savedIds.has(
          video?.id
        )
          ? 9
          : 0
      ) +
      (
        commentedIds.has(
          video?.id
        )
          ? 10
          : 0
      )
    );
  }

  const durationMs =
    Math.max(
      1000,
      Number(
        video?.durationSeconds ||
        0
      ) *
        1000
    );

  const maxWatchMs =
    Number(
      signal.maxWatchMs ||
      0
    );

  const watchRatio =
    durationMs >
    1000
      ? Math.min(
          1.25,
          maxWatchMs /
            durationMs
        )
      : Math.min(
          1,
          maxWatchMs /
            10000
        );

  return (
    Math.min(
      watchRatio *
        12,
      15
    ) +
    Math.min(
      Number(
        signal.completions ||
        0
      ) *
        8,
      24
    ) +
    Math.min(
      Number(
        signal.replays ||
        0
      ) *
        10,
      20
    ) +
    (
      likedIds.has(
        video?.id
      )
        ? 7
        : 0
    ) +
    (
      savedIds.has(
        video?.id
      )
        ? 9
        : 0
    ) +
    (
      commentedIds.has(
        video?.id
      )
        ? 10
        : 0
    ) -
    Math.min(
      Number(
        signal.quickSwipes ||
        0
      ) *
        5,
      15
    )
  );
}

function buildWatchAffinities(
  videos,
  signals
) {
  const byAuthor =
    new Map();

  const byKind =
    new Map();

  const perVideo =
    new Map();

  for (
    const video of
    videos ||
    []
  ) {
    const signal =
      signals.watchSignals.get(
        video.id
      );

    const strength =
      watchSignalStrength(
        signal,
        video,
        signals
      );

    if (
      strength <=
      0
    ) {
      continue;
    }

    perVideo.set(
      video.id,
      strength
    );

    const authorId =
      video?.author?.id;

    if (authorId) {
      byAuthor.set(
        authorId,
        (
          byAuthor.get(
            authorId
          ) ||
          0
        ) +
          strength
      );
    }

    const kind =
      video?.pulseKind ||
      video?.type ||
      "video";

    byKind.set(
      kind,
      (
        byKind.get(
          kind
        ) ||
        0
      ) +
        strength
    );
  }

  return {
    byAuthor,
    byKind,
    perVideo,
  };
}

function reasonFor(
  video,
  {
    followedAuthors,
    friendAuthors,
    viewedIds,
    currentCity,
  }
) {
  if (
    friendAuthors.has(
      video?.author?.id
    )
  ) {
    return "Твій друг";
  }

  if (
    currentCity &&
    String(
      video?.location?.name ||
      ""
    )
      .trim()
      .toLocaleLowerCase()
      .includes(
        currentCity
      )
  ) {
    return "Твоє місто";
  }

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
    friendAuthors,
    viewedIds,
    likedIds,
    savedIds,
    commentedIds,
    watchSignals,
    currentUserId,
    currentCity,
  } =
    signals;

  const watchAffinity =
    buildWatchAffinities(
      videos,
      signals
    );

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
          friendAuthors.has(
            authorId
          )
        ) {
          score +=
            58;
        }

        if (
          currentCity &&
          String(
            video?.location?.name ||
            ""
          )
            .trim()
            .toLocaleLowerCase()
            .includes(
              currentCity
            )
        ) {
          score +=
            24;
        }

        const watchSignal =
          watchSignals.get(
            video.id
          );

        const ownWatchStrength =
          watchAffinity.perVideo.get(
            video.id
          ) ||
          0;

        const authorAffinity =
          Math.max(
            0,
            (
              watchAffinity.byAuthor.get(
                authorId
              ) ||
              0
            ) -
              ownWatchStrength
          );

        const kindKey =
          video?.pulseKind ||
          video?.type ||
          "video";

        const kindAffinity =
          Math.max(
            0,
            (
              watchAffinity.byKind.get(
                kindKey
              ) ||
              0
            ) -
              ownWatchStrength
          );

        score +=
          Math.min(
            authorAffinity *
              0.42,
            28
          );

        score +=
          Math.min(
            kindAffinity *
              0.28,
            20
          );

        if (watchSignal) {
          score -=
            Math.min(
              18 +
                Number(
                  watchSignal.impressions ||
                  0
                ) *
                  6,
              48
            );

          score -=
            Math.min(
              Number(
                watchSignal.quickSwipes ||
                0
              ) *
                10,
              30
            );

          score +=
            Math.min(
              Number(
                watchSignal.replays ||
                0
              ) *
                3,
              6
            );
        } else if (
          viewedIds.has(
            video.id
          )
        ) {
          score -=
            24;
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
            6;
        }

        if (
          savedIds.has(
            video.id
          )
        ) {
          score -=
            4;
        }

        if (
          currentUserId &&
          authorId ===
            currentUserId
        ) {
          score -=
            18;
        }

        const behaviorReason =
          (
            authorAffinity >=
              14 ||
            kindAffinity >=
              18
          )
            ? "Схоже на те, що ти дивишся"
            : null;

        return {
          ...video,
          recommendationScore:
            Number(
              score.toFixed(
                3
              )
            ),
          recommendationReason:
            behaviorReason ||
            reasonFor(
              video,
              signals
            ),
          discovery:
            !currentUserId ||
            (
              authorId !==
                currentUserId &&
              !followedAuthors.has(
                authorId
              ) &&
              !friendAuthors.has(
                authorId
              )
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

  const remaining =
    [
      ...scored,
    ];

  const recentAuthors =
    [];

  while (
    remaining.length
  ) {
    const wantsDiscovery =
      result.length >
        0 &&
      result.length %
        4 ===
        3;

    const discoveryAvailable =
      wantsDiscovery &&
      remaining.some(
        (
          candidate
        ) =>
          candidate.discovery &&
          candidate.recommendationScore >=
            24
      );

    let bestIndex =
      0;

    let bestScore =
      -Infinity;

    for (
      let index =
        0;
      index <
      remaining.length;
      index +=
        1
    ) {
      const candidate =
        remaining[
          index
        ];

      if (
        discoveryAvailable &&
        !candidate.discovery
      ) {
        continue;
      }

      const recentCount =
        recentAuthors.filter(
          (
            authorId
          ) =>
            authorId &&
            authorId ===
              candidate?.author?.id
        ).length;

      const adjusted =
        candidate.recommendationScore -
        recentCount *
          22;

      if (
        adjusted >
        bestScore
      ) {
        bestScore =
          adjusted;

        bestIndex =
          index;
      }
    }

    const [
      chosen,
    ] =
      remaining.splice(
        bestIndex,
        1
      );

    result.push(
      chosen
    );

    recentAuthors.push(
      chosen?.author?.id ||
      null
    );

    if (
      recentAuthors.length >
      4
    ) {
      recentAuthors.shift();
    }
  }

  return result;
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
      friendAuthors:
        new Set(),
      viewedIds:
        new Set(),
      likedIds:
        new Set(),
      savedIds:
        new Set(),
      commentedIds:
        new Set(),
      watchSignals:
        new Map(),
      currentCity:
        "",
    };
  }

  const [
    followRows,
    friendshipRows,
    profileRows,
    viewRows,
    reactionRows,
    savedRows,
    commentRows,
    watchSignals,
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
        "friendships",
        {
          or:
            `(user_id.eq.${userId},friend_id.eq.${userId})`,
          select:
            "user_id,friend_id",
          limit:
            1000,
        }
      ),
      readRows(
        session,
        "profiles",
        {
          id:
            `eq.${userId}`,
          select:
            "id,city",
          limit:
            1,
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
      readRows(
        session,
        "pulse_comments",
        {
          author_id:
            `eq.${userId}`,
          select:
            "media_id",
          order:
            "created_at.desc",
          limit:
            500,
        }
      ),
      loadPulseWatchSignals(
        session
      ).catch(
        (
          error
        ) => {
          console.warn(
            "PULSE WATCH SIGNAL LOAD ERROR:",
            error
          );

          return new Map();
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
    friendAuthors:
      new Set(
        friendshipRows
          .map(
            (
              row
            ) =>
              row.user_id ===
              userId
                ? row.friend_id
                : row.user_id
          )
          .filter(
            Boolean
          )
      ),
    currentCity:
      String(
        profileRows?.[0]
          ?.city ||
        ""
      )
        .trim()
        .toLocaleLowerCase(),
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
    commentedIds:
      new Set(
        commentRows.map(
          (
            row
          ) =>
            row.media_id
        )
      ),
    watchSignals:
      watchSignals instanceof Map
        ? watchSignals
        : new Map(),
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

  const friends =
    forYou
      .filter(
        (
          video
        ) =>
          signals.friendAuthors.has(
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
            "Твій друг",
        })
      );

  const city =
    signals.currentCity
      ? forYou
          .filter(
            (
              video
            ) =>
              String(
                video?.location?.name ||
                ""
              )
                .trim()
                .toLocaleLowerCase()
                .includes(
                  signals.currentCity
                )
          )
          .map(
            (
              video
            ) => ({
              ...video,
              recommendationReason:
                "Твоє місто",
            })
          )
      : [];

  const nearby =
    city
      .slice(
        0,
        Math.max(
          12,
          Math.ceil(
            city.length *
            0.7
          )
        )
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
    friends,
    city,
    nearby,
    trending,
    followedAuthorIds:
      [
        ...signals.followedAuthors,
      ],
    friendAuthorIds:
      [
        ...signals.friendAuthors,
      ],
    currentCity:
      signals.currentCity,
  };
}
