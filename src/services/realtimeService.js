const SUPABASE_PROJECT_REF =
  "yqskwqahmkeiconsrhoy";

const SUPABASE_KEY =
  "sb_publishable_v5dIgaWnA2cHe3d15jsoOQ_ub6gsx4W";

const REALTIME_URL =
  `wss://${SUPABASE_PROJECT_REF}.supabase.co/realtime/v1/websocket?apikey=${encodeURIComponent(
    SUPABASE_KEY
  )}&vsn=1.0.0`;

const RECONNECT_DELAYS = [
  1000,
  2000,
  5000,
  10000,
];

function createRealtimeChannel({
  session,
  topic,
  changes = [],
  presence = false,
  trackPresence = presence,
  onPostgresChange,
  onBroadcast,
  onPresence,
  onStatus,
  sharePresence = true,
}) {
  let socket =
    null;

  let heartbeat =
    null;

  let reconnectTimer =
    null;

  let ref =
    0;

  let joinRef =
    null;

  let closed =
    false;

  let reconnectAttempt =
    0;

  const channelTopic =
    `realtime:${topic}`;

  function nextRef() {
    ref +=
      1;

    return String(
      ref
    );
  }

  function rawSend(
    event,
    payload,
    {
      targetTopic =
        channelTopic,
      useJoinRef =
        true,
    } = {}
  ) {
    if (
      !socket ||
      socket.readyState !==
        WebSocket.OPEN
    ) {
      return false;
    }

    const messageRef =
      nextRef();

    socket.send(
      JSON.stringify({
        topic:
          targetTopic,
        event,
        payload:
          payload ||
          {},
        ref:
          messageRef,
        join_ref:
          useJoinRef
            ? joinRef
            : null,
      })
    );

    return true;
  }

  function clearTimers() {
    if (
      heartbeat
    ) {
      window.clearInterval(
        heartbeat
      );

      heartbeat =
        null;
    }

    if (
      reconnectTimer
    ) {
      window.clearTimeout(
        reconnectTimer
      );

      reconnectTimer =
        null;
    }
  }

  function scheduleReconnect() {
    if (
      closed ||
      reconnectTimer
    ) {
      return;
    }

    const delay =
      RECONNECT_DELAYS[
        Math.min(
          reconnectAttempt,
          RECONNECT_DELAYS.length -
            1
        )
      ];

    reconnectAttempt +=
      1;

    onStatus?.(
      "reconnecting"
    );

    reconnectTimer =
      window.setTimeout(
        () => {
          reconnectTimer =
            null;

          connect();
        },
        delay
      );
  }

  function handleMessage(
    event
  ) {
    let message =
      null;

    try {
      message =
        JSON.parse(
          event.data
        );
    } catch {
      return;
    }

    if (
      !message ||
      message.topic !==
        channelTopic
    ) {
      return;
    }

    if (
      message.event ===
      "phx_reply"
    ) {
      const status =
        message.payload
          ?.status;

      if (
        message.ref ===
          joinRef &&
        status ===
          "ok"
      ) {
        reconnectAttempt =
          0;

        onStatus?.(
          "connected"
        );

        if (
          presence &&
          trackPresence
        ) {
          rawSend(
            "presence",
            {
              type:
                "presence",
              event:
                "track",
              payload: {
                user_id:
                  session?.user?.id ||
                  null,
                online_at:
                  new Date().toISOString(),
              },
            }
          );
        }
      } else if (
        status ===
        "error"
      ) {
        onStatus?.(
          "error",
          message.payload
            ?.response ||
            null
        );
      }

      return;
    }

    if (
      message.event ===
      "postgres_changes"
    ) {
      onPostgresChange?.(
        message.payload
          ?.data ||
        message.payload ||
        {}
      );

      return;
    }

    if (
      message.event ===
      "broadcast"
    ) {
      onBroadcast?.(
        message.payload ||
        {}
      );

      return;
    }

    if (
      message.event ===
        "presence_state" ||
      message.event ===
        "presence_diff"
    ) {
      onPresence?.(
        message.event,
        message.payload ||
          {}
      );

      return;
    }

    if (
      message.event ===
        "phx_error" ||
      message.event ===
        "phx_close"
    ) {
      onStatus?.(
        "disconnected"
      );
    }

    if (
      message.event ===
        "system" &&
      message.payload
        ?.status ===
        "error"
    ) {
      onStatus?.(
        "error",
        message.payload
      );
    }
  }

  function connect() {
    if (
      closed
    ) {
      return;
    }

    clearTimers();

    onStatus?.(
      "connecting"
    );

    socket =
      new WebSocket(
        REALTIME_URL
      );

    socket.addEventListener(
      "open",
      () => {
        joinRef =
          nextRef();

        socket.send(
          JSON.stringify({
            topic:
              channelTopic,
            event:
              "phx_join",
            payload: {
              config: {
                broadcast: {
                  ack:
                    false,
                  self:
                    false,
                },
                presence: {
                  enabled:
                    Boolean(
                      presence
                    ),
                  key:
                    presence
                      ? session
                          ?.user
                          ?.id ||
                        ""
                      : "",
                },
                postgres_changes:
                  changes,
                private:
                  false,
              },
              access_token:
                session
                  ?.access_token ||
                null,
            },
            ref:
              joinRef,
            join_ref:
              joinRef,
          })
        );

        heartbeat =
          window.setInterval(
            () => {
              rawSend(
                "heartbeat",
                {},
                {
                  targetTopic:
                    "phoenix",
                  useJoinRef:
                    false,
                }
              );
            },
            20000
          );
      }
    );

    socket.addEventListener(
      "message",
      handleMessage
    );

    socket.addEventListener(
      "error",
      () => {
        onStatus?.(
          "error"
        );
      }
    );

    socket.addEventListener(
      "close",
      () => {
        if (
          heartbeat
        ) {
          window.clearInterval(
            heartbeat
          );

          heartbeat =
            null;
        }

        if (
          !closed
        ) {
          onStatus?.(
            "disconnected"
          );

          scheduleReconnect();
        }
      }
    );
  }

  function broadcast(
    event,
    payload
  ) {
    return rawSend(
      "broadcast",
      {
        type:
          "broadcast",
        event,
        payload,
      }
    );
  }

  function updateAccessToken(
    accessToken
  ) {
    if (
      !accessToken
    ) {
      return;
    }

    rawSend(
      "access_token",
      {
        access_token:
          accessToken,
      }
    );
  }

  function close() {
    closed =
      true;

    clearTimers();

    if (
      socket &&
      socket.readyState ===
        WebSocket.OPEN
    ) {
      rawSend(
        "phx_leave",
        {}
      );
    }

    socket?.close();

    socket =
      null;

    onStatus?.(
      "closed"
    );
  }

  connect();

  return {
    broadcast,
    updateAccessToken,
    close,
  };
}

export function subscribeChatRealtime({
  session,
  conversationId,
  onChange,
  onTyping,
  onPresence,
  onStatus,
  sharePresence = true,
}) {
  if (
    !session?.access_token ||
    !conversationId
  ) {
    return {
      sendTyping:
        () => false,
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  const channel =
    createRealtimeChannel({
      session,
      topic:
        `chat:${conversationId}`,
      presence:
        true,
      trackPresence:
        sharePresence,
      changes: [
        {
          event:
            "*",
          schema:
            "public",
          table:
            "messages",
          filter:
            `conversation_id=eq.${conversationId}`,
        },
        {
          event:
            "UPDATE",
          schema:
            "public",
          table:
            "conversation_members",
          filter:
            `conversation_id=eq.${conversationId}`,
        },
      ],
      onPostgresChange:
        onChange,
      onBroadcast: (
        payload
      ) => {
        if (
          payload?.event !==
          "typing"
        ) {
          return;
        }

        onTyping?.(
          payload.payload ||
            {}
        );
      },
      onPresence,
      onStatus,
    });

  return {
    sendTyping(
      typing
    ) {
      if (
        !sharePresence
      ) {
        return false;
      }

      return channel.broadcast(
        "typing",
        {
          userId:
            session.user.id,
          typing:
            Boolean(
              typing
            ),
          at:
            Date.now(),
        }
      );
    },

    updateAccessToken:
      channel.updateAccessToken,

    close:
      channel.close,
  };
}

export function subscribeChatListRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `chat-list:${session.user.id}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "messages",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "conversation_members",
        filter:
          `user_id=eq.${session.user.id}`,
      },
      {
        event:
          "UPDATE",
        schema:
          "public",
        table:
          "conversations",
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}

export function subscribeFeedRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `feed:${session.user.id}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "posts",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "comments",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "post_reactions",
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}


export function subscribeNotificationsRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `notifications:${session.user.id}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "notifications",
        filter:
          `user_id=eq.${session.user.id}`,
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}


export function subscribeSocialGraphRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  const userId =
    session.user.id;

  return createRealtimeChannel({
    session,
    topic:
      `social:${userId}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "friend_requests",
        filter:
          `sender_id=eq.${userId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "friend_requests",
        filter:
          `receiver_id=eq.${userId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "friendships",
        filter:
          `user_id=eq.${userId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "friendships",
        filter:
          `friend_id=eq.${userId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "follows",
        filter:
          `follower_id=eq.${userId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "follows",
        filter:
          `following_id=eq.${userId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "blocks",
        filter:
          `blocker_id=eq.${userId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "blocks",
        filter:
          `blocked_id=eq.${userId}`,
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}


export function subscribeSavedRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `saved:${session.user.id}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "saved_items",
        filter:
          `user_id=eq.${session.user.id}`,
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}


export function subscribeCommunityFeedRealtime({
  session,
  communityId,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id ||
    !communityId
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `community-feed:${communityId}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "community_posts",
        filter:
          `community_id=eq.${communityId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "community_post_reactions",
        filter:
          `community_id=eq.${communityId}`,
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "community_post_comments",
        filter:
          `community_id=eq.${communityId}`,
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}


export function subscribeCommunitiesRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `communities:${session.user.id}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "communities",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "community_members",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "community_join_requests",
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}


export function subscribeStoriesRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `stories:${session.user.id}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "stories",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "story_views",
        filter:
          `user_id=eq.${session.user.id}`,
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}


export function subscribeEventsRealtime({
  session,
  onChange,
  onStatus,
}) {
  if (
    !session?.access_token ||
    !session?.user?.id
  ) {
    return {
      updateAccessToken:
        () => {},
      close:
        () => {},
    };
  }

  return createRealtimeChannel({
    session,
    topic:
      `events:${session.user.id}`,
    changes: [
      {
        event:
          "*",
        schema:
          "public",
        table:
          "events",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "event_participants",
      },
      {
        event:
          "*",
        schema:
          "public",
        table:
          "event_likes",
      },
    ],
    onPostgresChange:
      onChange,
    onStatus,
  });
}
