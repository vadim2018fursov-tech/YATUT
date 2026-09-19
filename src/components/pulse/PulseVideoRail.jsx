import {
  ArrowRight,
  Building2,
  Flame,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import PulsePeopleRow from "./PulsePeopleRow";
import PulseVideoCard from "./PulseVideoCard";

function RailIcon({
  type,
}) {
  switch (type) {
    case "trending":
      return (
        <Flame
          size={18}
        />
      );

    case "nearby":
      return (
        <MapPin
          size={18}
        />
      );

    case "friends":
      return (
        <Users
          size={18}
        />
      );

    case "city":
      return (
        <Building2
          size={18}
        />
      );

    default:
      return (
        <Sparkles
          size={18}
        />
      );
  }
}

export default function PulseVideoRail({
  title,
  subtitle,
  type = "default",
  videos = [],
  variant = "wide",
  people = [],
  peopleCount = null,
  onOpenVideo,
  onViewAll,
}) {
  return (
    <section className={`pulse-video-rail pulse-video-rail--${type}`}>
      <header className="pulse-video-rail__header">
        <div className="pulse-video-rail__title">
          <span className="pulse-video-rail__icon">
            <RailIcon
              type={type}
            />
          </span>

          <div>
            <strong>
              {title}
            </strong>

            {subtitle ? (
              <small>
                {subtitle}
              </small>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="pulse-video-rail__all"
          onClick={
            onViewAll
          }
        >
          <span>
            Дивитися всі
          </span>

          <ArrowRight
            size={15}
          />
        </button>
      </header>

      {type ===
        "friends" &&
      people.length ? (
        <PulsePeopleRow
          people={people}
          count={
            peopleCount
          }
          label="Друзі дивляться просто зараз"
        />
      ) : null}

      <div
        className={`pulse-video-rail__track pulse-video-rail__track--${variant}`}
      >
        {videos.map(
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
                index === 0 &&
                variant ===
                  "mixed"
                  ? "feature"
                  : variant ===
                    "mixed"
                  ? "compact"
                  : variant
              }
              onOpen={
                onOpenVideo
              }
            />
          )
        )}
      </div>
    </section>
  );
}