import {
  Eye,
  Flame,
  MapPin,
  Play,
  Radio,
  Users,
} from "lucide-react";

function formatViews(value) {
  const number =
    Number(value || 0);

  if (number >= 1000000) {
    return `${(
      number / 1000000
    ).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${Math.round(
      number / 1000
    )}K`;
  }

  return String(number);
}

export default function PulseVideoCard({
  video,
  variant = "wide",
  onOpen,
}) {
  if (!video) {
    return null;
  }

  const isVertical =
    variant === "clip";

  const isCompact =
    variant === "compact";

  return (
    <button
      type="button"
      className={`pulse-video-card pulse-video-card--${variant} ${
        video.isLive
          ? "is-live"
          : ""
      } ${
        video.isMoment
          ? "is-moment"
          : ""
      }`}
      onClick={() =>
        onOpen?.(video)
      }
    >
      <div className="pulse-video-card__media">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
        />

        <div className="pulse-video-card__shade" />

        {video.isLive && (
          <span className="pulse-video-card__live">
            <Radio
              size={11}
              strokeWidth={2.5}
            />

            LIVE
          </span>
        )}

        {video.isMoment && (
          <span className="pulse-video-card__moment">
            ЗАРАЗ
          </span>
        )}

        {video.isTrending && (
          <span className="pulse-video-card__trend">
            <Flame
              size={11}
              fill="currentColor"
            />

            У ТРЕНДІ
          </span>
        )}

        {video.duration && (
          <span className="pulse-video-card__duration">
            {video.duration}
          </span>
        )}

        <span className="pulse-video-card__play">
          <Play
            size={
              isCompact
                ? 13
                : 16
            }
            fill="currentColor"
          />
        </span>

        <div className="pulse-video-card__overlay-copy">
          <strong>
            {video.title}
          </strong>

          {!isCompact && (
            <span>
              @
              {
                video.author
                  ?.username ||
                "yatut"
              }
            </span>
          )}
        </div>
      </div>

      <div className="pulse-video-card__body">
        <div className="pulse-video-card__location">
          <MapPin
            size={13}
          />

          <span>
            {
              video.location
                ?.name ||
              "Україна"
            }
          </span>
        </div>

        <div className="pulse-video-card__stats">
          <span>
            <Eye
              size={12}
            />

            {formatViews(
              video.views
            )}
          </span>

          {video.peopleHere ? (
            <span>
              <Users
                size={12}
              />

              {
                video.peopleHere
              }{" "}
              тут
            </span>
          ) : null}
        </div>
      </div>

      {isVertical && (
        <div className="pulse-video-card__vertical-accent" />
      )}
    </button>
  );
}