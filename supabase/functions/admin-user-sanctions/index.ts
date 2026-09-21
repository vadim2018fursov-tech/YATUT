import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (
  body: unknown,
  status = 200,
) =>
  new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    },
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(
      "ok",
      {
        headers:
          corsHeaders,
      },
    );
  }

  if (req.method !== "POST") {
    return json(
      {
        error:
          "Method not allowed",
      },
      405,
    );
  }

  const supabaseUrl =
    Deno.env.get(
      "SUPABASE_URL",
    );

  const serviceKey =
    Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    );

  const authHeader =
    req.headers.get(
      "Authorization",
    );

  const token =
    authHeader
      ?.replace(
        /^Bearer\s+/i,
        "",
      )
      .trim();

  if (
    !supabaseUrl ||
    !serviceKey ||
    !token
  ) {
    return json(
      {
        error:
          "Unauthorized",
      },
      401,
    );
  }

  const service =
    createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          autoRefreshToken:
            false,
          persistSession:
            false,
        },
      },
    );

  const {
    data:
      {
        user:
          caller,
      },
    error:
      userError,
  } =
    await service.auth
      .getUser(
        token,
      );

  if (
    userError ||
    !caller
  ) {
    return json(
      {
        error:
          "Unauthorized",
      },
      401,
    );
  }

  const {
    data:
      callerProfile,
    error:
      callerError,
  } =
    await service
      .from(
        "profiles",
      )
      .select(
        "id, founder",
      )
      .eq(
        "id",
        caller.id,
      )
      .maybeSingle();

  if (
    callerError ||
    !callerProfile
      ?.founder
  ) {
    return json(
      {
        error:
          "Admin access denied",
      },
      403,
    );
  }

  let body:
    Record<
      string,
      unknown
    >;

  try {
    body =
      await req.json();
  } catch {
    return json(
      {
        error:
          "Invalid JSON",
      },
      400,
    );
  }

  const action =
    String(
      body.action ||
      "",
    );

  if (
    action === "apply"
  ) {
    const targetUserId =
      String(
        body.targetUserId ||
        "",
      );

    const sanctionType =
      String(
        body.sanctionType ||
        "",
      );

    const reason =
      String(
        body.reason ||
        "",
      ).trim();

    if (
      !targetUserId ||
      targetUserId ===
        caller.id
    ) {
      return json(
        {
          error:
            "Invalid target user",
        },
        400,
      );
    }

    if (
      ![
        "warning",
        "temporary_block",
        "permanent_block",
      ].includes(
        sanctionType,
      )
    ) {
      return json(
        {
          error:
            "Invalid sanction type",
        },
        400,
      );
    }

    if (
      reason.length <
      3 ||
      reason.length >
      1500
    ) {
      return json(
        {
          error:
            "Reason must be 3–1500 characters",
        },
        400,
      );
    }

    const {
      data:
        targetProfile,
      error:
        targetError,
    } =
      await service
        .from(
          "profiles",
        )
        .select(
          "id, founder, full_name, username",
        )
        .eq(
          "id",
          targetUserId,
        )
        .maybeSingle();

    if (
      targetError ||
      !targetProfile
    ) {
      return json(
        {
          error:
            "User not found",
        },
        404,
      );
    }

    if (
      targetProfile
        .founder
    ) {
      return json(
        {
          error:
            "Founder account cannot be sanctioned",
        },
        400,
      );
    }

    let expiresAt:
      string |
      null =
      null;

    let banDuration:
      string |
      null =
      null;

    if (
      sanctionType ===
      "temporary_block"
    ) {
      const durationHours =
        Number(
          body.durationHours,
        );

      if (
        !Number.isFinite(
          durationHours,
        ) ||
        durationHours <
          1 ||
        durationHours >
          8760
      ) {
        return json(
          {
            error:
              "Temporary block duration must be 1–8760 hours",
          },
          400,
        );
      }

      const roundedHours =
        Math.ceil(
          durationHours,
        );

      banDuration =
        `${roundedHours}h`;

      expiresAt =
        new Date(
          Date.now() +
            roundedHours *
              60 *
              60 *
              1000,
        ).toISOString();
    }

    if (
      sanctionType ===
      "permanent_block"
    ) {
      banDuration =
        "876000h";
    }

    if (
      banDuration
    ) {
      const {
        error:
          banError,
      } =
        await service
          .auth
          .admin
          .updateUserById(
            targetUserId,
            {
              ban_duration:
                banDuration,
            },
          );

      if (
        banError
      ) {
        return json(
          {
            error:
              banError.message,
          },
          400,
        );
      }

      await service
        .from(
          "user_sanctions",
        )
        .update({
          lifted_at:
            new Date()
              .toISOString(),
          lifted_by:
            caller.id,
          lift_note:
            "Replaced by a newer block",
        })
        .eq(
          "user_id",
          targetUserId,
        )
        .is(
          "lifted_at",
          null,
        )
        .in(
          "sanction_type",
          [
            "temporary_block",
            "permanent_block",
          ],
        );
    }

    const {
      data:
        sanction,
      error:
        insertError,
    } =
      await service
        .from(
          "user_sanctions",
        )
        .insert({
          user_id:
            targetUserId,
          created_by:
            caller.id,
          sanction_type:
            sanctionType,
          reason,
          expires_at:
            expiresAt,
        })
        .select(
          "id, sanction_type, reason, starts_at, expires_at, created_at",
        )
        .single();

    if (
      insertError
    ) {
      if (
        banDuration
      ) {
        await service
          .auth
          .admin
          .updateUserById(
            targetUserId,
            {
              ban_duration:
                "none",
            },
          );
      }

      return json(
        {
          error:
            insertError.message,
        },
        400,
      );
    }

    const isWarning =
      sanctionType ===
      "warning";

    await service
      .from(
        "notifications",
      )
      .insert({
        user_id:
          targetUserId,
        actor_id:
          caller.id,
        type:
          isWarning
            ? "account_warning"
            : "account_blocked",
        title:
          isWarning
            ? "Попередження від ЯТУТ"
            : "Акаунт обмежено",
        body:
          reason,
        route:
          "settings",
        payload: {
          section:
            "account",
          sanctionId:
            sanction.id,
          sanctionType,
          expiresAt,
        },
        read:
          false,
        group_key:
          `account-sanction:${sanction.id}`,
      });

    return json({
      ok: true,
      sanction,
    });
  }

  if (
    action === "lift"
  ) {
    const sanctionId =
      String(
        body.sanctionId ||
        "",
      );

    const liftNote =
      String(
        body.liftNote ||
        "",
      )
        .trim()
        .slice(
          0,
          1000,
        );

    const {
      data:
        sanction,
      error:
        sanctionError,
    } =
      await service
        .from(
          "user_sanctions",
        )
        .select(
          "id, user_id, sanction_type, lifted_at",
        )
        .eq(
          "id",
          sanctionId,
        )
        .maybeSingle();

    if (
      sanctionError ||
      !sanction
    ) {
      return json(
        {
          error:
            "Sanction not found",
        },
        404,
      );
    }

    if (
      sanction
        .lifted_at
    ) {
      return json({
        ok: true,
        alreadyLifted:
          true,
      });
    }

    if (
      [
        "temporary_block",
        "permanent_block",
      ].includes(
        sanction
          .sanction_type,
      )
    ) {
      const {
        error:
          unbanError,
      } =
        await service
          .auth
          .admin
          .updateUserById(
            sanction
              .user_id,
            {
              ban_duration:
                "none",
            },
          );

      if (
        unbanError
      ) {
        return json(
          {
            error:
              unbanError
                .message,
          },
          400,
        );
      }
    }

    const now =
      new Date()
        .toISOString();

    const {
      error:
        liftError,
    } =
      await service
        .from(
          "user_sanctions",
        )
        .update({
          lifted_at:
            now,
          lifted_by:
            caller.id,
          lift_note:
            liftNote ||
            "Санкцію знято адміністратором",
        })
        .eq(
          "user_id",
          sanction
            .user_id,
        )
        .is(
          "lifted_at",
          null,
        )
        .in(
          "sanction_type",
          sanction
            .sanction_type ===
            "warning"
            ? [
                "warning",
              ]
            : [
                "temporary_block",
                "permanent_block",
              ],
        );

    if (
      liftError
    ) {
      return json(
        {
          error:
            liftError.message,
        },
        400,
      );
    }

    await service
      .from(
        "notifications",
      )
      .insert({
        user_id:
          sanction.user_id,
        actor_id:
          caller.id,
        type:
          "account_restriction_lifted",
        title:
          "Обмеження знято",
        body:
          liftNote ||
          "Адміністратор ЯТУТ зняв обмеження з вашого акаунта.",
        route:
          "settings",
        payload: {
          section:
            "account",
          sanctionId,
        },
        read:
          false,
        group_key:
          `account-sanction-lifted:${sanctionId}`,
      });

    return json({
      ok: true,
    });
  }

  return json(
    {
      error:
        "Unknown action",
    },
    400,
  );
});