import YatutIcon from "./YatutIcon";

import "./AccountRestriction.css";

function formatExpiry(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toLocaleString(
    "uk-UA",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function AccountRestriction({
  state,
  busy = false,
  onAcknowledge,
  onSignOut,
}) {
  const blocked =
    state?.status ===
    "blocked";

  const warning =
    state?.warning ||
    null;

  const block =
    state?.block ||
    null;

  return (
    <main className="account-restriction">
      <section className="account-restriction-card">
        <div
          className={`account-restriction-icon ${
            blocked
              ? "is-blocked"
              : "is-warning"
          }`}
        >
          <YatutIcon
            name={
              blocked
                ? "profile"
                : "bell"
            }
            size={30}
          />
        </div>

        <span>
          ЯТУТ · ACCOUNT STATUS
        </span>

        <h1>
          {blocked
            ? "Доступ до акаунта обмежено"
            : "Попередження від ЯТУТ"}
        </h1>

        <p className="account-restriction-reason">
          {blocked
            ? block?.reason ||
              "Доступ до акаунта тимчасово обмежено."
            : warning?.reason ||
              "Адміністратор залишив попередження для цього акаунта."}
        </p>

        {blocked &&
          block?.type ===
            "temporary_block" &&
          block?.expiresAt && (
          <div className="account-restriction-expiry">
            <strong>
              Обмеження діє до
            </strong>

            <span>
              {
                formatExpiry(
                  block.expiresAt
                )
              }
            </span>
          </div>
        )}

        {blocked &&
          block?.type ===
            "permanent_block" && (
          <div className="account-restriction-expiry">
            <strong>
              Тип обмеження
            </strong>

            <span>
              Постійне
            </span>
          </div>
        )}

        <div className="account-restriction-actions">
          {!blocked &&
            warning?.id && (
            <button
              type="button"
              className="primary"
              disabled={
                busy
              }
              onClick={
                onAcknowledge
              }
            >
              {busy
                ? "Зберігаємо..."
                : "Я зрозумів"}
            </button>
          )}

          <button
            type="button"
            className="secondary"
            onClick={
              onSignOut
            }
          >
            Вийти з акаунта
          </button>
        </div>

        <small>
          Якщо ви вважаєте рішення помилковим, зверніться до підтримки ЯТУТ.
        </small>
      </section>
    </main>
  );
}
