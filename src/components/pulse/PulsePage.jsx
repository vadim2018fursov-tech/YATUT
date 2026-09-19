import {
  useMemo,
  useState,
} from "react";

import {
  Flame,
  MapPin,
  Sparkles,
  Users,
  Building2,
  Play,
  Radio,
} from "lucide-react";

import PulseTabs from "../components/pulse/PulseTabs";
import PulseHero from "../components/pulse/PulseHero";
import PulseRightRail from "../components/pulse/PulseRightRail";

import {
  pulseRecommendations,
} from "../data/pulseMockData";

function SectionIcon({
  type,
}) {
  if (
    type ===
    "trending"
  ) {
    return (
      <Flame
        size={18}
      />
    );
  }

  if (
    type ===
    "nearby"
  ) {
    return (
      <MapPin
        size={18}
      />
    );
  }

  if (
    type ===
    "friends"
  ) {
    return (
      <Users
        size={18}
      />
    );
  }

  if (
    type ===
    "city"
  ) {
    return (
      <Building2
        size={18}
      />
    );
  }

  if (
    type ===
    "live"
  ) {
    return (
      <Radio
        size={18}
      />
    );
  }

  return (
    <Sparkles
      size={18}
    />
  );
}

function CompactVideoCard({
  video,
}) {
  return (
    <button
      type="button"
      className="pulse-mini-video-card"
    >
      <div className="pulse-mini-video-card__media">
        <img
          src={
            video.thumbnail
          }
          alt=""
          loading="lazy"
        />

        {video.isLive && (
          <span className="pulse-mini-video-card__live">
            LIVE
          </span>
        )}

        {video.duration && (
          <span className="pulse-mini-video-card__duration">
            {
              video.duration
            }
          </span>
        )}

        <div className="pulse-mini-video-card__play">
          <Play
            size={15}
            fill="currentColor"
          />
        </div>
      </div>

      <div className="pulse-mini-video-card__body">
        <strong>
          {
            video.title
          }
        </strong>

        <span>
          @
          {
            video.author
              .username
          }
        </span>

        <small>
          📍{" "}
          {
            video.location
              ?.name
          }
        </small>
      </div>
    </button>
  );
}

function PulseVideoSection({
  title,
  type,
  videos,
}) {
  return (
    <section className="pulse-video-section">
      <header className="pulse-video-section__header">
        <div>
          <span>
            <SectionIcon
              type={
                type
              }
            />
          </span>

          <strong>
            {title}
          </strong>
        </div>

        <button
          type="button"
        >
          Дивитися всі →
        </button>
      </header>

      <div className="pulse-video-section__grid">
        {videos.map(
          (video) => (
            <CompactVideoCard
              key={
                video.id
              }
              video={
                video
              }
            />
          )
        )}
      </div>
    </section>
  );
}

export default function PulsePage({
  onNavigate,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "forYou"
  );

  const activeVideos =
    useMemo(
      () => {
        return (
          pulseRecommendations[
            activeTab
          ] ||
          pulseRecommendations
            .forYou
        );
      },
      [
        activeTab,
      ]
    );

  return (
    <div className="pulse-page">
      <div className="pulse-page__main">
        {/* =============================================
            TOP TABS
        ============================================= */}

        <PulseTabs
          activeTab={
            activeTab
          }
          onChange={
            setActiveTab
          }
        />

        {/* =============================================
            HERO
        ============================================= */}

        <PulseHero
          onNavigate={
            onNavigate
          }
        />

        {/* =============================================
            ACTIVE TAB PREVIEW
        ============================================= */}

        <section className="pulse-current-feed">
          <div className="pulse-current-feed__title">
            <div>
              <Sparkles
                size={18}
              />

              <strong>
                {
                  activeTab ===
                  "nearby"
                    ? "Поруч із тобою"
                    : activeTab ===
                      "friends"
                    ? "Дивляться друзі"
                    : activeTab ===
                      "city"
                    ? "Твоє місто"
                    : activeTab ===
                      "events"
                    ? "Події зараз"
                    : activeTab ===
                      "live"
                    ? "LIVE зараз"
                    : "Для тебе"
                }
              </strong>
            </div>

            <span>
              Живе прямо зараз
            </span>
          </div>

          <div className="pulse-current-feed__grid">
            {activeVideos
              .slice(
                0,
                4
              )
              .map(
                (
                  video
                ) => (
                  <CompactVideoCard
                    key={
                      video.id
                    }
                    video={
                      video
                    }
                  />
                )
              )}
          </div>
        </section>

        {/* =============================================
            DISCOVERY ROWS
        ============================================= */}

        <div className="pulse-discovery-sections">
          <PulseVideoSection
            title="Зараз набирає"
            type="trending"
            videos={
              pulseRecommendations.forYou.slice(
                0,
                4
              )
            }
          />

          <PulseVideoSection
            title="Поруч із тобою"
            type="nearby"
            videos={
              pulseRecommendations.nearby.length
                ? pulseRecommendations.nearby
                : pulseRecommendations.forYou.slice(
                    0,
                    3
                  )
            }
          />

          <PulseVideoSection
            title="Дивляться друзі"
            type="friends"
            videos={
              pulseRecommendations.friends.length
                ? pulseRecommendations.friends
                : pulseRecommendations.forYou.slice(
                    0,
                    3
                  )
            }
          />

          <PulseVideoSection
            title="Твоє місто"
            type="city"
            videos={
              pulseRecommendations.city.slice(
                0,
                4
              )
            }
          />
        </div>

        {/* =============================================
            WAVE PREVIEW
        ============================================= */}

        <section className="pulse-wave-preview">
          <div>
            <span className="pulse-wave-preview__line">
              〰
            </span>

            <div>
              <strong>
                ЯТУТ Хвиля
              </strong>

              <p>
                Одне відео.
                Багато міст.
                Разом створюємо
                хвилю.
              </p>
            </div>
          </div>

          <button
            type="button"
          >
            Продовжити хвилю
          </button>
        </section>
      </div>

      <PulseRightRail
        onNavigate={
          onNavigate
        }
      />
    </div>
  );
}