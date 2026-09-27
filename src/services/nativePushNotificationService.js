import {
  App,
} from "@capacitor/app";

import {
  Capacitor,
} from "@capacitor/core";

import {
  PushNotifications,
} from "@capacitor/push-notifications";

const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

const TOKEN_STORAGE_KEY =
  "yatut-native-push-token-v1";

let currentSession =
  null;

let listenersReady =
  false;

let cachedPermission =
  "prompt";

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

function platform() {
  return Capacitor.getPlatform();
}

function isSupportedPlatform() {
  return (
    Capacitor.isNativePlatform() &&
    [
      "ios",
      "android",
    ].includes(
      platform()
    )
  );
}

function tokenStorageKey() {
  return `${TOKEN_STORAGE_KEY}:${platform()}`;
}

function readCachedToken() {
  try {
    return (
      localStorage.getItem(
        tokenStorageKey()
      ) ||
      ""
    );
  } catch {
    return "";
  }
}

function writeCachedToken(
  token
) {
  try {
    if (token) {
      localStorage.setItem(
        tokenStorageKey(),
        token
      );
    } else {
      localStorage.removeItem(
        tokenStorageKey()
      );
    }
  } catch {
    // Native push can still work without the local cache.
  }
}

function normalizePermission(
  value
) {
  if (
    value ===
    "granted"
  ) {
    return "granted";
  }

  if (
    value ===
      "denied"
  ) {
    return "denied";
  }

  return "default";
}

function navigateFromPushData(
  input = {}
) {
  const data =
    input &&
    typeof input ===
      "object"
      ? input
      : {};

  let target =
    data.url ||
    data.path ||
    null;

  if (!target) {
    const route =
      data.route ||
      "";

    if (
      route ===
      "chats"
    ) {
      if (
        data.chatId
      ) {
        target =
          `/chats/${encodeURIComponent(
            data.chatId
          )}`;
      } else if (
        data.personId
      ) {
        target =
          `/chats?person=${encodeURIComponent(
            data.personId
          )}`;
      } else {
        target =
          "/chats";
      }
    } else if (
      route ===
        "friends" &&
      data.personId
    ) {
      target =
        `/people/${encodeURIComponent(
          data.personId
        )}`;
    } else if (
      route ===
        "events" &&
      data.eventId
    ) {
      target =
        `/events/${encodeURIComponent(
          data.eventId
        )}`;
    } else if (
      route ===
        "communities" &&
      data.communityId
    ) {
      target =
        `/communities/${encodeURIComponent(
          data.communityId
        )}`;
    } else if (
      route ===
      "profile"
    ) {
      target =
        "/profile";
    } else if (
      route ===
      "notifications"
    ) {
      target =
        "/notifications";
    } else if (route) {
      target =
        `/${String(
          route
        ).replace(
          /^\/+/, 
          ""
        )}`;
    }
  }

  if (!target) {
    target =
      "/notifications";
  }

  try {
    const url =
      new URL(
        target,
        window.location.origin
      );

    const next =
      `${url.pathname}${url.search}${url.hash}`;

    const current =
      `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (
      next !==
      current
    ) {
      window.history.pushState(
        {},
        "",
        next
      );
    }

    window.dispatchEvent(
      new PopStateEvent(
        "popstate"
      )
    );
  } catch (
    error
  ) {
    console.warn(
      "NATIVE PUSH NAVIGATION ERROR:",
      error
    );
  }
}

async function saveNativeToken(
  session,
  token
) {
  if (
    !session?.user?.id ||
    !token ||
    !isSupportedPlatform()
  ) {
    return;
  }

  let appVersion =
    "";

  try {
    const info =
      await App.getInfo();

    appVersion =
      info?.version ||
      "";
  } catch {
    // Optional metadata only.
  }

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/native_push_tokens?on_conflict=platform,token`,
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
            platform:
              platform(),
            token,
            device_label:
              platform() ===
                "ios"
                ? "iPhone / iPad"
                : "Android",
            app_version:
              appVersion,
            active:
              true,
            last_seen_at:
              new Date()
                .toISOString(),
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
      "Не вдалося зберегти native push token."
    );
  }
}

async function deleteNativeToken(
  session,
  token
) {
  if (
    !session?.user?.id ||
    !token
  ) {
    return;
  }

  const url =
    new URL(
      `${SUPABASE_URL}/rest/v1/native_push_tokens`
    );

  url.searchParams.set(
    "user_id",
    `eq.${session.user.id}`
  );

  url.searchParams.set(
    "platform",
    `eq.${platform()}`
  );

  url.searchParams.set(
    "token",
    `eq.${token}`
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

  if (
    !response.ok
  ) {
    throw new Error(
      await response.text()
    );
  }
}

async function ensureListeners() {
  if (
    listenersReady ||
    !isSupportedPlatform()
  ) {
    return;
  }

  listenersReady =
    true;

  await PushNotifications.addListener(
    "registration",
    async (
      token
    ) => {
      const value =
        token?.value ||
        "";

      if (!value) {
        return;
      }

      writeCachedToken(
        value
      );

      window.dispatchEvent(
        new CustomEvent(
          "yatut:native-push-registration",
          {
            detail: {
              token:
                value,
            },
          }
        )
      );

      if (
        currentSession?.user?.id
      ) {
        try {
          await saveNativeToken(
            currentSession,
            value
          );
        } catch (
          error
        ) {
          console.warn(
            "NATIVE PUSH TOKEN SAVE ERROR:",
            error
          );
        }
      }
    }
  );

  await PushNotifications.addListener(
    "registrationError",
    (
      error
    ) => {
      console.warn(
        "NATIVE PUSH REGISTRATION ERROR:",
        error
      );

      window.dispatchEvent(
        new CustomEvent(
          "yatut:native-push-registration-error",
          {
            detail:
              error,
          }
        )
      );
    }
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (
      action
    ) => {
      navigateFromPushData(
        action?.notification
          ?.data ||
          {}
      );
    }
  );

  await PushNotifications.addListener(
    "pushNotificationReceived",
    (
      notification
    ) => {
      window.dispatchEvent(
        new CustomEvent(
          "yatut:native-push-received",
          {
            detail:
              notification,
          }
        )
      );
    }
  );
}

function waitForToken(
  timeoutMs =
    7000
) {
  const cached =
    readCachedToken();

  if (cached) {
    return Promise.resolve(
      cached
    );
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      let done =
        false;

      const finish = (
        callback,
        value
      ) => {
        if (done) {
          return;
        }

        done =
          true;

        window.removeEventListener(
          "yatut:native-push-registration",
          onToken
        );

        window.removeEventListener(
          "yatut:native-push-registration-error",
          onError
        );

        window.clearTimeout(
          timer
        );

        callback(
          value
        );
      };

      const onToken = (
        event
      ) =>
        finish(
          resolve,
          event?.detail
            ?.token ||
            ""
        );

      const onError = (
        event
      ) =>
        finish(
          reject,
          new Error(
            event?.detail
              ?.error ||
            event?.detail
              ?.message ||
            "Не вдалося зареєструвати push-повідомлення."
          )
        );

      const timer =
        window.setTimeout(
          () =>
            finish(
              reject,
              new Error(
                "Не вдалося отримати push token від пристрою."
              )
            ),
          timeoutMs
        );

      window.addEventListener(
        "yatut:native-push-registration",
        onToken,
        {
          once:
            true,
        }
      );

      window.addEventListener(
        "yatut:native-push-registration-error",
        onError,
        {
          once:
            true,
        }
      );
    }
  );
}

export function getNativePushSupportState() {
  const supported =
    isSupportedPlatform();

  return {
    native:
      supported,
    supported,
    permission:
      supported
        ? cachedPermission
        : "unsupported",
    requiresInstall:
      false,
    standalone:
      supported,
    deviceLabel:
      platform() ===
        "ios"
        ? "iPhone / iPad"
        : platform() ===
          "android"
        ? "Android"
        : "Пристрій",
    subscribed:
      Boolean(
        readCachedToken()
      ),
  };
}

export async function enableNativePushNotifications(
  session
) {
  if (
    !isSupportedPlatform()
  ) {
    return null;
  }

  currentSession =
    session;

  await ensureListeners();

  let permissions =
    await PushNotifications
      .checkPermissions();

  cachedPermission =
    normalizePermission(
      permissions?.receive
    );

  if (
    cachedPermission !==
    "granted"
  ) {
    permissions =
      await PushNotifications
        .requestPermissions();

    cachedPermission =
      normalizePermission(
        permissions?.receive
      );
  }

  if (
    cachedPermission !==
    "granted"
  ) {
    throw new Error(
      "Дозвіл на системні сповіщення не надано."
    );
  }

  const tokenPromise =
    waitForToken();

  await PushNotifications
    .register();

  const token =
    await tokenPromise;

  if (token) {
    await saveNativeToken(
      session,
      token
    );
  }

  return token
    ? {
        token,
        platform:
          platform(),
      }
    : null;
}

export async function syncNativePushNotifications(
  session
) {
  if (
    !isSupportedPlatform() ||
    !session?.user?.id
  ) {
    return null;
  }

  currentSession =
    session;

  await ensureListeners();

  const permissions =
    await PushNotifications
      .checkPermissions();

  cachedPermission =
    normalizePermission(
      permissions?.receive
    );

  if (
    cachedPermission !==
    "granted"
  ) {
    return null;
  }

  const cached =
    readCachedToken();

  if (cached) {
    await saveNativeToken(
      session,
      cached
    );
  }

  const tokenPromise =
    waitForToken(
      4500
    ).catch(
      () =>
        cached ||
        null
    );

  await PushNotifications
    .register();

  const token =
    await tokenPromise;

  if (
    token &&
    token !==
      cached
  ) {
    await saveNativeToken(
      session,
      token
    );
  }

  return token
    ? {
        token,
        platform:
          platform(),
      }
    : null;
}

export async function disableNativePushNotifications(
  session
) {
  if (
    !isSupportedPlatform()
  ) {
    return;
  }

  currentSession =
    session;

  const token =
    readCachedToken();

  if (
    token &&
    session?.user?.id
  ) {
    try {
      await deleteNativeToken(
        session,
        token
      );
    } catch (
      error
    ) {
      console.warn(
        "NATIVE PUSH TOKEN DELETE ERROR:",
        error
      );
    }
  }

  try {
    await PushNotifications
      .unregister();
  } catch (
    error
  ) {
    console.warn(
      "NATIVE PUSH UNREGISTER ERROR:",
      error
    );
  }

  writeCachedToken(
    ""
  );

  cachedPermission =
    "default";
}
