import {
  MapPin,
} from "lucide-react";

import {
  formatPeopleNow,
} from "../../data/regions";

export default function PulseCityNode({
  city,
  peopleNow = 0,
  activity = 50,
  position = {
    x: 50,
    y: 50,
  },
  color = "purple",
  isTrending = false,
  onClick,
}) {
  const safeActivity =
    Math.max(
      15,
      Math.min(
        100,
        Number(
          activity || 0
        )
      )
    );

  const glowScale =
    0.82 +
    safeActivity /
      220;

  return (
    <button
      type="button"
      className={`pulse-city-node pulse-city-node--${color} ${
        isTrending
          ? "is-trending"
          : ""
      }`}
      style={{
        left:
          `${position.x}%`,
        top:
          `${position.y}%`,
        "--pulse-node-scale":
          glowScale,
        "--pulse-node-activity":
          safeActivity,
      }}
      onClick={
        onClick
      }
      aria-label={`${city}, ${formatPeopleNow(
        peopleNow
      )} людей зараз`}
    >
      <span className="pulse-city-node__glow" />

      <span className="pulse-city-node__ring" />

      <span className="pulse-city-node__dot">
        <MapPin
          size={10}
          strokeWidth={3}
        />
      </span>

      <span className="pulse-city-node__label">
        <strong>
          {city}
        </strong>

        <small>
          {formatPeopleNow(
            peopleNow
          )} зараз
        </small>
      </span>
    </button>
  );
}