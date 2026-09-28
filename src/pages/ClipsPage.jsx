import {
  Bookmark,
  ChevronLeft,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Users,
  Volume2,
  VolumeX,
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

import YatutHereButton from "../components/pulse/YatutHereButton";
import LocationPulsePanel from "../components/pulse/LocationPulsePanel";
import PulseCommentsSheet from "../components/pulse/PulseCommentsSheet";
import usePulseSocial from "../hooks/usePulseSocial";

import {
  shareYatutItem,
} from "../utils/shareYatutItem";

import {
  pulseRecommendations,
  pulseVideos,
} from "../data/pulseMockData";

import {
  loadRankedPulseFeeds,
} from "../services/pulseFeedService";

import {
  recordPulseWatchSignal,
} from "../services/pulseSocialService";

import {
  nativeLightHaptic,
} from "../services/nativeFeedbackService";

const FALLBACK_CLIP_IMAGE =
  "/assets/yatut/cities/kyiv/hero.jpg";

function formatViews(value) {
  const number =
    Number(value || 0);

  if (number >= 1000000) {
    return `${(
      number /
      1000000
    ).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${Math.round(
      number /
      1000
    )}K`;
  }

  return String(number);
}

function getCreatorId(video) {
  return (
    video?.author?.id ||
    video?.author?.username ||
    "maria"
  );
}

export default function ClipsPage({
  onNavigate,
  initialVideoId = null,
  authSession = null,
  initialCommentsOpen = false,
}) {
  const [
    rankedBackend,
    setRankedBackend,
  ] = useState({
    all: [],
    forYou: [],
    nearby: [],
  });

  useEffect(() => {
    let active =
      true;

    loadRankedPulseFeeds(
      authSession,
      {
        limit:
          60,
      }
    )
      .then(
        (
          feeds
        ) => {
          if (
            active
          ) {
            setRankedBackend({
              all:
                (
                  feeds?.all ||
                  []
                ).filter(
                  (
                    item
                  ) =>
                    item.type ===
                    "clip"
                ),
              forYou:
                (
                  feeds?.forYou ||
                  []
                ).filter(
                  (
                    item
                  ) =>
                    item.type ===
                    "clip"
                ),
              nearby:
                (
                  feeds?.nearby ||
                  []
                ).filter(
                  (
                    item
                  ) =>
                    item.type ===
                    "clip"
                ),
            });
          }
        }
      )
      .catch(
        (
          error
        ) => {
          console.warn(
            "CLIPS PULSE LOAD ERROR:",
            error
          );
        }
      );

    return () => {
      active =
        false;
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  const [
    activeMode,
    setActiveMode,
  ] = useState(
    "forYou"
  );

  const clips =
    useMemo(
      () => {
        const primaryBackend =
          activeMode ===
          "nearby"
            ? rankedBackend.nearby
            : rankedBackend.forYou;

        const primaryFallback =
          activeMode ===
          "nearby"
            ? pulseRecommendations.nearby ||
              []
            : pulseRecommendations.forYou ||
              [];

        const source = [
          ...primaryBackend,
          ...rankedBackend.all,
          ...primaryFallback,
          ...(pulseVideos || []),
          ...(pulseRecommendations.city || []),
          ...(pulseRecommendations.wave || []),
          ...(pulseRecommendations.live || []),
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

            unique.push(video);
          }
        );

        return unique;
      },
      [
        rankedBackend,
        activeMode,
      ]
    );

  const initialIndex =
    useMemo(
      () => {
        if (!initialVideoId) {
          return 0;
        }

        const index =
          clips.findIndex(
            (video) =>
              video.id ===
              initialVideoId
          );

        return index >= 0
          ? index
          : 0;
      },
      [
        clips,
        initialVideoId,
      ]
    );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(
    initialIndex
  );

  useEffect(() => {
    if (
      !initialVideoId
    ) {
      return;
    }

    const index =
      clips.findIndex(
        (
          item
        ) =>
          item.id ===
          initialVideoId
      );

    if (
      index >=
      0
    ) {
      setCurrentIndex(
        index
      );
    }
  }, [
    clips,
    initialVideoId,
  ]);

  const [
    muted,
    setMuted,
  ] = useState(true);

  const [
    showLocation,
    setShowLocation,
  ] = useState(false);

  const [
    moreOpen,
    setMoreOpen,
  ] = useState(false);

  const [
    commentsOpen,
    setCommentsOpen,
  ] = useState(
    Boolean(
      initialCommentsOpen
    )
  );

  useEffect(
    () => {
      setCommentsOpen(
        Boolean(
          initialCommentsOpen
        )
      );
    },
    [
      initialCommentsOpen,
      initialVideoId,
    ]
  );

  const video =
    clips[
      currentIndex %
        Math.max(
          clips.length,
          1
        )
    ];

  const pulseSocial =
    usePulseSocial({
      video,
      authSession,
    });

  const clipVideoRef =
    useRef(null);

  const clipWatchRef =
    useRef({
      mediaId: null,
      active: false,
      startedAt: 0,
      totalWatchMs: 0,
      completed: false,
      replay: false,
      cycleCompleted: false,
      everCompleted: false,
      lastMediaTime: 0,
    });

  function resetClipWatch(
    mediaId = null
  ) {
    clipWatchRef.current = {
      mediaId,
      active: false,
      startedAt: 0,
      totalWatchMs: 0,
      completed: false,
      replay: false,
      cycleCompleted: false,
      everCompleted: false,
      lastMediaTime: 0,
    };
  }

  function accumulateClipWatch() {
    const watch =
      clipWatchRef.current;

    if (!watch.active) {
      return;
    }

    watch.totalWatchMs +=
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

  function handleClipPlay() {
    pulseSocial.recordView();

    if (
      !video?.backend ||
      !authSession?.user?.id
    ) {
      return;
    }

    const watch =
      clipWatchRef.current;

    if (
      watch.mediaId !==
      video.id
    ) {
      resetClipWatch(
        video.id
      );
    }

    if (!watch.active) {
      watch.active =
        true;

      watch.startedAt =
        performance.now();
    }
  }

  function handleClipPause() {
    accumulateClipWatch();
  }

  function handleClipTimeUpdate(
    event
  ) {
    const element =
      event.currentTarget;

    const watch =
      clipWatchRef.current;

    const start =
      Number(
        video?.trimStart ||
        0
      );

    const end =
      Number(
        video?.trimEnd ||
        element.duration ||
        video?.durationSeconds ||
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
      watch.completed =
        true;

      if (
        watch.everCompleted
      ) {
        watch.replay =
          true;
      }

      watch.everCompleted =
        true;

      watch.cycleCompleted =
        true;
    }

    watch.lastMediaTime =
      current;

    if (
      video?.trimEnd &&
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
  }

  function flushClipWatch(
    targetVideo
  ) {
    accumulateClipWatch();

    const snapshot = {
      ...clipWatchRef.current,
    };

    resetClipWatch(
      null
    );

    if (
      !targetVideo?.backend ||
      !authSession?.user?.id ||
      snapshot.mediaId !==
        targetVideo.id ||
      snapshot.totalWatchMs <
        300
    ) {
      return;
    }

    recordPulseWatchSignal(
      authSession,
      {
        mediaId:
          targetVideo.id,
        watchMs:
          Math.min(
            180000,
            snapshot.totalWatchMs
          ),
        impression:
          true,
        completed:
          snapshot.completed,
        quickSwipe:
          snapshot.totalWatchMs <
            1800 &&
          !snapshot.completed,
        replay:
          snapshot.replay,
      }
    ).catch(
      (
        error
      ) => {
        console.warn(
          "PULSE CLIP WATCH SIGNAL ERROR:",
          error
        );
      }
    );
  }

  useEffect(
    () => {
      const current =
        video;

      if (!current) {
        resetClipWatch(
          null
        );

        return undefined;
      }

      resetClipWatch(
        current.id
      );

      return () => {
        flushClipWatch(
          current
        );
      };
    },
    [
      video?.id,
      authSession?.user?.id,
      authSession?.access_token,
    ]
  );

  useEffect(
    () => {
      function handleVisibility() {
        if (
          document.visibilityState !==
            "visible"
        ) {
          clipVideoRef.current
            ?.pause?.();

          accumulateClipWatch();

          return;
        }

        clipVideoRef.current
          ?.play?.()
          ?.catch?.(
            () => {}
          );
      }

      document.addEventListener(
        "visibilitychange",
        handleVisibility
      );

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibility
        );
      };
    },
    []
  );

  function resetActions() {
    setShowLocation(false);
    setMoreOpen(false);
    setCommentsOpen(false);
  }

  function nextVideo() {
    if (!clips.length) {
      return;
    }

    setCurrentIndex(
      (index) =>
        (index + 1) %
        clips.length
    );

    resetActions();
  }

  function previousVideo() {
    if (!clips.length) {
      return;
    }

    setCurrentIndex(
      (index) =>
        index === 0
          ? clips.length - 1
          : index - 1
    );

    resetActions();
  }

  function openCreator() {
    if (!video) {
      return;
    }

    onNavigate?.(
      "creator",
      {
        creatorId:
          getCreatorId(video),
      }
    );
  }

  async function shareClip() {
    if (!video) {
      return;
    }

    const result =
      await shareYatutItem({
        title:
          video.title ||
          "ЯТУТ PULSE",
        text:
          video.description ||
          "Дивись у ЯТУТ PULSE",
        path:
          `#clip=${encodeURIComponent(video.id)}`,
      });

    if (
      result?.shared ||
      result?.copied
    ) {
      await pulseSocial.recordShare();
    }
  }

  function handleImageError(
    event
  ) {
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
      FALLBACK_CLIP_IMAGE;
  }

  if (!video) {
    return (
      <section className="pulse-clips-empty">
        <h1>
          Кліпів поки немає
        </h1>

        <button
          type="button"
          onClick={() =>
            onNavigate?.(
              "pulse"
            )
          }
        >
          Назад у PULSE
        </button>
      </section>
    );
  }

  return (
    <div className="pulse-clips-page">
      <AnimatePresence
        mode="wait"
        initial={false}
      >
      <motion.section
        key={
          video.id
        }
        className="pulse-clips-stage"
        drag="y"
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        dragElastic={
          0.18
        }
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.992,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -16,
          scale: 0.992,
        }}
        transition={{
          type:
            "spring",
          stiffness:
            390,
          damping:
            36,
          mass:
            0.78,
        }}
        onDragEnd={(
          _event,
          info
        ) => {
          if (
            info.offset.y <
              -78 ||
            info.velocity.y <
              -520
          ) {
            nativeLightHaptic();
            nextVideo();

            return;
          }

          if (
            info.offset.y >
              78 ||
            info.velocity.y >
              520
          ) {
            nativeLightHaptic();
            previousVideo();
          }
        }}
      >
        {video.videoUrl ||
        video.video ? (
          <video
            ref={
              clipVideoRef
            }
            src={
              video.videoUrl ||
              video.video
            }
            poster={
              video.thumbnail ||
              FALLBACK_CLIP_IMAGE
            }
            className="pulse-clips-stage__background"
            autoPlay
            muted={
              muted
            }
            loop
            playsInline
            preload="metadata"
            onPlay={
              handleClipPlay
            }
            onPause={
              handleClipPause
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
            onTimeUpdate={
              handleClipTimeUpdate
            }
          />
        ) : (
          <img
            src={
              video.thumbnail ||
              FALLBACK_CLIP_IMAGE
            }
            alt={
              video.title ||
              "ЯТУТ PULSE"
            }
            className="pulse-clips-stage__background"
            onError={
              handleImageError
            }
          />
        )}

        <div className="pulse-clips-stage__shade" />

        <div className="pulse-clips-top">
          <button
            type="button"
            className="pulse-clips-back"
            onClick={() =>
              onNavigate?.(
                "pulse"
              )
            }
            aria-label="Назад у PULSE"
          >
            <ChevronLeft
              size={23}
            />
          </button>

          <nav className="pulse-clips-switch">
            <button
              type="button"
              className={
                activeMode ===
                "forYou"
                  ? "is-active"
                  : ""
              }
              onClick={() => {
                setActiveMode(
                  "forYou"
                );

                setCurrentIndex(
                  0
                );

                resetActions();
              }}
            >
              Для тебе
            </button>

            <button
              type="button"
              className={
                activeMode ===
                "nearby"
                  ? "is-active"
                  : ""
              }
              onClick={() => {
                setActiveMode(
                  "nearby"
                );

                setCurrentIndex(
                  0
                );

                resetActions();
              }}
            >
              Поруч
            </button>
          </nav>

          <div className="pulse-clips-top-actions">
            <button
              type="button"
              onClick={() =>
                setMuted(
                  (value) =>
                    !value
                )
              }
              aria-label={
                muted
                  ? "Увімкнути звук"
                  : "Вимкнути звук"
              }
            >
              {muted ? (
                <VolumeX
                  size={20}
                />
              ) : (
                <Volume2
                  size={20}
                />
              )}
            </button>

            <div className="pulse-clips-more-wrap">
              <button
                type="button"
                aria-label="Більше"
                onClick={() =>
                  setMoreOpen(
                    (
                      value
                    ) =>
                      !value
                  )
                }
              >
                <MoreHorizontal
                  size={20}
                />
              </button>

              {moreOpen && (
                <div className="pulse-clips-more-menu">
                  <button
                    type="button"
                    onClick={() => {
                      pulseSocial.toggleSaved();
                      setMoreOpen(
                        false
                      );
                    }}
                  >
                    {pulseSocial.saved
                      ? "Прибрати зі збереженого"
                      : "Зберегти"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openCreator();
                      setMoreOpen(
                        false
                      );
                    }}
                  >
                    Про автора
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      nextVideo();
                      setMoreOpen(
                        false
                      );
                    }}
                  >
                    Не цікаво
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="pulse-clips-prev"
          onClick={
            previousVideo
          }
          aria-label="Попереднє відео"
        />

        <button
          type="button"
          className="pulse-clips-next"
          onClick={
            nextVideo
          }
          aria-label="Наступне відео"
        />

        <aside className="pulse-clips-actions">
          <button
            type="button"
            className="pulse-clips-author"
            onClick={
              openCreator
            }
            aria-label="Відкрити автора"
          >
            <span>
              {video.author
                ?.initials ||
                video.author
                  ?.name?.charAt(
                    0
                  ) ||
                "Я"}
            </span>

            <b>+</b>
          </button>

          <motion.button
            type="button"
            whileTap={{
              scale: 0.86,
            }}
            className={
              pulseSocial.liked
                ? "is-active"
                : ""
            }
            onClick={() => {
              nativeLightHaptic();
              pulseSocial.toggleLike();
            }}
            aria-label="Подобається"
          >
            <Heart
              size={24}
              fill={
                pulseSocial.liked
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {formatViews(
                pulseSocial.likesCount
              )}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{
              scale: 0.88,
            }}
            aria-label="Коментарі"
            onClick={() =>
              setCommentsOpen(
                true
              )
            }
          >
            <MessageCircle
              size={24}
            />

            <span>
              {formatViews(
                pulseSocial.commentsCount
              )}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{
              scale: 0.88,
            }}
            aria-label="Поділитися"
            onClick={
              shareClip
            }
          >
            <Share2
              size={24}
            />

            <span>
              {formatViews(
                pulseSocial.sharesCount
              )}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{
              scale: 0.88,
            }}
            className={
              pulseSocial.saved
                ? "is-active"
                : ""
            }
            onClick={() => {
              nativeLightHaptic();
              pulseSocial.toggleSaved();
            }}
            aria-label="Зберегти"
          >
            <Bookmark
              size={24}
              fill={
                pulseSocial.saved
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {formatViews(
                pulseSocial.savesCount
              )}
            </span>
          </motion.button>
        </aside>

        <div className="pulse-clips-content">
          <div className="pulse-clips-author-line">
            <button
              type="button"
              className="pulse-clips-author-name"
              onClick={
                openCreator
              }
            >
              @
              {video.author
                ?.username ||
                "yatut"}
            </button>

            <button
              type="button"
              className={
                pulseSocial.following
                  ? "is-following"
                  : ""
              }
              disabled={
                pulseSocial.isOwnAuthor ||
                pulseSocial.busy
              }
              onClick={
                pulseSocial.toggleFollow
              }
            >
              {pulseSocial.isOwnAuthor
                ? "Це ви"
                : pulseSocial.following
                ? "Ви підписані"
                : "Підписатися"}
            </button>
          </div>

          <p className="pulse-clips-description">
            {video.description ||
              video.title ||
              "Живий момент у ЯТУТ PULSE"}
          </p>

          <div className="pulse-clips-tags">
            <span>
              #ЯТУТ
            </span>

            <span>
              #PULSE
            </span>

            {video.isMoment && (
              <span>
                #ЗАРАЗ
              </span>
            )}

            {video.isLive && (
              <span>
                #LIVE
              </span>
            )}
          </div>

          <button
            type="button"
            className="pulse-clips-location"
            onClick={() =>
              setShowLocation(
                true
              )
            }
          >
            <MapPin
              size={15}
            />

            {video.location
              ?.name ||
              "Україна"}
          </button>

          <div className="pulse-clips-live-info">
            <div>
              <span className="pulse-clips-live-info__hot">
                🔥
              </span>

              <div>
                <strong>
                  Тут зараз{" "}
                  {video.peopleHere ||
                    428}{" "}
                  людей
                </strong>

                <small>
                  Локація живе
                  просто зараз
                </small>
              </div>
            </div>

            <div>
              <Users
                size={18}
              />

              <div>
                <strong>
                  {video.friendsNearby ||
                    12}{" "}
                  друзів поруч
                </strong>

                <small>
                  Твої люди теж
                  тут
                </small>
              </div>
            </div>
          </div>

          <YatutHereButton
            onClick={() =>
              setShowLocation(
                true
              )
            }
          />
        </div>

        <div className="pulse-clips-progress">
          <span
            style={{
              width:
                `${
                  ((currentIndex +
                    1) /
                    clips.length) *
                  100
                }%`,
            }}
          />
        </div>
      </motion.section>
      </AnimatePresence>

      {showLocation && (
        <LocationPulsePanel
          location={
            video.location
              ?.name ||
            "Україна"
          }
          peopleNow={
            video.peopleHere ||
            428
          }
          friendsNearby={
            video.friendsNearby ||
            12
          }
          videosLastHour={8}
          eventsToday={6}
          onClose={() =>
            setShowLocation(
              false
            )
          }
          onOpenMap={() => {
            setShowLocation(
              false
            );

            if (video.city) {
              onNavigate?.(
                "cityPulse",
                {
                  cityId:
                    video.city,
                }
              );

              return;
            }

            onNavigate?.(
              "nearby"
            );
          }}
        />
      )}

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
    </div>
  );
}