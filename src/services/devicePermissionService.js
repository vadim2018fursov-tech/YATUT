import {
  enablePushNotifications,
  getPushSupportState,
} from "./pushNotificationService";

export function getDevicePermissionState() {
  const notification =
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported";

  return {
    notification,
    push:
      typeof window !== "undefined"
        ? getPushSupportState()
        : {
            supported: false,
            requiresInstall: false,
            permission: "unsupported",
            deviceLabel: "Пристрій",
          },
    camera:
      navigator?.mediaDevices?.getUserMedia
        ? "unknown"
        : "unsupported",
    microphone:
      navigator?.mediaDevices?.getUserMedia
        ? "unknown"
        : "unsupported",
    location:
      "geolocation" in navigator
        ? "unknown"
        : "unsupported",
    gallery: "picker",
  };
}

export async function requestPushPermission(session) {
  await enablePushNotifications(
    session
  );

  return "granted";
}

export async function requestMediaPermissions() {
  if (
    !navigator?.mediaDevices?.getUserMedia
  ) {
    throw new Error(
      "Камера та мікрофон не підтримуються цим браузером."
    );
  }

  const stream =
    await navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      });

  stream
    .getTracks()
    .forEach(
      (
        track
      ) =>
        track.stop()
    );

  return {
    camera:
      "granted",
    microphone:
      "granted",
  };
}

export function requestLocationPermission() {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      if (
        !("geolocation" in navigator)
      ) {
        reject(
          new Error(
            "Геолокація не підтримується цим браузером."
          )
        );

        return;
      }

      navigator.geolocation
        .getCurrentPosition(
          () =>
            resolve(
              "granted"
            ),
          (
            error
          ) => {
            if (
              error?.code ===
              1
            ) {
              reject(
                new Error(
                  "Доступ до геолокації не надано."
                )
              );

              return;
            }

            reject(
              new Error(
                "Не вдалося отримати доступ до геолокації."
              )
            );
          },
          {
            enableHighAccuracy:
              false,
            timeout:
              8000,
            maximumAge:
              300000,
          }
        );
    }
  );
}

export async function queryBrowserPermission(
  name
) {
  try {
    if (
      !navigator?.permissions
        ?.query
    ) {
      return "unknown";
    }

    const result =
      await navigator.permissions
        .query({
          name,
        });

    return (
      result?.state ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}
