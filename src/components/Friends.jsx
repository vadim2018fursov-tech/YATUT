import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./FriendsV2.css";

import YatutIcon from "./YatutIcon";

import {
  FRIEND_STATUSES,
  acceptIncomingFriendRequest,
  cancelFriendRequest,
  declineIncomingFriendRequest,
  getFriendState,
  getFriendStatus,
  removeFriend,
  sendFriendRequest,
  subscribeFriends,
} from "../storage/friendService";

/* =========================================================
   YATUT FRIENDS V2
========================================================= */

const PEOPLE = [
  {
    id: "maria",

    name:
      "Марія Коваль",

    username:
      "maria.koval",

    initial: "М",

    city:
      "Київ",

    online:
      true,

    nearby:
      true,

    distance:
      "1,2 км",

    mutual:
      18,

    verified:
      true,

    relation:
      "Через школу та 18 спільних друзів",

    common: [
      "Навчалися в одній школі",

      "18 спільних друзів",

      "Обидва живете у Києві",

      "Перетинаєтесь у спільноті «Київ сьогодні»",
    ],
  },

  {
    id:
      "oleksandr",

    name:
      "Олександр Бондар",

    username:
      "bondar",

    initial: "О",

    city:
      "Київ",

    online:
      true,

    nearby:
      false,

    distance:
      null,

    mutual:
      12,

    verified:
      false,

    relation:
      "12 спільних друзів та спільна робота",

    common: [
      "12 спільних друзів",

      "Працювали в одній сфері",

      "Обидва у Києві",

      "Маєте спільні професійні контакти",
    ],
  },

  {
    id:
      "anastasia",

    name:
      "Анастасія Мельник",

    username:
      "nastia",

    initial: "А",

    city:
      "Київ",

    online:
      false,

    nearby:
      true,

    distance:
      "2,4 км",

    mutual:
      7,

    verified:
      true,

    relation:
      "7 спільних знайомих та схожі інтереси",

    common: [
      "7 спільних знайомих",

      "Живете в одному місті",

      "Цікавитеся творчістю",

      "Були на схожих подіях у Києві",
    ],
  },

  {
    id: "max",

    name:
      "Максим Шевченко",

    username:
      "max.sh",

    initial: "М",

    city:
      "Бровари",

    online:
      false,

    nearby:
      false,

    distance:
      null,

    mutual:
      9,

    verified:
      false,

    relation:
      "Через 9 спільних друзів",

    common: [
      "9 спільних друзів",

      "Є спільні робочі контакти",

      "Підписані на схожі спільноти",
    ],
  },

  {
    id: "sofia",

    name:
      "Софія Романенко",

    username:
      "sofia.r",

    initial: "С",

    city:
      "Київ",

    online:
      true,

    nearby:
      true,

    distance:
      "850 м",

    mutual:
      21,

    verified:
      true,

    relation:
      "21 спільний друг та часто буваєте поруч",

    common: [
      "21 спільний друг",

      "Часто буваєте в одному районі",

      "Схожі події та місця",

      "Спільні друзі зі школи",
    ],
  },

  {
    id: "vlad",

    name:
      "Владислав Мороз",

    username:
      "vlad.moroz",

    initial: "В",

    city:
      "Київ",

    online:
      false,

    nearby:
      false,

    distance:
      null,

    mutual:
      5,

    verified:
      false,

    relation:
      "Через роботу та 5 спільних друзів",

    common: [
      "5 спільних друзів",

      "Спільна професійна сфера",

      "Живете у Києві",
    ],
  },

  {
    id: "yulia",

    name:
      "Юлія Савченко",

    username:
      "yulia.s",

    initial: "Ю",

    city:
      "Київ",

    online:
      true,

    nearby:
      false,

    distance:
      null,

    mutual:
      14,

    verified:
      false,

    relation:
      "14 спільних друзів",

    common: [
      "14 спільних друзів",

      "Спільні інтереси",

      "Відвідуєте схожі події",

      "Живете в одному місті",
    ],
  },
];

/* =========================================================
   TABS
========================================================= */

const TABS = [
  {
    id: "all",

    label:
      "Усі",
  },

  {
    id:
      "friends",

    label:
      "Мої друзі",
  },

  {
    id:
      "requests",

    label:
      "Запити",
  },

  {
    id:
      "suggestions",

    label:
      "Можливо, знайомі",
  },

  {
    id:
      "nearby",

    label:
      "Поруч",
  },
];

/* =========================================================
   FRIENDS COMPONENT
========================================================= */

export default function Friends({
  onNavigate,
  onOpenChat,
}) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "all"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    friendState,
    setFriendState,
  ] =
    useState(
      () =>
        getFriendState()
    );

  const [
    selectedPerson,
    setSelectedPerson,
  ] =
    useState(null);

  const [
    relationPerson,
    setRelationPerson,
  ] =
    useState(null);

  /* =======================================================
     FRIEND STATE LIVE SYNC

     Если дружба меняется:
     - из Notifications
     - из другой карточки
     - из другой вкладки браузера

     Friends обновляется автоматически.
  ======================================================= */

  useEffect(() => {
    setFriendState(
      getFriendState()
    );

    const unsubscribe =
      subscribeFriends(
        (
          nextState
        ) => {
          setFriendState(
            nextState
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /* =======================================================
     STATUS
  ======================================================= */

  function getStatus(
    personId
  ) {
    if (
      friendState.friends.includes(
        personId
      )
    ) {
      return FRIEND_STATUSES.FRIEND;
    }

    if (
      friendState.incomingRequests.some(
        (
          request
        ) =>
          request.personId ===
          personId
      )
    ) {
      return FRIEND_STATUSES.INCOMING;
    }

    if (
      friendState.outgoingRequests.some(
        (
          request
        ) =>
          request.personId ===
          personId
      )
    ) {
      return FRIEND_STATUSES.OUTGOING;
    }

    return FRIEND_STATUSES.NONE;
  }

  /* =======================================================
     PEOPLE WITH LIVE RELATION
  ======================================================= */

  const people =
    useMemo(
      () =>
        PEOPLE.map(
          (
            person
          ) => ({
            ...person,

            friendStatus:
              getStatus(
                person.id
              ),

            friends:
              friendState.friends.includes(
                person.id
              ),
          })
        ),
      [
        friendState,
      ]
    );

  /* =======================================================
     FILTER
  ======================================================= */

  const visiblePeople =
    useMemo(
      () => {
        const cleanSearch =
          search
            .trim()
            .toLowerCase();

        return people.filter(
          (
            person
          ) => {
            if (
              activeTab ===
                "friends" &&
              person.friendStatus !==
                FRIEND_STATUSES.FRIEND
            ) {
              return false;
            }

            if (
              activeTab ===
                "requests" &&
              person.friendStatus !==
                FRIEND_STATUSES.INCOMING &&
              person.friendStatus !==
                FRIEND_STATUSES.OUTGOING
            ) {
              return false;
            }

            if (
              activeTab ===
                "suggestions" &&
              person.friendStatus ===
                FRIEND_STATUSES.FRIEND
            ) {
              return false;
            }

            if (
              activeTab ===
                "nearby" &&
              !person.nearby
            ) {
              return false;
            }

            if (
              !cleanSearch
            ) {
              return true;
            }

            const haystack =
              [
                person.name,

                person.username,

                person.city,

                person.relation,
              ]
                .join(
                  " "
                )
                .toLowerCase();

            return haystack.includes(
              cleanSearch
            );
          }
        );
      },
      [
        activeTab,
        people,
        search,
      ]
    );

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(
      () => ({
        friends:
          people.filter(
            (
              person
            ) =>
              person.friendStatus ===
              FRIEND_STATUSES.FRIEND
          ).length,

        online:
          people.filter(
            (
              person
            ) =>
              person.online &&
              person.friendStatus ===
                FRIEND_STATUSES.FRIEND
          ).length,

        nearby:
          people.filter(
            (
              person
            ) =>
              person.nearby
          ).length,

        suggestions:
          people.filter(
            (
              person
            ) =>
              person.friendStatus !==
              FRIEND_STATUSES.FRIEND
          ).length,

        incoming:
          friendState
            .incomingRequests
            .length,

        outgoing:
          friendState
            .outgoingRequests
            .length,
      }),
      [
        people,
        friendState,
      ]
    );

  /* =======================================================
     SEND REQUEST
  ======================================================= */

  function requestFriend(
    person
  ) {
    if (
      !person?.id
    ) {
      return;
    }

    const status =
      getFriendStatus(
        person.id
      );

    /* =====================================================
       ALREADY FRIEND
    ===================================================== */

    if (
      status ===
      FRIEND_STATUSES.FRIEND
    ) {
      const confirmed =
        window.confirm(
          `Видалити ${person.name} з друзів?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      removeFriend(
        person.id
      );

      return;
    }

    /* =====================================================
       INCOMING REQUEST
    ===================================================== */

    if (
      status ===
      FRIEND_STATUSES.INCOMING
    ) {
      acceptIncomingFriendRequest(
        person.id
      );

      return;
    }

    /* =====================================================
       OUTGOING REQUEST
    ===================================================== */

    if (
      status ===
      FRIEND_STATUSES.OUTGOING
    ) {
      cancelFriendRequest(
        person.id
      );

      return;
    }

    /* =====================================================
       NEW REQUEST
    ===================================================== */

    sendFriendRequest(
      person.id
    );
  }

  function declineRequest(
    person
  ) {
    if (
      !person?.id
    ) {
      return;
    }

    if (
      getFriendStatus(
        person.id
      ) !==
      FRIEND_STATUSES.INCOMING
    ) {
      return;
    }

    declineIncomingFriendRequest(
      person.id
    );
  }

  /* =======================================================
     OPEN PROFILE PREVIEW
  ======================================================= */

  function openProfile(
    person
  ) {
    setSelectedPerson(
      person
    );
  }

  /* =======================================================
     OPEN CHAT
  ======================================================= */

  function openChat(
    person
  ) {
    if (
      !person?.id
    ) {
      return;
    }

    onOpenChat?.(
      person.id
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="friends-v2-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="friends-v2-hero">
        <div className="friends-v2-hero-bg" />

        <div className="friends-v2-hero-content">
          <span className="friends-v2-eyebrow">
            ЯТУТ • ЗНАЙДИ СВОЇХ
          </span>

          <h1>
            Люди, яких ваше життя
            вже могло зустрічати
          </h1>

          <p>
            Друзі, знайомі, люди поруч
            і реальні зв’язки між вами.
          </p>
        </div>

        {/* =================================================
            NETWORK VISUAL
        ================================================= */}

        <div
          className="friends-v2-hero-network"
          aria-hidden="true"
        >
          <span className="network-line line-1" />

          <span className="network-line line-2" />

          <span className="network-line line-3" />

          <span className="network-node network-me">
            В
          </span>

          <span className="network-node node-1">
            М
          </span>

          <span className="network-node node-2">
            С
          </span>

          <span className="network-node node-3">
            О
          </span>
        </div>
      </section>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="friends-v2-summary">
        <SummaryStat
          value={
            stats.friends
          }
          label="Друзів"
          icon="friends"
        />

        <SummaryStat
          value={
            stats.online
          }
          label="Онлайн"
          icon="users"
          live
        />

        <SummaryStat
          value={
            stats.incoming +
            stats.outgoing
          }
          label="Запитів"
          icon="plus"
        />

        <SummaryStat
          value={
            stats.nearby
          }
          label="Поруч"
          icon="nearby"
        />
      </section>

      <section className="friends-v2-now-strip">
        <div className="friends-v2-now-strip__people">
          <span className="is-violet">
            М
          </span>

          <span className="is-pink">
            С
          </span>

          <span className="is-blue">
            О
          </span>

          <span className="is-more">
            +{
              Math.max(
                stats.online - 3,
                0
              )
            }
          </span>
        </div>

        <div className="friends-v2-now-strip__copy">
          <span>
            ТВОЄ КОЛО ЗАРАЗ
          </span>

          <strong>
            {
              stats.online
            } друзів онлайн
          </strong>

          <small>
            Люди, з якими можна бути на зв’язку просто зараз.
          </small>
        </div>

        <div className="friends-v2-now-strip__actions">
          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "requests"
              )
            }
          >
            <YatutIcon
              name="friends"
              size={16}
            />

            {
              stats.incoming
            } запитів
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "nearby"
              )
            }
          >
            <YatutIcon
              name="nearby"
              size={16}
            />

            {
              stats.nearby
            } поруч
          </button>

          <button
            type="button"
            className="is-primary"
            onClick={() =>
              onNavigate?.(
                "now"
              )
            }
          >
            Зараз

            <YatutIcon
              name="arrowRight"
              size={16}
            />
          </button>
        </div>
      </section>

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <section className="friends-v2-toolbar">
        <label className="friends-v2-search">
          <YatutIcon
            name="search"
            size={19}
          />

          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Пошук людей у ЯТУТ"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch(
                  ""
                )
              }
              aria-label="Очистити пошук"
            >
              <YatutIcon
                name="close"
                size={16}
              />
            </button>
          )}
        </label>

        <button
          className="friends-v2-find-button"
          type="button"
          onClick={() =>
            onNavigate?.(
              "search"
            )
          }
        >
          <YatutIcon
            name="search"
            size={18}
          />

          Знайти своїх
        </button>
      </section>

      {/* ===================================================
          TABS
      =================================================== */}

      <nav className="friends-v2-tabs">
        {TABS.map(
          (
            tab
          ) => {
            let count =
              null;

            if (
              tab.id ===
              "friends"
            ) {
              count =
                stats.friends;
            }

            if (
              tab.id ===
              "requests"
            ) {
              count =
                stats.incoming +
                stats.outgoing;
            }

            if (
              tab.id ===
              "suggestions"
            ) {
              count =
                stats.suggestions;
            }

            if (
              tab.id ===
              "nearby"
            ) {
              count =
                stats.nearby;
            }

            return (
              <button
                key={
                  tab.id
                }
                className={
                  activeTab ===
                  tab.id
                    ? "active"
                    : ""
                }
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
              >
                <span>
                  {
                    tab.label
                  }
                </span>

                {count !==
                  null && (
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
          MAIN LAYOUT
      =================================================== */}

      <div className="friends-v2-layout">
        {/* ===============================================
            PEOPLE
        =============================================== */}

        <main className="friends-v2-main">
          <header className="friends-v2-section-head">
            <div>
              <span>
                ЛЮДИ
              </span>

              <h2>
                {activeTab ===
                  "friends" &&
                  "Ваші друзі"}

                {activeTab ===
                  "requests" &&
                  "Запити до друзів"}

                {activeTab ===
                  "suggestions" &&
                  "Можливо, ви знайомі"}

                {activeTab ===
                  "nearby" &&
                  "Люди поруч"}

                {activeTab ===
                  "all" &&
                  "Ваше коло ЯТУТ"}
              </h2>
            </div>

            <b>
              {
                visiblePeople.length
              }
            </b>
          </header>

          {visiblePeople.length >
          0 ? (
            <div className="friends-v2-grid">
              {visiblePeople.map(
                (
                  person
                ) => (
                  <PersonCard
                    key={
                      person.id
                    }
                    person={
                      person
                    }
                    onOpenProfile={() =>
                      openProfile(
                        person
                      )
                    }
                    onOpenRelation={() =>
                      setRelationPerson(
                        person
                      )
                    }
                    onFriend={() =>
                      requestFriend(
                        person
                      )
                    }
                    onDecline={() =>
                      declineRequest(
                        person
                      )
                    }
                    onMessage={() =>
                      openChat(
                        person
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="friends-v2-empty">
              <div>
                <YatutIcon
                  name="friends"
                  size={28}
                />
              </div>

              <h3>
                Нічого не знайдено
              </h3>

              <p>
                Спробуйте змінити пошук
                або вибрати іншу вкладку.
              </p>
            </div>
          )}
        </main>

        {/* ===============================================
            SIDE
        =============================================== */}

        <aside className="friends-v2-side">
          {/* =============================================
              PULSE
          ============================================= */}

          <section className="friends-v2-side-card friends-v2-pulse-card">
            <header>
              <div>
                <span>
                  ПУЛЬС ЯТУТ
                </span>

                <h3>
                  Ваше коло зараз
                </h3>
              </div>

              <b className="friends-v2-live">
                LIVE
              </b>
            </header>

            <div>
              <PulseRow
                icon="users"
                title={`${stats.online} друзів онлайн`}
                text="Можна написати просто зараз"
              />

              <PulseRow
                icon="nearby"
                title={`${stats.nearby} людей поруч`}
                text="У вашому місті та районі"
              />

              <PulseRow
                icon="friends"
                title={`${stats.incoming} нових запитів`}
                text={
                  stats.incoming >
                  0
                    ? "Чекають на вашу відповідь"
                    : "Нових запитів немає"
                }
              />
            </div>
          </section>

          {/* =============================================
              CONNECTIONS
          ============================================= */}

          <section className="friends-v2-side-card friends-v2-intersections">
            <header>
              <div>
                <span>
                  ЧОМУ МИ ЗНАЙОМІ?
                </span>

                <h3>
                  Ваші перетини
                </h3>
              </div>
            </header>

            <Intersection
              people={[
                "М",
                "С",
                "В",
              ]}
              title="Спільні друзі"
              text="У вашому колі є люди, які вже знають одне одного."
            />

            <Intersection
              people={[
                "О",
                "Ю",
              ]}
              title="Робота та навчання"
              text="ЯТУТ знаходить реальні точки перетину."
            />

            <button
              className="friends-v2-side-action"
              type="button"
              onClick={() => {
                const person =
                  people.find(
                    (
                      item
                    ) =>
                      item.mutual >
                      0
                  );

                if (
                  person
                ) {
                  setRelationPerson(
                    person
                  );
                }
              }}
            >
              Переглянути зв’язки

              <YatutIcon
                name="arrowRight"
                size={16}
              />
            </button>
          </section>

          {/* =============================================
              NEARBY MAP
          ============================================= */}

          <section className="friends-v2-side-card friends-v2-nearby-card">
            <header>
              <div>
                <span>
                  ПОРУЧ
                </span>

                <h3>
                  Хто зараз недалеко?
                </h3>
              </div>

              <YatutIcon
                name="nearby"
                size={19}
              />
            </header>

            <div className="friends-v2-nearby-map">
              <span className="map-dot dot-a">
                М
              </span>

              <span className="map-dot dot-b">
                С
              </span>

              <span className="map-dot dot-c">
                А
              </span>

              <span className="map-me">
                Я
              </span>
            </div>

            <button
              className="friends-v2-side-action"
              type="button"
              onClick={() =>
                onNavigate?.(
                  "nearby"
                )
              }
            >
              Відкрити Поруч

              <YatutIcon
                name="arrowRight"
                size={16}
              />
            </button>
          </section>
        </aside>
      </div>

      {/* ===================================================
          PROFILE PREVIEW
      =================================================== */}

      {selectedPerson && (
        <PersonPreview
          person={{
            ...selectedPerson,

            friendStatus:
              getStatus(
                selectedPerson.id
              ),
          }}
          onClose={() =>
            setSelectedPerson(
              null
            )
          }
          onRelation={() => {
            setRelationPerson(
              selectedPerson
            );

            setSelectedPerson(
              null
            );
          }}
          onFriend={() =>
            requestFriend(
              selectedPerson
            )
          }
          onMessage={() =>
            openChat(
              selectedPerson
            )
          }
        />
      )}

      {/* ===================================================
          RELATION MODAL
      =================================================== */}

      {relationPerson && (
        <RelationModal
          person={
            relationPerson
          }
          onClose={() =>
            setRelationPerson(
              null
            )
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   PERSON CARD
========================================================= */

function PersonCard({
  person,
  onOpenProfile,
  onOpenRelation,
  onFriend,
  onDecline,
  onMessage,
}) {
  const friendButton =
    getFriendButton(
      person.friendStatus
    );

  return (
    <article className="friends-v2-person-card">
      {/* ===================================================
          COVER
      =================================================== */}

      <div className="friends-v2-person-cover">
        {person.friendStatus ===
          FRIEND_STATUSES.INCOMING && (
          <span className="friends-v2-request-chip incoming">
            <YatutIcon
              name="plus"
              size={13}
            />

            Запит до вас
          </span>
        )}

        {person.friendStatus ===
          FRIEND_STATUSES.OUTGOING && (
          <span className="friends-v2-request-chip outgoing">
            Запит надіслано
          </span>
        )}

        {person.nearby && (
          <span className="friends-v2-nearby-chip">
            <YatutIcon
              name="nearby"
              size={13}
            />

            {
              person.distance
            }
          </span>
        )}
      </div>

      {/* ===================================================
          AVATAR
      =================================================== */}

      <button
        className="friends-v2-person-avatar-wrap"
        type="button"
        onClick={
          onOpenProfile
        }
        aria-label={`Профіль ${person.name}`}
      >
        <span
          className={`friends-v2-person-pulse ${
            person.nearby
              ? "nearby"
              : person.online
                ? "online"
                : ""
          }`}
        >
          <span className="friends-v2-person-avatar">
            {
              person.initial
            }
          </span>
        </span>

        {person.online && (
          <span className="friends-v2-person-online" />
        )}
      </button>

      {/* ===================================================
          BODY
      =================================================== */}

      <div className="friends-v2-person-body">
        <button
          className="friends-v2-person-name"
          type="button"
          onClick={
            onOpenProfile
          }
        >
          <span>
            {
              person.name
            }
          </span>

          {person.verified && (
            <b title="ЯТУТ Перевірено">
              Я
            </b>
          )}
        </button>

        <span className="friends-v2-person-username">
          @
          {
            person.username
          }
        </span>

        <div className="friends-v2-person-city">
          <YatutIcon
            name="nearby"
            size={14}
          />

          <span>
            {
              person.city
            }
          </span>

          {person.online && (
            <>
              <i />

              <b>
                онлайн
              </b>
            </>
          )}
        </div>

        {/* =================================================
            WHY WE KNOW EACH OTHER
        ================================================= */}

        <button
          className="friends-v2-relation"
          type="button"
          onClick={
            onOpenRelation
          }
        >
          <div>
            <span>
              ЧОМУ МИ ЗНАЙОМІ?
            </span>

            <strong>
              {
                person.relation
              }
            </strong>
          </div>

          <div className="friends-v2-mutual-avatars">
            <span>
              М
            </span>

            <span>
              О
            </span>

            <span>
              С
            </span>
          </div>

          <YatutIcon
            name="chevronRight"
            size={15}
          />
        </button>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className={`friends-v2-person-actions ${
            person.friendStatus ===
            FRIEND_STATUSES.INCOMING
              ? "incoming"
              : ""
          }`}
        >
          <button
            className={`friend ${
              friendButton.active
                ? "active"
                : ""
            }`}
            type="button"
            onClick={
              onFriend
            }
          >
            <YatutIcon
              name={
                friendButton.icon
              }
              size={16}
            />

            {
              friendButton.label
            }
          </button>

          {person.friendStatus ===
            FRIEND_STATUSES.INCOMING && (
            <button
              className="decline"
              type="button"
              onClick={
                onDecline
              }
            >
              Відхилити
            </button>
          )}

          <button
            className="message"
            type="button"
            onClick={
              onMessage
            }
            aria-label={`Написати ${person.name}`}
          >
            <YatutIcon
              name="message"
              size={17}
            />

            Написати
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   FRIEND BUTTON STATE
========================================================= */

function getFriendButton(
  status
) {
  switch (
    status
  ) {
    case FRIEND_STATUSES.FRIEND:
      return {
        label:
          "Друзі",

        icon:
          "friends",

        active:
          true,
      };

    case FRIEND_STATUSES.INCOMING:
      return {
        label:
          "Прийняти",

        icon:
          "plus",

        active:
          false,
      };

    case FRIEND_STATUSES.OUTGOING:
      return {
        label:
          "Запит надіслано",

        icon:
          "friends",

        active:
          true,
      };

    default:
      return {
        label:
          "Додати",

        icon:
          "plus",

        active:
          false,
      };
  }
}

/* =========================================================
   SUMMARY STAT
========================================================= */

function SummaryStat({
  value,
  label,
  icon,
  live = false,
}) {
  return (
    <div className="friends-v2-summary-item">
      <div>
        <YatutIcon
          name={
            icon
          }
          size={19}
        />
      </div>

      <section>
        <strong>
          {
            value
          }
        </strong>

        <span>
          {
            label
          }
        </span>
      </section>

      {live && (
        <i className="friends-v2-summary-live" />
      )}
    </div>
  );
}

/* =========================================================
   PULSE ROW
========================================================= */

function PulseRow({
  icon,
  title,
  text,
}) {
  return (
    <div className="friends-v2-pulse-row">
      <div className="friends-v2-pulse-icon">
        <YatutIcon
          name={
            icon
          }
          size={17}
        />
      </div>

      <section>
        <strong>
          {
            title
          }
        </strong>

        <span>
          {
            text
          }
        </span>
      </section>
    </div>
  );
}

/* =========================================================
   INTERSECTION
========================================================= */

function Intersection({
  people,
  title,
  text,
}) {
  return (
    <div className="friends-v2-intersection">
      <div className="friends-v2-mutual-avatars">
        {people.map(
          (
            person,
            index
          ) => (
            <span
              key={`${person}-${index}`}
            >
              {
                person
              }
            </span>
          )
        )}
      </div>

      <section>
        <strong>
          {
            title
          }
        </strong>

        <span>
          {
            text
          }
        </span>
      </section>
    </div>
  );
}

/* =========================================================
   PERSON PREVIEW
========================================================= */

function PersonPreview({
  person,
  onClose,
  onRelation,
  onFriend,
  onMessage,
}) {
  const friendButton =
    getFriendButton(
      person.friendStatus
    );

  return (
    <div
      className="friends-v2-modal-backdrop"
      onClick={
        onClose
      }
    >
      <section
        className="friends-v2-preview"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="friends-v2-preview-cover">
          <button
            className="friends-v2-preview-close"
            type="button"
            onClick={
              onClose
            }
            aria-label="Закрити"
          >
            <YatutIcon
              name="close"
              size={19}
            />
          </button>
        </div>

        <div className="friends-v2-preview-content">
          <div className="friends-v2-preview-avatar">
            {
              person.initial
            }

            {person.online && (
              <i />
            )}
          </div>

          <div className="friends-v2-preview-name">
            <h2>
              {
                person.name
              }
            </h2>

            {person.verified && (
              <span title="ЯТУТ Перевірено">
                Я
              </span>
            )}
          </div>

          <p>
            @
            {
              person.username
            }
          </p>

          <div className="friends-v2-preview-meta">
            <span>
              <YatutIcon
                name="nearby"
                size={15}
              />

              {
                person.city
              }
            </span>

            <span>
              <YatutIcon
                name="friends"
                size={15}
              />

              {
                person.mutual
              }{" "}
              спільних друзів
            </span>
          </div>

          <button
            className="friends-v2-preview-relation"
            type="button"
            onClick={
              onRelation
            }
          >
            <div>
              <span>
                ЧОМУ МИ ЗНАЙОМІ?
              </span>

              <strong>
                {
                  person.relation
                }
              </strong>
            </div>

            <YatutIcon
              name="chevronRight"
              size={17}
            />
          </button>

          <div className="friends-v2-preview-actions">
            <button
              className={`primary ${
                friendButton.active
                  ? "active"
                  : ""
              }`}
              type="button"
              onClick={
                onFriend
              }
            >
              <YatutIcon
                name={
                  friendButton.icon
                }
                size={17}
              />

              {
                friendButton.label
              }
            </button>

            <button
              type="button"
              onClick={
                onMessage
              }
            >
              <YatutIcon
                name="message"
                size={17}
              />

              Написати
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   RELATION MODAL
========================================================= */

function RelationModal({
  person,
  onClose,
}) {
  return (
    <div
      className="friends-v2-modal-backdrop"
      onClick={
        onClose
      }
    >
      <section
        className="friends-v2-relation-modal"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header>
          <div>
            <span>
              ЯТУТ CONNECTIONS
            </span>

            <h2>
              Чому ми знайомі?
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Закрити"
          >
            <YatutIcon
              name="close"
              size={19}
            />
          </button>
        </header>

        {/* =================================================
            CONNECTION MAP
        ================================================= */}

        <div className="friends-v2-connection-map">
          <span className="friends-v2-map-path" />

          <div className="friends-v2-map-person me">
            <span>
              В
            </span>

            <strong>
              Ви
            </strong>
          </div>

          <div className="friends-v2-map-person middle">
            <span>
              М
            </span>

            <strong>
              Спільні люди
            </strong>
          </div>

          <div className="friends-v2-map-person other">
            <span>
              {
                person.initial
              }
            </span>

            <strong>
              {
                person.name
              }
            </strong>
          </div>
        </div>

        {/* =================================================
            REASONS
        ================================================= */}

        <div className="friends-v2-relation-title">
          <span>
            ЯТУТ знайшов
          </span>

          <h3>
            Ваші реальні точки
            перетину
          </h3>
        </div>

        <div className="friends-v2-relation-list">
          {person.common.map(
            (
              connection,
              index
            ) => (
              <article
                key={`${person.id}-${index}`}
              >
                <div>
                  <YatutIcon
                    name={
                      index ===
                      0
                        ? "friends"
                        : index ===
                            1
                          ? "nearby"
                          : index ===
                              2
                            ? "community"
                            : "events"
                    }
                    size={17}
                  />
                </div>

                <section>
                  <strong>
                    {
                      connection
                    }
                  </strong>

                  <span>
                    Знайдено через
                    ваші зв’язки у
                    ЯТУТ
                  </span>
                </section>
              </article>
            )
          )}
        </div>

        {/* =================================================
            PRIVACY
        ================================================= */}

        <div className="friends-v2-privacy-note">
          <YatutIcon
            name="shield"
            size={18}
          />

          <p>
            ЯТУТ показує лише
            дозволені точки
            перетину. Точне
            місцезнаходження та
            приватні дані інших
            людей не
            розкриваються.
          </p>
        </div>
      </section>
    </div>
  );
}