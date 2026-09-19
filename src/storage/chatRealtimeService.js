import {
  getChat,
  saveChat,
  saveMessage,
} from "./database";

import {
  notifyMessage,
} from "./notificationService";

/* =========================================================
   YATUT CHAT REALTIME SERVICE V1

   Без DOM, MutationObserver и таймеров.

   Сервис:
   1. принимает входящее сообщение;
   2. сохраняет его в IndexedDB;
   3. обновляет чат;
   4. увеличивает unread;
   5. создаёт уведомление;
   6. сообщает React-компонентам о новом сообщении.
========================================================= */

const INCOMING_EVENT =
  "yatut:chat-incoming-message";

const UPDATED_EVENT =
  "yatut:chat-realtime-updated";

/* =========================================================
   HELPERS
========================================================= */

function createId(
  prefix = "message"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/* =========================================================
   PREVIEW TEXT
========================================================= */

function previewText(
  message
) {
  if (!message) {
    return "Повідомлення";
  }

  if (
    message.type ===
    "voice"
  ) {
    return "🎙 Голосове";
  }

  if (
    message.type ===
    "image"
  ) {
    return "🖼 Фото";
  }

  if (
    message.type ===
    "video"
  ) {
    return "🎥 Відео";
  }

  if (
    message.type ===
    "file"
  ) {
    return (
      message.fileName ||
      "📎 Файл"
    );
  }

  return (
    message.text ||
    "Повідомлення"
  );
}

/* =========================================================
   EMIT UPDATE
========================================================= */

function emitRealtimeUpdate(
  detail
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      UPDATED_EVENT,
      {
        detail,
      }
    )
  );
}

/* =========================================================
   RECEIVE INCOMING MESSAGE
========================================================= */

export async function receiveIncomingChatMessage(
  data = {}
) {
  const senderId =
    data.senderId ||
    data.personId ||
    null;

  /*
    Нельзя получать собственное сообщение
    как входящее.
  */

  if (
    !senderId ||
    senderId === "me"
  ) {
    return null;
  }

  const personId =
    data.personId ||
    senderId;

  const chatId =
    data.chatId ||
    `chat-${personId}`;

  const createdAt =
    Number(
      data.createdAt ||
        Date.now()
    );

  /* =======================================================
     MESSAGE
  ======================================================= */

  const message = {
    id:
      data.id ||
      createId(),

    chatId,

    senderId,

    type:
      data.type ||
      "text",

    text:
      data.text ||
      "",

    fileBlob:
      data.fileBlob ||
      null,

    fileName:
      data.fileName ||
      null,

    voiceDuration:
      data.voiceDuration ||
      null,

    createdAt,

    pinned:
      Boolean(
        data.pinned
      ),

    myReaction:
      null,

    replyTo:
      data.replyTo ||
      null,
  };

  /* =======================================================
     SAVE MESSAGE
  ======================================================= */

  try {
    await saveMessage(
      message
    );
  } catch (error) {
    console.error(
      "REALTIME MESSAGE SAVE ERROR:",
      error
    );

    return null;
  }

  /* =======================================================
     GET CHAT
  ======================================================= */

  let chat =
    null;

  try {
    chat =
      await getChat(
        chatId
      );
  } catch (error) {
    console.warn(
      "REALTIME CHAT LOAD ERROR:",
      error
    );
  }

  /* =======================================================
     CREATE CHAT IF NEEDED
  ======================================================= */

  if (!chat) {
    chat = {
      id:
        chatId,

      type:
        data.chatType ||
        "direct",

      personId:
        personId ||
        null,

      title:
        data.chatTitle ||
        null,

      initials:
        data.chatInitials ||
        null,

      members:
        Array.isArray(
          data.members
        )
          ? data.members
          : undefined,

      updatedAt:
        createdAt,

      unread:
        0,

      lastMessage:
        "",
    };
  }

  /* =======================================================
     PREVIEW
  ======================================================= */

  const preview =
    previewText(
      message
    );

  /* =======================================================
     UPDATE CHAT
  ======================================================= */

  const updatedChat = {
    ...chat,

    personId:
      chat.personId ||
      personId ||
      null,

    lastMessage:
      preview,

    updatedAt:
      createdAt,

    unread:
      Number(
        chat.unread ||
          0
      ) + 1,
  };

  try {
    await saveChat(
      updatedChat
    );
  } catch (error) {
    console.error(
      "REALTIME CHAT SAVE ERROR:",
      error
    );

    return null;
  }

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  notifyMessage({
    chatId,

    personId,

    personName:
      data.personName ||
      data.senderName ||
      "Користувач",

    personInitial:
      data.personInitial ||
      data.senderInitial ||
      String(
        data.personName ||
          data.senderName ||
          "К"
      )
        .trim()
        .charAt(0)
        .toUpperCase(),

    personAvatar:
      data.personAvatar ||
      null,

    messageText:
      preview,
  });

  /* =======================================================
     RESULT
  ======================================================= */

  const result = {
    chat:
      updatedChat,

    message,
  };

  /* =======================================================
     TELL REACT
  ======================================================= */

  emitRealtimeUpdate(
    result
  );

  return result;
}

/* =========================================================
   SUBSCRIBE

   Chats.jsx сможет подписаться на новые сообщения
   без перезагрузки страницы.
========================================================= */

export function subscribeIncomingChatMessages(
  callback
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {};
  }

  function handleUpdate(
    event
  ) {
    callback?.(
      event?.detail ||
      null
    );
  }

  window.addEventListener(
    UPDATED_EVENT,
    handleUpdate
  );

  return () => {
    window.removeEventListener(
      UPDATED_EVENT,
      handleUpdate
    );
  };
}

/* =========================================================
   BROWSER EVENT BRIDGE

   Позже сюда сможет приходить WebSocket/backend:

   window.dispatchEvent(
     new CustomEvent(
       "yatut:chat-incoming-message",
       {
         detail: {...}
       }
     )
   );
========================================================= */

function startIncomingEventBridge() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  /*
    Защита от повторного подключения
    при Vite Hot Reload.
  */

  if (
    window.__YATUT_CHAT_REALTIME_BRIDGE__
  ) {
    return;
  }

  window.__YATUT_CHAT_REALTIME_BRIDGE__ =
    true;

  window.addEventListener(
    INCOMING_EVENT,
    (
      event
    ) => {
      receiveIncomingChatMessage(
        event?.detail ||
        {}
      );
    }
  );
}

/* =========================================================
   GLOBAL DEV API
========================================================= */

if (
  typeof window !==
  "undefined"
) {
  startIncomingEventBridge();

  window.YATUT_CHATS = {
    ...(window.YATUT_CHATS ||
      {}),

    receive:
      receiveIncomingChatMessage,
  };
}