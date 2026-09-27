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
  loadPulseMedia,
} from "../services/pulseBackendService";

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

  useEffect(() => {
    let active =
      true;

    let refreshTimer =
      null;

    const refresh =
      async () => {
        try {
          const videos =
            await loadPulseMedia(
              authSession,
              {
                limit:
                  40,
              }
            );

          if (
            active
          ) {
            setBackendVideos(
              videos
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
        const preferred =
          activeTab ===
          "forYou"
            ? [
                ...backendVideos,
                ...(pulseRecommendations.forYou || []),
              ]
            : pulseRecommendations[
                activeTab
              ];

        const fallback = [
          ...backendVideos,
          ...(pulseRecommendations.forYou || []),
        ];

        return ensureVideos(
          preferred,
          fallback,
          5
        );
      },
      [
        activeTab,
        backendVideos,
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
    ensureVideos(
      backendVideos,
      [
        ...(pulseRecommendations.forYou || []),
        ...(pulseRecommendations.live || []),
      ],
      5
    );

  const nearbyVideos =
    ensureVideos(
      [
        ...backendVideos.filter(
          (video) =>
            video.location?.name &&
            video.location.name !==
              "Україна"
        ),
        ...(pulseRecommendations.nearby || []),
      ],
      [
        ...backendVideos,
        ...(pulseRecommendations.forYou || []),
      ],
      5
    );

  const friendVideos =
    ensureVideos(
      pulseRecommendations.friends,
      pulseRecommendations.forYou,
      5
    );

  const cityVideos =
    ensureVideos(
      [
        ...backendVideos.filter(
          (video) =>
            video.location?.name &&
            video.location.name !==
              "Україна"
        ),
        ...(pulseRecommendations.city || []),
      ],
      [
        ...backendVideos,
        ...(pulseRecommendations.forYou || []),
      ],
      5
    );

  const authorVideos =
    ensureVideos(
      [
        ...backendVideos,
        ...(pulseRecommendations.following || []),
      ],
      pulseRecommendations.forYou,
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
              {activeVideos.map(
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