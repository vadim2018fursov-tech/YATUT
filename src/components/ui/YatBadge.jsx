import {
  useState,
} from "react";

import "./ui.css";

import BadgeTooltip from "./BadgeTooltip";

const VALID_RARITIES = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythic",
];

function normalizeRarity(
  rarity
) {
  const value = String(
    rarity || "common"
  ).toLowerCase();

  return VALID_RARITIES.includes(
    value
  )
    ? value
    : "common";
}

function YatBadge({
  image,
  name,
  rarity = "common",
  size = 72,
  animated = true,
  locked = false,
  progress = null,
  description = "",
  showTooltip = true,
  className = "",
  onClick,
}) {
  const [
    tooltipOpen,
    setTooltipOpen,
  ] = useState(false);

  const safeRarity =
    normalizeRarity(
      rarity
    );

  const classes = [
    "yat-badge",
    `rarity-${safeRarity}`,
    animated
      ? "is-animated"
      : "",
    locked
      ? "is-locked"
      : "",
    onClick
      ? "is-clickable"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const safeProgress =
    typeof progress ===
    "number"
      ? Math.max(
          0,
          Math.min(
            100,
            progress
          )
        )
      : null;

  function openTooltip() {
    if (!showTooltip) {
      return;
    }

    setTooltipOpen(true);
  }

  function closeTooltip() {
    setTooltipOpen(false);
  }

  return (
    <div
      className="yat-badge-wrap"
      style={{
        "--yat-badge-size":
          `${size}px`,
      }}
      onMouseEnter={
        openTooltip
      }
      onMouseLeave={
        closeTooltip
      }
      onFocus={
        openTooltip
      }
      onBlur={
        closeTooltip
      }
    >
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={
          name || "Відзнака"
        }
      >
        <span className="yat-badge-aura" />

        <span className="yat-badge-image-shell">
          {image ? (
            <img
              src={image}
              alt={name || "Відзнака ЯТУТ"}
              loading="lazy"
              draggable="false"
            />
          ) : (
            <span className="yat-badge-placeholder">
              Я
            </span>
          )}

          {locked && (
            <span className="yat-badge-lock">
              <span>●</span>
            </span>
          )}

          {safeProgress !==
            null &&
            safeProgress <
              100 && (
              <span
                className="yat-badge-progress-ring"
                style={{
                  "--yat-badge-progress":
                    `${safeProgress * 3.6}deg`,
                }}
              />
            )}
        </span>

        <span className="yat-badge-rarity-label">
          {safeRarity}
        </span>
      </button>

      {showTooltip &&
        tooltipOpen && (
          <BadgeTooltip
            name={
              name
            }
            rarity={
              safeRarity
            }
            description={
              description
            }
            progress={
              safeProgress
            }
            locked={
              locked
            }
          />
        )}
    </div>
  );
}

export default YatBadge;