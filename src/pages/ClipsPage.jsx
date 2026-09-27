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
  useState,
} from "react";

import YatutHereButton from "../components/pulse/YatutHereButton";
import LocationPulsePanel from "../components/pulse/LocationPulsePanel";

import {
  shareYatutItem,
} from "../utils/shareYatutItem";

import {
  pulseRecommendations,
  pulseVideos,
} from "../data/pulseMockData";

import {
  loadPulseMedia,
} from "../services/pulseBackendService";

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
}) {
  const [
    backendVideos,
    setBackendVideos,
  ] = useState([]);

  useEffect(() => {
    let active =
      true;

    loadPulseMedia(
      authSession,
      {
        limit:
          40,
      }
    )
      .then(
        (
          items
        ) => {
          if (
            active
          ) {
            setBackendVideos(
              items.filter(
                (
                  item
                ) =>
                  item.type ===
                  "clip"
              )
            );
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

  const clips =
    useMemo(
      () => {
        const source = [
          ...backendVideos,
          ...(pulseVideos || []),
          ...(pulseRecommendations.forYou || []),
          ...(pulseRecommendations.nearby || []),
          ...(pulseRecommendations.live || []),
          ...(pulseRecommendations.city || []),
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

            unique.push(video);
          }
        );

        return unique;
      },
      [
        backendVideos,
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
    activeMode,
    setActiveMode,
  ] = useState(
    "forYou"
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
    liked,
    setLiked,
  ] = useState(false);

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    muted,
    setMuted,
  ] = useState(false);

  const [
    showLocation,
    setShowLocation,
  ] = useState(false);

  const [
    following,
    setFollowing,
  ] = useState(false);

  const [
    moreOpen,
    setMoreOpen,
  ] = useState(false);

  const video =
    clips[
      currentIndex %
        Math.max(
          clips.length,
          1
        )
    ];

  function resetActions() {
    setLiked(false);
    setSaved(false);
    setShowLocation(false);
    setMoreOpen(false);
    setFollowing(false);
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
      <section className="pulse-clips-stage">
        {video.videoUrl ||
        video.video ? (
          <video
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
            muted
            loop
            playsInline
            preload="metadata"
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
              onClick={() =>
                setActiveMode(
                  "forYou"
                )
              }
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
              onClick={() =>
                setActiveMode(
                  "nearby"
                )
              }
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
                      setSaved(
                        true
                      );
                      setMoreOpen(
                        false
                      );
                    }}
                  >
                    Зберегти
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

          <button
            type="button"
            className={
              liked
                ? "is-active"
                : ""
            }
            onClick={() =>
              setLiked(
                (value) =>
                  !value
              )
            }
            aria-label="Подобається"
          >
            <Heart
              size={24}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {formatViews(
                Number(
                  video.views ||
                    0
                ) +
                  (liked
                    ? 1
                    : 0)
              )}
            </span>
          </button>

          <button
            type="button"
            aria-label="Коментарі"
            onClick={() =>
              onNavigate?.(
                "watch",
                {
                  videoId:
                    video.id,
                  openComments:
                    true,
                }
              )
            }
          >
            <MessageCircle
              size={24}
            />

            <span>
              {video.comments ||
                248}
            </span>
          </button>

          <button
            type="button"
            aria-label="Поділитися"
            onClick={
              shareClip
            }
          >
            <Share2
              size={24}
            />

            <span>
              {video.shares ||
                61}
            </span>
          </button>

          <button
            type="button"
            className={
              saved
                ? "is-active"
                : ""
            }
            onClick={() =>
              setSaved(
                (value) =>
                  !value
              )
            }
            aria-label="Зберегти"
          >
            <Bookmark
              size={24}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
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
                following
                  ? "is-following"
                  : ""
              }
              onClick={() =>
                setFollowing(
                  (
                    value
                  ) =>
                    !value
                )
              }
            >
              {following
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
      </section>

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
    </div>
  );
}