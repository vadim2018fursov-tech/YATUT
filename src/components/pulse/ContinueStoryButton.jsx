import {
  Plus,
  Sparkles,
} from "lucide-react";

export default function ContinueStoryButton({
  onClick,
  label = "Продовжити хвилю",
}) {
  return (
    <button
      type="button"
      className="pulse-continue-story-button"
      onClick={onClick}
    >
      <span className="pulse-continue-story-button__icon">
        <Plus
          size={18}
          strokeWidth={2.5}
        />
      </span>

      <span className="pulse-continue-story-button__copy">
        <strong>
          {label}
        </strong>

        <small>
          Додай своє місто до історії
        </small>
      </span>

      <Sparkles
        className="pulse-continue-story-button__spark"
        size={17}
      />
    </button>
  );
}