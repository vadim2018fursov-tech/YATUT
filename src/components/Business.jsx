import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./FeaturePages.css";

import YatutIcon from "./YatutIcon";

import {
  createSavedBusiness,
  isSaved,
  subscribeSavedItems,
  toggleSaved,
} from "../storage/savedService";

/* =========================================================
   YATUT BUSINESS V2

   Підтримує:
   - каталог бізнесів
   - категорії
   - пошук
   - підписки
   - збереження через savedService
   - live sync із Saved.jsx
   - створення власного бізнесу
   - вкладку "Мій бізнес"
   - картку бізнесу
   - детальний перегляд бізнесу
========================================================= */

const STORAGE_KEY =
  "yatut-business-v2";

/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES = [
  "Усі",
  "Краса",
  "Їжа",
  "Технології",
  "Навчання",
  "Спорт",
  "Послуги",
];

/* =========================================================
   DEMO BUSINESSES
========================================================= */

const DEMO_BUSINESSES = [
  {
    id: "business-1",

    name:
      "Black Line Tattoo",

    username:
      "blackline",

    initials:
      "BL",

    category:
      "Краса",

    city:
      "Київ",

    address:
      "Поділ, Київ",

    rating:
      4.9,

    reviews:
      182,

    followers:
      4820,

    verified:
      true,

    owner:
      "demo",

    phone:
      "+380 67 000 00 01",

    website:
      "blackline.ua",

    description:
      "Тату-студія. Реалізм, японський стиль та авторські роботи.",

    services: [
      {
        id:
          "business-1-service-1",

        title:
          "Реалізм",

        price:
          "від 3000 ₴",
      },

      {
        id:
          "business-1-service-2",

        title:
          "Японський стиль",

        price:
          "від 3500 ₴",
      },

      {
        id:
          "business-1-service-3",

        title:
          "Консультація",

        price:
          "Безкоштовно",
      },
    ],
  },

  {
    id: "business-2",

    name:
      "Tech Point",

    username:
      "techpoint",

    initials:
      "TP",

    category:
      "Технології",

    city:
      "Київ",

    address:
      "Центр, Київ",

    rating:
      4.8,

    reviews:
      941,

    followers:
      15400,

    verified:
      true,

    owner:
      "demo",

    phone:
      "+380 67 000 00 02",

    website:
      "techpoint.ua",

    description:
      "Техніка, аксесуари, налаштування та сервіс.",

    services: [
      {
        id:
          "business-2-service-1",

        title:
          "Налаштування смартфона",

        price:
          "від 499 ₴",
      },

      {
        id:
          "business-2-service-2",

        title:
          "Захист пристрою",

        price:
          "від 399 ₴",
      },

      {
        id:
          "business-2-service-3",

        title:
          "Перенесення даних",

        price:
          "від 599 ₴",
      },
    ],
  },

  {
    id: "business-3",

    name:
      "Morning Coffee",

    username:
      "morningcoffee",

    initials:
      "MC",

    category:
      "Їжа",

    city:
      "Київ",

    address:
      "вул. Велика Васильківська",

    rating:
      4.7,

    reviews:
      366,

    followers:
      8100,

    verified:
      false,

    owner:
      "demo",

    phone:
      "+380 67 000 00 03",

    website:
      "morningcoffee.ua",

    description:
      "Кава, сніданки та затишне місце для роботи.",

    services: [
      {
        id:
          "business-3-service-1",

        title:
          "Капучино",

        price:
          "95 ₴",
      },

      {
        id:
          "business-3-service-2",

        title:
          "Сніданок",

        price:
          "від 180 ₴",
      },

      {
        id:
          "business-3-service-3",

        title:
          "Бізнес-ланч",

        price:
          "від 240 ₴",
      },
    ],
  },

  {
    id: "business-4",

    name:
      "Fit Space",

    username:
      "fitspace",

    initials:
      "FS",

    category:
      "Спорт",

    city:
      "Київ",

    address:
      "Оболонь, Київ",

    rating:
      4.6,

    reviews:
      219,

    followers:
      5360,

    verified:
      false,

    owner:
      "demo",

    phone:
      "+380 67 000 00 04",

    website:
      "fitspace.ua",

    description:
      "Фітнес, персональні тренування та групові заняття.",

    services: [
      {
        id:
          "business-4-service-1",

        title:
          "Разове тренування",

        price:
          "350 ₴",
      },

      {
        id:
          "business-4-service-2",

        title:
          "Абонемент",

        price:
          "від 1500 ₴",
      },

      {
        id:
          "business-4-service-3",

        title:
          "Персональний тренер",

        price:
          "від 700 ₴",
      },
    ],
  },
];

/* =========================================================
   DEFAULT STATE
========================================================= */

const DEFAULT_STATE = {
  followed: [],

  created: [],
};

/* =========================================================
   HELPERS
========================================================= */

function loadState() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...DEFAULT_STATE,
      ...parsed,

      followed:
        Array.isArray(
          parsed.followed
        )
          ? parsed.followed
          : [],

      created:
        Array.isArray(
          parsed.created
        )
          ? parsed.created
          : [],
    };
  } catch (
    error
  ) {
    console.warn(
      "BUSINESS LOAD ERROR:",
      error
    );

    return DEFAULT_STATE;
  }
}

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

function followersLabel(
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

function createUsername(
  name,
  username
) {
  const source =
    (
      username ||
      name ||
      ""
    )
      .trim()
      .toLowerCase();

  const clean =
    source
      .replace(
        /\s+/g,
        "."
      )
      .replace(
        /[^a-z0-9._]/g,
        ""
      )
      .replace(
        /\.+/g,
        "."
      )
      .replace(
        /^\./,
        ""
      )
      .replace(
        /\.$/,
        ""
      );

  return (
    clean ||
    `business.${Date.now()}`
  );
}

function createInitials(
  name
) {
  const words =
    String(
      name ||
      ""
    )
      .trim()
      .split(
        /\s+/
      )
      .filter(
        Boolean
      )
      .slice(
        0,
        2
      );

  if (
    !words.length
  ) {
    return "Б";
  }

  return words
    .map(
      (word) =>
        word[0]
    )
    .join("")
    .toUpperCase();
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Business({
  onNavigate,
}) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState(
      "Усі"
    );

  const [
    tab,
    setTab,
  ] =
    useState(
      "discover"
    );

  const [
    state,
    setState,
  ] =
    useState(
      loadState
    );

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(
      false
    );

  const [
    selectedBusinessId,
    setSelectedBusinessId,
  ] =
    useState(
      null
    );

  const [
    savedVersion,
    setSavedVersion,
  ] =
    useState(
      0
    );

  /* =======================================================
     SAVE BUSINESS STATE
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          state
        )
      );
    } catch (
      error
    ) {
      console.warn(
        "BUSINESS SAVE ERROR:",
        error
      );
    }
  }, [state]);

  /* =======================================================
     LIVE SYNC WITH SAVED SERVICE
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
     ALL BUSINESSES
  ======================================================= */

  const businesses =
    useMemo(
      () => [
        ...state.created,

        ...DEMO_BUSINESSES,
      ],
      [
        state.created,
      ]
    );

  /* =======================================================
     OPEN PAYLOAD FROM SAVED
  ======================================================= */

  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem(
          "yatut-open-route-payload"
        );

      if (!raw) {
        return;
      }

      const parsed =
        JSON.parse(raw);

      if (
        parsed?.route !==
        "business"
      ) {
        return;
      }

      const businessId =
        parsed?.payload
          ?.businessId;

      if (
        !businessId
      ) {
        return;
      }

      const exists =
        businesses.some(
          (item) =>
            item.id ===
            businessId
        );

      if (
        exists
      ) {
        setSelectedBusinessId(
          businessId
        );
      }

      sessionStorage.removeItem(
        "yatut-open-route-payload"
      );
    } catch (
      error
    ) {
      console.warn(
        "BUSINESS ROUTE PAYLOAD ERROR:",
        error
      );
    }
  }, [businesses]);

  /* =======================================================
     FILTERED BUSINESS
  ======================================================= */

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return businesses.filter(
        (
          item
        ) => {
          const categoryMatch =
            category ===
              "Усі" ||
            item.category ===
              category;

          const searchMatch =
            !query ||
            [
              item.name,
              item.username,
              item.category,
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
              );

          const tabMatch =
            tab ===
              "discover" ||
            (tab ===
              "following" &&
              state.followed.includes(
                item.id
              )) ||
            (tab ===
              "mine" &&
              item.owner ===
                "me");

          return (
            categoryMatch &&
            searchMatch &&
            tabMatch
          );
        }
      );
    }, [
      businesses,
      category,
      search,
      state.followed,
      tab,
    ]);

  /* =======================================================
     SELECTED BUSINESS
  ======================================================= */

  const selectedBusiness =
    useMemo(
      () =>
        businesses.find(
          (item) =>
            item.id ===
            selectedBusinessId
        ) ||
        null,
      [
        businesses,
        selectedBusinessId,
      ]
    );

  /* =======================================================
     FOLLOW
  ======================================================= */

  function followBusiness(
    id
  ) {
    setState(
      (
        previous
      ) => ({
        ...previous,

        followed:
          toggleArray(
            previous.followed,
            id
          ),
      })
    );
  }

  /* =======================================================
     SAVE / UNSAVE
  ======================================================= */

  function toggleBusinessSaved(
    business
  ) {
    const savedItem =
      createSavedBusiness(
        business
      );

    toggleSaved(
      savedItem
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
     CREATE BUSINESS
  ======================================================= */

  function createBusiness(
    business
  ) {
    setState(
      (
        previous
      ) => ({
        ...previous,

        created: [
          business,
          ...previous.created,
        ],
      })
    );

    setCreateOpen(
      false
    );

    setTab(
      "mine"
    );

    setSelectedBusinessId(
      business.id
    );
  }

  /* =======================================================
     MESSAGE
  ======================================================= */

  function openBusinessChat(
    business
  ) {
    try {
      sessionStorage.setItem(
        "yatut-business-chat",
        JSON.stringify({
          businessId:
            business.id,

          businessName:
            business.name,

          createdAt:
            Date.now(),
        })
      );
    } catch (
      error
    ) {
      console.warn(
        "BUSINESS CHAT PAYLOAD ERROR:",
        error
      );
    }

    onNavigate?.(
      "chats"
    );
  }

  /* =======================================================
     OPEN BUSINESS
  ======================================================= */

  function openBusiness(
    business
  ) {
    setSelectedBusinessId(
      business.id
    );

    window.scrollTo({
      top: 0,
      behavior:
        "auto",
    });
  }

  /* =======================================================
     BACK
  ======================================================= */

  function closeBusiness() {
    setSelectedBusinessId(
      null
    );

    window.scrollTo({
      top: 0,
      behavior:
        "auto",
    });
  }

  /* =======================================================
     DETAIL VIEW
  ======================================================= */

  if (
    selectedBusiness
  ) {
    return (
      <BusinessDetail
        business={
          selectedBusiness
        }
        following={
          state.followed.includes(
            selectedBusiness.id
          )
        }
        saved={isSaved(
          "business",
          selectedBusiness.id
        )}
        onBack={
          closeBusiness
        }
        onFollow={() =>
          followBusiness(
            selectedBusiness.id
          )
        }
        onSave={() =>
          toggleBusinessSaved(
            selectedBusiness
          )
        }
        onMessage={() =>
          openBusinessChat(
            selectedBusiness
          )
        }
      />
    );
  }

  /* =======================================================
     LIST VIEW
  ======================================================= */

  return (
    <section className="feature-page business-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <header className="feature-hero business-hero">
        <div>
          <span>
            ЯТУТ BUSINESS
          </span>

          <h1>
            Бізнес у ЯТУТ
          </h1>

          <p>
            Компанії, майстри, бренди та послуги.
            Знаходьте потрібне поруч або створюйте власну бізнес-сторінку.
          </p>
        </div>

        <div className="feature-hero-actions">
          <button
            className="feature-primary-button hero-button"
            type="button"
            onClick={() =>
              setCreateOpen(
                true
              )
            }
          >
            <YatutIcon
              name="plus"
              size={17}
            />

            Створити бізнес
          </button>

          <div className="feature-hero-icon">
            <YatutIcon
              name="business"
              size={34}
            />
          </div>
        </div>
      </header>

      {/* ===================================================
          STATS
      =================================================== */}

      <section className="business-dashboard">
        <article>
          <YatutIcon
            name="business"
            size={21}
          />

          <section>
            <strong>
              {
                businesses.length
              }
            </strong>

            <span>
              бізнесів
            </span>
          </section>
        </article>

        <article>
          <YatutIcon
            name="friends"
            size={21}
          />

          <section>
            <strong>
              {
                state.followed
                  .length
              }
            </strong>

            <span>
              підписок
            </span>
          </section>
        </article>

        <article>
          <YatutIcon
            name="saved"
            size={21}
          />

          <section>
            <strong>
              {
                businesses.filter(
                  (
                    item
                  ) =>
                    isSaved(
                      "business",
                      item.id
                    )
                )
                  .length
              }
            </strong>

            <span>
              збережено
            </span>
          </section>
        </article>

        <article>
          <YatutIcon
            name="analytics"
            size={21}
          />

          <section>
            <strong>
              {
                state.created
                  .length
              }
            </strong>

            <span>
              мої сторінки
            </span>
          </section>
        </article>
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
          placeholder="Пошук компаній, майстрів, послуг..."
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

      <nav className="feature-tabs business-tabs">
        <button
          className={
            tab ===
            "discover"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setTab(
              "discover"
            )
          }
        >
          Відкрити
        </button>

        <button
          className={
            tab ===
            "following"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setTab(
              "following"
            )
          }
        >
          Мої підписки

          {state.followed
            .length >
            0 && (
            <small>
              {
                state.followed
                  .length
              }
            </small>
          )}
        </button>

        <button
          className={
            tab ===
            "mine"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setTab(
              "mine"
            )
          }
        >
          Мій бізнес

          {state.created
            .length >
            0 && (
            <small>
              {
                state.created
                  .length
              }
            </small>
          )}
        </button>
      </nav>

      {/* ===================================================
          CATEGORIES
      =================================================== */}

      <div className="business-category-row">
        {CATEGORIES.map(
          (
            item
          ) => (
            <button
              key={
                item
              }
              className={
                category ===
                item
                  ? "active"
                  : ""
              }
              type="button"
              onClick={() =>
                setCategory(
                  item
                )
              }
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* ===================================================
          GRID
      =================================================== */}

      {filtered.length ? (
        <div className="business-grid">
          {filtered.map(
            (
              business
            ) => {
              const following =
                state.followed.includes(
                  business.id
                );

              const saved =
                isSaved(
                  "business",
                  business.id
                );

              return (
                <BusinessCard
                  key={`${business.id}-${savedVersion}`}
                  business={
                    business
                  }
                  following={
                    following
                  }
                  saved={
                    saved
                  }
                  onOpen={() =>
                    openBusiness(
                      business
                    )
                  }
                  onFollow={() =>
                    followBusiness(
                      business.id
                    )
                  }
                  onSave={() =>
                    toggleBusinessSaved(
                      business
                    )
                  }
                  onMessage={() =>
                    openBusinessChat(
                      business
                    )
                  }
                />
              );
            }
          )}
        </div>
      ) : (
        <BusinessEmpty
          tab={
            tab
          }
          search={
            search
          }
          onCreate={() =>
            setCreateOpen(
              true
            )
          }
          onReset={() => {
            setSearch("");

            setCategory(
              "Усі"
            );

            setTab(
              "discover"
            );
          }}
        />
      )}

      {/* ===================================================
          CREATE MODAL
      =================================================== */}

      {createOpen && (
        <CreateBusinessModal
          onClose={() =>
            setCreateOpen(
              false
            )
          }
          onCreate={
            createBusiness
          }
        />
      )}
    </section>
  );
}

/* =========================================================
   BUSINESS CARD
========================================================= */

function BusinessCard({
  business,
  following,
  saved,
  onOpen,
  onFollow,
  onSave,
  onMessage,
}) {
  return (
    <article className="business-card business-card-v2">
      {/* ===================================================
          COVER
      =================================================== */}

      <button
        className="business-card-cover business-card-cover-button"
        type="button"
        onClick={
          onOpen
        }
      >
        <div className="business-card-avatar">
          {
            business.initials
          }
        </div>

        {business.verified && (
          <span className="business-verified">
            ✓
          </span>
        )}

        <span className="business-open-overlay">
          Відкрити
        </span>
      </button>

      {/* ===================================================
          BODY
      =================================================== */}

      <section className="business-card-body">
        <div className="business-card-topline">
          <span>
            {
              business.category
            }{" "}
            •{" "}
            {
              business.city
            }
          </span>

          <button
            className={`business-save-mini ${
              saved
                ? "active"
                : ""
            }`}
            type="button"
            onClick={
              onSave
            }
            aria-label={
              saved
                ? "Видалити зі збереженого"
                : "Зберегти"
            }
          >
            <YatutIcon
              name="saved"
              size={17}
            />
          </button>
        </div>

        <button
          className="business-name-button"
          type="button"
          onClick={
            onOpen
          }
        >
          <h3>
            {
              business.name
            }

            {business.verified && (
              <span className="business-name-check">
                ✓
              </span>
            )}
          </h3>

          <small>
            @
            {
              business.username
            }
          </small>
        </button>

        <p>
          {
            business.description
          }
        </p>

        <div className="business-card-stats">
          <span>
            ★{" "}
            {
              business.rating
            }
          </span>

          <span>
            {
              business.reviews
            }{" "}
            відгуків
          </span>

          <span>
            {followersLabel(
              business.followers
            )}{" "}
            підписників
          </span>
        </div>

        <footer>
          <button
            className={
              following
                ? "feature-secondary-button active"
                : "feature-primary-button"
            }
            type="button"
            onClick={
              onFollow
            }
          >
            {following
              ? "Ви підписані"
              : "Підписатися"}
          </button>

          <button
            className="feature-icon-button"
            type="button"
            onClick={
              onMessage
            }
            aria-label="Написати"
          >
            <YatutIcon
              name="chats"
              size={18}
            />
          </button>

          <button
            className="feature-icon-button"
            type="button"
            onClick={
              onOpen
            }
            aria-label="Відкрити бізнес"
          >
            <YatutIcon
              name="arrowRight"
              size={18}
            />
          </button>
        </footer>

        {saved && (
          <div className="business-saved-label">
            <YatutIcon
              name="saved"
              size={13}
            />

            Збережено у ЯТУТ
          </div>
        )}
      </section>
    </article>
  );
}

/* =========================================================
   BUSINESS DETAIL
========================================================= */

function BusinessDetail({
  business,
  following,
  saved,
  onBack,
  onFollow,
  onSave,
  onMessage,
}) {
  const [
    section,
    setSection,
  ] =
    useState(
      "main"
    );

  return (
    <section className="feature-page business-detail-page">
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

        Назад до бізнесу
      </button>

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="business-profile-header">
        <div className="business-profile-cover">
          <div className="business-profile-avatar">
            {
              business.initials
            }
          </div>
        </div>

        <div className="business-profile-info">
          <section>
            <span>
              {
                business.category
              }{" "}
              •{" "}
              {
                business.city
              }
            </span>

            <h1>
              {
                business.name
              }

              {business.verified && (
                <i>
                  ✓
                </i>
              )}
            </h1>

            <small>
              @
              {
                business.username
              }
            </small>

            <p>
              {
                business.description
              }
            </p>
          </section>

          <div className="business-profile-actions">
            <button
              className={
                following
                  ? "feature-secondary-button active"
                  : "feature-primary-button"
              }
              type="button"
              onClick={
                onFollow
              }
            >
              <YatutIcon
                name="friends"
                size={16}
              />

              {following
                ? "Ви підписані"
                : "Підписатися"}
            </button>

            <button
              className="feature-secondary-button"
              type="button"
              onClick={
                onMessage
              }
            >
              <YatutIcon
                name="chats"
                size={16}
              />

              Написати
            </button>

            <button
              className={`feature-icon-button ${
                saved
                  ? "active"
                  : ""
              }`}
              type="button"
              onClick={
                onSave
              }
              aria-label="Зберегти"
            >
              <YatutIcon
                name="saved"
                size={18}
              />
            </button>
          </div>
        </div>

        <div className="business-profile-stats">
          <article>
            <strong>
              ★{" "}
              {
                business.rating
              }
            </strong>

            <span>
              рейтинг
            </span>
          </article>

          <article>
            <strong>
              {
                business.reviews
              }
            </strong>

            <span>
              відгуків
            </span>
          </article>

          <article>
            <strong>
              {followersLabel(
                business.followers
              )}
            </strong>

            <span>
              підписників
            </span>
          </article>
        </div>
      </section>

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav className="feature-tabs business-detail-tabs">
        <button
          className={
            section ===
            "main"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setSection(
              "main"
            )
          }
        >
          Головна
        </button>

        <button
          className={
            section ===
            "services"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setSection(
              "services"
            )
          }
        >
          Послуги
        </button>

        <button
          className={
            section ===
            "reviews"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setSection(
              "reviews"
            )
          }
        >
          Відгуки
        </button>

        <button
          className={
            section ===
            "contacts"
              ? "active"
              : ""
          }
          type="button"
          onClick={() =>
            setSection(
              "contacts"
            )
          }
        >
          Контакти
        </button>
      </nav>

      {/* ===================================================
          MAIN
      =================================================== */}

      {section ===
        "main" && (
        <div className="business-detail-grid">
          <section className="feature-section">
            <header className="feature-section-header">
              <div className="feature-section-title">
                <div>
                  <YatutIcon
                    name="business"
                    size={19}
                  />
                </div>

                <section>
                  <span>
                    ПРО БІЗНЕС
                  </span>

                  <h2>
                    {
                      business.name
                    }
                  </h2>
                </section>
              </div>
            </header>

            <div className="business-about">
              <p>
                {
                  business.description
                }
              </p>

              <div className="business-about-row">
                <YatutIcon
                  name="pin"
                  size={17}
                />

                <section>
                  <span>
                    Адреса
                  </span>

                  <strong>
                    {
                      business.address ||
                      business.city
                    }
                  </strong>
                </section>
              </div>

              <div className="business-about-row">
                <YatutIcon
                  name="friends"
                  size={17}
                />

                <section>
                  <span>
                    Підписники
                  </span>

                  <strong>
                    {followersLabel(
                      business.followers
                    )}
                  </strong>
                </section>
              </div>

              <div className="business-about-row">
                <YatutIcon
                  name="saved"
                  size={17}
                />

                <section>
                  <span>
                    Статус
                  </span>

                  <strong>
                    {saved
                      ? "Збережено у вашому ЯТУТ"
                      : "Не збережено"}
                  </strong>
                </section>
              </div>
            </div>
          </section>

          <section className="feature-section">
            <header className="feature-section-header">
              <div className="feature-section-title">
                <div>
                  <YatutIcon
                    name="analytics"
                    size={19}
                  />
                </div>

                <section>
                  <span>
                    АКТИВНІСТЬ
                  </span>

                  <h2>
                    У ЯТУТ
                  </h2>
                </section>
              </div>
            </header>

            <div className="business-activity-card">
              <strong>
                Бізнес-профіль активний
              </strong>

              <p>
                Пізніше сюди підключимо дописи бізнесу,
                Stories, акції, товари та статистику.
              </p>

              <button
                className="feature-primary-button"
                type="button"
                onClick={
                  onMessage
                }
              >
                <YatutIcon
                  name="chats"
                  size={16}
                />

                Написати бізнесу
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ===================================================
          SERVICES
      =================================================== */}

      {section ===
        "services" && (
        <section className="feature-section">
          <header className="feature-section-header">
            <div className="feature-section-title">
              <div>
                <YatutIcon
                  name="business"
                  size={19}
                />
              </div>

              <section>
                <span>
                  ПОСЛУГИ
                </span>

                <h2>
                  Що пропонує бізнес
                </h2>
              </section>
            </div>
          </header>

          <div className="business-services-grid">
            {(business.services ||
              []).map(
              (
                service
              ) => (
                <article
                  key={
                    service.id
                  }
                >
                  <div>
                    <YatutIcon
                      name="business"
                      size={20}
                    />
                  </div>

                  <section>
                    <strong>
                      {
                        service.title
                      }
                    </strong>

                    <span>
                      {
                        service.price
                      }
                    </span>
                  </section>

                  <button
                    className="feature-secondary-button"
                    type="button"
                    onClick={
                      onMessage
                    }
                  >
                    Запитати
                  </button>
                </article>
              )
            )}

            {!business
              .services
              ?.length && (
              <div className="feature-empty">
                <div>
                  <YatutIcon
                    name="business"
                    size={29}
                  />
                </div>

                <strong>
                  Послуг поки немає
                </strong>

                <p>
                  Власник ще не додав товари або послуги.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================================
          REVIEWS
      =================================================== */}

      {section ===
        "reviews" && (
        <section className="feature-section">
          <header className="feature-section-header">
            <div className="feature-section-title">
              <div>
                <YatutIcon
                  name="friends"
                  size={19}
                />
              </div>

              <section>
                <span>
                  ВІДГУКИ
                </span>

                <h2>
                  {
                    business.reviews
                  }{" "}
                  відгуків
                </h2>
              </section>
            </div>
          </header>

          <div className="business-reviews">
            <article>
              <div className="business-review-avatar">
                М
              </div>

              <section>
                <header>
                  <strong>
                    Марія Коваль
                  </strong>

                  <span>
                    ★★★★★
                  </span>
                </header>

                <p>
                  Дуже приємне обслуговування.
                  Все швидко та якісно.
                </p>
              </section>
            </article>

            <article>
              <div className="business-review-avatar">
                О
              </div>

              <section>
                <header>
                  <strong>
                    Олександр Бондар
                  </strong>

                  <span>
                    ★★★★★
                  </span>
                </header>

                <p>
                  Рекомендую. Хороша комунікація та сервіс.
                </p>
              </section>
            </article>
          </div>
        </section>
      )}

      {/* ===================================================
          CONTACTS
      =================================================== */}

      {section ===
        "contacts" && (
        <section className="feature-section">
          <header className="feature-section-header">
            <div className="feature-section-title">
              <div>
                <YatutIcon
                  name="chats"
                  size={19}
                />
              </div>

              <section>
                <span>
                  КОНТАКТИ
                </span>

                <h2>
                  Звʼязатися
                </h2>
              </section>
            </div>
          </header>

          <div className="business-contact-list">
            <article>
              <YatutIcon
                name="pin"
                size={19}
              />

              <section>
                <span>
                  Адреса
                </span>

                <strong>
                  {
                    business.address ||
                    business.city
                  }
                </strong>
              </section>
            </article>

            <article>
              <YatutIcon
                name="chats"
                size={19}
              />

              <section>
                <span>
                  Телефон
                </span>

                <strong>
                  {
                    business.phone ||
                    "Не вказано"
                  }
                </strong>
              </section>
            </article>

            <article>
              <YatutIcon
                name="business"
                size={19}
              />

              <section>
                <span>
                  Сайт
                </span>

                <strong>
                  {
                    business.website ||
                    "Не вказано"
                  }
                </strong>
              </section>
            </article>
          </div>

          <button
            className="feature-primary-button business-contact-message"
            type="button"
            onClick={
              onMessage
            }
          >
            <YatutIcon
              name="chats"
              size={16}
            />

            Написати у ЯТУТ
          </button>
        </section>
      )}
    </section>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function BusinessEmpty({
  tab,
  search,
  onCreate,
  onReset,
}) {
  if (
    tab === "mine"
  ) {
    return (
      <div className="feature-empty">
        <div>
          <YatutIcon
            name="business"
            size={29}
          />
        </div>

        <strong>
          У вас ще немає бізнес-сторінки
        </strong>

        <p>
          Створіть сторінку компанії, бренду,
          магазину або власних послуг.
        </p>

        <button
          className="feature-primary-button"
          type="button"
          onClick={
            onCreate
          }
        >
          <YatutIcon
            name="plus"
            size={16}
          />

          Створити бізнес
        </button>
      </div>
    );
  }

  if (
    tab ===
    "following"
  ) {
    return (
      <div className="feature-empty">
        <div>
          <YatutIcon
            name="friends"
            size={29}
          />
        </div>

        <strong>
          Підписок поки немає
        </strong>

        <p>
          Підписуйтеся на улюблені компанії,
          бренди та майстрів.
        </p>

        <button
          className="feature-primary-button"
          type="button"
          onClick={
            onReset
          }
        >
          Знайти бізнес
        </button>
      </div>
    );
  }

  return (
    <div className="feature-empty">
      <div>
        <YatutIcon
          name="search"
          size={29}
        />
      </div>

      <strong>
        Нічого не знайдено
      </strong>

      <p>
        {search
          ? "Спробуйте змінити пошуковий запит або категорію."
          : "У цій категорії поки немає бізнесів."}
      </p>

      <button
        className="feature-primary-button"
        type="button"
        onClick={
          onReset
        }
      >
        Показати все
      </button>
    </div>
  );
}

/* =========================================================
   CREATE BUSINESS MODAL
========================================================= */

function CreateBusinessModal({
  onClose,
  onCreate,
}) {
  const [
    name,
    setName,
  ] =
    useState("");

  const [
    username,
    setUsername,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState(
      "Послуги"
    );

  const [
    city,
    setCity,
  ] =
    useState(
      "Київ"
    );

  const [
    address,
    setAddress,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    website,
    setWebsite,
  ] =
    useState("");

  /* =======================================================
     SUBMIT
  ======================================================= */

  function submit() {
    const cleanName =
      name.trim();

    if (
      !cleanName
    ) {
      return;
    }

    const cleanUsername =
      createUsername(
        cleanName,
        username
      );

    const business = {
      id:
        `business-user-${Date.now()}`,

      owner:
        "me",

      name:
        cleanName,

      username:
        cleanUsername,

      initials:
        createInitials(
          cleanName
        ),

      category,

      city:
        city.trim() ||
        "Київ",

      address:
        address.trim() ||
        city.trim() ||
        "Київ",

      description:
        description.trim() ||
        "Бізнес у ЯТУТ.",

      phone:
        phone.trim(),

      website:
        website.trim(),

      rating:
        5,

      reviews:
        0,

      followers:
        0,

      verified:
        false,

      services:
        [],

      createdAt:
        Date.now(),
    };

    onCreate(
      business
    );
  }

  return (
    <div
      className="feature-modal-backdrop"
      onClick={
        onClose
      }
    >
      <section
        className="feature-modal"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header>
          <div>
            <span>
              ЯТУТ BUSINESS
            </span>

            <h2>
              Створити бізнес
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
              size={20}
            />
          </button>
        </header>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="feature-modal-body">
          <label>
            <span>
              Назва бізнесу
            </span>

            <input
              value={
                name
              }
              onChange={(
                event
              ) =>
                setName(
                  event
                    .target
                    .value
                )
              }
              placeholder="Наприклад: Black Line Tattoo"
              autoFocus
            />
          </label>

          <label>
            <span>
              Username
            </span>

            <input
              value={
                username
              }
              onChange={(
                event
              ) =>
                setUsername(
                  event
                    .target
                    .value
                )
              }
              placeholder="blackline"
            />

            <small className="business-field-hint">
              Якщо залишити порожнім — ЯТУТ створить username автоматично.
            </small>
          </label>

          <div className="feature-modal-row">
            <label>
              <span>
                Категорія
              </span>

              <select
                value={
                  category
                }
                onChange={(
                  event
                ) =>
                  setCategory(
                    event
                      .target
                      .value
                  )
                }
              >
                {CATEGORIES.filter(
                  (
                    item
                  ) =>
                    item !==
                    "Усі"
                ).map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {
                        item
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span>
                Місто
              </span>

              <input
                value={
                  city
                }
                onChange={(
                  event
                ) =>
                  setCity(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Київ"
              />
            </label>
          </div>

          <label>
            <span>
              Адреса
            </span>

            <input
              value={
                address
              }
              onChange={(
                event
              ) =>
                setAddress(
                  event
                    .target
                    .value
                )
              }
              placeholder="Район, вулиця або адреса"
            />
          </label>

          <label>
            <span>
              Опис
            </span>

            <textarea
              value={
                description
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event
                    .target
                    .value
                )
              }
              placeholder="Розкажіть про свій бізнес, товари або послуги..."
              maxLength={
                1200
              }
            />
          </label>

          <div className="feature-modal-row">
            <label>
              <span>
                Телефон
              </span>

              <input
                value={
                  phone
                }
                onChange={(
                  event
                ) =>
                  setPhone(
                    event
                      .target
                      .value
                  )
                }
                placeholder="+380..."
              />
            </label>

            <label>
              <span>
                Сайт
              </span>

              <input
                value={
                  website
                }
                onChange={(
                  event
                ) =>
                  setWebsite(
                    event
                      .target
                      .value
                  )
                }
                placeholder="example.ua"
              />
            </label>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer>
          <button
            className="feature-secondary-button"
            type="button"
            onClick={
              onClose
            }
          >
            Скасувати
          </button>

          <button
            className="feature-primary-button"
            type="button"
            disabled={
              !name.trim()
            }
            onClick={
              submit
            }
          >
            <YatutIcon
              name="plus"
              size={16}
            />

            Створити
          </button>
        </footer>
      </section>
    </div>
  );
}