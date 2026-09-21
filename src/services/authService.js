const SUPABASE_URL =
  String(
    import.meta.env
      .VITE_SUPABASE_URL ||
      ""
  )
    .trim()
    .replace(
      /\/+$/,
      ""
    );

const SUPABASE_ANON_KEY =
  String(
    import.meta.env
      .VITE_SUPABASE_ANON_KEY ||
      ""
  ).trim();

const SESSION_KEY =
  "yatut-auth-session-v1";

const AUTH_EVENT =
  "yatut:auth-changed";

export function isAuthBackendConfigured() {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY
  );
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

  const expiresAt =
    session.expires_at ||
    (
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
    await fetch(
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
    await fetch(
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

  window.history.replaceState(
    {},
    "",
    "/"
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

export async function signInWithPassword({
  email,
  password,
}) {
  const response =
    await fetch(
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
  const response =
    await fetch(
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
                username,
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
      await fetch(
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

export async function getMyProfile(
  session
) {
  if (
    !session?.user?.id
  ) {
    return null;
  }

  const response =
    await fetch(
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
