import { openDB } from "idb";

/* =========================================================
   YATUT LOCAL DATABASE
========================================================= */

const DB_NAME = "yatut-local";
const DB_VERSION = 9;

const dbPromise = openDB(
  DB_NAME,
  DB_VERSION,
  {
    upgrade(
      db,
      oldVersion,
      newVersion,
      transaction
    ) {
      /* ===================================================
         POSTS
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "posts"
        )
      ) {
        db.createObjectStore(
          "posts",
          {
            keyPath: "id",
          }
        );
      }

      /* ===================================================
         STORIES
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "stories"
        )
      ) {
        db.createObjectStore(
          "stories",
          {
            keyPath: "id",
          }
        );
      }

      /* ===================================================
         PROFILES
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "profiles"
        )
      ) {
        db.createObjectStore(
          "profiles",
          {
            keyPath: "id",
          }
        );
      }

      /* ===================================================
         SOCIAL
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "social"
        )
      ) {
        db.createObjectStore(
          "social",
          {
            keyPath: "id",
          }
        );
      }

      /* ===================================================
         CHATS
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "chats"
        )
      ) {
        db.createObjectStore(
          "chats",
          {
            keyPath: "id",
          }
        );
      }

      /* ===================================================
         MESSAGES
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "messages"
        )
      ) {
        const store =
          db.createObjectStore(
            "messages",
            {
              keyPath: "id",
            }
          );

        store.createIndex(
          "chatId",
          "chatId",
          {
            unique: false,
          }
        );

        store.createIndex(
          "createdAt",
          "createdAt",
          {
            unique: false,
          }
        );
      } else {
        const store =
          transaction.objectStore(
            "messages"
          );

        if (
          !store.indexNames.contains(
            "chatId"
          )
        ) {
          store.createIndex(
            "chatId",
            "chatId",
            {
              unique: false,
            }
          );
        }

        if (
          !store.indexNames.contains(
            "createdAt"
          )
        ) {
          store.createIndex(
            "createdAt",
            "createdAt",
            {
              unique: false,
            }
          );
        }
      }

      /* ===================================================
         EVENTS
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "events"
        )
      ) {
        db.createObjectStore(
          "events",
          {
            keyPath: "id",
          }
        );
      }

      /* ===================================================
         LEGACY COMMUNITIES
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "communities"
        )
      ) {
        db.createObjectStore(
          "communities",
          {
            keyPath: "id",
          }
        );
      }

      /* ===================================================
         SPACE ENGINE V2
      =================================================== */

      if (
        !db.objectStoreNames.contains(
          "spaces"
        )
      ) {
        const store =
          db.createObjectStore(
            "spaces",
            {
              keyPath: "id",
            }
          );

        store.createIndex(
          "templateId",
          "templateId",
          {
            unique: false,
          }
        );

        store.createIndex(
          "type",
          "type",
          {
            unique: false,
          }
        );

        store.createIndex(
          "createdAt",
          "createdAt",
          {
            unique: false,
          }
        );
      } else {
        const store =
          transaction.objectStore(
            "spaces"
          );

        if (
          !store.indexNames.contains(
            "templateId"
          )
        ) {
          store.createIndex(
            "templateId",
            "templateId",
            {
              unique: false,
            }
          );
        }

        if (
          !store.indexNames.contains(
            "type"
          )
        ) {
          store.createIndex(
            "type",
            "type",
            {
              unique: false,
            }
          );
        }

        if (
          !store.indexNames.contains(
            "createdAt"
          )
        ) {
          store.createIndex(
            "createdAt",
            "createdAt",
            {
              unique: false,
            }
          );
        }
      }
    },
  }
);

/* =========================================================
   POSTS
========================================================= */

export async function getPosts() {
  const db =
    await dbPromise;

  const posts =
    await db.getAll(
      "posts"
    );

  return posts.sort(
    (a, b) =>
      (b.createdAt || 0) -
      (a.createdAt || 0)
  );
}

export async function getPost(
  id
) {
  const db =
    await dbPromise;

  return db.get(
    "posts",
    id
  );
}

export async function savePost(
  post
) {
  const db =
    await dbPromise;

  await db.put(
    "posts",
    post
  );

  return post;
}

export async function deletePost(
  id
) {
  const db =
    await dbPromise;

  await db.delete(
    "posts",
    id
  );
}

export async function clearPosts() {
  const db =
    await dbPromise;

  await db.clear(
    "posts"
  );
}

/* =========================================================
   STORIES
========================================================= */

export async function getStories() {
  const db =
    await dbPromise;

  const stories =
    await db.getAll(
      "stories"
    );

  const now =
    Date.now();

  const active = [];

  for (
    const story of stories
  ) {
    if (
      story.expiresAt &&
      story.expiresAt <= now
    ) {
      await db.delete(
        "stories",
        story.id
      );
    } else {
      active.push(
        story
      );
    }
  }

  return active.sort(
    (a, b) =>
      (a.createdAt || 0) -
      (b.createdAt || 0)
  );
}

export async function getStory(
  id
) {
  const db =
    await dbPromise;

  return db.get(
    "stories",
    id
  );
}

export async function saveStory(
  story
) {
  const db =
    await dbPromise;

  await db.put(
    "stories",
    story
  );

  return story;
}

export async function deleteStory(
  id
) {
  const db =
    await dbPromise;

  await db.delete(
    "stories",
    id
  );
}

export async function clearStories() {
  const db =
    await dbPromise;

  await db.clear(
    "stories"
  );
}

/* =========================================================
   PROFILE
========================================================= */

export async function getProfile(
  id = "me"
) {
  const db =
    await dbPromise;

  return (
    (await db.get(
      "profiles",
      id
    )) || null
  );
}

export async function saveProfile(
  profile
) {
  const db =
    await dbPromise;

  const value = {
    ...profile,

    id:
      profile?.id ||
      "me",
  };

  await db.put(
    "profiles",
    value
  );

  return value;
}

export async function deleteProfile(
  id
) {
  const db =
    await dbPromise;

  await db.delete(
    "profiles",
    id
  );
}

/* =========================================================
   SOCIAL
========================================================= */

export async function getSocialState() {
  const db =
    await dbPromise;

  return (
    (await db.get(
      "social",
      "me-social"
    )) || null
  );
}

export async function saveSocialState(
  state
) {
  const db =
    await dbPromise;

  const value = {
    ...state,

    id:
      state?.id ||
      "me-social",
  };

  await db.put(
    "social",
    value
  );

  return value;
}

export async function clearSocialState() {
  const db =
    await dbPromise;

  await db.delete(
    "social",
    "me-social"
  );
}

/* =========================================================
   CHATS
========================================================= */

export async function getChats() {
  const db =
    await dbPromise;

  const chats =
    await db.getAll(
      "chats"
    );

  return chats.sort(
    (a, b) =>
      (b.updatedAt || 0) -
      (a.updatedAt || 0)
  );
}

export async function getChat(
  id
) {
  const db =
    await dbPromise;

  return db.get(
    "chats",
    id
  );
}

export async function saveChat(
  chat
) {
  const db =
    await dbPromise;

  await db.put(
    "chats",
    chat
  );

  return chat;
}

export async function deleteChat(
  id
) {
  const db =
    await dbPromise;

  const tx =
    db.transaction(
      [
        "chats",
        "messages",
      ],
      "readwrite"
    );

  await tx
    .objectStore(
      "chats"
    )
    .delete(id);

  const messagesStore =
    tx.objectStore(
      "messages"
    );

  const index =
    messagesStore.index(
      "chatId"
    );

  let cursor =
    await index.openCursor(
      id
    );

  while (cursor) {
    await cursor.delete();

    cursor =
      await cursor.continue();
  }

  await tx.done;
}

/* =========================================================
   MESSAGES
========================================================= */

export async function getMessages(
  chatId
) {
  const db =
    await dbPromise;

  const tx =
    db.transaction(
      "messages",
      "readonly"
    );

  const store =
    tx.objectStore(
      "messages"
    );

  let messages = [];

  if (
    store.indexNames.contains(
      "chatId"
    )
  ) {
    messages =
      await store
        .index("chatId")
        .getAll(chatId);
  } else {
    const all =
      await store.getAll();

    messages =
      all.filter(
        (message) =>
          message.chatId ===
          chatId
      );
  }

  await tx.done;

  return messages.sort(
    (a, b) =>
      (a.createdAt || 0) -
      (b.createdAt || 0)
  );
}

export async function getMessage(
  id
) {
  const db =
    await dbPromise;

  return db.get(
    "messages",
    id
  );
}

export async function saveMessage(
  message
) {
  const db =
    await dbPromise;

  await db.put(
    "messages",
    message
  );

  return message;
}

export async function deleteMessage(
  id
) {
  const db =
    await dbPromise;

  await db.delete(
    "messages",
    id
  );
}

export async function clearMessages(
  chatId
) {
  const db =
    await dbPromise;

  const tx =
    db.transaction(
      "messages",
      "readwrite"
    );

  const store =
    tx.objectStore(
      "messages"
    );

  const index =
    store.index(
      "chatId"
    );

  let cursor =
    await index.openCursor(
      chatId
    );

  while (cursor) {
    await cursor.delete();

    cursor =
      await cursor.continue();
  }

  await tx.done;
}

/* =========================================================
   EVENTS
========================================================= */

export async function getEvents() {
  const db =
    await dbPromise;

  const events =
    await db.getAll(
      "events"
    );

  return events.sort(
    (a, b) =>
      new Date(
        a.startAt
      ).getTime() -
      new Date(
        b.startAt
      ).getTime()
  );
}

export async function getEvent(
  id
) {
  const db =
    await dbPromise;

  return db.get(
    "events",
    id
  );
}

export async function saveEvent(
  event
) {
  const db =
    await dbPromise;

  await db.put(
    "events",
    event
  );

  return event;
}

export async function deleteEvent(
  id
) {
  const db =
    await dbPromise;

  await db.delete(
    "events",
    id
  );
}

export async function clearEvents() {
  const db =
    await dbPromise;

  await db.clear(
    "events"
  );
}

/* =========================================================
   LEGACY COMMUNITIES
========================================================= */

export async function getCommunities() {
  const db =
    await dbPromise;

  const communities =
    await db.getAll(
      "communities"
    );

  return communities.sort(
    (a, b) =>
      (b.updatedAt ||
        b.createdAt ||
        0) -
      (a.updatedAt ||
        a.createdAt ||
        0)
  );
}

export async function getCommunity(
  id
) {
  const db =
    await dbPromise;

  return db.get(
    "communities",
    id
  );
}

export async function saveCommunity(
  community
) {
  const db =
    await dbPromise;

  await db.put(
    "communities",
    community
  );

  return community;
}

export async function deleteCommunity(
  id
) {
  const db =
    await dbPromise;

  await db.delete(
    "communities",
    id
  );
}

export async function clearCommunities() {
  const db =
    await dbPromise;

  await db.clear(
    "communities"
  );
}

/* =========================================================
   SPACE ENGINE V2
========================================================= */

export async function getSpaces() {
  const db =
    await dbPromise;

  const spaces =
    await db.getAll(
      "spaces"
    );

  return spaces.sort(
    (a, b) =>
      (b.updatedAt ||
        b.createdAt ||
        0) -
      (a.updatedAt ||
        a.createdAt ||
        0)
  );
}

export async function getSpace(
  id
) {
  const db =
    await dbPromise;

  return db.get(
    "spaces",
    id
  );
}

export async function saveSpace(
  space
) {
  const db =
    await dbPromise;

  const value = {
    ...space,

    updatedAt:
      Date.now(),
  };

  await db.put(
    "spaces",
    value
  );

  return value;
}

export async function deleteSpace(
  id
) {
  const db =
    await dbPromise;

  await db.delete(
    "spaces",
    id
  );
}

export async function clearSpaces() {
  const db =
    await dbPromise;

  await db.clear(
    "spaces"
  );
}