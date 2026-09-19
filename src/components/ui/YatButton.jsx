import "./ui.css";

function YatButton({
  children,
  variant = "primary",
  size = "medium",
  icon = null,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  type = "button",
  onClick,
  title,
  ariaLabel,
}) {
  const classes = [
    "yat-button",
    `yat-button-${variant}`,
    `yat-button-${size}`,
    fullWidth ? "yat-button-full" : "",
    loading ? "is-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
    >
      {loading && (
        <span
          className="yat-button-spinner"
          aria-hidden="true"
        />
      )}

      {!loading &&
        icon &&
        iconPosition === "left" && (
          <span className="yat-button-icon">
            {icon}
          </span>
        )}

      <span className="yat-button-label">
        {children}
      </span>

      {!loading &&
        icon &&
        iconPosition === "right" && (
          <span className="yat-button-icon">
            {icon}
          </span>
        )}
    </button>
  );
}

export default YatButton;