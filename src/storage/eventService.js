import {
  getChats,
  saveChat,
} from "./database";

const EVENTS_KEY =
  "yatut-events-v2";

const CHANGE_EVENT =
  "yatut:events-changed";

function createId(
  prefix = "event"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function emitChange() {
  window.dispatchEvent(
    new CustomEvent(
      CHANGE_EVENT
    )
  );
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

export function getDemoEvents() {
  const now =
    Date.now();

  return [
    {
      id:
        "event-running-kyiv",

      title:
        "Ранкова пробіжка Києвом",

      description:
        "Легка ранкова пробіжка для всіх рівнів. Зустрічаємося біля входу в парк, знайомимося і біжимо разом.",

      category:
        "sport",

      categoryLabel:
        "Спорт",

      emoji:
        "🏃",

      city:
        "Київ",

      place:
        "Парк Наталка",

      date:
        "2026-09-12",

      time:
        "08:00",

      cover:
        null,

      organizerId:
        "me",

      organizerName:
        "Вадим",

      communityId:
        null,

      communityName:
        null,

      attendees: [
        "me",
        "maria",
        "oleksandr",
        "sofia",
      ],

      interested: [
        "yulia",
        "max",
      ],

      liked:
        false,

      likes:
        12,

      visibility:
        "public",

      chatId:
        "event-chat-running-kyiv",

      createdAt:
        now -
        2 *
          60 *
          60 *
          1000,
    },

    {
      id:
        "event-tech-meetup",

      title:
        "Kyiv Tech Meetup",

      description:
        "Зустріч для людей з IT, стартапів, дизайну та продукту.",

      category:
        "technology",

      categoryLabel:
        "Технології",

      emoji:
        "🚀",

      city:
        "Київ",

      place:
        "UNIT.City",

      date:
        "2026-09-15",

      time:
        "18:30",

      cover:
        null,

      organizerId:
        "oleksandr",

      organizerName:
        "Олександр Бондар",

      communityId:
        null,

      communityName:
        null,

      attendees: [
        "oleksandr",
        "maria",
        "me",
      ],

      interested: [
        "sofia",
        "vlad",
      ],

      liked:
        true,

      likes:
        31,

      visibility:
        "public",

      chatId:
        "event-chat-tech-meetup",

      createdAt:
        now -
        5 *
          60 *
          60 *
          1000,
    },
  ];
}

export function loadEvents() {
  try {
    const raw =
      localStorage.getItem(
        EVENTS_KEY
      );

    if (!raw) {
      const demo =
        getDemoEvents();

      localStorage.setItem(
        EVENTS_KEY,
        JSON.stringify(
          demo
        )
      );

      return demo;
    }

    const parsed =
      JSON.parse(raw);

    return Array.isArray(
      parsed
    )
      ? parsed
      : getDemoEvents();
  } catch (
    error
  ) {
    console.warn(
      "EVENT LOAD ERROR:",
      error
    );

    return getDemoEvents();
  }
}

export function saveEvents(
  events
) {
  try {
    localStorage.setItem(
      EVENTS_KEY,
      JSON.stringify(
        safeArray(
          events
        )
      )
    );

    emitChange();
  } catch (
    error
  ) {
    console.warn(
      "EVENT SAVE ERROR:",
      error
    );
  }
}

export function createEvent({
  title,
  description = "",
  category = "other",
  categoryLabel = "Інше",
  emoji = "🎉",
  city = "Київ",
  place = "",
  date = "",
  time = "",
  cover = null,
  visibility = "public",

  communityId = null,

  communityName = null,

  communityAvatar = null,
}) {
  const id =
    createId(
      "event"
    );

  return {
    id,

    title:
      String(
        title || ""
      ).trim(),

    description:
      String(
        description || ""
      ).trim(),

    category,

    categoryLabel,

    emoji,

    city:
      String(
        city || ""
      ).trim(),

    place:
      String(
        place || ""
      ).trim(),

    date,

    time,

    cover,

    organizerId:
      "me",

    organizerName:
      "Вадим",

    communityId,

    communityName,

    communityAvatar,

    attendees: [
      "me",
    ],

    interested:
      [],

    liked:
      false,

    likes:
      0,

    visibility,

    chatId:
      `event-chat-${id}`,

    createdAt:
      Date.now(),
  };
}

export function getCommunityEvents(
  communityId
) {
  if (!communityId) {
    return [];
  }

  return loadEvents().filter(
    (event) =>
      event.communityId ===
      communityId
  );
}

export function subscribeEvents(
  callback
) {
  function listener() {
    callback?.(
      loadEvents()
    );
  }

  window.addEventListener(
    CHANGE_EVENT,
    listener
  );

  window.addEventListener(
    "storage",
    listener
  );

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      listener
    );

    window.removeEventListener(
      "storage",
      listener
    );
  };
}

export async function ensureEventChat(
  event
) {
  if (!event?.id) {
    return null;
  }

  try {
    const loaded =
      await getChats();

    const chats =
      Array.isArray(
        loaded
      )
        ? loaded
        : [];

    const chatId =
      event.chatId ||
      `event-chat-${event.id}`;

    const members =
      Array.from(
        new Set([
          "me",
          ...safeArray(
            event.attendees
          ),
        ])
      );

    const existing =
      chats.find(
        (chat) =>
          chat.id ===
          chatId
      );

    const chatData = {
      ...(existing || {}),

      id:
        chatId,

      type:
        "group",

      title:
        event.title,

      initials:
        event.emoji ||
        "🎉",

      members,

      admins:
        Array.from(
          new Set([
            ...(existing?.admins ||
              []),

            event.organizerId ||
              "me",
          ])
        ),

      eventId:
        event.id,

      communityId:
        event.communityId ||
        null,

      communityName:
        event.communityName ||
        null,

      eventData: {
        id:
          event.id,

        title:
          event.title,

        date:
          event.date,

        time:
          event.time,

        place:
          event.place,

        city:
          event.city,

        emoji:
          event.emoji,

        cover:
          event.cover,

        communityId:
          event.communityId,

        communityName:
          event.communityName,
      },

      unread:
        existing?.unread ||
        0,

      lastMessage:
        existing?.lastMessage ||
        "🎉 Обговорення події",

      updatedAt:
        Date.now(),
    };

    await saveChat(
      chatData
    );

    return chatData;
  } catch (
    error
  ) {
    console.error(
      "ENSURE EVENT CHAT ERROR:",
      error
    );

    return null;
  }
}