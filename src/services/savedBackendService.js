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
    throw new Error(
      data?.message ||
      data?.hint ||
      data?.details ||
      data?.error ||
      "Saved backend request failed."
    );
  }

  return data;
}

function rowKey(
  type,
  sourceId
) {
  return `${String(
    type
  )}:${String(
    sourceId
  )}`;
}

export async function loadBackendSavedItems(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/saved_items`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "select",
    "item_type,source_id,snapshot,saved_at,updated_at"
  );

  url.searchParams.set(
    "order",
    "saved_at.desc"
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

  return (
    Array.isArray(
      rows
    )
      ? rows
      : []
  )
    .map(
      (
        row
      ) => {
        const snapshot =
          row.snapshot &&
          typeof row.snapshot ===
            "object"
            ? row.snapshot
            : {};

        return {
          ...snapshot,
          type:
            row.item_type,
          sourceId:
            row.source_id,
          id:
            rowKey(
              row.item_type,
              row.source_id
            ),
          savedAt:
            Date.parse(
              row.saved_at
            ) ||
            Number(
              snapshot.savedAt ||
              Date.now()
            ),
          updatedAt:
            Date.parse(
              row.updated_at
            ) ||
            Number(
              snapshot.updatedAt ||
              Date.now()
            ),
        };
      }
    )
    .filter(
      (
        item
      ) =>
        item.type &&
        item.sourceId
    );
}

export async function syncBackendSavedItems(
  session,
  items = []
) {
  if (
    !session?.user?.id
  ) {
    return;
  }

  const userId =
    session.user.id;

  const normalized =
    (
      Array.isArray(
        items
      )
        ? items
        : []
    )
      .filter(
        (
          item
        ) =>
          item?.type &&
          item?.sourceId
      );

  const currentUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/saved_items`
    );

  currentUrl.searchParams.set(
    "user_id",
    `eq.${userId}`
  );

  currentUrl.searchParams.set(
    "select",
    "item_type,source_id"
  );

  const currentResponse =
    await fetch(
      currentUrl,
      {
        headers:
          headers(
            session
          ),
      }
    );

  const currentRows =
    await parseResponse(
      currentResponse
    );

  const wanted =
    new Set(
      normalized.map(
        (
          item
        ) =>
          rowKey(
            item.type,
            item.sourceId
          )
      )
    );

  const stale =
    (
      Array.isArray(
        currentRows
      )
        ? currentRows
        : []
    ).filter(
      (
        row
      ) =>
        !wanted.has(
          rowKey(
            row.item_type,
            row.source_id
          )
        )
    );

  if (
    stale.length
  ) {
    await Promise.all(
      stale.map(
        async (
          row
        ) => {
          const url =
            new URL(
              `${SUPABASE_URL}/rest/v1/saved_items`
            );

          url.searchParams.set(
            "user_id",
            `eq.${userId}`
          );

          url.searchParams.set(
            "item_type",
            `eq.${row.item_type}`
          );

          url.searchParams.set(
            "source_id",
            `eq.${row.source_id}`
          );

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
      )
    );
  }

  if (
    !normalized.length
  ) {
    return;
  }

  const now =
    new Date().toISOString();

  const rows =
    normalized.map(
      (
        item
      ) => ({
        user_id:
          userId,
        item_type:
          String(
            item.type
          ),
        source_id:
          String(
            item.sourceId
          ),
        snapshot:
          item,
        saved_at:
          new Date(
            Number(
              item.savedAt ||
              Date.now()
            )
          ).toISOString(),
        updated_at:
          now,
      })
    );

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/saved_items?on_conflict=user_id,item_type,source_id`,
      {
        method:
          "POST",
        headers:
          headers(
            session,
            {
              Prefer:
                "resolution=merge-duplicates,return=minimal",
            }
          ),
        body:
          JSON.stringify(
            rows
          ),
      }
    );

  await parseResponse(
    response
  );
}
