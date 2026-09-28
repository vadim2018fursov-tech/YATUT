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

import PulseLongVideoMobile from "./PulseLongVideoMobile";
import PulseCommentsSheet from "./PulseCommentsSheet";
import usePulseSocial from "../../hooks/usePulseSocial";

import {
  nativeLightHaptic,
} from "../../services/nativeFeedbackService";

const TABS = [
  {
    id: "forYou",
    label: "Для тебе",
  },
  {
    id: "following",
    label: "Підписки",
  },
  {
    id: "clips",
    label: "Короткі відео",
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
    id: "wave",
    label: "Хвиля",
  },
  {
    id: "events",
    label: "Події",
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
    case "following":
      return uniqueVideos(
        followingVideos
      );

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

    case "wave":
      return all.filter(
        (
          video
        ) =>
          video.pulseKind ===
          "wave"
      );

    case "events":
      return all.filter(
        (
          video
        ) =>
          video.type ===
            "event" ||
          video.recommendationType ===
            "events"
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

function PulseImmersiveSlide({
  video,
  authSession,
  socialRevision = 0,
  onShare,
  onCreate,
}) {
  const [
    commentsOpen,
    setCommentsOpen,
  ] = useState(false);

  const slideRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const [
    slideActive,
    setSlideActive,
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
    });

  const stats =
    buildStats(
      video
    );

  useEffect(
    () => {
      const element =
        slideRef.current;

      if (!element) {
        return;
      }

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
                    0.65
              );

            setSlideActive(
              visible
            );

            const media =
              videoRef.current;

            if (media) {
              if (visible) {
                media
                  .play()
                  .catch(
                    () => {}
                  );
              } else {
                media.pause();
              }
            }

            if (
              visible &&
              video?.backend
            ) {
              pulseSocial.recordView();
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

      return () => {
        observer.disconnect();
        videoRef.current?.pause?.();
      };
    },
    [
      video?.id,
      video?.backend,
      pulseSocial.recordView,
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
            video.videoUrl ||
            video.video
          }
          poster={
            image
          }
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
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

            if (
              video.trimEnd &&
              element.currentTime >=
                video.trimEnd -
                  0.03
            ) {
              element.currentTime =
                video.trimStart ||
                0;

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
            ЯТУТ PULSE
            {video.recommendationReason
              ? ` · ${video.recommendationReason}`
              : ""}
          </span>
        )}

        <button
          type="button"
          className="pulse-immersive__more"
          aria-label="Більше"
        >
          <MoreHorizontal
            size={22}
          />
        </button>
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

  const videos =
    useMemo(
      () =>
        getFeed(
          activeTab,
          externalVideos,
          forYouVideos,
          followingVideos
        ),
      [
        activeTab,
        externalVideos,
        forYouVideos,
        followingVideos,
      ]
    );

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
      className={`pulse-immersive-mobile ${
        activeTab ===
        "vlogs"
          ? "is-long-form"
          : ""
      } ${
        longWatchOpen
          ? "is-long-watch-open"
          : ""
      }`.trim()}
    >
      {!longWatchOpen && (
      <nav
        className="pulse-immersive__tabs"
        aria-label="Формати PULSE"
      >
        {TABS.map(
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

              {tab.id ===
                "live" && (
                <i />
              )}
            </button>
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
            setLongWatchOpen
          }
        />
      ) : (
      <div className="pulse-immersive__feed">
        {videos.length ? (
          videos.map(
            (
              video
            ) => (
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
                    "createMedia",
                    {
                      type:
                        video.isLive
                          ? "live"
                          : "clip",
                    }
                  )
                }
              />
            )
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
              "following"
                ? "Підпишись на авторів — їхні нові відео зʼявляться тут."
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
    </section>
  );
}
