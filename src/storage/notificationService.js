/* =========================================================
   YATUT NOTIFICATION SERVICE V2
========================================================= */

const STORAGE_KEY =
  "yatut-notifications-v1";

const CHANGE_EVENT =
  "yatut:notifications-changed";

const SETTINGS_STORAGE_KEY =
  "yatut-settings-v1";

const MAX_NOTIFICATIONS =
  250;

/* =========================================================
   CATEGORIES
========================================================= */

export const NOTIFICATION_CATEGORIES = {
  PEOPLE: "people",
  ACTIVITY: "activity",
  EVENTS: "events",
  COMMUNITIES: "communities",
  NEARBY: "nearby",
  MESSAGES: "messages",
  BUSINESS: "business",
  SYSTEM: "system",
};

/* =========================================================
   TYPES
========================================================= */

export const NOTIFICATION_TYPES = {
  LIKE: "like",
  COMMENT: "comment",
  REPLY: "reply",
  MENTION: "mention",
  FRIEND_REQUEST: "friend_request",
  FRIEND_ACCEPTED: "friend_accepted",
  MESSAGE: "message",
  COMMUNITY: "community",
  COMMUNITY_INVITE:
    "community_invite",
  EVENT: "event",
  EVENT_INVITE:
    "event_invite",
  EVENT_REMINDER: "event_reminder",
  NEARBY: "nearby",
  BUSINESS: "business",
  BADGE: "badge",
  SECURITY: "security",
  SYSTEM: "system",
};

/* =========================================================
   PRIORITIES
========================================================= */

export const NOTIFICATION_PRIORITIES = {
  NORMAL: "normal",
  IMPORTANT: "important",
  URGENT: "urgent",
};

/* =========================================================
   DEMO
========================================================= */

const DEMO_NOTIFICATIONS = [
  {
    id: "notification-friend-request",
    type: NOTIFICATION_TYPES.FRIEND_REQUEST,
    category: NOTIFICATION_CATEGORIES.PEOPLE,
    priority: NOTIFICATION_PRIORITIES.NORMAL,

    title:
      "Анастасія Мельник хоче додати вас у друзі",

    text:
      "У вас 7 спільних знайомих",

    authorId: "anastasia",
    authorName: "Анастасія Мельник",
    authorInitial: "А",

    createdAt:
      Date.now() -
      4 * 60 * 1000,

    read: false,

    route: "friends",

    payload: {
      personId: "anastasia",
    },

    actions: [
      "accept",
      "decline",
    ],

    groupKey:
      "friend-request-anastasia",
  },

  {
    id: "notification-like",
    type: NOTIFICATION_TYPES.LIKE,
    category: NOTIFICATION_CATEGORIES.ACTIVITY,
    priority: NOTIFICATION_PRIORITIES.NORMAL,

    title:
      "Софія Романенко вподобала ваш допис",

    text:
      "«Сьогодні ще один великий крок для ЯТУТ...»",

    authorId: "sofia",
    authorName: "Софія Романенко",
    authorInitial: "С",

    createdAt:
      Date.now() -
      11 * 60 * 1000,

    read: false,

    route: "home",

    payload: {
      postId: "welcome-yatut",
    },

    groupKey:
      "like-welcome-yatut-sofia",
  },

  {
    id: "notification-comment",
    type: NOTIFICATION_TYPES.COMMENT,
    category: NOTIFICATION_CATEGORIES.ACTIVITY,
    priority: NOTIFICATION_PRIORITIES.NORMAL,

    title:
      "Марія Коваль прокоментувала ваш допис",

    text:
      "«Дуже чекаю на запуск!»",

    authorId: "maria",
    authorName: "Марія Коваль",
    authorInitial: "М",

    createdAt:
      Date.now() -
      24 * 60 * 1000,

    read: false,

    route: "home",

    payload: {
      postId:
        "welcome-yatut",

      commentId:
        "welcome-comment-1",
    },

    groupKey:
      "comment-welcome-yatut-maria",
  },

  {
    id: "notification-event",
    type: NOTIFICATION_TYPES.EVENT_REMINDER,
    category: NOTIFICATION_CATEGORIES.EVENTS,
    priority: NOTIFICATION_PRIORITIES.NORMAL,

    title:
      "Подія «Вечірній Київ» почнеться сьогодні",

    text:
      "Початок о 19:00 · Київ",

    authorId: null,
    authorName: "ЯТУТ Події",
    authorInitial: "Я",

    createdAt:
      Date.now() -
      54 * 60 * 1000,

    read: true,

    route: "events",

    payload: {
      eventId:
        "event-tech-meetup",
    },

    groupKey:
      "event-reminder-evening-kyiv",
  },

  {
    id: "notification-nearby",
    type: NOTIFICATION_TYPES.NEARBY,
    category: NOTIFICATION_CATEGORIES.NEARBY,
    priority: NOTIFICATION_PRIORITIES.NORMAL,

    title:
      "3 ваших знайомих зараз поруч",

    text:
      "Найближчий — приблизно за 850 м",

    authorId: null,
    authorName: "ЯТУТ Поруч",
    authorInitial: "Я",

    createdAt:
      Date.now() -
      2 * 60 * 60 * 1000,

    read: true,

    route: "nearby",

    payload: null,

    groupKey:
      "nearby-demo",
  },

  {
    id: "notification-community",
    type: NOTIFICATION_TYPES.COMMUNITY,
    category: NOTIFICATION_CATEGORIES.COMMUNITIES,
    priority: NOTIFICATION_PRIORITIES.NORMAL,

    title:
      "Нове оголошення у спільноті «Київ сьогодні»",

    text:
      "Опубліковано нову важливу інформацію",

    authorId: null,
    authorName: "Київ сьогодні",
    authorInitial: "К",

    createdAt:
      Date.now() -
      3 * 60 * 60 * 1000,

    read: true,

    route: "communities",

    payload: {
      communityId:
        "space-yatut-kyiv",
    },

    groupKey:
      "community-kyiv-today",
  },

  {
    id: "notification-badge",
    type: NOTIFICATION_TYPES.BADGE,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    priority: NOTIFICATION_PRIORITIES.NORMAL,

    title:
      "Ви отримали значок «Перші тут»",

    text:
      "Дякуємо, що ви з ЯТУТ від самого початку",

    authorId: null,
    authorName: "ЯТУТ",
    authorInitial: "Я",

    createdAt:
      Date.now() -
      5 * 60 * 60 * 1000,

    read: true,

    route: "profile",

    payload: {
      tab:
        "achievements",
    },

    groupKey:
      "badge-first-here",
  },

  {
    id: "notification-security",
    type: NOTIFICATION_TYPES.SECURITY,
    category: NOTIFICATION_CATEGORIES.SYSTEM,
    priority: NOTIFICATION_PRIORITIES.IMPORTANT,

    title:
      "Новий вхід у ваш акаунт",

    text:
      "Safari · macOS · Київ",

    authorId: null,
    authorName: "Безпека ЯТУТ",
    authorInitial: "Я",

    createdAt:
      Date.now() -
      24 * 60 * 60 * 1000,

    read: true,

    route: "settings",

    payload: {
      section:
        "security",
    },

    groupKey:
      "security-login-demo",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function createId(
  prefix = "notification"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function cloneNotification(
  notification
) {
  return {
    ...notification,

    payload:
      notification?.payload &&
      typeof notification.payload ===
        "object"
        ? {
            ...notification.payload,
          }
        : notification?.payload ||
          null,

    actions:
      Array.isArray(
        notification?.actions
      )
        ? [
            ...notification.actions,
          ]
        : undefined,
  };
}

function cloneDemoNotifications() {
  return DEMO_NOTIFICATIONS.map(
    cloneNotification
  );
}

function normalizeNotification(
  notification
) {
  if (!notification) {
    return null;
  }

  return {
    id:
      notification.id ||
      createId(),

    type:
      notification.type ||
      NOTIFICATION_TYPES.SYSTEM,

    category:
      notification.category ||
      NOTIFICATION_CATEGORIES.SYSTEM,

    priority:
      notification.priority ||
      NOTIFICATION_PRIORITIES.NORMAL,

    title:
      String(
        notification.title ||
          "Нове сповіщення"
      ),

    text:
      String(
        notification.text ||
          ""
      ),

    authorId:
      notification.authorId ||
      null,

    authorName:
      notification.authorName ||
      "ЯТУТ",

    authorInitial:
      notification.authorInitial ||
      "Я",

    authorAvatar:
      notification.authorAvatar ||
      null,

    createdAt:
      Number(
        notification.createdAt ||
          Date.now()
      ),

    read:
      Boolean(
        notification.read
      ),

    route:
      notification.route ||
      null,

    payload:
      notification.payload &&
      typeof notification.payload ===
        "object"
        ? {
            ...notification.payload,
          }
        : notification.payload ||
          null,

    actions:
      Array.isArray(
        notification.actions
      )
        ? [
            ...notification.actions,
          ]
        : undefined,

    groupKey:
      notification.groupKey ||
      null,

    count:
      Math.max(
        1,
        Number(
          notification.count ||
            1
        )
      ),

    metadata:
      notification.metadata &&
      typeof notification.metadata ===
        "object"
        ? {
            ...notification.metadata,
          }
        : {},
  };
}

function sortNotifications(
  notifications
) {
  return [
    ...notifications,
  ].sort(
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
  );
}

function emitChange(
  notifications
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      CHANGE_EVENT,
      {
        detail: {
          notifications,
        },
      }
    )
  );
}

/* =========================================================
   STORAGE
========================================================= */

function saveNotifications(
  notifications
) {
  const normalized =
    sortNotifications(
      notifications
        .map(
          normalizeNotification
        )
        .filter(Boolean)
    ).slice(
      0,
      MAX_NOTIFICATIONS
    );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );

    emitChange(
      normalized
    );

    return normalized;
  } catch (error) {
    console.warn(
      "NOTIFICATION SAVE ERROR:",
      error
    );

    return normalized;
  }
}

/* =========================================================
   GET
========================================================= */

export function getNotifications() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return saveNotifications(
        cloneDemoNotifications()
      );
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
      return saveNotifications(
        cloneDemoNotifications()
      );
    }

    return sortNotifications(
      parsed
        .map(
          normalizeNotification
        )
        .filter(Boolean)
    );
  } catch (error) {
    console.warn(
      "NOTIFICATION LOAD ERROR:",
      error
    );

    return cloneDemoNotifications();
  }
}

export function getNotification(
  notificationId
) {
  return (
    getNotifications().find(
      (
        notification
      ) =>
        notification.id ===
        notificationId
    ) ||
    null
  );
}

export function getUnreadCount() {
  return getNotifications().filter(
    (
      notification
    ) =>
      !notification.read
  ).length;
}

export function replaceNotifications(
  notifications
) {
  return saveNotifications(
    Array.isArray(
      notifications
    )
      ? notifications
      : []
  );
}

/* =========================================================
   SETTINGS BRIDGE
========================================================= */

function notificationPreferenceKey(
  notification
) {
  switch (
    notification?.type
  ) {
    case NOTIFICATION_TYPES.MESSAGE:
      return "messages";

    case NOTIFICATION_TYPES.FRIEND_REQUEST:
    case NOTIFICATION_TYPES.FRIEND_ACCEPTED:
      return "friends";

    case NOTIFICATION_TYPES.COMMUNITY:
    case NOTIFICATION_TYPES.COMMUNITY_INVITE:
      return "communities";

    case NOTIFICATION_TYPES.EVENT:
    case NOTIFICATION_TYPES.EVENT_INVITE:
    case NOTIFICATION_TYPES.EVENT_REMINDER:
      return "events";

    case NOTIFICATION_TYPES.BUSINESS:
      return "business";

    default:
      return null;
  }
}

function notificationEnabledBySettings(
  notification
) {
  const key =
    notificationPreferenceKey(
      notification
    );

  if (!key) {
    return true;
  }

  try {
    const raw =
      localStorage.getItem(
        SETTINGS_STORAGE_KEY
      );

    if (!raw) {
      return true;
    }

    const settings =
      JSON.parse(
        raw
      );

    const value =
      settings?.notifications?.[
        key
      ];

    return value !==
      false;
  } catch {
    return true;
  }
}

/* =========================================================
   CREATE
========================================================= */

export function createNotification(
  data,
  options = {}
) {
  const notification =
    normalizeNotification(
      data
    );

  if (!notification) {
    return null;
  }

  if (
    !notificationEnabledBySettings(
      notification
    )
  ) {
    return null;
  }

  const notifications =
    getNotifications();

  const {
    dedupe = true,
    merge = false,
  } = options;

  if (
    dedupe &&
    notification.groupKey
  ) {
    const existing =
      notifications.find(
        (
          item
        ) =>
          item.groupKey ===
          notification.groupKey
      );

    if (existing) {
      if (!merge) {
        return existing;
      }

      const updated = {
        ...existing,
        ...notification,

        id:
          existing.id,

        read:
          false,

        createdAt:
          Date.now(),

        count:
          Number(
            existing.count ||
              1
          ) + 1,
      };

      saveNotifications(
        notifications.map(
          (
            item
          ) =>
            item.id ===
            existing.id
              ? updated
              : item
        )
      );

      return updated;
    }
  }

  saveNotifications([
    notification,
    ...notifications,
  ]);

  return notification;
}

/* =========================================================
   UPDATE
========================================================= */

export function updateNotification(
  notificationId,
  patch
) {
  const next =
    getNotifications().map(
      (
        notification
      ) =>
        notification.id ===
        notificationId
          ? normalizeNotification({
              ...notification,
              ...patch,

              id:
                notification.id,
            })
          : notification
    );

  saveNotifications(
    next
  );

  return getNotification(
    notificationId
  );
}

export function markNotificationRead(
  notificationId
) {
  return updateNotification(
    notificationId,
    {
      read: true,
    }
  );
}

export function markNotificationUnread(
  notificationId
) {
  return updateNotification(
    notificationId,
    {
      read: false,
    }
  );
}

export function markAllNotificationsRead() {
  const next =
    getNotifications().map(
      (
        notification
      ) => ({
        ...notification,
        read: true,
      })
    );

  return saveNotifications(
    next
  );
}

export function removeNotification(
  notificationId
) {
  const next =
    getNotifications().filter(
      (
        notification
      ) =>
        notification.id !==
        notificationId
    );

  saveNotifications(
    next
  );

  return next;
}

export function removeNotificationByGroup(
  groupKey
) {
  if (!groupKey) {
    return getNotifications();
  }

  const next =
    getNotifications().filter(
      (
        notification
      ) =>
        notification.groupKey !==
        groupKey
    );

  saveNotifications(
    next
  );

  return next;
}

export function clearReadNotifications() {
  const next =
    getNotifications().filter(
      (
        notification
      ) =>
        !notification.read
    );

  saveNotifications(
    next
  );

  return next;
}

export function clearNotifications() {
  saveNotifications(
    []
  );

  return [];
}

export function resetDemoNotifications() {
  const next =
    cloneDemoNotifications();

  saveNotifications(
    next
  );

  return next;
}

/* =========================================================
   LIKE
========================================================= */

export function notifyLike({
  postId,
  postText = "",
  personId,
  personName,
  personInitial,
  personAvatar = null,
}) {
  if (
    !postId ||
    !personId
  ) {
    return null;
  }

  const preview =
    String(
      postText ||
        ""
    )
      .trim()
      .slice(
        0,
        90
      );

  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.LIKE,

      category:
        NOTIFICATION_CATEGORIES.ACTIVITY,

      title:
        `${personName || "Хтось"} вподобав ваш допис`,

      text:
        preview
          ? `«${preview}${
              String(
                postText
              ).length > 90
                ? "…"
                : ""
            }»`
          : "",

      authorId:
        personId,

      authorName:
        personName ||
        "Користувач",

      authorInitial:
        personInitial ||
        String(
          personName ||
            "К"
        )
          .trim()
          .charAt(0)
          .toUpperCase(),

      authorAvatar:
        personAvatar,

      route:
        "home",

      payload: {
        postId,
      },

      groupKey:
        `like:${postId}:${personId}`,
    },
    {
      dedupe: true,
    }
  );
}

/* =========================================================
   COMMENT
========================================================= */

export function notifyComment({
  postId,
  commentId,
  commentText,
  personId,
  personName,
  personInitial,
  personAvatar = null,
}) {
  if (
    !postId ||
    !personId
  ) {
    return null;
  }

  const preview =
    String(
      commentText ||
        ""
    )
      .trim()
      .slice(
        0,
        110
      );

  return createNotification({
    type:
      NOTIFICATION_TYPES.COMMENT,

    category:
      NOTIFICATION_CATEGORIES.ACTIVITY,

    title:
      `${personName || "Хтось"} прокоментував ваш допис`,

    text:
      preview
        ? `«${preview}${
            String(
              commentText ||
                ""
            ).length > 110
              ? "…"
              : ""
          }»`
        : "",

    authorId:
      personId,

    authorName:
      personName ||
      "Користувач",

    authorInitial:
      personInitial ||
      String(
        personName ||
          "К"
      )
        .trim()
        .charAt(0)
        .toUpperCase(),

    authorAvatar:
      personAvatar,

    route:
      "home",

    payload: {
      postId,

      commentId:
        commentId ||
        null,

      openComments:
        true,
    },

    groupKey:
      `comment:${postId}:${
        commentId ||
        createId(
          "comment"
        )
      }`,
  });
}

/* =========================================================
   REPLY
========================================================= */

export function notifyReply({
  postId,
  commentId,
  replyId,
  replyText,
  personId,
  personName,
  personInitial,
}) {
  if (
    !postId ||
    !personId
  ) {
    return null;
  }

  return createNotification({
    type:
      NOTIFICATION_TYPES.REPLY,

    category:
      NOTIFICATION_CATEGORIES.ACTIVITY,

    title:
      `${personName || "Хтось"} відповів на ваш коментар`,

    text:
      replyText
        ? `«${String(
            replyText
          ).slice(
            0,
            110
          )}»`
        : "",

    authorId:
      personId,

    authorName:
      personName ||
      "Користувач",

    authorInitial:
      personInitial ||
      "К",

    route:
      "home",

    payload: {
      postId,
      commentId,
      replyId,
      openComments:
        true,
    },

    groupKey:
      `reply:${
        replyId ||
        createId(
          "reply"
        )
      }`,
  });
}

/* =========================================================
   MENTION
========================================================= */

export function notifyMention({
  postId,
  commentId = null,
  text = "",
  personId,
  personName,
  personInitial,
}) {
  return createNotification({
    type:
      NOTIFICATION_TYPES.MENTION,

    category:
      NOTIFICATION_CATEGORIES.ACTIVITY,

    title:
      `${personName || "Хтось"} згадав вас`,

    text:
      String(
        text ||
          ""
      ).slice(
        0,
        120
      ),

    authorId:
      personId ||
      null,

    authorName:
      personName ||
      "Користувач",

    authorInitial:
      personInitial ||
      "К",

    route:
      "home",

    payload: {
      postId,
      commentId,
    },

    groupKey:
      `mention:${postId || "none"}:${commentId || "post"}:${personId || "user"}`,
  });
}

/* =========================================================
   FRIENDS
========================================================= */

export function notifyFriendRequest({
  personId,
  personName,
  personInitial,
  personAvatar = null,
  mutualCount = 0,
}) {
  if (!personId) {
    return null;
  }

  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.FRIEND_REQUEST,

      category:
        NOTIFICATION_CATEGORIES.PEOPLE,

      title:
        `${personName || "Користувач"} хоче додати вас у друзі`,

      text:
        mutualCount > 0
          ? `У вас ${mutualCount} спільних знайомих`
          : "Новий запит у друзі",

      authorId:
        personId,

      authorName:
        personName ||
        "Користувач",

      authorInitial:
        personInitial ||
        "К",

      authorAvatar:
        personAvatar,

      route:
        "friends",

      payload: {
        personId,
      },

      actions: [
        "accept",
        "decline",
      ],

      groupKey:
        `friend-request:${personId}`,
    },
    {
      dedupe: true,
    }
  );
}

export function notifyFriendAccepted({
  personId,
  personName,
  personInitial,
  personAvatar = null,
}) {
  if (!personId) {
    return null;
  }

  removeNotificationByGroup(
    `friend-request:${personId}`
  );

  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.FRIEND_ACCEPTED,

      category:
        NOTIFICATION_CATEGORIES.PEOPLE,

      title:
        `${personName || "Користувач"} прийняв ваш запит у друзі`,

      text:
        "Тепер ви друзі у ЯТУТ",

      authorId:
        personId,

      authorName:
        personName ||
        "Користувач",

      authorInitial:
        personInitial ||
        "К",

      authorAvatar:
        personAvatar,

      route:
        "friends",

      payload: {
        personId,
      },

      groupKey:
        `friend-accepted:${personId}`,
    },
    {
      dedupe: true,
    }
  );
}

export function acceptFriendRequest(
  notificationId
) {
  const notification =
    getNotification(
      notificationId
    );

  if (!notification) {
    return null;
  }

  return updateNotification(
    notificationId,
    {
      read: true,

      type:
        NOTIFICATION_TYPES.FRIEND_ACCEPTED,

      title:
        "Запит у друзі прийнято",

      text:
        `Тепер ви з ${
          notification.authorName ||
          "користувачем"
        } друзі у ЯТУТ`,

      actions: [],

      metadata: {
        ...(
          notification
            .metadata ||
          {}
        ),

        actionStatus:
          "accepted",

        actedAt:
          Date.now(),
      },

      groupKey:
        notification.authorId
          ? `friend-active:${notification.authorId}`
          : notification.groupKey,
    }
  );
}

export function declineFriendRequest(
  notificationId
) {
  const notification =
    getNotification(
      notificationId
    );

  if (!notification) {
    return null;
  }

  return updateNotification(
    notificationId,
    {
      read: true,

      title:
        "Запит у друзі відхилено",

      text:
        `Запит від ${notification.authorName || "користувача"} більше не активний`,

      actions: [],

      metadata: {
        ...(
          notification
            .metadata ||
          {}
        ),

        actionStatus:
          "declined",

        actedAt:
          Date.now(),
      },
    }
  );
}

/* =========================================================
   MESSAGE
========================================================= */

export function notifyMessage({
  chatId,
  personId,
  personName,
  personInitial,
  personAvatar = null,
  messageText = "",
}) {
  if (
    !chatId ||
    !personId
  ) {
    return null;
  }

  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.MESSAGE,

      category:
        NOTIFICATION_CATEGORIES.MESSAGES,

      title:
        `Нове повідомлення від ${personName || "користувача"}`,

      text:
        String(
          messageText ||
            ""
        )
          .trim()
          .slice(
            0,
            100
          ),

      authorId:
        personId,

      authorName:
        personName ||
        "Користувач",

      authorInitial:
        personInitial ||
        "К",

      authorAvatar:
        personAvatar,

      route:
        "chats",

      payload: {
        personId,
        chatId,
      },

      groupKey:
        `message:${chatId}`,
    },
    {
      dedupe: true,
      merge: true,
    }
  );
}

/* =========================================================
   EVENTS
========================================================= */

export function notifyEventReminder({
  eventId,
  eventTitle,
  timeText,
  locationText,
}) {
  if (!eventId) {
    return null;
  }

  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.EVENT_REMINDER,

      category:
        NOTIFICATION_CATEGORIES.EVENTS,

      title:
        `Подія «${eventTitle || "Подія"}» скоро почнеться`,

      text:
        [
          timeText,
          locationText,
        ]
          .filter(Boolean)
          .join(" · "),

      authorId: null,
      authorName: "ЯТУТ Події",
      authorInitial: "Я",

      route:
        "events",

      payload: {
        eventId,
      },

      groupKey:
        `event-reminder:${eventId}`,
    },
    {
      dedupe: true,
    }
  );
}

/* =========================================================
   COMMUNITY
========================================================= */

export function notifyCommunity({
  communityId,
  communityName,
  text,
}) {
  if (!communityId) {
    return null;
  }

  return createNotification({
    type:
      NOTIFICATION_TYPES.COMMUNITY,

    category:
      NOTIFICATION_CATEGORIES.COMMUNITIES,

    title:
      `Нове у спільноті «${communityName || "Спільнота"}»`,

    text:
      String(
        text ||
          ""
      ).slice(
        0,
        120
      ),

    authorId:
      communityId,

    authorName:
      communityName ||
      "Спільнота",

    authorInitial:
      String(
        communityName ||
          "С"
      )
        .trim()
        .charAt(0)
        .toUpperCase(),

    route:
      "communities",

    payload: {
      communityId,
    },

    groupKey:
      `community:${communityId}:${Date.now()}`,
  });
}

/* =========================================================
   COMMUNITY INVITE
========================================================= */

export function notifyCommunityInvite({
  spaceId,
  communityId,
  communityName,
  inviterId = null,
  inviterName = "Спільнота",
  space = null,
}) {
  const id =
    spaceId ||
    communityId ||
    space?.id;

  if (!id) {
    return null;
  }

  return createNotification({
    type:
      NOTIFICATION_TYPES.COMMUNITY_INVITE,

    category:
      NOTIFICATION_CATEGORIES.COMMUNITIES,

    title:
      `${inviterName} запрошує вас до спільноти`,

    text:
      communityName ||
      space?.title ||
      "Нове запрошення у ЯТУТ",

    authorId:
      inviterId,

    authorName:
      inviterName,

    authorInitial:
      String(
        inviterName ||
          "С"
      )
        .trim()
        .charAt(0)
        .toUpperCase(),

    route:
      "communities",

    payload: {
      actionTarget:
        "community",

      spaceId:
        id,

      communityId:
        id,

      communityName:
        communityName ||
        space?.title ||
        "Спільнота",

      inviterId,

      space:
        space ||
        null,
    },

    actions: [
      "accept",
      "decline",
    ],

    groupKey:
      `community-invite:${id}`,
  });
}

/* =========================================================
   EVENT INVITE
========================================================= */

export function notifyEventInvite({
  eventId,
  eventTitle,
  inviterId = null,
  inviterName = "ЯТУТ Події",
  event = null,
}) {
  const id =
    eventId ||
    event?.id;

  if (!id) {
    return null;
  }

  return createNotification({
    type:
      NOTIFICATION_TYPES.EVENT_INVITE,

    category:
      NOTIFICATION_CATEGORIES.EVENTS,

    title:
      `${inviterName} запрошує вас на подію`,

    text:
      eventTitle ||
      event?.title ||
      "Нова подія",

    authorId:
      inviterId,

    authorName:
      inviterName,

    authorInitial:
      String(
        inviterName ||
          "Я"
      )
        .trim()
        .charAt(0)
        .toUpperCase(),

    route:
      "events",

    payload: {
      actionTarget:
        "event",

      eventId:
        id,

      event:
        event ||
        null,
    },

    actions: [
      "accept",
      "decline",
    ],

    groupKey:
      `event-invite:${id}`,
  });
}

/* =========================================================
   NEARBY
========================================================= */

export function notifyNearby({
  peopleCount,
  nearestDistance,
}) {
  const count =
    Math.max(
      1,
      Number(
        peopleCount ||
          1
      )
    );

  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.NEARBY,

      category:
        NOTIFICATION_CATEGORIES.NEARBY,

      title:
        `${count} ${
          count === 1
            ? "ваш знайомий зараз поруч"
            : "ваших знайомих зараз поруч"
        }`,

      text:
        nearestDistance
          ? `Найближчий — приблизно за ${nearestDistance}`
          : "Подивіться, хто зараз неподалік",

      authorId: null,
      authorName: "ЯТУТ Поруч",
      authorInitial: "Я",

      route:
        "nearby",

      payload:
        null,

      groupKey:
        "nearby-current",
    },
    {
      dedupe: true,
    }
  );
}

/* =========================================================
   BADGE
========================================================= */

export function notifyBadge({
  badgeId,
  badgeName,
  description = "",
}) {
  if (!badgeId) {
    return null;
  }

  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.BADGE,

      category:
        NOTIFICATION_CATEGORIES.SYSTEM,

      title:
        `Ви отримали значок «${badgeName || "Новий значок"}»`,

      text:
        description,

      authorId: null,
      authorName: "ЯТУТ",
      authorInitial: "Я",

      route:
        "profile",

      payload: {
        tab:
          "achievements",

        badgeId,
      },

      groupKey:
        `badge:${badgeId}`,
    },
    {
      dedupe: true,
    }
  );
}

/* =========================================================
   SECURITY
========================================================= */

export function notifySecurity({
  title,
  text,
  securityEventId,
}) {
  return createNotification(
    {
      type:
        NOTIFICATION_TYPES.SECURITY,

      category:
        NOTIFICATION_CATEGORIES.SYSTEM,

      priority:
        NOTIFICATION_PRIORITIES.IMPORTANT,

      title:
        title ||
        "Важливе повідомлення безпеки",

      text:
        text ||
        "",

      authorId: null,
      authorName: "Безпека ЯТУТ",
      authorInitial: "Я",

      route:
        "settings",

      payload: {
        section:
          "security",
      },

      groupKey:
        securityEventId
          ? `security:${securityEventId}`
          : `security:${Date.now()}`,
    },
    {
      dedupe:
        Boolean(
          securityEventId
        ),
    }
  );
}

/* =========================================================
   SUBSCRIBE
========================================================= */

export function subscribeNotifications(
  callback
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {};
  }

  function handleChange(
    event
  ) {
    callback(
      event?.detail
        ?.notifications ||
        getNotifications()
    );
  }

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
      getNotifications()
    );
  }

  window.addEventListener(
    CHANGE_EVENT,
    handleChange
  );

  window.addEventListener(
    "storage",
    handleStorage
  );

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      handleChange
    );

    window.removeEventListener(
      "storage",
      handleStorage
    );
  };
}

/* =========================================================
   EVENT INGEST
========================================================= */

export function ingestNotificationEvent(
  event
) {
  if (!event?.type) {
    return null;
  }

  switch (
    event.type
  ) {
    case "post.like":
      return notifyLike(
        event.data ||
        {}
      );

    case "post.comment":
      return notifyComment(
        event.data ||
        {}
      );

    case "comment.reply":
      return notifyReply(
        event.data ||
        {}
      );

    case "mention":
      return notifyMention(
        event.data ||
        {}
      );

    case "friend.request":
      return notifyFriendRequest(
        event.data ||
        {}
      );

    case "friend.accepted":
      return notifyFriendAccepted(
        event.data ||
        {}
      );

    case "message.new":
      return notifyMessage(
        event.data ||
        {}
      );

    case "event.reminder":
      return notifyEventReminder(
        event.data ||
        {}
      );

    case "community.new":
      return notifyCommunity(
        event.data ||
        {}
      );

    case "community.invite":
      return notifyCommunityInvite(
        event.data ||
        {}
      );

    case "event.invite":
      return notifyEventInvite(
        event.data ||
        {}
      );

    case "nearby":
      return notifyNearby(
        event.data ||
        {}
      );

    case "badge":
      return notifyBadge(
        event.data ||
        {}
      );

    case "security":
      return notifySecurity(
        event.data ||
        {}
      );

    default:
      return createNotification(
        event.data ||
        {
          title:
            "Нове сповіщення ЯТУТ",
        }
      );
  }
}

/* =========================================================
   GLOBAL DEV API
========================================================= */

if (
  typeof window !==
  "undefined"
) {
  window.YATUT_NOTIFICATIONS = {
    get:
      getNotifications,

    unread:
      getUnreadCount,

    create:
      createNotification,

    remove:
      removeNotification,

    clear:
      clearNotifications,

    clearRead:
      clearReadNotifications,

    markRead:
      markNotificationRead,

    markUnread:
      markNotificationUnread,

    markAllRead:
      markAllNotificationsRead,

    reset:
      resetDemoNotifications,

    ingest:
      ingestNotificationEvent,

    like:
      notifyLike,

    comment:
      notifyComment,

    reply:
      notifyReply,

    mention:
      notifyMention,

    friendRequest:
      notifyFriendRequest,

    friendAccepted:
      notifyFriendAccepted,

    message:
      notifyMessage,

    event:
      notifyEventReminder,

    community:
      notifyCommunity,

    communityInvite:
      notifyCommunityInvite,

    eventInvite:
      notifyEventInvite,

    nearby:
      notifyNearby,

    badge:
      notifyBadge,

    security:
      notifySecurity,
  };
}