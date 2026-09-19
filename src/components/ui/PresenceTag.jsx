import "./ui.css";

const PRESENCE_TYPES = {
  online: {
    label: "Онлайн",
    icon: "●",
  },

  nearby: {
    label: "Поруч",
    icon: "●",
  },

  event: {
    label: "Зараз у події",
    icon: "●",
  },

  here: {
    label: "Я тут",
    icon: "●",
  },
};

function PresenceTag({
  type = "online",
  label = null,
  compact = false,
  animated = true,
  className = "",
}) {
  const data =
    PRESENCE_TYPES[type] ||
    PRESENCE_TYPES.online;

  const classes = [
    "yat-presence-tag",
    `presence-${type}`,
    compact
      ? "is-compact"
      : "",
    animated
      ? "is-animated"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <span
        className="yat-presence-tag-dot"
        aria-hidden="true"
      />

      <span>
        {label ||
          data.label}
      </span>
    </span>
  );
}

export default PresenceTag;