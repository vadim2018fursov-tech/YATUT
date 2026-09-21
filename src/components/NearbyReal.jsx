import {
  useEffect,
  useMemo,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";
import NearbyPlaceDetail from "./NearbyPlaceDetail";

import {
  loadNearbyFeed,
  loadNearbyModerationQueue,
  moderateNearbyPlace,
  submitNearbyPlace,
} from "../services/nearbyBackendService";

const BASE_TABS = [
  ["all", "Для вас"],
  ["events", "Події"],
  ["places", "Місця"],
  ["communities", "Спільноти"],
];

function formatDistance(
  value
) {
  const distance =
    Number(value);

  if (
    !Number.isFinite(
      distance
    )
  ) {
    return null;
  }

  if (
    distance <
    1
  ) {
    return `${Math.round(
      distance *
        1000
    )} м`;
  }

  return `${distance.toFixed(
    distance < 10
      ? 1
      : 0
  )} км`;
}

function eventDate(
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
      day:
        "2-digit",
      month:
        "short",
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  );
}

export default function NearbyReal({
  authSession,
  onNavigate,
}) {
  const [
    tab,
    setTab,
  ] = useState(
    "all"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    radius,
    setRadius,
  ] = useState(10);

  const [
    coordinates,
    setCoordinates,
  ] = useState(null);

  const [
    locating,
    setLocating,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    feed,
    setFeed,
  ] = useState({
    city:
      null,
    places:
      [],
    events:
      [],
    communities:
      [],
  });

  const [
    addOpen,
    setAddOpen,
  ] = useState(false);

  const [
    placeDraft,
    setPlaceDraft,
  ] = useState({
    title:
      "",
    category:
      "other",
    description:
      "",
    address:
      "",
    websiteUrl:
      "",
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    placeImageFile,
    setPlaceImageFile,
  ] = useState(null);

  const [
    selectedPlaceId,
    setSelectedPlaceId,
  ] = useState(() => {
    const parts =
      window.location.pathname
        .split("/")
        .filter(Boolean);

    return parts[0] ===
      "nearby" &&
      parts[1]
      ? parts[1]
      : null;
  });

  const [
    moderationQueue,
    setModerationQueue,
  ] = useState([]);

  const [
    moderationLoading,
    setModerationLoading,
  ] = useState(false);

  async function refresh(
    overrides = {}
  ) {
    try {
      setLoading(
        true
      );

      const next =
        await loadNearbyFeed(
          authSession,
          {
            city:
              overrides.city ??
              (
                city ||
                null
              ),
            latitude:
              overrides.coordinates
                ?.latitude ??
              coordinates
                ?.latitude ??
              null,
            longitude:
              overrides.coordinates
                ?.longitude ??
              coordinates
                ?.longitude ??
              null,
            radiusKm:
              overrides.radius ??
              radius,
          }
        );

      setFeed(
        next
      );

      if (
        !city &&
        next.city
      ) {
        setCity(
          next.city
        );
      }
    } catch (
      error
    ) {
      console.warn(
        "NEARBY BACKEND LOAD ERROR:",
        error
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  useEffect(() => {
    refresh();
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  function usePreciseLocation() {
    if (
      !navigator.geolocation
    ) {
      window.alert(
        "Геолокація недоступна у цьому браузері."
      );

      return;
    }

    setLocating(
      true
    );

    navigator.geolocation.getCurrentPosition(
      (
        position
      ) => {
        const next = {
          latitude:
            position.coords
              .latitude,
          longitude:
            position.coords
              .longitude,
        };

        setCoordinates(
          next
        );

        setLocating(
          false
        );

        refresh({
          coordinates:
            next,
        });
      },
      () => {
        setLocating(
          false
        );

        window.alert(
          "ЯТУТ не отримав доступ до геолокації. Пошук залишиться на рівні міста."
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

  async function submitPlace() {
    if (
      !placeDraft.title
        .trim() ||
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(
        true
      );

      await submitNearbyPlace(
        authSession,
        {
          ...placeDraft,
          title:
            placeDraft.title
              .trim(),
          city:
            city ||
            feed.city ||
            null,
          latitude:
            coordinates
              ?.latitude ??
            null,
          longitude:
            coordinates
              ?.longitude ??
            null,
        }
      );

      setPlaceDraft({
        title:
          "",
        category:
          "other",
        description:
          "",
        address:
          "",
        websiteUrl:
          "",
      });

      setAddOpen(
        false
      );

      await refresh();
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося додати місце."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  const query =
    search
      .trim()
      .toLowerCase();

  const places =
    useMemo(
      () =>
        feed.places.filter(
          (
            place
          ) =>
            !query ||
            [
              place.title,
              place.category,
              place.description,
              place.address,
              place.city,
            ]
              .filter(
                Boolean
              )
              .join(" ")
              .toLowerCase()
              .includes(
                query
              )
        ),
      [
        feed.places,
        query,
      ]
    );

  const events =
    useMemo(
      () =>
        feed.events.filter(
          (
            event
          ) =>
            !query ||
            [
              event.title,
              event.description,
              event.place,
              event.city,
              event.category,
            ]
              .filter(
                Boolean
              )
              .join(" ")
              .toLowerCase()
              .includes(
                query
              )
        ),
      [
        feed.events,
        query,
      ]
    );

  const communities =
    useMemo(
      () =>
        feed.communities.filter(
          (
            community
          ) =>
            !query ||
            [
              community.title,
              community.description,
              community.city,
              community.communityType,
            ]
              .filter(
                Boolean
              )
              .join(" ")
              .toLowerCase()
              .includes(
                query
              )
        ),
      [
        feed.communities,
        query,
      ]
    );

  return (
    <section className="feature-page nearby-page nearby-real">
      <header className="feature-hero nearby-hero">
        <div>
          <span>
            ЯТУТ ПОРУЧ
          </span>

          <h1>
            Що відбувається поруч
          </h1>

          <p>
            Реальні події, місця та спільноти. Точні координати користувача не зберігаються — вони використовуються лише локально для розрахунку відстані після дозволу.
          </p>
        </div>

        <div className="feature-hero-icon">
          <YatutIcon
            name="nearby"
            size={34}
          />
        </div>
      </header>

      <section className="nearby-real-toolbar">
        <label>
          <span>
            Місто
          </span>

          <input
            value={city}
            onChange={(
              event
            ) =>
              setCity(
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
                  city,
                });
              }
            }}
            placeholder="Наприклад, Київ"
          />
        </label>

        <label>
          <span>
            Радіус для місць
          </span>

          <select
            value={radius}
            onChange={(
              event
            ) => {
              const next =
                Number(
                  event.target.value
                );

              setRadius(
                next
              );

              refresh({
                radius:
                  next,
              });
            }}
          >
            {[2,5,10,25,50].map(
              (
                value
              ) => (
                <option
                  key={value}
                  value={value}
                >
                  {value} км
                </option>
              )
            )}
          </select>
        </label>

        <button
          type="button"
          className="nearby-real-location"
          onClick={
            usePreciseLocation
          }
        >
          <YatutIcon
            name="pin"
            size={17}
          />

          {locating
            ? "Визначаємо..."
            : coordinates
            ? "Геолокація увімкнена"
            : "Уточнити відстань"}
        </button>

        <button
          type="button"
          className="feature-primary-button"
          onClick={() =>
            refresh({
              city,
            })
          }
        >
          Оновити
        </button>
      </section>

      <label className="feature-search nearby-real-search">
        <YatutIcon
          name="search"
          size={19}
        />

        <input
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Пошук подій, місць і спільнот..."
        />
      </label>

      <nav className="feature-tabs nearby-tabs">
        {TABS.map(
          ([
            id,
            title,
          ]) => (
            <button
              key={id}
              type="button"
              className={
                tab ===
                id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab(
                  id
                )
              }
            >
              {title}
            </button>
          )
        )}
      </nav>

      {loading ? (
        <section className="feature-real-state">
          <div className="feature-real-state__icon">
            <YatutIcon
              name="nearby"
              size={26}
            />
          </div>

          <h2>
            Завантажуємо «Поруч»
          </h2>
        </section>
      ) : (
        <div className="nearby-real-content">
          {(tab === "all" ||
            tab === "events") && (
            <section className="nearby-real-section">
              <header>
                <div>
                  <span>
                    ПОДІЇ
                  </span>

                  <h2>
                    Поруч у {
                      feed.city ||
                      city ||
                      "вашому місті"
                    }
                  </h2>
                </div>

                <strong>
                  {events.length}
                </strong>
              </header>

              {events.length ? (
                <div className="nearby-real-list">
                  {events.map(
                    (
                      event
                    ) => (
                      <button
                        key={event.id}
                        type="button"
                        className="nearby-real-item"
                        onClick={() =>
                          onNavigate?.(
                            "events",
                            {
                              eventId:
                                event.id,
                            }
                          )
                        }
                      >
                        <span className="feature-item-icon">
                          <YatutIcon
                            name="events"
                            size={20}
                          />
                        </span>

                        <div>
                          <strong>
                            {
                              event.title
                            }
                          </strong>

                          <p>
                            {
                              event.place ||
                              event.city ||
                              "Місце уточнюється"
                            }
                          </p>

                          <small>
                            {
                              eventDate(
                                event.startsAt
                              )
                            }
                          </small>
                        </div>

                        <YatutIcon
                          name="arrowRight"
                          size={16}
                        />
                      </button>
                    )
                  )}
                </div>
              ) : (
                <p className="nearby-real-empty">
                  У цьому місті поки немає майбутніх серверних подій.
                </p>
              )}
            </section>
          )}

          {(tab === "all" ||
            tab === "places") && (
            <section className="nearby-real-section">
              <header>
                <div>
                  <span>
                    МІСЦЯ
                  </span>

                  <h2>
                    Реальні точки
                  </h2>
                </div>

                <div className="nearby-real-section-actions">
                  <strong>
                    {places.length}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      setAddOpen(
                        (
                          value
                        ) =>
                          !value
                      )
                    }
                  >
                    + Додати місце
                  </button>
                </div>
              </header>

              {addOpen && (
                <div className="nearby-place-submit">
                  <input
                    value={placeDraft.title}
                    onChange={(
                      event
                    ) =>
                      setPlaceDraft({
                        ...placeDraft,
                        title:
                          event.target.value,
                      })
                    }
                    placeholder="Назва місця"
                  />

                  <input
                    value={placeDraft.category}
                    onChange={(
                      event
                    ) =>
                      setPlaceDraft({
                        ...placeDraft,
                        category:
                          event.target.value,
                      })
                    }
                    placeholder="Категорія"
                  />

                  <input
                    value={placeDraft.address}
                    onChange={(
                      event
                    ) =>
                      setPlaceDraft({
                        ...placeDraft,
                        address:
                          event.target.value,
                      })
                    }
                    placeholder="Адреса"
                  />

                  <textarea
                    value={placeDraft.description}
                    onChange={(
                      event
                    ) =>
                      setPlaceDraft({
                        ...placeDraft,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Короткий опис"
                  />

                  <div>
                    <button
                      type="button"
                      className="feature-primary-button"
                      disabled={
                        !placeDraft.title.trim() ||
                        submitting
                      }
                      onClick={
                        submitPlace
                      }
                    >
                      {submitting
                        ? "Додаємо..."
                        : "Надіслати"}
                    </button>

                    <small>
                      Звичайні користувачі надсилають місце на модерацію. Точні координати додаються лише якщо ви самі увімкнули геолокацію.
                    </small>
                  </div>
                </div>
              )}

              {places.length ? (
                <div className="nearby-place-grid">
                  {places.map(
                    (
                      place
                    ) => (
                      <article
                        key={place.id}
                        className="nearby-place-card"
                      >
                        <div className="nearby-place-cover">
                          <YatutIcon
                            name="pin"
                            size={26}
                          />
                        </div>

                        <section>
                          <div>
                            <span>
                              {
                                place.category ||
                                "Місце"
                              }
                            </span>

                            <small>
                              {
                                formatDistance(
                                  place.distanceKm
                                ) ||
                                place.city
                              }
                            </small>
                          </div>

                          <h3>
                            {
                              place.title
                            }
                          </h3>

                          <p>
                            {
                              place.description ||
                              place.address ||
                              "Опис ще не додано."
                            }
                          </p>

                          {place.status ===
                            "pending" && (
                            <small className="nearby-place-pending">
                              Очікує модерації
                            </small>
                          )}
                        </section>
                      </article>
                    )
                  )}
                </div>
              ) : (
                <p className="nearby-real-empty">
                  Реальних місць у цьому місті поки немає. Можна додати перше.
                </p>
              )}
            </section>
          )}

          {(tab === "all" ||
            tab === "communities") && (
            <section className="nearby-real-section">
              <header>
                <div>
                  <span>
                    СПІЛЬНОТИ
                  </span>

                  <h2>
                    Локальні спільноти
                  </h2>
                </div>

                <strong>
                  {communities.length}
                </strong>
              </header>

              {communities.length ? (
                <div className="nearby-real-list">
                  {communities.map(
                    (
                      community
                    ) => (
                      <button
                        key={
                          community.id
                        }
                        type="button"
                        className="nearby-real-item"
                        onClick={() =>
                          onNavigate?.(
                            "communities",
                            {
                              communityId:
                                community.id,
                            }
                          )
                        }
                      >
                        <span className="feature-item-icon">
                          <YatutIcon
                            name="communities"
                            size={20}
                          />
                        </span>

                        <div>
                          <strong>
                            {
                              community.title
                            }
                          </strong>

                          <p>
                            {
                              community.description ||
                              community.city ||
                              "Спільнота ЯТУТ"
                            }
                          </p>

                          <small>
                            {
                              Number(
                                community.memberCount ||
                                0
                              )
                            }{" "}
                            учасників
                          </small>
                        </div>

                        <YatutIcon
                          name="arrowRight"
                          size={16}
                        />
                      </button>
                    )
                  )}
                </div>
              ) : (
                <p className="nearby-real-empty">
                  Локальних спільнот у цьому місті поки немає.
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </section>
  );
}
