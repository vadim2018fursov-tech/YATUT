import {
  Home,
  Sparkles,
  MapPin,
  CalendarDays,
  Users,
  UserRound,
  Briefcase,
  MessageCircle,
  Bookmark,
  Trophy,
  Settings,
  Plus,
  Activity,
} from "lucide-react";

const navItems = [
  {
    key: "home",
    label: "Головна",
    icon: Home,
  },

  {
    key: "now",
    label: "Зараз",
    icon: Sparkles,
  },

  {
    key: "pulse",
    label: "PULSE",
    icon: Activity,
  },

  {
    key: "nearby",
    label: "Поруч",
    icon: MapPin,
  },

  {
    key: "events",
    label: "Події",
    icon: CalendarDays,
  },

  {
    key: "communities",
    label: "Спільноти",
    icon: Users,
  },

  {
    key: "friends",
    label: "Друзі",
    icon: UserRound,
  },

  {
    key: "business",
    label: "Бізнес",
    icon: Briefcase,
  },

  {
    key: "chats",
    label: "Повідомлення",
    icon: MessageCircle,
    badge: 3,
  },

  {
    key: "saved",
    label: "Збережене",
    icon: Bookmark,
  },

  {
    key: "achievements",
    label: "Досягнення",
    icon: Trophy,
  },

  {
    key: "settings",
    label: "Налаштування",
    icon: Settings,
  },
];

function SidebarContent({
  activePage,
  onNavigate,
}) {
  return (
    <>
      <nav className="yat-sidebar__nav">
        {navItems.map((item) => {
          const Icon =
            item.icon;

          const isActive =
            activePage ===
            item.key;

          return (
            <button
              key={item.key}
              type="button"
              className={`yat-sidebar__link ${
                isActive
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                onNavigate?.(
                  item.key
                )
              }
            >
              <span className="yat-sidebar__link-icon">
                <Icon
                  size={21}
                  strokeWidth={2.1}
                />
              </span>

              <span className="yat-sidebar__link-label">
                {item.label}
              </span>

              {item.badge ? (
                <span className="yat-sidebar__link-badge">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="yat-sidebar__divider" />

      <button
        type="button"
        className="yat-sidebar__create"
        onClick={() =>
          onNavigate?.(
            "home"
          )
        }
      >
        <Plus
          size={20}
          strokeWidth={2.2}
        />

        <span>
          Створити допис
        </span>
      </button>
    </>
  );
}

export default function LeftSidebar({
  activePage = "home",
  onNavigate,
  embedded = false,
}) {
  if (embedded) {
    return (
      <div className="yat-sidebar yat-sidebar--embedded">
        <div className="yat-sidebar__inner">
          <SidebarContent
            activePage={
              activePage
            }
            onNavigate={
              onNavigate
            }
          />
        </div>
      </div>
    );
  }

  return (
    <aside className="yat-sidebar">
      <div className="yat-sidebar__inner">
        <SidebarContent
          activePage={
            activePage
          }
          onNavigate={
            onNavigate
          }
        />
      </div>
    </aside>
  );
}