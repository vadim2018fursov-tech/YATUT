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
      `Bearer ${session?.access_token}`,
    "Content-Type":
      "application/json",
  };
}

async function rpc(
  session,
  name,
  body = {}
) {
  if (
    !SUPABASE_URL ||
    !SUPABASE_KEY ||
    !session?.access_token
  ) {
    throw new Error(
      "Admin backend unavailable"
    );
  }

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

  if (
    !response.ok
  ) {
    const data =
      await response
        .json()
        .catch(
          () => null
        );

    throw new Error(
      data?.message ||
      data?.error_description ||
      `Admin request failed (${response.status})`
    );
  }

  if (
    response.status ===
    204
  ) {
    return null;
  }

  return response.json();
}

export async function loadSystemAdminDashboard(
  session,
  {
    module = null,
    search = null,
  } = {}
) {
  const data =
    await rpc(
      session,
      "get_system_admin_dashboard",
      {
        module_filter:
          module ||
          null,
        search_query:
          search ||
          null,
      }
    );

  return {
    stats:
      data?.stats ||
      {},
    users:
      Array.isArray(
        data?.users
      )
        ? data.users
        : [],
    reports:
      Array.isArray(
        data?.reports
      )
        ? data.reports
        : [],
    communities:
      Array.isArray(
        data?.communities
      )
        ? data.communities
        : [],
    events:
      Array.isArray(
        data?.events
      )
        ? data.events
        : [],
    posts:
      Array.isArray(
        data?.posts
      )
        ? data.posts
        : [],
    nearby:
      Array.isArray(
        data?.nearby
      )
        ? data.nearby
        : [],
  };
}

export async function setUserReportStatus(
  session,
  reportId,
  status
) {
  await rpc(
    session,
    "set_user_report_status",
    {
      target_report_id:
        reportId,
      next_status:
        status,
    }
  );
}
