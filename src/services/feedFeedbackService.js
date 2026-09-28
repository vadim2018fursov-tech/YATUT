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

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
        data?.hint ||
        data?.details ||
        data?.error ||
        "Feed feedback request failed."
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

export async function loadFeedFeedback(
  session
) {
  if (
    !session?.user?.id
  ) {
    return {
      hiddenPostIds: [],
      mutedAuthorIds: [],
    };
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/feed_feedback`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "select",
    "post_id,author_id,kind,created_at"
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

  const hiddenPostIds =
    [];

  const mutedAuthorIds =
    [];

  for (
    const row of
    Array.isArray(rows)
      ? rows
      : []
  ) {
    if (
      row.kind ===
        "not_interested" &&
      row.post_id
    ) {
      hiddenPostIds.push(
        row.post_id
      );
    }

    if (
      row.kind ===
        "less_from_author" &&
      row.author_id
    ) {
      mutedAuthorIds.push(
        row.author_id
      );
    }
  }

  return {
    hiddenPostIds:
      [
        ...new Set(
          hiddenPostIds
        ),
      ],
    mutedAuthorIds:
      [
        ...new Set(
          mutedAuthorIds
        ),
      ],
  };
}

export async function removeFeedFeedback(
  session,
  {
    kind,
    postId = null,
    authorId = null,
  }
) {
  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/feed_feedback`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "kind",
    `eq.${kind}`
  );

  if (postId) {
    url.searchParams.set(
      "post_id",
      `eq.${postId}`
    );
  }

  if (authorId) {
    url.searchParams.set(
      "author_id",
      `eq.${authorId}`
    );
  }

  const response =
    await fetch(
      url,
      {
        method:
          "DELETE",
        headers:
          headers(
            session
          ),
      }
    );

  await parseResponse(
    response
  );
}

export async function addFeedFeedback(
  session,
  {
    kind,
    postId = null,
    authorId = null,
  }
) {
  if (
    !session?.user?.id
  ) {
    throw new Error(
      "Потрібен вхід у ЯТУТ."
    );
  }

  const safeKind =
    [
      "not_interested",
      "less_from_author",
    ].includes(
      kind
    )
      ? kind
      : null;

  if (!safeKind) {
    throw new Error(
      "Невідомий тип рекомендацій."
    );
  }

  await removeFeedFeedback(
    session,
    {
      kind:
        safeKind,
      postId,
      authorId,
    }
  );

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/feed_feedback`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "return=minimal",
            }
          ),
        body:
          JSON.stringify({
            user_id:
              session.user.id,
            kind:
              safeKind,
            post_id:
              safeKind ===
                "not_interested"
                ? postId
                : null,
            author_id:
              safeKind ===
                "less_from_author"
                ? authorId
                : null,
          }),
      }
    );

  await parseResponse(
    response
  );

  return true;
}
