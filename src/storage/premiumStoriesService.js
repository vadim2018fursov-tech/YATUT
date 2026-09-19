const STORAGE_KEY =
  "yatut-premium-stories-v1";

const VIEWED_KEY =
  "yatut-premium-stories-viewed-v1";

const CHANGE_EVENT =
  "yatut:premium-stories-changed";

function createId(
  prefix = "story"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export function getDemoStories() {
  const now =
    Date.now();

  return [
    {
      id:
        "story-maria-1",

      authorId:
        "maria",

      authorName:
        "Марія",

      initials:
        "М",

      online:
        true,

      type:
        "image",

      media:
        "/assets/yatut/cities/kyiv/hero.jpg",

      text:
        "Вечірній Київ 💜",

      location:
        "Київ",

      createdAt:
        now -
        12 *
          60 *
          1000,

      expiresAt:
        now +
        23 *
          60 *
          60 *
          1000,
    },

    {
      id:
        "story-oleksandr-1",

      authorId:
        "oleksandr",

      authorName:
        "Олександр",

      initials:
        "О",

      online:
        true,

      type:
        "image",

      media:
        "/assets/yatut/cities/kyiv/city-card.jpg",

      text:
        "Місто сьогодні неймовірне",

      location:
        "Київ",

      createdAt:
        now -
        28 *
          60 *
          1000,

      expiresAt:
        now +
        22 *
          60 *
          60 *
          1000,
    },

    {
      id:
        "story-sofia-1",

      authorId:
        "sofia",

      authorName:
        "Софія",

      initials:
        "С",

      online:
        true,

      type:
        "text",

      text:
        "Хто сьогодні гуляє центром? ✨",

      background:
        "purple",

      location:
        "Київ",

      createdAt:
        now -
        49 *
          60 *
          1000,

      expiresAt:
        now +
        21 *
          60 *
          60 *
          1000,
    },

    {
      id:
        "story-yulia-1",

      authorId:
        "yulia",

      authorName:
        "Юлія",

      initials:
        "Ю",

      online:
        false,

      type:
        "image",

      media:
        "/assets/yatut/cities/kyiv/mini-banner.jpg",

      text:
        "Тут важливі люди 🤍",

      location:
        "Київ",

      createdAt:
        now -
        75 *
          60 *
          1000,

      expiresAt:
        now +
        20 *
          60 *
          60 *
          1000,
    },
  ];
}

export function loadStories() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    const stored =
      raw
        ? JSON.parse(raw)
        : [];

    const ownStories =
      Array.isArray(
        stored
      )
        ? stored.filter(
            (story) =>
              Number(
                story.expiresAt ||
                  0
              ) >
              Date.now()
          )
        : [];

    return [
      ...ownStories,
      ...getDemoStories(),
    ];
  } catch (
    error
  ) {
    console.warn(
      "STORIES LOAD ERROR:",
      error
    );

    return getDemoStories();
  }
}

export function saveOwnStories(
  stories
) {
  try {
    const ownStories =
      stories.filter(
        (story) =>
          story.authorId ===
          "me"
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        ownStories
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        CHANGE_EVENT
      )
    );
  } catch (
    error
  ) {
    console.warn(
      "STORIES SAVE ERROR:",
      error
    );
  }
}

export function createStory({
  type,
  media = null,
  text = "",
  background =
    "purple",
}) {
  const now =
    Date.now();

  return {
    id:
      createId(),

    authorId:
      "me",

    authorName:
      "Вадим",

    initials:
      "В",

    online:
      true,

    type,

    media,

    text:
      String(
        text || ""
      ).trim(),

    background,

    location:
      "Київ",

    createdAt:
      now,

    expiresAt:
      now +
      24 *
        60 *
        60 *
        1000,
  };
}

export function loadViewedStories() {
  try {
    const raw =
      localStorage.getItem(
        VIEWED_KEY
      );

    const parsed =
      raw
        ? JSON.parse(raw)
        : [];

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function markStoryViewed(
  storyId
) {
  try {
    const current =
      loadViewedStories();

    if (
      current.includes(
        storyId
      )
    ) {
      return;
    }

    localStorage.setItem(
      VIEWED_KEY,
      JSON.stringify([
        ...current,
        storyId,
      ])
    );

    window.dispatchEvent(
      new CustomEvent(
        CHANGE_EVENT
      )
    );
  } catch (
    error
  ) {
    console.warn(
      "STORY VIEW ERROR:",
      error
    );
  }
}

export function subscribeStories(
  callback
) {
  function handler() {
    callback?.(
      loadStories()
    );
  }

  window.addEventListener(
    CHANGE_EVENT,
    handler
  );

  window.addEventListener(
    "storage",
    handler
  );

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      handler
    );

    window.removeEventListener(
      "storage",
      handler
    );
  };
}