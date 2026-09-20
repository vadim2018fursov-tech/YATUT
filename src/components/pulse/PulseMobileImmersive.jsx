import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Plus,
  Radio,
  Send,
  Users,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  pulseRecommendations,
  pulseVideos,
} from "../../data/pulseMockData";

const TABS = [
  {
    id: "forYou",
    label: "Для тебе",
  },
  {
    id: "clips",
    label: "Короткі відео",
  },
  {
    id: "vlogs",
    label: "Влоги",
  },
  {
    id: "live",
    label: "LIVE",
  },
  {
    id: "wave",
    label: "Хвиля",
  },
  {
    id: "events",
    label: "Події",
  },
];

function uniqueVideos(
  source
) {
  const result = [];

  (source || []).forEach(
    (video) => {
      if (
        !video ||
        result.some(
          (item) =>
            item.id ===
            video.id
        )
      ) {
        return;
      }

      result.push(
        video
      );
    }
  );

  return result;
}

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

function getFeed(
  tab
) {
  const all =
    uniqueVideos([
      ...(pulseRecommendations.forYou || []),
      ...(pulseRecommendations.nearby || []),
      ...(pulseRecommendations.friends || []),
      ...(pulseRecommendations.city || []),
      ...(pulseRecommendations.live || []),
      ...(pulseRecommendations.events || []),
      ...(pulseVideos || []),
    ]);

  switch (
    tab
  ) {
    case "clips":
      return all.filter(
        (video) =>
          video.type ===
          "clip"
      );

    case "vlogs":
      return all.filter(
        (video) =>
          video.type ===
          "vlog"
      );

    case "live":
      return all.filter(
        (video) =>
          video.isLive ||
          video.type ===
            "live"
      );

    case "wave":
      return uniqueVideos(
        pulseRecommendations.wave
      );

    case "events":
      return all.filter(
        (video) =>
          video.type ===
            "event" ||
          video.recommendationType ===
            "events"
      );

    default:
      return all;
  }
}

function buildStats(
  video
) {
  const views =
    Number(
      video.views || 0
    );

  const friends =
    Number(
      video.friendsNearby ||
        0
    );

  return {
    likes:
      Math.max(
        128,
        Math.round(
          views *
            0.12
        )
      ),

    comments:
      Math.max(
        18,
        friends *
          14 +
          Math.round(
            views *
              0.004
          )
      ),

    shares:
      Math.max(
        12,
        Math.round(
          views *
            0.018
        )
      ),

    saves:
      Math.max(
        8,
        Math.round(
          views *
            0.012
        )
      ),
  };
}

function PulseImmersiveSlide({
  video,
  liked,
  saved,
  following,
  onLike,
  onSave,
  onFollow,
  onShare,
  onCreate,
}) {
  const stats =
    buildStats(
      video
    );

  const author =
    video.author ||
    {};

  const isLive =
    video.isLive ||
    video.type ===
      "live";

  const location =
    video.location?.name ||
    "Україна";

  const image =
    video.thumbnail ||
    "/assets/regions/kyiv/hero.webp";

  return (
    <article className="pulse-immersive__slide">
      {video.video ? (
        <video
          className="pulse-immersive__media"
          src={
            video.video
          }
          poster={
            image
          }
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          className="pulse-immersive__media"
          src={
            image
          }
          alt=""
        />
      )}

      <div className="pulse-immersive__shade" />

      <div className="pulse-immersive__top-meta">
        {isLive ? (
          <span className="pulse-immersive__live">
            <Radio
              size={13}
            />

            LIVE
          </span>
        ) : (
          <span className="pulse-immersive__type">
            ЯТУТ PULSE
          </span>
        )}

        <button
          type="button"
          className="pulse-immersive__more"
          aria-label="Більше"
        >
          <MoreHorizontal
            size={22}
          />
        </button>
      </div>

      <aside className="pulse-immersive__actions">
        <button
          type="button"
          className="pulse-immersive__avatar-action"
          onClick={
            onFollow
          }
          aria-label={
            following
              ? "Ви підписані"
              : "Підписатися"
          }
        >
          <span className="pulse-immersive__avatar">
            {
              author.initials ||
              author.name?.[0] ||
              "Я"
            }
          </span>

          <i
            className={
              following
                ? "is-following"
                : ""
            }
          >
            {following
              ? "✓"
              : "+"}
          </i>
        </button>

        <button
          type="button"
          className={
            liked
              ? "is-active"
              : ""
          }
          onClick={
            onLike
          }
          aria-label="Подобається"
        >
          <Heart
            size={29}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

          <small>
            {formatCompact(
              stats.likes +
                (liked
                  ? 1
                  : 0)
            )}
          </small>
        </button>

        <button
          type="button"
          aria-label="Коментарі"
        >
          <MessageCircle
            size={29}
          />

          <small>
            {formatCompact(
              stats.comments
            )}
          </small>
        </button>

        <button
          type="button"
          onClick={
            onShare
          }
          aria-label="Поширити"
        >
          <Send
            size={28}
          />

          <small>
            {formatCompact(
              stats.shares
            )}
          </small>
        </button>

        <button
          type="button"
          className={
            saved
              ? "is-active"
              : ""
          }
          onClick={
            onSave
          }
          aria-label="Зберегти"
        >
          <Bookmark
            size={28}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />

          <small>
            {formatCompact(
              stats.saves +
                (saved
                  ? 1
                  : 0)
            )}
          </small>
        </button>

        <button
          type="button"
          className="pulse-immersive__sound"
          onClick={
            onCreate
          }
          aria-label="Використати звук"
        >
          <Music2
            size={20}
          />
        </button>
      </aside>

      <div className="pulse-immersive__copy">
        <button
          type="button"
          className="pulse-immersive__location"
        >
          <MapPin
            size={15}
          />

          {
            location
          }
        </button>

        <div className="pulse-immersive__author-row">
          <span className="pulse-immersive__author-avatar">
            {
              author.initials ||
              author.name?.[0] ||
              "Я"
            }
          </span>

          <div className="pulse-immersive__author-copy">
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
              {" · "}
              зараз
            </small>
          </div>

          <button
            type="button"
            className={
              following
                ? "is-following"
                : ""
            }
            onClick={
              onFollow
            }
          >
            {following
              ? "Підписані"
              : "Підписатися"}
          </button>
        </div>

        <h2>
          {
            video.title
          }
        </h2>

        <p>
          {
            video.description
          }
        </p>

        <div className="pulse-immersive__tags">
          <span>
            #ятут
          </span>

          <span>
            #pulse
          </span>

          {video.city && (
            <span>
              #{
                video.city
              }
            </span>
          )}
        </div>

        {isLive ? (
          <div className="pulse-immersive__live-info">
            <Users
              size={15}
            />

            <strong>
              {formatCompact(
                video.views
              )}
            </strong>

            <span>
              дивляться зараз
            </span>
          </div>
        ) : (
          <button
            type="button"
            className="pulse-immersive__audio"
            onClick={
              onCreate
            }
          >
            <Music2
              size={15}
            />

            <span>
              Оригінальний звук
              {" · "}
              {
                author.name ||
                "ЯТУТ"
              }
            </span>
          </button>
        )}
      </div>
    </article>
  );
}

export default function PulseMobileImmersive({
  onNavigate,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "forYou"
  );

  const [
    likedIds,
    setLikedIds,
  ] = useState(
    () =>
      new Set()
  );

  const [
    savedIds,
    setSavedIds,
  ] = useState(
    () =>
      new Set()
  );

  const [
    followingIds,
    setFollowingIds,
  ] = useState(
    () =>
      new Set()
  );

  const videos =
    useMemo(
      () =>
        getFeed(
          activeTab
        ),
      [
        activeTab,
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

  async function share(
    video
  ) {
    const url =
      `${window.location.origin}${window.location.pathname}#pulse=${encodeURIComponent(
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
          "PULSE SHARE ERROR:",
          error
        );
      }
    }
  }

  return (
    <section className="pulse-immersive-mobile">
      <nav
        className="pulse-immersive__tabs"
        aria-label="Формати PULSE"
      >
        {TABS.map(
          (
            tab
          ) => (
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

              {tab.id ===
                "live" && (
                <i />
              )}
            </button>
          )
        )}
      </nav>

      <div className="pulse-immersive__feed">
        {videos.length ? (
          videos.map(
            (
              video
            ) => (
              <PulseImmersiveSlide
                key={
                  `${activeTab}-${video.id}`
                }
                video={
                  video
                }
                liked={
                  likedIds.has(
                    video.id
                  )
                }
                saved={
                  savedIds.has(
                    video.id
                  )
                }
                following={
                  followingIds.has(
                    video.author?.id
                  )
                }
                onLike={() =>
                  toggleSet(
                    setLikedIds,
                    video.id
                  )
                }
                onSave={() =>
                  toggleSet(
                    setSavedIds,
                    video.id
                  )
                }
                onFollow={() =>
                  toggleSet(
                    setFollowingIds,
                    video.author?.id ||
                      video.id
                  )
                }
                onShare={() =>
                  share(
                    video
                  )
                }
                onCreate={() =>
                  onNavigate?.(
                    "createMedia",
                    {
                      type:
                        video.isLive
                          ? "live"
                          : "clip",
                    }
                  )
                }
              />
            )
          )
        ) : (
          <div className="pulse-immersive__empty">
            <Radio
              size={32}
            />

            <strong>
              Тут скоро буде більше
            </strong>

            <p>
              Новий контент цього формату зʼявиться у PULSE.
            </p>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "create"
                )
              }
            >
              <Plus
                size={17}
              />

              Створити
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
