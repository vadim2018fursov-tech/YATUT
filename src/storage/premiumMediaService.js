const DB_NAME =
  "yatut-premium-media";

const DB_VERSION =
  1;

const STORE_NAME =
  "media";

function createMediaId() {
  return `media-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function openMediaDatabase() {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        );

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          if (
            !db.objectStoreNames.contains(
              STORE_NAME
            )
          ) {
            const store =
              db.createObjectStore(
                STORE_NAME,
                {
                  keyPath:
                    "id",
                }
              );

            store.createIndex(
              "createdAt",
              "createdAt",
              {
                unique:
                  false,
              }
            );
          }
        };

      request.onsuccess =
        () =>
          resolve(
            request.result
          );

      request.onerror =
        () =>
          reject(
            request.error
          );
    }
  );
}

function transactionPromise(
  mode,
  callback
) {
  return new Promise(
    async (
      resolve,
      reject
    ) => {
      let db;

      try {
        db =
          await openMediaDatabase();

        const transaction =
          db.transaction(
            STORE_NAME,
            mode
          );

        const store =
          transaction.objectStore(
            STORE_NAME
          );

        const result =
          callback(
            store,
            transaction
          );

        transaction.oncomplete =
          () => {
            db.close();

            resolve(
              result
            );
          };

        transaction.onerror =
          () => {
            const error =
              transaction.error;

            db.close();

            reject(
              error
            );
          };

        transaction.onabort =
          () => {
            const error =
              transaction.error;

            db.close();

            reject(
              error
            );
          };
      } catch (
        error
      ) {
        db?.close?.();

        reject(
          error
        );
      }
    }
  );
}

export async function savePremiumMedia(
  file,
  kind = "image"
) {
  if (!file) {
    return null;
  }

  const id =
    createMediaId();

  const record = {
    id,

    blob:
      file,

    kind,

    name:
      file.name ||
      "",

    mimeType:
      file.type ||
      "",

    size:
      Number(
        file.size || 0
      ),

    createdAt:
      Date.now(),
  };

  await transactionPromise(
    "readwrite",
    (
      store
    ) => {
      store.put(
        record
      );
    }
  );

  return {
    id,

    kind,

    name:
      record.name,

    mimeType:
      record.mimeType,

    size:
      record.size,
  };
}

export async function savePremiumMediaFiles(
  files,
  kind = "image"
) {
  const source =
    Array.from(
      files || []
    );

  const result =
    [];

  for (
    const file of
    source
  ) {
    const saved =
      await savePremiumMedia(
        file,
        kind
      );

    if (saved) {
      result.push(
        saved
      );
    }
  }

  return result;
}

export async function getPremiumMedia(
  mediaId
) {
  if (!mediaId) {
    return null;
  }

  const db =
    await openMediaDatabase();

  return new Promise(
    (
      resolve,
      reject
    ) => {
      const transaction =
        db.transaction(
          STORE_NAME,
          "readonly"
        );

      const store =
        transaction.objectStore(
          STORE_NAME
        );

      const request =
        store.get(
          mediaId
        );

      request.onsuccess =
        () => {
          const result =
            request.result ||
            null;

          db.close();

          resolve(
            result
          );
        };

      request.onerror =
        () => {
          const error =
            request.error;

          db.close();

          reject(
            error
          );
        };
    }
  );
}

export async function getPremiumMediaUrl(
  media
) {
  if (!media) {
    return null;
  }

  /*
    Старые посты с Base64/обычным URL
    продолжают работать.
  */
  if (
    typeof media ===
    "string"
  ) {
    return media;
  }

  if (
    media.url &&
    typeof media.url ===
      "string"
  ) {
    return media.url;
  }

  const mediaId =
    media.id ||
    media.mediaId;

  if (!mediaId) {
    return null;
  }

  try {
    const record =
      await getPremiumMedia(
        mediaId
      );

    if (
      !record?.blob
    ) {
      return null;
    }

    return URL.createObjectURL(
      record.blob
    );
  } catch (
    error
  ) {
    console.warn(
      "PREMIUM MEDIA URL ERROR:",
      error
    );

    return null;
  }
}

export async function deletePremiumMedia(
  mediaId
) {
  if (!mediaId) {
    return;
  }

  await transactionPromise(
    "readwrite",
    (
      store
    ) => {
      store.delete(
        mediaId
      );
    }
  );
}

export async function deletePremiumMediaList(
  mediaList = []
) {
  for (
    const media of
    mediaList
  ) {
    const id =
      typeof media ===
      "string"
        ? null
        : media?.id ||
          media?.mediaId;

    if (id) {
      try {
        await deletePremiumMedia(
          id
        );
      } catch (
        error
      ) {
        console.warn(
          "PREMIUM MEDIA DELETE ERROR:",
          error
        );
      }
    }
  }
}

export function revokePremiumMediaUrl(
  url
) {
  if (
    typeof url ===
      "string" &&
    url.startsWith(
      "blob:"
    )
  ) {
    URL.revokeObjectURL(
      url
    );
  }
}