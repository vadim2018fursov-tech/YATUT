import {
  ArrowLeft,
  Bell,
  Check,
  Eye,
  MapPin,
  MessageCircle,
  Play,
  Radio,
  Share2,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PulseVideoCard from "../components/pulse/PulseVideoCard";

import {
  pulseRecommendations,
  pulseUsers,
  pulseVideos,
} from "../data/pulseMockData";

import {
  getPulseCreatorProfile,
  loadPulseMedia,
} from "../services/pulseBackendService";

import {
  isPulseBackendId,
  loadPulseCreatorSocialState,
  togglePulseFollow,
} from "../services/pulseSocialService";

import {
  subscribePulseRealtime,
} from "../services/realtimeService";

import {
  shareYatutItem,
} from "../utils/shareYatutItem";

const FALLBACK_IMAGE =
  "/assets/yatut/cities/kyiv/hero.jpg";

const tabs = [
  {
    id: "videos",
    label: "Відео",
  },
  {
    id: "clips",
    label: "Clips",
  },
  {
    id: "live",
    label: "LIVE",
  },
  {
    id: "waves",
    label: "Хвилі",
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

function getDemoVideos() {
  const source = [
    ...(pulseVideos || []),
    ...(pulseRecommendations.forYou || []),
    ...(pulseRecommendations.nearby || []),
    ...(pulseRecommendations.city || []),
    ...(pulseRecommendations.events || []),
    ...(pulseRecommendations.live || []),
    ...(pulseRecommendations.wave || []),
    ...(pulseRecommendations.following || []),
  ];

  const unique = [];

  source.forEach(
    (
      video
    ) => {
      if (
        !video ||
        unique.some(
          (
            item
          ) =>
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

export default function CreatorProfilePage({
  creatorId = "maria",
  onNavigate,
  authSession = null,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "videos"
  );

  const [
    realCreator,
    setRealCreator,
  ] = useState(null);

  const [
    backendVideos,
    setBackendVideos,
  ] = useState([]);

  const [
    subscribed,
    setSubscribed,
  ] = useState(false);

  const [
    followersCount,
    setFollowersCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    followBusy,
    setFollowBusy,
  ] = useState(false);

  const backendCreator =
    isPulseBackendId(
      creatorId
    );

  const isOwnProfile =
    Boolean(
      backendCreator &&
      authSession?.user?.id ===
        creatorId
    );

  useEffect(
    () => {
      if (
        !backendCreator
      ) {
        return;
      }

      let active =
        true;

      let refreshTimer =
        null;

      async function refresh() {
        try {
          setLoading(
            true
          );

          const [
            profile,
            videos,
            social,
          ] =
            await Promise.all([
              getPulseCreatorProfile(
                authSession,
                creatorId
              ),
              loadPulseMedia(
                authSession,
                {
                  limit:
                    100,
                  authorId:
                    creatorId,
                }
              ),
              loadPulseCreatorSocialState(
                authSession,
                creatorId
              ),
            ]);

          if (!active) {
            return;
          }

          setRealCreator(
            profile
          );

          setBackendVideos(
            videos
          );

          setSubscribed(
            Boolean(
              social.following
            )
          );

          setFollowersCount(
            Number(
              social.followersCount ||
              0
            )
          );
        } catch (
          error
        ) {
          console.warn(
            "PULSE CREATOR LOAD ERROR:",
            error
          );
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

      refresh();

      const realtime =
        authSession?.user?.id
          ? subscribePulseRealtime({
              session:
                authSession,
              onChange:
                () => {
                  window.clearTimeout(
                    refreshTimer
                  );

                  refreshTimer =
                    window.setTimeout(
                      refresh,
                      140
                    );
                },
            })
          : null;

      return () => {
        active =
          false;

        window.clearTimeout(
          refreshTimer
        );

        realtime?.close?.();
      };
    },
    [
      backendCreator,
      creatorId,
      authSession?.user?.id,
      authSession?.access_token,
    ]
  );

  const demoCreator =
    pulseUsers[
      creatorId
    ] ||
    pulseUsers.maria ||
    {
      id:
        "creator",
      name:
        "Автор ЯТУТ",
      username:
        "yatut.creator",
      initials:
        "Я",
    };

  const creator =
    realCreator ||
    demoCreator;

  const allVideos =
    useMemo(
      () =>
        backendCreator
          ? backendVideos
          : getDemoVideos(),
      [
        backendCreator,
        backendVideos,
      ]
    );

  const creatorVideos =
    useMemo(
      () => {
        if (
          backendCreator
        ) {
          return allVideos;
        }

        const exact =
          allVideos.filter(
            (
              video
            ) =>
              video.author
                ?.id ===
                creator.id ||
              video.author
                ?.username ===
                creator.username
          );

        if (
          exact.length
        ) {
          return exact;
        }

        return allVideos.slice(
          0,
          8
        );
      },
      [
        allVideos,
        backendCreator,
        creator.id,
        creator.username,
      ]
    );

  const filteredVideos =
    useMemo(
      () => {
        switch (
          activeTab
        ) {
          case "clips":
            return creatorVideos.filter(
              (
                video
              ) =>
                video.type ===
                "clip" &&
                video.pulseKind !==
                "wave"
            );

          case "live":
            return creatorVideos.filter(
              (
                video
              ) =>
                video.isLive ||
                video.type ===
                  "live"
            );

          case "waves":
            return creatorVideos.filter(
              (
                video
              ) =>
                video.pulseKind ===
                "wave"
            );

          default:
            return creatorVideos.filter(
              (
                video
              ) =>
                video.type !==
                  "clip" &&
                !video.isLive
            );
        }
      },
      [
        activeTab,
        creatorVideos,
      ]
    );

  const totalViews =
    useMemo(
      () =>
        creatorVideos.reduce(
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
        ),
      [
        creatorVideos,
      ]
    );

  const waveCount =
    useMemo(
      () =>
        creatorVideos.filter(
          (
            video
          ) =>
            video.pulseKind ===
            "wave"
        ).length,
      [
        creatorVideos,
      ]
    );

  const locationLabel =
    [
      creator.city,
      creator.country,
    ]
      .filter(
        Boolean
      )
      .join(
        " · "
      ) ||
    "Україна";

  async function shareCreatorProfile() {
    await shareYatutItem({
      title:
        `${creator.name} · ЯТУТ PULSE`,
      text:
        `@${creator.username} у ЯТУТ PULSE`,
      path:
        `#creator=${encodeURIComponent(
          creator.id
        )}`,
    });
  }

  async function toggleSubscribe() {
    if (
      isOwnProfile ||
      followBusy
    ) {
      return;
    }

    if (
      !backendCreator
    ) {
      setSubscribed(
        (
          value
        ) =>
          !value
      );

      return;
    }

    if (
      !authSession?.user?.id
    ) {
      return;
    }

    const previous =
      subscribed;

    const next =
      !previous;

    setFollowBusy(
      true
    );

    setSubscribed(
      next
    );

    setFollowersCount(
      (
        count
      ) =>
        Math.max(
          0,
          count +
            (
              next
                ? 1
                : -1
            )
        )
    );

    try {
      const result =
        await togglePulseFollow(
          authSession,
          creatorId
        );

      if (
        result !==
        next
      ) {
        setFollowersCount(
          (
            count
          ) =>
            Math.max(
              0,
              count +
                (
                  result
                    ? 1
                    : -1
                )
            )
        );
      }

      setSubscribed(
        result
      );
    } catch (
      error
    ) {
      console.warn(
        "PULSE CREATOR FOLLOW ERROR:",
        error
      );

      setSubscribed(
        previous
      );

      setFollowersCount(
        (
          count
        ) =>
          Math.max(
            0,
            count +
              (
                next
                  ? -1
                  : 1
              )
          )
      );
    } finally {
      setFollowBusy(
        false
      );
    }
  }

  function openVideo(
    video
  ) {
    if (!video) {
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

  if (
    backendCreator &&
    loading &&
    !realCreator
  ) {
    return (
      <section className="pulse-creator-loading">
        <span className="pulse-creator-loading__orb" />

        <strong>
          Завантажуємо автора…
        </strong>

        <small>
          ЯТУТ PULSE
        </small>
      </section>
    );
  }

  return (
    <div className="pulse-creator-page">
      <section className="pulse-creator-hero">
        <img
          className="pulse-creator-hero__background"
          src={
            creator.cover ||
            FALLBACK_IMAGE
          }
          alt=""
          onError={(
            event
          ) => {
            const image =
              event.currentTarget;

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

        <div className="pulse-creator-hero__shade" />

        <button
          type="button"
          className="pulse-creator-hero__back"
          onClick={() =>
            onNavigate?.(
              "pulse"
            )
          }
        >
          <ArrowLeft
            size={18}
          />

          PULSE
        </button>

        <div className="pulse-creator-hero__content">
          <div className="pulse-creator-avatar">
            {creator.avatar ? (
              <img
                src={
                  creator.avatar
                }
                alt=""
              />
            ) : (
              <span>
                {
                  creator.initials ||
                  creator.name
                    ?.charAt(
                      0
                    ) ||
                  "Я"
                }
              </span>
            )}

            <i />
          </div>

          <div className="pulse-creator-identity">
            <div className="pulse-creator-identity__name">
              <h1>
                {
                  creator.name ||
                  "Автор ЯТУТ"
                }
              </h1>

              {creator.verified && (
                <span>
                  <Check
                    size={12}
                    strokeWidth={3}
                  />
                </span>
              )}
            </div>

            <strong>
              @
              {
                creator.username ||
                "yatut.creator"
              }
            </strong>

            <p>
              {creator.bio ||
                "Автор ЯТУТ PULSE. Живі історії, люди та моменти просто зараз."}
            </p>

            <div className="pulse-creator-location">
              <MapPin
                size={15}
              />

              {
                locationLabel
              }
            </div>
          </div>

          <div className="pulse-creator-actions">
            <button
              type="button"
              className={`pulse-creator-subscribe ${
                subscribed
                  ? "is-subscribed"
                  : ""
              }`}
              disabled={
                isOwnProfile ||
                followBusy
              }
              onClick={
                toggleSubscribe
              }
            >
              {isOwnProfile ? (
                <>
                  <Check
                    size={16}
                  />

                  Це ви
                </>
              ) : subscribed ? (
                <>
                  <Bell
                    size={16}
                  />

                  Ви підписані
                </>
              ) : (
                <>
                  <Users
                    size={16}
                  />

                  Підписатися
                </>
              )}
            </button>

            {!isOwnProfile && (
              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "chats",
                    {
                      personId:
                        creator.id,
                    }
                  )
                }
              >
                <MessageCircle
                  size={17}
                />

                Написати
              </button>
            )}

            <button
              type="button"
              aria-label="Поділитися профілем"
              onClick={
                shareCreatorProfile
              }
            >
              <Share2
                size={18}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="pulse-creator-stats">
        <article>
          <strong>
            {formatNumber(
              backendCreator
                ? followersCount
                : creator.followers ||
                  0
            )}
          </strong>

          <span>
            підписників
          </span>
        </article>

        <article>
          <strong>
            {formatNumber(
              totalViews
            )}
          </strong>

          <span>
            переглядів
          </span>
        </article>

        <article>
          <strong>
            {
              creatorVideos.length
            }
          </strong>

          <span>
            відео
          </span>
        </article>

        <article>
          <strong>
            {
              waveCount
            }
          </strong>

          <span>
            хвиль
          </span>
        </article>
      </section>

      <section className="pulse-creator-presence">
        <div>
          <span>
            <Radio
              size={18}
            />
          </span>

          <div>
            <small>
              PULSE АВТОРА
            </small>

            <strong>
              {creator.status ||
                (creator.city
                  ? `Автор із ${creator.city}`
                  : "Автор ЯТУТ PULSE")}
            </strong>

            <p>
              Нові відео автора автоматично зʼявляються у PULSE.
            </p>
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
          До PULSE
        </button>
      </section>

      <nav className="pulse-creator-tabs">
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

      <section className="pulse-creator-content">
        <header>
          <div>
            <Play
              size={18}
              fill="currentColor"
            />

            <div>
              <strong>
                {activeTab ===
                "clips"
                  ? "Clips автора"
                  : activeTab ===
                    "live"
                  ? "LIVE автора"
                  : activeTab ===
                    "waves"
                  ? "Хвилі автора"
                  : "Відео автора"}
              </strong>

              <small>
                ЯТУТ PULSE
              </small>
            </div>
          </div>

          <span>
            {
              filteredVideos.length
            }{" "}
            матеріалів
          </span>
        </header>

        {filteredVideos.length ? (
          <div className="pulse-creator-video-grid">
            {filteredVideos.map(
              (
                video
              ) => (
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
        ) : (
          <div className="pulse-creator-empty">
            <Radio
              size={28}
            />

            <strong>
              Тут поки порожньо
            </strong>

            <span>
              Нові матеріали автора зʼявляться тут автоматично.
            </span>
          </div>
        )}
      </section>

      {!isOwnProfile && (
        <section className="pulse-creator-bottom">
          <div>
            <Eye
              size={20}
            />

            <div>
              <strong>
                Стеж за автором у реальному часі
              </strong>

              <span>
                Нові відео та хвилі зʼявляться у твоєму PULSE.
              </span>
            </div>
          </div>

          <button
            type="button"
            className={
              subscribed
                ? "is-subscribed"
                : ""
            }
            disabled={
              followBusy
            }
            onClick={
              toggleSubscribe
            }
          >
            {subscribed
              ? "Ви підписані"
              : "Підписатися"}
          </button>
        </section>
      )}
    </div>
  );
}
