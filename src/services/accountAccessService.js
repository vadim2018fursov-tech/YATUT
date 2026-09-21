const SUPABASE_URL =
  "https://yqskwqahmkeiconsrhoy.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

function headers(
  session
) {
  return {
    apikey:
      SUPABASE_KEY,
    Authorization:
      `Bearer ${session?.access_token || SUPABASE_KEY}`,
    "Content-Type":
      "application/json",
  };
}

async function rpc(
  session,
  name,
  body = {}
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify(
            body
          ),
      }
    );

  const text =
    await response.text();

  let data = null;

  try {
    data =
      text
        ? JSON.parse(text)
        : null;
  } catch {
    data = text;
  }

  if (
    !response.ok
  ) {
    throw new Error(
      data?.message ||
      data?.error ||
      "Account access request failed."
    );
  }

  return data;
}

export async function getMyAccountAccessState(
  session
) {
  const data =
    await rpc(
      session,
      "get_my_account_access_state",
      {}
    );

  return {
    status:
      data?.status ||
      "active",
    block:
      data?.block ||
      null,
    warning:
      data?.warning ||
      null,
  };
}

export async function acknowledgeMyWarning(
  session,
  sanctionId
) {
  await rpc(
    session,
    "acknowledge_my_warning",
    {
      target_sanction_id:
        sanctionId,
    }
  );
}

export async function loadAdminUserSanctions(
  session,
  userId
) {
  const rows =
    await rpc(
      session,
      "get_admin_user_sanctions",
      {
        target_user_id:
          userId,
      }
    );

  return Array.isArray(
    rows
  )
    ? rows
    : [];
}

async function invokeSanctionsEdge(
  session,
  body
) {
  const response =
    await fetch(
      `${SUPABASE_URL}/functions/v1/admin-user-sanctions`,
      {
        method:
          "POST",
        headers:
          headers(
            session
          ),
        body:
          JSON.stringify(
            body
          ),
      }
    );

  const data =
    await response
      .json()
      .catch(
        () => null
      );

  if (
    !response.ok
  ) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Sanction action failed."
    );
  }

  return data;
}

export async function applyAdminUserSanction(
  session,
  {
    targetUserId,
    sanctionType,
    reason,
    durationHours = null,
  }
) {
  return invokeSanctionsEdge(
    session,
    {
      action:
        "apply",
      targetUserId,
      sanctionType,
      reason,
      durationHours,
    }
  );
}

export async function liftAdminUserSanction(
  session,
  sanctionId,
  liftNote = ""
) {
  return invokeSanctionsEdge(
    session,
    {
      action:
        "lift",
      sanctionId,
      liftNote,
    }
  );
}
