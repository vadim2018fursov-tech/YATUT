const DEFAULT_SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

const SUPABASE_URL =
  String(
    import.meta.env
      .VITE_SUPABASE_URL ||
      DEFAULT_SUPABASE_URL
  )
    .trim()
    .replace(
      /\/+$/,
      ""
    );

const SUPABASE_ANON_KEY =
  String(
    import.meta.env
      .VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env
        .VITE_SUPABASE_ANON_KEY ||
      DEFAULT_SUPABASE_PUBLISHABLE_KEY
  ).trim();

const SESSION_KEY =
  "yatut-auth-session-v1";

const AUTH_EVENT =
  "yatut:auth-changed";

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Сервер авторизації не відповідає. Перевірте інтернет і спробуйте ще раз."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function isAuthBackendConfigured() {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY
  );
}

export function normalizeUsername(
  value
) {
  return String(
    value ||
    ""
  )
    .trim()
    .replace(
      /^@/,
      ""
    )
    .toLowerCase();
}

export function isValidUsername(
  value
) {
  return /^[a-z0-9._]{3,30}$/.test(
    normalizeUsername(
      value
    )
  );
}

export async function checkUsernameAvailable(
  value,
  session = null
) {
  const username =
    normalizeUsername(
      value
    );

  if (
    !isValidUsername(
      username
    )
  ) {
    return false;
  }

  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/rpc/check_username_available`,
      {
        method:
          "POST",
        headers:
          authHeaders(
            session?.access_token ||
            null
          ),
        body:
          JSON.stringify({
            candidate:
              username,
          }),
      }
    );

  return Boolean(
    await parseResponse(
      response
    )
  );
}

export async function getAuthCapabilities() {
  if (
    !isAuthBackendConfigured()
  ) {
    return {
      email: false,
      google: false,
      facebook: false,
    };
  }

  try {
    const response =
      await fetchWithTimeout(
        `${SUPABASE_URL}/auth/v1/settings`,
        {
          headers: {
            apikey:
              SUPABASE_ANON_KEY,
          },
        }
      );

    const data =
      await parseResponse(
        response
      );

    const external =
      data?.external ||
      {};

    return {
      email:
        external.email !==
        false,
      google:
        Boolean(
          external.google
        ),
      facebook:
        Boolean(
          external.facebook
        ),
    };
  } catch (
    error
  ) {
    console.warn(
      "AUTH CAPABILITIES ERROR:",
      error
    );

    return {
      email: true,
      google: false,
      facebook: false,
    };
  }
}

function emitAuthChange(
  session
) {
  window.dispatchEvent(
    new CustomEvent(
      AUTH_EVENT,
      {
        detail: {
          session,
        },
      }
    )
  );
}

function saveSession(
  session
) {
  if (!session) {
    localStorage.removeItem(
      SESSION_KEY
    );

    emitAuthChange(
      null
    );

    return null;
  }

  const rawExpiresAt =
    Number(
      session.expires_at ||
        0
    );

  // Supabase returns expires_at in Unix seconds; the browser clock uses milliseconds.
  const expiresAt =
    rawExpiresAt
      ? rawExpiresAt < 1e12
        ? rawExpiresAt * 1000
        : rawExpiresAt
      : (
          Date.now() +
          Number(
            session.expires_in ||
              3600
          ) *
            1000
        );

  const normalized = {
    ...session,
    expires_at:
      expiresAt,
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(
      normalized
    )
  );

  emitAuthChange(
    normalized
  );

  return normalized;
}

function readStoredSession() {
  try {
    const raw =
      localStorage.getItem(
        SESSION_KEY
      );

    return raw
      ? JSON.parse(
          raw
        )
      : null;
  } catch {
    return null;
  }
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
      data?.msg ||
      data?.message ||
      data?.error_description ||
      data?.error ||
      "Не вдалося виконати запит.";

    const error =
      new Error(
        message
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}

function authHeaders(
  accessToken = null
) {
  return {
    apikey:
      SUPABASE_ANON_KEY,
    Authorization:
      `Bearer ${
        accessToken ||
        SUPABASE_ANON_KEY
      }`,
    "Content-Type":
      "application/json",
  };
}

async function fetchUser(
  accessToken
) {
  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers:
          authHeaders(
            accessToken
          ),
      }
    );

  return parseResponse(
    response
  );
}

async function refreshSession(
  refreshToken
) {
  if (
    !refreshToken
  ) {
    saveSession(
      null
    );

    return null;
  }

  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers:
          authHeaders(),
        body:
          JSON.stringify({
            refresh_token:
              refreshToken,
          }),
      }
    );

  const data =
    await parseResponse(
      response
    );

  return saveSession(
    data
  );
}

async function consumeOAuthCallback() {
  const hash =
    window.location.hash
      ?.replace(
        /^#/,
        ""
      ) ||
    "";

  if (!hash) {
    return null;
  }

  const params =
    new URLSearchParams(
      hash
    );

  const accessToken =
    params.get(
      "access_token"
    );

  if (
    !accessToken
  ) {
    const error =
      params.get(
        "error_description"
      ) ||
      params.get(
        "error"
      );

    if (
      error
    ) {
      throw new Error(
        error
      );
    }

    return null;
  }

  const user =
    await fetchUser(
      accessToken
    );

  const session =
    saveSession({
      access_token:
        accessToken,
      refresh_token:
        params.get(
          "refresh_token"
        ),
      token_type:
        params.get(
          "token_type"
        ) ||
        "bearer",
      expires_in:
        Number(
          params.get(
            "expires_in"
          ) ||
          3600
        ),
      user,
    });

  const callbackType =
    params.get(
      "type"
    );

  window.history.replaceState(
    {},
    "",
    callbackType ===
      "recovery"
      ? "/auth/reset"
      : "/"
  );

  return session;
}

export async function getAuthSession() {
  if (
    !isAuthBackendConfigured()
  ) {
    return null;
  }

  const oauthSession =
    await consumeOAuthCallback();

  if (
    oauthSession
  ) {
    return oauthSession;
  }

  const session =
    readStoredSession();

  if (
    !session?.access_token
  ) {
    return null;
  }

  const expiresAt =
    Number(
      session.expires_at ||
        0
    );

  if (
    expiresAt &&
    expiresAt -
      Date.now() <
      60 * 1000
  ) {
    return refreshSession(
      session.refresh_token
    );
  }

  try {
    const user =
      await fetchUser(
        session.access_token
      );

    return saveSession({
      ...session,
      user,
    });
  } catch (
    error
  ) {
    if (
      error?.status ===
        401
    ) {
      return refreshSession(
        session.refresh_token
      );
    }

    throw error;
  }
}

export async function requestPasswordReset(
  email
) {
  const redirectTo =
    `${window.location.origin}/auth/reset`;

  const url =
    new URL(
      `${SUPABASE_URL}/auth/v1/recover`
    );

  url.searchParams.set(
    "redirect_to",
    redirectTo
  );

  const response =
    await fetchWithTimeout(
      url,
      {
        method:
          "POST",
        headers:
          authHeaders(),
        body:
          JSON.stringify({
            email:
              String(
                email ||
                ""
              ).trim(),
          }),
      }
    );

  await parseResponse(
    response
  );

  return true;
}

export async function updatePassword(
  password
) {
  const session =
    readStoredSession();

  if (
    !session?.access_token
  ) {
    throw new Error(
      "Посилання для відновлення недійсне або вже застаріло. Запросіть нове."
    );
  }

  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        method:
          "PUT",
        headers:
          authHeaders(
            session.access_token
          ),
        body:
          JSON.stringify({
            password,
          }),
      }
    );

  const user =
    await parseResponse(
      response
    );

  return saveSession({
    ...session,
    user,
  });
}

export async function signInWithPassword({
  email,
  password,
}) {
  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers:
          authHeaders(),
        body:
          JSON.stringify({
            email,
            password,
          }),
      }
    );

  const session =
    await parseResponse(
      response
    );

  return saveSession(
    session
  );
}

export async function signUp({
  email,
  password,
  fullName,
  username,
}) {
  const normalizedUsername =
    normalizeUsername(
      username
    );

  if (
    !isValidUsername(
      normalizedUsername
    )
  ) {
    throw new Error(
      "Username має містити 3–30 символів: латинські літери, цифри, крапка або _."
    );
  }

  const available =
    await checkUsernameAvailable(
      normalizedUsername
    );

  if (!available) {
    throw new Error(
      "Цей username вже зайнятий."
    );
  }

  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/signup`,
      {
        method: "POST",
        headers:
          authHeaders(),
        body:
          JSON.stringify({
            email,
            password,
            data: {
              full_name:
                fullName,
              username:
                normalizedUsername,
            },
          }),
      }
    );

  const data =
    await parseResponse(
      response
    );

  if (
    data?.access_token
  ) {
    return {
      session:
        saveSession(
          data
        ),
      needsEmailConfirmation:
        false,
    };
  }

  return {
    session:
      null,
    user:
      data?.user ||
      data,
    needsEmailConfirmation:
      true,
  };
}

export function signInWithOAuth(
  provider
) {
  if (
    ![
      "google",
      "facebook",
    ].includes(
      provider
    )
  ) {
    throw new Error(
      "Непідтримуваний спосіб входу."
    );
  }

  const redirectTo =
    `${window.location.origin}/auth/callback`;

  const url =
    new URL(
      `${SUPABASE_URL}/auth/v1/authorize`
    );

  url.searchParams.set(
    "provider",
    provider
  );

  url.searchParams.set(
    "redirect_to",
    redirectTo
  );

  window.location.assign(
    url.toString()
  );
}

export async function signOut() {
  const session =
    readStoredSession();

  try {
    if (
      session?.access_token &&
      isAuthBackendConfigured()
    ) {
      await fetchWithTimeout(
        `${SUPABASE_URL}/auth/v1/logout`,
        {
          method:
            "POST",
          headers:
            authHeaders(
              session.access_token
            ),
        }
      );
    }
  } finally {
    saveSession(
      null
    );
  }
}

export function subscribeAuthState(
  callback
) {
  function handleAuth(
    event
  ) {
    callback(
      event?.detail
        ?.session ||
        null
    );
  }

  function handleStorage(
    event
  ) {
    if (
      event.key !==
        SESSION_KEY
    ) {
      return;
    }

    callback(
      readStoredSession()
    );
  }

  window.addEventListener(
    AUTH_EVENT,
    handleAuth
  );

  window.addEventListener(
    "storage",
    handleStorage
  );

  return () => {
    window.removeEventListener(
      AUTH_EVENT,
      handleAuth
    );

    window.removeEventListener(
      "storage",
      handleStorage
    );
  };
}

export async function completeMyOnboarding(
  session
) {
  if (
    !session?.user?.id
  ) {
    return null;
  }

  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/rpc/complete_my_onboarding`,
      {
        method:
          "POST",
        headers:
          authHeaders(
            session.access_token
          ),
        body:
          JSON.stringify({}),
      }
    );

  return parseResponse(
    response
  );
}

export async function updateMyProfile(
  session,
  profile
) {
  if (
    !session?.user?.id
  ) {
    return null;
  }

  const username =
    normalizeUsername(
      profile?.username
    );

  if (
    !isValidUsername(
      username
    )
  ) {
    throw new Error(
      "Username має містити 3–30 символів: латинські літери, цифри, крапка або _."
    );
  }

  const available =
    await checkUsernameAvailable(
      username,
      session
    );

  if (!available) {
    throw new Error(
      "Цей username вже зайнятий."
    );
  }

  const body = {
    username,
    full_name:
      String(
        profile?.name ||
        profile?.full_name ||
        ""
      ).trim(),
    bio:
      profile?.bio ||
      "",
    city:
      profile?.city ||
      null,
    country:
      profile?.country ||
      null,
    status:
      profile?.status ||
      "Я тут",
    status_text:
      profile?.statusText ||
      profile?.status_text ||
      "",
    avatar_url:
      profile?.avatar ||
      null,
    cover_url:
      profile?.cover ||
      null,
    updated_at:
      new Date().toISOString(),
  };

  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(
        session.user.id
      )}`,
      {
        method:
          "PATCH",
        headers: {
          ...authHeaders(
            session.access_token
          ),
          Prefer:
            "return=representation",
        },
        body:
          JSON.stringify(
            body
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

export async function getMyProfile(
  session
) {
  if (
    !session?.user?.id
  ) {
    return null;
  }

  const response =
    await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(
        session.user.id
      )}&select=*`,
      {
        headers: {
          ...authHeaders(
            session.access_token
          ),
          Accept:
            "application/json",
        },
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
