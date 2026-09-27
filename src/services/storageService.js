const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

function encodeStoragePath(
  path
) {
  return String(
    path ||
    ""
  )
    .split("/")
    .map(
      (
        part
      ) =>
        encodeURIComponent(
          part
        )
    )
    .join("/");
}

function extensionForFile(
  file
) {
  const fromName =
    String(
      file?.name ||
      ""
    )
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    fromName &&
    fromName !==
      file?.name
  ) {
    return fromName
      .replace(
        /[^a-z0-9]/g,
        ""
      ) ||
      "bin";
  }

  const mimeMap = {
    "image/jpeg":
      "jpg",
    "image/png":
      "png",
    "image/webp":
      "webp",
    "image/heic":
      "heic",
    "image/heif":
      "heif",
    "video/mp4":
      "mp4",
    "video/quicktime":
      "mov",
    "video/webm":
      "webm",
    "audio/webm":
      "webm",
    "audio/mp4":
      "m4a",
    "audio/mpeg":
      "mp3",
    "audio/ogg":
      "ogg",
  };

  return (
    mimeMap[
      file?.type
    ] ||
    "bin"
  );
}

function safeFileName(
  name
) {
  const cleaned =
    String(
      name ||
      "file"
    )
      .normalize(
        "NFKD"
      )
      .replace(
        /[^a-zA-Z0-9._-]+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^[-.]+|[-.]+$/g,
        ""
      );

  return (
    cleaned ||
    "file"
  ).slice(
    0,
    120
  );
}

function randomPart() {
  if (
    globalThis.crypto
      ?.randomUUID
  ) {
    return globalThis.crypto
      .randomUUID()
      .slice(
        0,
        12
      );
  }

  return Math.random()
    .toString(36)
    .slice(
      2,
      14
    );
}

function authHeaders(
  session,
  extra = {}
) {
  if (
    !session?.access_token
  ) {
    throw new Error(
      "Потрібно увійти в акаунт."
    );
  }

  return {
    apikey:
      SUPABASE_KEY,
    Authorization:
      `Bearer ${session.access_token}`,
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
    const message =
      data?.message ||
      data?.error ||
      data?.statusCode ||
      "Не вдалося завантажити файл.";

    throw new Error(
      String(
        message
      )
    );
  }

  return data;
}

async function uploadObject({
  session,
  bucket,
  path,
  file,
  upsert = false,
  onProgress = null,
}) {
  if (
    !file
  ) {
    return null;
  }

  const url =
    `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(
      bucket
    )}/${encodeStoragePath(
      path
    )}`;

  const requestHeaders =
    authHeaders(
      session,
      {
        "Content-Type":
          file.type ||
          "application/octet-stream",
        "x-upsert":
          upsert
            ? "true"
            : "false",
        "cache-control":
          "3600",
      }
    );

  if (
    typeof onProgress ===
    "function"
  ) {
    await new Promise(
      (
        resolve,
        reject
      ) => {
        const xhr =
          new XMLHttpRequest();

        xhr.open(
          "POST",
          url,
          true
        );

        Object.entries(
          requestHeaders
        ).forEach(
          ([
            key,
            value,
          ]) => {
            xhr.setRequestHeader(
              key,
              value
            );
          }
        );

        xhr.upload.onprogress =
          (
            event
          ) => {
            if (
              !event.lengthComputable
            ) {
              return;
            }

            const progress =
              Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    (
                      event.loaded /
                      event.total
                    ) *
                      100
                  )
                )
              );

            onProgress(
              progress
            );
          };

        xhr.onerror =
          () => {
            reject(
              new Error(
                "Не вдалося завантажити файл."
              )
            );
          };

        xhr.onload =
          () => {
            if (
              xhr.status >=
                200 &&
              xhr.status <
                300
            ) {
              onProgress(
                100
              );

              resolve();

              return;
            }

            let data =
              null;

            try {
              data =
                xhr.responseText
                  ? JSON.parse(
                      xhr.responseText
                    )
                  : null;
            } catch {
              data =
                xhr.responseText;
            }

            reject(
              new Error(
                data?.message ||
                data?.error ||
                data?.statusCode ||
                "Не вдалося завантажити файл."
              )
            );
          };

        xhr.send(
          file
        );
      }
    );
  } else {
    const response =
      await fetch(
        url,
        {
          method:
            "POST",
          headers:
            requestHeaders,
          body:
            file,
        }
      );

    await parseResponse(
      response
    );
  }

  return {
    bucket,
    path,
  };
}

function publicUrl(
  bucket,
  path
) {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(
    bucket
  )}/${encodeStoragePath(
    path
  )}`;
}

export async function uploadProfileImage(
  session,
  file,
  kind = "avatar"
) {
  if (
    !session?.user?.id ||
    !file
  ) {
    return null;
  }

  if (
    !String(
      file.type ||
      ""
    ).startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Для профілю можна завантажити лише зображення."
    );
  }

  if (
    file.size >
    10 *
      1024 *
      1024
  ) {
    throw new Error(
      "Зображення профілю має бути до 10 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const path =
    `${session.user.id}/${kind}-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "avatars",
    path,
    file,
  });

  return publicUrl(
    "avatars",
    path
  );
}

export async function uploadCommunityImage(
  session,
  file,
  kind = "cover"
) {
  if (
    !session?.user?.id ||
    !file
  ) {
    return null;
  }

  const mime =
    String(
      file.type ||
      ""
    );

  if (
    !mime.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Для спільноти можна завантажити лише зображення."
    );
  }

  if (
    file.size >
    10 *
      1024 *
      1024
  ) {
    throw new Error(
      "Зображення спільноти має бути до 10 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const path =
    `${session.user.id}/${kind}-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "community-media",
    path,
    file,
  });

  return {
    url:
      publicUrl(
        "community-media",
        path
      ),
    path,
  };
}

export async function uploadNearbyPlaceImage(
  session,
  placeId,
  file
) {
  if (
    !session?.user?.id ||
    !placeId ||
    !file
  ) {
    return null;
  }

  const mime =
    String(
      file.type ||
      ""
    );

  if (
    !mime.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Фото місця має бути зображенням."
    );
  }

  if (
    file.size >
    10 *
      1024 *
      1024
  ) {
    throw new Error(
      "Фото місця має бути до 10 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const path =
    `${session.user.id}/nearby/${placeId}-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "post-media",
    path,
    file,
  });

  return {
    url:
      publicUrl(
        "post-media",
        path
      ),
    path,
  };
}

export async function uploadEventCover(
  session,
  eventId,
  file
) {
  if (
    !session?.user?.id ||
    !eventId ||
    !file
  ) {
    return null;
  }

  const mime =
    String(
      file.type ||
      ""
    );

  if (
    !mime.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Обкладинка події має бути зображенням."
    );
  }

  if (
    file.size >
    10 *
      1024 *
      1024
  ) {
    throw new Error(
      "Обкладинка події має бути до 10 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const path =
    `${session.user.id}/events/${eventId}-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "post-media",
    path,
    file,
  });

  return {
    url:
      publicUrl(
        "post-media",
        path
      ),
    path,
  };
}

export async function uploadPostMedia(
  session,
  file
) {
  if (
    !session?.user?.id ||
    !file
  ) {
    return null;
  }

  const mime =
    String(
      file.type ||
      ""
    );

  if (
    !mime.startsWith(
      "image/"
    ) &&
    !mime.startsWith(
      "video/"
    )
  ) {
    throw new Error(
      "До допису можна додати фото або відео."
    );
  }

  if (
    file.size >
    100 *
      1024 *
      1024
  ) {
    throw new Error(
      "Файл для допису має бути до 100 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const path =
    `${session.user.id}/post-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "post-media",
    path,
    file,
  });

  return {
    url:
      publicUrl(
        "post-media",
        path
      ),
    path,
    mediaType:
      mime.startsWith(
        "video/"
      )
        ? "video"
        : "image",
  };
}

export async function uploadPulseMedia(
  session,
  file,
  kind = "video",
  {
    onProgress = null,
  } = {}
) {
  if (
    !session?.user?.id ||
    !file
  ) {
    return null;
  }

  const mime =
    String(
      file.type ||
      ""
    );

  if (
    !mime.startsWith(
      "video/"
    )
  ) {
    throw new Error(
      "Для PULSE зараз можна завантажити відео."
    );
  }

  if (
    file.size >
    100 *
      1024 *
      1024
  ) {
    throw new Error(
      "Відео PULSE має бути до 100 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const safeKind =
    [
      "clip",
      "video",
      "moment",
      "wave",
    ].includes(
      kind
    )
      ? kind
      : "video";

  const path =
    `${session.user.id}/pulse/${safeKind}-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "post-media",
    path,
    file,
    onProgress,
  });

  return {
    url:
      publicUrl(
        "post-media",
        path
      ),
    path,
    mimeType:
      mime ||
      "video/mp4",
    mediaType:
      "video",
  };
}

export async function uploadPulseThumbnail(
  session,
  file,
  kind = "video"
) {
  if (
    !session?.user?.id ||
    !file
  ) {
    return null;
  }

  const mime =
    String(
      file.type ||
      ""
    );

  if (
    !mime.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Обкладинка PULSE має бути зображенням."
    );
  }

  if (
    file.size >
    10 *
      1024 *
      1024
  ) {
    throw new Error(
      "Обкладинка PULSE має бути до 10 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const safeKind =
    [
      "clip",
      "video",
      "moment",
      "wave",
    ].includes(
      kind
    )
      ? kind
      : "video";

  const path =
    `${session.user.id}/pulse/thumb-${safeKind}-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "post-media",
    path,
    file,
  });

  return {
    url:
      publicUrl(
        "post-media",
        path
      ),
    path,
  };
}

export async function uploadStoryMedia(
  session,
  file
) {
  if (
    !session?.user?.id ||
    !file
  ) {
    return null;
  }

  const mime =
    String(
      file.type ||
      ""
    );

  if (
    !mime.startsWith(
      "image/"
    ) &&
    !mime.startsWith(
      "video/"
    )
  ) {
    throw new Error(
      "До історії можна додати фото або відео."
    );
  }

  if (
    file.size >
    100 *
      1024 *
      1024
  ) {
    throw new Error(
      "Файл історії має бути до 100 МБ."
    );
  }

  const extension =
    extensionForFile(
      file
    );

  const path =
    `${session.user.id}/story-${Date.now()}-${randomPart()}.${extension}`;

  await uploadObject({
    session,
    bucket:
      "story-media",
    path,
    file,
  });

  return {
    path,
    mimeType:
      mime ||
      "application/octet-stream",
    mediaType:
      mime.startsWith(
        "video/"
      )
        ? "video"
        : "image",
  };
}

export async function createStoryMediaSignedUrl(
  session,
  path,
  expiresIn = 3600
) {
  if (
    !path
  ) {
    return null;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/story-media/${encodeStoragePath(
        path
      )}`,
      {
        method:
          "POST",
        headers: {
          ...authHeaders(
            session
          ),
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            expiresIn,
          }),
      }
    );

  const data =
    await parseResponse(
      response
    );

  const signed =
    data?.signedURL ||
    data?.signedUrl ||
    data?.signed_url ||
    null;

  if (!signed) {
    return null;
  }

  if (
    /^https?:\/\//i.test(
      signed
    )
  ) {
    return signed;
  }

  return `${SUPABASE_URL}/storage/v1${signed.startsWith("/") ? "" : "/"}${signed}`;
}

export async function uploadChatMedia(
  session,
  conversationId,
  file
) {
  if (
    !session?.user?.id ||
    !conversationId ||
    !file
  ) {
    return null;
  }

  if (
    file.size >
    50 *
      1024 *
      1024
  ) {
    throw new Error(
      "Файл у чаті має бути до 50 МБ."
    );
  }

  const originalName =
    safeFileName(
      file.name ||
      `media.${extensionForFile(
        file
      )}`
    );

  const path =
    `${conversationId}/${session.user.id}/${Date.now()}-${randomPart()}-${originalName}`;

  await uploadObject({
    session,
    bucket:
      "chat-media",
    path,
    file,
  });

  return {
    path,
    fileName:
      file.name ||
      originalName,
    mimeType:
      file.type ||
      "application/octet-stream",
  };
}

export async function createChatMediaSignedUrl(
  session,
  path,
  expiresIn = 3600
) {
  if (
    !path
  ) {
    return null;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/chat-media/${encodeStoragePath(
        path
      )}`,
      {
        method:
          "POST",
        headers: {
          ...authHeaders(
            session
          ),
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            expiresIn,
          }),
      }
    );

  const data =
    await parseResponse(
      response
    );

  const signed =
    data?.signedURL ||
    data?.signedUrl ||
    data?.signed_url ||
    null;

  if (!signed) {
    return null;
  }

  if (
    /^https?:\/\//i.test(
      signed
    )
  ) {
    return signed;
  }

  return `${SUPABASE_URL}/storage/v1${signed.startsWith("/") ? "" : "/"}${signed}`;
}

export async function deleteStorageObject(
  session,
  bucket,
  path
) {
  if (!path) {
    return;
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(
        bucket
      )}`,
      {
        method:
          "DELETE",
        headers: {
          ...authHeaders(
            session
          ),
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            prefixes: [
              path,
            ],
          }),
      }
    );

  await parseResponse(
    response
  );
}
