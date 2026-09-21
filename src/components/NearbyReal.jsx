import {
  useEffect,
  useMemo,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";
import NearbyPlaceDetail from "./NearbyPlaceDetail";
import NearbyMap from "./NearbyMap";
import NearbyCoordinatePicker from "./NearbyCoordinatePicker";

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
    placeCoordinates,
    setPlaceCoordinates,
  ] = useState(null);

  const [
    coordinatePickerOpen,
    setCoordinatePickerOpen,
  ] = useState(false);

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

  const [
    viewMode,
    setViewMode,
  ] = useState(() =>
    localStorage.getItem(
      "yatut-nearby-view-v1"
    ) === "map"
      ? "map"
      : "list"
  );

  function changeViewMode(
    mode
  ) {
    const next =
      mode === "map"
        ? "map"
        : "list";

    setViewMode(
      next
    );

    try {
      localStorage.setItem(
        "yatut-nearby-view-v1",
        next
      );
    } catch {
      // local preference only
    }
  }

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

  async function refreshModerationQueue() {
    if (
      !feed.canModerate
    ) {
      setModerationQueue(
        []
      );

      return;
    }

    try {
      setModerationLoading(
        true
      );

      const rows =
        await loadNearbyModerationQueue(
          authSession
        );

      setModerationQueue(
        rows
      );
    } catch (
      error
    ) {
      console.warn(
        "NEARBY MODERATION LOAD ERROR:",
        error
      );
    } finally {
      setModerationLoading(
        false
      );
    }
  }

  useEffect(() => {
    if (
      feed.canModerate
    ) {
      refreshModerationQueue();
    }
  }, [
    feed.canModerate,
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
            placeCoordinates
              ?.latitude ??
            null,
          longitude:
            placeCoordinates
              ?.longitude ??
            null,
        },
        placeImageFile
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

      setPlaceImageFile(
        null
      );

      setPlaceCoordinates(
        null
      );

      setCoordinatePickerOpen(
        false
      );

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

  async function moderatePlace(
    placeId,
    decision
  ) {
    const note =
      window.prompt(
        decision ===
          "approved"
          ? "Коментар до схвалення (необов’язково):"
          : "Причина відхилення (необов’язково):",
        ""
      );

    if (
      note === null
    ) {
      return;
    }

    try {
      await moderateNearbyPlace(
        authSession,
        placeId,
        decision,
        note
      );

      await Promise.all([
        refreshModerationQueue(),
        refresh(),
      ]);
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося виконати модерацію."
      );
    }
  }

  const tabs =
    feed.canModerate
      ? [
          ...BASE_TABS,
          [
            "moderation",
            `Модерація (${moderationQueue.length})`,
          ],
        ]
      : BASE_TABS;

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

  if (
    selectedPlaceId
  ) {
    return (
      <NearbyPlaceDetail
        authSession={
          authSession
        }
        placeId={
          selectedPlaceId
        }
        nearbyPlaces={
          feed.places
        }
        onUpdated={
          refresh
        }
        onBack={() => {
          setSelectedPlaceId(
            null
          );

          onNavigate?.(
            "nearby"
          );
        }}
      />
    );
  }

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
        {tabs.map(
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

      {tab !== "moderation" && (
        <div className="nearby-view-toggle">
          <button
            type="button"
            className={
              viewMode === "list"
                ? "active"
                : ""
            }
            onClick={() =>
              changeViewMode(
                "list"
              )
            }
          >
            <YatutIcon
              name="menuGrid"
              size={15}
            />
            Список
          </button>

          <button
            type="button"
            className={
              viewMode === "map"
                ? "active"
                : ""
            }
            onClick={() =>
              changeViewMode(
                "map"
              )
            }
          >
            <YatutIcon
              name="pin"
              size={15}
            />
            Карта
          </button>
        </div>
      )}

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
      ) : viewMode === "map" &&
        tab !== "moderation" ? (
        <div className="nearby-map-view">
          <NearbyMap
            places={
              places
            }
            events={
              events
            }
            onOpenPlace={(
              place
            ) => {
              setSelectedPlaceId(
                place.id
              );

              onNavigate?.(
                "nearby",
                {
                  placeId:
                    place.id,
                }
              );
            }}
            onOpenEvent={(
              event
            ) =>
              onNavigate?.(
                "events",
                {
                  eventId:
                    event.id,
                }
              )
            }
          />

          <div className="nearby-map-legend">
            <div className="nearby-map-legend-items">
              <span>
                <i className="nearby-map-legend-dot" />
                Місця
              </span>

              <span>
                <i className="nearby-map-legend-dot is-event" />
                Події
              </span>
            </div>

            <small>
              На карту потрапляють лише точки з перевіреними координатами. Події без прив’язки до місця залишаються у списку.
            </small>
          </div>
        </div>
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

                  <div className="nearby-place-coordinate-field">
                    <div>
                      <span>
                        Точка на карті
                      </span>

                      <strong>
                        {placeCoordinates
                          ? `${placeCoordinates.latitude.toFixed(
                              5
                            )}, ${placeCoordinates.longitude.toFixed(
                              5
                            )}`
                          : "Координати ще не вибрані"}
                      </strong>

                      <small>
                        Геолокація акаунта не потрібна — точку можна поставити вручну.
                      </small>
                    </div>

                    <div className="nearby-place-coordinate-actions">
                      <button
                        type="button"
                        className="feature-secondary-button"
                        onClick={() =>
                          setCoordinatePickerOpen(
                            (
                              value
                            ) =>
                              !value
                          )
                        }
                      >
                        <YatutIcon
                          name="pin"
                          size={14}
                        />

                        {placeCoordinates
                          ? "Змінити точку"
                          : "Вибрати на карті"}
                      </button>

                      {placeCoordinates && (
                        <button
                          type="button"
                          className="nearby-place-coordinate-clear"
                          onClick={() =>
                            setPlaceCoordinates(
                              null
                            )
                          }
                        >
                          Очистити
                        </button>
                      )}
                    </div>
                  </div>

                  {coordinatePickerOpen && (
                    <div className="nearby-place-coordinate-picker-wrap">
                      <NearbyCoordinatePicker
                        value={
                          placeCoordinates
                        }
                        city={
                          city ||
                          feed.city ||
                          ""
                        }
                        nearbyPlaces={
                          feed.places
                        }
                        userCoordinates={
                          coordinates
                        }
                        onClose={() =>
                          setCoordinatePickerOpen(
                            false
                          )
                        }
                        onChange={(
                          next
                        ) => {
                          setPlaceCoordinates({
                            latitude:
                              next.latitude,
                            longitude:
                              next.longitude,
                          });

                          if (
                            next.address
                          ) {
                            setPlaceDraft(
                              (
                                current
                              ) => ({
                                ...current,
                                address:
                                  next.address,
                              })
                            );
                          }

                          setCoordinatePickerOpen(
                            false
                          );
                        }}
                      />
                    </div>
                  )}

                  <label className="nearby-place-photo-input">
                    <span>
                      Фото місця
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(
                        event
                      ) =>
                        setPlaceImageFile(
                          event.target.files
                            ?.[0] ||
                          null
                        )
                      }
                    />

                    <small>
                      {placeImageFile
                        ? placeImageFile.name
                        : "JPEG, PNG, WebP, HEIC до 10 МБ"}
                    </small>
                  </label>

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
                      Звичайні користувачі надсилають місце на модерацію. Координати можна поставити вручну на карті або використати геолокацію лише за власним дозволом.
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
                        className="nearby-place-card nearby-place-card--real"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedPlaceId(
                            place.id
                          );

                          onNavigate?.(
                            "nearby",
                            {
                              placeId:
                                place.id,
                            }
                          );
                        }}
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {
                            event.preventDefault();
                            setSelectedPlaceId(
                              place.id
                            );

                            onNavigate?.(
                              "nearby",
                              {
                                placeId:
                                  place.id,
                              }
                            );
                          }
                        }}
                      >
                        <div className="nearby-place-cover">
                          {place.imageUrl ? (
                            <img
                              src={
                                place.imageUrl
                              }
                              alt=""
                            />
                          ) : (
                            <YatutIcon
                              name="pin"
                              size={26}
                            />
                          )}
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

                          <div className="nearby-place-card-rating">
                            <strong>
                              {place.averageRating
                                ? `★ ${place.averageRating}`
                                : "Без оцінок"}
                            </strong>

                            <span>
                              {Number(
                                place.reviewCount ||
                                0
                              )} відгуків
                            </span>
                          </div>

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

          {tab ===
            "moderation" &&
            feed.canModerate && (
            <section className="nearby-real-section nearby-moderation-section">
              <header>
                <div>
                  <span>
                    МОДЕРАЦІЯ
                  </span>

                  <h2>
                    Нові місця
                  </h2>
                </div>

                <strong>
                  {
                    moderationQueue.length
                  }
                </strong>
              </header>

              {moderationLoading ? (
                <p className="nearby-real-empty">
                  Завантажуємо чергу...
                </p>
              ) : moderationQueue.length ? (
                <div className="nearby-moderation-list">
                  {moderationQueue.map(
                    (
                      place
                    ) => (
                      <article
                        key={
                          place.id
                        }
                        className="nearby-moderation-card"
                      >
                        <div className="nearby-moderation-card__media">
                          {place.imageUrl ? (
                            <img
                              src={
                                place.imageUrl
                              }
                              alt=""
                            />
                          ) : (
                            <YatutIcon
                              name="pin"
                              size={24}
                            />
                          )}
                        </div>

                        <div className="nearby-moderation-card__body">
                          <span>
                            {
                              place.category ||
                              "Місце"
                            }
                          </span>

                          <h3>
                            {
                              place.title
                            }
                          </h3>

                          <p>
                            {
                              place.address ||
                              place.city
                            }
                          </p>

                          <small>
                            Додав: {
                              place.creatorName
                            }
                          </small>
                        </div>

                        <div className="nearby-moderation-card__actions">
                          <button
                            type="button"
                            className="approve"
                            onClick={() =>
                              moderatePlace(
                                place.id,
                                "approved"
                              )
                            }
                          >
                            Схвалити
                          </button>

                          <button
                            type="button"
                            className="reject"
                            onClick={() =>
                              moderatePlace(
                                place.id,
                                "rejected"
                              )
                            }
                          >
                            Відхилити
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              ) : (
                <p className="nearby-real-empty">
                  Черга модерації порожня.
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
