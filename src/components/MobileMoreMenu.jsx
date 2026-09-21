import {
  useEffect,
  useRef,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";

const PRIMARY_ITEMS = [
  {
    id: "friends",
    icon: "friends",
    title: "Друзі",
    subtitle:
      "Люди та знайомства",
  },
  {
    id: "communities",
    icon: "community",
    title: "Спільноти",
    subtitle:
      "Групи та команди",
  },
  {
    id: "events",
    icon: "events",
    title: "Події",
    subtitle:
      "Зустрічі та плани",
  },
  {
    id: "nearby",
    icon: "nearby",
    title: "Поруч",
    subtitle:
      "Що відбувається поряд",
  },
];

const SECONDARY_ITEMS = [
  {
    id: "business",
    icon: "business",
    title: "Бізнес",
  },
  {
    id: "search",
    icon: "search",
    title: "Пошук",
  },
  {
    id: "saved",
    icon: "saved",
    title: "Збережене",
  },
  {
    id: "settings",
    icon: "settings",
    title: "Налаштування",
  },
  {
    id: "admin",
    icon: "profile",
    title: "Адмін",
    founderOnly: true,
  },
];

export default function MobileMoreMenu({
  open,
  currentPage,
  onClose,
  onNavigate,
  viewerProfile = null,
}) {
  const [
    dragY,
    setDragY,
  ] = useState(0);

  const startYRef =
    useRef(null);

  const sheetRef =
    useRef(null);

  useEffect(() => {
    if (!open) {
      setDragY(0);

      return;
    }

    document.body.classList.add(
      "yatut-mobile-menu-open"
    );

    return () => {
      document.body.classList.remove(
        "yatut-mobile-menu-open"
      );
    };
  }, [
    open,
  ]);

  if (!open) {
    return null;
  }

  function navigate(
    page,
    payload = null
  ) {
    onClose?.();
    onNavigate?.(
      page,
      payload
    );
  }

  function handleTouchStart(
    event
  ) {
    startYRef.current =
      event.touches?.[0]
        ?.clientY ??
      null;
  }

  function handleTouchMove(
    event
  ) {
    const start =
      startYRef.current;

    const current =
      event.touches?.[0]
        ?.clientY;

    if (
      start == null ||
      current == null
    ) {
      return;
    }

    const delta =
      Math.max(
        0,
        current - start
      );

    setDragY(
      Math.min(
        delta,
        220
      )
    );
  }

  function handleTouchEnd() {
    if (
      dragY >=
      78
    ) {
      onClose?.();

      startYRef.current =
        null;

      return;
    }

    setDragY(0);

    startYRef.current =
      null;
  }

  return (
    <div
      className="mobile-more-overlay"
      role="presentation"
      onPointerDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <section
        ref={
          sheetRef
        }
        className="mobile-more-sheet"
        style={{
          "--mobile-menu-drag":
            `${dragY}px`,
        }}
        aria-label="Меню ЯТУТ"
        onTouchStart={
          handleTouchStart
        }
        onTouchMove={
          handleTouchMove
        }
        onTouchEnd={
          handleTouchEnd
        }
        onTouchCancel={() => {
          setDragY(0);
          startYRef.current =
            null;
        }}
      >
        <div className="mobile-more-handle" />

        <header className="mobile-more-header">
          <div>
            <span>
              ЯТУТ
            </span>

            <h2>
              Меню
            </h2>
          </div>

          <button
            type="button"
            className="mobile-more-close"
            onClick={
              onClose
            }
            aria-label="Закрити меню"
          >
            <YatutIcon
              name="close"
              size={19}
            />
          </button>
        </header>

        <section className="mobile-more-profile">
          <button
            type="button"
            className="mobile-more-profile-main"
            onClick={() =>
              navigate(
                "profile"
              )
            }
          >
            <span className="mobile-more-profile-avatar">
              {viewerProfile?.avatar ? (
                <img
                  src={
                    viewerProfile.avatar
                  }
                  alt=""
                />
              ) : (
                viewerProfile?.initial ||
                "Я"
              )}
            </span>

            <span className="mobile-more-profile-copy">
              <strong>
                {viewerProfile?.name ||
                  "Користувач ЯТУТ"}
              </strong>

              <small>
                @{viewerProfile?.username ||
                  "user"}
              </small>
            </span>

            <YatutIcon
              name="chevronRight"
              size={18}
            />
          </button>

          <div className="mobile-more-profile-actions">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "profile"
                )
              }
            >
              Мій профіль
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "profile",
                  {
                    action:
                      "edit",
                  }
                )
              }
            >
              Редагувати
            </button>
          </div>
        </section>

        <div className="mobile-more-primary">
          {PRIMARY_ITEMS.map(
            (
              item
            ) => (
              <button
                key={
                  item.id
                }
                type="button"
                className={
                  currentPage ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(
                    item.id
                  )
                }
              >
                <span className="mobile-more-primary-icon">
                  <YatutIcon
                    name={
                      item.icon
                    }
                    size={23}
                  />
                </span>

                <strong>
                  {
                    item.title
                  }
                </strong>

                <small>
                  {
                    item.subtitle
                  }
                </small>
              </button>
            )
          )}
        </div>

        <div className="mobile-more-secondary">
          {SECONDARY_ITEMS
            .filter(
              (
                item
              ) =>
                !item.founderOnly ||
                viewerProfile?.founder
            )
            .map(
            (
              item
            ) => (
              <button
                key={
                  item.id
                }
                type="button"
                className={
                  currentPage ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(
                    item.id
                  )
                }
              >
                <span>
                  <YatutIcon
                    name={
                      item.icon
                    }
                    size={20}
                  />
                </span>

                <strong>
                  {
                    item.title
                  }
                </strong>
              </button>
            )
          )}
        </div>

        <div className="mobile-more-footer">
          <span>
            Твоя мережа. Твої люди.
          </span>

          <strong>
            ЯТУТ
          </strong>
        </div>
      </section>
    </div>
  );
}
