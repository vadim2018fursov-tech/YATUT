import {
  createStoryMediaSignedUrl,
  deleteStorageObject,
  uploadStoryMedia,
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
    throw new Error(
      data?.message ||
      data?.hint ||
      data?.details ||
      data?.error ||
      "Story backend request failed."
    );
  }

  return data;
}

async function fetchProfiles(
  session,
  ids
) {
  const unique =
    [
      ...new Set(
        ids.filter(
          Boolean
        )
      ),
    ];

  if (!unique.length) {
    return {};
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/profiles`
    );

  url.searchParams.set(
    "id",
    `in.(${unique.join(",")})`
  );

  url.searchParams.set(
    "select",
    "id,username,full_name,avatar_url,verified"
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

  return Object.fromEntries(
    (
      Array.isArray(
        rows
      )
        ? rows
        : []
    ).map(
      (
        row
      ) => [
        row.id,
        row,
      ]
    )
  );
}

export async function hasMyActiveStory(
  session
) {
  if (
    !session?.user?.id
  ) {
    return false;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/stories`
    );

  url.searchParams.set(
    "author_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "expires_at",
    `gt.${new Date().toISOString()}`
  );

  url.searchParams.set(
    "select",
    "id"
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

  return Boolean(
    Array.isArray(
      rows
    ) &&
    rows.length
  );
}

export async function loadBackendStories(
  session
) {
  if (
    !session?.user?.id
  ) {
    return [];
  }

  const now =
    new Date().toISOString();

  const storiesUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/stories`
    );

  storiesUrl.searchParams.set(
    "expires_at",
    `gt.${now}`
  );

  storiesUrl.searchParams.set(
    "select",
    "id,author_id,type,text,background,media_path,mime_type,location_text,visibility,created_at,expires_at"
  );

  storiesUrl.searchParams.set(
    "order",
    "created_at.asc"
  );

  storiesUrl.searchParams.set(
    "limit",
    "120"
  );

  const viewsUrl =
    new URL(
      `${SUPABASE_URL}/rest/v1/story_views`
    );

  viewsUrl.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  viewsUrl.searchParams.set(
    "select",
    "story_id"
  );

  const [
    storiesResponse,
    viewsResponse,
  ] =
    await Promise.all([
      fetch(
        storiesUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
      fetch(
        viewsUrl,
        {
          headers:
            headers(
              session
            ),
        }
      ),
    ]);

  const [
    storyRowsRaw,
    viewRowsRaw,
  ] =
    await Promise.all([
      parseResponse(
        storiesResponse
      ),
      parseResponse(
        viewsResponse
      ),
    ]);

  const storyRows =
    Array.isArray(
      storyRowsRaw
    )
      ? storyRowsRaw
      : [];

  const viewed =
    new Set(
      (
        Array.isArray(
          viewRowsRaw
        )
          ? viewRowsRaw
          : []
      ).map(
        (
          row
        ) =>
          row.story_id
      )
    );

  const profiles =
    await fetchProfiles(
      session,
      storyRows.map(
        (
          row
        ) =>
          row.author_id
      )
    );

  return Promise.all(
    storyRows.map(
      async (
        row
      ) => {
        const profile =
          profiles[
            row.author_id
          ] ||
          {};

        const ownerName =
          profile.full_name ||
          profile.username ||
          "Користувач ЯТУТ";

        let media =
          null;

        if (
          row.media_path
        ) {
          try {
            media =
              await createStoryMediaSignedUrl(
                session,
                row.media_path,
                3600
              );
          } catch (
            error
          ) {
            console.warn(
              "STORY SIGNED URL ERROR:",
              error
            );
          }
        }

        return {
          id:
            row.id,
          backend:
            true,
          ownerId:
            row.author_id,
          ownerName,
          authorId:
            row.author_id,
          authorName:
            ownerName,
          username:
            profile.username ||
            "user",
          initials:
            ownerName
              .trim()
              .charAt(0)
              .toUpperCase() ||
            "Я",
          avatar:
            profile.avatar_url ||
            null,
          verified:
            Boolean(
              profile.verified
            ),
          type:
            row.type ||
            "text",
          text:
            row.text ||
            "",
          background:
            row.background ||
            "purple",
          media,
          mediaPath:
            row.media_path ||
            null,
          mediaType:
            row.mime_type ||
            null,
          location:
            row.location_text ||
            null,
          visibility:
            row.visibility ||
            "friends",
          createdAt:
            Date.parse(
              row.created_at
            ),
          expiresAt:
            Date.parse(
              row.expires_at
            ),
          viewed:
            viewed.has(
              row.id
            ),
          online:
            false,
        };
      }
    )
  );
}

export async function createBackendStory(
  session,
  {
    type = "text",
    text = "",
    background = "purple",
    file = null,
    location = null,
    visibility = "friends",
  } = {}
) {
  if (
    !session?.user?.id
  ) {
    throw new Error(
      "Потрібно увійти в акаунт."
    );
  }

  let upload =
    null;

  if (
    file
  ) {
    upload =
      await uploadStoryMedia(
        session,
        file
      );
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/stories`,
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
            author_id:
              session.user.id,
            type:
              upload?.mediaType ||
              type,
            text:
              String(
                text ||
                ""
              ).trim(),
            background:
              background ||
              "purple",
            media_path:
              upload?.path ||
              null,
            mime_type:
              upload?.mimeType ||
              null,
            location_text:
              location ||
              null,
            visibility:
              [
                "public",
                "friends",
                "private",
              ].includes(
                visibility
              )
                ? visibility
                : "friends",
          }),
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

export async function markBackendStoryViewed(
  session,
  storyId
) {
  if (
    !session?.user?.id ||
    !storyId
  ) {
    return;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/story_views?on_conflict=story_id,user_id`,
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
          JSON.stringify({
            story_id:
              storyId,
            user_id:
              session.user.id,
            viewed_at:
              new Date().toISOString(),
          }),
      }
    );

  await parseResponse(
    response
  );
}

export async function deleteBackendStory(
  session,
  story
) {
  if (
    !story?.id
  ) {
    return;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/stories?id=eq.${encodeURIComponent(
        story.id
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

  if (
    story.mediaPath
  ) {
    try {
      await deleteStorageObject(
        session,
        "story-media",
        story.mediaPath
      );
    } catch (
      error
    ) {
      console.warn(
        "STORY MEDIA CLEANUP ERROR:",
        error
      );
    }
  }
}
