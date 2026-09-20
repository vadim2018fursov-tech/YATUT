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
    return `${Math.round(
      number /
      1000
    )}K`;
  }

  return String(
    number
  );
}

function getAllVideos() {
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
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "videos"
  );

  const [
    subscribed,
    setSubscribed,
  ] = useState(
    false
  );

  const creator =
    pulseUsers[
      creatorId
    ] ||
    pulseUsers.maria ||
    {
      id: "creator",
      name:
        "Автор ЯТУТ",
      username:
        "yatut.creator",
      initials: "Я",
    };

  async function shareCreatorProfile() {
    await shareYatutItem({
      title:
        `${creator.name} · ЯТУТ PULSE`,

      text:
        `@${creator.username} у ЯТУТ PULSE`,

      path:
        `#creator=${encodeURIComponent(creator.id)}`,
    });
  }

  const allVideos =
    useMemo(
      () =>
        getAllVideos(),
      []
    );

  const creatorVideos =
    useMemo(
      () => {
        const exact =
          allVideos.filter(
            (video) =>
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
              (video) =>
                video.type ===
                "clip"
            );

          case "live":
            return creatorVideos.filter(
              (video) =>
                video.isLive ||
                video.type ===
                  "live"
            );

          case "waves":
            return (
              pulseRecommendations.wave ||
              []
            );

          default:
            return creatorVideos.filter(
              (video) =>
                video.type !==
                "clip"
            );
        }
      },
      [
        activeTab,
        creatorVideos,
      ]
    );

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

  return (
    <div className="pulse-creator-page">
      {/* =================================================
          HERO
      ================================================= */}

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

              <span>
                <Check
                  size={12}
                  strokeWidth={3}
                />
              </span>
            </div>

            <strong>
              @
              {
                creator.username ||
                "yatut.creator"
              }
            </strong>

            <p>
              Живі історії міста,
              люди та моменти,
              які відбуваються
              просто зараз.
            </p>

            <div className="pulse-creator-location">
              <MapPin
                size={15}
              />

              Київ · Україна
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
                <>
                  <Users
                    size={16}
                  />

                  Підписатися
                </>
              )}
            </button>

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

      {/* =================================================
          STATS
      ================================================= */}

      <section className="pulse-creator-stats">
        <article>
          <strong>
            24,8K
          </strong>

          <span>
            підписників
          </span>
        </article>

        <article>
          <strong>
            {formatNumber(
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
              )
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
            18
          </strong>

          <span>
            хвиль
          </span>
        </article>
      </section>

      {/* =================================================
          LIVE PRESENCE
      ================================================= */}

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
              Зараз у Києві
            </strong>

            <p>
              Остання активність
              8 хвилин тому
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate?.(
              "cityPulse",
              {
                cityId:
                  "kyiv",
              }
            )
          }
        >
          Дивитися місто
        </button>
      </section>

      {/* =================================================
          TABS
      ================================================= */}

      <nav className="pulse-creator-tabs">
        {tabs.map(
          (tab) => (
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

      {/* =================================================
          CONTENT HEADER
      ================================================= */}

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
              (video) => (
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
              Нові матеріали
              зʼявляться тут
              автоматично.
            </span>
          </div>
        )}
      </section>

      {/* =================================================
          CREATOR CTA
      ================================================= */}

      <section className="pulse-creator-bottom">
        <div>
          <Eye
            size={20}
          />

          <div>
            <strong>
              Стеж за автором
              у реальному часі
            </strong>

            <span>
              Нові відео,
              LIVE та хвилі
              зʼявляться у твоєму
              PULSE.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setSubscribed(
              true
            )
          }
        >
          Підписатися
        </button>
      </section>
    </div>
  );
}