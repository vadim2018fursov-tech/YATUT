import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock3,
  Eye,
  MapPin,
  Play,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  pulseRecommendations,
  pulseVideos,
} from "../data/pulseMockData";

const FALLBACK_IMAGE =
  "/assets/yatut/cities/kyiv/hero.jpg";

const tabs = [
  {
    id: "overview",
    label: "Огляд",
  },
  {
    id: "content",
    label: "Контент",
  },
  {
    id: "audience",
    label: "Аудиторія",
  },
  {
    id: "pulse",
    label: "PULSE",
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
    return `${Math.round(
      number /
      1000
    )}K`;
  }

  return String(
    number
  );
}

function getVideos() {
  const source = [
    ...(pulseVideos || []),
    ...(pulseRecommendations.forYou || []),
    ...(pulseRecommendations.nearby || []),
    ...(pulseRecommendations.city || []),
    ...(pulseRecommendations.events || []),
    ...(pulseRecommendations.live || []),
    ...(pulseRecommendations.wave || []),
  ];

  const unique = [];

  source.forEach(
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

  return unique;
}

function StudioMetric({
  icon: Icon,
  label,
  value,
  change,
  text,
}) {
  return (
    <article className="creator-studio-metric">
      <div className="creator-studio-metric__top">
        <span>
          <Icon
            size={18}
          />
        </span>

        {change && (
          <b>
            <TrendingUp
              size={12}
            />

            {change}
          </b>
        )}
      </div>

      <strong>
        {value}
      </strong>

      <small>
        {label}
      </small>

      {text && (
        <p>
          {text}
        </p>
      )}
    </article>
  );
}

export default function CreatorStudioPage({
  onNavigate,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "overview"
  );

  const videos =
    useMemo(
      () =>
        getVideos(),
      []
    );

  const topVideos =
    useMemo(
      () =>
        [...videos]
          .sort(
            (
              first,
              second
            ) =>
              Number(
                second.views ||
                  0
              ) -
              Number(
                first.views ||
                  0
              )
          )
          .slice(
            0,
            5
          ),
      [
        videos,
      ]
    );

  const totalViews =
    videos.reduce(
      (
        total,
        video
      ) =>
        total +
        Number(
          video.views ||
            0
        ),
      0
    );

  return (
    <div className="creator-studio-page">
      {/* ===============================================
          HEADER
      =============================================== */}

      <header className="creator-studio-header">
        <div>
          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "create"
              )
            }
          >
            <ArrowLeft
              size={18}
            />

            Створити
          </button>

          <span>
            <Sparkles
              size={16}
            />

            ЯТУТ CREATOR
          </span>

          <h1>
            Creator Studio
          </h1>

          <p>
            Статистика твоїх
            відео, Clips, LIVE
            та активності
            в ЯТУТ PULSE.
          </p>
        </div>

        <div className="creator-studio-header__pulse">
          <span>
            <Activity
              size={20}
            />
          </span>

          <div>
            <small>
              PULSE ЗАРАЗ
            </small>

            <strong>
              428 людей
            </strong>

            <p>
              взаємодіють з
              твоїм контентом
            </p>
          </div>
        </div>
      </header>

      {/* ===============================================
          TABS
      =============================================== */}

      <nav className="creator-studio-tabs">
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

      {/* ===============================================
          METRICS
      =============================================== */}

      <section className="creator-studio-metrics">
        <StudioMetric
          icon={Eye}
          label="Перегляди"
          value={
            formatNumber(
              totalViews ||
                184200
            )
          }
          change="+18%"
          text="за останні 28 днів"
        />

        <StudioMetric
          icon={Users}
          label="Підписники"
          value="24,8K"
          change="+7,4%"
          text="+1 720 нових"
        />

        <StudioMetric
          icon={Clock3}
          label="Час перегляду"
          value="8 420 год"
          change="+12%"
          text="відео та влоги"
        />

        <StudioMetric
          icon={Activity}
          label="PULSE охоплення"
          value="38,4K"
          change="+26%"
          text="людей поруч"
        />
      </section>

      {/* ===============================================
          OVERVIEW
      =============================================== */}

      {activeTab ===
        "overview" && (
        <>
          <section className="creator-studio-dashboard">
            <article className="creator-studio-chart">
              <header>
                <div>
                  <BarChart3
                    size={18}
                  />

                  <div>
                    <strong>
                      Перегляди
                    </strong>

                    <small>
                      Останні
                      28 днів
                    </small>
                  </div>
                </div>

                <b>
                  +18%
                </b>
              </header>

              <div className="creator-studio-chart__visual">
                <div
                  style={{
                    height:
                      "32%",
                  }}
                />

                <div
                  style={{
                    height:
                      "47%",
                  }}
                />

                <div
                  style={{
                    height:
                      "42%",
                  }}
                />

                <div
                  style={{
                    height:
                      "58%",
                  }}
                />

                <div
                  style={{
                    height:
                      "53%",
                  }}
                />

                <div
                  style={{
                    height:
                      "72%",
                  }}
                />

                <div
                  style={{
                    height:
                      "68%",
                  }}
                />

                <div
                  style={{
                    height:
                      "84%",
                  }}
                />

                <div
                  style={{
                    height:
                      "76%",
                  }}
                />

                <div
                  style={{
                    height:
                      "94%",
                  }}
                />
              </div>

              <footer>
                <span>
                  16 сер
                </span>

                <span>
                  23 сер
                </span>

                <span>
                  30 сер
                </span>

                <span>
                  6 вер
                </span>

                <span>
                  Зараз
                </span>
              </footer>
            </article>

            <article className="creator-studio-live-card">
              <div className="creator-studio-live-card__icon">
                <Radio
                  size={22}
                />
              </div>

              <small>
                У РЕАЛЬНОМУ ЧАСІ
              </small>

              <strong>
                1 284
              </strong>

              <span>
                перегляди
                за останні
                60 хвилин
              </span>

              <div className="creator-studio-live-bars">
                {[
                  34,
                  48,
                  40,
                  58,
                  51,
                  67,
                  62,
                  76,
                  70,
                  88,
                  81,
                  96,
                ].map(
                  (
                    height,
                    index
                  ) => (
                    <i
                      key={
                        index
                      }
                      style={{
                        height:
                          `${height}%`,
                      }}
                    />
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "pulse"
                  )
                }
              >
                Відкрити PULSE
              </button>
            </article>
          </section>

          <section className="creator-studio-section">
            <header>
              <div>
                <Play
                  size={18}
                  fill="currentColor"
                />

                <div>
                  <strong>
                    Найкращі відео
                  </strong>

                  <small>
                    За переглядами
                  </small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "content"
                  )
                }
              >
                Увесь контент
              </button>
            </header>

            <div className="creator-studio-top-videos">
              {topVideos.map(
                (
                  video,
                  index
                ) => (
                  <button
                    type="button"
                    key={
                      video.id
                    }
                    onClick={() =>
                      onNavigate?.(
                        video.type ===
                          "clip"
                          ? "clips"
                          : "watch",
                        {
                          videoId:
                            video.id,
                        }
                      )
                    }
                  >
                    <span className="creator-studio-top-videos__number">
                      {index +
                        1}
                    </span>

                    <div className="creator-studio-top-videos__media">
                      <img
                        src={
                          video.thumbnail ||
                          FALLBACK_IMAGE
                        }
                        alt=""
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGE;
                        }}
                      />
                    </div>

                    <div className="creator-studio-top-videos__copy">
                      <strong>
                        {
                          video.title
                        }
                      </strong>

                      <span>
                        {
                          video.type ===
                          "clip"
                            ? "Clip"
                            : "Відео"
                        }
                      </span>
                    </div>

                    <div className="creator-studio-top-videos__views">
                      <Eye
                        size={14}
                      />

                      {formatNumber(
                        video.views
                      )}
                    </div>
                  </button>
                )
              )}
            </div>
          </section>
        </>
      )}

      {/* ===============================================
          CONTENT
      =============================================== */}

      {activeTab ===
        "content" && (
        <section className="creator-studio-section">
          <header>
            <div>
              <Video
                size={18}
              />

              <div>
                <strong>
                  Твій контент
                </strong>

                <small>
                  Відео, Clips,
                  LIVE та PULSE
                </small>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "create"
                )
              }
            >
              + Створити
            </button>
          </header>

          <div className="creator-studio-content-table">
            {videos.map(
              (video) => (
                <article
                  key={
                    video.id
                  }
                >
                  <img
                    src={
                      video.thumbnail ||
                      FALLBACK_IMAGE
                    }
                    alt=""
                    onError={(
                      event
                    ) => {
                      event.currentTarget.src =
                        FALLBACK_IMAGE;
                    }}
                  />

                  <div>
                    <strong>
                      {
                        video.title
                      }
                    </strong>

                    <span>
                      {
                        video.type ===
                        "clip"
                          ? "Clip"
                          : video.isLive
                          ? "LIVE"
                          : "Відео"
                      }
                    </span>
                  </div>

                  <span>
                    <Eye
                      size={13}
                    />

                    {formatNumber(
                      video.views
                    )}
                  </span>

                  <span>
                    94%
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate?.(
                        video.type ===
                          "clip"
                          ? "clips"
                          : "watch",
                        {
                          videoId:
                            video.id,
                        }
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

      {/* ===============================================
          AUDIENCE
      =============================================== */}

      {activeTab ===
        "audience" && (
        <section className="creator-studio-audience">
          <article>
            <header>
              <Users
                size={18}
              />

              <div>
                <strong>
                  Твоя аудиторія
                </strong>

                <small>
                  За останні
                  28 днів
                </small>
              </div>
            </header>

            <div className="creator-studio-audience__big">
              24,8K
            </div>

            <span>
              постійних
              підписників
            </span>

            <div className="creator-studio-audience__line">
              <i
                style={{
                  width:
                    "72%",
                }}
              />

              <b>
                72%
              </b>

              <span>
                повертаються
                до твоїх відео
              </span>
            </div>
          </article>

          <article>
            <header>
              <MapPin
                size={18}
              />

              <div>
                <strong>
                  Міста
                </strong>

                <small>
                  Де тебе
                  дивляться
                </small>
              </div>
            </header>

            <div className="creator-studio-cities">
              <div>
                <strong>
                  Київ
                </strong>

                <span>
                  42%
                </span>
              </div>

              <div>
                <strong>
                  Львів
                </strong>

                <span>
                  18%
                </span>
              </div>

              <div>
                <strong>
                  Одеса
                </strong>

                <span>
                  14%
                </span>
              </div>

              <div>
                <strong>
                  Дніпро
                </strong>

                <span>
                  11%
                </span>
              </div>

              <div>
                <strong>
                  Інші
                </strong>

                <span>
                  15%
                </span>
              </div>
            </div>
          </article>

          <article>
            <header>
              <Clock3
                size={18}
              />

              <div>
                <strong>
                  Коли дивляться
                </strong>

                <small>
                  Найактивніший час
                </small>
              </div>
            </header>

            <div className="creator-studio-time">
              <strong>
                19:00–23:00
              </strong>

              <span>
                найкращий час
                для публікації
              </span>

              <div>
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ===============================================
          PULSE ANALYTICS
      =============================================== */}

      {activeTab ===
        "pulse" && (
        <section className="creator-studio-pulse">
          <div className="creator-studio-pulse__hero">
            <Activity
              size={27}
            />

            <div>
              <small>
                ЯТУТ PULSE
              </small>

              <strong>
                Твій живий вплив
              </strong>

              <p>
                Як твій контент
                поширюється між
                містами, людьми
                та реальними місцями.
              </p>
            </div>
          </div>

          <div className="creator-studio-pulse__grid">
            <article>
              <strong>
                38,4K
              </strong>

              <span>
                людей побачили
                тебе через PULSE
              </span>
            </article>

            <article>
              <strong>
                6 820
              </strong>

              <span>
                відкриттів
                через «Поруч»
              </span>
            </article>

            <article>
              <strong>
                2 140
              </strong>

              <span>
                натискань
                «Я ТУТ»
              </span>
            </article>

            <article>
              <strong>
                5 міст
              </strong>

              <span>
                продовжили
                твої хвилі
              </span>
            </article>
          </div>

          <section className="creator-studio-pulse-map">
            <header>
              <MapPin
                size={18}
              />

              <div>
                <strong>
                  Де живе
                  твій PULSE
                </strong>

                <small>
                  Географія
                  взаємодій
                </small>
              </div>
            </header>

            <div>
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
                <strong>
                  Київ
                </strong>

                <span>
                  12,4K
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "cityPulse",
                    {
                      cityId:
                        "lviv",
                    }
                  )
                }
              >
                <strong>
                  Львів
                </strong>

                <span>
                  6,2K
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "cityPulse",
                    {
                      cityId:
                        "odesa",
                    }
                  )
                }
              >
                <strong>
                  Одеса
                </strong>

                <span>
                  8,7K
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "cityPulse",
                    {
                      cityId:
                        "dnipro",
                    }
                  )
                }
              >
                <strong>
                  Дніпро
                </strong>

                <span>
                  5,1K
                </span>
              </button>
            </div>
          </section>
        </section>
      )}
    </div>
  );
}