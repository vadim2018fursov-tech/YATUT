const tabs = [
  {
    id: "forYou",
    label: "Для тебе",
  },
  {
    id: "following",
    label: "Підписки",
  },
  {
    id: "nearby",
    label: "Поруч",
  },
  {
    id: "friends",
    label: "Друзі",
  },
  {
    id: "city",
    label: "Місто",
  },
  {
    id: "events",
    label: "Події",
  },
  {
    id: "live",
    label: "LIVE",
  },
];

export default function PulseTabs({
  activeTab = "forYou",
  onChange,
}) {
  return (
    <nav
      className="pulse-tabs"
      aria-label="Навігація ЯТУТ PULSE"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`pulse-tab ${
            activeTab === tab.id
              ? "is-active"
              : ""
          }`}
          onClick={() =>
            onChange?.(
              tab.id
            )
          }
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}