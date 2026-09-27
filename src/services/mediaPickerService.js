import {
  Camera,
  MediaType,
  MediaTypeSelection,
} from "@capacitor/camera";

import {
  Capacitor,
} from "@capacitor/core";

const CANCEL_CODES =
  new Set([
    "OS-PLUG-CAMR-0006",
    "OS-PLUG-CAMR-0013",
    "OS-PLUG-CAMR-0017",
    "OS-PLUG-CAMR-0020",
  ]);

function normalizeFormat(
  format = "",
  mediaType = "image"
) {
  const clean =
    String(format || "")
      .trim()
      .toLowerCase()
      .replace(/^\./, "");

  if (clean === "jpeg") {
    return {
      extension:
        "jpg",
      mime:
        "image/jpeg",
    };
  }

  if (
    clean ===
      "jpg" ||
    clean ===
      "png" ||
    clean ===
      "webp" ||
    clean ===
      "heic" ||
    clean ===
      "heif"
  ) {
    return {
      extension:
        clean,
      mime:
        `image/${clean === "jpg" ? "jpeg" : clean}`,
    };
  }

  if (
    clean ===
      "mp4" ||
    clean ===
      "webm"
  ) {
    return {
      extension:
        clean,
      mime:
        `video/${clean}`,
    };
  }

  if (
    clean ===
      "mov" ||
    clean ===
      "quicktime"
  ) {
    return {
      extension:
        "mov",
      mime:
        "video/quicktime",
    };
  }

  return mediaType ===
    "video"
    ? {
        extension:
          "mp4",
        mime:
          "video/mp4",
      }
    : {
        extension:
          "jpg",
        mime:
          "image/jpeg",
      };
}

function detectMediaType(
  result
) {
  if (
    result?.type ===
    MediaType.Video
  ) {
    return "video";
  }

  if (
    result?.type ===
    MediaType.Photo
  ) {
    return "image";
  }

  const format =
    String(
      result?.metadata?.format ||
      ""
    ).toLowerCase();

  return [
    "mp4",
    "mov",
    "quicktime",
    "webm",
  ].includes(
    format
  )
    ? "video"
    : "image";
}

function errorCode(
  error
) {
  return String(
    error?.code ||
    ""
  );
}

export function isMediaPickerCancelled(
  error
) {
  return CANCEL_CODES.has(
    errorCode(
      error
    )
  );
}

export function isNativeMediaPicker() {
  return Capacitor.isNativePlatform();
}

export function getNativeMediaPlatform() {
  return Capacitor.getPlatform();
}

function sourceUrlForResult(
  result
) {
  if (
    result?.webPath
  ) {
    return result.webPath;
  }

  if (
    result?.uri
  ) {
    return Capacitor.convertFileSrc(
      result.uri
    );
  }

  return null;
}

async function mediaResultToFile(
  result,
  {
    prefix =
      "yatut-media",
  } = {}
) {
  if (!result) {
    return null;
  }

  const mediaType =
    detectMediaType(
      result
    );

  const source =
    sourceUrlForResult(
      result
    );

  if (!source) {
    throw new Error(
      "Не вдалося отримати файл з пристрою."
    );
  }

  const response =
    await fetch(
      source
    );

  if (
    !response.ok
  ) {
    throw new Error(
      "Не вдалося прочитати вибране медіа."
    );
  }

  const blob =
    await response.blob();

  const normalized =
    normalizeFormat(
      result?.metadata?.format,
      mediaType
    );

  const mimeType =
    blob.type ||
    normalized.mime;

  const extension =
    mimeType ===
      "image/jpeg"
      ? "jpg"
      : mimeType ===
        "video/quicktime"
      ? "mov"
      : (
          mimeType.split(
            "/"
          )[1] ||
          normalized.extension
        )
          .split(
            ";"
          )[0]
          .replace(
            /[^a-z0-9]/gi,
            ""
          ) ||
        normalized.extension;

  const file =
    new File(
      [
        blob,
      ],
      `${prefix}-${Date.now()}.${extension}`,
      {
        type:
          mimeType,
        lastModified:
          Date.now(),
      }
    );

  return {
    file,
    mediaType,
    previewUrl:
      URL.createObjectURL(
        file
      ),
    duration:
      Number(
        result?.metadata
          ?.duration ||
        0
      ) ||
      null,
    width:
      Number(
        result?.metadata
          ?.width ||
        0
      ) ||
      null,
    height:
      Number(
        result?.metadata
          ?.height ||
        0
      ) ||
      null,
    thumbnailBase64:
      result?.thumbnail ||
      null,
    nativeResult:
      result,
  };
}

function mediaSelectionFor(
  kind
) {
  if (
    kind ===
    "video"
  ) {
    return MediaTypeSelection.Video;
  }

  if (
    kind ===
    "image"
  ) {
    return MediaTypeSelection.Photo;
  }

  return MediaTypeSelection.All;
}

function friendlyCameraError(
  error,
  fallback
) {
  if (
    isMediaPickerCancelled(
      error
    )
  ) {
    return null;
  }

  const code =
    errorCode(
      error
    );

  if (
    code ===
      "OS-PLUG-CAMR-0003" ||
    code ===
      "OS-PLUG-CAMR-0005"
  ) {
    return new Error(
      "ЯТУТ не має доступу до камери або медіатеки. Увімкніть доступ у налаштуваннях пристрою."
    );
  }

  if (
    code ===
    "OS-PLUG-CAMR-0007"
  ) {
    return new Error(
      "Камера недоступна на цьому пристрої."
    );
  }

  return new Error(
    error?.message ||
    fallback
  );
}

export async function pickNativeMedia(
  kind = "all"
) {
  if (
    !isNativeMediaPicker()
  ) {
    return null;
  }

  try {
    const {
      results = [],
    } =
      await Camera.chooseFromGallery({
        mediaType:
          mediaSelectionFor(
            kind
          ),
        allowMultipleSelection:
          false,
        limit:
          1,
        includeMetadata:
          true,
      });

    const result =
      results[0];

    if (!result) {
      return null;
    }

    return mediaResultToFile(
      result,
      {
        prefix:
          kind ===
            "video"
            ? "gallery-video"
            : kind ===
              "image"
            ? "gallery-photo"
            : "gallery-media",
      }
    );
  } catch (
    error
  ) {
    const normalized =
      friendlyCameraError(
        error,
        "Не вдалося відкрити медіатеку."
      );

    if (!normalized) {
      return null;
    }

    throw normalized;
  }
}

export async function captureNativePhoto() {
  if (
    !isNativeMediaPicker()
  ) {
    return null;
  }

  try {
    const result =
      await Camera.takePhoto({
        quality:
          92,
        includeMetadata:
          true,
        saveToGallery:
          false,
        editable:
          "no",
      });

    return mediaResultToFile(
      result,
      {
        prefix:
          "camera-photo",
      }
    );
  } catch (
    error
  ) {
    const normalized =
      friendlyCameraError(
        error,
        "Не вдалося зробити фото."
      );

    if (!normalized) {
      return null;
    }

    throw normalized;
  }
}

export async function captureNativeVideo() {
  if (
    !isNativeMediaPicker()
  ) {
    return null;
  }

  try {
    const result =
      await Camera.recordVideo({
        saveToGallery:
          false,
        includeMetadata:
          true,
        isPersistent:
          false,
      });

    return mediaResultToFile(
      result,
      {
        prefix:
          "camera-video",
      }
    );
  } catch (
    error
  ) {
    const normalized =
      friendlyCameraError(
        error,
        "Не вдалося записати відео."
      );

    if (!normalized) {
      return null;
    }

    throw normalized;
  }
}

export function revokeMediaPreview(
  previewUrl
) {
  if (
    String(
      previewUrl ||
      ""
    ).startsWith(
      "blob:"
    )
  ) {
    URL.revokeObjectURL(
      previewUrl
    );
  }
}
