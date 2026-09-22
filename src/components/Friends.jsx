import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./FriendsV2.css";

import YatutIcon from "./YatutIcon";
import UserProfile from "./UserProfile";

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

import {
  acceptBackendFriendRequest,
  cancelBackendFriendRequest,
  declineBackendFriendRequest,
  getBackendFollowGraph,
  getBackendRelationships,
  removeBackendFriend,
  searchBackendProfiles,
  sendBackendFriendRequest,
} from "../services/socialBackendService";

import {
  subscribeSocialGraphRealtime,
} from "../services/realtimeService";

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
      "online",

    label:
      "Онлайн",
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
      "followers",

    label:
      "Підписники",
  },

  {
    id:
      "following",

    label:
      "Підписки",
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
  authSession = null,
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

  const [
    actionNotice,
    setActionNotice,
  ] =
    useState(null);

  const [
    removeCandidate,
    setRemoveCandidate,
  ] =
    useState(null);

  const [
    backendPeople,
    setBackendPeople,
  ] =
    useState([]);

  const [
    backendRelationships,
    setBackendRelationships,
  ] =
    useState({});

  const [
    backendFollowGraph,
    setBackendFollowGraph,
  ] =
    useState({
      followers: [],
      following: [],
    });

  const [
    backendLoading,
    setBackendLoading,
  ] =
    useState(
      Boolean(
        authSession?.user?.id
      )
    );

  async function refreshBackendPeople() {
    if (
      !authSession?.user?.id
    ) {
      return;
    }

    const [
      peopleResult,
      relationshipsResult,
      followGraphResult,
    ] =
      await Promise.all([
        searchBackendProfiles(
          authSession,
          ""
        ),
        getBackendRelationships(
          authSession
        ),
        getBackendFollowGraph(
          authSession
        ),
      ]);

    setBackendPeople(
      peopleResult
    );

    setBackendRelationships(
      relationshipsResult
    );

    setBackendFollowGraph(
      followGraphResult
    );
  }

  /* =======================================================
     FRIEND STATE LIVE SYNC

     Если дружба меняется:
     - из Notifications
     - из другой карточки
     - из другой вкладки браузера

     Friends обновляется автоматически.
  ======================================================= */

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      return undefined;
    }

    let active =
      true;

    let refreshTimer =
      null;

    const refresh =
      async () => {
        try {
          await refreshBackendPeople();
        } catch (
          error
        ) {
          console.warn(
            "FRIENDS BACKEND REFRESH ERROR:",
            error
          );
        } finally {
          if (
            active
          ) {
            setBackendLoading(
              false
            );
          }
        }
      };

    setBackendLoading(
      true
    );

    refresh();

    const channel =
      subscribeSocialGraphRealtime({
        session:
          authSession,
        onChange:
          () => {
            if (
              refreshTimer
            ) {
              window.clearTimeout(
                refreshTimer
              );
            }

            refreshTimer =
              window.setTimeout(
                refresh,
                90
              );
          },
        onStatus:
          (
            status
          ) => {
            if (
              status ===
              "error"
            ) {
              console.warn(
                "FRIENDS REALTIME DEGRADED"
              );
            }
          },
      });

    const fallbackTimer =
      window.setInterval(
        refresh,
        60000
      );

    return () => {
      active =
        false;

      if (
        refreshTimer
      ) {
        window.clearTimeout(
          refreshTimer
        );
      }

      window.clearInterval(
        fallbackTimer
      );

      channel.close();
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

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

  useEffect(() => {
    if (
      !actionNotice
    ) {
      return undefined;
    }

    const timer =
      window.setTimeout(
        () => {
          setActionNotice(
            null
          );
        },
        2200
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    actionNotice,
  ]);

  function showNotice(
    text,
    tone = "success"
  ) {
    setActionNotice({
      id:
        Date.now(),

      text,

      tone,
    });
  }

  /* =======================================================
     STATUS
  ======================================================= */

  function getStatus(
    personId
  ) {
    if (
      authSession?.user?.id
    ) {
      const status =
        backendRelationships[
          personId
        ]?.friendStatus;

      if (
        status ===
        "friends"
      ) {
        return FRIEND_STATUSES.FRIEND;
      }

      if (
        status ===
        "incoming"
      ) {
        return FRIEND_STATUSES.INCOMING;
      }

      if (
        status ===
        "outgoing"
      ) {
        return FRIEND_STATUSES.OUTGOING;
      }

      return FRIEND_STATUSES.NONE;
    }

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
      () => {
        const source =
          authSession?.user?.id
            ? backendPeople
            : PEOPLE;

        return source.map(
          (
            person
          ) => {
            const status =
              getStatus(
                person.id
              );

            return {
              ...person,
              initial:
                person.initial ||
                person.initials ||
                person.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                "Я",
              relation:
                person.relation ||
                person.reason ||
                "Користувач ЯТУТ",
              common:
                Array.isArray(
                  person.common
                )
                  ? person.common
                  : [],
              friendStatus:
                status,
              friends:
                status ===
                FRIEND_STATUSES.FRIEND,
              follower:
                backendFollowGraph
                  .followers
                  .includes(
                    person.id
                  ),
              following:
                backendFollowGraph
                  .following
                  .includes(
                    person.id
                  ),
            };
          }
        );
      },
      [
        friendState,
        backendPeople,
        backendRelationships,
        backendFollowGraph,
        authSession?.user?.id,
      ]
    );

  useEffect(() => {
    function openFromPayload(
      payload
    ) {
      if (
        payload?.tab &&
        TABS.some(
          (
            tab
          ) =>
            tab.id ===
            payload.tab
        )
      ) {
        setActiveTab(
          payload.tab
        );
      }

      const personId =
        payload?.personId;

      if (!personId) {
        try {
          sessionStorage.removeItem(
            "yatut-open-route-payload"
          );
        } catch {
          // No-op.
        }

        return;
      }

      const person =
        people.find(
          (item) =>
            item.id ===
            personId
        ) || {
          id:
            personId,
          backend:
            Boolean(
              authSession?.user?.id
            ),
          name:
            "Користувач ЯТУТ",
          username:
            "user",
          initial:
            "Я",
          initials:
            "Я",
          interests:
            [],
          common:
            [],
          friendsCount:
            0,
          followersCount:
            0,
          mutual:
            0,
        };

      setActiveTab(
        person.friendStatus ===
          FRIEND_STATUSES.FRIEND
          ? "friends"
          : "all"
      );

      setSelectedPerson(
        person
      );

      try {
        sessionStorage.removeItem(
          "yatut-open-route-payload"
        );
      } catch {
        // No-op.
      }
    }

    try {
      const raw =
        sessionStorage.getItem(
          "yatut-open-route-payload"
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        if (
          parsed?.route ===
          "friends"
        ) {
          openFromPayload(
            parsed.payload ||
            {}
          );
        }
      }
    } catch (error) {
      console.warn(
        "FRIENDS ROUTE PAYLOAD ERROR:",
        error
      );
    }

    function handleRoute(
      event
    ) {
      if (
        event?.detail?.route !==
        "friends"
      ) {
        return;
      }

      openFromPayload(
        event.detail.payload ||
        {}
      );
    }

    window.addEventListener(
      "yatut:route-payload",
      handleRoute
    );

    return () => {
      window.removeEventListener(
        "yatut:route-payload",
        handleRoute
      );
    };
  }, [
    people,
  ]);

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
                "online" &&
              !(
                person.online &&
                person.friendStatus ===
                  FRIEND_STATUSES.FRIEND
              )
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
                "followers" &&
              !person.follower
            ) {
              return false;
            }

            if (
              activeTab ===
                "following" &&
              !person.following
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

        followers:
          authSession?.user?.id
            ? backendFollowGraph
                .followers
                .length
            : 0,

        following:
          authSession?.user?.id
            ? backendFollowGraph
                .following
                .length
            : 0,

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
          authSession?.user?.id
            ? Object.values(
                backendRelationships
              ).filter(
                (
                  relation
                ) =>
                  relation
                    ?.friendStatus ===
                  "incoming"
              ).length
            : friendState
                .incomingRequests
                .length,

        outgoing:
          authSession?.user?.id
            ? Object.values(
                backendRelationships
              ).filter(
                (
                  relation
                ) =>
                  relation
                    ?.friendStatus ===
                  "outgoing"
              ).length
            : friendState
                .outgoingRequests
                .length,
      }),
      [
        people,
        friendState,
        backendRelationships,
        backendFollowGraph,
        authSession?.user?.id,
      ]
    );

  function selectPeopleTab(
    tab
  ) {
    setActiveTab(
      tab
    );

    window.requestAnimationFrame(
      () => {
        document
          .querySelector(
            ".friends-v2-tabs"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });
      }
    );
  }

  function handleRelationTarget(
    target
  ) {
    setRelationPerson(
      null
    );

    if (
      [
        "friends",
        "online",
        "requests",
        "nearby",
      ].includes(
        target
      )
    ) {
      selectPeopleTab(
        target
      );

      return;
    }

    onNavigate?.(
      target
    );
  }

  /* =======================================================
     SEND REQUEST
  ======================================================= */

  async function requestFriend(
    person
  ) {
    if (
      !person?.id
    ) {
      return;
    }

    const status =
      getStatus(
        person.id
      );

    if (
      person.backend &&
      authSession?.user?.id
    ) {
      try {
        if (
          status ===
          FRIEND_STATUSES.FRIEND
        ) {
          setRemoveCandidate(
            person
          );

          return;
        }

        if (
          status ===
          FRIEND_STATUSES.INCOMING
        ) {
          await acceptBackendFriendRequest(
            authSession,
            person.id
          );

          showNotice(
            `${person.name} тепер у друзях`
          );
        } else if (
          status ===
          FRIEND_STATUSES.OUTGOING
        ) {
          await cancelBackendFriendRequest(
            authSession,
            person.id
          );

          showNotice(
            "Запит скасовано",
            "neutral"
          );
        } else {
          await sendBackendFriendRequest(
            authSession,
            person.id
          );

          showNotice(
            `Запит для ${person.name} надіслано`
          );
        }

        await refreshBackendPeople();
      } catch (
        error
      ) {
        console.warn(
          "FRIENDS BACKEND ACTION ERROR:",
          error
        );

        showNotice(
          error?.message ||
          "Не вдалося виконати дію",
          "neutral"
        );
      }

      return;
    }

    if (
      status ===
      FRIEND_STATUSES.FRIEND
    ) {
      setRemoveCandidate(
        person
      );

      return;
    }

    if (
      status ===
      FRIEND_STATUSES.INCOMING
    ) {
      acceptIncomingFriendRequest(
        person.id
      );

      showNotice(
        `${person.name} тепер у друзях`
      );

      return;
    }

    if (
      status ===
      FRIEND_STATUSES.OUTGOING
    ) {
      cancelFriendRequest(
        person.id
      );

      showNotice(
        "Запит скасовано",
        "neutral"
      );

      return;
    }

    sendFriendRequest(
      person.id
    );

    showNotice(
      `Запит для ${person.name} надіслано`
    );
  }

  async function declineRequest(
    person
  ) {
    if (
      !person?.id
    ) {
      return;
    }

    if (
      getStatus(
        person.id
      ) !==
      FRIEND_STATUSES.INCOMING
    ) {
      return;
    }

    if (
      person.backend &&
      authSession?.user?.id
    ) {
      try {
        await declineBackendFriendRequest(
          authSession,
          person.id
        );

        await refreshBackendPeople();

        showNotice(
          "Запит відхилено",
          "neutral"
        );
      } catch (
        error
      ) {
        showNotice(
          error?.message ||
          "Не вдалося відхилити запит",
          "neutral"
        );
      }

      return;
    }

    declineIncomingFriendRequest(
      person.id
    );

    showNotice(
      "Запит відхилено",
      "neutral"
    );
  }

  async function confirmRemoveFriend() {
    if (
      !removeCandidate?.id
    ) {
      return;
    }

    const candidate =
      removeCandidate;

    const name =
      candidate.name;

    if (
      candidate.backend &&
      authSession?.user?.id
    ) {
      try {
        await removeBackendFriend(
          authSession,
          candidate.id
        );

        await refreshBackendPeople();
      } catch (
        error
      ) {
        showNotice(
          error?.message ||
          "Не вдалося видалити з друзів",
          "neutral"
        );

        return;
      }
    } else {
      removeFriend(
        candidate.id
      );
    }

    setRemoveCandidate(
      null
    );

    showNotice(
      `${name} видалено з друзів`,
      "neutral"
    );
  }

  /* =======================================================
     OPEN PROFILE PREVIEW
  ======================================================= */

  function openProfile(
    person
  ) {
    if (
      !person?.id
    ) {
      return;
    }

    setSelectedPerson(
      person
    );

    onNavigate?.(
      "friends",
      {
        personId:
          person.id,
      }
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

    setSelectedPerson(
      null
    );

    setRelationPerson(
      null
    );

    setRemoveCandidate(
      null
    );

    onOpenChat?.(
      person.id
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  if (
    selectedPerson
  ) {
    const selectedStatus =
      getStatus(
        selectedPerson.id
      );

    const selectedRelation = {
      ...(backendRelationships[
        selectedPerson.id
      ] || {}),
      friendStatus:
        selectedStatus,
      following:
        backendFollowGraph
          .following
          .includes(
            selectedPerson.id
          ),
      follower:
        backendFollowGraph
          .followers
          .includes(
            selectedPerson.id
          ),
    };

    return (
      <div className="friends-v2-page friends-v2-profile-page">
        <UserProfile
          person={{
            ...selectedPerson,
            friendStatus:
              selectedStatus,
          }}
          relation={
            selectedRelation
          }
          authSession={
            authSession
          }
          onBack={() => {
            setSelectedPerson(
              null
            );

            onNavigate?.(
              "friends"
            );
          }}
          onFriendAction={async (
            personId,
            action
          ) => {
            const person =
              people.find(
                (
                  item
                ) =>
                  item.id ===
                  personId
              ) ||
              selectedPerson;

            if (
              action ===
              "reject"
            ) {
              await declineRequest(
                person
              );
              return;
            }

            if (
              action ===
              "remove"
            ) {
              setRemoveCandidate(
                person
              );
              return;
            }

            await requestFriend(
              person
            );
          }}
          onFollow={() => {}}
          onBlock={(
            personId,
            blocked
          ) => {
            showNotice(
              blocked
                ? "Користувача заблоковано"
                : "Користувача розблоковано",
              "neutral"
            );
          }}
          onReport={() => {
            showNotice(
              "Скаргу надіслано"
            );
          }}
          onOpenChat={(
            personId
          ) =>
            onOpenChat?.(
              personId
            )
          }
        />
      </div>
    );
  }

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
          label="Друзі"
          icon="friends"
          active={
            activeTab ===
            "friends"
          }
          onClick={() =>
            selectPeopleTab(
              "friends"
            )
          }
        />

        <SummaryStat
          value={
            stats.online
          }
          label="Онлайн"
          icon="users"
          live
          active={
            activeTab ===
            "online"
          }
          onClick={() =>
            selectPeopleTab(
              "online"
            )
          }
        />

        <SummaryStat
          value={
            stats.incoming +
            stats.outgoing
          }
          label="Запити"
          icon="plus"
          active={
            activeTab ===
            "requests"
          }
          onClick={() =>
            selectPeopleTab(
              "requests"
            )
          }
        />

        <SummaryStat
          value={
            stats.nearby
          }
          label="Поруч"
          icon="nearby"
          active={
            activeTab ===
            "nearby"
          }
          onClick={() =>
            selectPeopleTab(
              "nearby"
            )
          }
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
              selectPeopleTab(
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
              selectPeopleTab(
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
              "online"
            ) {
              count =
                stats.online;
            }

            if (
              tab.id ===
              "followers"
            ) {
              count =
                stats.followers;
            }

            if (
              tab.id ===
              "following"
            ) {
              count =
                stats.following;
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
                  selectPeopleTab(
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
                  "online" &&
                  "Друзі онлайн"}

                {activeTab ===
                  "requests" &&
                  "Запити до друзів"}

                {activeTab ===
                  "suggestions" &&
                  "Можливо, ви знайомі"}

                {activeTab ===
                  "followers" &&
                  "Ваші підписники"}

                {activeTab ===
                  "following" &&
                  "Ваші підписки"}

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

          {backendLoading &&
            authSession?.user?.id && (
            <div className="friends-v2-empty">
              <p>
                Оновлюємо ваше коло ЯТУТ…
              </p>
            </div>
          )}

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
                {
                  authSession?.user?.id &&
                  !search.trim() &&
                  activeTab === "all"
                    ? "Знайдіть перших людей"
                    : "Нічого не знайдено"
                }
              </h3>

              <p>
                {
                  authSession?.user?.id &&
                  !search.trim() &&
                  activeTab === "all"
                    ? "Пошукайте друзів за імʼям або username і почніть збирати своє коло ЯТУТ."
                    : "Спробуйте змінити пошук або вибрати іншу вкладку."
                }
              </p>

              {authSession?.user?.id &&
                !search.trim() &&
                activeTab === "all" && (
                <button
                  type="button"
                  className="friends-v2-empty-action"
                  onClick={() =>
                    onNavigate?.(
                      "search"
                    )
                  }
                >
                  <YatutIcon
                    name="search"
                    size={16}
                  />
                  Знайти людей
                </button>
              )}
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
                onClick={() =>
                  selectPeopleTab(
                    "online"
                  )
                }
              />

              <PulseRow
                icon="nearby"
                title={`${stats.nearby} людей поруч`}
                text="У вашому місті та районі"
                onClick={() =>
                  selectPeopleTab(
                    "nearby"
                  )
                }
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
                onClick={() =>
                  selectPeopleTab(
                    "requests"
                  )
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
              onClick={() =>
                selectPeopleTab(
                  "friends"
                )
              }
            />

            <Intersection
              people={[
                "О",
                "Ю",
              ]}
              title="Робота та навчання"
              text="ЯТУТ знаходить реальні точки перетину."
              onClick={() =>
                onNavigate?.(
                  "search"
                )
              }
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
              <button
                className="map-dot dot-a"
                type="button"
                onClick={() =>
                  openProfile(
                    people.find(
                      (
                        item
                      ) =>
                        item.id ===
                        "maria"
                    )
                  )
                }
                aria-label="Марія Коваль"
              >
                М
              </button>

              <button
                className="map-dot dot-b"
                type="button"
                onClick={() =>
                  openProfile(
                    people.find(
                      (
                        item
                      ) =>
                        item.id ===
                        "sofia"
                    )
                  )
                }
                aria-label="Софія Романенко"
              >
                С
              </button>

              <button
                className="map-dot dot-c"
                type="button"
                onClick={() =>
                  openProfile(
                    people.find(
                      (
                        item
                      ) =>
                        item.id ===
                        "anastasia"
                    )
                  )
                }
                aria-label="Анастасія Мельник"
              >
                А
              </button>

              <button
                className="map-me"
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "profile"
                  )
                }
                aria-label="Мій профіль"
              >
                Я
              </button>
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

      {actionNotice && (
        <div
          key={
            actionNotice.id
          }
          className={`friends-v2-toast ${actionNotice.tone}`}
          role="status"
          aria-live="polite"
        >
          <span className="friends-v2-toast-icon">
            <YatutIcon
              name={
                actionNotice.tone ===
                "success"
                  ? "friends"
                  : "close"
              }
              size={16}
            />
          </span>

          <strong>
            {
              actionNotice.text
            }
          </strong>
        </div>
      )}

      {removeCandidate && (
        <FriendRemoveModal
          person={
            removeCandidate
          }
          onClose={() =>
            setRemoveCandidate(
              null
            )
          }
          onConfirm={
            confirmRemoveFriend
          }
        />
      )}

      {/* ===================================================
          RELATION MODAL
      =================================================== */}

      {relationPerson && (
        <RelationModal
          person={{
            ...relationPerson,

            friendStatus:
              getStatus(
                relationPerson.id
              ),
          }}
          onClose={() =>
            setRelationPerson(
              null
            )
          }
          onOpenSelf={() => {
            setRelationPerson(
              null
            );

            onNavigate?.(
              "profile"
            );
          }}
          onOpenMutual={() =>
            handleRelationTarget(
              "friends"
            )
          }
          onOpenPerson={() => {
            setSelectedPerson(
              relationPerson
            );

            setRelationPerson(
              null
            );
          }}
          onReason={
            handleRelationTarget
          }
          onMessage={() =>
            openChat(
              relationPerson
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
            {person.avatar ? (
              <img
                src={
                  person.avatar
                }
                alt={
                  person.name
                }
              />
            ) : (
              person.initial
            )}
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
          className={`friends-v2-person-actions status-${person.friendStatus} ${
            person.friendStatus ===
            FRIEND_STATUSES.INCOMING
              ? "incoming"
              : ""
          }`.trim()}
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
              <YatutIcon
                name="close"
                size={15}
              />

              <span>
                Відхилити
              </span>
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

            <span>
              Написати
            </span>
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
          "У друзях",

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
          "Скасувати запит",

        icon:
          "close",

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
  active = false,
  onClick,
}) {
  return (
    <button
      className={`friends-v2-summary-item ${
        active
          ? "active"
          : ""
      }`.trim()}
      type="button"
      onClick={
        onClick
      }
      aria-pressed={
        active
      }
    >
      <div>
        <YatutIcon
          name={
            icon
          }
          size={18}
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
    </button>
  );
}

/* =========================================================
   PULSE ROW
========================================================= */

function PulseRow({
  icon,
  title,
  text,
  onClick,
}) {
  return (
    <button
      className="friends-v2-pulse-row"
      type="button"
      onClick={
        onClick
      }
    >
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

      <YatutIcon
        name="chevronRight"
        size={16}
      />
    </button>
  );
}

/* =========================================================
   INTERSECTION
========================================================= */

function Intersection({
  people,
  title,
  text,
  onClick,
}) {
  return (
    <button
      className="friends-v2-intersection"
      type="button"
      onClick={
        onClick
      }
    >
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

      <YatutIcon
        name="chevronRight"
        size={16}
      />
    </button>
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
  onDecline,
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
            {person.avatar ? (
              <img
                src={
                  person.avatar
                }
                alt={
                  person.name
                }
              />
            ) : (
              person.initial
            )}

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

          <div
            className={`friends-v2-preview-actions status-${person.friendStatus}`}
          >
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

              <span>
                {
                  friendButton.label
                }
              </span>
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
                <YatutIcon
                  name="close"
                  size={16}
                />

                <span>
                  Відхилити
                </span>
              </button>
            )}

            <button
              className="message"
              type="button"
              onClick={
                onMessage
              }
            >
              <YatutIcon
                name="message"
                size={17}
              />

              <span>
                Написати
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   REMOVE FRIEND MODAL
========================================================= */

function FriendRemoveModal({
  person,
  onClose,
  onConfirm,
}) {
  return (
    <div
      className="friends-v2-action-backdrop"
      onClick={
        onClose
      }
    >
      <section
        className="friends-v2-action-sheet"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="friends-v2-action-sheet-icon">
          <YatutIcon
            name="friends"
            size={22}
          />
        </div>

        <h3>
          Керування дружбою
        </h3>

        <p>
          Видалити <strong>{person.name}</strong> з друзів?
          Ви зможете додати цю людину знову пізніше.
        </p>

        <div>
          <button
            type="button"
            className="secondary"
            onClick={
              onClose
            }
          >
            Залишити
          </button>

          <button
            type="button"
            className="danger"
            onClick={
              onConfirm
            }
          >
            <YatutIcon
              name="trash"
              size={16}
            />

            Видалити
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   RELATION MODAL
========================================================= */

function getRelationAction(
  connection
) {
  const value =
    String(
      connection ||
        ""
    ).toLowerCase();

  if (
    value.includes(
      "друз"
    )
  ) {
    return {
      target:
        "friends",

      label:
        "Друзі",

      icon:
        "friends",
    };
  }

  if (
    value.includes(
      "спільнот"
    )
  ) {
    return {
      target:
        "communities",

      label:
        "Спільноти",

      icon:
        "community",
    };
  }

  if (
    value.includes(
      "поді"
    )
  ) {
    return {
      target:
        "events",

      label:
        "Події",

      icon:
        "events",
    };
  }

  if (
    value.includes(
      "києв"
    ) ||
    value.includes(
      "міст"
    ) ||
    value.includes(
      "район"
    )
  ) {
    return {
      target:
        "nearby",

      label:
        "Поруч",

      icon:
        "nearby",
    };
  }

  return {
    target:
      "search",

    label:
      "Знайти",

    icon:
      "search",
  };
}

function RelationModal({
  person,
  onClose,
  onOpenSelf,
  onOpenMutual,
  onOpenPerson,
  onReason,
  onMessage,
}) {
  return (
    <div
      className="friends-v2-modal-backdrop"
      onClick={
        onClose
      }
    >
      <section
        className="friends-v2-relation-modal friends-v2-relation-modal-v2"
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

        <div className="friends-v2-connection-map">
          <span className="friends-v2-map-path" />

          <button
            className="friends-v2-map-person me"
            type="button"
            onClick={
              onOpenSelf
            }
          >
            <span>
              В
            </span>

            <strong>
              Ви
            </strong>

            <small>
              Профіль
            </small>
          </button>

          <button
            className="friends-v2-map-person middle"
            type="button"
            onClick={
              onOpenMutual
            }
          >
            <span>
              М
            </span>

            <strong>
              Спільні люди
            </strong>

            <small>
              Відкрити
            </small>
          </button>

          <button
            className="friends-v2-map-person other"
            type="button"
            onClick={
              onOpenPerson
            }
          >
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

            <small>
              Профіль
            </small>
          </button>
        </div>

        <div className="friends-v2-relation-title">
          <span>
            ЯТУТ знайшов
          </span>

          <h3>
            Ваші реальні точки
            перетину
          </h3>
        </div>

        <div className="friends-v2-relation-list friends-v2-relation-list-v2">
          {person.common.map(
            (
              connection,
              index
            ) => {
              const action =
                getRelationAction(
                  connection
                );

              return (
                <button
                  className="friends-v2-relation-point"
                  type="button"
                  key={`${person.id}-${index}`}
                  onClick={() =>
                    onReason?.(
                      action.target
                    )
                  }
                >
                  <span className="friends-v2-relation-point-icon">
                    <YatutIcon
                      name={
                        action.icon
                      }
                      size={18}
                    />
                  </span>

                  <span className="friends-v2-relation-point-copy">
                    <strong>
                      {
                        connection
                      }
                    </strong>

                    <small>
                      Знайдено через
                      ваші зв’язки у
                      ЯТУТ
                    </small>
                  </span>

                  <span className="friends-v2-relation-point-action">
                    {
                      action.label
                    }
                  </span>

                  <YatutIcon
                    name="chevronRight"
                    size={16}
                  />
                </button>
              );
            }
          )}
        </div>

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

        <footer className="friends-v2-relation-footer">
          <button
            className="profile"
            type="button"
            onClick={
              onOpenPerson
            }
          >
            <YatutIcon
              name="friends"
              size={17}
            />

            Профіль
          </button>

          <button
            className="message"
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
        </footer>
      </section>
    </div>
  );
}
