import {
  Activity,
  ArrowRight,
  Eye,
  MapPin,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";

import {
  useMemo,
} from "react";

import Nearby from "../components/Nearby";
import PulseVideoCard from "../components/pulse/PulseVideoCard";

import {
  pulseRecommendations,
} from "../data/pulseMockData";

export default function NearbyPulsePage({
  onNavigate,
}) {
  const nearbyVideos =
    useMemo(
      () => {
        const primary =
          Array.isArray(
            pulseRecommendations.nearby
          )
            ? pulseRecommendations.nearby
            : [];

        const fallback =
          Array.isArray(
            pulseRecommendations.forYou
          )
            ? pulseRecommendations.forYou
            : [];

        const merged = [
          ...primary,
          ...fallback.filter(
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
          4
        );
      },
      []
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

  return (
    <div className="nearby-pulse-page">
      {/* =================================================
          LIVE HERO
      ================================================= */}

      <section className="nearby-pulse-hero">
        <div className="nearby-pulse-hero__glow" />

        <div className="nearby-pulse-hero__copy">
          <span className="nearby-pulse-hero__badge">
            <Activity
              size={15}
            />

            ЯТУТ PULSE
          </span>

          <h1>
            Що відбувається
            поруч прямо зараз
          </h1>

          <p>
            Люди, живі відео,
            місця та події
            навколо тебе —
            в одному пульсі.
          </p>

          <div className="nearby-pulse-hero__actions">
            <button
              type="button"
              className="nearby-pulse-hero__primary"
              onClick={() =>
                onNavigate?.(
                  "pulse"
                )
              }
            >
              <Radio
                size={17}
              />

              Відкрити PULSE
            </button>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "live"
                )
              }
            >
              LIVE поруч

              <ArrowRight
                size={16}
              />
            </button>
          </div>
        </div>

        <div className="nearby-pulse-hero__signal">
          <div className="nearby-pulse-hero__rings">
            <span />
            <span />
            <span />

            <i>
              <MapPin
                size={26}
              />
            </i>
          </div>

          <strong>
            Київ
          </strong>

          <small>
            активний зараз
          </small>
        </div>
      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="nearby-pulse-stats">
        <article>
          <span>
            <Users
              size={19}
            />
          </span>

          <div>
            <strong>
              428
            </strong>

            <small>
              людей поруч
            </small>
          </div>
        </article>

        <article>
          <span>
            <Sparkles
              size={19}
            />
          </span>

          <div>
            <strong>
              12
            </strong>

            <small>
              друзів поруч
            </small>
          </div>
        </article>

        <article>
          <span>
            <Eye
              size={19}
            />
          </span>

          <div>
            <strong>
              8
            </strong>

            <small>
              відео за годину
            </small>
          </div>
        </article>

        <article>
          <span>
            <Radio
              size={19}
            />
          </span>

          <div>
            <strong>
              3
            </strong>

            <small>
              LIVE зараз
            </small>
          </div>
        </article>
      </section>

      {/* =================================================
          LIVE NEARBY VIDEOS
      ================================================= */}

      <section className="nearby-pulse-videos">
        <header>
          <div>
            <span>
              <Activity
                size={18}
              />
            </span>

            <div>
              <strong>
                Зараз поруч
              </strong>

              <small>
                Живі моменти
                навколо тебе
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
            Усі

            <ArrowRight
              size={15}
            />
          </button>
        </header>

        <div className="nearby-pulse-videos__grid">
          {nearbyVideos.map(
            (
              video,
              index
            ) => (
              <PulseVideoCard
                key={
                  video.id
                }
                video={
                  video
                }
                variant={
                  index === 0
                    ? "feature"
                    : video.type ===
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
      </section>

      {/* =================================================
          CONNECTION
      ================================================= */}

      <section className="nearby-pulse-bridge">
        <div>
          <span>
            <MapPin
              size={20}
            />
          </span>

          <div>
            <small>
              ЯТУТ ПОРУЧ
            </small>

            <strong>
              Не просто карта.
              Живе місце.
            </strong>

            <p>
              Далі — люди,
              заклади, активності
              та твій звичайний
              розділ «Поруч».
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
          PULSE Києва

          <ArrowRight
            size={15}
          />
        </button>
      </section>

      {/* =================================================
          EXISTING NEARBY
          НЕ ПЕРЕПИСЫВАЕМ
      ================================================= */}

      <section className="nearby-pulse-existing">
        <Nearby
          onNavigate={
            onNavigate
          }
        />
      </section>
    </div>
  );
}