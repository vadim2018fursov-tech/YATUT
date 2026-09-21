import {
  useEffect,
  useMemo,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";
import AdminUserSanctionsModal from "./AdminUserSanctionsModal";

import {
  loadSystemAdminDashboard,
  setUserReportStatus,
} from "../services/adminBackendService";

import "./AdminCenter.css";

const MODULES = [
  {
    id: "overview",
    title: "Огляд",
    icon: "home",
  },
  {
    id: "reports",
    title: "Скарги",
    icon: "bell",
  },
  {
    id: "users",
    title: "Користувачі",
    icon: "friends",
  },
  {
    id: "communities",
    title: "Спільноти",
    icon: "community",
  },
  {
    id: "events",
    title: "Події",
    icon: "events",
  },
  {
    id: "posts",
    title: "Публікації",
    icon: "saved",
  },
  {
    id: "nearby",
    title: "Поруч",
    icon: "nearby",
  },
];

function dateTime(
  value
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleString(
    "uk-UA",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function AdminCenter({
  authSession,
  onNavigate,
}) {
  const [
    module,
    setModule,
  ] = useState("overview");

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState({
    stats: {},
    users: [],
    reports: [],
    communities: [],
    events: [],
    posts: [],
    nearby: [],
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sanctionsUser,
    setSanctionsUser,
  ] = useState(null);

  const [
    accessDenied,
    setAccessDenied,
  ] = useState(false);

  async function refresh(
    overrides = {}
  ) {
    try {
      setLoading(true);
      setAccessDenied(false);

      const next =
        await loadSystemAdminDashboard(
          authSession,
          {
            module:
              overrides.module ??
              (
                module === "overview"
                  ? null
                  : module
              ),
            search:
              overrides.search ??
              (
                query ||
                null
              ),
          }
        );

      setData(next);
    } catch (
      error
    ) {
      console.warn(
        "ADMIN CENTER LOAD ERROR:",
        error
      );

      if (
        /access denied/i.test(
          error?.message ||
          ""
        )
      ) {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [
    authSession?.access_token,
  ]);

  function changeModule(
    next
  ) {
    setModule(next);
    setQuery("");

    refresh({
      module:
        next ===
        "overview"
          ? null
          : next,
      search: null,
    });
  }

  async function updateReport(
    reportId,
    status
  ) {
    try {
      await setUserReportStatus(
        authSession,
        reportId,
        status
      );

      await refresh({
        module: "reports",
      });
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося оновити скаргу."
      );
    }
  }

  const cards =
    useMemo(
      () => [
        {
          id: "users",
          label: "Користувачі",
          value:
            data.stats
              ?.users ||
            0,
          icon: "friends",
        },
        {
          id: "reports",
          label: "Активні скарги",
          value:
            data.stats
              ?.reportsOpen ||
            0,
          icon: "bell",
        },
        {
          id: "communities",
          label: "Спільноти",
          value:
            data.stats
              ?.communities ||
            0,
          icon: "community",
        },
        {
          id: "events",
          label: "Події",
          value:
            data.stats
              ?.events ||
            0,
          icon: "events",
        },
        {
          id: "posts",
          label: "Публікації",
          value:
            data.stats
              ?.posts ||
            0,
          icon: "saved",
        },
        {
          id: "nearby",
          label: "Поруч · pending",
          value:
            data.stats
              ?.nearbyPending ||
            0,
          icon: "nearby",
        },
      ],
      [
        data.stats,
      ]
    );

  if (
    accessDenied
  ) {
    return (
      <section className="admin-center admin-center-denied">
        <div>
          <YatutIcon
            name="profile"
            size={28}
          />

          <h1>
            Немає доступу
          </h1>

          <p>
            Системна адмін-панель доступна лише founder-акаунту ЯТУТ.
          </p>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "home"
              )
            }
          >
            На головну
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-center">
      <header className="admin-center-hero">
        <div>
          <span>
            ЯТУТ · SYSTEM ADMIN
          </span>

          <h1>
            Центр керування
          </h1>

          <p>
            Користувачі, скарги, контент, спільноти, події та локальна модерація в одному місці.
          </p>
        </div>

        <div className="admin-center-hero-mark">
          Я
        </div>
      </header>

      <nav className="admin-center-nav">
        {MODULES.map(
          (
            item
          ) => (
            <button
              key={
                item.id
              }
              type="button"
              className={
                module ===
                item.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeModule(
                  item.id
                )
              }
            >
              <YatutIcon
                name={
                  item.icon
                }
                size={17}
              />

              <span>
                {
                  item.title
                }
              </span>
            </button>
          )
        )}
      </nav>

      {module !==
        "overview" && (
        <div className="admin-center-search">
          <YatutIcon
            name="search"
            size={17}
          />

          <input
            value={
              query
            }
            onChange={(
              event
            ) =>
              setQuery(
                event.target.value
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                refresh({
                  module,
                  search:
                    query,
                });
              }
            }}
            placeholder="Пошук у модулі..."
          />

          <button
            type="button"
            onClick={() =>
              refresh({
                module,
                search:
                  query,
              })
            }
          >
            Знайти
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-center-loading">
          Завантажуємо системні дані...
        </div>
      ) : (
        <>
          {module ===
            "overview" && (
            <>
              <div className="admin-center-stats">
                {cards.map(
                  (
                    card
                  ) => (
                    <button
                      key={
                        card.id
                      }
                      type="button"
                      onClick={() =>
                        changeModule(
                          card.id
                        )
                      }
                    >
                      <div>
                        <YatutIcon
                          name={
                            card.icon
                          }
                          size={18}
                        />
                      </div>

                      <span>
                        {
                          card.label
                        }
                      </span>

                      <strong>
                        {
                          Number(
                            card.value
                          )
                        }
                      </strong>
                    </button>
                  )
                )}
              </div>

              <section className="admin-center-overview-grid">
                <article>
                  <header>
                    <span>
                      СКАРГИ
                    </span>

                    <h2>
                      Потребують уваги
                    </h2>
                  </header>

                  {data.reports
                    .filter(
                      (
                        report
                      ) =>
                        [
                          "open",
                          "reviewing",
                        ].includes(
                          report.status
                        )
                    )
                    .slice(
                      0,
                      5
                    )
                    .map(
                      (
                        report
                      ) => (
                        <button
                          key={
                            report.id
                          }
                          type="button"
                          className="admin-overview-row"
                          onClick={() =>
                            changeModule(
                              "reports"
                            )
                          }
                        >
                          <div>
                            <strong>
                              {
                                report.targetName
                              }
                            </strong>

                            <small>
                              {
                                report.reason
                              }
                            </small>
                          </div>

                          <span>
                            {
                              report.status
                            }
                          </span>
                        </button>
                      )
                    )}

                  {!data.reports
                    .some(
                      (
                        report
                      ) =>
                        [
                          "open",
                          "reviewing",
                        ].includes(
                          report.status
                        )
                    ) && (
                    <p className="admin-empty">
                      Активних скарг немає.
                    </p>
                  )}
                </article>

                <article>
                  <header>
                    <span>
                      ПОРУЧ
                    </span>

                    <h2>
                      Очікують модерації
                    </h2>
                  </header>

                  {data.nearby
                    .filter(
                      (
                        place
                      ) =>
                        place.status ===
                        "pending"
                    )
                    .slice(
                      0,
                      5
                    )
                    .map(
                      (
                        place
                      ) => (
                        <button
                          key={
                            place.id
                          }
                          type="button"
                          className="admin-overview-row"
                          onClick={() =>
                            onNavigate?.(
                              "nearby",
                              {
                                placeId:
                                  place.id,
                              }
                            )
                          }
                        >
                          <div>
                            <strong>
                              {
                                place.title
                              }
                            </strong>

                            <small>
                              {
                                place.city ||
                                place.creatorName
                              }
                            </small>
                          </div>

                          <span>
                            pending
                          </span>
                        </button>
                      )
                    )}

                  {!data.nearby
                    .some(
                      (
                        place
                      ) =>
                        place.status ===
                        "pending"
                    ) && (
                    <p className="admin-empty">
                      Черга «Поруч» порожня.
                    </p>
                  )}
                </article>
              </section>
            </>
          )}

          {module ===
            "reports" && (
            <section className="admin-module">
              <header>
                <div>
                  <span>
                    СКАРГИ
                  </span>

                  <h2>
                    Модерація користувачів
                  </h2>
                </div>

                <strong>
                  {
                    data.reports
                      .length
                  }
                </strong>
              </header>

              <div className="admin-report-list">
                {data.reports.map(
                  (
                    report
                  ) => (
                    <article
                      key={
                        report.id
                      }
                      className="admin-report-card"
                    >
                      <div className="admin-report-card__main">
                        <div>
                          <span className={`admin-status is-${report.status}`}>
                            {
                              report.status
                            }
                          </span>

                          <small>
                            {
                              dateTime(
                                report.createdAt
                              )
                            }
                          </small>
                        </div>

                        <h3>
                          Скарга на {
                            report.targetName
                          }
                        </h3>

                        <p>
                          <strong>
                            {
                              report.reason
                            }
                          </strong>
                          {report.details
                            ? ` · ${report.details}`
                            : ""}
                        </p>

                        <small>
                          Від: {
                            report.reporterName
                          } · @{report.targetUsername}
                        </small>
                      </div>

                      <div className="admin-report-card__actions">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate?.(
                              "friends",
                              {
                                personId:
                                  report.targetUserId,
                              }
                            )
                          }
                        >
                          Профіль
                        </button>

                        <select
                          value={
                            report.status
                          }
                          onChange={(
                            event
                          ) =>
                            updateReport(
                              report.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="open">
                            Open
                          </option>
                          <option value="reviewing">
                            Reviewing
                          </option>
                          <option value="resolved">
                            Resolved
                          </option>
                          <option value="dismissed">
                            Dismissed
                          </option>
                        </select>
                      </div>
                    </article>
                  )
                )}

                {!data.reports
                  .length && (
                  <p className="admin-empty">
                    Скарг не знайдено.
                  </p>
                )}
              </div>
            </section>
          )}

          {module ===
            "users" && (
            <section className="admin-module">
              <header>
                <div>
                  <span>
                    USERS
                  </span>

                  <h2>
                    Користувачі
                  </h2>
                </div>

                <strong>
                  {
                    data.users.length
                  }
                </strong>
              </header>

              <div className="admin-user-list">
                {data.users.map(
                  (
                    user
                  ) => (
                    <article
                      key={
                        user.id
                      }
                      className="admin-user-row"
                    >
                      <button
                        type="button"
                        className="admin-user-row__profile"
                        onClick={() =>
                          onNavigate?.(
                            "friends",
                            {
                              personId:
                                user.id,
                            }
                          )
                        }
                      >
                        <div className="admin-avatar">
                          {user.avatarUrl ? (
                            <img
                              src={
                                user.avatarUrl
                              }
                              alt=""
                            />
                          ) : (
                            String(
                              user.name ||
                              "?"
                            )
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>

                        <div>
                          <strong>
                            {
                              user.name
                            }
                            {user.founder
                              ? " · Founder"
                              : ""}
                          </strong>

                          <small>
                            @{user.username}
                            {user.city
                              ? ` · ${user.city}`
                              : ""}
                          </small>
                        </div>
                      </button>

                      <span className="admin-user-row__reports">
                        {
                          Number(
                            user.reportsAgainst ||
                            0
                          )
                        } скарг
                      </span>

                      <button
                        type="button"
                        className="admin-user-row__sanctions"
                        disabled={
                          user.founder
                        }
                        onClick={() =>
                          setSanctionsUser(
                            user
                          )
                        }
                      >
                        <YatutIcon
                          name="bell"
                          size={15}
                        />

                        Санкції
                      </button>
                    </article>
                  )
                )}

                {!data.users.length && (
                  <p className="admin-empty">
                    Користувачів не знайдено.
                  </p>
                )}
              </div>
            </section>
          )}

          {module ===
            "communities" && (
            <section className="admin-module">
              <header>
                <div>
                  <span>
                    COMMUNITIES
                  </span>

                  <h2>
                    Спільноти
                  </h2>
                </div>

                <strong>
                  {
                    data.communities
                      .length
                  }
                </strong>
              </header>

              <div className="admin-simple-list">
                {data.communities.map(
                  (
                    item
                  ) => (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        onNavigate?.(
                          "communities",
                          {
                            communityId:
                              item.id,
                          }
                        )
                      }
                    >
                      <div className="admin-icon-tile">
                        <YatutIcon
                          name="community"
                          size={18}
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <small>
                          {
                            item.ownerName
                          }
                          {item.city
                            ? ` · ${item.city}`
                            : ""}
                        </small>
                      </div>

                      <span>
                        {
                          Number(
                            item.members ||
                            0
                          )
                        } уч.
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {module ===
            "events" && (
            <section className="admin-module">
              <header>
                <div>
                  <span>
                    EVENTS
                  </span>

                  <h2>
                    Події
                  </h2>
                </div>

                <strong>
                  {
                    data.events.length
                  }
                </strong>
              </header>

              <div className="admin-simple-list">
                {data.events.map(
                  (
                    item
                  ) => (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        onNavigate?.(
                          "events",
                          {
                            eventId:
                              item.id,
                          }
                        )
                      }
                    >
                      <div className="admin-icon-tile">
                        <YatutIcon
                          name="events"
                          size={18}
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <small>
                          {
                            item.creatorName
                          }
                          {item.city
                            ? ` · ${item.city}`
                            : ""}
                        </small>
                      </div>

                      <span>
                        {
                          item.status
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {module ===
            "posts" && (
            <section className="admin-module">
              <header>
                <div>
                  <span>
                    CONTENT
                  </span>

                  <h2>
                    Публікації
                  </h2>
                </div>

                <strong>
                  {
                    data.posts.length
                  }
                </strong>
              </header>

              <div className="admin-simple-list">
                {data.posts.map(
                  (
                    item
                  ) => (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        onNavigate?.(
                          "home",
                          {
                            postId:
                              item.id,
                          }
                        )
                      }
                    >
                      <div className="admin-icon-tile">
                        <YatutIcon
                          name="saved"
                          size={18}
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            item.authorName
                          }
                        </strong>

                        <small>
                          {
                            item.text ||
                            "Медіапублікація"
                          }
                        </small>
                      </div>

                      <span>
                        {
                          dateTime(
                            item.createdAt
                          )
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}

          {module ===
            "nearby" && (
            <section className="admin-module">
              <header>
                <div>
                  <span>
                    NEARBY
                  </span>

                  <h2>
                    Місця «Поруч»
                  </h2>
                </div>

                <button
                  type="button"
                  className="admin-open-module"
                  onClick={() =>
                    onNavigate?.(
                      "nearby"
                    )
                  }
                >
                  Відкрити модерацію
                </button>
              </header>

              <div className="admin-simple-list">
                {data.nearby.map(
                  (
                    item
                  ) => (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        onNavigate?.(
                          "nearby",
                          {
                            placeId:
                              item.id,
                          }
                        )
                      }
                    >
                      <div className="admin-icon-tile">
                        <YatutIcon
                          name="nearby"
                          size={18}
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <small>
                          {
                            item.creatorName
                          }
                          {item.city
                            ? ` · ${item.city}`
                            : ""}
                        </small>
                      </div>

                      <span className={`admin-status is-${item.status}`}>
                        {
                          item.status
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>
          )}
        </>
      )}
      {sanctionsUser && (
        <AdminUserSanctionsModal
          authSession={
            authSession
          }
          user={
            sanctionsUser
          }
          onClose={() =>
            setSanctionsUser(
              null
            )
          }
          onChanged={() =>
            refresh({
              module:
                "users",
            })
          }
        />
      )}

    </section>
  );
}
