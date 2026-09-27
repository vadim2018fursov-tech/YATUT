import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bookmark,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadCreatorStudioData,
} from "../services/creatorStudioService";

import {
  subscribePulseRealtime,
} from "../services/realtimeService";

const FALLBACK_IMAGE =
  "/assets/yatut/cities/kyiv/hero.jpg";

const tabs = [
  {
    id:
      "overview",
    label:
      "Огляд",
  },
  {
    id:
      "content",
    label:
      "Контент",
  },
  {
    id:
      "audience",
    label:
      "Аудиторія",
  },
  {
    id:
      "pulse",
    label:
      "PULSE",
  },
];

function formatNumber(
  value
) {
  const number =
    Number(
      value ||
      0
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
    )}M`;
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

function formatChange(
  value
) {
  const number =
    Number(
      value ||
      0
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }

  return `${number > 0 ? "+" : ""}${number}%`;
}

function StudioMetric({
  icon:
    Icon,
  label,
  value,
  change = null,
  text,
}) {
  const positive =
    Number(
      change
    ) >=
    0;

  return (
    <article className="creator-studio-metric">
      <div className="creator-studio-metric__top">
        <span>
          <Icon
            size={18}
          />
        </span>

        {change !==
          null && (
          <b
            className={
              positive
                ? ""
                : "is-negative"
            }
          >
            {positive ? (
              <TrendingUp
                size={12}
              />
            ) : (
              <TrendingDown
                size={12}
              />
            )}

            {formatChange(
              change
            )}
          </b>
        )}
      </div>

      <strong>
        {
          value
        }
      </strong>

      <small>
        {
          label
        }
      </small>

      {text && (
        <p>
          {
            text
          }
        </p>
      )}
    </article>
  );
}

function emptyStudioData() {
  return {
    videos:
      [],
    followersCount:
      0,
    daily:
      [],
    current28: {
      views:
        0,
      likes:
        0,
      comments:
        0,
      saves:
        0,
      shares:
        0,
    },
    previous28: {
      views:
        0,
      likes:
        0,
      comments:
        0,
      saves:
        0,
      shares:
        0,
    },
    changes: {
      views:
        0,
      likes:
        0,
      comments:
        0,
      saves:
        0,
      shares:
        0,
    },
    cumulative: {
      views:
        0,
      likes:
        0,
      comments:
        0,
      saves:
        0,
      shares:
        0,
    },
    today: {
      views:
        0,
      likes:
        0,
      comments:
        0,
      saves:
        0,
      shares:
        0,
    },
  };
}

export default function CreatorStudioPage({
  onNavigate,
  authSession = null,
}) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "overview"
    );

  const [
    data,
    setData,
  ] =
    useState(
      emptyStudioData
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );

  useEffect(
    () => {
      if (
        !authSession?.user?.id
      ) {
        setData(
          emptyStudioData()
        );

        setLoading(
          false
        );

        return;
      }

      let active =
        true;

      let timer =
        null;

      async function refresh() {
        try {
          setError(
            ""
          );

          const next =
            await loadCreatorStudioData(
              authSession
            );

          if (
            active
          ) {
            setData(
              next
            );
          }
        } catch (
          loadError
        ) {
          console.warn(
            "CREATOR STUDIO LOAD ERROR:",
            loadError
          );

          if (
            active
          ) {
            setError(
              "Не вдалося завантажити аналітику PULSE."
            );
          }
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      }

      setLoading(
        true
      );

      refresh();

      const realtime =
        subscribePulseRealtime({
          session:
            authSession,
          onChange:
            () => {
              window.clearTimeout(
                timer
              );

              timer =
                window.setTimeout(
                  refresh,
                  180
                );
            },
        });

      return () => {
        active =
          false;

        window.clearTimeout(
          timer
        );

        realtime?.close?.();
      };
    },
    [
      authSession?.user?.id,
      authSession?.access_token,
    ]
  );

  const videos =
    data.videos ||
    [];

  const topVideos =
    useMemo(
      () =>
        [
          ...videos,
        ]
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

  const current28 =
    data.current28 ||
    emptyStudioData()
      .current28;

  const cumulative =
    data.cumulative ||
    emptyStudioData()
      .cumulative;

  const today =
    data.today ||
    emptyStudioData()
      .today;

  const todayInteractions =
    Number(
      today.likes ||
      0
    ) +
    Number(
      today.comments ||
      0
    ) +
    Number(
      today.saves ||
      0
    ) +
    Number(
      today.shares ||
      0
    );

  const periodInteractions =
    Number(
      current28.likes ||
      0
    ) +
    Number(
      current28.comments ||
      0
    ) +
    Number(
      current28.saves ||
      0
    ) +
    Number(
      current28.shares ||
      0
    );

  const cumulativeInteractions =
    Number(
      cumulative.likes ||
      0
    ) +
    Number(
      cumulative.comments ||
      0
    ) +
    Number(
      cumulative.saves ||
      0
    ) +
    Number(
      cumulative.shares ||
      0
    );

  const engagementRate =
    cumulative.views >
      0
      ? (
          (
            cumulativeInteractions /
            cumulative.views
          ) *
          100
        ).toFixed(
          1
        )
      : "0.0";

  const chart =
    data.daily ||
    [];

  const chartMax =
    Math.max(
      1,
      ...chart.map(
        (
          point
        ) =>
          Number(
            point.views ||
            0
          )
      )
    );

  const chartBars =
    chart.filter(
      (
        _,
        index
      ) =>
        index %
          2 ===
          0 ||
        index ===
          chart.length -
            1
    );

  if (
    loading &&
    !videos.length
  ) {
    return (
      <section className="creator-studio-loading">
        <span />

        <strong>
          Завантажуємо Creator Studio…
        </strong>

        <small>
          Реальні дані ЯТУТ PULSE
        </small>
      </section>
    );
  }

  return (
    <div className="creator-studio-page">
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
            Реальна статистика твоїх відео, Clips і активності в ЯТУТ PULSE.
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
              СЬОГОДНІ
            </small>

            <strong>
              {formatNumber(
                todayInteractions
              )} взаємодій
            </strong>

            <p>
              {formatNumber(
                today.views
              )} переглядів
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="creator-studio-error">
          {
            error
          }
        </div>
      )}

      <nav className="creator-studio-tabs">
        {tabs.map(
          (
            tab
          ) => (
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

      <section className="creator-studio-metrics">
        <StudioMetric
          icon={
            Eye
          }
          label="Перегляди"
          value={
            formatNumber(
              cumulative.views
            )
          }
          change={
            data.changes
              ?.views ??
            0
          }
          text="зміна за останні 28 днів"
        />

        <StudioMetric
          icon={
            Users
          }
          label="Підписники"
          value={
            formatNumber(
              data.followersCount
            )
          }
          text="реальні підписки на автора"
        />

        <StudioMetric
          icon={
            Heart
          }
          label="Взаємодії"
          value={
            formatNumber(
              periodInteractions
            )
          }
          change={
            data.changes
              ?.likes ??
            0
          }
          text="за останні 28 днів"
        />

        <StudioMetric
          icon={
            Activity
          }
          label="Engagement"
          value={
            `${engagementRate}%`
          }
          text="від усіх переглядів"
        />
      </section>

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
                      Останні 28 днів
                    </small>
                  </div>
                </div>

                <b>
                  {formatChange(
                    data.changes
                      ?.views ??
                    0
                  )}
                </b>
              </header>

              <div className="creator-studio-chart__visual">
                {chartBars.map(
                  (
                    point
                  ) => (
                    <div
                      key={
                        point.day
                      }
                      title={
                        `${point.label}: ${formatNumber(
                          point.views
                        )}`
                      }
                      style={{
                        height:
                          `${Math.max(
                            4,
                            Math.round(
                              (
                                point.views /
                                chartMax
                              ) *
                                100
                            )
                          )}%`,
                      }}
                    />
                  )
                )}
              </div>

              <footer>
                <span>
                  {
                    chart[0]
                      ?.label ||
                    "—"
                  }
                </span>

                <span>
                  {
                    chart[
                      Math.floor(
                        chart.length /
                        3
                      )
                    ]?.label ||
                    "—"
                  }
                </span>

                <span>
                  {
                    chart[
                      Math.floor(
                        (
                          chart.length *
                          2
                        ) /
                        3
                      )
                    ]?.label ||
                    "—"
                  }
                </span>

                <span>
                  Зараз
                </span>
              </footer>
            </article>

            <article className="creator-studio-live-card">
              <div className="creator-studio-live-card__icon">
                <Activity
                  size={22}
                />
              </div>

              <small>
                СЬОГОДНІ
              </small>

              <strong>
                {formatNumber(
                  today.views
                )}
              </strong>

              <span>
                реальних переглядів сьогодні
              </span>

              <div className="creator-studio-live-stats">
                <span>
                  <Heart
                    size={13}
                  />
                  {formatNumber(
                    today.likes
                  )}
                </span>

                <span>
                  <MessageCircle
                    size={13}
                  />
                  {formatNumber(
                    today.comments
                  )}
                </span>

                <span>
                  <Bookmark
                    size={13}
                  />
                  {formatNumber(
                    today.saves
                  )}
                </span>

                <span>
                  <Share2
                    size={13}
                  />
                  {formatNumber(
                    today.shares
                  )}
                </span>
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
                    За реальними переглядами
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

            {topVideos.length ? (
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
                          {video.type ===
                          "clip"
                            ? "Clip"
                            : "Відео"}
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
            ) : (
              <StudioEmpty
                title="Контенту поки немає"
                text="Опублікуй перше відео або Clip — воно одразу зʼявиться в аналітиці."
                onAction={() =>
                  onNavigate?.(
                    "create"
                  )
                }
              />
            )}
          </section>
        </>
      )}

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
                  Реальні відео PULSE
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

          {videos.length ? (
            <div className="creator-studio-content-table">
              {videos.map(
                (
                  video
                ) => {
                  const interactions =
                    Number(
                      video.likes ||
                      0
                    ) +
                    Number(
                      video.comments ||
                      0
                    ) +
                    Number(
                      video.saves ||
                      0
                    ) +
                    Number(
                      video.shares ||
                      0
                    );

                  const rate =
                    Number(
                      video.views ||
                      0
                    ) >
                    0
                      ? (
                          (
                            interactions /
                            Number(
                              video.views
                            )
                          ) *
                          100
                        ).toFixed(
                          1
                        )
                      : "0.0";

                  return (
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
                          {video.type ===
                          "clip"
                            ? "Clip"
                            : "Відео"}
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
                        {rate}%
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
                  );
                }
              )}
            </div>
          ) : (
            <StudioEmpty
              title="Ще немає відео"
              text="Створи перший матеріал у PULSE, щоб почати збирати реальну статистику."
              onAction={() =>
                onNavigate?.(
                  "create"
                )
              }
            />
          )}
        </section>
      )}

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
                  Реальні підписники
                </small>
              </div>
            </header>

            <div className="creator-studio-audience__big">
              {formatNumber(
                data.followersCount
              )}
            </div>

            <span>
              підписників автора
            </span>

            <div className="creator-studio-audience__line">
              <i
                style={{
                  width:
                    `${Math.min(
                      100,
                      Number(
                        engagementRate
                      ) *
                        5
                    )}%`,
                }}
              />

              <b>
                {
                  engagementRate
                }%
              </b>

              <span>
                загальна взаємодія
              </span>
            </div>
          </article>

          <article>
            <header>
              <Activity
                size={18}
              />

              <div>
                <strong>
                  28 днів
                </strong>

                <small>
                  Поведінка аудиторії
                </small>
              </div>
            </header>

            <div className="creator-studio-audience__big">
              {formatNumber(
                periodInteractions
              )}
            </div>

            <span>
              лайків, коментарів, збережень і поширень
            </span>
          </article>

          <article>
            <header>
              <MapPin
                size={18}
              />

              <div>
                <strong>
                  Географія глядачів
                </strong>

                <small>
                  Приватність перш за все
                </small>
              </div>
            </header>

            <div className="creator-studio-audience__notice">
              <strong>
                Даних поки немає
              </strong>

              <span>
                ЯТУТ не вигадує міста аудиторії. Географія зʼявиться після окремого consent-based модуля аналітики.
              </span>
            </div>
          </article>
        </section>
      )}

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
                Твій реальний вплив
              </strong>

              <p>
                Статистика формується з фактичних переглядів та взаємодій.
              </p>
            </div>
          </div>

          <div className="creator-studio-pulse__grid">
            <article>
              <strong>
                {formatNumber(
                  cumulative.views
                )}
              </strong>

              <span>
                переглядів
              </span>
            </article>

            <article>
              <strong>
                {formatNumber(
                  cumulative.likes
                )}
              </strong>

              <span>
                лайків
              </span>
            </article>

            <article>
              <strong>
                {formatNumber(
                  cumulative.saves
                )}
              </strong>

              <span>
                збережень
              </span>
            </article>

            <article>
              <strong>
                {formatNumber(
                  cumulative.shares
                )}
              </strong>

              <span>
                поширень
              </span>
            </article>
          </div>

          <section className="creator-studio-pulse-map creator-studio-pulse-map--real">
            <header>
              <BarChart3
                size={18}
              />

              <div>
                <strong>
                  Взаємодії за 28 днів
                </strong>

                <small>
                  Реальні події PULSE
                </small>
              </div>
            </header>

            <div className="creator-studio-pulse-breakdown">
              <span>
                <Heart
                  size={15}
                />
                <b>
                  {formatNumber(
                    current28.likes
                  )}
                </b>
                лайки
              </span>

              <span>
                <MessageCircle
                  size={15}
                />
                <b>
                  {formatNumber(
                    current28.comments
                  )}
                </b>
                коментарі
              </span>

              <span>
                <Bookmark
                  size={15}
                />
                <b>
                  {formatNumber(
                    current28.saves
                  )}
                </b>
                збереження
              </span>

              <span>
                <Share2
                  size={15}
                />
                <b>
                  {formatNumber(
                    current28.shares
                  )}
                </b>
                поширення
              </span>
            </div>
          </section>
        </section>
      )}
    </div>
  );
}

function StudioEmpty({
  title,
  text,
  onAction,
}) {
  return (
    <div className="creator-studio-empty">
      <Sparkles
        size={25}
      />

      <strong>
        {
          title
        }
      </strong>

      <span>
        {
          text
        }
      </span>

      {onAction && (
        <button
          type="button"
          onClick={
            onAction
          }
        >
          Створити контент
        </button>
      )}
    </div>
  );
}
