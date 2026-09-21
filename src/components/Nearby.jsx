import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./FeaturePages.css";

import YatutIcon from "./YatutIcon";

import {
  createSavedPlace,
  isSaved,
  subscribeSavedItems,
  toggleSaved,
} from "../storage/savedService";

/* =========================================================
   YATUT NEARBY V2

   Підтримує:
   - люди поруч
   - події поруч
   - місця
   - спільноти
   - радіус пошуку
   - приблизну геолокацію
   - підписки на людей
   - цікаві події
   - вступ у спільноти
   - Збережене через savedService
   - live sync із Saved.jsx
   - відкриття конкретного місця із Saved
========================================================= */

const STORAGE_KEY =
  "yatut-nearby-v2";

/* =========================================================
   TABS
========================================================= */

const TABS = [
  {
    id: "all",
    title: "Для вас",
  },

  {
    id: "people",
    title: "Люди",
  },

  {
    id: "events",
    title: "Події",
  },

  {
    id: "places",
    title: "Місця",
  },

  {
    id: "communities",
    title: "Спільноти",
  },
];

/* =========================================================
   PEOPLE
========================================================= */

const PEOPLE = [
  {
    id: "near-person-1",

    name:
      "Анастасія Левченко",

    username:
      "anastasia.l",

    initials:
      "А",

    distance:
      0.8,

    city:
      "Київ",

    mutual:
      5,

    online:
      true,

    description:
      "Дизайн • фотографія • кавʼярні",
  },

  {
    id: "near-person-2",

    name:
      "Максим Шевченко",

    username:
      "max.sh",

    initials:
      "М",

    distance:
      1.4,

    city:
      "Київ",

    mutual:
      2,

    online:
      false,

    description:
      "Технології • спорт • стартапи",
  },

  {
    id: "near-person-3",

    name:
      "Софія Бондар",

    username:
      "sofia.b",

    initials:
      "С",

    distance:
      2.1,

    city:
      "Київ",

    mutual:
      8,

    online:
      true,

    description:
      "Мистецтво • музика • подорожі",
  },
];

/* =========================================================
   EVENTS
========================================================= */

const EVENTS = [
  {
    id: "near-event-1",

    title:
      "Вечір настільних ігор",

    date:
      "Сьогодні",

    time:
      "19:00",

    place:
      "Поділ",

    distance:
      1.2,

    people:
      24,
  },

  {
    id: "near-event-2",

    title:
      "Міська пробіжка",

    date:
      "Завтра",

    time:
      "08:00",

    place:
      "ВДНГ",

    distance:
      4.8,

    people:
      63,
  },

  {
    id: "near-event-3",

    title:
      "Зустріч дизайнерів",

    date:
      "12 вересня",

    time:
      "18:30",

    place:
      "UNIT.City",

    distance:
      3.3,

    people:
      41,
  },
];

/* =========================================================
   PLACES
========================================================= */

const PLACES = [
  {
    id: "near-place-1",

    title:
      "Blur Coffee",

    category:
      "Кавʼярня",

    city:
      "Київ",

    address:
      "Поділ, Київ",

    distance:
      0.6,

    rating:
      4.8,

    reviews:
      347,

    open:
      true,

    hours:
      "08:00–22:00",

    description:
      "Тихе місце для роботи, зустрічей та хорошої кави.",

    features: [
      "Wi-Fi",
      "Робочі місця",
      "Pet friendly",
    ],
  },

  {
    id: "near-place-2",

    title:
      "Creative Space",

    category:
      "Коворкінг",

    city:
      "Київ",

    address:
      "Шевченківський район",

    distance:
      1.9,

    rating:
      4.7,

    reviews:
      219,

    open:
      true,

    hours:
      "09:00–21:00",

    description:
      "Робочі місця, конференц-зали та події для творчих команд.",

    features: [
      "Коворкінг",
      "Переговорні",
      "Події",
    ],
  },

  {
    id: "near-place-3",

    title:
      "Urban Sport",

    category:
      "Спорт",

    city:
      "Київ",

    address:
      "Оболонь, Київ",

    distance:
      2.7,

    rating:
      4.6,

    reviews:
      174,

    open:
      false,

    hours:
      "07:00–23:00",

    description:
      "Спортивний простір, тренажерний зал та групові тренування.",

    features: [
      "Фітнес",
      "Тренери",
      "Групові заняття",
    ],
  },
];

/* =========================================================
   COMMUNITIES
========================================================= */

const COMMUNITIES = [
  {
    id:
      "near-community-1",

    title:
      "Київ біжить",

    members:
      12843,

    distance:
      1.8,

    description:
      "Пробіжки, старти та тренування у Києві.",
  },

  {
    id:
      "near-community-2",

    title:
      "Дизайн Київ",

    members:
      7210,

    distance:
      2.4,

    description:
      "Дизайнери, ілюстратори та творчі люди.",
  },

  {
    id:
      "near-community-3",

    title:
      "Поділ • Сусіди",

    members:
      3891,

    distance:
      0.9,

    description:
      "Події, новини та люди вашого району.",
  },
];

/* =========================================================
   DEFAULT STATE
========================================================= */

const DEFAULT_STATE = {
  followedPeople: [],

  interestedEvents: [],

  joinedCommunities: [],

  radius: 5,
};

/* =========================================================
   LOAD STATE
========================================================= */

function loadState() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    /*
      Миграция со старой версии.
    */

    const oldRaw =
      localStorage.getItem(
        "yatut-nearby-v1"
      );

    const parsed =
      raw
        ? JSON.parse(
            raw
          )
        : oldRaw
        ? JSON.parse(
            oldRaw
          )
        : {};

    return {
      followedPeople:
        Array.isArray(
          parsed.followedPeople
        )
          ? parsed.followedPeople
          : [],

      interestedEvents:
        Array.isArray(
          parsed.interestedEvents
        )
          ? parsed.interestedEvents
          : [],

      joinedCommunities:
        Array.isArray(
          parsed.joinedCommunities
        )
          ? parsed.joinedCommunities
          : [],

      radius:
        Number(
          parsed.radius ||
            5
        ),

      /*
        Только для миграции.
        После переноса удалим из state.
      */

      legacySavedPlaces:
        Array.isArray(
          parsed.savedPlaces
        )
          ? parsed.savedPlaces
          : [],
    };
  } catch (
    error
  ) {
    console.warn(
      "NEARBY LOAD ERROR:",
      error
    );

    return {
      ...DEFAULT_STATE,

      legacySavedPlaces:
        [],
    };
  }
}

/* =========================================================
   HELPERS
========================================================= */

function toggleArray(
  array,
  id
) {
  return array.includes(
    id
  )
    ? array.filter(
        (item) =>
          item !== id
      )
    : [
        ...array,
        id,
      ];
}

function formatMembers(
  value
) {
  const number =
    Number(
      value || 0
    );

  if (
    number >=
    1000000
  ) {
    return `${(
      number /
      1000000
    ).toFixed(
      1
    )} млн`;
  }

  if (
    number >=
    1000
  ) {
    return `${(
      number /
      1000
    ).toFixed(
      1
    )} тис.`;
  }

  return String(
    number
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Nearby({
  onNavigate,
  authSession = null,
}) {
  const [
    tab,
    setTab,
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
    state,
    setState,
  ] =
    useState(
      loadState
    );

  const [
    locationStatus,
    setLocationStatus,
  ] =
    useState(
      "Київ"
    );

  const [
    locating,
    setLocating,
  ] =
    useState(
      false
    );

  const [
    savedVersion,
    setSavedVersion,
  ] =
    useState(
      0
    );

  const [
    selectedPlaceId,
    setSelectedPlaceId,
  ] =
    useState(
      null
    );

  /* =======================================================
     MIGRATE OLD SAVED PLACES
  ======================================================= */

  useEffect(() => {
    const legacy =
      state.legacySavedPlaces;

    if (
      !Array.isArray(
        legacy
      ) ||
      !legacy.length
    ) {
      return;
    }

    legacy.forEach(
      (
        placeId
      ) => {
        const place =
          PLACES.find(
            (
              item
            ) =>
              item.id ===
              placeId
          );

        if (
          !place
        ) {
          return;
        }

        if (
          isSaved(
            "place",
            place.id
          )
        ) {
          return;
        }

        toggleSaved(
          createSavedPlace(
            place
          )
        );
      }
    );

    setState(
      (
        previous
      ) => ({
        followedPeople:
          previous.followedPeople ||
          [],

        interestedEvents:
          previous.interestedEvents ||
          [],

        joinedCommunities:
          previous.joinedCommunities ||
          [],

        radius:
          Number(
            previous.radius ||
              5
          ),
      })
    );
  }, [
    state.legacySavedPlaces,
  ]);

  /* =======================================================
     SAVE NEARBY STATE
  ======================================================= */

  useEffect(() => {
    try {
      const cleanState = {
        followedPeople:
          state.followedPeople ||
          [],

        interestedEvents:
          state.interestedEvents ||
          [],

        joinedCommunities:
          state.joinedCommunities ||
          [],

        radius:
          Number(
            state.radius ||
              5
          ),
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          cleanState
        )
      );
    } catch (
      error
    ) {
      console.warn(
        "NEARBY SAVE ERROR:",
        error
      );
    }
  }, [state]);

  /* =======================================================
     LIVE SAVED SYNC
  ======================================================= */

  useEffect(() => {
    const unsubscribe =
      subscribeSavedItems(
        () => {
          setSavedVersion(
            (
              previous
            ) =>
              previous +
              1
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /* =======================================================
     OPEN PLACE FROM SAVED
  ======================================================= */

  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem(
          "yatut-open-route-payload"
        );

      if (
        !raw
      ) {
        return;
      }

      const parsed =
        JSON.parse(
          raw
        );

      if (
        parsed?.route !==
        "nearby"
      ) {
        return;
      }

      const placeId =
        parsed
          ?.payload
          ?.placeId;

      if (
        !placeId
      ) {
        return;
      }

      const exists =
        PLACES.some(
          (
            place
          ) =>
            place.id ===
            placeId
        );

      if (
        exists
      ) {
        setSelectedPlaceId(
          placeId
        );

        setTab(
          "places"
        );

        setSearch("");
      }

      sessionStorage.removeItem(
        "yatut-open-route-payload"
      );
    } catch (
      error
    ) {
      console.warn(
        "NEARBY ROUTE PAYLOAD ERROR:",
        error
      );
    }
  }, []);

  /* =======================================================
     QUERY
  ======================================================= */

  const query =
    search
      .trim()
      .toLowerCase();

  /* =======================================================
     FILTER PEOPLE
  ======================================================= */

  const filteredPeople =
    useMemo(
      () =>
        PEOPLE.filter(
          (
            item
          ) =>
            item.distance <=
              state.radius &&
            (!query ||
              [
                item.name,
                item.username,
                item.description,
                item.city,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase()
                .includes(
                  query
                ))
        ),
      [
        query,
        state.radius,
      ]
    );

  /* =======================================================
     FILTER EVENTS
  ======================================================= */

  const filteredEvents =
    useMemo(
      () =>
        EVENTS.filter(
          (
            item
          ) =>
            item.distance <=
              state.radius &&
            (!query ||
              [
                item.title,
                item.place,
                item.date,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase()
                .includes(
                  query
                ))
        ),
      [
        query,
        state.radius,
      ]
    );

  /* =======================================================
     FILTER PLACES
  ======================================================= */

  const filteredPlaces =
    useMemo(
      () =>
        PLACES.filter(
          (
            item
          ) =>
            item.distance <=
              state.radius &&
            (!query ||
              [
                item.title,
                item.category,
                item.description,
                item.address,
                item.city,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase()
                .includes(
                  query
                ))
        ),
      [
        query,
        state.radius,
      ]
    );

  /* =======================================================
     FILTER COMMUNITIES
  ======================================================= */

  const filteredCommunities =
    useMemo(
      () =>
        COMMUNITIES.filter(
          (
            item
          ) =>
            item.distance <=
              state.radius &&
            (!query ||
              [
                item.title,
                item.description,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase()
                .includes(
                  query
                ))
        ),
      [
        query,
        state.radius,
      ]
    );

  /* =======================================================
     SELECTED PLACE
  ======================================================= */

  const selectedPlace =
    useMemo(
      () =>
        PLACES.find(
          (
            place
          ) =>
            place.id ===
            selectedPlaceId
        ) ||
        null,
      [
        selectedPlaceId,
      ]
    );

  /* =======================================================
     LOCATION
  ======================================================= */

  function detectLocation() {
    if (
      !navigator.geolocation
    ) {
      setLocationStatus(
        "Геолокація недоступна"
      );

      return;
    }

    setLocating(
      true
    );

    navigator.geolocation.getCurrentPosition(
      () => {
        /*
          На цьому етапі координати нікому
          не показуємо і не зберігаємо.
        */

        setLocationStatus(
          "Поточна локація"
        );

        setLocating(
          false
        );
      },

      () => {
        setLocationStatus(
          "Київ"
        );

        setLocating(
          false
        );
      },

      {
        enableHighAccuracy:
          false,

        timeout:
          7000,

        maximumAge:
          300000,
      }
    );
  }

  /* =======================================================
     FOLLOW PERSON
  ======================================================= */

  function togglePeople(
    id
  ) {
    setState(
      (
        previous
      ) => ({
        ...previous,

        followedPeople:
          toggleArray(
            previous.followedPeople ||
              [],
            id
          ),
      })
    );
  }

  /* =======================================================
     EVENT INTEREST
  ======================================================= */

  function toggleEvent(
    id
  ) {
    setState(
      (
        previous
      ) => ({
        ...previous,

        interestedEvents:
          toggleArray(
            previous.interestedEvents ||
              [],
            id
          ),
      })
    );
  }

  /* =======================================================
     COMMUNITY JOIN
  ======================================================= */

  function toggleCommunity(
    id
  ) {
    setState(
      (
        previous
      ) => ({
        ...previous,

        joinedCommunities:
          toggleArray(
            previous.joinedCommunities ||
              [],
            id
          ),
      })
    );
  }

  /* =======================================================
     SAVE PLACE
  ======================================================= */

  function togglePlaceSaved(
    place
  ) {
    toggleSaved(
      createSavedPlace(
        place
      )
    );

    setSavedVersion(
      (
        previous
      ) =>
        previous +
        1
    );
  }

  /* =======================================================
     OPEN PLACE
  ======================================================= */

  function openPlace(
    place
  ) {
    setSelectedPlaceId(
      place.id
    );

    window.scrollTo({
      top: 0,
      behavior:
        "auto",
    });
  }

  function closePlace() {
    setSelectedPlaceId(
      null
    );

    window.scrollTo({
      top: 0,
      behavior:
        "auto",
    });
  }

  if (
    authSession?.user?.id
  ) {
    return (
      <section className="feature-page nearby-page">
        <header className="feature-hero nearby-hero">
          <div>
            <span>
              ЯТУТ ПОРУЧ
            </span>

            <h1>
              Поруч готується
            </h1>

            <p>
              Ми не показуємо вигадані місця, людей чи відстані. Реальний локальний пошук зʼявиться після підключення серверних даних і приватної геолокації.
            </p>
          </div>

          <div className="feature-hero-icon">
            <YatutIcon
              name="nearby"
              size={34}
            />
          </div>
        </header>

        <section className="feature-real-state">
          <div className="feature-real-state__icon">
            <YatutIcon
              name="nearby"
              size={28}
            />
          </div>

          <span>
            REAL DATA ONLY
          </span>

          <h2>
            Жодних demo-точок на карті
          </h2>

          <p>
            Поки backend «Поруч» не підключений, ЯТУТ не буде видавати тестові кавʼярні, людей чи події за справжні.
          </p>

          <div className="feature-real-state__actions">
            <button
              type="button"
              className="feature-primary-button"
              onClick={() =>
                onNavigate?.(
                  "search"
                )
              }
            >
              Знайти людей
            </button>

            <button
              type="button"
              className="feature-secondary-button"
              onClick={() =>
                onNavigate?.(
                  "communities"
                )
              }
            >
              Спільноти
            </button>
          </div>
        </section>
      </section>
    );
  }

  /* =======================================================
     PLACE DETAIL
  ======================================================= */

  if (
    selectedPlace
  ) {
    return (
      <PlaceDetail
        key={`${selectedPlace.id}-${savedVersion}`}
        place={
          selectedPlace
        }
        saved={isSaved(
          "place",
          selectedPlace.id
        )}
        onBack={
          closePlace
        }
        onSave={() =>
          togglePlaceSaved(
            selectedPlace
          )
        }
        onEvents={() =>
          onNavigate?.(
            "events"
          )
        }
      />
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <section className="feature-page nearby-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <header className="feature-hero nearby-hero">
        <div>
          <span>
            ЯТУТ ПОРУЧ
          </span>

          <h1>
            Що відбувається поруч
          </h1>

          <p>
            Люди, події, місця та спільноти навколо вас.
            ЯТУТ використовує приблизну локацію для рекомендацій,
            але не показує іншим користувачам ваші точні координати.
          </p>
        </div>

        <div className="feature-hero-icon">
          <YatutIcon
            name="nearby"
            size={34}
          />
        </div>
      </header>

      {/* ===================================================
          LIVE NEARBY
      =================================================== */}

      <section className="nearby-live-strip">
        <div className="nearby-live-strip__lead">
          <span className="nearby-live-strip__pulse">
            <i />
            <YatutIcon
              name="pulse"
              size={20}
            />
          </span>

          <div>
            <small>
              ПОРУЧ ПРЯМО ЗАРАЗ
            </small>

            <strong>
              Київ живе навколо тебе
            </strong>

            <p>
              Люди, моменти та події в межах {
                state.radius
              } км.
            </p>
          </div>
        </div>

        <div className="nearby-live-strip__stats">
          <button
            type="button"
            onClick={() =>
              setTab(
                "people"
              )
            }
          >
            <strong>
              428
            </strong>

            <span>
              людей
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "friends"
              )
            }
          >
            <strong>
              12
            </strong>

            <span>
              друзів
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "pulse"
              )
            }
          >
            <strong>
              8
            </strong>

            <span>
              моментів
            </span>
          </button>
        </div>

        <button
          type="button"
          className="nearby-live-strip__action"
          onClick={() =>
            onNavigate?.(
              "cityPulse",
              {
                cityId:
                  "kyiv",
              }
            )
          }
        >
          <span>
            PULSE Києва
          </span>

          <YatutIcon
            name="arrowRight"
            size={17}
          />
        </button>
      </section>

      {/* ===================================================
          LOCATION
      =================================================== */}

      <section className="nearby-toolbar">
        <button
          className="nearby-location"
          type="button"
          onClick={
            detectLocation
          }
        >
          <span>
            <YatutIcon
              name="pin"
              size={18}
            />
          </span>

          <div>
            <small>
              Ваша зона
            </small>

            <strong>
              {locating
                ? "Визначаємо..."
                : locationStatus}
            </strong>
          </div>

          <b>
            {locating
              ? "..."
              : "Визначити"}
          </b>
        </button>

        <label className="nearby-radius">
          <span>
            Радіус пошуку
          </span>

          <select
            value={
              state.radius
            }
            onChange={(
              event
            ) =>
              setState(
                (
                  previous
                ) => ({
                  ...previous,

                  radius:
                    Number(
                      event
                        .target
                        .value
                    ),
                })
              )
            }
          >
            <option value={2}>
              2 км
            </option>

            <option value={5}>
              5 км
            </option>

            <option value={10}>
              10 км
            </option>

            <option value={25}>
              25 км
            </option>
          </select>
        </label>
      </section>

      {/* ===================================================
          SEARCH
      =================================================== */}

      <label className="feature-search">
        <YatutIcon
          name="search"
          size={20}
        />

        <input
          value={
            search
          }
          onChange={(
            event
          ) =>
            setSearch(
              event
                .target
                .value
            )
          }
          placeholder="Пошук людей, подій, місць..."
        />

        {search && (
          <button
            className="saved-search-clear"
            type="button"
            onClick={() =>
              setSearch("")
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

      {/* ===================================================
          TABS
      =================================================== */}

      <nav className="feature-tabs nearby-tabs">
        {TABS.map(
          (
            item
          ) => (
            <button
              key={
                item.id
              }
              className={
                tab ===
                item.id
                  ? "active"
                  : ""
              }
              type="button"
              onClick={() =>
                setTab(
                  item.id
                )
              }
            >
              {
                item.title
              }

              {item.id ===
                "places" &&
                PLACES.filter(
                  (
                    place
                  ) =>
                    isSaved(
                      "place",
                      place.id
                    )
                ).length >
                  0 && (
                  <small>
                    {
                      PLACES.filter(
                        (
                          place
                        ) =>
                          isSaved(
                            "place",
                            place.id
                          )
                      ).length
                    }
                  </small>
                )}
            </button>
          )
        )}
      </nav>

      {/* ===================================================
          PEOPLE
      =================================================== */}

      {(tab ===
        "all" ||
        tab ===
          "people") && (
        <FeatureSection
          icon="friends"
          eyebrow="ЛЮДИ ПОРУЧ"
          title="Можливо, ви захочете познайомитися"
          action="Усі друзі"
          onAction={() =>
            onNavigate?.(
              "friends"
            )
          }
        >
          {filteredPeople.length ? (
            <div className="nearby-people-grid">
              {filteredPeople.map(
                (
                  person
                ) => {
                  const active =
                    state.followedPeople.includes(
                      person.id
                    );

                  return (
                    <article
                      key={
                        person.id
                      }
                      className="nearby-person-card"
                    >
                      <div className="nearby-person-avatar">
                        {
                          person.initials
                        }

                        {person.online && (
                          <i />
                        )}
                      </div>

                      <strong>
                        {
                          person.name
                        }
                      </strong>

                      <span>
                        @
                        {
                          person.username
                        }
                      </span>

                      <p>
                        {
                          person.description
                        }
                      </p>

                      <div className="nearby-tags">
                        <small>
                          <YatutIcon
                            name="pin"
                            size={13}
                          />

                          {
                            person.distance
                          }{" "}
                          км
                        </small>

                        <small>
                          <YatutIcon
                            name="friends"
                            size={13}
                          />

                          {
                            person.mutual
                          }{" "}
                          спільних
                        </small>
                      </div>

                      <button
                        className={
                          active
                            ? "feature-secondary-button active"
                            : "feature-primary-button"
                        }
                        type="button"
                        onClick={() =>
                          togglePeople(
                            person.id
                          )
                        }
                      >
                        {active
                          ? "Ви підписані"
                          : "Підписатися"}
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <InlineEmpty
              text="Людей за цими параметрами не знайдено."
            />
          )}
        </FeatureSection>
      )}

      {/* ===================================================
          EVENTS
      =================================================== */}

      {(tab ===
        "all" ||
        tab ===
          "events") && (
        <FeatureSection
          icon="events"
          eyebrow="ПОДІЇ"
          title="Сьогодні та найближчими днями"
          action="Усі події"
          onAction={() =>
            onNavigate?.(
              "events"
            )
          }
        >
          {filteredEvents.length ? (
            <div className="nearby-list">
              {filteredEvents.map(
                (
                  event
                ) => {
                  const active =
                    state.interestedEvents.includes(
                      event.id
                    );

                  return (
                    <article
                      key={
                        event.id
                      }
                      className="nearby-list-card"
                    >
                      <div className="feature-item-icon">
                        <YatutIcon
                          name="events"
                          size={21}
                        />
                      </div>

                      <div className="nearby-list-content">
                        <span>
                          {
                            event.date
                          }{" "}
                          •{" "}
                          {
                            event.time
                          }
                        </span>

                        <strong>
                          {
                            event.title
                          }
                        </strong>

                        <p>
                          {
                            event.place
                          }{" "}
                          •{" "}
                          {
                            event.distance
                          }{" "}
                          км
                        </p>

                        <small>
                          {
                            event.people
                          }{" "}
                          учасників
                        </small>
                      </div>

                      <button
                        className={
                          active
                            ? "feature-secondary-button active"
                            : "feature-primary-button"
                        }
                        type="button"
                        onClick={() =>
                          toggleEvent(
                            event.id
                          )
                        }
                      >
                        <YatutIcon
                          name="heart"
                          size={15}
                        />

                        {active
                          ? "Цікавить"
                          : "Цікавить"}
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <InlineEmpty
              text="Подій у вибраному радіусі поки немає."
            />
          )}
        </FeatureSection>
      )}

      {/* ===================================================
          PLACES
      =================================================== */}

      {(tab ===
        "all" ||
        tab ===
          "places") && (
        <FeatureSection
          icon="pin"
          eyebrow="МІСЦЯ"
          title="Популярні місця неподалік"
        >
          {filteredPlaces.length ? (
            <div className="nearby-place-grid">
              {filteredPlaces.map(
                (
                  place
                ) => {
                  const saved =
                    isSaved(
                      "place",
                      place.id
                    );

                  return (
                    <article
                      key={`${place.id}-${savedVersion}`}
                      className="nearby-place-card nearby-place-card-v2"
                    >
                      <button
                        className="nearby-place-cover nearby-place-cover-button"
                        type="button"
                        onClick={() =>
                          openPlace(
                            place
                          )
                        }
                      >
                        <YatutIcon
                          name="pin"
                          size={30}
                        />

                        <span>
                          Відкрити
                        </span>
                      </button>

                      <section>
                        <div>
                          <span>
                            {
                              place.category
                            }
                          </span>

                          <small
                            className={
                              place.open
                                ? "open"
                                : ""
                            }
                          >
                            {place.open
                              ? "Відкрито"
                              : "Зачинено"}
                          </small>
                        </div>

                        <button
                          className="nearby-place-name"
                          type="button"
                          onClick={() =>
                            openPlace(
                              place
                            )
                          }
                        >
                          <h3>
                            {
                              place.title
                            }
                          </h3>
                        </button>

                        <p>
                          {
                            place.description
                          }
                        </p>

                        <div className="nearby-place-meta">
                          <span>
                            ★{" "}
                            {
                              place.rating
                            }
                          </span>

                          <span>
                            {
                              place.distance
                            }{" "}
                            км
                          </span>

                          <span>
                            {
                              place.reviews
                            }{" "}
                            відгуків
                          </span>
                        </div>

                        <div className="nearby-place-actions">
                          <button
                            className={
                              saved
                                ? "feature-secondary-button active"
                                : "feature-secondary-button"
                            }
                            type="button"
                            onClick={() =>
                              togglePlaceSaved(
                                place
                              )
                            }
                          >
                            <YatutIcon
                              name="saved"
                              size={16}
                            />

                            {saved
                              ? "Збережено"
                              : "Зберегти"}
                          </button>

                          <button
                            className="feature-icon-button"
                            type="button"
                            onClick={() =>
                              openPlace(
                                place
                              )
                            }
                            aria-label="Відкрити місце"
                          >
                            <YatutIcon
                              name="arrowRight"
                              size={17}
                            />
                          </button>
                        </div>
                      </section>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <InlineEmpty
              text="Місць за вашим запитом не знайдено."
            />
          )}
        </FeatureSection>
      )}

      {/* ===================================================
          COMMUNITIES
      =================================================== */}

      {(tab ===
        "all" ||
        tab ===
          "communities") && (
        <FeatureSection
          icon="community"
          eyebrow="СПІЛЬНОТИ ПОРУЧ"
          title="Ваш район, місто та інтереси"
          action="Усі спільноти"
          onAction={() =>
            onNavigate?.(
              "communities"
            )
          }
        >
          {filteredCommunities.length ? (
            <div className="nearby-community-grid">
              {filteredCommunities.map(
                (
                  community
                ) => {
                  const joined =
                    state.joinedCommunities.includes(
                      community.id
                    );

                  return (
                    <article
                      key={
                        community.id
                      }
                      className="nearby-community-card"
                    >
                      <div className="feature-item-icon large">
                        <YatutIcon
                          name="community"
                          size={25}
                        />
                      </div>

                      <section>
                        <strong>
                          {
                            community.title
                          }
                        </strong>

                        <p>
                          {
                            community.description
                          }
                        </p>

                        <span>
                          {formatMembers(
                            community.members
                          )}{" "}
                          учасників •{" "}
                          {
                            community.distance
                          }{" "}
                          км
                        </span>
                      </section>

                      <button
                        className={
                          joined
                            ? "feature-secondary-button active"
                            : "feature-primary-button"
                        }
                        type="button"
                        onClick={() =>
                          toggleCommunity(
                            community.id
                          )
                        }
                      >
                        {joined
                          ? "Ви учасник"
                          : "Приєднатися"}
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <InlineEmpty
              text="Спільнот поруч поки не знайдено."
            />
          )}
        </FeatureSection>
      )}
    </section>
  );
}

/* =========================================================
   PLACE DETAIL
========================================================= */

function PlaceDetail({
  place,
  saved,
  onBack,
  onSave,
  onEvents,
}) {
  return (
    <section className="feature-page nearby-place-detail-page">
      {/* ===================================================
          BACK
      =================================================== */}

      <button
        className="business-detail-back"
        type="button"
        onClick={
          onBack
        }
      >
        <YatutIcon
          name="chevronRight"
          size={17}
        />

        Назад до Поруч
      </button>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="nearby-place-detail-hero">
        <div className="nearby-place-detail-cover">
          <YatutIcon
            name="pin"
            size={42}
          />
        </div>

        <div className="nearby-place-detail-info">
          <section>
            <span>
              {
                place.category
              }{" "}
              •{" "}
              {
                place.city
              }
            </span>

            <h1>
              {
                place.title
              }
            </h1>

            <p>
              {
                place.description
              }
            </p>
          </section>

          <div>
            <button
              className={
                saved
                  ? "feature-secondary-button active"
                  : "feature-primary-button"
              }
              type="button"
              onClick={
                onSave
              }
            >
              <YatutIcon
                name="saved"
                size={16}
              />

              {saved
                ? "Збережено"
                : "Зберегти"}
            </button>
          </div>
        </div>

        <div className="nearby-place-detail-stats">
          <article>
            <strong>
              ★{" "}
              {
                place.rating
              }
            </strong>

            <span>
              рейтинг
            </span>
          </article>

          <article>
            <strong>
              {
                place.distance
              }{" "}
              км
            </strong>

            <span>
              від вас
            </span>
          </article>

          <article>
            <strong>
              {
                place.reviews
              }
            </strong>

            <span>
              відгуків
            </span>
          </article>

          <article>
            <strong
              className={
                place.open
                  ? "nearby-open"
                  : ""
              }
            >
              {place.open
                ? "Відкрито"
                : "Зачинено"}
            </strong>

            <span>
              {
                place.hours
              }
            </span>
          </article>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="nearby-place-detail-grid">
        <section className="feature-section">
          <header className="feature-section-header">
            <div className="feature-section-title">
              <div>
                <YatutIcon
                  name="pin"
                  size={19}
                />
              </div>

              <section>
                <span>
                  ПРО МІСЦЕ
                </span>

                <h2>
                  Інформація
                </h2>
              </section>
            </div>
          </header>

          <div className="nearby-place-info-list">
            <article>
              <YatutIcon
                name="pin"
                size={18}
              />

              <section>
                <span>
                  Адреса
                </span>

                <strong>
                  {
                    place.address
                  }
                </strong>
              </section>
            </article>

            <article>
              <YatutIcon
                name="schedule"
                size={18}
              />

              <section>
                <span>
                  Графік
                </span>

                <strong>
                  {
                    place.hours
                  }
                </strong>
              </section>
            </article>

            <article>
              <YatutIcon
                name="friends"
                size={18}
              />

              <section>
                <span>
                  Відгуки
                </span>

                <strong>
                  {
                    place.reviews
                  }{" "}
                  користувачів
                </strong>
              </section>
            </article>
          </div>
        </section>

        <section className="feature-section">
          <header className="feature-section-header">
            <div className="feature-section-title">
              <div>
                <YatutIcon
                  name="community"
                  size={19}
                />
              </div>

              <section>
                <span>
                  МОЖЛИВОСТІ
                </span>

                <h2>
                  Тут є
                </h2>
              </section>
            </div>
          </header>

          <div className="nearby-place-features">
            {(place.features ||
              []).map(
              (
                item
              ) => (
                <span
                  key={
                    item
                  }
                >
                  ✓

                  {
                    item
                  }
                </span>
              )
            )}
          </div>

          <button
            className="feature-primary-button nearby-place-event-button"
            type="button"
            onClick={
              onEvents
            }
          >
            <YatutIcon
              name="events"
              size={16}
            />

            Події поруч
          </button>
        </section>
      </div>
    </section>
  );
}

/* =========================================================
   FEATURE SECTION
========================================================= */

function FeatureSection({
  icon,
  eyebrow,
  title,
  action,
  onAction,
  children,
}) {
  return (
    <section className="feature-section">
      <header className="feature-section-header">
        <div className="feature-section-title">
          <div>
            <YatutIcon
              name={
                icon
              }
              size={19}
            />
          </div>

          <section>
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
          </section>
        </div>

        {action && (
          <button
            type="button"
            onClick={
              onAction
            }
          >
            {
              action
            }

            <YatutIcon
              name="arrowRight"
              size={15}
            />
          </button>
        )}
      </header>

      {children}
    </section>
  );
}

/* =========================================================
   INLINE EMPTY
========================================================= */

function InlineEmpty({
  text,
}) {
  return (
    <div className="nearby-inline-empty">
      <YatutIcon
        name="search"
        size={23}
      />

      <span>
        {text}
      </span>
    </div>
  );
}