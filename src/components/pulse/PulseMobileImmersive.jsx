import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Plus,
  Radio,
  Send,
  Users,
  Waves,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  DropdownMenu,
} from "radix-ui";

import PulseLongVideoMobile from "./PulseLongVideoMobile";
import PulseCommentsSheet from "./PulseCommentsSheet";
import usePulseSocial from "../../hooks/usePulseSocial";

import {
  nativeLightHaptic,
} from "../../services/nativeFeedbackService";

import {
  recordPulseWatchSignal,
} from "../../services/pulseSocialService";

import {
  addPulseFeedback,
  removePulseFeedback,
} from "../../services/pulseFeedbackService";

const TABS = [
  {
    id: "forYou",
    label: "Для тебе",
  },
  {
    id: "clips",
    label: "Кліпи",
  },
  {
    id: "vlogs",
    label: "Влоги",
  },
  {
    id: "live",
    label: "LIVE",
  },
  {
    id: "nearby",
    label: "Поруч",
  },
];

function uniqueVideos(
  source
) {
  const result = [];

  (source || []).forEach(
    (video) => {
      if (
        !video ||
        result.some(
          (item) =>
            item.id ===
            video.id
        )
      ) {
        return;
      }

      result.push(
        video
      );
    }
  );

  return result;
}

function formatCompact(
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

function getFeed(
  tab,
  externalVideos = [],
  forYouVideos = [],
  followingVideos = []
) {
  const all =
    uniqueVideos(
      externalVideos
    );

  switch (
    tab
  ) {
    case "clips":
      return all.filter(
        (
          video
        ) =>
          video.type ===
          "clip"
      );

    case "vlogs":
      return all.filter(
        (
          video
        ) =>
          video.type ===
            "vlog" ||
          video.type ===
            "video"
      );

    case "live":
      return all.filter(
        (
          video
        ) =>
          video.isLive ||
          video.type ===
            "live"
      );

    case "nearby":
      return all.filter(
        (
          video
        ) =>
          Boolean(
            video.location?.name ||
            video.locationName ||
            video.type ===
              "event" ||
            video.recommendationType ===
              "events" ||
            video.recommendationType ===
              "nearby"
          )
      );

    default:
      return uniqueVideos(
        forYouVideos.length
          ? forYouVideos
          : all
      );
  }
}

function buildStats(
  video
) {
  const views =
    Number(
      video.views || 0
    );

  const friends =
    Number(
      video.friendsNearby ||
        0
    );

  if (
    video.backend
  ) {
    return {
      likes:
        Number(
          video.likes ||
          0
        ),
      comments:
        Number(
          video.comments ||
          0
        ),
      shares:
        Number(
          video.shares ||
          0
        ),
      saves:
        Number(
          video.saves ||
          0
        ),
    };
  }

  return {
    likes:
      Math.max(
        128,
        Math.round(
          views *
            0.12
        )
      ),

    comments:
      Math.max(
        18,
        friends *
          14 +
          Math.round(
            views *
              0.004
          )
      ),

    shares:
      Math.max(
        12,
        Math.round(
          views *
            0.018
        )
      ),

    saves:
      Math.max(
        8,
        Math.round(
          views *
            0.012
        )
      ),
  };
}

function PulseForYouTeaser({
  video,
  onOpen,
}) {
  const isLive =
    Boolean(
      video.isLive ||
      video.type ===
        "live"
    );

  const isVlog =
    video.type ===
      "vlog" ||
    video.type ===
      "video";

  const formatLabel =
    isLive
      ? "LIVE"
      : isVlog
      ? "ВЛОГ"
      : video.type ===
        "event"
      ? "ПОДІЯ"
      : "КЛІП";

  return (
    <motion.button
      type="button"
      className={`pulse-for-you-teaser ${
        isLive
          ? "is-live"
          : isVlog
          ? "is-vlog"
          : ""
      }`.trim()}
      whileTap={{
        scale: 0.985,
      }}
      onClick={
        onOpen
      }
    >
      <div className="pulse-for-you-teaser__media">
        {video.thumbnail ? (
          <img
            src={
              video.thumbnail
            }
            alt=""
          />
        ) : (
          <div className="pulse-for-you-teaser__placeholder">
            ЯТУТ
          </div>
        )}

        <span className="pulse-for-you-teaser__badge">
          {formatLabel}
        </span>

        {isLive && (
          <span className="pulse-for-you-teaser__viewers">
            <Radio
              size={13}
            />

            {formatCompact(
              video.viewers ||
              video.views ||
              0
            )}
          </span>
        )}
      </div>

      <div className="pulse-for-you-teaser__body">
        <div>
          <small>
            {
              video.author?.name ||
              "Автор ЯТУТ"
            }
          </small>

          <strong>
            {
              video.title ||
              (isLive
                ? "LIVE зараз"
                : "Новий влог")
            }
          </strong>

          <p>
            {
              video.description ||
              (isLive
                ? "Дивись, що відбувається просто зараз."
                : "Повна історія у ЯТУТ PULSE.")
            }
          </p>
        </div>

        <span className="pulse-for-you-teaser__open">
          Дивитися
        </span>
      </div>
    </motion.button>
  );
}

function PulseInlineLive({
  videos = [],
  onStartLive,
}) {
  const featured =
    videos[0] ||
    null;

  const rest =
    videos.slice(
      1
    );

  return (
    <div className="pulse-inline-live">
      <header className="pulse-inline-live__header">
        <div>
          <span>
            <Radio
              size={15}
            />

            LIVE
          </span>

          <div>
            <strong>
              Ефіри зараз
            </strong>

            <small>
              Дивись наживо, не виходячи з PULSE
            </small>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onStartLive
          }
        >
          <Plus
            size={16}
          />

          Почати ефір
        </button>
      </header>

      {featured ? (
        <>
          <button
            type="button"
            className="pulse-inline-live__featured"
          >
            <div className="pulse-inline-live__featured-media">
              {featured.thumbnail ||
              featured.poster ? (
                <img
                  src={
                    featured.thumbnail ||
                    featured.poster
                  }
                  alt=""
                />
              ) : (
                <div className="pulse-inline-live__placeholder">
                  <Radio
                    size={42}
                  />

                  <span>
                    LIVE
                  </span>
                </div>
              )}

              <span className="pulse-inline-live__badge">
                <i />

                LIVE
              </span>

              <span className="pulse-inline-live__viewers">
                <Users
                  size={13}
                />

                {formatCompact(
                  featured.viewers ||
                  featured.views ||
                  0
                )}
              </span>
            </div>

            <div className="pulse-inline-live__featured-copy">
              <div className="pulse-inline-live__author">
                {featured.author?.avatar ||
                featured.authorAvatar ? (
                  <img
                    src={
                      featured.author?.avatar ||
                      featured.authorAvatar
                    }
                    alt=""
                  />
                ) : (
                  <span>
                    {
                      featured.author?.name?.[0] ||
                      "Я"
                    }
                  </span>
                )}

                <div>
                  <small>
                    {
                      featured.author?.name ||
                      "Автор ЯТУТ"
                    }
                  </small>

                  <strong>
                    {
                      featured.title ||
                      "LIVE зараз"
                    }
                  </strong>
                </div>
              </div>

              {(featured.location?.name ||
                featured.locationName ||
                featured.city) && (
                <span className="pulse-inline-live__location">
                  <MapPin
                    size={13}
                  />

                  {
                    featured.location?.name ||
                    featured.locationName ||
                    featured.city
                  }
                </span>
              )}
            </div>
          </button>

          {rest.length > 0 && (
            <section className="pulse-inline-live__more">
              <header>
                <strong>
                  Ще наживо
                </strong>

                <span>
                  {
                    rest.length
                  }
                </span>
              </header>

              <div>
                {rest.map(
                  (
                    video
                  ) => (
                    <button
                      type="button"
                      key={
                        video.id
                      }
                      className="pulse-inline-live__card"
                    >
                      <div>
                        {video.thumbnail ||
                        video.poster ? (
                          <img
                            src={
                              video.thumbnail ||
                              video.poster
                            }
                            alt=""
                          />
                        ) : (
                          <span>
                            <Radio
                              size={22}
                            />
                          </span>
                        )}

                        <i>
                          LIVE
                        </i>
                      </div>

                      <strong>
                        {
                          video.title ||
                          "Прямий ефір"
                        }
                      </strong>

                      <small>
                        {
                          video.author?.name ||
                          "Автор ЯТУТ"
                        }
                      </small>
                    </button>
                  )
                )}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="pulse-inline-live__empty">
          <span>
            <Radio
              size={31}
            />
          </span>

          <strong>
            Зараз ніхто не в ефірі
          </strong>

          <p>
            Коли автор почне трансляцію, вона зʼявиться тут одразу — без переходу на окрему сторінку.
          </p>

          <button
            type="button"
            onClick={
              onStartLive
            }
          >
            <Plus
              size={16}
            />

            Почати свій LIVE
          </button>
        </div>
      )}
    </div>
  );
}

function PulseInlineNearby({
  videos = [],
  onCreateNow,
}) {
  return (
    <div className="pulse-inline-nearby">
      <header className="pulse-inline-nearby__header">
        <div>
          <span>
            <MapPin
              size={16}
            />
          </span>

          <div>
            <strong>
              Поруч
            </strong>

            <small>
              Що відбувається навколо тебе зараз
            </small>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onCreateNow
          }
        >
          <Plus
            size={16}
          />

          Зараз
        </button>
      </header>

      <div className="pulse-inline-nearby__filters">
        <button
          type="button"
          className="is-active"
        >
          Усе
        </button>

        <button
          type="button"
        >
          Зараз
        </button>

        <button
          type="button"
        >
          Події
        </button>

        <button
          type="button"
        >
          Місця
        </button>
      </div>

      {videos.length ? (
        <div className="pulse-inline-nearby__grid">
          {videos.map(
            (
              video
            ) => (
              <article
                key={
                  video.id
                }
                className="pulse-inline-nearby__card"
              >
                <div className="pulse-inline-nearby__media">
                  {video.thumbnail ||
                  video.poster ? (
                    <img
                      src={
                        video.thumbnail ||
                        video.poster
                      }
                      alt=""
                    />
                  ) : (
                    <div>
                      <MapPin
                        size={28}
                      />

                      <span>
                        ЯТУТ
                      </span>
                    </div>
                  )}

                  <span>
                    {video.pulseKind ===
                    "moment"
                      ? "ЗАРАЗ"
                      : video.type ===
                        "event"
                      ? "ПОДІЯ"
                      : "ПОРУЧ"}
                  </span>
                </div>

                <div className="pulse-inline-nearby__copy">
                  <small>
                    <MapPin
                      size={12}
                    />

                    {
                      video.location?.name ||
                      video.locationName ||
                      video.city ||
                      "Поруч"
                    }
                  </small>

                  <strong>
                    {
                      video.title ||
                      video.description ||
                      "Щось відбувається поруч"
                    }
                  </strong>

                  <p>
                    {
                      video.author?.name ||
                      "ЯТУТ"
                    }
                    {video.friendsNearby
                      ? ` · ${video.friendsNearby} друзів поруч`
                      : ""}
                  </p>
                </div>
              </article>
            )
          )}
        </div>
      ) : (
        <div className="pulse-inline-nearby__empty">
          <span>
            <MapPin
              size={30}
            />
          </span>

          <strong>
            Поки тихо поруч
          </strong>

          <p>
            Кліпи «Зараз», події та місця зʼявляться тут, коли буде актуальний контент.
          </p>

          <button
            type="button"
            onClick={
              onCreateNow
            }
          >
            <Plus
              size={16}
            />

            Показати, що тут зараз
          </button>
        </div>
      )}
    </div>
  );
}

function PulseImmersiveSlide({
  video,
  authSession,
  socialRevision = 0,
  onShare,
  onCreate,
  showRecommendationControls = false,
  onNotInterested,
  onLessFromAuthor,
  onNotice,
}) {
  const [
    commentsOpen,
    setCommentsOpen,
  ] = useState(false);

  const slideRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const watchStateRef =
    useRef({
      active: false,
      visible: false,
      startedAt: 0,
      accumulatedMs: 0,
      completionCount: 0,
      replayCount: 0,
      cycleCompleted: false,
      everCompleted: false,
      lastMediaTime: 0,
    });

  const [
    slideActive,
    setSlideActive,
  ] = useState(false);

  const [
    mediaActivated,
    setMediaActivated,
  ] = useState(false);

  const [
    likeBurstKey,
    setLikeBurstKey,
  ] = useState(0);

  const pulseSocial =
    usePulseSocial({
      video,
      authSession,
      realtime:
        false,
      refreshKey:
        socialRevision,
      enabled:
        mediaActivated,
    });

  const stats =
    buildStats(
      video
    );

  useEffect(
    () => {
      const element =
        slideRef.current;

      if (
        !element ||
        mediaActivated
      ) {
        return undefined;
      }

      const preloadObserver =
        new IntersectionObserver(
          (
            entries
          ) => {
            if (
              entries.some(
                (
                  entry
                ) =>
                  entry.isIntersecting
              )
            ) {
              setMediaActivated(
                true
              );

              preloadObserver.disconnect();
            }
          },
          {
            rootMargin:
              "110% 0px",
            threshold:
              0,
          }
        );

      preloadObserver.observe(
        element
      );

      return () => {
        preloadObserver.disconnect();
      };
    },
    [
      video?.id,
      mediaActivated,
    ]
  );

  useEffect(
    () => {
      if (
        !mediaActivated ||
        !slideActive ||
        commentsOpen
      ) {
        return;
      }

      videoRef.current
        ?.play?.()
        ?.catch?.(
          () => {}
        );
    },
    [
      mediaActivated,
      slideActive,
      commentsOpen,
      video?.id,
    ]
  );

  useEffect(
    () => {
      const element =
        slideRef.current;

      if (!element) {
        return undefined;
      }

      const watch =
        watchStateRef.current;

      const media =
        videoRef.current;

      function resetExposure() {
        watch.active =
          false;

        watch.startedAt =
          0;

        watch.accumulatedMs =
          0;

        watch.completionCount =
          0;

        watch.replayCount =
          0;

        watch.cycleCompleted =
          false;

        watch.lastMediaTime =
          Number(
            videoRef.current
              ?.currentTime ||
            0
          );
      }

      function startPlaybackWatch() {
        if (
          watch.active ||
          !watch.visible ||
          !video?.backend ||
          !authSession?.user?.id
        ) {
          return;
        }

        watch.active =
          true;

        watch.startedAt =
          performance.now();
      }

      function accumulatePlaybackWatch() {
        if (!watch.active) {
          return;
        }

        watch.accumulatedMs +=
          Math.max(
            0,
            Math.round(
              performance.now() -
                watch.startedAt
            )
          );

        watch.active =
          false;

        watch.startedAt =
          0;
      }

      function flushWatch() {
        accumulatePlaybackWatch();

        const watchMs =
          Math.max(
            0,
            Math.round(
              watch.accumulatedMs ||
              0
            )
          );

        const completed =
          watch.completionCount >
          0;

        const replayed =
          watch.replayCount >
          0;

        watch.visible =
          false;

        resetExposure();

        if (
          !video?.backend ||
          !authSession?.user?.id ||
          watchMs <
            300
        ) {
          return;
        }

        recordPulseWatchSignal(
          authSession,
          {
            mediaId:
              video.id,
            watchMs,
            impression:
              true,
            completed,
            quickSwipe:
              watchMs <
                1800 &&
              !completed,
            replay:
              replayed,
          }
        ).catch(
          (
            error
          ) => {
            console.warn(
              "PULSE WATCH SIGNAL ERROR:",
              error
            );
          }
        );
      }

      media?.addEventListener(
        "play",
        startPlaybackWatch
      );

      media?.addEventListener(
        "pause",
        accumulatePlaybackWatch
      );

      const observer =
        new IntersectionObserver(
          (
            entries
          ) => {
            const visible =
              entries.some(
                (
                  entry
                ) =>
                  entry.isIntersecting &&
                  entry.intersectionRatio >=
                    0.65 &&
                  !commentsOpen &&
                  document.visibilityState ===
                    "visible"
              );

            setSlideActive(
              visible
            );

            if (
              visible &&
              !watch.visible
            ) {
              watch.visible =
                true;

              resetExposure();

              watch.visible =
                true;
            }

            const currentMedia =
              videoRef.current;

            if (currentMedia) {
              if (visible) {
                currentMedia
                  .play()
                  .catch(
                    () => {}
                  );
              } else {
                currentMedia.pause();
              }
            }

            if (visible) {
              if (
                video?.backend
              ) {
                pulseSocial.recordView();
              }
            } else if (
              watch.visible ||
              watch.active ||
              watch.accumulatedMs >
                0
            ) {
              flushWatch();
            }
          },
          {
            threshold: [
              0.2,
              0.65,
              0.9,
            ],
          }
        );

      observer.observe(
        element
      );

      function handleVisibility() {
        if (
          document.visibilityState !==
            "visible"
        ) {
          videoRef.current
            ?.pause?.();

          if (
            watch.visible ||
            watch.active ||
            watch.accumulatedMs >
              0
          ) {
            flushWatch();
          }
        }
      }

      document.addEventListener(
        "visibilitychange",
        handleVisibility
      );

      return () => {
        videoRef.current
          ?.pause?.();

        if (
          watch.visible ||
          watch.active ||
          watch.accumulatedMs >
            0
        ) {
          flushWatch();
        }

        observer.disconnect();

        document.removeEventListener(
          "visibilitychange",
          handleVisibility
        );

        media?.removeEventListener(
          "play",
          startPlaybackWatch
        );

        media?.removeEventListener(
          "pause",
          accumulatePlaybackWatch
        );
      };
    },
    [
      video?.id,
      video?.backend,
      authSession?.user?.id,
      authSession?.access_token,
      pulseSocial.recordView,
      commentsOpen,
    ]
  );

  async function handleShare() {
    const completed =
      await onShare?.();

    if (
      completed
    ) {
      await pulseSocial.recordShare();
    }
  }

  async function handleDoubleLike() {
    nativeLightHaptic();

    if (
      !pulseSocial.liked
    ) {
      await pulseSocial.toggleLike();
    }

    setLikeBurstKey(
      (
        value
      ) =>
        value + 1
    );
  }

  async function handleLike() {
    nativeLightHaptic();
    await pulseSocial.toggleLike();
  }

  async function handleSaved() {
    nativeLightHaptic();
    await pulseSocial.toggleSaved();
  }

  async function handleFollow() {
    nativeLightHaptic();
    await pulseSocial.toggleFollow();
  }

  const author =
    video.author ||
    {};

  const isLive =
    video.isLive ||
    video.type ===
      "live";

  const location =
    video.location?.name ||
    "Україна";

  const image =
    video.thumbnail ||
    "/assets/regions/kyiv/hero.webp";

  return (
    <>
    <motion.article
      ref={
        slideRef
      }
      className="pulse-immersive__slide"
      data-active={
        slideActive
          ? "true"
          : "false"
      }
      onDoubleClick={
        handleDoubleLike
      }
      initial={{
        opacity: 0.96,
        scale: 0.995,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      {(video.videoUrl ||
        video.video) ? (
        <video
          ref={
            videoRef
          }
          className="pulse-immersive__media"
          src={
            mediaActivated
              ? (
                  video.videoUrl ||
                  video.video
                )
              : undefined
          }
          poster={
            image
          }
          muted
          loop
          playsInline
          preload={
            mediaActivated
              ? "metadata"
              : "none"
          }
          onLoadedMetadata={(
            event
          ) => {
            if (
              video.trimStart
            ) {
              event.currentTarget.currentTime =
                video.trimStart;
            }
          }}
          onTimeUpdate={(
            event
          ) => {
            const element =
              event.currentTarget;

            const watch =
              watchStateRef.current;

            const start =
              Number(
                video.trimStart ||
                0
              );

            const end =
              Number(
                video.trimEnd ||
                element.duration ||
                video.durationSeconds ||
                0
              );

            const current =
              Number(
                element.currentTime ||
                0
              );

            if (
              watch.lastMediaTime >
                current +
                  0.75
            ) {
              watch.cycleCompleted =
                false;
            }

            if (
              end >
                start &&
              !watch.cycleCompleted &&
              current >=
                start +
                  (
                    end -
                    start
                  ) *
                    0.9
            ) {
              watch.completionCount +=
                1;

              if (
                watch.everCompleted
              ) {
                watch.replayCount +=
                  1;
              }

              watch.everCompleted =
                true;

              watch.cycleCompleted =
                true;
            }

            watch.lastMediaTime =
              current;

            if (
              video.trimEnd &&
              current >=
                video.trimEnd -
                  0.03
            ) {
              element.currentTime =
                start;

              element
                .play()
                .catch(
                  () => {}
                );
            }
          }}
        />
      ) : (
        <img
          className="pulse-immersive__media"
          src={
            image
          }
          alt=""
        />
      )}

      <div className="pulse-immersive__shade" />

      <AnimatePresence>
        {likeBurstKey >
          0 && (
          <motion.div
            key={
              likeBurstKey
            }
            className="pulse-immersive__like-burst"
            initial={{
              opacity: 0,
              scale: 0.45,
              rotate: -14,
            }}
            animate={{
              opacity: [
                0,
                1,
                1,
                0,
              ],
              scale: [
                0.45,
                1.22,
                1,
                1.5,
              ],
              rotate: [
                -14,
                6,
                0,
                0,
              ],
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.72,
              times: [
                0,
                0.28,
                0.62,
                1,
              ],
            }}
            aria-hidden="true"
          >
            <Heart
              size={82}
              fill="currentColor"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pulse-immersive__top-meta">
        {isLive ? (
          <span className="pulse-immersive__live">
            <Radio
              size={13}
            />

            LIVE
          </span>
        ) : (
          <span className="pulse-immersive__type">
            {video.pulseKind ===
            "moment"
              ? "ЗАРАЗ"
              : video.type ===
                  "vlog" ||
                video.type ===
                  "video"
              ? "ВЛОГ"
              : "КЛІП"}
            {video.recommendationReason
              ? ` · ${video.recommendationReason}`
              : ""}
          </span>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            asChild
          >
            <button
              type="button"
              className="pulse-immersive__more"
              aria-label="Більше"
            >
              <MoreHorizontal
                size={22}
              />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="pulse-immersive__menu"
              sideOffset={
                8
              }
              align="end"
              collisionPadding={
                12
              }
            >
              {showRecommendationControls &&
                !pulseSocial.isOwnAuthor && (
                <>
                  <DropdownMenu.Item
                    asChild
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onNotInterested?.(
                          video
                        )
                      }
                    >
                      Не цікаво
                    </button>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    asChild
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onLessFromAuthor?.(
                          video
                        )
                      }
                    >
                      Менше від цього автора
                    </button>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator
                    className="pulse-immersive__menu-separator"
                  />
                </>
              )}

              <DropdownMenu.Item
                asChild
              >
                <button
                  type="button"
                  onClick={async () => {
                    const url =
                      `${window.location.origin}${window.location.pathname}#pulse=${encodeURIComponent(
                        video.id
                      )}`;

                    try {
                      await navigator.clipboard
                        ?.writeText(
                          url
                        );

                      onNotice?.(
                        "Посилання скопійовано"
                      );
                    } catch (
                      error
                    ) {
                      console.warn(
                        "PULSE LINK COPY ERROR:",
                        error
                      );
                    }
                  }}
                >
                  Копіювати посилання
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <aside className="pulse-immersive__actions">
        <motion.button
          type="button"
          whileTap={{
            scale: 0.88,
          }}
          className="pulse-immersive__avatar-action"
          disabled={
            pulseSocial.isOwnAuthor
          }
          onClick={
            handleFollow
          }
          aria-label={
            pulseSocial.following
              ? "Ви підписані"
              : "Підписатися"
          }
        >
          <span className="pulse-immersive__avatar">
            {
              author.initials ||
              author.name?.[0] ||
              "Я"
            }
          </span>

          <i
            className={
              pulseSocial.following
                ? "is-following"
                : ""
            }
          >
            {pulseSocial.following
              ? "✓"
              : "+"}
          </i>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.84,
          }}
          className={
            pulseSocial.liked
              ? "is-active"
              : ""
          }
          onClick={
            handleLike
          }
          aria-label="Подобається"
        >
          <motion.span
            className="pulse-action-icon"
            animate={
              pulseSocial.liked
                ? {
                    scale: [
                      1,
                      1.3,
                      1,
                    ],
                    rotate: [
                      0,
                      -8,
                      5,
                      0,
                    ],
                  }
                : {
                    scale: 1,
                    rotate: 0,
                  }
            }
            transition={{
              duration: 0.32,
            }}
          >
            <Heart
              size={29}
              fill={
                pulseSocial.liked
                  ? "currentColor"
                  : "none"
              }
            />
          </motion.span>

          <small>
            {formatCompact(
              video.backend
                ? pulseSocial.likesCount
                : stats.likes +
                  (pulseSocial.liked
                    ? 1
                    : 0)
            )}
          </small>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.86,
          }}
          aria-label="Коментарі"
          onClick={() =>
            setCommentsOpen(
              true
            )
          }
        >
          <MessageCircle
            size={29}
          />

          <small>
            {formatCompact(
              video.backend
                ? pulseSocial.commentsCount
                : stats.comments
            )}
          </small>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.86,
          }}
          onClick={
            handleShare
          }
          aria-label="Поширити"
        >
          <Send
            size={28}
          />

          <small>
            {formatCompact(
              video.backend
                ? pulseSocial.sharesCount
                : stats.shares
            )}
          </small>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.86,
          }}
          className={
            pulseSocial.saved
              ? "is-active"
              : ""
          }
          onClick={
            handleSaved
          }
          aria-label="Зберегти"
        >
          <Bookmark
            size={28}
            fill={
              pulseSocial.saved
                ? "currentColor"
                : "none"
            }
          />

          <small>
            {formatCompact(
              video.backend
                ? pulseSocial.savesCount
                : stats.saves +
                  (pulseSocial.saved
                    ? 1
                    : 0)
            )}
          </small>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.88,
          }}
          className="pulse-immersive__sound"
          onClick={
            onCreate
          }
          aria-label="Використати звук"
        >
          <Music2
            size={20}
          />
        </motion.button>
      </aside>

      <div className="pulse-immersive__copy">
        <button
          type="button"
          className="pulse-immersive__location"
        >
          <MapPin
            size={15}
          />

          {
            location
          }
        </button>

        <div className="pulse-immersive__author-row">
          <span className="pulse-immersive__author-avatar">
            {
              author.initials ||
              author.name?.[0] ||
              "Я"
            }
          </span>

          <div className="pulse-immersive__author-copy">
            <strong>
              {
                author.name ||
                "Автор ЯТУТ"
              }
            </strong>

            <small>
              @{
                author.username ||
                "yatut"
              }
              {" · "}
              зараз
            </small>
          </div>

          <button
            type="button"
            className={
              pulseSocial.following
                ? "is-following"
                : ""
            }
            disabled={
              pulseSocial.isOwnAuthor
            }
            onClick={
              handleFollow
            }
          >
            {pulseSocial.isOwnAuthor
              ? "Це ви"
              : pulseSocial.following
              ? "Підписані"
              : "Підписатися"}
          </button>
        </div>

        <h2>
          {
            video.title
          }
        </h2>

        <p>
          {
            video.description
          }
        </p>

        <div className="pulse-immersive__tags">
          <span>
            #ятут
          </span>

          <span>
            #pulse
          </span>

          {video.city && (
            <span>
              #{
                video.city
              }
            </span>
          )}
        </div>

        {video.pulseKind ===
          "wave" && (
          <button
            type="button"
            className="pulse-immersive__continue-wave"
            onClick={
              onCreate
            }
          >
            <Waves
              size={16}
            />

            <span>
              Продовжити хвилю
            </span>
          </button>
        )}

        {isLive ? (
          <div className="pulse-immersive__live-info">
            <Users
              size={15}
            />

            <strong>
              {formatCompact(
                video.views
              )}
            </strong>

            <span>
              дивляться зараз
            </span>
          </div>
        ) : (
          <button
            type="button"
            className="pulse-immersive__audio"
            onClick={
              onCreate
            }
          >
            <Music2
              size={15}
            />

            <span>
              Оригінальний звук
              {" · "}
              {
                author.name ||
                "ЯТУТ"
              }
            </span>
          </button>
        )}
      </div>
    </motion.article>

    <PulseCommentsSheet
      open={
        commentsOpen
      }
      video={
        video
      }
      authSession={
        authSession
      }
      onClose={() =>
        setCommentsOpen(
          false
        )
      }
      onCountChange={
        pulseSocial.refresh
      }
    />
    </>
  );
}

export default function PulseMobileImmersive({
  onNavigate,
  externalVideos = [],
  forYouVideos = [],
  followingVideos = [],
  authSession = null,
  socialRevision = 0,
  onRequestRefresh = null,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "forYou"
  );

  const [
    longWatchOpen,
    setLongWatchOpen,
  ] = useState(false);

  const [
    sessionHiddenMediaIds,
    setSessionHiddenMediaIds,
  ] = useState(
    () =>
      new Set()
  );

  const [
    sessionMutedAuthorIds,
    setSessionMutedAuthorIds,
  ] = useState(
    () =>
      new Set()
  );

  const [
    feedbackNotice,
    setFeedbackNotice,
  ] = useState(null);

  const tabsRef =
    useRef(null);

  const feedRef =
    useRef(null);

  const swipeStartRef =
    useRef(null);

  useEffect(
    () => {
      const body =
        document.body;

      if (
        activeTab ===
        "vlogs"
      ) {
        body.classList.add(
          "pulse-vlogs-active"
        );
      } else {
        body.classList.remove(
          "pulse-vlogs-active"
        );
      }

      return () => {
        body.classList.remove(
          "pulse-vlogs-active"
        );
      };
    },
    [
      activeTab,
    ]
  );

  const videos =
    useMemo(
      () => {
        const base =
          getFeed(
            activeTab,
            externalVideos,
            forYouVideos,
            followingVideos
          );

        if (
          activeTab !==
          "forYou"
        ) {
          return base;
        }

        const visible =
          base.filter(
            (
              video
            ) =>
              !sessionHiddenMediaIds.has(
                video.id
              )
          );

        const normal =
          [];

        const reduced =
          [];

        visible.forEach(
          (
            video
          ) => {
            if (
              sessionMutedAuthorIds.has(
                video?.author?.id
              )
            ) {
              reduced.push(
                video
              );
            } else {
              normal.push(
                video
              );
            }
          }
        );

        return [
          ...normal,
          ...reduced,
        ];
      },
      [
        activeTab,
        externalVideos,
        forYouVideos,
        followingVideos,
        sessionHiddenMediaIds,
        sessionMutedAuthorIds,
      ]
    );

  async function handleNotInterested(
    video
  ) {
    if (!video?.id) {
      return;
    }

    nativeLightHaptic();

    setSessionHiddenMediaIds(
      (
        previous
      ) =>
        new Set([
          ...previous,
          video.id,
        ])
    );

    const persisted =
      Boolean(
        video.backend &&
        authSession?.user?.id
      );

    setFeedbackNotice({
      kind:
        "not_interested",
      mediaId:
        video.id,
      authorId:
        null,
      persisted,
      label:
        "Ролик прибрано з «Для тебе»",
    });

    if (persisted) {
      try {
        await addPulseFeedback(
          authSession,
          {
            kind:
              "not_interested",
            mediaId:
              video.id,
          }
        );
      } catch (
        error
      ) {
        console.warn(
          "PULSE NOT INTERESTED ERROR:",
          error
        );

        setSessionHiddenMediaIds(
          (
            previous
          ) => {
            const next =
              new Set(
                previous
              );

            next.delete(
              video.id
            );

            return next;
          }
        );

        setFeedbackNotice({
          kind:
            "notice",
          mediaId:
            null,
          authorId:
            null,
          persisted:
            false,
          label:
            "Не вдалося зберегти налаштування",
        });
      }
    }
  }

  async function handleLessFromAuthor(
    video
  ) {
    const authorId =
      video?.author?.id;

    if (!authorId) {
      return;
    }

    nativeLightHaptic();

    setSessionMutedAuthorIds(
      (
        previous
      ) =>
        new Set([
          ...previous,
          authorId,
        ])
    );

    const persisted =
      Boolean(
        video.backend &&
        authSession?.user?.id
      );

    setFeedbackNotice({
      kind:
        "less_from_author",
      mediaId:
        null,
      authorId,
      persisted,
      label:
        "Показуватимемо менше цього автора",
    });

    if (persisted) {
      try {
        await addPulseFeedback(
          authSession,
          {
            kind:
              "less_from_author",
            authorId,
          }
        );
      } catch (
        error
      ) {
        console.warn(
          "PULSE LESS AUTHOR ERROR:",
          error
        );

        setSessionMutedAuthorIds(
          (
            previous
          ) => {
            const next =
              new Set(
                previous
              );

            next.delete(
              authorId
            );

            return next;
          }
        );

        setFeedbackNotice({
          kind:
            "notice",
          mediaId:
            null,
          authorId:
            null,
          persisted:
            false,
          label:
            "Не вдалося зберегти налаштування",
        });
      }
    }
  }

  async function undoPulseFeedback() {
    const target =
      feedbackNotice;

    if (!target) {
      return;
    }

    setFeedbackNotice(
      null
    );

    if (
      target.mediaId
    ) {
      setSessionHiddenMediaIds(
        (
          previous
        ) => {
          const next =
            new Set(
              previous
            );

          next.delete(
            target.mediaId
          );

          return next;
        }
      );
    }

    if (
      target.authorId
    ) {
      setSessionMutedAuthorIds(
        (
          previous
        ) => {
          const next =
            new Set(
              previous
            );

          next.delete(
            target.authorId
          );

          return next;
        }
      );
    }

    if (
      target.persisted &&
      authSession?.user?.id
    ) {
      try {
        await removePulseFeedback(
          authSession,
          {
            kind:
              target.kind,
            mediaId:
              target.mediaId,
            authorId:
              target.authorId,
          }
        );
      } catch (
        error
      ) {
        console.warn(
          "PULSE FEEDBACK UNDO ERROR:",
          error
        );
      }
    }
  }

  useEffect(
    () => {
      if (!feedbackNotice) {
        return undefined;
      }

      const timer =
        window.setTimeout(
          () =>
            setFeedbackNotice(
              null
            ),
          5200
        );

      return () =>
        window.clearTimeout(
          timer
        );
    },
    [
      feedbackNotice,
    ]
  );

  function selectTab(
    tabId,
    {
      haptic = true,
    } = {}
  ) {
    if (
      !TABS.some(
        (
          tab
        ) =>
          tab.id ===
          tabId
      )
    ) {
      return;
    }

    if (
      tabId ===
      activeTab
    ) {
      return;
    }

    if (
      haptic
    ) {
      nativeLightHaptic();
    }

    setActiveTab(
      tabId
    );

    window.setTimeout(
      () =>
        onRequestRefresh?.(),
      180
    );
  }

  function handleSwipeStart(
    event
  ) {
    if (
      longWatchOpen ||
      event.touches.length !==
        1
    ) {
      swipeStartRef.current =
        null;

      return;
    }

    const target =
      event.target;

    if (
      target?.closest?.(
        ".pulse-comments-sheet, button, a, input, textarea, select, [role='dialog']"
      )
    ) {
      swipeStartRef.current =
        null;

      return;
    }

    const touch =
      event.touches[0];

    swipeStartRef.current = {
      x:
        touch.clientX,
      y:
        touch.clientY,
    };
  }

  function handleSwipeEnd(
    event
  ) {
    const start =
      swipeStartRef.current;

    swipeStartRef.current =
      null;

    if (
      !start ||
      longWatchOpen ||
      event.changedTouches.length !==
        1
    ) {
      return;
    }

    const touch =
      event.changedTouches[0];

    const deltaX =
      touch.clientX -
      start.x;

    const deltaY =
      touch.clientY -
      start.y;

    const horizontal =
      Math.abs(
        deltaX
      );

    const vertical =
      Math.abs(
        deltaY
      );

    if (
      horizontal <
        56 ||
      horizontal <
        vertical *
          1.2
    ) {
      return;
    }

    const currentIndex =
      TABS.findIndex(
        (
          tab
        ) =>
          tab.id ===
          activeTab
      );

    if (
      currentIndex <
      0
    ) {
      return;
    }

    const nextIndex =
      deltaX <
      0
        ? Math.min(
            TABS.length -
              1,
            currentIndex +
              1
          )
        : Math.max(
            0,
            currentIndex -
              1
          );

    const nextTab =
      TABS[
        nextIndex
      ];

    if (
      nextTab &&
      nextTab.id !==
        activeTab
    ) {
      selectTab(
        nextTab.id
      );
    }
  }

  useEffect(
    () => {
      const tabs =
        tabsRef.current;

      if (!tabs) {
        return;
      }

      const activeButton =
        tabs.querySelector(
          `[data-pulse-tab="${activeTab}"]`
        );

      if (!activeButton) {
        return;
      }

      const nextLeft =
        activeButton.offsetLeft -
        (
          tabs.clientWidth -
          activeButton.offsetWidth
        ) /
          2;

      tabs.scrollTo({
        left:
          Math.max(
            0,
            nextLeft
          ),
        behavior:
          "smooth",
      });

      feedRef.current
        ?.scrollTo({
          top: 0,
          behavior:
            "auto",
        });
    },
    [
      activeTab,
    ]
  );

  function handleLongWatchChange(
    open
  ) {
    if (
      longWatchOpen &&
      !open
    ) {
      window.setTimeout(
        () =>
          onRequestRefresh?.(),
        180
      );
    }

    setLongWatchOpen(
      open
    );
  }

  async function share(
    video
  ) {
    const url =
      `${window.location.origin}${window.location.pathname}#pulse=${encodeURIComponent(
        video.id
      )}`;

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            video.title,
          text:
            video.description ||
            "ЯТУТ PULSE",
          url,
        });

        return true;
      }

      if (
        navigator.clipboard
          ?.writeText
      ) {
        await navigator.clipboard.writeText(
          url
        );

        return true;
      }
    } catch (
      error
    ) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.warn(
          "PULSE SHARE ERROR:",
          error
        );
      }
    }

    return false;
  }

  return (
    <section
      onTouchStart={
        handleSwipeStart
      }
      onTouchEnd={
        handleSwipeEnd
      }
      className={`pulse-immersive-mobile ${
        activeTab ===
        "vlogs"
          ? "is-long-form"
          : activeTab ===
            "live"
          ? "is-live-tab"
          : activeTab ===
            "nearby"
          ? "is-nearby-tab"
          : ""
      } ${
        longWatchOpen
          ? "is-long-watch-open"
          : ""
      }`.trim()}
    >
      {!longWatchOpen && (
      <nav
        ref={
          tabsRef
        }
        className="pulse-immersive__tabs"
        aria-label="Формати PULSE"
      >
        {TABS.map(
          (
            tab
          ) => (
            <motion.button
              key={
                tab.id
              }
              type="button"
              data-pulse-tab={
                tab.id
              }
              whileTap={{
                scale: 0.94,
              }}
              className={
                activeTab ===
                tab.id
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                selectTab(
                  tab.id
                )
              }
            >
              {activeTab ===
                tab.id && (
                <motion.span
                  layoutId="pulse-tab-active"
                  className="pulse-immersive__tab-active"
                  transition={{
                    type:
                      "spring",
                    stiffness:
                      480,
                    damping:
                      38,
                  }}
                />
              )}

              <span className="pulse-immersive__tab-label">
                {
                  tab.label
                }
              </span>

              {tab.id ===
                "live" && (
                <i />
              )}
            </motion.button>
          )
        )}
      </nav>
      )}

      {activeTab ===
      "vlogs" ? (
        <PulseLongVideoMobile
          videos={
            videos
          }
          authSession={
            authSession
          }
          onWatchChange={
            handleLongWatchChange
          }
        />
      ) : activeTab ===
        "live" ? (
        <PulseInlineLive
          videos={
            videos
          }
          onStartLive={() =>
            onNavigate?.(
              "createMedia",
              {
                type:
                  "live",
              }
            )
          }
        />
      ) : activeTab ===
        "nearby" ? (
        <PulseInlineNearby
          videos={
            videos
          }
          onCreateNow={() =>
            onNavigate?.(
              "createMedia",
              {
                type:
                  "moment",
              }
            )
          }
        />
      ) : (
      <div
        ref={
          feedRef
        }
        className="pulse-immersive__feed"
      >
        {videos.length ? (
          videos.map(
            (
              video
            ) => {
              const isForYouTeaser =
                activeTab ===
                  "forYou" &&
                (
                  video.isLive ||
                  video.type ===
                    "live" ||
                  video.type ===
                    "vlog" ||
                  video.type ===
                    "video" ||
                  video.type ===
                    "event"
                );

              if (
                isForYouTeaser
              ) {
                return (
                  <PulseForYouTeaser
                    key={
                      `${activeTab}-${video.id}`
                    }
                    video={
                      video
                    }
                    onOpen={() => {
                      if (
                        video.isLive ||
                        video.type ===
                          "live"
                      ) {
                        selectTab(
                          "live"
                        );

                        return;
                      }

                      if (
                        video.type ===
                          "event"
                      ) {
                        onNavigate?.(
                          "events",
                          {
                            eventId:
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
                    }}
                  />
                );
              }

              return (
                <PulseImmersiveSlide
                  key={
                    `${activeTab}-${video.id}`
                  }
                  video={
                    video
                  }
                  authSession={
                    authSession
                  }
                  socialRevision={
                    socialRevision
                  }
                  onShare={() =>
                    share(
                      video
                    )
                  }
                  onCreate={() =>
                    onNavigate?.(
                      video.isLive
                        ? "live"
                        : "createMedia",
                      video.isLive
                        ? {
                            source:
                              "pulse",
                          }
                        : {
                            type:
                              "clip",
                            continueWaveFrom:
                              video.pulseKind ===
                              "wave"
                                ? video.id
                                : null,
                          }
                    )
                  }
                  showRecommendationControls={
                    activeTab ===
                    "forYou"
                  }
                  onNotInterested={
                    handleNotInterested
                  }
                  onLessFromAuthor={
                    handleLessFromAuthor
                  }
                  onNotice={(
                    label
                  ) =>
                    setFeedbackNotice({
                      kind:
                        "notice",
                      mediaId:
                        null,
                      authorId:
                        null,
                      persisted:
                        false,
                      label,
                    })
                  }
                />
              );
            }
          )
        ) : (
          <div className="pulse-immersive__empty">
            <Radio
              size={32}
            />

            <strong>
              Тут скоро буде більше
            </strong>

            <p>
              {activeTab ===
              "nearby"
                ? "Тут зʼявляться Кліпи «Зараз», події та відео з місць поруч."
                : activeTab ===
                  "live"
                ? "Коли хтось почне трансляцію, LIVE зʼявиться тут без переходу на окрему сторінку."
                : "Новий контент цього формату зʼявиться у PULSE."}
            </p>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "create"
                )
              }
            >
              <Plus
                size={17}
              />

              Створити
            </button>
          </div>
        )}
      </div>
      )}

      <AnimatePresence>
        {feedbackNotice && (
          <motion.div
            className="pulse-feedback-toast"
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.985,
            }}
          >
            <span>
              {
                feedbackNotice.label
              }
            </span>

            {feedbackNotice.kind !==
              "notice" && (
              <button
                type="button"
                onClick={
                  undoPulseFeedback
                }
              >
                Скасувати
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
