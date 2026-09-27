import {
  Capacitor,
} from "@capacitor/core";

import {
  disableNativePushNotifications,
  enableNativePushNotifications,
  getNativePushSupportState,
  syncNativePushNotifications,
} from "./nativePushNotificationService";

const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

export const YATUT_VAPID_PUBLIC_KEY =
  "BBZI5sfmY-lHNUCQPubTGIz7iP5lwV3JB6fItEOavsnOwioxIiOdxbyq7AknZ5Kk47QukjC899W8r4cg4Ab95Tk";

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

function isNative() {
  return Capacitor
    .isNativePlatform();
}

function urlBase64ToUint8Array(
  base64String
) {
  const padding =
    "=".repeat(
      (
        4 -
        (
          base64String.length %
          4
        )
      ) %
        4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      );

  const rawData =
    window.atob(
      base64
    );

  return Uint8Array.from(
    [
      ...rawData,
    ].map(
      (
        character
      ) =>
        character.charCodeAt(
          0
        )
    )
  );
}

function detectDeviceLabel() {
  if (
    isNative()
  ) {
    return Capacitor
      .getPlatform() ===
      "ios"
      ? "iPhone / iPad"
      : "Android";
  }

  const ua =
    navigator.userAgent ||
    "";

  if (
    /iPhone/i.test(
      ua
    )
  ) {
    return "iPhone";
  }

  if (
    /iPad/i.test(
      ua
    )
  ) {
    return "iPad";
  }

  if (
    /Android/i.test(
      ua
    )
  ) {
    return /Mobile/i.test(
      ua
    )
      ? "Android телефон"
      : "Android планшет";
  }

  if (
    /Windows/i.test(
      ua
    )
  ) {
    return "Windows";
  }

  if (
    /Macintosh|Mac OS X/i.test(
      ua
    )
  ) {
    return "Mac";
  }

  if (
    /Linux/i.test(
      ua
    )
  ) {
    return "Linux";
  }

  return "Пристрій";
}

export function getPushSupportState() {
  if (
    isNative()
  ) {
    return getNativePushSupportState();
  }

  const supported =
    "serviceWorker" in
      navigator &&
    "PushManager" in
      window &&
    "Notification" in
      window;

  const standalone =
    window.matchMedia?.(
      "(display-mode: standalone)"
    )?.matches ||
    window.navigator
      .standalone ===
      true;

  const isiOS =
    /iPhone|iPad|iPod/i.test(
      navigator.userAgent ||
        ""
    );

  return {
    native:
      false,
    supported,
    permission:
      supported
        ? Notification.permission
        : "unsupported",
    standalone,
    requiresInstall:
      Boolean(
        isiOS &&
        !standalone
      ),
    deviceLabel:
      detectDeviceLabel(),
    subscribed:
      false,
  };
}

async function waitForRegistration() {
  if (
    !(
      "serviceWorker" in
      navigator
    )
  ) {
    throw new Error(
      "Service Worker не підтримується на цьому пристрої."
    );
  }

  let registration =
    await navigator
      .serviceWorker
      .getRegistration();

  if (!registration) {
    registration =
      await navigator
        .serviceWorker
        .register(
          "/sw.js"
        );
  }

  return navigator
    .serviceWorker
    .ready;
}

async function saveSubscription(
  session,
  subscription
) {
  if (
    !session?.user?.id ||
    !subscription
  ) {
    return;
  }

  const json =
    subscription.toJSON();

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=endpoint`,
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
            user_id:
              session.user.id,
            endpoint:
              json.endpoint,
            p256dh:
              json.keys
                ?.p256dh ||
              "",
            auth:
              json.keys
                ?.auth ||
              "",
            device_label:
              detectDeviceLabel(),
            user_agent:
              navigator.userAgent ||
              "",
          }),
      }
    );

  if (
    !response.ok
  ) {
    const body =
      await response.text();

    throw new Error(
      body ||
      "Не вдалося зберегти push-підписку."
    );
  }
}

async function enableWebPush(
  session
) {
  const support =
    getPushSupportState();

  if (
    !support.supported
  ) {
    throw new Error(
      "Push-сповіщення не підтримуються цим браузером."
    );
  }

  if (
    support.requiresInstall
  ) {
    throw new Error(
      "На iPhone або iPad спочатку додайте ЯТУТ на головний екран, відкрийте встановлену версію і повторіть."
    );
  }

  let permission =
    Notification.permission;

  if (
    permission ===
    "default"
  ) {
    permission =
      await Notification
        .requestPermission();
  }

  if (
    permission !==
    "granted"
  ) {
    throw new Error(
      "Дозвіл на сповіщення не надано. Його можна змінити в налаштуваннях браузера або пристрою."
    );
  }

  const registration =
    await waitForRegistration();

  let subscription =
    await registration
      .pushManager
      .getSubscription();

  if (
    !subscription
  ) {
    subscription =
      await registration
        .pushManager
        .subscribe({
          userVisibleOnly:
            true,
          applicationServerKey:
            urlBase64ToUint8Array(
              YATUT_VAPID_PUBLIC_KEY
            ),
        });
  }

  await saveSubscription(
    session,
    subscription
  );

  return subscription;
}

async function syncWebPush(
  session
) {
  if (
    !session?.user?.id ||
    !(
      "serviceWorker" in
      navigator
    ) ||
    !(
      "PushManager" in
      window
    ) ||
    !(
      "Notification" in
      window
    ) ||
    Notification.permission !==
      "granted"
  ) {
    return null;
  }

  const registration =
    await waitForRegistration();

  const subscription =
    await registration
      .pushManager
      .getSubscription();

  if (
    subscription
  ) {
    await saveSubscription(
      session,
      subscription
    );
  }

  return subscription;
}

async function disableWebPush(
  session
) {
  if (
    !(
      "serviceWorker" in
      navigator
    )
  ) {
    return;
  }

  const registration =
    await navigator
      .serviceWorker
      .getRegistration();

  const subscription =
    await registration
      ?.pushManager
      ?.getSubscription();

  if (
    !subscription
  ) {
    return;
  }

  if (
    session?.user?.id
  ) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(
        subscription.endpoint
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
  }

  await subscription
    .unsubscribe();
}

export async function enablePushNotifications(
  session
) {
  if (
    isNative()
  ) {
    return enableNativePushNotifications(
      session
    );
  }

  return enableWebPush(
    session
  );
}

export async function syncPushSubscription(
  session
) {
  if (
    isNative()
  ) {
    return syncNativePushNotifications(
      session
    );
  }

  return syncWebPush(
    session
  );
}

export async function disablePushNotifications(
  session
) {
  if (
    isNative()
  ) {
    return disableNativePushNotifications(
      session
    );
  }

  return disableWebPush(
    session
  );
}
