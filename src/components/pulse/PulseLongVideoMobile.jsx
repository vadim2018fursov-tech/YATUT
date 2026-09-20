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
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PulseVideoPlayer from "./PulseVideoPlayer";

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
                subscribed.has(
                  authorId
                )
                  ? "is-subscribed"
                  : ""
              }
              onClick={() =>
                toggleSet(
                  setSubscribed,
                  authorId
                )
              }
            >
              {subscribed.has(
                authorId
              ) ? (
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
                liked.has(
                  selectedVideo.id
                )
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                toggleSet(
                  setLiked,
                  selectedVideo.id
                )
              }
            >
              <Heart
                size={18}
                fill={
                  liked.has(
                    selectedVideo.id
                  )
                    ? "currentColor"
                    : "none"
                }
              />

              Подобається
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
                saved.has(
                  selectedVideo.id
                )
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                toggleSet(
                  setSaved,
                  selectedVideo.id
                )
              }
            >
              <Bookmark
                size={18}
                fill={
                  saved.has(
                    selectedVideo.id
                  )
                    ? "currentColor"
                    : "none"
                }
              />

              Зберегти
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
      </section>
    );
  }

  return (
    <section className="pulse-long-mobile">
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
