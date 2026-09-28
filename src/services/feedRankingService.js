const STOP_WORDS = new Set([
  "і","й","та","або","але","що","це","цей","ця","ці","для","про","від","до",
  "на","у","в","з","із","зі","по","ми","ви","вони","він","вона","воно","я",
  "ти","не","так","як","коли","де","тут","там","the","and","for","with","this",
  "that","you","your","are","was","were","have","has","from","into","about",
]);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9\s-]/gi, " ");
}

function tokenize(value) {
  return normalizeText(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 4 &&
        !STOP_WORDS.has(token)
    );
}

function viewerCommented(post, viewerId) {
  if (
    !viewerId ||
    !Array.isArray(post.comments)
  ) {
    return false;
  }

  return post.comments.some(
    (comment) =>
      comment.authorId === viewerId ||
      (
        Array.isArray(
          comment.replies
        ) &&
        comment.replies.some(
          (reply) =>
            reply.authorId ===
            viewerId
        )
      )
  );
}

function buildInterestTokens(posts, viewerId) {
  const weights = new Map();

  for (const post of posts) {
    let signal = 0;

    if (
      post.authorId === viewerId
    ) {
      signal += 2;
    }

    if (post.liked) {
      signal += 3;
    }

    if (
      post.savedForRanking
    ) {
      signal += 4;
    }

    if (
      viewerCommented(
        post,
        viewerId
      )
    ) {
      signal += 4;
    }

    if (!signal) continue;

    const tokens = tokenize(
      [
        post.text,
        post.location,
      ]
        .filter(Boolean)
        .join(" ")
    );

    for (const token of tokens) {
      weights.set(
        token,
        (weights.get(token) || 0) + signal
      );
    }
  }

  return new Set(
    [...weights.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 28)
      .map(([token]) => token)
  );
}

function postInterestScore(post, interestTokens) {
  if (!interestTokens.size) return 0;

  const tokens = new Set(
    tokenize(
      [
        post.text,
        post.location,
      ]
        .filter(Boolean)
        .join(" ")
    )
  );

  let matches = 0;

  for (const token of tokens) {
    if (interestTokens.has(token)) {
      matches += 1;
    }
  }

  return Math.min(matches * 5, 18);
}

function freshnessScore(createdAt, now) {
  const ageHours =
    Math.max(
      0,
      (now - Number(createdAt || 0)) /
        3600000
    );

  if (ageHours <= 2) return 32;
  if (ageHours <= 6) return 27;
  if (ageHours <= 12) return 23;
  if (ageHours <= 24) return 18;
  if (ageHours <= 48) return 12;
  if (ageHours <= 96) return 7;
  if (ageHours <= 168) return 3;

  return 0;
}

function engagementScore(post) {
  const likes =
    Number(post.likes || 0);

  const comments =
    Array.isArray(post.comments)
      ? post.comments.length
      : Number(post.comments || 0);

  const shares =
    Number(post.shares || 0);

  return Math.min(
    likes * 1.8 +
      comments * 3.6 +
      shares * 5.2,
    42
  );
}

function sameCity(post, viewerCity) {
  const city =
    String(viewerCity || "")
      .trim()
      .toLowerCase();

  if (!city) return false;

  return [
    post.authorCity,
    post.location,
  ].some((value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .includes(city)
  );
}

function recommendationReason({
  post,
  isFriend,
  isFollowing,
  isLocal,
  interest,
  engagement,
  freshness,
}) {
  if (post.own) return null;

  if (isFriend) {
    return "Від друга";
  }

  if (isFollowing) {
    return "Ви стежите";
  }

  if (isLocal) {
    return "Поруч із вами";
  }

  if (engagement >= 18) {
    return "Популярне зараз";
  }

  if (interest >= 5) {
    return "Схоже на ваші інтереси";
  }

  if (freshness >= 23) {
    return "Нове у ЯТУТ";
  }

  return null;
}

export function rankForYouFeed(
  posts,
  {
    viewerId = null,
    friendIds = new Set(),
    followingIds = new Set(),
    viewerCity = "",
    now = Date.now(),
  } = {}
) {
  const source =
    Array.isArray(posts)
      ? posts
      : [];

  const interestTokens =
    buildInterestTokens(
      source,
      viewerId
    );

  const scored =
    source.map((post, index) => {
      const isFriend =
        friendIds.has(
          post.authorId
        );

      const isFollowing =
        followingIds.has(
          post.authorId
        );

      const isLocal =
        sameCity(
          post,
          viewerCity
        );

      const freshness =
        freshnessScore(
          post.createdAt,
          now
        );

      const engagement =
        engagementScore(
          post
        );

      const interest =
        postInterestScore(
          post,
          interestTokens
        );

      let score =
        freshness +
        engagement +
        interest;

      if (post.own) {
        score += 16;
      }

      if (isFriend) {
        score += 30;
      }

      if (isFollowing) {
        score += 22;
      }

      if (isLocal) {
        score += 11;
      }

      if (post.media) {
        score += 3;
      }

      if (post.eventId) {
        score += 2;
      }

      if (
        post.liked ||
        post.savedForRanking ||
        viewerCommented(
          post,
          viewerId
        )
      ) {
        score -= 4;
      }

      return {
        post,
        baseIndex: index,
        score,
        reason:
          recommendationReason({
            post,
            isFriend,
            isFollowing,
            isLocal,
            interest,
            engagement,
            freshness,
          }),
      };
    });

  const remaining =
    [...scored];

  const result = [];
  const recentAuthors = [];

  while (remaining.length) {
    let bestIndex = 0;
    let bestScore =
      -Infinity;

    for (
      let index = 0;
      index < remaining.length;
      index += 1
    ) {
      const candidate =
        remaining[index];

      const recentCount =
        recentAuthors.filter(
          (authorId) =>
            authorId ===
            candidate.post.authorId
        ).length;

      const diversityPenalty =
        recentCount * 22;

      const adjusted =
        candidate.score -
        diversityPenalty;

      if (
        adjusted > bestScore ||
        (
          adjusted === bestScore &&
          candidate.baseIndex <
            remaining[bestIndex].baseIndex
        )
      ) {
        bestScore =
          adjusted;
        bestIndex =
          index;
      }
    }

    const [chosen] =
      remaining.splice(
        bestIndex,
        1
      );

    result.push({
      ...chosen.post,
      recommendationScore:
        Math.round(
          chosen.score
        ),
      recommendationReason:
        chosen.reason,
    });

    recentAuthors.push(
      chosen.post.authorId
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
