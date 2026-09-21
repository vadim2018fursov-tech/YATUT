import {
  useEffect,
  useMemo,
  useState,
} from "react";

import UserProfile from "./UserProfile";

import {
  getSocialState,
  saveSocialState,
} from "../storage/database";

import {
  FRIEND_STATUSES,
  acceptIncomingFriendRequest,
  cancelFriendRequest,
  declineIncomingFriendRequest,
  getFriendStatus,
  removeFriend,
  sendFriendRequest,
  subscribeFriends,
} from "../storage/friendService";

import {
  acceptBackendFriendRequest,
  cancelBackendFriendRequest,
  declineBackendFriendRequest,
  getBackendRelationships,
  removeBackendFriend,
  reportBackendUser,
  searchBackendProfiles,
  sendBackendFriendRequest,
  setBackendBlocked,
} from "../services/socialBackendService";

import {
  subscribeSocialGraphRealtime,
} from "../services/realtimeService";

/* =========================================================
   PEOPLE
========================================================= */

const PEOPLE = [
  {
    id: "maria",
    type: "person",
    name: "Марія Коваль",
    username: "maria.koval",
    initials: "М",
    city: "Київ",
    hometown: "Чернігів",

    bio:
      "Люблю подорожі, фотографію та хорошу каву.",

    school:
      "Ліцей №12",

    university:
      "КНУ ім. Тараса Шевченка",

    work:
      "UI/UX Designer",

    interests: [
      "Дизайн",
      "Подорожі",
      "Фото",
      "Кава",
    ],

    mutual: 7,

    reason:
      "7 спільних друзів • Київ",

    online: true,
    hasStory: true,
    storyViewed: false,
    verified: false,

    friendsCount: 438,
    followersCount: 912,
  },

  {
    id: "oleksandr",
    type: "person",
    name: "Олександр Бондар",
    username: "bondar",
    initials: "О",
    city: "Київ",
    hometown: "Полтава",

    bio:
      "Розробка, спорт, міські події.",

    school:
      "Школа №44",

    university:
      "КПІ ім. Ігоря Сікорського",

    work:
      "Software Engineer",

    interests: [
      "IT",
      "Спорт",
      "Стартапи",
      "Ігри",
    ],

    mutual: 12,

    reason:
      "12 спільних друзів • КПІ",

    online: true,
    hasStory: true,
    storyViewed: false,
    verified: false,

    friendsCount: 681,
    followersCount: 1204,
  },

  {
    id: "anastasia",
    type: "person",
    name: "Анастасія Мельник",
    username: "nastia",
    initials: "А",
    city: "Львів",
    hometown: "Львів",

    bio:
      "Маркетинг, музика та творчі проєкти.",

    school:
      "Ліцей №8",

    university:
      "ЛНУ ім. Івана Франка",

    work:
      "Marketing Manager",

    interests: [
      "Маркетинг",
      "Музика",
      "Події",
      "Мистецтво",
    ],

    mutual: 4,

    reason:
      "4 спільних друзів • Музика",

    online: false,
    hasStory: true,
    storyViewed: false,

    friendsCount: 355,
    followersCount: 780,
  },

  {
    id: "sofia",
    type: "person",
    name: "Софія Романенко",
    username: "sofia.r",
    initials: "С",
    city: "Київ",
    hometown: "Одеса",

    bio:
      "Фотографія, культура та нові знайомства.",

    university:
      "КНУКіМ",

    school: "",

    work:
      "Photographer",

    interests: [
      "Фото",
      "Культура",
      "Подорожі",
    ],

    mutual: 9,

    reason:
      "9 спільних друзів • Фото",

    online: true,
    hasStory: true,
    storyViewed: false,

    friendsCount: 520,
    followersCount: 1800,
  },

  {
    id: "yulia",
    type: "person",
    name: "Юлія Савченко",
    username: "yulia.s",
    initials: "Ю",
    city: "Київ",
    hometown: "Київ",

    bio:
      "Творчість, мода та міське життя.",

    school:
      "Гімназія №32",

    university: "",

    work:
      "Content Creator",

    interests: [
      "Мода",
      "Творчість",
      "Відео",
    ],

    mutual: 5,

    reason:
      "5 спільних друзів • Київ",

    online: true,
    hasStory: false,
    storyViewed: true,
    verified: true,

    friendsCount: 804,
    followersCount: 12400,
  },
];

/* =========================================================
   OTHER SEARCH DATA
========================================================= */

const SCHOOLS = [
  {
    id: "school-12",
    type: "school",
    name: "Ліцей №12",
    city: "Київ",
    people: 184,
    mutual: 6,
    description:
      "Навчались або навчаються в цьому закладі.",
  },

  {
    id: "school-44",
    type: "school",
    name: "Школа №44",
    city: "Київ",
    people: 326,
    mutual: 3,
    description:
      "Можливо, тут навчались ваші знайомі.",
  },

  {
    id: "school-8",
    type: "school",
    name: "Ліцей №8",
    city: "Львів",
    people: 211,
    mutual: 2,
    description:
      "Учні, випускники та вчителі.",
  },
];

const UNIVERSITIES = [
  {
    id: "university-knu",
    type: "university",
    name: "КНУ ім. Тараса Шевченка",
    city: "Київ",
    people: 8421,
    mutual: 24,
    description:
      "Студенти, випускники та викладачі.",
  },

  {
    id: "university-kpi",
    type: "university",
    name: "КПІ ім. Ігоря Сікорського",
    city: "Київ",
    people: 12950,
    mutual: 31,
    description:
      "Знайдіть одногрупників та випускників.",
  },

  {
    id: "university-lnu",
    type: "university",
    name: "ЛНУ ім. Івана Франка",
    city: "Львів",
    people: 7210,
    mutual: 12,
    description:
      "Студенти та випускники університету.",
  },
];

const WORKS = [
  {
    id: "work-comfy",
    type: "work",
    name: "COMFY",
    city: "Україна",
    people: 1320,
    mutual: 14,
    description:
      "Колишні та поточні співробітники.",
  },

  {
    id: "work-it",
    type: "work",
    name: "IT Ukraine",
    city: "Україна",
    people: 4820,
    mutual: 19,
    description:
      "Люди, які працюють у сфері IT.",
  },

  {
    id: "work-design",
    type: "work",
    name: "Design Community",
    city: "Київ",
    people: 930,
    mutual: 8,
    description:
      "Дизайнери, креатори та продуктові команди.",
  },
];

const CITIES = [
  {
    id: "city-kyiv",
    type: "city",
    name: "Київ",
    subtitle:
      "Ваше поточне місто",
    people: "128 тис.",
    events: 342,
  },

  {
    id: "city-lviv",
    type: "city",
    name: "Львів",
    subtitle:
      "Популярне місто",
    people: "62 тис.",
    events: 118,
  },

  {
    id: "city-odesa",
    type: "city",
    name: "Одеса",
    subtitle:
      "Люди та події поруч",
    people: "54 тис.",
    events: 96,
  },

  {
    id: "city-kharkiv",
    type: "city",
    name: "Харків",
    subtitle:
      "Люди та спільноти",
    people: "58 тис.",
    events: 72,
  },
];

const INTERESTS = [
  {
    id: "interest-it",
    type: "interest",
    name: "IT",
    emoji: "💻",
    people: "42 тис.",
  },

  {
    id: "interest-photo",
    type: "interest",
    name: "Фотографія",
    emoji: "📷",
    people: "31 тис.",
  },

  {
    id: "interest-sport",
    type: "interest",
    name: "Спорт",
    emoji: "🏃",
    people: "51 тис.",
  },

  {
    id: "interest-travel",
    type: "interest",
    name: "Подорожі",
    emoji: "✈️",
    people: "67 тис.",
  },

  {
    id: "interest-music",
    type: "interest",
    name: "Музика",
    emoji: "🎧",
    people: "75 тис.",
  },

  {
    id: "interest-art",
    type: "interest",
    name: "Мистецтво",
    emoji: "🎨",
    people: "19 тис.",
  },
];

const EVENTS = [
  {
    id: "event-run",
    type: "event",
    name:
      "Ранкова пробіжка Києвом",
    city: "Київ",
    date: "12 вересня",
    members: 148,
    friends: 4,
    emoji: "🏃",
  },

  {
    id: "event-tech",
    type: "event",
    name:
      "Kyiv Tech Meetup",
    city: "Київ",
    date: "15 вересня",
    members: 640,
    friends: 9,
    emoji: "🚀",
  },

  {
    id: "event-photo",
    type: "event",
    name:
      "Фотопрогулянка центром",
    city: "Київ",
    date: "18 вересня",
    members: 82,
    friends: 3,
    emoji: "📷",
  },
];

const COMMUNITIES = [
  {
    id: "community-kyiv",
    type: "community",
    name:
      "Київ — свої люди",
    members: "18 тис.",
    mutual: 14,
    emoji: "🏙️",
  },

  {
    id: "community-design",
    type: "community",
    name:
      "Дизайн України",
    members: "31 тис.",
    mutual: 8,
    emoji: "🎨",
  },

  {
    id: "community-running",
    type: "community",
    name:
      "Бігаємо разом",
    members: "12 тис.",
    mutual: 5,
    emoji: "🏃",
  },
];

const BUSINESSES = [
  {
    id: "business-coffee",
    type: "business",
    name:
      "Urban Coffee",
    category:
      "Кавʼярня",
    city: "Київ",
    rating: 4.9,
    emoji: "☕",
  },

  {
    id: "business-barber",
    type: "business",
    name:
      "Blade Barbershop",
    category:
      "Барбершоп",
    city: "Київ",
    rating: 4.8,
    emoji: "✂️",
  },

  {
    id: "business-studio",
    type: "business",
    name:
      "Creative Space",
    category:
      "Студія",
    city: "Київ",
    rating: 4.7,
    emoji: "✨",
  },
];

/* =========================================================
   SOCIAL
========================================================= */

const DEFAULT_RELATIONSHIPS = {
  maria: {
    friendStatus:
      "friends",
    following: true,
    follower: true,
    blocked: false,
  },

  oleksandr: {
    friendStatus:
      "incoming",
    following: false,
    follower: true,
    blocked: false,
  },

  anastasia: {
    friendStatus:
      "outgoing",
    following: true,
    follower: false,
    blocked: false,
  },

  sofia: {
    friendStatus:
      "none",
    following: false,
    follower: true,
    blocked: false,
  },

  yulia: {
    friendStatus:
      "none",
    following: true,
    follower: false,
    blocked: false,
  },
};

const TABS = [
  {
    id: "all",
    label: "Усе",
  },

  {
    id: "people",
    label: "Люди",
  },

  {
    id: "schools",
    label: "Школи",
  },

  {
    id: "universities",
    label: "Університети",
  },

  {
    id: "work",
    label: "Робота",
  },

  {
    id: "cities",
    label: "Міста",
  },

  {
    id: "interests",
    label: "Інтереси",
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
    id: "business",
    label: "Бізнес",
  },
];

function searchFriendStatus(
  personId
) {
  const status =
    getFriendStatus(
      personId
    );

  if (
    status ===
    FRIEND_STATUSES.FRIEND
  ) {
    return "friends";
  }

  if (
    status ===
    FRIEND_STATUSES.INCOMING
  ) {
    return "incoming";
  }

  if (
    status ===
    FRIEND_STATUSES.OUTGOING
  ) {
    return "outgoing";
  }

  return "none";
}

/* =========================================================
   SEARCH
========================================================= */

function Search({
  onOpenChat,
  onNavigate,
  authSession = null,
}) {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    activeTab,
    setActiveTab,
  ] = useState("all");

  const [
    social,
    setSocial,
  ] = useState(null);

  const [
    openedPerson,
    setOpenedPerson,
  ] = useState(null);

  const [
    notice,
    setNotice,
  ] = useState("");

  const [
    recentSearches,
    setRecentSearches,
  ] = useState([
    "Київ",
    "КПІ",
    "Фотографія",
  ]);

  const [
    backendPeople,
    setBackendPeople,
  ] =
    useState([]);

  const [
    backendLoading,
    setBackendLoading,
  ] =
    useState(false);

  useEffect(() => {
    let mounted =
      true;

    const load =
      async () => {
        const saved =
          await getSocialState();

        if (!mounted) {
          return;
        }

        const relationships = {
          ...DEFAULT_RELATIONSHIPS,

          ...(saved?.relationships ||
            {}),
        };

        PEOPLE.forEach(
          (
            person
          ) => {
            relationships[
              person.id
            ] = {
              ...(
                relationships[
                  person.id
                ] ||
                {}
              ),

              friendStatus:
                searchFriendStatus(
                  person.id
                ),
            };
          }
        );

        setSocial({
          id:
            "me-social",

          relationships,
        });
      };

    load();

    const unsubscribe =
      subscribeFriends(
        () => {
          if (!mounted) {
            return;
          }

          setSocial(
            (
              current
            ) => {
              if (!current) {
                return current;
              }

              const relationships = {
                ...current.relationships,
              };

              PEOPLE.forEach(
                (
                  person
                ) => {
                  relationships[
                    person.id
                  ] = {
                    ...(
                      relationships[
                        person.id
                      ] ||
                      {}
                    ),

                    friendStatus:
                      searchFriendStatus(
                        person.id
                      ),
                  };
                }
              );

              return {
                ...current,

                relationships,
              };
            }
          );
        }
      );

    return () => {
      mounted =
        false;

      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      setBackendPeople(
        []
      );

      return undefined;
    }

    let cancelled =
      false;

    const timer =
      window.setTimeout(
        async () => {
          try {
            setBackendLoading(
              true
            );

            const [
              people,
              relationships,
            ] =
              await Promise.all([
                searchBackendProfiles(
                  authSession,
                  query
                ),
                getBackendRelationships(
                  authSession
                ),
              ]);

            if (
              cancelled
            ) {
              return;
            }

            setBackendPeople(
              people
            );

            setSocial(
              (current) => ({
                ...(current || {
                  id:
                    "me-social",
                }),
                relationships: {
                  ...(current
                    ?.relationships ||
                    {}),
                  ...relationships,
                },
              })
            );
          } catch (
            error
          ) {
            console.warn(
              "BACKEND PEOPLE LOAD ERROR:",
              error
            );
          } finally {
            if (
              !cancelled
            ) {
              setBackendLoading(
                false
              );
            }
          }
        },
        220
      );

    return () => {
      cancelled =
        true;

      window.clearTimeout(
        timer
      );
    };
  }, [
    authSession,
    query,
  ]);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      return undefined;
    }

    let active =
      true;

    let timer =
      null;

    const refreshRelations =
      async () => {
        try {
          const relationships =
            await getBackendRelationships(
              authSession
            );

          if (
            !active
          ) {
            return;
          }

          setSocial(
            (
              current
            ) => ({
              ...(current || {
                id:
                  "me-social",
              }),
              relationships: {
                ...(current
                  ?.relationships ||
                  {}),
                ...relationships,
              },
            })
          );
        } catch (
          error
        ) {
          console.warn(
            "SEARCH SOCIAL REALTIME ERROR:",
            error
          );
        }
      };

    const channel =
      subscribeSocialGraphRealtime({
        session:
          authSession,
        onChange:
          () => {
            if (
              timer
            ) {
              window.clearTimeout(
                timer
              );
            }

            timer =
              window.setTimeout(
                refreshRelations,
                90
              );
          },
      });

    return () => {
      active =
        false;

      if (
        timer
      ) {
        window.clearTimeout(
          timer
        );
      }

      channel.close();
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  /* =======================================================
     ROUTE PAYLOAD
  ======================================================= */

  useEffect(() => {
    function applyPayload(
      payload
    ) {
      const value =
        payload?.query ||
        payload?.search ||
        "";

      if (value) {
        setQuery(
          value
        );

        setActiveTab(
          payload?.tab ||
          "all"
        );
      }

      if (
        payload?.personId
      ) {
        setOpenedPerson(
          payload.personId
        );
      }

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
          JSON.parse(
            raw
          );

        if (
          parsed?.route ===
          "search"
        ) {
          applyPayload(
            parsed.payload ||
            {}
          );
        }
      }
    } catch (
      error
    ) {
      console.warn(
        "SEARCH ROUTE PAYLOAD ERROR:",
        error
      );
    }

    function handleRoute(
      event
    ) {
      if (
        event?.detail?.route !==
        "search"
      ) {
        return;
      }

      applyPayload(
        event.detail.payload ||
        {}
      );
    }

    window.addEventListener(
      "yatut:route-payload",
      handleRoute
    );

    return () =>
      window.removeEventListener(
        "yatut:route-payload",
        handleRoute
      );
  }, []);

  const showNotice = (
    text
  ) => {
    setNotice(
      text
    );

    setTimeout(
      () =>
        setNotice(""),
      2000
    );
  };

  const saveSocial =
    async (
      next
    ) => {
      setSocial(
        next
      );

      await saveSocialState(
        next
      );
    };

  const updateRelation =
    async (
      personId,
      changes
    ) => {
      const old =
        social.relationships[
          personId
        ] || {
          friendStatus:
            "none",

          following: false,
          follower: false,
          blocked: false,
        };

      const next = {
        ...social,

        relationships: {
          ...social.relationships,

          [personId]: {
            ...old,
            ...changes,
          },
        },
      };

      await saveSocial(
        next
      );
    };

  const friendAction =
    async (
      personId,
      action
    ) => {
      const backendPerson =
        backendPeople.some(
          (
            person
          ) =>
            person.id ===
            personId
        );

      if (
        backendPerson &&
        authSession?.user?.id
      ) {
        try {
          if (
            action ===
            "send"
          ) {
            await sendBackendFriendRequest(
              authSession,
              personId
            );
          } else if (
            action ===
            "cancel"
          ) {
            await cancelBackendFriendRequest(
              authSession,
              personId
            );
          } else if (
            action ===
            "accept"
          ) {
            await acceptBackendFriendRequest(
              authSession,
              personId
            );
          } else if (
            action ===
            "reject"
          ) {
            await declineBackendFriendRequest(
              authSession,
              personId
            );
          } else if (
            action ===
            "remove"
          ) {
            await removeBackendFriend(
              authSession,
              personId
            );
          }

          const relationships =
            await getBackendRelationships(
              authSession
            );

          setSocial(
            (
              current
            ) => ({
              ...(current || {
                id:
                  "me-social",
              }),
              relationships: {
                ...(current
                  ?.relationships ||
                  {}),
                [personId]: {
                  friendStatus:
                    "none",
                  following:
                    false,
                  follower:
                    false,
                  blocked:
                    false,
                },
                ...relationships,
              },
            })
          );

          const notices = {
            send:
              "Запит у друзі надіслано",
            cancel:
              "Запит скасовано",
            accept:
              "Ви тепер друзі 🎉",
            reject:
              "Запит відхилено",
            remove:
              "Користувача видалено з друзів",
          };

          showNotice(
            notices[
              action
            ] ||
            "Готово"
          );
        } catch (
          error
        ) {
          console.warn(
            "BACKEND FRIEND ACTION ERROR:",
            error
          );

          showNotice(
            error?.message ||
            "Не вдалося виконати дію"
          );
        }

        return;
      }

      if (
        action ===
        "send"
      ) {
        sendFriendRequest(
          personId
        );

        await updateRelation(
          personId,
          {
            friendStatus:
              "outgoing",
            following:
              true,
          }
        );

        showNotice(
          "Запит у друзі надіслано"
        );

        return;
      }

      if (
        action ===
        "cancel"
      ) {
        cancelFriendRequest(
          personId
        );

        await updateRelation(
          personId,
          {
            friendStatus:
              "none",
          }
        );

        showNotice(
          "Запит скасовано"
        );

        return;
      }

      if (
        action ===
        "accept"
      ) {
        acceptIncomingFriendRequest(
          personId
        );

        await updateRelation(
          personId,
          {
            friendStatus:
              "friends",
            following:
              true,
          }
        );

        showNotice(
          "Ви тепер друзі 🎉"
        );

        return;
      }

      if (
        action ===
        "reject"
      ) {
        declineIncomingFriendRequest(
          personId
        );

        await updateRelation(
          personId,
          {
            friendStatus:
              "none",
          }
        );

        showNotice(
          "Запит відхилено"
        );

        return;
      }

      if (
        action ===
        "remove"
      ) {
        removeFriend(
          personId
        );

        await updateRelation(
          personId,
          {
            friendStatus:
              "none",
          }
        );

        showNotice(
          "Користувача видалено з друзів"
        );
      }
    };

  const toggleFollow =
    async (
      personId
    ) => {
      const relation =
        social.relationships[
          personId
        ];

      await updateRelation(
        personId,
        {
          following:
            !relation
              ?.following,
        }
      );
    };

  const setBlocked =
    async (
      personId,
      blocked
    ) => {
      const backendPerson =
        backendPeople.some(
          (
            person
          ) =>
            person.id ===
            personId
        );

      if (
        backendPerson &&
        authSession?.user?.id
      ) {
        try {
          await setBackendBlocked(
            authSession,
            personId,
            blocked
          );

          const relationships =
            await getBackendRelationships(
              authSession
            );

          setSocial(
            (
              current
            ) => ({
              ...(current || {
                id:
                  "me-social",
              }),
              relationships: {
                ...(current
                  ?.relationships ||
                  {}),
                [personId]: {
                  friendStatus:
                    "none",
                  following:
                    false,
                  follower:
                    false,
                  blocked:
                    Boolean(
                      blocked
                    ),
                },
                ...relationships,
              },
            })
          );

          showNotice(
            blocked
              ? "Користувача заблоковано"
              : "Користувача розблоковано"
          );
        } catch (
          error
        ) {
          showNotice(
            error?.message ||
            "Не вдалося змінити блокування"
          );
        }

        return;
      }

      await updateRelation(
        personId,
        blocked
          ? {
              blocked: true,
              friendStatus:
                "none",
              following: false,
              follower: false,
            }
          : {
              blocked: false,
            }
      );
    };

  const reportUser =
    async (
      personId
    ) => {
      const backendPerson =
        backendPeople.some(
          (
            person
          ) =>
            person.id ===
            personId
        );

      if (
        backendPerson &&
        authSession?.user?.id
      ) {
        try {
          await reportBackendUser(
            authSession,
            personId,
            {
              reason:
                "profile",
            }
          );

          showNotice(
            "Скаргу надіслано на розгляд"
          );
        } catch (
          error
        ) {
          showNotice(
            error?.message ||
            "Не вдалося надіслати скаргу"
          );
        }

        return;
      }

      showNotice(
        "Скаргу створено"
      );
    };

  const applySearch = (
    value
  ) => {
    setQuery(
      value
    );

    if (
      value.trim()
    ) {
      setRecentSearches(
        (
          previous
        ) => [
          value.trim(),
          ...previous.filter(
            (
              item
            ) =>
              item !==
              value.trim()
          ),
        ].slice(
          0,
          5
        )
      );
    }
  };

  const matches = (
    values
  ) => {
    const clean =
      query
        .trim()
        .toLowerCase();

    if (!clean) {
      return true;
    }

    return values
      .filter(
        Boolean
      )
      .join(" ")
      .toLowerCase()
      .includes(
        clean
      );
  };

  const searchablePeople =
    useMemo(
      () => {
        if (
          authSession?.user?.id
        ) {
          return backendPeople.filter(
            (
              person
            ) =>
              !social
                ?.relationships?.[
                  person.id
                ]?.blockedByThem
          );
        }

        return PEOPLE;
      },
      [
        backendPeople,
        social,
        authSession?.user?.id,
      ]
    );

  const filteredPeople =
    useMemo(
      () =>
        searchablePeople.filter(
          (
            person
          ) =>
            matches([
              person.name,
              person.username,
              person.city,
              person.hometown,
              person.school,
              person.university,
              person.work,
              ...person.interests,
            ])
        ),
      [
        query,
        searchablePeople,
      ]
    );

  const filteredSchools =
    SCHOOLS.filter(
      (
        item
      ) =>
        matches([
          item.name,
          item.city,
        ])
    );

  const filteredUniversities =
    UNIVERSITIES.filter(
      (
        item
      ) =>
        matches([
          item.name,
          item.city,
        ])
    );

  const filteredWork =
    WORKS.filter(
      (
        item
      ) =>
        matches([
          item.name,
          item.city,
        ])
    );

  const filteredCities =
    CITIES.filter(
      (
        item
      ) =>
        matches([
          item.name,
          item.subtitle,
        ])
    );

  const filteredInterests =
    INTERESTS.filter(
      (
        item
      ) =>
        matches([
          item.name,
        ])
    );

  const filteredEvents =
    EVENTS.filter(
      (
        item
      ) =>
        matches([
          item.name,
          item.city,
        ])
    );

  const filteredCommunities =
    COMMUNITIES.filter(
      (
        item
      ) =>
        matches([
          item.name,
        ])
    );

  const filteredBusinesses =
    BUSINESSES.filter(
      (
        item
      ) =>
        matches([
          item.name,
          item.category,
          item.city,
        ])
    );

  const totalResults =
    filteredPeople.length +
    filteredSchools.length +
    filteredUniversities.length +
    filteredWork.length +
    filteredCities.length +
    filteredInterests.length +
    filteredEvents.length +
    filteredCommunities.length +
    filteredBusinesses.length;

  const show =
    (
      section
    ) =>
      activeTab ===
        "all" ||
      activeTab ===
        section;

  if (
    openedPerson
  ) {
    const person =
      searchablePeople.find(
        (
          item
        ) =>
          item.id ===
          openedPerson
      );

    return (
      <UserProfile
        person={
          person
        }
        relation={
          social
            ?.relationships?.[
            openedPerson
          ]
        }
        onBack={() =>
          setOpenedPerson(
            null
          )
        }
        onFriendAction={
          friendAction
        }
        onFollow={
          toggleFollow
        }
        onBlock={
          setBlocked
        }
        onReport={
          reportUser
        }
        onOpenChat={
          onOpenChat
        }
        authSession={
          authSession
        }
      />
    );
  }

  return (
    <section className="global-search-page">

      {/* HERO */}

      <div className="global-search-hero">

        <div>
          <span className="search-hero-label">
            ЗНАЙДИ СВОЇХ
          </span>

          <h1>
            Пошук у ЯТУТ
          </h1>

          <p>
            Люди, з якими ви навчались,
            працювали, жили в одному місті
            або маєте спільні інтереси.
          </p>
        </div>

        <div className="search-hero-symbol">
          Я
        </div>

      </div>

      {/* SEARCH */}

      <div className="global-search-box">

        <span className="global-search-icon">
          ⌕
        </span>

        <input
          autoFocus
          value={
            query
          }
          onChange={(
            event
          ) =>
            setQuery(
              event.target
                .value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter"
            ) {
              applySearch(
                query
              );
            }
          }}
          placeholder="Імʼя, школа, університет, робота, місто..."
        />

        {query && (
          <button
            className="global-search-clear"
            onClick={() =>
              setQuery("")
            }
          >
            ×
          </button>
        )}

      </div>

      {backendLoading && (
        <div className="search-result-summary">
          <span>
            Шукаємо людей у ЯТУТ…
          </span>
        </div>
      )}

      {/* TABS */}

      <div className="global-search-tabs">

        {TABS.map(
          (
            tab
          ) => (
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
              onClick={() =>
                setActiveTab(
                  tab.id
                )
              }
            >
              {
                tab.label
              }
            </button>
          )
        )}

      </div>

      <div className="global-search-layout">

        {/* RESULTS */}

        <main className="search-results-column">

          {query && (
            <div className="search-result-summary">
              <span>
                Результати для
              </span>

              <strong>
                «{query}»
              </strong>

              <b>
                {
                  totalResults
                }
              </b>
            </div>
          )}

          {/* PEOPLE */}

          {show(
            "people"
          ) &&
            filteredPeople
              .length >
              0 && (
              <section className="search-section">

                <div className="search-section-header">

                  <div>
                    <span>
                      ЛЮДИ
                    </span>

                    <h2>
                      Можливо, ви знайомі
                    </h2>
                  </div>

                  {activeTab ===
                    "all" && (
                    <button
                      onClick={() =>
                        setActiveTab(
                          "people"
                        )
                      }
                    >
                      Усі
                    </button>
                  )}

                </div>

                <div className="search-people-list">

                  {filteredPeople
                    .slice(
                      0,
                      activeTab ===
                        "all"
                        ? 4
                        : 50
                    )
                    .map(
                      (
                        person
                      ) => {
                        const relation =
                          social
                            ?.relationships?.[
                            person.id
                          ];

                        return (
                          <article
                            className="search-person-card"
                            key={
                              person.id
                            }
                          >

                            <button
                              className={`search-person-avatar ${
                                person.hasStory &&
                                !person.storyViewed
                                  ? "has-story"
                                  : ""
                              }`}
                              onClick={() =>
                                setOpenedPerson(
                                  person.id
                                )
                              }
                            >
                              <div>
                                {
                                  person.initials
                                }
                              </div>

                              {person.online && (
                                <span />
                              )}
                            </button>

                            <div className="search-person-main">

                              <button
                                className="search-person-name"
                                onClick={() =>
                                  setOpenedPerson(
                                    person.id
                                  )
                                }
                              >
                                {
                                  person.name
                                }

                                {person.verified && (
                                  <b>
                                    ✓
                                  </b>
                                )}
                              </button>

                              <span className="search-person-username">
                                @
                                {
                                  person.username
                                }
                              </span>

                              <div className="search-match-reason">
                                <span>
                                  ✨
                                </span>

                                {
                                  person.reason
                                }
                              </div>

                              <div className="search-person-details">
                                <span>
                                  📍{" "}
                                  {
                                    person.city
                                  }
                                </span>

                                {person.university && (
                                  <span>
                                    🎓{" "}
                                    {
                                      person.university
                                    }
                                  </span>
                                )}
                              </div>

                            </div>

                            <div className="search-person-actions">

                              {relation
                                ?.friendStatus ===
                              "friends" ? (
                                <>
                                  <button
                                    className="search-secondary-button"
                                    onClick={() =>
                                      setOpenedPerson(
                                        person.id
                                      )
                                    }
                                  >
                                    Профіль
                                  </button>

                                  <button
                                    className="search-chat-button"
                                    onClick={() =>
                                      onOpenChat?.(
                                        person.id
                                      )
                                    }
                                  >
                                    💬
                                  </button>
                                </>
                              ) : relation
                                  ?.friendStatus ===
                                "incoming" ? (
                                <button
                                  className="search-primary-button"
                                  onClick={() =>
                                    friendAction(
                                      person.id,
                                      "accept"
                                    )
                                  }
                                >
                                  Прийняти
                                </button>
                              ) : relation
                                  ?.friendStatus ===
                                "outgoing" ? (
                                <button
                                  className="search-secondary-button"
                                  onClick={() =>
                                    friendAction(
                                      person.id,
                                      "cancel"
                                    )
                                  }
                                >
                                  Запит надіслано
                                </button>
                              ) : (
                                <button
                                  className="search-primary-button"
                                  onClick={() =>
                                    friendAction(
                                      person.id,
                                      "send"
                                    )
                                  }
                                >
                                  + Додати
                                </button>
                              )}

                            </div>

                          </article>
                        );
                      }
                    )}

                </div>
              </section>
            )}

          {/* SCHOOLS */}

          {show(
            "schools"
          ) &&
            filteredSchools
              .length >
              0 && (
              <SearchCollection
                title="Школи"
                eyebrow="ОСВІТА"
                items={
                  filteredSchools
                }
                icon="🏫"
                activeTab={
                  activeTab
                }
                onSeeAll={() =>
                  setActiveTab(
                    "schools"
                  )
                }
                onFindPeople={(
                  value
                ) => {
                  setQuery(
                    value
                  );

                  setActiveTab(
                    "people"
                  );
                }}
              />
            )}

          {/* UNIVERSITIES */}

          {show(
            "universities"
          ) &&
            filteredUniversities
              .length >
              0 && (
              <SearchCollection
                title="Університети"
                eyebrow="ОСВІТА"
                items={
                  filteredUniversities
                }
                icon="🎓"
                activeTab={
                  activeTab
                }
                onSeeAll={() =>
                  setActiveTab(
                    "universities"
                  )
                }
                onFindPeople={(
                  value
                ) => {
                  setQuery(
                    value
                  );

                  setActiveTab(
                    "people"
                  );
                }}
              />
            )}

          {/* WORK */}

          {show(
            "work"
          ) &&
            filteredWork
              .length >
              0 && (
              <SearchCollection
                title="Робота"
                eyebrow="КОЛЕГИ"
                items={
                  filteredWork
                }
                icon="💼"
                activeTab={
                  activeTab
                }
                onSeeAll={() =>
                  setActiveTab(
                    "work"
                  )
                }
                onFindPeople={(
                  value
                ) => {
                  setQuery(
                    value
                  );

                  setActiveTab(
                    "people"
                  );
                }}
              />
            )}

          {/* CITIES */}

          {show(
            "cities"
          ) &&
            filteredCities
              .length >
              0 && (
              <section className="search-section">

                <div className="search-section-header">

                  <div>
                    <span>
                      МІСТА
                    </span>

                    <h2>
                      Знайдіть своїх поруч
                    </h2>
                  </div>

                  {activeTab ===
                    "all" && (
                    <button
                      onClick={() =>
                        setActiveTab(
                          "cities"
                        )
                      }
                    >
                      Усі
                    </button>
                  )}

                </div>

                <div className="search-city-grid">

                  {filteredCities.map(
                    (
                      city
                    ) => (
                      <button
                        className="search-city-card"
                        key={
                          city.id
                        }
                        onClick={() =>
                          onNavigate?.(
                            "nearby"
                          )
                        }
                      >
                        <div className="search-city-icon">
                          Я
                        </div>

                        <strong>
                          {
                            city.name
                          }
                        </strong>

                        <span>
                          {
                            city.subtitle
                          }
                        </span>

                        <div>
                          <b>
                            👥{" "}
                            {
                              city.people
                            }
                          </b>

                          <b>
                            🎉{" "}
                            {
                              city.events
                            }
                          </b>
                        </div>
                      </button>
                    )
                  )}

                </div>
              </section>
            )}

          {/* INTERESTS */}

          {show(
            "interests"
          ) &&
            filteredInterests
              .length >
              0 && (
              <section className="search-section">

                <div className="search-section-header">
                  <div>
                    <span>
                      ІНТЕРЕСИ
                    </span>

                    <h2>
                      Люди зі спільними інтересами
                    </h2>
                  </div>
                </div>

                <div className="search-interest-grid">

                  {filteredInterests.map(
                    (
                      interest
                    ) => (
                      <button
                        key={
                          interest.id
                        }
                        onClick={() => {
                          setQuery(
                            interest.name
                          );

                          setActiveTab(
                            "people"
                          );
                        }}
                      >
                        <span>
                          {
                            interest.emoji
                          }
                        </span>

                        <strong>
                          {
                            interest.name
                          }
                        </strong>

                        <small>
                          {
                            interest.people
                          }{" "}
                          людей
                        </small>
                      </button>
                    )
                  )}

                </div>
              </section>
            )}

          {/* EVENTS */}

          {show(
            "events"
          ) &&
            filteredEvents
              .length >
              0 && (
              <section className="search-section">

                <div className="search-section-header">
                  <div>
                    <span>
                      ПОДІЇ
                    </span>

                    <h2>
                      Зустріньтесь у реальному житті
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      onNavigate?.(
                        "events"
                      )
                    }
                  >
                    Усі події
                  </button>
                </div>

                <div className="search-event-list">

                  {filteredEvents.map(
                    (
                      event
                    ) => (
                      <article
                        className="search-event-card"
                        key={
                          event.id
                        }
                      >
                        <div className="search-event-icon">
                          {
                            event.emoji
                          }
                        </div>

                        <div>
                          <strong>
                            {
                              event.name
                            }
                          </strong>

                          <span>
                            {
                              event.date
                            }{" "}
                            •{" "}
                            {
                              event.city
                            }
                          </span>

                          <small>
                            {
                              event.members
                            }{" "}
                            учасників •{" "}
                            {
                              event.friends
                            }{" "}
                            друзів йдуть
                          </small>
                        </div>

                        <button
                          onClick={() =>
                            onNavigate?.(
                              "events"
                            )
                          }
                        >
                          Переглянути
                        </button>
                      </article>
                    )
                  )}

                </div>
              </section>
            )}

          {/* COMMUNITIES */}

          {show(
            "communities"
          ) &&
            filteredCommunities
              .length >
              0 && (
              <section className="search-section">

                <div className="search-section-header">
                  <div>
                    <span>
                      СПІЛЬНОТИ
                    </span>

                    <h2>
                      Знайдіть своє коло
                    </h2>
                  </div>
                </div>

                <div className="search-community-grid">

                  {filteredCommunities.map(
                    (
                      community
                    ) => (
                      <article
                        className="search-community-card"
                        key={
                          community.id
                        }
                      >
                        <div>
                          {
                            community.emoji
                          }
                        </div>

                        <strong>
                          {
                            community.name
                          }
                        </strong>

                        <span>
                          {
                            community.members
                          }{" "}
                          учасників
                        </span>

                        <small>
                          {
                            community.mutual
                          }{" "}
                          ваших друзів
                        </small>

                        <button
                          onClick={() =>
                            onNavigate?.(
                              "communities"
                            )
                          }
                        >
                          Відкрити
                        </button>
                      </article>
                    )
                  )}

                </div>
              </section>
            )}

          {/* BUSINESS */}

          {show(
            "business"
          ) &&
            filteredBusinesses
              .length >
              0 && (
              <section className="search-section">

                <div className="search-section-header">
                  <div>
                    <span>
                      БІЗНЕС
                    </span>

                    <h2>
                      Місця та послуги
                    </h2>
                  </div>
                </div>

                <div className="search-business-list">

                  {filteredBusinesses.map(
                    (
                      business
                    ) => (
                      <article
                        className="search-business-card"
                        key={
                          business.id
                        }
                      >
                        <div className="search-business-icon">
                          {
                            business.emoji
                          }
                        </div>

                        <div>
                          <strong>
                            {
                              business.name
                            }
                          </strong>

                          <span>
                            {
                              business.category
                            }{" "}
                            •{" "}
                            {
                              business.city
                            }
                          </span>

                          <small>
                            ⭐{" "}
                            {
                              business.rating
                            }
                          </small>
                        </div>

                        <button
                          onClick={() =>
                            onNavigate?.(
                              "business"
                            )
                          }
                        >
                          Відкрити
                        </button>
                      </article>
                    )
                  )}

                </div>
              </section>
            )}

          {totalResults ===
            0 && (
            <div className="global-search-empty">
              <div>
                🔎
              </div>

              <h3>
                Нічого не знайдено
              </h3>

              <p>
                Спробуйте імʼя, місто, школу,
                університет, компанію або інтерес.
              </p>
            </div>
          )}

        </main>

        {/* RIGHT */}

        <aside className="search-discovery-column">

          <div className="search-side-card">
            <span className="search-side-label">
              ШВИДКИЙ ПОШУК
            </span>

            <h3>
              Ваші звʼязки
            </h3>

            <button
              onClick={() =>
                setActiveTab(
                  "people"
                )
              }
            >
              <span>
                👥
              </span>

              <div>
                <strong>
                  Друзі друзів
                </strong>

                <small>
                  124 можливі знайомства
                </small>
              </div>

              <b>
                ›
              </b>
            </button>

            <button
              onClick={() =>
                applySearch(
                  "Київ"
                )
              }
            >
              <span>
                📍
              </span>

              <div>
                <strong>
                  Люди у Києві
                </strong>

                <small>
                  Поруч із вами
                </small>
              </div>

              <b>
                ›
              </b>
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  "schools"
                )
              }
            >
              <span>
                🏫
              </span>

              <div>
                <strong>
                  Однокласники
                </strong>

                <small>
                  Знайти людей зі школи
                </small>
              </div>

              <b>
                ›
              </b>
            </button>

            <button
              onClick={() =>
                setActiveTab(
                  "work"
                )
              }
            >
              <span>
                💼
              </span>

              <div>
                <strong>
                  Колеги
                </strong>

                <small>
                  Поточна та минула робота
                </small>
              </div>

              <b>
                ›
              </b>
            </button>
          </div>

          <div className="search-side-card">
            <span className="search-side-label">
              НЕДАВНІ
            </span>

            <div className="recent-searches">

              {recentSearches.map(
                (
                  item
                ) => (
                  <button
                    key={
                      item
                    }
                    onClick={() =>
                      applySearch(
                        item
                      )
                    }
                  >
                    <span>
                      ↗
                    </span>

                    {
                      item
                    }

                    <b>
                      ›
                    </b>
                  </button>
                )
              )}

            </div>
          </div>

          <div className="search-connection-card">
            <div>
              ✨
            </div>

            <span>
              ЯТУТ ЗВʼЯЗКИ
            </span>

            <strong>
              Не просто шукайте людей.
              Знаходьте своїх.
            </strong>

            <p>
              ЯТУТ враховує друзів,
              освіту, роботу, міста,
              інтереси та події.
            </p>
          </div>

        </aside>

      </div>

      {notice && (
        <div className="yatut-toast">
          {
            notice
          }
        </div>
      )}

    </section>
  );
}

/* =========================================================
   GENERIC COLLECTION
========================================================= */

function SearchCollection({
  title,
  eyebrow,
  items,
  icon,
  activeTab,
  onSeeAll,
  onFindPeople,
}) {
  return (
    <section className="search-section">

      <div className="search-section-header">

        <div>
          <span>
            {
              eyebrow
            }
          </span>

          <h2>
            {
              title
            }
          </h2>
        </div>

        {activeTab ===
          "all" && (
          <button
            onClick={
              onSeeAll
            }
          >
            Усі
          </button>
        )}

      </div>

      <div className="search-entity-list">

        {items
          .slice(
            0,
            activeTab ===
              "all"
              ? 3
              : 50
          )
          .map(
            (
              item
            ) => (
              <article
                className="search-entity-card"
                key={
                  item.id
                }
              >
                <div className="search-entity-icon">
                  {
                    icon
                  }
                </div>

                <div className="search-entity-info">

                  <strong>
                    {
                      item.name
                    }
                  </strong>

                  <span>
                    📍{" "}
                    {
                      item.city
                    }
                  </span>

                  <small>
                    {
                      item.description
                    }
                  </small>

                  <div className="search-entity-stats">

                    <b>
                      👥{" "}
                      {
                        item.people
                      }
                    </b>

                    <b>
                      🤝{" "}
                      {
                        item.mutual
                      }{" "}
                      знайомих
                    </b>

                  </div>

                </div>

                <button
                  className="search-entity-action"
                  onClick={() =>
                    onFindPeople(
                      item.name
                    )
                  }
                >
                  Знайти людей
                </button>

              </article>
            )
          )}

      </div>
    </section>
  );
}

export default Search;