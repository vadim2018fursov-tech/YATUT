const STORAGE_KEY =
  "yatut-premium-feed-v1";

export function loadPremiumFeed(
  fallbackPosts = []
) {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return fallbackPosts;
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return fallbackPosts;
    }

    return parsed;
  } catch (
    error
  ) {
    console.warn(
      "PREMIUM FEED LOAD ERROR:",
      error
    );

    return fallbackPosts;
  }
}

export function savePremiumFeed(
  posts
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        posts
      )
    );
  } catch (
    error
  ) {
    console.warn(
      "PREMIUM FEED SAVE ERROR:",
      error
    );
  }
}

export function createPremiumPost({
  text = "",
  images = [],
  video = null,
  location = "",
  mood = "",
  taggedPeople = [],
  audience = "public",
}) {
  const now =
    Date.now();

  return {
    id:
      `premium-post-${now}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    authorId:
      "me",

    authorName:
      "Вадим",

    initials:
      "В",

    verified:
      false,

    time:
      "щойно",

    createdAt:
      now,

    text:
      String(
        text || ""
      ).trim(),

    /*
      Здесь уже НЕ Base64.
      Только metadata IndexedDB.
    */
    images:
      Array.isArray(
        images
      )
        ? images
        : [],

    video:
      video ||
      null,

    location:
      String(
        location || ""
      ).trim(),

    mood:
      String(
        mood || ""
      ),

    taggedPeople:
      Array.isArray(
        taggedPeople
      )
        ? taggedPeople
        : [],

    audience,

    likes:
      0,

    comments:
      0,

    shares:
      0,

    liked:
      false,

    saved:
      false,

    myReaction:
      null,

    reactionCounts: {
      fire: 0,
      important: 0,
      support: 0,
      heart: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
    },

    commentItems:
      [],

    hidden:
      false,

    reported:
      false,
  };
}