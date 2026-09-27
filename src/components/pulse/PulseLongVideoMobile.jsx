import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  Heart,
  ListVideo,
  Maximize2,
  MoreHorizontal,
  Settings2,
  Share2,
  MessageCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PulseVideoPlayer from "./PulseVideoPlayer";
import PulseCommentsSheet from "./PulseCommentsSheet";
import usePulseSocial from "../../hooks/usePulseSocial";

const CATEGORIES = [
  "Усі",
  "Подорожі",
  "Міста",
  "Лайфстайл",
];

const QUALITIES = [
  "auto",
  "1080p",
  "720p",
  "480p",
  "360p",
];

const LONG_VIDEO_CRITICAL_CSS = `
  .pulse-immersive-mobile.is-long-form {
    width: 100% !important;
    min-height: calc(100dvh - 64px) !important;
    overflow-x: hidden !important;
    background: #0a0a0e !important;
    color: #fff !important;
  }

  .pulse-immersive-mobile.is-long-form
  .pulse-immersive__tabs {
    margin-bottom: 0 !important;
    background:
      linear-gradient(
        180deg,
        rgba(10,10,14,.99),
        rgba(10,10,14,.96)
      ) !important;
    border-bottom:
      1px solid rgba(255,255,255,.06) !important;
  }

  .pulse-long-mobile,
  .pulse-long-watch {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    color: #fff !important;
    background: #0a0a0e !important;
    box-sizing: border-box !important;
  }

  .pulse-long-mobile *,
  .pulse-long-watch * {
    box-sizing: border-box !important;
  }

  .pulse-long-mobile {
    min-height: calc(100dvh - 122px) !important;
    padding: 10px 0 calc(105px + env(safe-area-inset-bottom)) !important;
    overflow-x: hidden !important;
  }

  .pulse-long-mobile button,
  .pulse-long-watch button {
    appearance: none !important;
    -webkit-appearance: none !important;
    font: inherit !important;
    text-decoration: none !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  .pulse-long-mobile__chips {
    width: 100% !important;
    padding: 0 12px 12px !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
  }

  .pulse-long-mobile__chips::-webkit-scrollbar,
  .pulse-long-mobile__channel-row::-webkit-scrollbar {
    display: none !important;
  }

  .pulse-long-mobile__chips button {
    min-width: max-content !important;
    height: 36px !important;
    margin: 0 !important;
    padding: 0 14px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex: 0 0 auto !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    border-radius: 13px !important;
    background: #202027 !important;
    color: rgba(255,255,255,.86) !important;
    font-size: 11px !important;
    font-weight: 780 !important;
    line-height: 1 !important;
    white-space: nowrap !important;
  }

  .pulse-long-mobile__chips button.is-active {
    border-color: rgba(128,112,255,.65) !important;
    background: linear-gradient(135deg,#695fff,#913de8) !important;
    color: #fff !important;
    box-shadow: 0 7px 18px rgba(99,91,255,.22) !important;
  }

  .pulse-long-mobile__channels {
    width: 100% !important;
    margin: 0 0 14px !important;
    padding: 0 0 13px !important;
    border: 0 !important;
    border-bottom: 1px solid rgba(255,255,255,.07) !important;
    background: transparent !important;
  }

  .pulse-long-mobile__section-title {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 14px 9px !important;
    display: block !important;
    color: rgba(255,255,255,.88) !important;
    background: transparent !important;
    font-size: 12px !important;
    font-weight: 850 !important;
    line-height: 1.2 !important;
    text-align: left !important;
  }

  .pulse-long-mobile__channel-row {
    width: 100% !important;
    padding: 0 12px !important;
    display: flex !important;
    align-items: flex-start !important;
    gap: 13px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
  }

  .pulse-long-mobile__channel-row button {
    width: 60px !important;
    min-width: 60px !important;
    max-width: 60px !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    flex: 0 0 60px !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 6px !important;
    border: 0 !important;
    background: transparent !important;
    color: rgba(255,255,255,.7) !important;
  }

  .pulse-long-mobile__channel-row button > span {
    width: 52px !important;
    height: 52px !important;
    min-width: 52px !important;
    min-height: 52px !important;
    display: grid !important;
    place-items: center !important;
    border: 2px solid rgba(255,255,255,.12) !important;
    border-radius: 50% !important;
    background: linear-gradient(145deg,#27233a,#15141c) !important;
    color: #bbb3ff !important;
    font-size: 14px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
  }

  .pulse-long-mobile__channel-row button.is-active > span {
    border-color: #7a6cff !important;
    background: linear-gradient(145deg,#6e63ff,#9e51ed) !important;
    color: #fff !important;
    box-shadow:
      0 0 0 3px rgba(99,91,255,.14),
      0 7px 18px rgba(99,91,255,.18) !important;
  }

  .pulse-long-mobile__channel-row small {
    width: 60px !important;
    display: block !important;
    overflow: hidden !important;
    color: rgba(255,255,255,.64) !important;
    font-size: 8.5px !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    text-align: center !important;
  }

  .pulse-long-mobile > .pulse-long-mobile__section-title {
    padding-top: 0 !important;
  }

  .pulse-long-mobile__feed,
  .pulse-long-watch__next {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 12px !important;
    display: grid !important;
    gap: 18px !important;
  }

  .pulse-long-card {
    width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 0 10px !important;
    display: block !important;
    overflow: hidden !important;
    border: 1px solid rgba(255,255,255,.07) !important;
    border-radius: 17px !important;
    background: #121218 !important;
    color: #fff !important;
    box-shadow: 0 8px 26px rgba(0,0,0,.18) !important;
    text-align: left !important;
  }

  .pulse-long-card:active {
    transform: scale(.992) !important;
  }

  .pulse-long-card__media {
    position: relative !important;
    width: 100% !important;
    aspect-ratio: 16 / 9 !important;
    display: block !important;
    overflow: hidden !important;
    border-radius: 16px 16px 0 0 !important;
    background:
      radial-gradient(circle at 30% 30%,rgba(99,91,255,.28),transparent 38%),
      #181820 !important;
  }

  .pulse-long-card__media img {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    display: block !important;
    object-fit: cover !important;
    object-position: center !important;
  }

  .pulse-long-card__duration {
    position: absolute !important;
    right: 8px !important;
    bottom: 8px !important;
    z-index: 3 !important;
    width: auto !important;
    min-height: 23px !important;
    padding: 0 7px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 7px !important;
    background: rgba(0,0,0,.78) !important;
    color: #fff !important;
    font-size: 9px !important;
    font-weight: 850 !important;
    line-height: 1 !important;
  }

  .pulse-long-card__meta {
    width: 100% !important;
    min-width: 0 !important;
    padding: 10px 10px 0 !important;
    display: grid !important;
    grid-template-columns: 38px minmax(0,1fr) 22px !important;
    align-items: start !important;
    gap: 9px !important;
  }

  .pulse-long-card__avatar {
    width: 38px !important;
    height: 38px !important;
    display: grid !important;
    place-items: center !important;
    border: 2px solid rgba(255,255,255,.18) !important;
    border-radius: 50% !important;
    background: linear-gradient(145deg,#7267ff,#9c4fe9) !important;
    color: #fff !important;
    font-size: 13px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
  }

  .pulse-long-card__copy {
    min-width: 0 !important;
    display: block !important;
  }

  .pulse-long-card__copy strong {
    margin: 0 !important;
    display: -webkit-box !important;
    overflow: hidden !important;
    color: #fff !important;
    font-size: 13px !important;
    font-weight: 820 !important;
    line-height: 1.28 !important;
    white-space: normal !important;
    text-decoration: none !important;
    -webkit-box-orient: vertical !important;
    -webkit-line-clamp: 2 !important;
  }

  .pulse-long-card__copy span {
    margin: 4px 0 0 !important;
    display: block !important;
    overflow: hidden !important;
    color: rgba(255,255,255,.5) !important;
    font-size: 9px !important;
    font-weight: 500 !important;
    line-height: 1.3 !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
  }

  .pulse-long-card__meta > svg {
    width: 20px !important;
    height: 20px !important;
    color: rgba(255,255,255,.7) !important;
  }

  .pulse-long-mobile__empty {
    margin: 12px !important;
    padding: 22px !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    border-radius: 17px !important;
    background: #15151b !important;
    color: rgba(255,255,255,.58) !important;
    font-size: 11px !important;
    text-align: center !important;
  }
`;

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

function qualityLabel(
  value
) {
  return value ===
    "auto"
    ? "Авто"
    : value;
}

function LongVideoCard({
  video,
  onOpen,
}) {
  const author =
    video.author || {};

  return (
    <button
      type="button"
      className="pulse-long-card"
      onClick={() =>
        onOpen(
          video
        )
      }
    >
      <div className="pulse-long-card__media">
        <img
          src={
            video.thumbnail
          }
          alt=""
        />

        <span className="pulse-long-card__duration">
          {
            video.duration ||
            "5:00+"
          }
        </span>
      </div>

      <div className="pulse-long-card__meta">
        <span className="pulse-long-card__avatar">
          {
            author.initials ||
            author.name?.[0] ||
            "Я"
          }
        </span>

        <div className="pulse-long-card__copy">
          <strong>
            {
              video.title
            }
          </strong>

          <span>
            {
              author.name ||
              "Автор ЯТУТ"
            }
            {" · "}
            {formatCompact(
              video.views
            )} переглядів
            {" · "}
            {
              video.published ||
              "нещодавно"
            }
          </span>
        </div>

        <MoreHorizontal
          size={20}
        />
      </div>
    </button>
  );
}

export default function PulseLongVideoMobile({
  videos = [],
  authSession = null,
  onWatchChange,
}) {
  const [
    selectedVideo,
    setSelectedVideo,
  ] = useState(null);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("Усі");

  const [
    activeChannel,
    setActiveChannel,
  ] = useState("all");

  const [
    subscribed,
    setSubscribed,
  ] = useState(
    () =>
      new Set()
  );

  const [
    liked,
    setLiked,
  ] = useState(
    () =>
      new Set()
  );

  const [
    saved,
    setSaved,
  ] = useState(
    () =>
      new Set()
  );

  const [
    quality,
    setQuality,
  ] = useState("auto");

  const [
    qualityOpen,
    setQualityOpen,
  ] = useState(false);

  const [
    commentsOpen,
    setCommentsOpen,
  ] = useState(false);

  const pulseSocial =
    usePulseSocial({
      video:
        selectedVideo,
      authSession,
    });

  const qualityRef =
    useRef(null);

  const playerWrapRef =
    useRef(null);

  const channels =
    useMemo(
      () => {
        const result =
          [];

        videos.forEach(
          (video) => {
            const author =
              video.author;

            if (
              !author?.id ||
              result.some(
                (item) =>
                  item.id ===
                  author.id
              )
            ) {
              return;
            }

            result.push(
              author
            );
          }
        );

        return result;
      },
      [
        videos,
      ]
    );

  const filtered =
    useMemo(
      () =>
        videos.filter(
          (video) => {
            const categoryMatch =
              activeCategory ===
                "Усі" ||
              video.category ===
                activeCategory;

            const channelMatch =
              activeChannel ===
                "all" ||
              video.author?.id ===
                activeChannel;

            return (
              categoryMatch &&
              channelMatch
            );
          }
        ),
      [
        videos,
        activeCategory,
        activeChannel,
      ]
    );

  const selectedSource =
    selectedVideo
      ? selectedVideo
          .qualitySources?.[
          quality
        ] ||
        selectedVideo.videoUrl ||
        selectedVideo.video ||
        null
      : null;

  useEffect(
    () => {
      onWatchChange?.(
        Boolean(
          selectedVideo
        )
      );

      if (
        selectedVideo
      ) {
        document.body.classList.add(
          "pulse-long-video-open"
        );
      } else {
        document.body.classList.remove(
          "pulse-long-video-open"
        );
      }

      return () => {
        document.body.classList.remove(
          "pulse-long-video-open"
        );
      };
    },
    [
      selectedVideo,
      onWatchChange,
    ]
  );

  useEffect(
    () => {
      if (!qualityOpen) {
        return;
      }

      function closeOutside(
        event
      ) {
        if (
          qualityRef.current?.contains(
            event.target
          )
        ) {
          return;
        }

        setQualityOpen(
          false
        );
      }

      document.addEventListener(
        "pointerdown",
        closeOutside
      );

      return () =>
        document.removeEventListener(
          "pointerdown",
          closeOutside
        );
    },
    [
      qualityOpen,
    ]
  );

  function toggleSet(
    setter,
    id
  ) {
    setter(
      (
        previous
      ) => {
        const next =
          new Set(
            previous
          );

        if (
          next.has(
            id
          )
        ) {
          next.delete(
            id
          );
        } else {
          next.add(
            id
          );
        }

        return next;
      }
    );
  }

  async function openFullscreen() {
    const target =
      playerWrapRef.current;

    if (!target) {
      return;
    }

    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen();

        return;
      }

      if (
        target.requestFullscreen
      ) {
        await target.requestFullscreen();

        try {
          await screen.orientation?.lock?.(
            "landscape"
          );
        } catch {
          // Orientation lock is not available in every mobile browser.
        }

        return;
      }

      const video =
        target.querySelector(
          "video"
        );

      if (
        video?.webkitEnterFullscreen
      ) {
        video.webkitEnterFullscreen();
      }
    } catch {
      // Browser can deny fullscreen outside supported contexts.
    }
  }

  function openVideo(
    video
  ) {
    setSelectedVideo(
      video
    );

    setQuality(
      "auto"
    );

    setQualityOpen(
      false
    );
  }

  function closeVideo() {
    setSelectedVideo(
      null
    );

    setQualityOpen(
      false
    );

    setCommentsOpen(
      false
    );
  }

  async function shareVideo(
    video
  ) {
    if (!video) {
      return;
    }

    const url =
      `${window.location.origin}${window.location.pathname}#pulse-video=${encodeURIComponent(
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

        return;
      }

      await navigator.clipboard?.writeText(
        url
      );
    } catch (
      error
    ) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.warn(
          "PULSE LONG VIDEO SHARE ERROR:",
          error
        );
      }
    }
  }

  if (
    selectedVideo
  ) {
    const author =
      selectedVideo.author ||
      {};

    const authorId =
      author.id ||
      selectedVideo.id;

    return (
      <section className="pulse-long-watch">
        <style>
          {LONG_VIDEO_CRITICAL_CSS}
        </style>
        <div
          ref={
            playerWrapRef
          }
          className="pulse-long-watch__player-wrap"
        >
          <PulseVideoPlayer
            key={
              `${selectedVideo.id}-${quality}`
            }
            src={
              selectedSource
            }
            poster={
              selectedVideo.thumbnail
            }
            title={
              selectedVideo.title
            }
            autoPlay={
              Boolean(
                selectedSource
              )
            }
            startAt={
              selectedVideo.trimStart ||
              0
            }
            endAt={
              selectedVideo.trimEnd ||
              null
            }
          />

          <button
            type="button"
            className="pulse-long-watch__back"
            onClick={
              closeVideo
            }
            aria-label="Назад"
          >
            <ArrowLeft
              size={21}
            />
          </button>

          <button
            type="button"
            className="pulse-long-watch__fullscreen"
            onClick={
              openFullscreen
            }
            aria-label="Повний екран"
          >
            <Maximize2
              size={19}
            />
          </button>

          <span className="pulse-long-watch__landscape-hint">
            Поверніть телефон для повного екрана
          </span>
        </div>

        <div className="pulse-long-watch__body">
          <h1>
            {
              selectedVideo.title
            }
          </h1>

          <div className="pulse-long-watch__stats">
            <span>
              {formatCompact(
                selectedVideo.views
              )} переглядів
            </span>

            <span>
              {
                selectedVideo.published ||
                "нещодавно"
              }
            </span>

            {selectedVideo.category && (
              <span>
                {
                  selectedVideo.category
                }
              </span>
            )}
          </div>

          <div className="pulse-long-watch__channel">
            <span className="pulse-long-watch__avatar">
              {
                author.initials ||
                author.name?.[0] ||
                "Я"
              }
            </span>

            <div>
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
              </small>
            </div>

            <button
              type="button"
              className={
                pulseSocial.following
                  ? "is-subscribed"
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
              {pulseSocial.isOwnAuthor ? (
                "Це ви"
              ) : pulseSocial.following ? (
                <>
                  <Check
                    size={16}
                  />

                  Підписані
                </>
              ) : (
                "Підписатися"
              )}
            </button>
          </div>

          <div className="pulse-long-watch__actions">
            <button
              type="button"
              className={
                pulseSocial.liked
                  ? "is-active"
                  : ""
              }
              onClick={
                pulseSocial.toggleLike
              }
            >
              <Heart
                size={18}
                fill={
                  pulseSocial.liked
                    ? "currentColor"
                    : "none"
                }
              />

              Подобається · {formatCompact(
                pulseSocial.likesCount
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setCommentsOpen(
                  true
                )
              }
            >
              <MessageCircle
                size={18}
              />

              Коментарі · {formatCompact(
                pulseSocial.commentsCount
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                shareVideo(
                  selectedVideo
                )
              }
            >
              <Share2
                size={18}
              />

              Поділитися
            </button>

            <button
              type="button"
              className={
                pulseSocial.saved
                  ? "is-active"
                  : ""
              }
              onClick={
                pulseSocial.toggleSaved
              }
            >
              <Bookmark
                size={18}
                fill={
                  pulseSocial.saved
                    ? "currentColor"
                    : "none"
                }
              />

              Зберегти · {formatCompact(
                pulseSocial.savesCount
              )}
            </button>

            <div
              ref={
                qualityRef
              }
              className="pulse-long-watch__quality"
            >
              <button
                type="button"
                onClick={() =>
                  setQualityOpen(
                    (
                      previous
                    ) =>
                      !previous
                  )
                }
              >
                <Settings2
                  size={18}
                />

                {qualityLabel(
                  quality
                )}

                <ChevronDown
                  size={14}
                />
              </button>

              {qualityOpen && (
                <div className="pulse-long-watch__quality-menu">
                  <strong>
                    Якість відео
                  </strong>

                  {QUALITIES.map(
                    (
                      option
                    ) => (
                      <button
                        key={
                          option
                        }
                        type="button"
                        className={
                          quality ===
                          option
                            ? "is-active"
                            : ""
                        }
                        onClick={() => {
                          setQuality(
                            option
                          );
                          setQualityOpen(
                            false
                          );
                        }}
                      >
                        <span>
                          {qualityLabel(
                            option
                          )}
                        </span>

                        {quality ===
                          option && (
                          <Check
                            size={15}
                          />
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pulse-long-watch__description">
            <strong>
              Про відео
            </strong>

            <p>
              {
                selectedVideo.description
              }
            </p>
          </div>

          <div className="pulse-long-watch__next-head">
            <ListVideo
              size={18}
            />

            <strong>
              Далі
            </strong>
          </div>

          <div className="pulse-long-watch__next">
            {videos
              .filter(
                (video) =>
                  video.id !==
                  selectedVideo.id
              )
              .slice(
                0,
                4
              )
              .map(
                (video) => (
                  <LongVideoCard
                    key={
                      video.id
                    }
                    video={
                      video
                    }
                    onOpen={
                      openVideo
                    }
                  />
                )
              )}
          </div>
        </div>

        <PulseCommentsSheet
          open={
            commentsOpen
          }
          video={
            selectedVideo
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
      </section>
    );
  }

  return (
    <section className="pulse-long-mobile">
      <style>
        {LONG_VIDEO_CRITICAL_CSS}
      </style>
      <div className="pulse-long-mobile__chips">
        {CATEGORIES.map(
          (
            category
          ) => (
            <button
              key={
                category
              }
              type="button"
              className={
                activeCategory ===
                category
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setActiveCategory(
                  category
                )
              }
            >
              {
                category
              }
            </button>
          )
        )}
      </div>

      <section className="pulse-long-mobile__channels">
        <div className="pulse-long-mobile__section-title">
          Канали
        </div>

        <div className="pulse-long-mobile__channel-row">
          <button
            type="button"
            className={
              activeChannel ===
                "all"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setActiveChannel(
                "all"
              )
            }
          >
            <span>
              Я
            </span>

            <small>
              Усі
            </small>
          </button>

          {channels.map(
            (
              channel
            ) => (
              <button
                key={
                  channel.id
                }
                type="button"
                className={
                  activeChannel ===
                  channel.id
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setActiveChannel(
                    channel.id
                  )
                }
              >
                <span>
                  {
                    channel.initials ||
                    channel.name?.[0]
                  }
                </span>

                <small>
                  {
                    channel.name
                      .split(
                        " "
                      )[0]
                  }
                </small>
              </button>
            )
          )}
        </div>
      </section>

      <div className="pulse-long-mobile__section-title">
        Відео
      </div>

      <div className="pulse-long-mobile__feed">
        {filtered.length ? (
          filtered.map(
            (
              video
            ) => (
              <LongVideoCard
                key={
                  video.id
                }
                video={
                  video
                }
                onOpen={
                  openVideo
                }
              />
            )
          )
        ) : (
          <div className="pulse-long-mobile__empty">
            Тут поки немає довгих відео цього каналу.
          </div>
        )}
      </div>
    </section>
  );
}
