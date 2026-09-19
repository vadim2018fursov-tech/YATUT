import {
  Activity,
  BarChart3,
  Film,
  MapPin,
  Play,
  Radio,
  Sparkles,
  Video,
  Waves,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import Profile from "../components/Profile";
import PulseVideoCard from "../components/pulse/PulseVideoCard";

import {
  pulseRecommendations,
  pulseVideos,
} from "../data/pulseMockData";

const tabs = [
  {
    id: "posts",
    label: "Дописи",
    icon: Sparkles,
  },
  {
    id: "videos",
    label: "Відео",
    icon: Video,
  },
  {
    id: "clips",
    label: "Clips",
    icon: Film,
  },
  {
    id: "pulse",
    label: "PULSE",
    icon: Activity,
  },
];

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

export default function UnifiedProfilePage({
  onNavigate,
  onOpenChat,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "posts"
  );

  const videos =
    useMemo(
      () =>
        getAllVideos(),
      []
    );

  const longVideos =
    useMemo(
      () =>
        videos.filter(
          (video) =>
            video.type !==
              "clip" &&
            video.type !==
              "live"
        ),
      [videos]
    );

  const clips =
    useMemo(
      () =>
        videos.filter(
          (video) =>
            video.type ===
            "clip"
        ),
      [videos]
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
    <div className="unified-profile-page">
      {/* ===============================================
          VIDEO / PULSE IDENTITY
      =============================================== */}

      <section className="unified-profile-pulse-head">
        <div className="unified-profile-pulse-head__left">
          <span className="unified-profile-pulse-head__icon">
            <Activity
              size={20}
            />
          </span>

          <div>
            <small>
              ЯТУТ PULSE
            </small>

            <strong>
              Твоя медіасторінка
            </strong>

            <p>
              Дописи, відео,
              Clips та твій
              PULSE — в одному
              профілі.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="unified-profile-studio-button"
          onClick={() =>
            onNavigate?.(
              "creatorStudio"
            )
          }
        >
          <BarChart3
            size={17}
          />

          Creator Studio
        </button>
      </section>

      {/* ===============================================
          TABS
      =============================================== */}

      <nav className="unified-profile-tabs">
        {tabs.map(
          (tab) => {
            const Icon =
              tab.icon;

            return (
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
                <Icon
                  size={17}
                />

                <span>
                  {
                    tab.label
                  }
                </span>
              </button>
            );
          }
        )}
      </nav>

      {/* ===============================================
          EXISTING SOCIAL PROFILE
      =============================================== */}

      {activeTab ===
        "posts" && (
        <div className="unified-profile-social">
          <Profile
            onNavigate={
              onNavigate
            }
            onOpenChat={
              onOpenChat
            }
          />
        </div>
      )}

      {/* ===============================================
          LONG VIDEOS
      =============================================== */}

      {activeTab ===
        "videos" && (
        <section className="unified-profile-media">
          <header className="unified-profile-section-title">
            <div>
              <span>
                <Play
                  size={18}
                  fill="currentColor"
                />
              </span>

              <div>
                <strong>
                  Відео та влоги
                </strong>

                <small>
                  Повні історії
                  у ЯТУТ
                </small>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "createMedia",
                  {
                    type:
                      "video",
                  }
                )
              }
            >
              + Створити
            </button>
          </header>

          {longVideos.length ? (
            <div className="unified-profile-video-grid">
              {longVideos.map(
                (video) => (
                  <PulseVideoCard
                    key={
                      video.id
                    }
                    video={
                      video
                    }
                    variant="wide"
                    onOpen={
                      openVideo
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="unified-profile-empty">
              <Video
                size={30}
              />

              <strong>
                Відео поки немає
              </strong>

              <span>
                Тут зʼявляться
                твої відео та
                влоги.
              </span>
            </div>
          )}
        </section>
      )}

      {/* ===============================================
          CLIPS
      =============================================== */}

      {activeTab ===
        "clips" && (
        <section className="unified-profile-media">
          <header className="unified-profile-section-title">
            <div>
              <span>
                <Film
                  size={18}
                />
              </span>

              <div>
                <strong>
                  Clips
                </strong>

                <small>
                  Короткі живі
                  відео
                </small>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "createMedia",
                  {
                    type:
                      "clip",
                  }
                )
              }
            >
              + Clip
            </button>
          </header>

          {clips.length ? (
            <div className="unified-profile-clips-grid">
              {clips.map(
                (video) => (
                  <PulseVideoCard
                    key={
                      video.id
                    }
                    video={
                      video
                    }
                    variant="clip"
                    onOpen={
                      openVideo
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="unified-profile-empty">
              <Film
                size={30}
              />

              <strong>
                Clips поки немає
              </strong>

              <span>
                Твої короткі
                відео будуть тут.
              </span>
            </div>
          )}
        </section>
      )}

      {/* ===============================================
          PULSE
      =============================================== */}

      {activeTab ===
        "pulse" && (
        <div className="unified-profile-pulse">
          <section className="unified-profile-pulse-hero">
            <div>
              <span className="unified-profile-pulse-hero__badge">
                <Activity
                  size={15}
                />

                ТВІЙ PULSE
              </span>

              <h2>
                Ти зараз
                у Києві
              </h2>

              <p>
                Твої відео,
                місця, хвилі
                та активність
                у реальному світі.
              </p>

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
                <MapPin
                  size={16}
                />

                Відкрити Київ
              </button>
            </div>

            <div className="unified-profile-pulse-live">
              <span />

              <strong>
                428
              </strong>

              <small>
                людей поруч
                зараз
              </small>
            </div>
          </section>

          <section className="unified-profile-pulse-stats">
            <article>
              <Activity
                size={19}
              />

              <strong>
                38,4K
              </strong>

              <span>
                PULSE охоплення
              </span>
            </article>

            <article>
              <MapPin
                size={19}
              />

              <strong>
                17
              </strong>

              <span>
                місць
              </span>
            </article>

            <article>
              <Waves
                size={19}
              />

              <strong>
                18
              </strong>

              <span>
                хвиль
              </span>
            </article>

            <article>
              <Radio
                size={19}
              />

              <strong>
                4
              </strong>

              <span>
                LIVE
              </span>
            </article>
          </section>

          <section className="unified-profile-pulse-block">
            <header>
              <div>
                <Waves
                  size={19}
                />

                <div>
                  <strong>
                    Твої хвилі
                  </strong>

                  <small>
                    Одне відео.
                    Багато міст.
                  </small>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "pulse"
                  )
                }
              >
                У PULSE
              </button>
            </header>

            <div className="unified-profile-wave">
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
                <b>
                  Київ
                </b>

                <span>
                  Ти почав
                  хвилю
                </span>
              </button>

              <i>
                →
              </i>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "cityPulse",
                    {
                      cityId:
                        "lviv",
                    }
                  )
                }
              >
                <b>
                  Львів
                </b>

                <span>
                  +824 людини
                </span>
              </button>

              <i>
                →
              </i>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "cityPulse",
                    {
                      cityId:
                        "odesa",
                    }
                  )
                }
              >
                <b>
                  Одеса
                </b>

                <span>
                  +1,2K людей
                </span>
              </button>

              <i>
                →
              </i>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "cityPulse",
                    {
                      cityId:
                        "dnipro",
                    }
                  )
                }
              >
                <b>
                  Дніпро
                </b>

                <span>
                  +580 людей
                </span>
              </button>
            </div>
          </section>

          <section className="unified-profile-pulse-bottom">
            <div>
              <Sparkles
                size={20}
              />

              <div>
                <strong>
                  Керуй своїм
                  контентом
                </strong>

                <span>
                  Перегляди,
                  аудиторія та
                  PULSE-аналітика.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "creatorStudio"
                )
              }
            >
              <BarChart3
                size={16}
              />

              Creator Studio
            </button>
          </section>
        </div>
      )}
    </div>
  );
}