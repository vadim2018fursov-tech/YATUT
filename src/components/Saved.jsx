import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./FeaturePages.css";

import YatutIcon from "./YatutIcon";

import {
  clearSavedItems,
  getSavedItems,
  removeSavedById,
  saveItem,
  subscribeSavedItems,
} from "../storage/savedService";

/* =========================================================
   YATUT SAVED V2

   Єдина сторінка "Збережене"

   Джерела:
   - Home
   - Events
   - Nearby
   - Business
   - Spaces
   - Profiles

   Storage:
   savedService.js
========================================================= */

const LEGACY_STORAGE_KEY =
  "yatut-saved-items-v1";

/* =========================================================
   TABS
========================================================= */

const TABS = [
  {
    id: "all",
    title: "Усе",
  },

  {
    id: "post",
    title: "Дописи",
  },

  {
    id: "event",
    title: "Події",
  },

  {
    id: "community",
    title: "Спільноти",
  },

  {
    id: "place",
    title: "Місця",
  },

  {
    id: "business",
    title: "Бізнес",
  },

  {
    id: "profile",
    title: "Люди",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatSavedTime(
  value
) {
  if (!value) {
    return "";
  }

  const diff =
    Date.now() -
    Number(value);

  const minutes =
    Math.floor(
      diff / 60000
    );

  if (minutes < 1) {
    return "щойно";
  }

  if (minutes < 60) {
    return `${minutes} хв тому`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} год тому`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days} дн тому`;
  }

  try {
    return new Date(
      value
    ).toLocaleDateString(
      "uk-UA",
      {
        day: "numeric",
        month: "short",
      }
    );
  } catch {
    return "";
  }
}

/* =========================================================
   ICON BY TYPE
========================================================= */

function iconForType(
  type
) {
  switch (type) {
    case "post":
      return "saved";

    case "event":
      return "events";

    case "community":
    case "space":
      return "community";

    case "place":
      return "pin";

    case "business":
      return "business";

    case "profile":
      return "friends";

    case "photo":
      return "image";

    case "video":
      return "video";

    default:
      return "saved";
  }
}

/* =========================================================
   TYPE TITLE
========================================================= */

function titleForType(
  type
) {
  switch (type) {
    case "post":
      return "Допис";

    case "event":
      return "Подія";

    case "community":
    case "space":
      return "Спільнота";

    case "place":
      return "Місце";

    case "business":
      return "Бізнес";

    case "profile":
      return "Профіль";

    case "photo":
      return "Фото";

    case "video":
      return "Відео";

    default:
      return "Збережене";
  }
}

/* =========================================================
   TAB MATCH
========================================================= */

function matchesTab(
  item,
  tab
) {
  if (
    tab === "all"
  ) {
    return true;
  }

  /*
    Spaces та Communities
    показуємо в одній вкладці.
  */

  if (
    tab === "community"
  ) {
    return (
      item.type ===
        "community" ||
      item.type ===
        "space"
    );
  }

  return (
    item.type ===
    tab
  );
}

/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(
  item,
  query
) {
  if (!query) {
    return true;
  }

  const text = [
    item.title,
    item.subtitle,
    item.description,
    item.text,
    item.category,
    item.city,
    item.location,
    item.author?.name,
    item.owner?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(
    query
  );
}

/* =========================================================
   LEGACY MIGRATION

   Якщо користувач уже мав старий Saved V1,
   один раз переносимо ці записи у savedService.
========================================================= */

function migrateLegacySaved() {
  try {
    const current =
      getSavedItems();

    /*
      Якщо нова система вже має дані,
      нічого не переносимо.
    */

    if (
      current.length
    ) {
      return current;
    }

    const raw =
      localStorage.getItem(
        LEGACY_STORAGE_KEY
      );

    if (!raw) {
      return current;
    }

    const legacy =
      JSON.parse(raw);

    if (
      !Array.isArray(
        legacy
      )
    ) {
      return current;
    }

    legacy.forEach(
      (item) => {
        try {
          saveItem({
            type:
              item.type ||
              "other",

            sourceId:
              item.sourceId ||
              item.id,

            title:
              item.title ||
              "Збережений матеріал",

            subtitle:
              item.subtitle ||
              "",

            description:
              item.description ||
              item.text ||
              "",

            text:
              item.text ||
              item.description ||
              "",

            createdAt:
              item.createdAt,

            savedAt:
              item.savedAt ||
              item.createdAt,

            route:
              legacyRouteForType(
                item.type
              ),

            data:
              item,
          });
        } catch (
          error
        ) {
          console.warn(
            "Legacy saved migration error:",
            error
          );
        }
      }
    );

    return getSavedItems();
  } catch (
    error
  ) {
    console.warn(
      "Legacy saved migration failed:",
      error
    );

    return getSavedItems();
  }
}

function legacyRouteForType(
  type
) {
  switch (type) {
    case "event":
      return "events";

    case "community":
    case "space":
      return "communities";

    case "business":
      return "business";

    case "place":
      return "nearby";

    case "profile":
      return "friends";

    default:
      return "home";
  }
}

/* =========================================================
   SAVED PAGE
========================================================= */

export default function Saved({
  onNavigate,
}) {
  const [
    items,
    setItems,
  ] =
    useState(() =>
      getSavedItems()
    );

  const [
    tab,
    setTab,
  ] =
    useState("all");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    menuItemId,
    setMenuItemId,
  ] =
    useState(null);

  /* =======================================================
     INIT + LIVE SYNC
  ======================================================= */

  useEffect(() => {
    const migrated =
      migrateLegacySaved();

    setItems(
      migrated
    );

    const unsubscribe =
      subscribeSavedItems(
        (
          nextItems
        ) => {
          setItems(
            nextItems
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredItems =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return items.filter(
        (item) =>
          matchesTab(
            item,
            tab
          ) &&
          matchesSearch(
            item,
            query
          )
      );
    }, [
      items,
      tab,
      search,
    ]);

  /* =======================================================
     COUNTERS
  ======================================================= */

  const counters =
    useMemo(
      () => ({
        all:
          items.length,

        post:
          items.filter(
            (item) =>
              item.type ===
              "post"
          ).length,

        event:
          items.filter(
            (item) =>
              item.type ===
              "event"
          ).length,

        community:
          items.filter(
            (item) =>
              item.type ===
                "community" ||
              item.type ===
                "space"
          ).length,

        place:
          items.filter(
            (item) =>
              item.type ===
              "place"
          ).length,

        business:
          items.filter(
            (item) =>
              item.type ===
              "business"
          ).length,

        profile:
          items.filter(
            (item) =>
              item.type ===
              "profile"
          ).length,
      }),
      [items]
    );

  /* =======================================================
     REMOVE
  ======================================================= */

  function removeItem(
    item
  ) {
    removeSavedById(
      item.id
    );

    setMenuItemId(
      null
    );
  }

  /* =======================================================
     CLEAR
  ======================================================= */

  function clearAll() {
    if (
      !items.length
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Очистити все збережене?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    clearSavedItems();

    setMenuItemId(
      null
    );
  }

  /* =======================================================
     OPEN ITEM
  ======================================================= */

  function openItem(
    item
  ) {
    const route =
      item.route ||
      legacyRouteForType(
        item.type
      );

    /*
      Сохраняем payload.

      Сейчас App откроет нужный раздел.
      Позже Business / Events / Spaces будут
      читать этот payload и открывать конкретную карточку.
    */

    if (
      item.routePayload
    ) {
      try {
        sessionStorage.setItem(
          "yatut-open-route-payload",
          JSON.stringify({
            route,

            payload:
              item.routePayload,

            savedItemId:
              item.id,

            createdAt:
              Date.now(),
          })
        );
      } catch (
        error
      ) {
        console.warn(
          "Saved route payload error:",
          error
        );
      }
    }

    if (
      typeof onNavigate ===
      "function"
    ) {
      onNavigate(
        route,
        item.routePayload ||
          null
      );
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="feature-page saved-page">
      {/* ===================================================
          HERO
      =================================================== */}

      <header className="feature-hero saved-hero">
        <div>
          <span>
            ВАШ КОНТЕНТ
          </span>

          <h1>
            Збережене
          </h1>

          <p>
            Усе важливе в одному місці:
            дописи, події, спільноти,
            місця, бізнес та люди.
          </p>
        </div>

        <div className="feature-hero-icon">
          <YatutIcon
            name="saved"
            size={34}
          />
        </div>
      </header>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="saved-summary">
        <article>
          <strong>
            {
              counters.all
            }
          </strong>

          <span>
            Усього
          </span>
        </article>

        <article>
          <strong>
            {
              counters.post
            }
          </strong>

          <span>
            Дописів
          </span>
        </article>

        <article>
          <strong>
            {
              counters.event
            }
          </strong>

          <span>
            Подій
          </span>
        </article>

        <article>
          <strong>
            {counters.community +
              counters.place +
              counters.business}
          </strong>

          <span>
            Інше
          </span>
        </article>
      </section>

      {/* ===================================================
          SEARCH + CLEAR
      =================================================== */}

      <section className="saved-toolbar">
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
            placeholder="Пошук у збереженому..."
          />

          {search && (
            <button
              type="button"
              className="saved-search-clear"
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

        <button
          className="feature-secondary-button"
          type="button"
          disabled={
            !items.length
          }
          onClick={
            clearAll
          }
        >
          Очистити все
        </button>
      </section>

      {/* ===================================================
          TABS
      =================================================== */}

      <nav className="feature-tabs saved-tabs">
        {TABS.map(
          (item) => {
            const count =
              counters[
                item.id
              ] || 0;

            return (
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
                <span>
                  {
                    item.title
                  }
                </span>

                {count >
                  0 && (
                  <small>
                    {
                      count
                    }
                  </small>
                )}
              </button>
            );
          }
        )}
      </nav>

      {/* ===================================================
          LIST
      =================================================== */}

      {filteredItems.length ? (
        <div className="saved-list">
          {filteredItems.map(
            (item) => (
              <SavedCard
                key={
                  item.id
                }
                item={
                  item
                }
                menuOpen={
                  menuItemId ===
                  item.id
                }
                onToggleMenu={() =>
                  setMenuItemId(
                    (
                      current
                    ) =>
                      current ===
                      item.id
                        ? null
                        : item.id
                  )
                }
                onOpen={() =>
                  openItem(
                    item
                  )
                }
                onRemove={() =>
                  removeItem(
                    item
                  )
                }
              />
            )
          )}
        </div>
      ) : (
        <SavedEmpty
          hasItems={
            items.length >
            0
          }
          search={
            search
          }
          tab={
            tab
          }
          onNavigate={
            onNavigate
          }
          onReset={() => {
            setSearch("");

            setTab(
              "all"
            );
          }}
        />
      )}
    </section>
  );
}

/* =========================================================
   SAVED CARD
========================================================= */

function SavedCard({
  item,
  menuOpen,
  onToggleMenu,
  onOpen,
  onRemove,
}) {
  const icon =
    iconForType(
      item.type
    );

  const typeTitle =
    titleForType(
      item.type
    );

  const image =
    item.image ||
    item.imageUrl ||
    item.cover ||
    null;

  return (
    <article className="saved-card saved-card-v2">
      {/* ===================================================
          VISUAL
      =================================================== */}

      {image ? (
        <div className="saved-card-image">
          <img
            src={
              image
            }
            alt=""
          />
        </div>
      ) : (
        <div className="feature-item-icon large">
          <YatutIcon
            name={
              icon
            }
            size={23}
          />
        </div>
      )}

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="saved-card-content">
        <div className="saved-card-meta">
          <span>
            {
              item.subtitle ||
              typeTitle
            }
          </span>

          <i>
            •
          </i>

          <small>
            Збережено{" "}
            {formatSavedTime(
              item.savedAt
            )}
          </small>
        </div>

        <strong>
          {item.title ||
            "Збережений матеріал"}
        </strong>

        {(item.description ||
          item.text) && (
          <p>
            {item.description ||
              item.text}
          </p>
        )}

        <div className="saved-card-extra">
          {item.city && (
            <span>
              <YatutIcon
                name="pin"
                size={13}
              />

              {
                item.city
              }
            </span>
          )}

          {item.location && (
            <span>
              <YatutIcon
                name="pin"
                size={13}
              />

              {
                item.location
              }
            </span>
          )}

          {item.rating !==
            null &&
            item.rating !==
              undefined && (
              <span>
                ★{" "}
                {
                  item.rating
                }
              </span>
            )}

          {item.members !==
            null &&
            item.members !==
              undefined && (
              <span>
                <YatutIcon
                  name="friends"
                  size={13}
                />

                {
                  item.members
                }
              </span>
            )}
        </div>
      </section>

      {/* ===================================================
          ACTIONS
      =================================================== */}

      <div className="saved-card-actions">
        <button
          className="feature-primary-button"
          type="button"
          onClick={
            onOpen
          }
        >
          Відкрити

          <YatutIcon
            name="arrowRight"
            size={14}
          />
        </button>

        <div className="saved-menu-wrap">
          <button
            className="feature-icon-button"
            type="button"
            onClick={
              onToggleMenu
            }
            aria-label="Меню"
          >
            <YatutIcon
              name="more"
              size={18}
            />
          </button>

          {menuOpen && (
            <div className="saved-card-menu">
              <button
                type="button"
                onClick={
                  onOpen
                }
              >
                <YatutIcon
                  name="arrowRight"
                  size={15}
                />

                Відкрити
              </button>

              <button
                type="button"
                className="danger"
                onClick={
                  onRemove
                }
              >
                <YatutIcon
                  name="close"
                  size={15}
                />

                Видалити зі збереженого
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function SavedEmpty({
  hasItems,
  search,
  tab,
  onNavigate,
  onReset,
}) {
  const filtered =
    hasItems &&
    (search ||
      tab !== "all");

  if (filtered) {
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
          Спробуйте змінити запит або
          вибрати іншу категорію.
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

  return (
    <div className="feature-empty">
      <div>
        <YatutIcon
          name="saved"
          size={29}
        />
      </div>

      <strong>
        Тут поки тихо
      </strong>

      <p>
        Зберігайте цікаві дописи,
        події, місця, бізнес та
        спільноти — вони зʼявляться
        тут.
      </p>

      <div className="saved-empty-actions">
        <button
          className="feature-primary-button"
          type="button"
          onClick={() =>
            onNavigate?.(
              "home"
            )
          }
        >
          До стрічки
        </button>

        <button
          className="feature-secondary-button"
          type="button"
          onClick={() =>
            onNavigate?.(
              "nearby"
            )
          }
        >
          Поруч
        </button>
      </div>
    </div>
  );
}