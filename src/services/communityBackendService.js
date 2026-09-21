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

async function callRpc(
  session,
  name,
  body = {}
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify(
            body
          ),
      }
    );

  return parseResponse(
    response
  );
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

  const memberRoles =
    Object.fromEntries(
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
          ) => [
            member.user_id,
            member.role ||
            "member",
          ]
        )
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
    memberRoles,
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

export async function getBackendCommunityMembershipState(
  session,
  communityId
) {
  if (
    !session?.user?.id ||
    !communityId
  ) {
    return {
      role: null,
      requestId: null,
      requestStatus: null,
    };
  }

  const memberUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_members`
    );

  memberUrl.searchParams.set(
    "community_id",
    `eq.${communityId}`
  );

  memberUrl.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  memberUrl.searchParams.set(
    "select",
    "role"
  );

  memberUrl.searchParams.set(
    "limit",
    "1"
  );

  const requestUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_join_requests`
    );

  requestUrl.searchParams.set(
    "community_id",
    `eq.${communityId}`
  );

  requestUrl.searchParams.set(
    "requester_id",
    `eq.${session.user.id}`
  );

  requestUrl.searchParams.set(
    "select",
    "id,status,updated_at"
  );

  requestUrl.searchParams.set(
    "order",
    "updated_at.desc"
  );

  requestUrl.searchParams.set(
    "limit",
    "1"
  );

  const [
    memberResponse,
    requestResponse,
  ] =
    await Promise.all([
      fetch(
        memberUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        requestUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
    ]);

  const [
    memberRows,
    requestRows,
  ] =
    await Promise.all([
      parseResponse(
        memberResponse
      ),
      parseResponse(
        requestResponse
      ),
    ]);

  const member =
    Array.isArray(
      memberRows
    )
      ? memberRows[0] ||
        null
      : null;

  const request =
    Array.isArray(
      requestRows
    )
      ? requestRows[0] ||
        null
      : null;

  return {
    role:
      member?.role ||
      null,
    requestId:
      request?.id ||
      null,
    requestStatus:
      request?.status ||
      null,
  };
}

export async function loadBackendCommunityMembers(
  session,
  communityId
) {
  if (
    !session?.user?.id ||
    !communityId
  ) {
    return [];
  }

  const rows =
    await loadMembers(
      session,
      [
        communityId,
      ]
    );

  const ids =
    [
      ...new Set(
        rows
          .map(
            (
              row
            ) =>
              row.user_id
          )
          .filter(
            Boolean
          )
      ),
    ];

  let profiles =
    [];

  if (
    ids.length
  ) {
    const profileUrl =
      new URL(
        `${SUPABASE_URL}/rest/v1/profiles`
      );

    profileUrl.searchParams.set(
      "id",
      `in.(${ids.join(",")})`
    );

    profileUrl.searchParams.set(
      "select",
      "id,username,full_name,avatar_url,verified"
    );

    const profileResponse =
      await fetch(
        profileUrl,
        {
          headers:
            headers(
              session
            ),
        }
      );

    const data =
      await parseResponse(
        profileResponse
      );

    profiles =
      Array.isArray(
        data
      )
        ? data
        : [];
  }

  const byId =
    new Map(
      profiles.map(
        (
          profile
        ) => [
          profile.id,
          profile,
        ]
      )
    );

  return rows
    .map(
      (
        row
      ) => {
        const profile =
          byId.get(
            row.user_id
          );

        const name =
          profile?.full_name ||
          profile?.username ||
          (
            row.user_id ===
              session.user.id
              ? session.user
                  ?.user_metadata
                  ?.full_name ||
                session.user.email
                  ?.split("@")[0] ||
                "Ви"
              : "Учасник ЯТУТ"
          );

        return {
          id:
            row.user_id,
          role:
            row.role ||
            "member",
          joinedAt:
            timestamp(
              row.joined_at
            ),
          name,
          username:
            profile?.username ||
            "",
          avatar:
            profile?.avatar_url ||
            null,
          verified:
            Boolean(
              profile?.verified
            ),
          initial:
            name
              .trim()
              .charAt(0)
              .toUpperCase() ||
            "Я",
        };
      }
    )
    .sort(
      (
        left,
        right
      ) => {
        const priority = {
          owner: 0,
          admin: 1,
          moderator: 2,
          member: 3,
        };

        return (
          (
            priority[
              left.role
            ] ??
            9
          ) -
          (
            priority[
              right.role
            ] ??
            9
          )
        );
      }
    );
}

export async function loadBackendCommunityJoinRequests(
  session,
  communityId
) {
  if (
    !session?.user?.id ||
    !communityId
  ) {
    return [];
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/community_join_requests`
    );

  url.searchParams.set(
    "community_id",
    `eq.${communityId}`
  );

  url.searchParams.set(
    "status",
    "eq.pending"
  );

  url.searchParams.set(
    "select",
    "id,requester_id,created_at"
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

  const safeRows =
    Array.isArray(
      rows
    )
      ? rows
      : [];

  const ids =
    [
      ...new Set(
        safeRows
          .map(
            (
              row
            ) =>
              row.requester_id
          )
          .filter(
            Boolean
          )
      ),
    ];

  let profiles =
    [];

  if (
    ids.length
  ) {
    const profileUrl =
      new URL(
        `${SUPABASE_URL}/rest/v1/profiles`
      );

    profileUrl.searchParams.set(
      "id",
      `in.(${ids.join(",")})`
    );

    profileUrl.searchParams.set(
      "select",
      "id,username,full_name,avatar_url,verified"
    );

    const profileResponse =
      await fetch(
        profileUrl,
        {
          headers:
            headers(
              session
            ),
        }
      );

    const data =
      await parseResponse(
        profileResponse
      );

    profiles =
      Array.isArray(
        data
      )
        ? data
        : [];
  }

  const byId =
    new Map(
      profiles.map(
        (
          profile
        ) => [
          profile.id,
          profile,
        ]
      )
    );

  return safeRows.map(
    (
      row
    ) => {
      const profile =
        byId.get(
          row.requester_id
        );

      const name =
        profile?.full_name ||
        profile?.username ||
        "Користувач ЯТУТ";

      return {
        id:
          row.id,
        requesterId:
          row.requester_id,
        createdAt:
          timestamp(
            row.created_at
          ),
        name,
        username:
          profile?.username ||
          "",
        avatar:
          profile?.avatar_url ||
          null,
        verified:
          Boolean(
            profile?.verified
          ),
        initial:
          name
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "Я",
      };
    }
  );
}

export async function joinBackendCommunity(
  session,
  communityId
) {
  return Boolean(
    await callRpc(
      session,
      "join_public_community",
      {
        target_community_id:
          communityId,
      }
    )
  );
}

export async function requestBackendCommunityJoin(
  session,
  communityId
) {
  return callRpc(
    session,
    "request_community_membership",
    {
      target_community_id:
        communityId,
    }
  );
}

export async function cancelBackendCommunityJoinRequest(
  session,
  communityId
) {
  return Boolean(
    await callRpc(
      session,
      "cancel_community_join_request",
      {
        target_community_id:
          communityId,
      }
    )
  );
}

export async function leaveBackendCommunity(
  session,
  communityId
) {
  return Boolean(
    await callRpc(
      session,
      "leave_community",
      {
        target_community_id:
          communityId,
      }
    )
  );
}

export async function respondBackendCommunityJoinRequest(
  session,
  requestId,
  accept
) {
  return Boolean(
    await callRpc(
      session,
      "respond_community_join_request",
      {
        target_request_id:
          requestId,
        accept_request:
          Boolean(
            accept
          ),
      }
    )
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
