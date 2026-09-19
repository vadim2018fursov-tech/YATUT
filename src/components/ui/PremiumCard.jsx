import "./ui.css";

function PremiumCard({
  children,
  className = "",
  glow = "purple",
  shimmer = false,
  interactive = true,
  padding = "medium",
  as: Component = "section",
  onClick,
}) {
  const classes = [
    "yat-premium-card",
    `yat-premium-glow-${glow}`,
    shimmer ? "yat-premium-shimmer" : "",
    interactive
      ? "yat-premium-interactive"
      : "",
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
      <div className="yat-premium-card-inner">
        {children}
      </div>
    </Component>
  );
}

export default PremiumCard;