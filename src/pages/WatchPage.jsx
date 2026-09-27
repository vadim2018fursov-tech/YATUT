import {
  Bell,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  Eye,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PulseVideoPlayer from "../components/pulse/PulseVideoPlayer";
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

const FALLBACK_WATCH_IMAGE =
  "/assets/yatut/cities/kyiv/hero.jpg";

function formatNumber(value) {
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

function getAllVideos(
  externalVideos = []
) {
  const source = [
    ...(externalVideos || []),
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

  source.forEach((video) => {
    if (
      !video ||
      unique.some(
        (item) =>
          item.id === video.id
      )
    ) {
      return;
    }

    unique.push(video);
  });

  return unique;
}

function getCreatorId(video) {
  return (
    video?.author?.id ||
    video?.author?.username ||
    "maria"
  );
}

function WatchRecommendation({
  video,
  onOpen,
}) {
  if (!video) {
    return null;
  }

  return (
    <button
      type="button"
      className="pulse-watch-recommendation"
      onClick={() =>
        onOpen?.(video)
      }
    >
      <div className="pulse-watch-recommendation__media">
        <img
          src={
            video.thumbnail ||
            FALLBACK_WATCH_IMAGE
          }
          alt={
            video.title ||
            "ЯТУТ PULSE"
          }
          onError={(event) => {
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
              FALLBACK_WATCH_IMAGE;
          }}
        />

        {video.duration && (
          <span>
            {video.duration}
          </span>
        )}

        {video.isLive && (
          <b>LIVE</b>
        )}
      </div>

      <div className="pulse-watch-recommendation__copy">
        <strong>
          {video.title}
        </strong>

        <span>
          @
          {video.author
            ?.username ||
            "yatut"}
        </span>

        <small>
          {formatNumber(
            video.views
          )}{" "}
          переглядів
        </small>

        <small>
          📍{" "}
          {video.location
            ?.name ||
            "Україна"}
        </small>
      </div>
    </button>
  );
}

function WatchComment({
  avatar,
  name,
  username,
  text,
  likes,
  time,
  onReply,
}) {
  const [
    liked,
    setLiked,
  ] = useState(false);

  return (
    <article className="pulse-watch-comment">
      <span className="pulse-watch-comment__avatar">
        {avatar}
      </span>

      <div className="pulse-watch-comment__body">
        <div className="pulse-watch-comment__author">
          <strong>
            {name}
          </strong>

          <span>
            @{username}
          </span>

          <small>
            {time}
          </small>
        </div>

        <p>{text}</p>

        <div className="pulse-watch-comment__actions">
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
          >
            <ThumbsUp
              size={14}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />

            {likes +
              (liked ? 1 : 0)}
          </button>

          <button
            type="button"
            onClick={() =>
              onReply?.(
                username
              )
            }
          >
            Відповісти
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WatchPage({
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
              items
            );
          }
        }
      )
      .catch(
        (
          error
        ) => {
          console.warn(
            "WATCH PULSE LOAD ERROR:",
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

  const videos =
    useMemo(
      () =>
        getAllVideos(
          backendVideos
        ),
      [
        backendVideos,
      ]
    );

  const initialVideo =
    useMemo(
      () => {
        if (initialVideoId) {
          const match =
            videos.find(
              (video) =>
                video.id ===
                initialVideoId
            );

          if (match) {
            return match;
          }
        }

        return (
          videos.find(
            (video) =>
              video.type !==
              "clip"
          ) ||
          videos[0]
        );
      },
      [
        videos,
        initialVideoId,
      ]
    );

  const [
    video,
    setVideo,
  ] = useState(initialVideo);

  useEffect(
    () => {
      if (
        !videos.length
      ) {
        return;
      }

      if (
        initialVideoId
      ) {
        const match =
          videos.find(
            (
              item
            ) =>
              item.id ===
              initialVideoId
          );

        if (
          match
        ) {
          setVideo(
            match
          );

          return;
        }
      }

      setVideo(
        (
          current
        ) =>
          current ||
          videos.find(
            (
              item
            ) =>
              item.type !==
              "clip"
          ) ||
          videos[0]
      );
    },
    [
      videos,
      initialVideoId,
    ]
  );

  useEffect(() => {
    if (
      !initialVideoId
    ) {
      return;
    }

    const match =
      videos.find(
        (
          item
        ) =>
          item.id ===
          initialVideoId
      );

    if (
      match &&
      match.id !==
        video?.id
    ) {
      setVideo(
        match
      );
    }
  }, [
    initialVideoId,
    videos,
    video?.id,
  ]);

  const [
    subscribed,
    setSubscribed,
  ] = useState(false);

  const [
    liked,
    setLiked,
  ] = useState(false);

  const [
    disliked,
    setDisliked,
  ] = useState(false);

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const [
    showLocation,
    setShowLocation,
  ] = useState(false);

  const [
    commentText,
    setCommentText,
  ] = useState("");

  const [
    userComments,
    setUserComments,
  ] = useState([]);

  const [
    commentsNewestFirst,
    setCommentsNewestFirst,
  ] = useState(true);

  const recommendations =
    useMemo(
      () =>
        videos
          .filter(
            (item) =>
              item.id !==
              video?.id
          )
          .slice(0, 10),
      [
        videos,
        video?.id,
      ]
    );

  async function shareVideo() {
    if (!video) {
      return;
    }

    await shareYatutItem({
      title:
        video.title ||
        "ЯТУТ PULSE",
      text:
        video.description ||
        "Дивись відео у ЯТУТ PULSE",
      path:
        `#watch=${encodeURIComponent(video.id)}`,
    });
  }

  function replyToComment(
    username
  ) {
    setCommentText(
      `@${username} `
    );

    window.setTimeout(
      () => {
        document
          .querySelector(
            ".pulse-watch-comment-create textarea"
          )
          ?.focus();
      },
      0
    );
  }

  if (!video) {
    return (
      <section className="pulse-watch-empty">
        <h1>
          Відео не знайдено
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

  function openCreator() {
    onNavigate?.(
      "creator",
      {
        creatorId:
          getCreatorId(video),
      }
    );
  }

  function openVideo(nextVideo) {
    if (!nextVideo) {
      return;
    }

    if (
      nextVideo.type ===
      "clip"
    ) {
      onNavigate?.(
        "clips",
        {
          videoId:
            nextVideo.id,
        }
      );

      return;
    }

    setVideo(nextVideo);

    setLiked(false);
    setDisliked(false);
    setSaved(false);
    setExpanded(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function publishComment() {
    const value =
      commentText.trim();

    if (!value) {
      return;
    }

    setUserComments(
      (current) => [
        {
          id:
            `comment-${Date.now()}`,
          text: value,
        },
        ...current,
      ]
    );

    setCommentText("");
  }

  return (
    <div className="pulse-watch-page">
      <main className="pulse-watch-main">
        <PulseVideoPlayer
          key={video.id}
          src={
            video.videoUrl ||
            null
          }
          poster={
            video.thumbnail ||
            FALLBACK_WATCH_IMAGE
          }
          title={
            video.title
          }
          startAt={
            video.trimStart ||
            0
          }
          endAt={
            video.trimEnd ||
            null
          }
        />

        <section className="pulse-watch-title">
          <button
            type="button"
            className="pulse-watch-back"
            onClick={() =>
              onNavigate?.(
                "pulse"
              )
            }
          >
            <ChevronLeft
              size={18}
            />

            PULSE
          </button>

          <h1>
            {video.title}
          </h1>

          <div className="pulse-watch-meta">
            <span>
              <Eye size={15} />

              {formatNumber(
                video.views
              )}{" "}
              переглядів
            </span>

            <span>
              Сьогодні
            </span>

            <button
              type="button"
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
          </div>
        </section>

        <section className="pulse-watch-author-bar">
          <button
            type="button"
            className="pulse-watch-author"
            onClick={
              openCreator
            }
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

            <div>
              <strong>
                {video.author
                  ?.name ||
                  "Автор ЯТУТ"}
              </strong>

              <small>
                @
                {video.author
                  ?.username ||
                  "yatut"}{" "}
                · 24,8K підписників
              </small>
            </div>
          </button>

          <button
            type="button"
            className={`pulse-watch-subscribe ${
              subscribed
                ? "is-subscribed"
                : ""
            }`}
            onClick={() =>
              setSubscribed(
                (value) =>
                  !value
              )
            }
          >
            {subscribed ? (
              <>
                <Bell
                  size={16}
                />

                Ви підписані
              </>
            ) : (
              "Підписатися"
            )}
          </button>

          <div className="pulse-watch-actions">
            <div className="pulse-watch-like-group">
              <button
                type="button"
                className={
                  liked
                    ? "is-active"
                    : ""
                }
                onClick={() => {
                  setLiked(
                    (value) =>
                      !value
                  );

                  setDisliked(false);
                }}
              >
                <ThumbsUp
                  size={17}
                  fill={
                    liked
                      ? "currentColor"
                      : "none"
                  }
                />

                {formatNumber(
                  12400 +
                    (liked
                      ? 1
                      : 0)
                )}
              </button>

              <button
                type="button"
                className={
                  disliked
                    ? "is-active"
                    : ""
                }
                onClick={() => {
                  setDisliked(
                    (value) =>
                      !value
                  );

                  setLiked(false);
                }}
              >
                <ThumbsDown
                  size={17}
                  fill={
                    disliked
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>

            <button
              type="button"
              onClick={
                shareVideo
              }
            >
              <Share2
                size={17}
              />

              Поділитися
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
            >
              <Bookmark
                size={17}
                fill={
                  saved
                    ? "currentColor"
                    : "none"
                }
              />

              {saved
                ? "Збережено"
                : "Зберегти"}
            </button>

            <button
              type="button"
              className="pulse-watch-more"
              onClick={() =>
                setExpanded(
                  true
                )
              }
              aria-label="Показати більше інформації"
            >
              <MoreHorizontal
                size={18}
              />
            </button>
          </div>
        </section>

        <section className="pulse-watch-description">
          <div className="pulse-watch-description__stats">
            <strong>
              {formatNumber(
                video.views
              )}{" "}
              переглядів
            </strong>

            <strong>
              #ЯТУТ
            </strong>

            <strong>
              #PULSE
            </strong>
          </div>

          <p
            className={
              expanded
                ? "is-expanded"
                : ""
            }
          >
            {video.description ||
              `Живе відео з ${
                video.location
                  ?.name ||
                "України"
              }. Тут люди, місця та події повʼязані в одному PULSE. Дивись, що відбувається прямо зараз, знаходь своїх і продовжуй історію разом з ЯТУТ.`}
          </p>

          <button
            type="button"
            className="pulse-watch-description__more"
            onClick={() =>
              setExpanded(
                (value) =>
                  !value
              )
            }
          >
            {expanded
              ? "Менше"
              : "Ще"}

            <ChevronDown
              size={14}
            />
          </button>
        </section>

        <section className="pulse-watch-location">
          <div className="pulse-watch-location__copy">
            <span className="pulse-watch-location__icon">
              <MapPin
                size={20}
              />
            </span>

            <div>
              <small>
                PULSE ЛОКАЦІЇ
              </small>

              <strong>
                {video.location
                  ?.name ||
                  "Україна"}
              </strong>

              <span>
                🔥{" "}
                {video.peopleHere ||
                  428}{" "}
                людей зараз · 👥{" "}
                {video.friendsNearby ||
                  12}{" "}
                друзів поруч
              </span>
            </div>
          </div>

          <YatutHereButton
            compact
            onClick={() =>
              setShowLocation(
                true
              )
            }
          />
        </section>

        <section className="pulse-watch-comments">
          <header>
            <div>
              <MessageCircle
                size={20}
              />

              <h2>
                {248 +
                  userComments.length}{" "}
                коментарів
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setCommentsNewestFirst(
                  (
                    value
                  ) =>
                    !value
                )
              }
            >
              {commentsNewestFirst
                ? "Нові спочатку"
                : "Популярні"}

              <ChevronDown
                size={14}
              />
            </button>
          </header>

          <div className="pulse-watch-comment-create">
            <span>
              В
            </span>

            <div>
              <textarea
                value={
                  commentText
                }
                onChange={(event) =>
                  setCommentText(
                    event.target
                      .value
                  )
                }
                placeholder="Додати коментар..."
                rows={1}
              />

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setCommentText(
                      ""
                    )
                  }
                >
                  Скасувати
                </button>

                <button
                  type="button"
                  className="is-primary"
                  disabled={
                    !commentText.trim()
                  }
                  onClick={
                    publishComment
                  }
                >
                  <Send
                    size={14}
                  />

                  Коментувати
                </button>
              </div>
            </div>
          </div>

          {(commentsNewestFirst
            ? [
                ...userComments,
              ].reverse()
            : userComments
          ).map(
            (comment) => (
              <WatchComment
                key={
                  comment.id
                }
                avatar="В"
                name="Вадим"
                username="vadym"
                text={
                  comment.text
                }
                likes={0}
                time="щойно"
                onReply={
                  replyToComment
                }
              />
            )
          )}

          <WatchComment
            avatar="М"
            name="Марія Коваль"
            username="maria.koval"
            text="Дуже атмосферно. Саме за такі живі відео й люблю PULSE 🔥"
            likes={124}
            time="12 хв тому"
            onReply={
              replyToComment
            }
          />

          <WatchComment
            avatar="О"
            name="Олександр"
            username="oleksandr"
            text="Було б круто ще побачити, хто з друзів зараз знаходиться поруч із цією локацією."
            likes={47}
            time="31 хв тому"
            onReply={
              replyToComment
            }
          />

          <WatchComment
            avatar="С"
            name="Софія"
            username="sofia"
            text="Я буквально була тут годину тому 😄"
            likes={31}
            time="48 хв тому"
            onReply={
              replyToComment
            }
          />
        </section>
      </main>

      <aside className="pulse-watch-sidebar">
        <div className="pulse-watch-sidebar__top">
          <strong>
            Далі
          </strong>

          <span>
            ЯТУТ PULSE
          </span>
        </div>

        <div className="pulse-watch-sidebar__filters">
          <button
            type="button"
            className="is-active"
            onClick={() =>
              onNavigate?.(
                "pulse"
              )
            }
          >
            Для тебе
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "nearby"
              )
            }
          >
            Поруч
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "cityPulse",
                {
                  cityId:
                    video.city ||
                    "kyiv",
                }
              )
            }
          >
            Київ
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "live"
              )
            }
          >
            LIVE
          </button>
        </div>

        <div className="pulse-watch-recommendations">
          {recommendations.map(
            (item) => (
              <WatchRecommendation
                key={
                  item.id
                }
                video={
                  item
                }
                onOpen={
                  openVideo
                }
              />
            )
          )}
        </div>
      </aside>

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