import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./Notifications.css";

import YatutIcon from "./YatutIcon";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification,
  subscribeNotifications,
} from "../storage/notificationService";

import {
  executeNotificationAction,
  getNotificationDecision,
  getNotificationSourceInfo,
  resolveNotificationPayload,
} from "../storage/notificationActionService";

import {
  deleteBackendNotification,
  deleteBackendNotifications,
  markAllBackendNotificationsRead,
  markBackendNotificationRead,
} from "../services/notificationBackendService";

import {
  acceptBackendFriendRequest,
  declineBackendFriendRequest,
} from "../services/socialBackendService";

/* =========================================================
   YATUT NOTIFICATIONS V2
========================================================= */

const FILTERS = [
  {
    id: "all",
    label: "Усі",
  },

  {
    id: "unread",
    label: "Непрочитані",
  },

  {
    id: "people",
    label: "Люди",
  },

  {
    id: "activity",
    label: "Активність",
  },

  {
    id: "events",
    label: "Події",
  },

  {
    id: "communities",
    label: "Спільноти",
  },

  {
    id: "system",
    label: "Система",
  },
];

/* =========================================================
   GROUPS
========================================================= */

const GROUPS = [
  {
    id: "today",
    title: "Сьогодні",
  },

  {
    id: "yesterday",
    title: "Вчора",
  },

  {
    id: "week",
    title:
      "Цього тижня",
  },

  {
    id: "earlier",
    title: "Раніше",
  },

  {
    id: "old",
    title: "Давніші",
  },
];

/* =========================================================
   FORMAT TIME
========================================================= */

function formatNotificationTime(
  value
) {
  const time =
    Number(
      value ||
        Date.now()
    );

  const difference =
    Math.max(
      0,
      Date.now() -
        time
    );

  const minutes =
    Math.floor(
      difference /
        60000
    );

  if (
    minutes <
    1
  ) {
    return "зараз";
  }

  if (
    minutes <
    60
  ) {
    return `${minutes} хв`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  if (
    hours <
    24
  ) {
    return `${hours} год`;
  }

  const days =
    Math.floor(
      hours /
        24
    );

  if (
    days ===
    1
  ) {
    return "вчора";
  }

  if (
    days <
    7
  ) {
    return `${days} дн`;
  }

  return new Date(
    time
  ).toLocaleDateString(
    "uk-UA",
    {
      day:
        "numeric",

      month:
        "short",
    }
  );
}

/* =========================================================
   GET GROUP
========================================================= */

function getNotificationGroup(
  value
) {
  const time =
    Number(
      value ||
        Date.now()
    );

  const now =
    new Date();

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

  const yesterdayStart =
    todayStart -
    24 *
      60 *
      60 *
      1000;

  const weekStart =
    todayStart -
    6 *
      24 *
      60 *
      60 *
      1000;

  if (
    time >=
    todayStart
  ) {
    return "today";
  }

  if (
    time >=
    yesterdayStart
  ) {
    return "yesterday";
  }

  if (
    time >=
    weekStart
  ) {
    return "week";
  }

  const date =
    new Date(
      time
    );

  if (
    date.getFullYear() ===
    now.getFullYear()
  ) {
    return "earlier";
  }

  return "old";
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

export default function Notifications({
  open,
  onClose,
  onNavigate,
  authSession = null,
  pageMode = false,
}) {
  const [
    notifications,
    setNotifications,
  ] =
    useState(
      () =>
        getNotifications()
    );

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState(
      "all"
    );

  const [
    menuId,
    setMenuId,
  ] =
    useState(null);

  const [
    headerMenuOpen,
    setHeaderMenuOpen,
  ] =
    useState(false);

  const [
    actionBusyId,
    setActionBusyId,
  ] =
    useState(null);

  const panelRef =
    useRef(null);

  /* =======================================================
     LIVE SYNC
  ======================================================= */

  useEffect(() => {
    const unsubscribe =
      subscribeNotifications(
        (
          nextNotifications
        ) => {
          setNotifications(
            nextNotifications
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /* =======================================================
     ESC
  ======================================================= */

  useEffect(() => {
    if (
      !open ||
      pageMode
    ) {
      return undefined;
    }

    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose?.();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    onClose,
    pageMode,
  ]);

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    if (
      !open ||
      pageMode
    ) {
      return undefined;
    }

    function handlePointerDown(
      event
    ) {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target
        ) &&
        !event.target.closest(
          "[data-notification-trigger]"
        )
      ) {
        onClose?.();
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, [
    open,
    onClose,
  ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const visibleNotifications =
    useMemo(
      () => {
        const sorted =
          [
            ...notifications,
          ].sort(
            (
              first,
              second
            ) =>
              Number(
                second.createdAt ||
                  0
              ) -
              Number(
                first.createdAt ||
                  0
              )
          );

        if (
          activeFilter ===
          "all"
        ) {
          return sorted;
        }

        if (
          activeFilter ===
          "unread"
        ) {
          return sorted.filter(
            (
              notification
            ) =>
              !notification.read
          );
        }

        return sorted.filter(
          (
            notification
          ) =>
            notification.category ===
            activeFilter
        );
      },
      [
        activeFilter,
        notifications,
      ]
    );

  /* =======================================================
     GROUPED
  ======================================================= */

  const groupedNotifications =
    useMemo(
      () =>
        GROUPS.map(
          (
            group
          ) => ({
            ...group,

            items:
              visibleNotifications.filter(
                (
                  notification
                ) =>
                  getNotificationGroup(
                    notification.createdAt
                  ) ===
                  group.id
              ),
          })
        ).filter(
          (
            group
          ) =>
            group.items.length >
            0
        ),
      [
        visibleNotifications,
      ]
    );

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (
            notification
          ) =>
            !notification.read
        ).length,
      [
        notifications,
      ]
    );

  const readCount =
    useMemo(
      () =>
        notifications.filter(
          (
            notification
          ) =>
            notification.read
        ).length,
      [
        notifications,
      ]
    );

  /* =======================================================
     OPEN
  ======================================================= */

  function openNotification(
    notification
  ) {
    /*
      Переглянуте сповіщення одразу прибираємо зі списку.
      Це синхронно оновлює badge та локальний UI, а backend
      очищається у фоні, щоб воно не поверталося після перезавантаження.
    */
    removeNotification(
      notification.id
    );

    if (
      notification.backend &&
      authSession?.user?.id
    ) {
      deleteBackendNotification(
        authSession,
        notification.id
      ).catch(
        (
          error
        ) => {
          console.warn(
            "BACKEND NOTIFICATION VIEW DELETE ERROR:",
            error
          );
        }
      );
    } else if (
      !notification.read
    ) {
      markNotificationRead(
        notification.id
      );
    }

    const resolvedPayload =
      resolveNotificationPayload(
        notification
      );

    if (
      notification.route &&
      resolvedPayload
    ) {
      try {
        sessionStorage.setItem(
          "yatut-open-route-payload",
          JSON.stringify({
            route:
              notification.route,

            payload:
              resolvedPayload,
          })
        );

        if (
          notification.route ===
            "chats" &&
          resolvedPayload.conversationId
        ) {
          sessionStorage.setItem(
            "yatut-open-chat-id",
            resolvedPayload.conversationId
          );
        }
      } catch (error) {
        console.warn(
          "NOTIFICATION ROUTE PAYLOAD ERROR:",
          error
        );
      }
    }

    if (
      notification.route
    ) {
      onNavigate?.(
        notification.route,
        resolvedPayload
      );
    }

    onClose?.();
  }

  /* =======================================================
     CONNECTED ACTIONS
  ======================================================= */

  async function handleDecision(
    event,
    notification,
    action
  ) {
    event.stopPropagation();

    if (
      actionBusyId ===
      notification.id
    ) {
      return;
    }

    setActionBusyId(
      notification.id
    );

    try {
      if (
        notification.backend &&
        authSession?.user?.id &&
        notification.type ===
          "friend_request"
      ) {
        if (
          action ===
          "accept"
        ) {
          await acceptBackendFriendRequest(
            authSession,
            notification.authorId
          );
        } else if (
          action ===
          "decline"
        ) {
          await declineBackendFriendRequest(
            authSession,
            notification.authorId
          );
        }

        await deleteBackendNotification(
          authSession,
          notification.id
        );

        removeNotification(
          notification.id
        );
      } else {
        await executeNotificationAction(
          notification,
          action
        );
      }
    } catch (error) {
      console.error(
        "NOTIFICATION ACTION ERROR:",
        error
      );
    } finally {
      setActionBusyId(
        null
      );
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteNotification(
    event,
    notificationId
  ) {
    event.stopPropagation();

    const notification =
      notifications.find(
        (
          item
        ) =>
          item.id ===
          notificationId
      );

    try {
      if (
        notification?.backend &&
        authSession?.user?.id
      ) {
        await deleteBackendNotification(
          authSession,
          notificationId
        );
      }

      removeNotification(
        notificationId
      );
    } catch (
      error
    ) {
      console.warn(
        "BACKEND NOTIFICATION DELETE ERROR:",
        error
      );
    }

    setMenuId(
      null
    );
  }

  /* =======================================================
     CLEAR READ
  ======================================================= */

  async function clearReadNotifications() {
    const read =
      notifications.filter(
        (
          notification
        ) =>
          notification.read
      );

    try {
      if (
        authSession?.user?.id
      ) {
        await deleteBackendNotifications(
          authSession,
          {
            readOnly:
              true,
          }
        );
      }

      read.forEach(
        (
          notification
        ) => {
          removeNotification(
            notification.id
          );
        }
      );
    } catch (
      error
    ) {
      console.warn(
        "BACKEND READ NOTIFICATIONS CLEAR ERROR:",
        error
      );
    }

    setHeaderMenuOpen(
      false
    );
  }

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  async function clearAllNotifications() {
    const confirmed =
      window.confirm(
        "Видалити всі сповіщення?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      if (
        authSession?.user?.id
      ) {
        await deleteBackendNotifications(
          authSession
        );
      }

      notifications.forEach(
        (
          notification
        ) => {
          removeNotification(
            notification.id
          );
        }
      );
    } catch (
      error
    ) {
      console.warn(
        "BACKEND NOTIFICATIONS CLEAR ERROR:",
        error
      );
    }

    setHeaderMenuOpen(
      false
    );
  }

  async function markAllRead() {
    try {
      if (
        authSession?.user?.id
      ) {
        await markAllBackendNotificationsRead(
          authSession
        );
      }

      markAllNotificationsRead();
    } catch (
      error
    ) {
      console.warn(
        "BACKEND NOTIFICATIONS READ ALL ERROR:",
        error
      );
    }
  }

  if (
    !open &&
    !pageMode
  ) {
    return null;
  }

  return (
    <aside
      ref={
        panelRef
      }
      className={`notifications-panel notifications-v2 ${
        pageMode
          ? "notifications-page"
          : ""
      }`.trim()}
      aria-label="Сповіщення"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="notifications-header">
        {pageMode && (
          <button
            className="notifications-page-back"
            type="button"
            onClick={
              onClose
            }
            aria-label="Назад"
          >
            <YatutIcon
              name="arrowLeft"
              size={20}
            />
          </button>
        )}

        <div className="notifications-heading">
          <span className="notifications-brand">
            ЯТУТ
          </span>

          <div className="notifications-title-row">
            <h2>
              Сповіщення
            </h2>

            {unreadCount >
              0 && (
              <b>
                {
                  unreadCount
                }
              </b>
            )}
          </div>
        </div>

        <div className="notifications-header-actions">
          {unreadCount >
            0 && (
            <button
              className="notifications-read-all"
              type="button"
              onClick={
                markAllRead
              }
            >
              Прочитати всі
            </button>
          )}

          <div className="notifications-global-menu-wrap">
            <button
              className="notifications-global-menu-button"
              type="button"
              onClick={() =>
                setHeaderMenuOpen(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              aria-label="Меню сповіщень"
            >
              <YatutIcon
                name="more"
                size={19}
              />
            </button>

            {headerMenuOpen && (
              <div className="notifications-global-menu">
                <button
                  type="button"
                  disabled={
                    readCount ===
                    0
                  }
                  onClick={
                    clearReadNotifications
                  }
                >
                  Очистити прочитані
                </button>

                <button
                  className="danger"
                  type="button"
                  disabled={
                    notifications.length ===
                    0
                  }
                  onClick={
                    clearAllNotifications
                  }
                >
                  Видалити всі
                </button>
              </div>
            )}
          </div>

          {!pageMode && (
            <button
              className="notifications-close"
              type="button"
              onClick={
                onClose
              }
              aria-label="Закрити сповіщення"
            >
              <YatutIcon
                name="close"
                size={19}
              />
            </button>
          )}
        </div>
      </header>

      {/* ===================================================
          PULSE
      =================================================== */}

      {notifications.length >
        0 && (
        <section className="notifications-pulse">
          <div className="notifications-pulse-icon">
            <YatutIcon
              name="bell"
              size={18}
            />
          </div>

          <div>
            <span>
              ПУЛЬС ЯТУТ
            </span>

            <strong>
              {unreadCount >
              0
                ? `${unreadCount} нових сповіщення`
                : "Ви все переглянули"}
            </strong>
          </div>

          <span
            className={`notifications-live-dot ${
              unreadCount >
              0
                ? "active"
                : ""
            }`}
          />
        </section>
      )}

      {/* ===================================================
          FILTERS
      =================================================== */}

      <nav className="notifications-filters">
        {FILTERS.map(
          (
            filter
          ) => {
            let count =
              null;

            if (
              filter.id ===
              "all"
            ) {
              count =
                notifications.length;
            }

            if (
              filter.id ===
              "unread"
            ) {
              count =
                unreadCount;
            }

            return (
              <button
                key={
                  filter.id
                }
                className={
                  activeFilter ===
                  filter.id
                    ? "active"
                    : ""
                }
                type="button"
                onClick={() =>
                  setActiveFilter(
                    filter.id
                  )
                }
              >
                <span>
                  {
                    filter.label
                  }
                </span>

                {count !==
                  null &&
                  count >
                    0 && (
                    <b>
                      {
                        count
                      }
                    </b>
                  )}
              </button>
            );
          }
        )}
      </nav>

      {/* ===================================================
          LIST
      =================================================== */}

      <div className="notifications-scroll">
        {groupedNotifications.length ? (
          <div className="notifications-groups">
            {groupedNotifications.map(
              (
                group
              ) => (
                <section
                  className="notifications-group"
                  key={
                    group.id
                  }
                >
                  <header className="notifications-group-header">
                    <h3>
                      {
                        group.title
                      }
                    </h3>

                    <span>
                      {
                        group.items.length
                      }
                    </span>
                  </header>

                  <div className="notifications-list">
                    {group.items.map(
                      (
                        notification
                      ) => (
                        <NotificationItem
                          key={
                            notification.id
                          }
                          notification={
                            notification
                          }
                          menuOpen={
                            menuId ===
                            notification.id
                          }
                          onToggleMenu={(
                            event
                          ) => {
                            event.stopPropagation();

                            setMenuId(
                              (
                                previous
                              ) =>
                                previous ===
                                notification.id
                                  ? null
                                  : notification.id
                            );
                          }}
                          onOpen={() =>
                            openNotification(
                              notification
                            )
                          }
                          actionBusy={
                            actionBusyId ===
                            notification.id
                          }
                          onDecision={(
                            event,
                            action
                          ) =>
                            handleDecision(
                              event,
                              notification,
                              action
                            )
                          }
                          onDelete={(
                            event
                          ) =>
                            deleteNotification(
                              event,
                              notification.id
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        ) : (
          <EmptyNotifications
            filter={
              activeFilter
            }
            onShowAll={() =>
              setActiveFilter(
                "all"
              )
            }
          />
        )}
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="notifications-footer">
        <button
          className="notifications-settings-button"
          type="button"
          onClick={() => {
            onNavigate?.(
              "settings"
            );

            onClose?.();
          }}
        >
          <YatutIcon
            name="settings"
            size={17}
          />

          <span>
            Налаштування
          </span>
        </button>

        <button
          className="notifications-all-button"
          type="button"
          onClick={() =>
            setActiveFilter(
              "all"
            )
          }
        >
          <span>
            Усі сповіщення
          </span>

          <YatutIcon
            name="arrowRight"
            size={17}
          />
        </button>
      </footer>
    </aside>
  );
}

/* =========================================================
   ITEM
========================================================= */

function NotificationItem({
  notification,
  menuOpen,
  onToggleMenu,
  onOpen,
  actionBusy,
  onDecision,
  onDelete,
}) {
  const decision =
    getNotificationDecision(
      notification
    );

  const source =
    getNotificationSourceInfo(
      notification
    );

  const hasDecision =
    Boolean(
      decision &&
      !decision.done
    );

  const accepted =
    notification.type ===
      "friend_accepted" ||
    notification.metadata
      ?.actionStatus ===
      "accepted";

  return (
    <article
      className={`notification-item notification-type-${
        notification.type ||
        "default"
      } notification-category-${
        notification.category ||
        "general"
      } ${
        notification.read
          ? "read"
          : "unread"
      } ${
        notification.priority ===
        "important"
          ? "important"
          : ""
      }`}
      onClick={
        onOpen
      }
    >
      <div className="notification-avatar-area">
        <div className="notification-avatar">
          {notification.authorAvatar ? (
            <img
              src={
                notification.authorAvatar
              }
              alt={
                notification.authorName ||
                ""
              }
            />
          ) : (
            notification.authorInitial ||
            "Я"
          )}
        </div>

        {!notification.read && (
          <span className="notification-avatar-pulse" />
        )}
      </div>

      <div className="notification-content">
        <div className="notification-top-row">
          <strong>
            {
              notification.title
            }
          </strong>

          {!notification.read && (
            <span className="notification-unread-dot" />
          )}
        </div>

        {notification.text && (
          <p>
            {
              notification.text
            }
          </p>
        )}

        <div className="notification-meta-row">
          <span className="notification-time">
            {formatNotificationTime(
              notification.createdAt
            )}
          </span>

          <span
            className={`notification-source-chip source-${source.tone}`}
          >
            {
              source.label
            }
          </span>

          {decision?.done && (
            <span
              className={`notification-action-status status-${decision.status}`}
            >
              {
                decision.statusLabel
              }
            </span>
          )}

          {notification.priority ===
            "important" && (
            <span className="notification-important-label">
              Важливо
            </span>
          )}

          {notification.type ===
            "nearby" && (
            <span className="notification-context-label nearby">
              Поруч
            </span>
          )}

          {(notification.type ===
              "event" ||
            notification.type ===
              "event_reminder") && (
            <span className="notification-context-label event">
              Подія
            </span>
          )}

          {accepted && (
            <span className="notification-context-label friend">
              Друзі
            </span>
          )}
        </div>

        {hasDecision && (
          <div className="notification-request-actions">
            <button
              className="accept"
              type="button"
              disabled={
                actionBusy
              }
              onClick={(
                event
              ) =>
                onDecision(
                  event,
                  "accept"
                )
              }
            >
              {
                actionBusy
                  ? "Зачекайте…"
                  : decision.acceptLabel
              }
            </button>

            <button
              className="decline"
              type="button"
              disabled={
                actionBusy
              }
              onClick={(
                event
              ) =>
                onDecision(
                  event,
                  "decline"
                )
              }
            >
              {
                decision.declineLabel
              }
            </button>
          </div>
        )}

        {!hasDecision &&
          (notification.type ===
            "event" ||
            notification.type ===
              "event_reminder") && (
            <button
              className="notification-inline-action"
              type="button"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                onOpen();
              }}
            >
              Відкрити подію

              <YatutIcon
                name="arrowRight"
                size={14}
              />
            </button>
          )}

        {!hasDecision &&
          notification.type ===
            "security" && (
            <button
              className="notification-inline-action security"
              type="button"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                onOpen();
              }}
            >
              Перевірити безпеку

              <YatutIcon
                name="arrowRight"
                size={14}
              />
            </button>
          )}
      </div>

      <div className="notification-menu-wrap">
        <button
          className="notification-more"
          type="button"
          onClick={
            onToggleMenu
          }
          aria-label="Меню сповіщення"
        >
          <YatutIcon
            name="more"
            size={18}
          />
        </button>

        {menuOpen && (
          <div className="notification-menu">
            {!notification.read && (
              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  markNotificationRead(
                    notification.id
                  );
                }}
              >
                Позначити прочитаним
              </button>
            )}

            <button
              className="danger"
              type="button"
              onClick={
                onDelete
              }
            >
              Видалити
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyNotifications({
  filter,
  onShowAll,
}) {
  const unread =
    filter ===
    "unread";

  return (
    <div className="notifications-empty">
      <div className="notifications-empty-icon">
        <YatutIcon
          name="bell"
          size={30}
        />
      </div>

      <span>
        ЯТУТ
      </span>

      <h3>
        {unread
          ? "Усе переглянуто"
          : "Тут поки тихо"}
      </h3>

      <p>
        {unread
          ? "У вас немає непрочитаних сповіщень."
          : "Нові події, реакції та зв’язки з’являться тут."}
      </p>

      {filter !==
        "all" && (
        <button
          type="button"
          onClick={
            onShowAll
          }
        >
          Показати всі
        </button>
      )}
    </div>
  );
}