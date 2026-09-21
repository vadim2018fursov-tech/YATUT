import {
  createChatMediaSignedUrl,
} from "./storageService";

const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

function headers(
  session,
  extra = {}
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
    ...extra,
  };
}

async function parseResponse(
  response
) {
  const text =
    await response.text();

  let data =
    null;

  try {
    data =
      text
        ? JSON.parse(
            text
          )
        : null;
  } catch {
    data =
      text;
  }

  if (
    !response.ok
  ) {
    const error =
      new Error(
        data?.message ||
        data?.hint ||
        data?.details ||
        data?.error ||
        "Chat backend request failed."
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

async function getProfile(
  session,
  userId
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

  url.searchParams.set(
    "id",
    `eq.${userId}`
  );

  url.searchParams.set(
    "select",
    "id,username,full_name,avatar_url,city,verified"
  );

  url.searchParams.set(
    "limit",
    "1"
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

  const rows =
    await parseResponse(
      response
    );

  const profile =
    Array.isArray(
      rows
    )
      ? rows[0] ||
        null
      : null;

  if (!profile) {
    return null;
  }

  const name =
    profile.full_name ||
    profile.username ||
    "Користувач";

  return {
    id:
      profile.id,
    name,
    username:
      profile.username ||
      "user",
    initials:
      name
        .trim()
        .charAt(0)
        .toUpperCase() ||
      "?",
    avatar:
      profile.avatar_url ||
      null,
    city:
      profile.city ||
      "",
    verified:
      Boolean(
        profile.verified
      ),
    online:
      false,
  };
}

async function getConversation(
  session,
  conversationId
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/conversations`
    );

  url.searchParams.set(
    "id",
    `eq.${conversationId}`
  );

  url.searchParams.set(
    "select",
    "id,type,title,created_by,created_at,updated_at"
  );

  url.searchParams.set(
    "limit",
    "1"
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

  const rows =
    await parseResponse(
      response
    );

  return Array.isArray(
    rows
  )
    ? rows[0] ||
        null
    : null;
}

async function getOtherMemberId(
  session,
  conversationId
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/conversation_members`
    );

  url.searchParams.set(
    "conversation_id",
    `eq.${conversationId}`
  );

  url.searchParams.set(
    "user_id",
    `neq.${session.user.id}`
  );

  url.searchParams.set(
    "select",
    "user_id"
  );

  url.searchParams.set(
    "limit",
    "1"
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

  const rows =
    await parseResponse(
      response
    );

  return Array.isArray(
    rows
  )
    ? rows[0]
        ?.user_id ||
        null
    : null;
}

async function getLatestMessage(
  session,
  conversationId
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/messages`
    );

  url.searchParams.set(
    "conversation_id",
    `eq.${conversationId}`
  );

  url.searchParams.set(
    "select",
    "body,kind,created_at"
  );

  url.searchParams.set(
    "order",
    "created_at.desc"
  );

  url.searchParams.set(
    "limit",
    "1"
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

  const rows =
    await parseResponse(
      response
    );

  return Array.isArray(
    rows
  )
    ? rows[0] ||
        null
    : null;
}

function messagePreview(
  message
) {
  if (!message) {
    return "Новий діалог";
  }

  if (
    message.kind ===
    "image"
  ) {
    return "🖼 Фото";
  }

  if (
    message.kind ===
    "video"
  ) {
    return "🎥 Відео";
  }

  if (
    message.kind ===
    "audio"
  ) {
    return "🎙 Голосове";
  }

  if (
    message.kind ===
    "file"
  ) {
    return "📎 Файл";
  }

  return (
    message.body ||
    "Повідомлення"
  );
}

async function chatFromConversation(
  session,
  conversation
) {
  if (!conversation) {
    return null;
  }

  let person =
    null;

  let personId =
    null;

  if (
    conversation.type ===
    "direct"
  ) {
    personId =
      await getOtherMemberId(
        session,
        conversation.id
      );

    if (
      personId
    ) {
      person =
        await getProfile(
          session,
          personId
        );
    }
  }

  const latest =
    await getLatestMessage(
      session,
      conversation.id
    );

  return {
    id:
      conversation.id,
    backend:
      true,
    type:
      conversation.type,
    personId,
    person,
    title:
      conversation.title ||
      person?.name ||
      "Чат ЯТУТ",
    initials:
      person?.initials ||
      conversation.title
        ?.charAt(0)
        ?.toUpperCase() ||
      "Я",
    updatedAt:
      Date.parse(
        conversation.updated_at ||
        conversation.created_at ||
        new Date().toISOString()
      ),
    unread:
      0,
    lastMessage:
      messagePreview(
        latest
      ),
  };
}

export async function listBackendChats(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/conversation_members`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "select",
    "conversation_id"
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

  const rows =
    await parseResponse(
      response
    );

  const ids =
    [
      ...new Set(
        (
          Array.isArray(
            rows
          )
            ? rows
            : []
        ).map(
          (
            row
          ) =>
            row.conversation_id
        )
      ),
    ];

  const conversations =
    await Promise.all(
      ids.map(
        (
          id
        ) =>
          getConversation(
            session,
            id
          )
      )
    );

  const chats =
    await Promise.all(
      conversations
        .filter(Boolean)
        .map(
          (
            conversation
          ) =>
            chatFromConversation(
              session,
              conversation
            )
        )
    );

  return chats
    .filter(Boolean)
    .sort(
      (
        left,
        right
      ) =>
        Number(
          right.updatedAt ||
          0
        ) -
        Number(
          left.updatedAt ||
          0
        )
    );
}

export async function openBackendDirectChat(
  session,
  personId
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_or_create_direct_conversation`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            other_user_id:
              personId,
          }),
      }
    );

  const conversationId =
    await parseResponse(
      response
    );

  const conversation =
    await getConversation(
      session,
      conversationId
    );

  return chatFromConversation(
    session,
    conversation
  );
}

export async function markBackendChatRead(
  session,
  conversationId
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/mark_conversation_read`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            target_conversation_id:
              conversationId,
          }),
      }
    );

  return parseResponse(
    response
  );
}

export async function getBackendOtherReadAt(
  session,
  conversationId
) {
  if (
    !session?.user?.id
  ) {
    return null;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/conversation_members`
    );

  url.searchParams.set(
    "conversation_id",
    `eq.${conversationId}`
  );

  url.searchParams.set(
    "user_id",
    `neq.${session.user.id}`
  );

  url.searchParams.set(
    "select",
    "last_read_at"
  );

  url.searchParams.set(
    "limit",
    "1"
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

  const rows =
    await parseResponse(
      response
    );

  const value =
    Array.isArray(
      rows
    )
      ? rows[0]
          ?.last_read_at ||
        null
      : null;

  return value
    ? Date.parse(
        value
      )
    : null;
}

export async function loadBackendMessages(
  session,
  conversationId
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/messages`
    );

  url.searchParams.set(
    "conversation_id",
    `eq.${conversationId}`
  );

  url.searchParams.set(
    "select",
    "id,conversation_id,sender_id,body,kind,reply_to,media_path,file_name,mime_type,duration_ms,created_at,edited_at,deleted_at"
  );

  url.searchParams.set(
    "order",
    "created_at.asc"
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

  const rows =
    await parseResponse(
      response
    );

  const visibleRows =
    (
      Array.isArray(
        rows
      )
        ? rows
        : []
    ).filter(
      (
        row
      ) =>
        !row.deleted_at
    );

  return Promise.all(
    visibleRows.map(
      async (
        row
      ) => {
        let fileUrl =
          null;

        if (
          row.media_path
        ) {
          try {
            fileUrl =
              await createChatMediaSignedUrl(
                session,
                row.media_path,
                3600
              );
          } catch (
            error
          ) {
            console.warn(
              "CHAT MEDIA URL ERROR:",
              error
            );
          }
        }

        return {
          id:
            row.id,
          chatId:
            row.conversation_id,
          senderId:
            row.sender_id ===
            session.user.id
              ? "me"
              : row.sender_id,
          type:
            row.kind ===
            "audio"
              ? "voice"
              : row.kind,
          text:
            row.body ||
            "",
          fileUrl,
          mediaPath:
            row.media_path ||
            null,
          fileName:
            row.file_name ||
            null,
          mimeType:
            row.mime_type ||
            null,
          voiceDuration:
            row.duration_ms
              ? Math.round(
                  row.duration_ms /
                  1000
                )
              : null,
          createdAt:
            Date.parse(
              row.created_at
            ),
          edited:
            Boolean(
              row.edited_at
            ),
          editedAt:
            row.edited_at
              ? Date.parse(
                  row.edited_at
                )
              : null,
          pinned:
            false,
          myReaction:
            null,
          replyTo:
            row.reply_to
              ? {
                  id:
                    row.reply_to,
                }
              : null,
          backend:
            true,
        };
      }
    )
  );
}

export async function sendBackendMessage(
  session,
  conversationId,
  {
    text = "",
    kind = "text",
    replyToId = null,
    mediaPath = null,
    fileName = null,
    mimeType = null,
    durationMs = null,
  } = {}
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "return=representation",
            }
          ),
        body:
          JSON.stringify({
            conversation_id:
              conversationId,
            sender_id:
              session.user.id,
            body:
              text,
            kind,
            reply_to:
              replyToId,
            media_path:
              mediaPath,
            file_name:
              fileName,
            mime_type:
              mimeType,
            duration_ms:
              durationMs,
          }),
      }
    );

  const rows =
    await parseResponse(
      response
    );

  const row =
    Array.isArray(
      rows
    )
      ? rows[0] ||
        null
      : null;

  if (!row) {
    return null;
  }

  let fileUrl =
    null;

  if (
    row.media_path
  ) {
    try {
      fileUrl =
        await createChatMediaSignedUrl(
          session,
          row.media_path,
          3600
        );
    } catch (
      error
    ) {
      console.warn(
        "CHAT MEDIA URL ERROR:",
        error
      );
    }
  }

  return {
    id:
      row.id,
    chatId:
      row.conversation_id,
    senderId:
      "me",
    type:
      row.kind ===
      "audio"
        ? "voice"
        : row.kind,
    text:
      row.body ||
      "",
    fileUrl,
    mediaPath:
      row.media_path ||
      null,
    fileName:
      row.file_name ||
      null,
    mimeType:
      row.mime_type ||
      null,
    voiceDuration:
      row.duration_ms
        ? Math.round(
            row.duration_ms /
            1000
          )
        : null,
    createdAt:
      Date.parse(
        row.created_at
      ),
    edited:
      false,
    pinned:
      false,
    myReaction:
      null,
    replyTo:
      row.reply_to
        ? {
            id:
              row.reply_to,
          }
        : null,
    backend:
      true,
  };
}

export async function editBackendMessage(
  session,
  messageId,
  text
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/messages?id=eq.${encodeURIComponent(
        messageId
      )}`,
      {
        method:
          "PATCH",
        headers:
          headers(
            session,
            {
              Prefer:
                "return=representation",
            }
          ),
        body:
          JSON.stringify({
            body:
              text,
            edited_at:
              new Date().toISOString(),
          }),
      }
    );

  return parseResponse(
    response
  );
}

export async function deleteBackendMessage(
  session,
  messageId
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/messages?id=eq.${encodeURIComponent(
        messageId
      )}`,
      {
        method:
          "PATCH",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify({
            deleted_at:
              new Date().toISOString(),
          }),
      }
    );

  return parseResponse(
    response
  );
}
