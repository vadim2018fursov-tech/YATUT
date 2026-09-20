import {
  Activity,
  ArrowLeft,
  Bell,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Radio,
  Send,
  Share2,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import YatutHereButton from "../components/pulse/YatutHereButton";

import {
  shareYatutItem,
} from "../utils/shareYatutItem";

import {
  pulseRecommendations,
  pulseVideos,
} from "../data/pulseMockData";

const FALLBACK_IMAGE =
  "/assets/yatut/cities/kyiv/hero.jpg";

const DEMO_CHAT = [
  {
    id: "live-chat-1",
    name: "Марія",
    avatar: "М",
    text:
      "Хто зараз поруч із Хрещатиком? 🔥",
  },
  {
    id: "live-chat-2",
    name: "Софія",
    avatar: "С",
    text:
      "Атмосфера дуже крута!",
  },
  {
    id: "live-chat-3",
    name: "Олександр",
    avatar: "О",
    text:
      "Я тут 👋",
  },
  {
    id: "live-chat-4",
    name: "Анна",
    avatar: "А",
    text:
      "Покажіть площу трохи ближче 🙌",
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

function getLiveVideos() {
  const source = [
    ...(pulseVideos || []),
    ...(pulseRecommendations.live || []),
    ...(pulseRecommendations.events || []),
    ...(pulseRecommendations.nearby || []),
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

      if (
        video.isLive ||
        video.type ===
          "live"
      ) {
        unique.push(
          video
        );
      }
    }
  );

  return unique;
}

function LiveMiniCard({
  video,
  active,
  onOpen,
}) {
  return (
    <button
      type="button"
      className={`pulse-live-mini ${
        active
          ? "is-active"
          : ""
      }`}
      onClick={() =>
        onOpen?.(
          video
        )
      }
    >
      <div className="pulse-live-mini__media">
        <img
          src={
            video.thumbnail ||
            FALLBACK_IMAGE
          }
          alt={
            video.title ||
            "LIVE"
          }
          loading="lazy"
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

        <span className="pulse-live-mini__badge">
          LIVE
        </span>

        <span className="pulse-live-mini__viewers">
          <Eye
            size={12}
          />

          {formatNumber(
            video.viewers ||
            video.peopleHere ||
            video.views ||
            1200
          )}
        </span>
      </div>

      <div className="pulse-live-mini__copy">
        <strong>
          {
            video.title ||
            "LIVE зараз"
          }
        </strong>

        <span>
          <MapPin
            size={12}
          />

          {
            video.location
              ?.name ||
            "Україна"
          }
        </span>
      </div>
    </button>
  );
}

export default function LivePage({
  onNavigate,
  initialVideoId = null,
}) {
  const liveVideos =
    useMemo(
      () =>
        getLiveVideos(),
      []
    );

  const initialIndex =
    useMemo(
      () => {
        if (
          !initialVideoId
        ) {
          return 0;
        }

        const index =
          liveVideos.findIndex(
            (video) =>
              video.id ===
              initialVideoId
          );

        return index >= 0
          ? index
          : 0;
      },
      [
        liveVideos,
        initialVideoId,
      ]
    );

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(
    initialIndex
  );

  const [
    liked,
    setLiked,
  ] = useState(
    false
  );

  const [
    subscribed,
    setSubscribed,
  ] = useState(
    false
  );

  const [
    here,
    setHere,
  ] = useState(
    false
  );

  const [
    message,
    setMessage,
  ] = useState(
    ""
  );

  const [
    chat,
    setChat,
  ] = useState(
    DEMO_CHAT
  );

  const fallbackLive = {
    id:
      "live-demo",
    title:
      "Хрещатик зараз",
    description:
      "Київ живе просто зараз.",
    thumbnail:
      FALLBACK_IMAGE,
    city:
      "kyiv",
    type:
      "live",
    isLive:
      true,
    viewers:
      1284,
    peopleHere:
      428,
    friendsNearby:
      12,
    location: {
      name:
        "Хрещатик",
    },
    author: {
      id:
        "maria",
      name:
        "Марія Коваль",
      username:
        "maria.koval",
      initials:
        "М",
    },
  };

  const video =
    liveVideos[
      activeIndex
    ] ||
    fallbackLive;

  function openLive(
    nextVideo
  ) {
    const index =
      liveVideos.findIndex(
        (item) =>
          item.id ===
          nextVideo.id
      );

    if (
      index < 0
    ) {
      return;
    }

    setActiveIndex(
      index
    );

    setLiked(
      false
    );

    setHere(
      false
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  function publishMessage() {
    const text =
      message.trim();

    if (!text) {
      return;
    }

    setChat(
      (current) => [
        ...current,
        {
          id:
            `live-chat-${Date.now()}`,
          name:
            "Вадим",
          avatar:
            "В",
          text,
        },
      ]
    );

    setMessage(
      ""
    );
  }

  const creatorId =
    video.author?.id ||
    video.author?.username ||
    "maria";

  async function shareLive() {
    await shareYatutItem({
      title:
        video.title ||
        "ЯТУТ LIVE",
      text:
        video.description ||
        "Дивись LIVE у ЯТУТ",
      path:
        `#live=${encodeURIComponent(video.id)}`,
    });
  }

  return (
    <div className="pulse-live-page">
      {/* ===============================================
          TOP
      =============================================== */}

      <header className="pulse-live-page__header">
        <button
          type="button"
          className="pulse-live-page__back"
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

        <div className="pulse-live-page__brand">
          <span>
            <Radio
              size={17}
            />
          </span>

          <div>
            <small>
              ЯТУТ PULSE
            </small>

            <strong>
              LIVE зараз
            </strong>
          </div>
        </div>

        <div className="pulse-live-page__online">
          <span />

          32 540 онлайн
        </div>
      </header>

      {/* ===============================================
          MAIN GRID
      =============================================== */}

      <div className="pulse-live-layout">
        <main className="pulse-live-main">
          {/* ===========================================
              LIVE PLAYER
          =========================================== */}

          <section className="pulse-live-player">
            <img
              src={
                video.thumbnail ||
                FALLBACK_IMAGE
              }
              alt={
                video.title
              }
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

            <div className="pulse-live-player__shade" />

            <div className="pulse-live-player__top">
              <span className="pulse-live-player__live">
                <i />

                LIVE
              </span>

              <span className="pulse-live-player__viewers">
                <Eye
                  size={14}
                />

                {formatNumber(
                  video.viewers ||
                  video.peopleHere ||
                  1284
                )}
              </span>
            </div>

            <div className="pulse-live-player__center">
              <span className="pulse-live-player__pulse">
                <Radio
                  size={29}
                />
              </span>

              <small>
                LIVE PREVIEW
              </small>

              <strong>
                Ефір підключимо
                разом із streaming backend
              </strong>
            </div>

            <div className="pulse-live-player__location">
              <MapPin
                size={16}
              />

              {
                video.location
                  ?.name ||
                "Україна"
              }
            </div>
          </section>

          {/* ===========================================
              TITLE
          =========================================== */}

          <section className="pulse-live-info">
            <div className="pulse-live-info__title">
              <span>
                LIVE
              </span>

              <div>
                <h1>
                  {
                    video.title ||
                    "LIVE зараз"
                  }
                </h1>

                <p>
                  {
                    video.description ||
                    "Дивись, що відбувається прямо зараз."
                  }
                </p>
              </div>
            </div>

            <div className="pulse-live-info__social">
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
                <Heart
                  size={17}
                  fill={
                    liked
                      ? "currentColor"
                      : "none"
                  }
                />

                3,8K
              </button>

              <button
                type="button"
                onClick={
                  shareLive
                }
              >
                <Share2
                  size={17}
                />

                Поділитися
              </button>
            </div>
          </section>

          {/* ===========================================
              AUTHOR
          =========================================== */}

          <section className="pulse-live-author">
            <button
              type="button"
              className="pulse-live-author__identity"
              onClick={() =>
                onNavigate?.(
                  "creator",
                  {
                    creatorId,
                  }
                )
              }
            >
              <span>
                {
                  video.author
                    ?.initials ||
                  "Я"
                }

                <i />
              </span>

              <div>
                <strong>
                  {
                    video.author
                      ?.name ||
                    "Автор ЯТУТ"
                  }
                </strong>

                <small>
                  @
                  {
                    video.author
                      ?.username ||
                    "yatut"
                  }{" "}
                  · 24,8K підписників
                </small>
              </div>
            </button>

            <button
              type="button"
              className={`pulse-live-subscribe ${
                subscribed
                  ? "is-active"
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
          </section>

          {/* ===========================================
              PLACE
          =========================================== */}

          <section className="pulse-live-place">
            <div>
              <span className="pulse-live-place__icon">
                <MapPin
                  size={21}
                />
              </span>

              <div>
                <small>
                  PULSE ЛОКАЦІЇ
                </small>

                <strong>
                  {
                    video.location
                      ?.name ||
                    "Київ"
                  }
                </strong>

                <p>
                  🔥{" "}
                  {
                    video.peopleHere ||
                    428
                  }{" "}
                  людей тут зараз
                  · 👥{" "}
                  {
                    video.friendsNearby ||
                    12
                  }{" "}
                  друзів поруч
                </p>
              </div>
            </div>

            <YatutHereButton
              compact
              active={
                here
              }
              onClick={() =>
                setHere(
                  (value) =>
                    !value
                )
              }
            />
          </section>

          {/* ===========================================
              LIVE PEOPLE
          =========================================== */}

          <section className="pulse-live-people">
            <header>
              <div>
                <Users
                  size={18}
                />

                <div>
                  <strong>
                    Люди тут зараз
                  </strong>

                  <small>
                    PULSE цього місця
                  </small>
                </div>
              </div>

              <span>
                {
                  video.peopleHere ||
                  428
                }
              </span>
            </header>

            <div className="pulse-live-people__row">
              {[
                {
                  id:
                    "maria",
                  avatar:
                    "М",
                },
                {
                  id:
                    "oleksandr",
                  avatar:
                    "О",
                },
                {
                  id:
                    "sofia",
                  avatar:
                    "С",
                },
                {
                  id:
                    "anastasia",
                  avatar:
                    "А",
                },
                {
                  id:
                    "max",
                  avatar:
                    "М",
                },
                {
                  id:
                    "yulia",
                  avatar:
                    "Ю",
                },
                {
                  id:
                    "vlad",
                  avatar:
                    "В",
                },
              ].map(
                (
                  person,
                  index
                ) => (
                  <button
                    key={
                      person.id
                    }
                    type="button"
                    onClick={() =>
                      onNavigate?.(
                        "friends",
                        {
                          personId:
                            person.id,
                        }
                      )
                    }
                    aria-label="Відкрити профіль"
                  >
                    <span>
                      {
                        person.avatar
                      }
                    </span>

                    {index <
                      3 && (
                      <i />
                    )}
                  </button>
                )
              )}

              <span className="pulse-live-people__more">
                +421
              </span>
            </div>
          </section>

          {/* ===========================================
              EVENT
          =========================================== */}

          <section className="pulse-live-event">
            <div>
              <span>
                <Activity
                  size={20}
                />
              </span>

              <div>
                <small>
                  ПОДІЯ ПОРУЧ
                </small>

                <strong>
                  Вечірній Київ
                </strong>

                <p>
                  Люди вже збираються.
                  Дивись інші LIVE
                  з цієї локації.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "events"
                )
              }
            >
              Відкрити подію
            </button>
          </section>

          {/* ===========================================
              OTHER LIVE
          =========================================== */}

          <section className="pulse-live-more">
            <header>
              <div>
                <Radio
                  size={18}
                />

                <div>
                  <strong>
                    Ще LIVE поруч
                  </strong>

                  <small>
                    Реальні місця.
                    Прямо зараз.
                  </small>
                </div>
              </div>
            </header>

            <div className="pulse-live-more__grid">
              {(liveVideos.length
                ? liveVideos
                : [
                    fallbackLive,
                  ]
              ).map(
                (item) => (
                  <LiveMiniCard
                    key={
                      item.id
                    }
                    video={
                      item
                    }
                    active={
                      item.id ===
                      video.id
                    }
                    onOpen={
                      openLive
                    }
                  />
                )
              )}
            </div>
          </section>
        </main>

        {/* ===============================================
            LIVE CHAT
        =============================================== */}

        <aside className="pulse-live-chat">
          <header className="pulse-live-chat__header">
            <div>
              <MessageCircle
                size={18}
              />

              <div>
                <strong>
                  LIVE чат
                </strong>

                <small>
                  312 зараз
                </small>
              </div>
            </div>

            <span>
              LIVE
            </span>
          </header>

          <div className="pulse-live-chat__messages">
            {chat.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                >
                  <span className="pulse-live-chat__avatar">
                    {
                      item.avatar
                    }
                  </span>

                  <div>
                    <strong>
                      {
                        item.name
                      }
                    </strong>

                    <p>
                      {
                        item.text
                      }
                    </p>
                  </div>
                </article>
              )
            )}
          </div>

          <div className="pulse-live-chat__notice">
            <Activity
              size={15}
            />

            <span>
              Чат зараз працює локально
              як UI-демо. Реальні повідомлення
              підключимо через backend.
            </span>
          </div>

          <div className="pulse-live-chat__create">
            <span>
              В
            </span>

            <div>
              <input
                type="text"
                value={
                  message
                }
                onChange={(
                  event
                ) =>
                  setMessage(
                    event.target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    publishMessage();
                  }
                }}
                placeholder="Написати в LIVE чат..."
              />

              <button
                type="button"
                disabled={
                  !message.trim()
                }
                onClick={
                  publishMessage
                }
                aria-label="Надіслати"
              >
                <Send
                  size={17}
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="pulse-live-chat__city"
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
            <MapPin
              size={17}
            />

            Дивитися PULSE міста
          </button>
        </aside>
      </div>
    </div>
  );
}