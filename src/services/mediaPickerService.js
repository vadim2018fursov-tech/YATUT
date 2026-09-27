import {
  Capacitor,
} from "@capacitor/core";

function mediaTypeForFile(
  file
) {
  const mime =
    String(
      file?.type ||
      ""
    );

  return mime.startsWith(
    "video/"
  )
    ? "video"
    : "image";
}

function openSystemPicker({
  accept,
  capture = null,
}) {
  return new Promise(
    (
      resolve
    ) => {
      const input =
        document.createElement(
          "input"
        );

      let settled =
        false;

      const finish =
        (
          file = null
        ) => {
          if (
            settled
          ) {
            return;
          }

          settled =
            true;

          input.remove();

          resolve(
            file
          );
        };

      input.type =
        "file";
      input.accept =
        accept;
      input.multiple =
        false;

      if (
        capture
      ) {
        input.setAttribute(
          "capture",
          capture
        );
      }

      input.style.position =
        "fixed";
      input.style.left =
        "-9999px";
      input.style.width =
        "1px";
      input.style.height =
        "1px";
      input.style.opacity =
        "0";
      input.style.pointerEvents =
        "none";

      input.addEventListener(
        "change",
        () => {
          finish(
            input.files?.[0] ||
            null
          );
        },
        {
          once:
            true,
        }
      );

      input.addEventListener(
        "cancel",
        () =>
          finish(
            null
          ),
        {
          once:
            true,
        }
      );

      document.body.appendChild(
        input
      );

      input.click();
    }
  );
}

function resultForFile(
  file
) {
  if (!file) {
    return null;
  }

  const mediaType =
    mediaTypeForFile(
      file
    );

  return {
    file,
    mediaType,
    previewUrl:
      URL.createObjectURL(
        file
      ),
    duration:
      null,
    width:
      null,
    height:
      null,
    thumbnailBase64:
      null,
    nativeResult:
      null,
  };
}

export function isMediaPickerCancelled(
  error
) {
  return (
    error?.name ===
      "AbortError" ||
    error?.name ===
      "NotAllowedError"
  );
}

export function isNativeMediaPicker() {
  return Capacitor.isNativePlatform();
}

export function getNativeMediaPlatform() {
  return Capacitor.getPlatform();
}

export async function pickNativeMedia(
  kind = "all"
) {
  if (
    !isNativeMediaPicker()
  ) {
    return null;
  }

  const accept =
    kind ===
    "video"
      ? "video/*"
      : kind ===
        "image"
      ? "image/*"
      : "image/*,video/*";

  const file =
    await openSystemPicker({
      accept,
    });

  return resultForFile(
    file
  );
}

export async function captureNativePhoto() {
  if (
    !isNativeMediaPicker()
  ) {
    return null;
  }

  const file =
    await openSystemPicker({
      accept:
        "image/*",
      capture:
        "environment",
    });

  return resultForFile(
    file
  );
}

export async function captureNativeVideo() {
  if (
    !isNativeMediaPicker()
  ) {
    return null;
  }

  const file =
    await openSystemPicker({
      accept:
        "video/*",
      capture:
        "environment",
    });

  return resultForFile(
    file
  );
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
