import {
  Bell,
  Search,
  Activity,
} from "lucide-react";

export default function PulseMobileHeader({
  onNavigate,
}) {
  return (
    <header className="pulse-mobile-header">
      <button
        type="button"
        className="pulse-mobile-header__brand"
        onClick={() =>
          onNavigate?.(
            "pulse"
          )
        }
      >
        <span className="pulse-mobile-header__logo">
          Я
        </span>

        <div>
          <strong>
            Пульс
          </strong>

          <small>
            Живе поруч з тобою
          </small>
        </div>

        <Activity
          size={17}
          strokeWidth={2.3}
        />
      </button>

      <div className="pulse-mobile-header__actions">
        <button
          type="button"
          aria-label="Пошук"
          onClick={() =>
            onNavigate?.(
              "search"
            )
          }
        >
          <Search
            size={20}
          />
        </button>

        <button
          type="button"
          aria-label="Сповіщення"
          onClick={() =>
            onNavigate?.(
              "notifications"
            )
          }
        >
          <Bell
            size={20}
          />

          <i />
        </button>
      </div>
    </header>
  );
}