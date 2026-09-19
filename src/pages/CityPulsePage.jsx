import {
  ArrowLeft,
  CalendarDays,
  Map,
  MapPin,
  Play,
  Radio,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import PulseVideoCard from "../components/pulse/PulseVideoCard";
import YatutHereButton from "../components/pulse/YatutHereButton";

import {
  getRegion,
  formatPeopleNow,
} from "../data/regions";

import {
  pulseRecommendations,
  pulseVideos,
} from "../data/pulseMockData";

const tabs = [
  {
    id: "overview",
    label: "Огляд",
  },
  {
    id: "people",
    label: "Люди",
  },
  {
    id: "events",
    label: "Події",
  },
  {
    id: "videos",
    label: "Відео",
  },
];

function CityStat({
  icon: Icon,
  value,
  label,
  kind = "purple",
}) {
  return (
    <article
      className={`city-pulse-stat city-pulse-stat--${kind}`}
    >
      <span className="city-pulse-stat__icon">
        <Icon
          size={18}
        />
      </span>

      <div>
        <strong>
          {value}
        </strong>

        <small>
          {label}
        </small>
      </div>
    </article>
  );
}

export default function CityPulsePage({
  cityId = "kyiv",
  onNavigate,
}) {
  const region =
    getRegion(
      cityId
    );

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "overview"
  );

  const cityVideos =
    useMemo(
      () => {
        const exact =
          pulseVideos.filter(
            (video) =>
              video.city ===
              region.id
          );

        const fallback =
          pulseRecommendations.forYou ||
          [];

        return [
          ...exact,
          ...fallback.filter(
            (video) =>
              !exact.some(
                (item) =>
                  item.id ===
                  video.id
              )
          ),
        ].slice(
          0,
          6
        );
      },
      [
        region.id,
      ]
    );

  function openVideo(
    video
  ) {
    onNavigate?.(
      "clips",
      {
        videoId:
          video.id,
      }
    );
  }

  return (
    <div className="city-pulse-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="city-pulse-hero"
        style={{
          backgroundImage:
            `url("${region.backgrounds.hero}")`,
        }}
      >
        <div className="city-pulse-hero__shade" />

        <button
          type="button"
          className="city-pulse-hero__back"
          onClick={() =>
            onNavigate?.(
              "pulse"
            )
          }
        >
          <ArrowLeft
            size={19}
          />

          <span>
            PULSE
          </span>
        </button>

        <div className="city-pulse-hero__badge">
          <Radio
            size={14}
          />

          Місто зараз

          <i />
        </div>

        <div className="city-pulse-hero__content">
          <span className="city-pulse-hero__eyebrow">
            ЯТУТ PULSE
          </span>

          <h1>
            {
              region.name
            }
          </h1>

          <div className="city-pulse-hero__people">
            <Users
              size={20}
            />

            <strong>
              {formatPeopleNow(
                region.peopleNow
              )}
            </strong>

            <span>
              людей зараз тут
            </span>
          </div>

          <p>
            Дивись, що відбувається у місті просто зараз.
          </p>

          <div className="city-pulse-hero__actions">
            <YatutHereButton
              compact
            />

            <button
              type="button"
              className="city-pulse-hero__map"
              onClick={() =>
                onNavigate?.(
                  "nearby"
                )
              }
            >
              <Map
                size={17}
              />

              Показати на карті
            </button>
          </div>
        </div>

        <div className="city-pulse-hero__pulse">
          <span />
        </div>
      </section>

      {/* =================================================
          TABS
      ================================================= */}

      <nav className="city-pulse-tabs">
        {tabs.map(
          (tab) => (
            <button
              key={
                tab.id
              }
              type="button"
              className={
                activeTab ===
                tab.id
                  ? "is-active"
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
      </nav>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeTab ===
        "overview" && (
        <>
          <section className="city-pulse-stats">
            <CityStat
              icon={
                Users
              }
              value={
                formatPeopleNow(
                  region.peopleNow
                )
              }
              label="зараз тут"
              kind="purple"
            />

            <CityStat
              icon={
                MapPin
              }
              value={
                region.friendsNearby
              }
              label="друзів поруч"
              kind="blue"
            />

            <CityStat
              icon={
                CalendarDays
              }
              value={
                region.eventsToday
              }
              label="подій сьогодні"
              kind="pink"
            />

            <CityStat
              icon={
                Sparkles
              }
              value={
                region.newPlaces
              }
              label="нових місць"
              kind="orange"
            />
          </section>

          <section className="city-pulse-now">
            <header>
              <div>
                <span>
                  <Radio
                    size={17}
                  />
                </span>

                <div>
                  <strong>
                    Зараз у {
                      region.name
                    }
                  </strong>

                  <small>
                    Живий пульс міста
                  </small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "videos"
                  )
                }
              >
                Усі відео →
              </button>
            </header>

            <div className="city-pulse-feature-grid">
              {cityVideos
                .slice(
                  0,
                  3
                )
                .map(
                  (
                    video,
                    index
                  ) => (
                    <div
                      key={
                        video.id
                      }
                      className={
                        index ===
                        0
                          ? "city-pulse-feature-grid__main"
                          : "city-pulse-feature-grid__small"
                      }
                    >
                      <PulseVideoCard
                        video={
                          video
                        }
                        variant={
                          index ===
                          0
                            ? "feature"
                            : "wide"
                        }
                        onOpen={
                          openVideo
                        }
                      />
                    </div>
                  )
                )}
            </div>
          </section>

          <section className="city-pulse-location-card">
            <div className="city-pulse-location-card__icon">
              <MapPin
                size={23}
              />
            </div>

            <div className="city-pulse-location-card__copy">
              <span>
                ПУЛЬС МІСТА
              </span>

              <strong>
                {
                  region.name
                } живе прямо зараз
              </strong>

              <p>
                Люди, відео, події та місця обʼєднані в одному живому просторі.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "nearby"
                )
              }
            >
              <Map
                size={17}
              />

              Відкрити карту
            </button>
          </section>
        </>
      )}

      {/* =================================================
          PEOPLE
      ================================================= */}

      {activeTab ===
        "people" && (
        <section className="city-pulse-section">
          <header className="city-pulse-section__title">
            <Users
              size={19}
            />

            <div>
              <strong>
                Люди зараз тут
              </strong>

              <small>
                Активні користувачі {
                  region.name
                }
              </small>
            </div>
          </header>

          <div className="city-pulse-people-grid">
            {[
              "Марія",
              "Олександр",
              "Софія",
              "Максим",
              "Анастасія",
              "Юлія",
            ].map(
              (
                name,
                index
              ) => (
                <button
                  type="button"
                  key={
                    name
                  }
                  className="city-pulse-person"
                >
                  <span>
                    {
                      name.charAt(
                        0
                      )
                    }

                    <i />
                  </span>

                  <div>
                    <strong>
                      {
                        name
                      }
                    </strong>

                    <small>
                      {index +
                        1}{" "}
                      км від тебе
                    </small>
                  </div>
                </button>
              )
            )}
          </div>
        </section>
      )}

      {/* =================================================
          EVENTS
      ================================================= */}

      {activeTab ===
        "events" && (
        <section className="city-pulse-section">
          <header className="city-pulse-section__title">
            <CalendarDays
              size={19}
            />

            <div>
              <strong>
                Події сьогодні
              </strong>

              <small>
                {
                  region.eventsToday
                }{" "}
                подій у місті
              </small>
            </div>
          </header>

          <div className="city-pulse-events">
            <article>
              <span>
                LIVE
              </span>

              <div>
                <strong>
                  Вечір у центрі {
                    region.name
                  }
                </strong>

                <small>
                  Починається зараз
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "events"
                  )
                }
              >
                Відкрити
              </button>
            </article>

            <article>
              <span className="is-purple">
                СЬОГОДНІ
              </span>

              <div>
                <strong>
                  Міська зустріч ЯТУТ
                </strong>

                <small>
                  19:00 · {
                    region.name
                  }
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "events"
                  )
                }
              >
                Відкрити
              </button>
            </article>
          </div>
        </section>
      )}

      {/* =================================================
          VIDEOS
      ================================================= */}

      {activeTab ===
        "videos" && (
        <section className="city-pulse-section">
          <header className="city-pulse-section__title">
            <Video
              size={19}
            />

            <div>
              <strong>
                Популярні зараз
              </strong>

              <small>
                Відео з {
                  region.name
                }
              </small>
            </div>
          </header>

          <div className="city-pulse-video-grid">
            {cityVideos.map(
              (video) => (
                <PulseVideoCard
                  key={
                    video.id
                  }
                  video={
                    video
                  }
                  variant={
                    video.type ===
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
        </section>
      )}

      {/* =================================================
          BOTTOM CTA
      ================================================= */}

      <section className="city-pulse-bottom-cta">
        <div>
          <Play
            size={20}
            fill="currentColor"
          />

          <div>
            <strong>
              Покажи {
                region.name
              } своїми очима
            </strong>

            <span>
              Створи PULSE Момент прямо зараз
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate?.(
              "clips"
            )
          }
        >
          Створити момент
        </button>
      </section>
    </div>
  );
}