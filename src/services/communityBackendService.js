import {
  uploadCommunityImage,
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
        "Community backend request failed."
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

function isUuid(
  value
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(
      value ||
      ""
    )
  );
}

function timestamp(
  value,
  fallback = Date.now()
) {
  const parsed =
    Date.parse(
      value
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : fallback;
}

function mapCommunity(
  row,
  members = []
) {
  const data =
    row?.space_data &&
    typeof row.space_data ===
      "object"
      ? row.space_data
      : {};

  const memberIds =
    (
      Array.isArray(
        members
      )
        ? members
        : []
    )
      .filter(
        (
          member
        ) =>
          member.community_id ===
          row.id
      )
      .map(
        (
          member
        ) =>
          member.user_id
      );

  const normalizedMembers =
    memberIds.length
      ? memberIds
      : [
          row.owner_id,
        ].filter(
          Boolean
        );

  return {
    ...data,
    id:
      row.legacy_id ||
      row.id,
    backendId:
      row.id,
    backend:
      true,
    title:
      row.title ||
      data.title ||
      "Спільнота",
    username:
      row.username ||
      data.username ||
      "community",
    description:
      row.description ||
      data.description ||
      "",
    type:
      row.community_type ||
      data.type ||
      "public",
    templateId:
      row.template_id ||
      data.templateId ||
      row.community_type ||
      "public-page",
    scale:
      row.scale ||
      data.scale ||
      "small",
    privacy:
      row.privacy ||
      data.privacy ||
      "public",
    city:
      row.city ||
      data.city ||
      "",
    avatar:
      row.avatar_url ||
      data.avatar ||
      null,
    cover:
      row.cover_url ||
      data.cover ||
      null,
    ownerId:
      row.owner_id,
    members:
      normalizedMembers,
    modules:
      Array.isArray(
        row.modules
      )
        ? row.modules
        : (
            Array.isArray(
              data.modules
            )
              ? data.modules
              : []
          ),
    permissions:
      row.permissions &&
      typeof row.permissions ===
        "object"
        ? row.permissions
        : (
            data.permissions ||
            {}
          ),
    school:
      row.school_data ||
      data.school ||
      null,
    posts:
      Array.isArray(
        data.posts
      )
        ? data.posts
        : [],
    createdAt:
      timestamp(
        row.created_at,
        Number(
          data.createdAt ||
          Date.now()
        )
      ),
    updatedAt:
      timestamp(
        row.updated_at,
        Number(
          data.updatedAt ||
          Date.now()
        )
      ),
  };
}

async function loadMembers(
  session,
  communityIds
) {
  const ids =
    [
      ...new Set(
        (
          Array.isArray(
            communityIds
          )
            ? communityIds
            : []
        ).filter(
          Boolean
        )
      ),
    ];

  if (
    !ids.length
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_members`
    );

  url.searchParams.set(
    "community_id",
    `in.(${ids.join(",")})`
  );

  url.searchParams.set(
    "select",
    "community_id,user_id,role,joined_at"
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
    ? rows
    : [];
}

async function loadRowsByIds(
  session,
  ids
) {
  if (
    !ids.length
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/communities`
    );

  url.searchParams.set(
    "id",
    `in.(${ids.join(",")})`
  );

  url.searchParams.set(
    "select",
    "*"
  );

  url.searchParams.set(
    "order",
    "updated_at.desc"
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
    ? rows
    : [];
}

export async function loadBackendCommunities(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const membershipUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_members`
    );

  membershipUrl.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  membershipUrl.searchParams.set(
    "select",
    "community_id"
  );

  const membershipResponse =
    await fetch(
      membershipUrl,
      {
        headers:
          headers(
            session
          ),
      }
    );

  const membershipRows =
    await parseResponse(
      membershipResponse
    );

  const ids =
    [
      ...new Set(
        (
          Array.isArray(
            membershipRows
          )
            ? membershipRows
            : []
        )
          .map(
            (
              row
            ) =>
              row.community_id
          )
          .filter(
            Boolean
          )
      ),
    ];

  const rows =
    await loadRowsByIds(
      session,
      ids
    );

  const members =
    await loadMembers(
      session,
      rows.map(
        (
          row
        ) =>
          row.id
      )
    );

  return rows.map(
    (
      row
    ) =>
      mapCommunity(
        row,
        members
      )
  );
}

async function findOwnedByLegacyId(
  session,
  legacyId
) {
  if (
    !legacyId ||
    !session?.user?.id
  ) {
    return null;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/communities`
    );

  url.searchParams.set(
    "owner_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "legacy_id",
    `eq.${legacyId}`
  );

  url.searchParams.set(
    "select",
    "*"
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

export async function loadBackendCommunity(
  session,
  identifier
) {
  if (
    !session?.user?.id ||
    !identifier
  ) {
    return null;
  }

  const attempts =
    isUuid(
      identifier
    )
      ? [
          [
            "id",
            identifier,
          ],
        ]
      : [
          [
            "legacy_id",
            identifier,
          ],
          [
            "username",
            identifier,
          ],
        ];

  for (
    const [
      field,
      value,
    ] of attempts
  ) {
    const url =
      new URL(
        `${SUPABASE_URL}/rest/v1/communities`
      );

    url.searchParams.set(
      field,
      `eq.${value}`
    );

    url.searchParams.set(
      "select",
      "*"
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

    const row =
      Array.isArray(
        rows
      )
        ? rows[0] ||
          null
        : null;

    if (
      row
    ) {
      const members =
        await loadMembers(
          session,
          [
            row.id,
          ]
        );

      return mapCommunity(
        row,
        members
      );
    }
  }

  return null;
}

async function resolveImage(
  session,
  value,
  kind
) {
  if (
    !value ||
    !String(
      value
    ).startsWith(
      "data:image/"
    )
  ) {
    return value ||
      null;
  }

  const response =
    await fetch(
      value
    );

  const blob =
    await response.blob();

  const uploaded =
    await uploadCommunityImage(
      session,
      blob,
      kind
    );

  return uploaded?.url ||
    null;
}

function payloadForSpace(
  session,
  space,
  avatar,
  cover
) {
  const snapshot = {
    ...space,
    avatar,
    cover,
  };

  delete snapshot.backendId;
  delete snapshot.backend;

  return {
    owner_id:
      session.user.id,
    legacy_id:
      String(
        space.id ||
        ""
      ) ||
      null,
    username:
      String(
        space.username ||
        ""
      )
        .trim()
        .replace(
          /^@/,
          ""
        ),
    title:
      String(
        space.title ||
        "Спільнота"
      ).trim(),
    description:
      String(
        space.description ||
        ""
      ),
    community_type:
      space.type ||
      "public",
    template_id:
      space.templateId ||
      space.type ||
      "public-page",
    scale:
      space.scale ||
      "small",
    privacy:
      [
        "public",
        "request",
        "private",
      ].includes(
        space.privacy
      )
        ? space.privacy
        : "public",
    city:
      space.city ||
      null,
    avatar_url:
      avatar ||
      null,
    cover_url:
      cover ||
      null,
    modules:
      Array.isArray(
        space.modules
      )
        ? space.modules
        : [],
    permissions:
      space.permissions &&
      typeof space.permissions ===
        "object"
        ? space.permissions
        : {},
    school_data:
      space.school ||
      null,
    space_data:
      snapshot,
    updated_at:
      new Date().toISOString(),
  };
}

export async function saveBackendCommunity(
  session,
  space
) {
  if (
    !session?.user?.id ||
    !space
  ) {
    return null;
  }

  const [
    avatar,
    cover,
  ] =
    await Promise.all([
      resolveImage(
        session,
        space.avatar,
        "avatar"
      ),
      resolveImage(
        session,
        space.cover,
        "cover"
      ),
    ]);

  const body =
    payloadForSpace(
      session,
      space,
      avatar,
      cover
    );

  let backendId =
    space.backendId ||
    null;

  if (
    !backendId &&
    space.id
  ) {
    const existing =
      await findOwnedByLegacyId(
        session,
        space.id
      );

    backendId =
      existing?.id ||
      null;
  }

  let response =
    null;

  if (
    backendId
  ) {
    response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/communities?id=eq.${encodeURIComponent(
          backendId
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
            JSON.stringify(
              body
            ),
        }
      );
  } else {
    response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/communities`,
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
            JSON.stringify(
              body
            ),
        }
      );
  }

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

  if (
    !row
  ) {
    return null;
  }

  const members =
    await loadMembers(
      session,
      [
        row.id,
      ]
    );

  return mapCommunity(
    row,
    members
  );
}

export async function deleteBackendCommunity(
  session,
  space
) {
  if (
    !session?.user?.id ||
    !space
  ) {
    return false;
  }

  let backendId =
    space.backendId ||
    (
      isUuid(
        space.id
      )
        ? space.id
        : null
    );

  if (
    !backendId &&
    space.id
  ) {
    const existing =
      await findOwnedByLegacyId(
        session,
        space.id
      );

    backendId =
      existing?.id ||
      null;
  }

  if (
    !backendId
  ) {
    return false;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/communities?id=eq.${encodeURIComponent(
        backendId
      )}`,
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

  return true;
}
