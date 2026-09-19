import {
  CalendarDays,
  Home,
  Plus,
  Radio,
  UserRound,
} from "lucide-react";

export default function PulseMobileNav({
  onNavigate,
}) {
  return (
    <nav
      className="pulse-mobile-nav"
      aria-label="Мобільна навігація"
    >
      <button
        type="button"
        onClick={() =>
          onNavigate?.(
            "home"
          )
        }
      >
        <Home
          size={20}
        />

        <span>
          Головна
        </span>
      </button>

      <button
        type="button"
        className="is-active"
        onClick={() =>
          onNavigate?.(
            "pulse"
          )
        }
      >
        <Radio
          size={21}
        />

        <span>
          Пульс
        </span>
      </button>

      <button
        type="button"
        className="pulse-mobile-nav__create"
        aria-label="Створити"
        onClick={() =>
          onNavigate?.(
            "create"
          )
        }
      >
        <span>
          <Plus
            size={24}
            strokeWidth={2.6}
          />
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          onNavigate?.(
            "events"
          )
        }
      >
        <CalendarDays
          size={20}
        />

        <span>
          Події
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          onNavigate?.(
            "profile"
          )
        }
      >
        <UserRound
          size={20}
        />

        <span>
          Профіль
        </span>
      </button>
    </nav>
  );
}