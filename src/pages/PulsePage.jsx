import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Sparkles,
} from "lucide-react";

import PulseTabs from "../components/pulse/PulseTabs";
import PulseHero from "../components/pulse/PulseHero";
import PulseRightRail from "../components/pulse/PulseRightRail";
import PulseVideoRail from "../components/pulse/PulseVideoRail";
import PulseWave from "../components/pulse/PulseWave";

import PulseMobileHeader from "../components/pulse/PulseMobileHeader";
import PulseMobileTabs from "../components/pulse/PulseMobileTabs";
import PulseMobileImmersive from "../components/pulse/PulseMobileImmersive";

import {
  pulseRecommendations,
  pulseUsers,
} from "../data/pulseMockData";

import {
  loadRankedPulseFeeds,
} from "../services/pulseFeedService";

import {
  subscribePulseRealtime,
} from "../services/realtimeService";

function ensureVideos(
  preferred,
  fallback,
  count = 5
) {
  const primary =
    Array.isArray(
      preferred
    )
      ? preferred
      : [];

  const secondary =
    Array.isArray(
      fallback
    )
      ? fallback
      : [];

  const merged = [
    ...primary,

    ...secondary.filter(
      (candidate) =>
        !primary.some(
          (item) =>
            item.id ===
            candidate.id
        )
    ),
  ];

  return merged.slice(
    0,
    count
  );
}

export default function PulsePage({
  onNavigate,
  authSession = null,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "forYou"
  );

  const [
    backendVideos,
    setBackendVideos,
  ] = useState([]);

  const [
    forYouVideos,
    setForYouVideos,
  ] = useState([]);

  const [
    followingVideos,
    setFollowingVideos,
  ] = useState([]);

  const [
    trendingBackendVideos,
    setTrendingBackendVideos,
  ] = useState([]);

  const [
    friendBackendVideos,
    setFriendBackendVideos,
  ] = useState([]);

  const [
    cityBackendVideos,
    setCityBackendVideos,
  ] = useState([]);

  const [
    nearbyBackendVideos,
    setNearbyBackendVideos,
  ] = useState([]);

  const [
    socialRevision,
    setSocialRevision,
  ] = useState(0);

  useEffect(() => {
    let active =
      true;

    let refreshTimer =
      null;

    const refresh =
      async () => {
        try {
          const feeds =
            await loadRankedPulseFeeds(
              authSession,
              {
                limit:
                  80,
              }
            );

          if (
            active
          ) {
            setBackendVideos(
              feeds.all
            );

            setForYouVideos(
              feeds.forYou
            );

            setFollowingVideos(
              feeds.following
            );

            setTrendingBackendVideos(
              feeds.trending
            );

            setFriendBackendVideos(
              feeds.friends ||
              []
            );

            setCityBackendVideos(
              feeds.city ||
              []
            );

            setNearbyBackendVideos(
              feeds.nearby ||
              []
            );
          }
        } catch (
          error
        ) {
          console.warn(
            "PULSE BACKEND LOAD ERROR:",
            error
          );
        }
      };

    refresh();

    const realtime =
      subscribePulseRealtime({
        session:
          authSession,
        onChange:
          () => {
            setSocialRevision(
              (
                value
              ) =>
                value +
                1
            );

            window.clearTimeout(
              refreshTimer
            );

            refreshTimer =
              window.setTimeout(
                refresh,
                120
              );
          },
      });

    return () => {
      active =
        false;

      window.clearTimeout(
        refreshTimer
      );

      realtime?.close?.();
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  const activeVideos =
    useMemo(
      () => {
        if (
          activeTab ===
          "forYou"
        ) {
          return forYouVideos.slice(
            0,
            8
          );
        }

        if (
          activeTab ===
          "following"
        ) {
          return followingVideos.slice(
            0,
            8
          );
        }

        if (
          activeTab ===
          "friends"
        ) {
          return friendBackendVideos.slice(
            0,
            8
          );
        }

        if (
          activeTab ===
          "city"
        ) {
          return cityBackendVideos.slice(
            0,
            8
          );
        }

        if (
          activeTab ===
          "nearby"
        ) {
          return nearbyBackendVideos.slice(
            0,
            8
          );
        }

        if (
          activeTab ===
          "events"
        ) {
          return [];
        }

        return forYouVideos.slice(
          0,
          8
        );
      },
      [
        activeTab,
        backendVideos,
        forYouVideos,
        followingVideos,
        friendBackendVideos,
        cityBackendVideos,
        nearbyBackendVideos,
      ]
    );

  function openVideo(
    video
  ) {
    if (!video) {
      return;
    }

    if (
      video.isLive ||
      video.type ===
        "live"
    ) {
      onNavigate?.(
        "live",
        {
          videoId:
            video.id,
        }
      );

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

  function changeTab(
    tab
  ) {
    if (
      tab ===
      "live"
    ) {
      onNavigate?.(
        "live"
      );

      return;
    }

    setActiveTab(
      tab
    );
  }

  function continueWave() {
    const firstWaveVideo =
      backendVideos.find(
        (
          video
        ) =>
          video.pulseKind ===
          "wave"
      ) ||
      pulseRecommendations.wave?.[0];

    if (
      firstWaveVideo
    ) {
      openVideo(
        firstWaveVideo
      );

      return;
    }

    onNavigate?.(
      "createMedia",
      {
        type:
          "wave",
      }
    );
  }

  function getActiveTitle() {
    switch (
      activeTab
    ) {
      case "following":
        return "Твої підписки";

      case "nearby":
        return "Зараз поруч";

      case "friends":
        return "Дивляться друзі";

      case "city":
        return "Твоє місто";

      case "events":
        return "Події зараз";

      default:
        return "Україна зараз";
    }
  }

  const friendsWatching = [
    pulseUsers.maria,
    pulseUsers.oleksandr,
    pulseUsers.sofia,
    pulseUsers.anastasia,
  ].filter(Boolean);

  const trendingVideos =
    trendingBackendVideos.slice(
      0,
      5
    );

  const nearbyVideos =
    ensureVideos(
      nearbyBackendVideos,
      backendVideos,
      5
    );

  const friendVideos =
    ensureVideos(
      friendBackendVideos,
      followingVideos,
      5
    );

  const cityVideos =
    ensureVideos(
      cityBackendVideos,
      backendVideos,
      5
    );

  const authorVideos =
    followingVideos.length
      ? followingVideos.slice(
          0,
          5
        )
      : forYouVideos.slice(
          0,
          5
        );

  return (
    <>
      <PulseMobileImmersive
        onNavigate={
          onNavigate
        }
        externalVideos={
          backendVideos
        }
        forYouVideos={
          forYouVideos
        }
        followingVideos={
          followingVideos
        }
        authSession={
          authSession
        }
        socialRevision={
          socialRevision
        }
      />

      <div className="pulse-desktop-experience">
        <PulseMobileHeader
          onNavigate={
            onNavigate
          }
        />

        <div className="pulse-page">
        <div className="pulse-page__main">
          <div className="pulse-desktop-tabs">
            <PulseTabs
              activeTab={
                activeTab
              }
              onChange={
                changeTab
              }
            />
          </div>

          <PulseMobileTabs
            activeTab={
              activeTab
            }
            onChange={
              changeTab
            }
          />

          <PulseHero
            onNavigate={
              onNavigate
            }
          />

          <section className="pulse-active-mode">
            <div className="pulse-active-mode__header">
              <div>
                <Sparkles
                  size={17}
                />

                <div>
                  <strong>
                    {
                      getActiveTitle()
                    }
                  </strong>

                  <small>
                    ЯТУТ PULSE ·
                    живе прямо зараз
                  </small>
                </div>
              </div>
            </div>

            <div className="pulse-active-mode__track">
              {activeVideos.length ? (
                activeVideos.map(
                  (
                    video,
                    index
                  ) => (
                    <div
                      key={
                        video.id
                      }
                      className={
                        index === 0
                          ? "pulse-active-mode__feature"
                          : "pulse-active-mode__small"
                      }
                    >
                      <PulseVideoRail
                        title=""
                        videos={[
                          video,
                        ]}
                        variant={
                          index === 0
                            ? "feature"
                            : "compact"
                        }
                        onOpenVideo={
                          openVideo
                        }
                      />
                    </div>
                  )
                )
              ) : (
                <div className="pulse-active-mode__empty">
                  <strong>
                    {activeTab ===
                    "following"
                      ? "Підписок поки немає"
                      : "Тут поки тихо"}
                  </strong>

                  <span>
                    {activeTab ===
                    "following"
                      ? "Підпишись на авторів у PULSE — їхні нові відео зʼявляться тут."
                      : "Перші реальні публікації зʼявляться тут автоматично."}
                  </span>
                </div>
              )}
            </div>
          </section>

          <PulseVideoRail
            title="Зараз набирає"
            subtitle="Відео, які оживають прямо зараз"
            type="trending"
            videos={
              trendingVideos
            }
            variant="mixed"
            onOpenVideo={
              openVideo
            }
            onViewAll={() =>
              onNavigate?.(
                "clips"
              )
            }
          />

          <PulseVideoRail
            title="Поруч із тобою"
            subtitle="Те, що відбувається навколо тебе"
            type="nearby"
            videos={
              nearbyVideos
            }
            variant="clip"
            onOpenVideo={
              openVideo
            }
            onViewAll={() =>
              onNavigate?.(
                "clips"
              )
            }
          />

          <PulseWave
            onOpenVideo={
              openVideo
            }
            onContinue={
              continueWave
            }
          />

          <PulseVideoRail
            title="Дивляться друзі"
            subtitle="Живі моменти твоїх людей"
            type="friends"
            videos={
              friendVideos
            }
            variant="wide"
            people={
              friendsWatching
            }
            peopleCount={
              12
            }
            onOpenVideo={
              openVideo
            }
            onViewAll={() =>
              setActiveTab(
                "friends"
              )
            }
          />

          <PulseVideoRail
            title="Твоє місто"
            subtitle="Київ прямо зараз"
            type="city"
            videos={
              cityVideos
            }
            variant="mixed"
            onOpenVideo={
              openVideo
            }
            onViewAll={() =>
              onNavigate?.(
                "cityPulse",
                {
                  cityId:
                    "kyiv",
                }
              )
            }
          />

          <PulseVideoRail
            title="Нові автори"
            subtitle="Нові голоси міст України"
            type="authors"
            videos={
              authorVideos
            }
            variant="clip"
            onOpenVideo={
              openVideo
            }
            onViewAll={() =>
              onNavigate?.(
                "clips"
              )
            }
          />
        </div>

        <PulseRightRail
          onNavigate={
            onNavigate
          }
        />
        </div>
      </div>
    </>
  );
}