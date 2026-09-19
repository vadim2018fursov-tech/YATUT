import "./ui.css";

function YatCard({
  children,
  className = "",
  interactive = false,
  glass = false,
  padding = "medium",
  as: Component = "section",
  onClick,
}) {
  const classes = [
    "yat-card",
    interactive ? "yat-card-interactive" : "",
    glass ? "yat-card-glass" : "",
    `yat-card-padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

export default YatCard;