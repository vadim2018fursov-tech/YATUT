import {
  Activity,
  ArrowRight,
  CalendarDays,
  Compass,
  Plus,
  Clock3,
  MapPin,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Events from "../components/Events";
import PulseVideoCard from "../components/pulse/PulseVideoCard";

import {
  pulseRecommendations,
} from "../data/pulseMockData";

const FALLBACK_IMAGE =
  "/assets/yatut/cities/kyiv/hero.jpg";

const eventCards = [
  {
    id: "event-kyiv-evening",
    title:
      "Вечірній Київ",
    city:
      "Київ",
    cityId:
      "kyiv",
    location:
      "Хрещатик",
    time:
      "Сьогодні · 19:30",
    people:
      1240,
    friends:
      8,
    live:
      true,
    image:
      FALLBACK_IMAGE,
  },

  {
    id: "event-podil",
    title:
      "Поділ просто неба",
    city:
      "Київ",
    cityId:
      "kyiv",
    location:
      "Контрактова площа",
    time:
      "Сьогодні · 20:00",
    people:
      428,
    friends:
      12,
    live:
      false,
    image:
      FALLBACK_IMAGE,
  },

  {
    id: "event-city-night",
    title:
      "Місто після заходу",
    city:
      "Київ",
    cityId:
      "kyiv",
    location:
      "Центр",
    time:
      "Сьогодні · 21:00",
    people:
      684,
    friends:
      4,
    live:
      true,
    image:
      FALLBACK_IMAGE,
  },
];

function formatNumber(
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
    ).toFixed(1)}M`;
  }

  if (
    number >=
    1000
  ) {
    return `${(
      number /
      1000
    ).toFixed(
      number >=
        10000
        ? 0
        : 1
    )}K`;
  }

  return String(
    number
  );
}

function PulseEventCard({
  event,
  onNavigate,
}) {
  return (
    <article className="events-pulse-card">
      <div className="events-pulse-card__media">
        <img
          src={
            event.image ||
            FALLBACK_IMAGE
          }
          alt={
            event.title
          }
          loading="lazy"
          onError={(
            imageEvent
          ) => {
            const image =
              imageEvent.currentTarget;

            if (
              image.dataset
                .fallbackApplied ===
              "true"
            ) {
              return;
            }

            image.dataset.fallbackApplied =
              "true";

            image.src =
              FALLBACK_IMAGE;
          }}
        />

        <div className="events-pulse-card__shade" />

        <div className="events-pulse-card__top">
          {event.live && (
            <span className="events-pulse-card__live">
              <i />

              LIVE
            </span>
          )}

          <span className="events-pulse-card__people">
            <Users
              size={12}
            />

            {formatNumber(
              event.people
            )}
          </span>
        </div>

        <div className="events-pulse-card__media-copy">
          <span>
            <MapPin
              size={13}
            />

            {
              event.location
            }
          </span>

          <h3>
            {
              event.title
            }
          </h3>
        </div>
      </div>

      <div className="events-pulse-card__body">
        <div className="events-pulse-card__meta">
          <span>
            <Clock3
              size={13}
            />

            {
              event.time
            }
          </span>

          <span>
            <MapPin
              size={13}
            />

            {
              event.city
            }
          </span>
        </div>

        <div className="events-pulse-card__friends">
          <div>
            {[
              "М",
              "С",
              "О",
            ].map(
              (
                letter,
                index
              ) => (
                <span
                  key={
                    `${letter}-${index}`
                  }
                >
                  {
                    letter
                  }
                </span>
              )
            )}
          </div>

          <p>
            <strong>
              {
                event.friends
              }
            </strong>{" "}
            друзів вже тут
          </p>
        </div>

        <div className="events-pulse-card__actions">
          {event.live ? (
            <button
              type="button"
              className="is-live"
              onClick={() =>
                onNavigate?.(
                  "live"
                )
              }
            >
              <Radio
                size={15}
              />

              Дивитися LIVE
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "cityPulse",
                  {
                    cityId:
                      event.cityId,
                  }
                )
              }
            >
              <Activity
                size={15}
              />

              PULSE події
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "events"
              )
            }
          >
            Деталі

            <ArrowRight
              size={14}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function EventsPulsePage({
  onNavigate,
}) {
  const [
    createRequestKey,
    setCreateRequestKey,
  ] = useState(0);

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
        JSON.parse(
          raw
        );

      const payload =
        parsed?.payload ||
        {};

      if (
        parsed?.route ===
          "events" &&
        payload?.createEvent &&
        payload?.source ===
          "createHub"
      ) {
        setCreateRequestKey(
          (value) =>
            value + 1
        );

        sessionStorage.removeItem(
          "yatut-open-route-payload"
        );
      }
    } catch (error) {
      console.warn(
        "EVENT CREATE ROUTE ERROR:",
        error
      );
    }
  }, []);

  const eventVideos =
    useMemo(
      () => {
        const events =
          Array.isArray(
            pulseRecommendations.events
          )
            ? pulseRecommendations.events
            : [];

        const live =
          Array.isArray(
            pulseRecommendations.live
          )
            ? pulseRecommendations.live
            : [];

        const nearby =
          Array.isArray(
            pulseRecommendations.nearby
          )
            ? pulseRecommendations.nearby
            : [];

        const combined = [
          ...events,
          ...live,
          ...nearby,
        ];

        const unique = [];

        combined.forEach(
          (video) => {
            if (
              !video ||
              unique.some(
                (item) =>
                  item.id ===
                  video.id
              )
            ) {
              return;
            }

            unique.push(
              video
            );
          }
        );

        return unique.slice(
          0,
          4
        );
      },
      []
    );

  function openVideo(
    video
  ) {
    if (!video) {
      return;
    }

    if (
      video.isLive ||
      video.type ===
        "live"
    ) {
      onNavigate?.(
        "live",
        {
          videoId:
            video.id,
        }
      );

      return;
    }

    if (
      video.type ===
      "clip"
    ) {
      onNavigate?.(
        "clips",
        {
          videoId:
            video.id,
        }
      );

      return;
    }

    onNavigate?.(
      "watch",
      {
        videoId:
          video.id,
      }
    );
  }

  return (
    <div className="events-pulse-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="events-pulse-hero">
        <div className="events-pulse-hero__glow" />

        <div className="events-pulse-hero__copy">
          <span className="events-pulse-hero__eyebrow">
            <Activity
              size={15}
            />

            ЯТУТ PULSE · ПОДІЇ
          </span>

          <h1>
            Події, які
            живуть прямо зараз
          </h1>

          <p>
            Дивись LIVE,
            відео з місця,
            знаходь друзів
            і бач, скільки людей
            вже на події.
          </p>

          <div className="events-pulse-hero__buttons">
            <button
              type="button"
              className="is-primary"
              onClick={() =>
                setCreateRequestKey(
                  (value) =>
                    value + 1
                )
              }
            >
              <Plus
                size={17}
              />

              Створити подію
            </button>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "live"
                )
              }
            >
              <Radio
                size={17}
              />

              LIVE зараз
            </button>
          </div>
        </div>

        <div className="events-pulse-hero__status">
          <span className="events-pulse-hero__calendar">
            <CalendarDays
              size={29}
            />
          </span>

          <strong>
            24
          </strong>

          <small>
            події сьогодні
          </small>

          <div>
            <i />

            6 LIVE зараз
          </div>
        </div>
      </section>

      {/* =================================================
          EVENT STATS
      ================================================= */}

      <section className="events-pulse-stats">
        <article>
          <span>
            <CalendarDays
              size={19}
            />
          </span>

          <div>
            <strong>
              24
            </strong>

            <small>
              події сьогодні
            </small>
          </div>
        </article>

        <article>
          <span>
            <Users
              size={19}
            />
          </span>

          <div>
            <strong>
              8,4K
            </strong>

            <small>
              людей на подіях
            </small>
          </div>
        </article>

        <article>
          <span>
            <Radio
              size={19}
            />
          </span>

          <div>
            <strong>
              6
            </strong>

            <small>
              LIVE зараз
            </small>
          </div>
        </article>

        <article>
          <span>
            <Sparkles
              size={19}
            />
          </span>

          <div>
            <strong>
              18
            </strong>

            <small>
              друзів беруть участь
            </small>
          </div>
        </article>
      </section>

      {/* =================================================
          YATUT EVENT ECOSYSTEM
      ================================================= */}

      <section className="events-pulse-bridges">
        <button
          type="button"
          className="events-pulse-bridge events-pulse-bridge--communities"
          onClick={() =>
            onNavigate?.(
              "communities"
            )
          }
        >
          <span className="events-pulse-bridge__icon">
            <Users
              size={21}
            />
          </span>

          <div>
            <small>
              СПІЛЬНОТИ
            </small>

            <strong>
              Подія починається зі своїх
            </strong>

            <p>
              Створюй зустрічі від імені спільнот і збирай учасників в одному просторі.
            </p>
          </div>

          <ArrowRight
            size={18}
          />
        </button>

        <button
          type="button"
          className="events-pulse-bridge events-pulse-bridge--nearby"
          onClick={() =>
            onNavigate?.(
              "nearby"
            )
          }
        >
          <span className="events-pulse-bridge__icon">
            <Compass
              size={21}
            />
          </span>

          <div>
            <small>
              ПОРУЧ
            </small>

            <strong>
              Знайди, що відбувається поряд
            </strong>

            <p>
              Події стають частиною живої карти міста разом із місцями, людьми та активностями.
            </p>
          </div>

          <ArrowRight
            size={18}
          />
        </button>

        <button
          type="button"
          className="events-pulse-bridge events-pulse-bridge--pulse"
          onClick={() =>
            onNavigate?.(
              "pulse"
            )
          }
        >
          <span className="events-pulse-bridge__icon">
            <Activity
              size={21}
            />
          </span>

          <div>
            <small>
              PULSE
            </small>

            <strong>
              Побач подію наживо
            </strong>

            <p>
              LIVE, кліпи й відео з місця показують атмосферу ще до того, як ти приєднаєшся.
            </p>
          </div>

          <ArrowRight
            size={18}
          />
        </button>
      </section>

      {/* =================================================
          EVENTS NOW
      ================================================= */}

      <section className="events-pulse-now">
        <header>
          <div>
            <span>
              <CalendarDays
                size={18}
              />
            </span>

            <div>
              <strong>
                Події прямо зараз
              </strong>

              <small>
                Місця, де вже
                щось відбувається
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "nearby"
              )
            }
          >
            Поруч

            <ArrowRight
              size={15}
            />
          </button>
        </header>

        <div className="events-pulse-now__grid">
          {eventCards.map(
            (event) => (
              <PulseEventCard
                key={
                  event.id
                }
                event={
                  event
                }
                onNavigate={
                  onNavigate
                }
              />
            )
          )}
        </div>
      </section>

      {/* =================================================
          VIDEO EVENTS
      ================================================= */}

      <section className="events-pulse-videos">
        <header>
          <div>
            <span>
              <Radio
                size={18}
              />
            </span>

            <div>
              <strong>
                Відео подій
              </strong>

              <small>
                Подивись атмосферу
                перед тим, як іти
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "pulse"
              )
            }
          >
            Більше

            <ArrowRight
              size={15}
            />
          </button>
        </header>

        {eventVideos.length ? (
          <div className="events-pulse-videos__grid">
            {eventVideos.map(
              (
                video,
                index
              ) => (
                <PulseVideoCard
                  key={
                    video.id
                  }
                  video={
                    video
                  }
                  variant={
                    index ===
                    0
                      ? "feature"
                      : video.type ===
                        "clip"
                      ? "clip"
                      : "wide"
                  }
                  onOpen={
                    openVideo
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="events-pulse-videos__empty">
            <Radio
              size={25}
            />

            <strong>
              Відео подій
              зʼявляться тут
            </strong>

            <span>
              PULSE автоматично
              покаже живий контент
              із подій.
            </span>
          </div>
        )}
      </section>

      {/* =================================================
          PEOPLE AT EVENTS
      ================================================= */}

      <section className="events-pulse-people">
        <div className="events-pulse-people__copy">
          <span className="events-pulse-people__icon">
            <Users
              size={21}
            />
          </span>

          <div>
            <small>
              ТВОЇ ЛЮДИ
            </small>

            <strong>
              18 друзів сьогодні
              на подіях
            </strong>

            <p>
              Побач, хто вже там,
              хто планує піти
              і що вони дивляться.
            </p>
          </div>
        </div>

        <div className="events-pulse-people__avatars">
          {[
            "М",
            "О",
            "С",
            "А",
            "Д",
          ].map(
            (
              avatar,
              index
            ) => (
              <button
                type="button"
                key={
                  `${avatar}-${index}`
                }
                onClick={() =>
                  onNavigate?.(
                    "friends"
                  )
                }
              >
                {
                  avatar
                }

                {index <
                  3 && (
                  <i />
                )}
              </button>
            )
          )}

          <span>
            +13
          </span>
        </div>

        <button
          type="button"
          className="events-pulse-people__button"
          onClick={() =>
            onNavigate?.(
              "friends"
            )
          }
        >
          Дивитися друзів

          <ArrowRight
            size={15}
          />
        </button>
      </section>

      {/* =================================================
          EVENT → CITY PULSE
      ================================================= */}

      <section className="events-pulse-city">
        <div>
          <span>
            <MapPin
              size={21}
            />
          </span>

          <div>
            <small>
              PULSE МІСТА
            </small>

            <strong>
              Події — частина
              живого Києва
            </strong>

            <p>
              Відкрий місто
              і побач усі LIVE,
              відео, людей
              та місця разом.
            </p>
          </div>
        </div>

        <button
          type="button"
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
          Київ зараз

          <ArrowRight
            size={15}
          />
        </button>
      </section>

      {/* =================================================
          OLD EVENTS
      ================================================= */}

      <section className="events-pulse-existing">
        <Events
          onNavigate={
            onNavigate
          }
          createRequestKey={
            createRequestKey
          }
        />
      </section>
    </div>
  );
}