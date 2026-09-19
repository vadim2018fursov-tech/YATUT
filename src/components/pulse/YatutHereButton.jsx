import {
  MapPin,
  Sparkles,
} from "lucide-react";

export default function YatutHereButton({
  onClick,
  compact = false,
}) {
  return (
    <button
      type="button"
      className={`pulse-here-button ${
        compact
          ? "is-compact"
          : ""
      }`}
      onClick={onClick}
    >
      <span className="pulse-here-button__icon">
        <MapPin
          size={compact ? 16 : 19}
          strokeWidth={2.5}
        />
      </span>

      <span className="pulse-here-button__copy">
        <strong>
          Я ТУТ
        </strong>

        {!compact && (
          <small>
            Покажи, що ти тут зараз
          </small>
        )}
      </span>

      <Sparkles
        className="pulse-here-button__spark"
        size={compact ? 15 : 18}
      />
    </button>
  );
}