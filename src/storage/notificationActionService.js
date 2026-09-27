import {
  acceptIncomingFriendRequest,
  declineIncomingFriendRequest,
} from "./friendService";

import {
  loadEvents,
  saveEvents,
} from "./eventService";

import {
  updateNotification,
} from "./notificationService";

import {
  acceptCommunityInvite,
} from "./notificationEntityBridge";

function actionTarget(notification) {
  const explicit =
    notification?.payload?.actionTarget;

  if (explicit) {
    return explicit;
  }

  if (
    notification?.type ===
    "friend_request"
  ) {
    return "friend";
  }

  if (
    notification?.type ===
    "community_invite"
  ) {
    return "community";
  }

  if (
    notification?.type ===
    "event_invite"
  ) {
    return "event";
  }

  return null;
}

export function getNotificationSourceInfo(
  notification
) {
  const mapping = {
    home: {
      label: "Допис",
      tone: "activity",
    },
    friends: {
      label: "Друзі",
      tone: "people",
    },
    chats: {
      label: "Чати",
      tone: "messages",
    },
    communities: {
      label: "Спільноти",
      tone: "communities",
    },
    events: {
      label: "Події",
      tone: "events",
    },
    nearby: {
      label: "Поруч",
      tone: "nearby",
    },
    profile: {
      label: "Профіль",
      tone: "people",
    },
    watch: {
      label: "PULSE",
      tone: "activity",
    },
    clips: {
      label: "PULSE",
      tone: "activity",
    },
    settings: {
      label: "Система",
      tone: "system",
    },
  };

  return (
    mapping[notification?.route] || {
      label: "ЯТУТ",
      tone:
        notification?.category ||
        "system",
    }
  );
}

export function getNotificationDecision(
  notification
) {
  const status =
    notification?.metadata?.actionStatus ||
    null;

  if (status) {
    const labels = {
      accepted: "Прийнято",
      declined: "Відхилено",
      going: "Ви йдете",
      joined: "Ви учасник",
    };

    return {
      done: true,
      status,
      statusLabel:
        labels[status] ||
        "Готово",
    };
  }

  const target =
    actionTarget(notification);

  const actions =
    Array.isArray(
      notification?.actions
    )
      ? notification.actions
      : [];

  if (
    !target &&
    !actions.includes("accept")
  ) {
    return null;
  }

  if (target === "community") {
    return {
      done: false,
      acceptLabel: "Приєднатися",
      declineLabel: "Не зараз",
    };
  }

  if (target === "event") {
    return {
      done: false,
      acceptLabel: "Піду",
      declineLabel: "Не зараз",
    };
  }

  return {
    done: false,
    acceptLabel: "Прийняти",
    declineLabel: "Відхилити",
  };
}

function updateActionState(
  notification,
  {
    status,
    title,
    text,
    type,
  }
) {
  return updateNotification(
    notification.id,
    {
      read: true,
      type:
        type ||
        notification.type,
      title:
        title ||
        notification.title,
      text:
        text ??
        notification.text,
      actions: [],
      metadata: {
        ...(notification.metadata || {}),
        actionStatus: status,
        actedAt: Date.now(),
      },
    }
  );
}

function resolvePersonId(notification) {
  return (
    notification?.payload?.personId ||
    notification?.authorId ||
    null
  );
}

function acceptEvent(notification) {
  const payload =
    notification?.payload || {};

  const eventId =
    payload.eventId ||
    payload.event?.id;

  if (!eventId) {
    return null;
  }

  const current =
    loadEvents();

  const found =
    current.some(
      (event) =>
        event.id === eventId
    );

  let next =
    current.map((event) => {
      if (event.id !== eventId) {
        return event;
      }

      const attendees =
        Array.isArray(
          event.attendees
        )
          ? event.attendees
          : [];

      return {
        ...event,
        attendees:
          attendees.includes("me")
            ? attendees
            : [
                ...attendees,
                "me",
              ],
      };
    });

  if (
    !found &&
    payload.event
  ) {
    next = [
      {
        ...payload.event,
        id: eventId,
        attendees: [
          ...new Set([
            ...(payload.event.attendees || []),
            "me",
          ]),
        ],
        interested:
          Array.isArray(
            payload.event.interested
          )
            ? payload.event.interested
            : [],
        createdAt:
          payload.event.createdAt ||
          Date.now(),
      },
      ...next,
    ];
  }

  saveEvents(next);

  return (
    next.find(
      (event) =>
        event.id === eventId
    ) ||
    null
  );
}

function declineEvent(notification) {
  const eventId =
    notification?.payload?.eventId ||
    notification?.payload?.event?.id;

  if (!eventId) {
    return;
  }

  saveEvents(
    loadEvents().map(
      (event) =>
        event.id === eventId
          ? {
              ...event,
              attendees:
                (
                  event.attendees ||
                  []
                ).filter(
                  (id) =>
                    id !== "me"
                ),
              interested:
                (
                  event.interested ||
                  []
                ).filter(
                  (id) =>
                    id !== "me"
                ),
            }
          : event
    )
  );
}

export async function executeNotificationAction(
  notification,
  action
) {
  if (!notification?.id) {
    return null;
  }

  const target =
    actionTarget(notification);

  if (target === "friend") {
    const personId =
      resolvePersonId(notification);

    if (action === "accept") {
      if (personId) {
        acceptIncomingFriendRequest(
          personId
        );
      }

      return updateActionState(
        notification,
        {
          status: "accepted",
          type: "friend_accepted",
          title:
            "Запит у друзі прийнято",
          text:
            `Тепер ви з ${notification.authorName || "користувачем"} друзі у ЯТУТ`,
        }
      );
    }

    if (personId) {
      declineIncomingFriendRequest(
        personId
      );
    }

    return updateActionState(
      notification,
      {
        status: "declined",
        title:
          "Запит у друзі відхилено",
        text:
          `Запит від ${notification.authorName || "користувача"} більше не активний`,
      }
    );
  }

  if (target === "community") {
    if (action === "accept") {
      const space =
        acceptCommunityInvite(
          notification.payload || {}
        );

      return updateActionState(
        notification,
        {
          status: "joined",
          title:
            "Запрошення прийнято",
          text:
            space?.title
              ? `Ви приєдналися до «${space.title}»`
              : "Спільнота додана до ваших просторів",
        }
      );
    }

    return updateActionState(
      notification,
      {
        status: "declined",
        title:
          "Запрошення відхилено",
        text:
          "Ви не приєдналися до цієї спільноти",
      }
    );
  }

  if (target === "event") {
    if (action === "accept") {
      const event =
        acceptEvent(notification);

      return updateActionState(
        notification,
        {
          status: "going",
          title:
            "Участь підтверджено",
          text:
            event?.title
              ? `Ви йдете на «${event.title}»`
              : "Подія додана до ваших планів",
        }
      );
    }

    declineEvent(notification);

    return updateActionState(
      notification,
      {
        status: "declined",
        title:
          "Запрошення відхилено",
        text:
          "Подія не додана до ваших планів",
      }
    );
  }

  return updateActionState(
    notification,
    {
      status:
        action === "accept"
          ? "accepted"
          : "declined",
    }
  );
}

export function resolveNotificationPayload(
  notification
) {
  const payload = {
    ...(notification?.payload || {}),
  };

  if (
    notification?.route ===
      "communities" &&
    payload.communityId ===
      "kyiv-today"
  ) {
    payload.communityId =
      "space-yatut-kyiv";
  }

  if (
    notification?.route ===
      "events" &&
    payload.eventId ===
      "evening-kyiv"
  ) {
    payload.eventId =
      "event-tech-meetup";
  }

  return payload;
}
