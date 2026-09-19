import {
  getChats,
  saveChat,
  saveMessage,
} from "./database";

function createId(
  prefix = "story-message"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function storyPreview(
  story
) {
  const text =
    String(
      story?.text || ""
    ).trim();

  if (text) {
    return text.length > 70
      ? `${text.slice(0, 70)}…`
      : text;
  }

  if (
    story?.type ===
    "image"
  ) {
    return "Фото в історії";
  }

  return "Історія";
}

async function ensureDirectChat(
  personId
) {
  if (!personId) {
    throw new Error(
      "STORY RECIPIENT ID IS REQUIRED"
    );
  }

  const chats =
    await getChats();

  let chat =
    chats.find(
      (item) =>
        item.type !==
          "group" &&
        item.personId ===
          personId
    );

  if (!chat) {
    chat = {
      id:
        `chat-${personId}`,

      type:
        "direct",

      personId,

      updatedAt:
        Date.now(),

      unread: 0,

      lastMessage:
        "Нова відповідь на історію",
    };

    await saveChat(
      chat
    );
  }

  return chat;
}

async function updateChatPreview(
  chat,
  text
) {
  await saveChat({
    ...chat,

    updatedAt:
      Date.now(),

    unread: 0,

    lastMessage:
      text,
  });
}

export async function sendStoryReply({
  story,
  text,
}) {
  const cleanText =
    String(
      text || ""
    ).trim();

  if (
    !story ||
    !cleanText ||
    story.authorId ===
      "me"
  ) {
    return false;
  }

  const chat =
    await ensureDirectChat(
      story.authorId
    );

  const message = {
    id:
      createId(
        "story-reply"
      ),

    chatId:
      chat.id,

    senderId:
      "me",

    type:
      "text",

    text:
      `↩ Відповідь на історію\n${cleanText}`,

    createdAt:
      Date.now(),

    pinned:
      false,

    myReaction:
      null,

    replyTo:
      null,

    storyReply: {
      storyId:
        story.id,

      authorId:
        story.authorId,

      authorName:
        story.authorName,

      type:
        story.type,

      media:
        story.media ||
        null,

      storyText:
        story.text ||
        "",

      preview:
        storyPreview(
          story
        ),
    },
  };

  await saveMessage(
    message
  );

  await updateChatPreview(
    chat,
    `↩ ${cleanText}`
  );

  return true;
}

export async function sendStoryReaction({
  story,
  emoji,
}) {
  if (
    !story ||
    !emoji ||
    story.authorId ===
      "me"
  ) {
    return false;
  }

  const chat =
    await ensureDirectChat(
      story.authorId
    );

  const message = {
    id:
      createId(
        "story-reaction"
      ),

    chatId:
      chat.id,

    senderId:
      "me",

    type:
      "text",

    text:
      `${emoji} Реакція на історію`,

    createdAt:
      Date.now(),

    pinned:
      false,

    myReaction:
      null,

    replyTo:
      null,

    storyReaction: {
      storyId:
        story.id,

      authorId:
        story.authorId,

      authorName:
        story.authorName,

      emoji,

      type:
        story.type,

      media:
        story.media ||
        null,

      storyText:
        story.text ||
        "",

      preview:
        storyPreview(
          story
        ),
    },
  };

  await saveMessage(
    message
  );

  await updateChatPreview(
    chat,
    `${emoji} Реакція на історію`
  );

  return true;
}