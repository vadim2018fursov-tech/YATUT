/* =========================================================
   YATUT SAVED SERVICE V1
   Єдина система "Збережене" для всього ЯТУТ

   Підтримує:
   - posts
   - events
   - communities / spaces
   - places
   - businesses
   - media
   - profiles
   - custom items

   Local-first:
   localStorage

   Sync:
   CustomEvent між усіма компонентами ЯТУТ
========================================================= */

const STORAGE_KEY =
  "yatut-saved-v1";

const SAVED_EVENT =
  "yatut:saved-changed";

/* =========================================================
   TYPES
========================================================= */

export const SAVED_TYPES = {
  POST: "post",

  EVENT: "event",

  COMMUNITY:
    "community",

  SPACE: "space",

  PLACE: "place",

  BUSINESS:
    "business",

  PROFILE:
    "profile",

  PHOTO: "photo",

  VIDEO: "video",

  ARTICLE: "article",

  OTHER: "other",
};

/* =========================================================
   HELPERS
========================================================= */

function now() {
  return Date.now();
}

function createSavedId(
  type,
  sourceId
) {
  return `${type}:${String(
    sourceId
  )}`;
}

function safeString(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}

function safeNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

function safeArray(
  value
) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}

function clone(
  value
) {
  try {
    return JSON.parse(
      JSON.stringify(
        value
      )
    );
  } catch {
    return value;
  }
}

/* =========================================================
   NORMALIZE TYPE
========================================================= */

function normalizeType(
  type
) {
  const value =
    safeString(
      type,
      SAVED_TYPES.OTHER
    )
      .trim()
      .toLowerCase();

  const allowed =
    Object.values(
      SAVED_TYPES
    );

  if (
    allowed.includes(
      value
    )
  ) {
    return value;
  }

  return SAVED_TYPES.OTHER;
}

/* =========================================================
   NORMALIZE ITEM

   Приклад:
   {
     type: "business",
     sourceId: "business-123",
     title: "My Company"
   }
========================================================= */

export function normalizeSavedItem(
  input = {}
) {
  const type =
    normalizeType(
      input.type
    );

  const sourceId =
    safeString(
      input.sourceId ??
        input.entityId ??
        input.objectId ??
        input.id
    ).trim();

  if (!sourceId) {
    throw new Error(
      "[savedService] sourceId is required"
    );
  }

  const savedId =
    createSavedId(
      type,
      sourceId
    );

  const savedAt =
    safeNumber(
      input.savedAt,
      now()
    );

  return {
    /* =====================================================
       SAVED ID
    ===================================================== */

    id: savedId,

    /* =====================================================
       SOURCE
    ===================================================== */

    sourceId,

    type,

    source:
      safeString(
        input.source,
        type
      ),

    /* =====================================================
       CONTENT
    ===================================================== */

    title:
      safeString(
        input.title,
        "Збережений матеріал"
      ),

    subtitle:
      safeString(
        input.subtitle
      ),

    description:
      safeString(
        input.description ??
          input.text
      ),

    text:
      safeString(
        input.text ??
          input.description
      ),

    /* =====================================================
       MEDIA
    ===================================================== */

    image:
      input.image ??
      input.imageUrl ??
      input.cover ??
      input.coverUrl ??
      null,

    imageUrl:
      input.imageUrl ??
      input.image ??
      input.cover ??
      input.coverUrl ??
      null,

    cover:
      input.cover ??
      input.coverUrl ??
      input.image ??
      input.imageUrl ??
      null,

    mediaType:
      input.mediaType ??
      null,

    /* =====================================================
       ROUTING
    ===================================================== */

    route:
      input.route ??
      null,

    routePayload:
      input.routePayload ??
      null,

    /* =====================================================
       AUTHOR / OWNER
    ===================================================== */

    author:
      input.author
        ? clone(
            input.author
          )
        : null,

    owner:
      input.owner
        ? clone(
            input.owner
          )
        : null,

    /* =====================================================
       META
    ===================================================== */

    category:
      safeString(
        input.category
      ),

    city:
      safeString(
        input.city
      ),

    location:
      safeString(
        input.location
      ),

    distance:
      input.distance ??
      null,

    date:
      input.date ??
      null,

    time:
      input.time ??
      null,

    members:
      input.members ??
      null,

    rating:
      input.rating ??
      null,

    verified:
      Boolean(
        input.verified
      ),

    /* =====================================================
       TIMESTAMPS
    ===================================================== */

    createdAt:
      safeNumber(
        input.createdAt,
        savedAt
      ),

    updatedAt:
      safeNumber(
        input.updatedAt,
        savedAt
      ),

    savedAt,

    /* =====================================================
       ORIGINAL SNAPSHOT

       Сохраняем данные объекта.
       Это позволит Saved.jsx показать карточку даже если
       исходный раздел сейчас не открыт.
    ===================================================== */

    data:
      input.data
        ? clone(
            input.data
          )
        : null,
  };
}

/* =========================================================
   STORAGE READ
========================================================= */

function readStorage() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed
      .filter(Boolean)
      .map(
        (item) => {
          try {
            return normalizeSavedItem(
              item
            );
          } catch {
            return null;
          }
        }
      )
      .filter(Boolean);
  } catch (error) {
    console.warn(
      "[savedService] read error:",
      error
    );

    return [];
  }
}

/* =========================================================
   STORAGE WRITE
========================================================= */

function writeStorage(
  items
) {
  const normalized =
    safeArray(items);

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );
  } catch (error) {
    console.error(
      "[savedService] write error:",
      error
    );

    return false;
  }

  emitSavedChange(
    normalized
  );

  return true;
}

/* =========================================================
   EVENT
========================================================= */

function emitSavedChange(
  items
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      SAVED_EVENT,
      {
        detail: {
          items:
            clone(
              items
            ),

          count:
            items.length,

          updatedAt:
            now(),
        },
      }
    )
  );
}

/* =========================================================
   REPLACE SNAPSHOT

   Використовується backend-sync шаром, щоб локальний кеш
   точно відповідав поточному акаунту.
========================================================= */

export function replaceSavedItems(
  items = []
) {
  const normalized =
    safeArray(
      items
    )
      .map(
        (
          item
        ) => {
          try {
            return normalizeSavedItem(
              item
            );
          } catch {
            return null;
          }
        }
      )
      .filter(
        Boolean
      );

  writeStorage(
    normalized
  );

  return normalized;
}

/* =========================================================
   GET ALL
========================================================= */

export function getSavedItems() {
  return readStorage()
    .sort(
      (
        a,
        b
      ) =>
        Number(
          b.savedAt ||
            0
        ) -
        Number(
          a.savedAt ||
            0
        )
    );
}

/* =========================================================
   GET BY TYPE
========================================================= */

export function getSavedByType(
  type
) {
  const normalizedType =
    normalizeType(
      type
    );

  return getSavedItems().filter(
    (item) =>
      item.type ===
      normalizedType
  );
}

/* =========================================================
   GET ONE
========================================================= */

export function getSavedItem(
  type,
  sourceId
) {
  const id =
    createSavedId(
      normalizeType(
        type
      ),
      sourceId
    );

  return (
    getSavedItems().find(
      (item) =>
        item.id ===
        id
    ) || null
  );
}

/* =========================================================
   IS SAVED
========================================================= */

export function isSaved(
  type,
  sourceId
) {
  if (
    sourceId ===
      null ||
    sourceId ===
      undefined
  ) {
    return false;
  }

  const id =
    createSavedId(
      normalizeType(
        type
      ),
      sourceId
    );

  return getSavedItems().some(
    (item) =>
      item.id ===
      id
  );
}

/* =========================================================
   SAVE ITEM
========================================================= */

export function saveItem(
  input
) {
  const item =
    normalizeSavedItem(
      input
    );

  const items =
    getSavedItems();

  const index =
    items.findIndex(
      (saved) =>
        saved.id ===
        item.id
    );

  if (
    index >= 0
  ) {
    /*
      Объект уже сохранён.

      Обновляем данные,
      но сохраняем исходный savedAt,
      чтобы порядок списка не прыгал.
    */

    const previous =
      items[index];

    items[index] = {
      ...previous,
      ...item,

      savedAt:
        previous.savedAt,

      updatedAt:
        now(),
    };
  } else {
    items.unshift({
      ...item,

      savedAt:
        now(),

      updatedAt:
        now(),
    });
  }

  writeStorage(
    items
  );

  return (
    items.find(
      (saved) =>
        saved.id ===
        item.id
    ) || item
  );
}

/* =========================================================
   REMOVE ITEM
========================================================= */

export function removeSavedItem(
  type,
  sourceId
) {
  const id =
    createSavedId(
      normalizeType(
        type
      ),
      sourceId
    );

  const items =
    getSavedItems();

  const next =
    items.filter(
      (item) =>
        item.id !==
        id
    );

  if (
    next.length ===
    items.length
  ) {
    return false;
  }

  writeStorage(
    next
  );

  return true;
}

/* =========================================================
   REMOVE BY SAVED ID
========================================================= */

export function removeSavedById(
  savedId
) {
  const items =
    getSavedItems();

  const next =
    items.filter(
      (item) =>
        item.id !==
        savedId
    );

  if (
    next.length ===
    items.length
  ) {
    return false;
  }

  writeStorage(
    next
  );

  return true;
}

/* =========================================================
   TOGGLE
========================================================= */

export function toggleSaved(
  input
) {
  const item =
    normalizeSavedItem(
      input
    );

  if (
    isSaved(
      item.type,
      item.sourceId
    )
  ) {
    removeSavedItem(
      item.type,
      item.sourceId
    );

    return {
      saved: false,

      item: null,
    };
  }

  const saved =
    saveItem(
      item
    );

  return {
    saved: true,

    item: saved,
  };
}

/* =========================================================
   UPDATE SAVED ITEM

   Используем, если изменилось:
   - название бизнеса
   - обложка
   - название события
   - текст поста
   и т.д.
========================================================= */

export function updateSavedItem(
  type,
  sourceId,
  patch = {}
) {
  const current =
    getSavedItem(
      type,
      sourceId
    );

  if (!current) {
    return null;
  }

  const updated =
    normalizeSavedItem({
      ...current,
      ...patch,

      type:
        current.type,

      sourceId:
        current.sourceId,

      savedAt:
        current.savedAt,

      updatedAt:
        now(),
    });

  const items =
    getSavedItems().map(
      (item) =>
        item.id ===
        current.id
          ? updated
          : item
    );

  writeStorage(
    items
  );

  return updated;
}

/* =========================================================
   CLEAR ALL
========================================================= */

export function clearSavedItems() {
  writeStorage([]);

  return true;
}

/* =========================================================
   CLEAR BY TYPE
========================================================= */

export function clearSavedByType(
  type
) {
  const normalizedType =
    normalizeType(
      type
    );

  const items =
    getSavedItems();

  const next =
    items.filter(
      (item) =>
        item.type !==
        normalizedType
    );

  writeStorage(
    next
  );

  return true;
}

/* =========================================================
   COUNT
========================================================= */

export function getSavedCount(
  type = null
) {
  if (!type) {
    return getSavedItems()
      .length;
  }

  return getSavedByType(
    type
  ).length;
}

/* =========================================================
   SEARCH
========================================================= */

export function searchSavedItems(
  search = "",
  type = null
) {
  const query =
    safeString(search)
      .trim()
      .toLowerCase();

  let items =
    type &&
    type !== "all"
      ? getSavedByType(
          type
        )
      : getSavedItems();

  if (!query) {
    return items;
  }

  items =
    items.filter(
      (item) => {
        const haystack =
          [
            item.title,
            item.subtitle,
            item.description,
            item.text,
            item.category,
            item.city,
            item.location,
            item.author?.name,
            item.owner?.name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(
          query
        );
      }
    );

  return items;
}

/* =========================================================
   SUBSCRIBE

   Использование:

   useEffect(() => {
     return subscribeSavedItems((items) => {
       setItems(items);
     });
   }, []);
========================================================= */

export function subscribeSavedItems(
  callback
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {};
  }

  if (
    typeof callback !==
    "function"
  ) {
    return () => {};
  }

  function handleCustomEvent(
    event
  ) {
    const items =
      event?.detail?.items;

    if (
      Array.isArray(
        items
      )
    ) {
      callback(
        clone(
          items
        )
      );

      return;
    }

    callback(
      getSavedItems()
    );
  }

  /*
    storage event нужен,
    если позже ЯТУТ открыт в нескольких вкладках.
  */

  function handleStorage(
    event
  ) {
    if (
      event.key !==
      STORAGE_KEY
    ) {
      return;
    }

    callback(
      getSavedItems()
    );
  }

  window.addEventListener(
    SAVED_EVENT,
    handleCustomEvent
  );

  window.addEventListener(
    "storage",
    handleStorage
  );

  return () => {
    window.removeEventListener(
      SAVED_EVENT,
      handleCustomEvent
    );

    window.removeEventListener(
      "storage",
      handleStorage
    );
  };
}

/* =========================================================
   CREATE HELPERS
========================================================= */

/* =========================================================
   POST
========================================================= */

export function createSavedPost(
  post
) {
  return normalizeSavedItem({
    type:
      SAVED_TYPES.POST,

    sourceId:
      post.id,

    source:
      "home",

    title:
      post.text
        ? safeString(
            post.text
          ).slice(
            0,
            90
          )
        : "Допис",

    subtitle:
      `Допис • ${
        post.authorName ||
        "ЯТУТ"
      }`,

    description:
      post.text,

    text:
      post.text,

    image:
      post.mediaType ===
        "image"
        ? post.media
        : null,

    mediaType:
      post.mediaType,

    route:
      "home",

    routePayload: {
      postId:
        post.id,
    },

    author: {
      id:
        post.authorId,

      name:
        post.authorName,

      username:
        post.authorUsername,

      initial:
        post.authorInitial,
    },

    createdAt:
      post.createdAt,

    data:
      post,
  });
}

/* =========================================================
   EVENT
========================================================= */

export function createSavedEvent(
  event
) {
  return normalizeSavedItem({
    type:
      SAVED_TYPES.EVENT,

    sourceId:
      event.id,

    source:
      "events",

    title:
      event.title,

    subtitle:
      "Подія",

    description:
      event.description,

    date:
      event.date,

    time:
      event.time,

    location:
      event.place ??
      event.location,

    image:
      event.cover ??
      event.coverUrl,

    route:
      "events",

    routePayload: {
      eventId:
        event.id,
    },

    createdAt:
      event.createdAt,

    data:
      event,
  });
}

/* =========================================================
   BUSINESS
========================================================= */

export function createSavedBusiness(
  business
) {
  return normalizeSavedItem({
    type:
      SAVED_TYPES.BUSINESS,

    sourceId:
      business.id,

    source:
      "business",

    title:
      business.name,

    subtitle:
      `Бізнес${
        business.category
          ? ` • ${business.category}`
          : ""
      }`,

    description:
      business.description,

    category:
      business.category,

    city:
      business.city,

    rating:
      business.rating,

    verified:
      business.verified,

    image:
      business.cover ??
      business.coverUrl,

    route:
      "business",

    routePayload: {
      businessId:
        business.id,
    },

    data:
      business,
  });
}

/* =========================================================
   PLACE
========================================================= */

export function createSavedPlace(
  place
) {
  return normalizeSavedItem({
    type:
      SAVED_TYPES.PLACE,

    sourceId:
      place.id,

    source:
      "nearby",

    title:
      place.title ??
      place.name,

    subtitle:
      `Місце${
        place.category
          ? ` • ${place.category}`
          : ""
      }`,

    description:
      place.description,

    category:
      place.category,

    city:
      place.city,

    location:
      place.address ??
      place.location,

    distance:
      place.distance,

    rating:
      place.rating,

    image:
      place.cover ??
      place.image,

    route:
      "nearby",

    routePayload: {
      placeId:
        place.id,
    },

    data:
      place,
  });
}

/* =========================================================
   COMMUNITY / SPACE
========================================================= */

export function createSavedCommunity(
  community
) {
  const type =
    community.type ===
      "space"
      ? SAVED_TYPES.SPACE
      : SAVED_TYPES.COMMUNITY;

  return normalizeSavedItem({
    type,

    sourceId:
      community.id,

    source:
      "communities",

    title:
      community.name ??
      community.title,

    subtitle:
      community.templateTitle ??
      community.type ??
      "Спільнота",

    description:
      community.description,

    city:
      community.city,

    members:
      community.membersCount ??
      community.members?.length,

    image:
      community.cover ??
      community.coverUrl,

    route:
      "communities",

    routePayload: {
      spaceId:
        community.id,
    },

    data:
      community,
  });
}

/* =========================================================
   PROFILE
========================================================= */

export function createSavedProfile(
  profile
) {
  return normalizeSavedItem({
    type:
      SAVED_TYPES.PROFILE,

    sourceId:
      profile.id,

    source:
      "profile",

    title:
      profile.name,

    subtitle:
      profile.username
        ? `@${profile.username}`
        : "Профіль",

    description:
      profile.bio,

    city:
      profile.currentCity,

    image:
      profile.avatar ??
      profile.avatarUrl,

    route:
      "profile",

    routePayload: {
      profileId:
        profile.id,
    },

    data:
      profile,
  });
}

/* =========================================================
   DEBUG / DEVELOPMENT

   Можно вызвать в консоли:
   window.YATUT_SAVED.getSavedItems()
========================================================= */

if (
  typeof window !==
  "undefined"
) {
  window.YATUT_SAVED = {
    getSavedItems,

    getSavedByType,

    getSavedItem,

    getSavedCount,

    isSaved,

    saveItem,

    removeSavedItem,

    removeSavedById,

    toggleSaved,

    updateSavedItem,

    clearSavedItems,

    clearSavedByType,

    searchSavedItems,

    createSavedPost,

    createSavedEvent,

    createSavedBusiness,

    createSavedPlace,

    createSavedCommunity,

    createSavedProfile,
  };
}