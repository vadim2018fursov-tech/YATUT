import "./ui.css";

function BadgeTooltip({
  name,
  rarity,
  description,
  progress = null,
  locked = false,
}) {
  return (
    <div
      className="yat-badge-tooltip"
      role="tooltip"
    >
      <div className="yat-badge-tooltip-head">
        <strong>{name}</strong>

        {rarity && (
          <span
            className={`yat-badge-tooltip-rarity rarity-${rarity}`}
          >
            {rarity}
          </span>
        )}
      </div>

      {description && (
        <p>{description}</p>
      )}

      {typeof progress === "number" && (
        <div className="yat-badge-tooltip-progress">
          <div>
            <span>Прогрес</span>

            <strong>
              {Math.max(
                0,
                Math.min(
                  100,
                  Math.round(progress)
                )
              )}
              %
            </strong>
          </div>

          <div className="yat-badge-tooltip-track">
            <span
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    progress
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {locked && (
        <span className="yat-badge-tooltip-locked">
          Відзнака ще не отримана
        </span>
      )}
    </div>
  );
}

export default BadgeTooltip;