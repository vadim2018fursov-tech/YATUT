import {
  useEffect,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";

import {
  applyAdminUserSanction,
  liftAdminUserSanction,
  loadAdminUserSanctions,
} from "../services/accountAccessService";

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "uk-UA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function AdminUserSanctionsModal({
  authSession,
  user,
  onClose,
  onChanged,
}) {
  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sanctionType,
    setSanctionType,
  ] = useState("warning");

  const [
    durationHours,
    setDurationHours,
  ] = useState(24);

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  async function refresh() {
    try {
      setLoading(true);

      const rows =
        await loadAdminUserSanctions(
          authSession,
          user.id
        );

      setHistory(rows);
    } catch (
      error
    ) {
      console.warn(
        "ADMIN SANCTIONS LOAD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [
    user.id,
    authSession?.access_token,
  ]);

  async function apply() {
    if (
      reason.trim().length <
        3 ||
      busy
    ) {
      return;
    }

    try {
      setBusy(true);

      await applyAdminUserSanction(
        authSession,
        {
          targetUserId:
            user.id,
          sanctionType,
          reason:
            reason.trim(),
          durationHours:
            sanctionType ===
            "temporary_block"
              ? Number(
                  durationHours
                )
              : null,
        }
      );

      setReason("");

      await refresh();

      await onChanged?.();
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося застосувати санкцію."
      );
    } finally {
      setBusy(false);
    }
  }

  async function lift(
    sanction
  ) {
    if (
      busy
    ) {
      return;
    }

    const note =
      window.prompt(
        "Причина зняття обмеження (необов’язково):",
        ""
      );

    if (
      note === null
    ) {
      return;
    }

    try {
      setBusy(true);

      await liftAdminUserSanction(
        authSession,
        sanction.id,
        note
      );

      await refresh();

      await onChanged?.();
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося зняти санкцію."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="admin-sanctions-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="admin-sanctions-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header>
          <div>
            <span>
              USER CONTROL
            </span>

            <h2>
              Санкції · {
                user.name
              }
            </h2>

            <p>
              @{user.username}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <div className="admin-sanctions-create">
          <label>
            <span>
              Тип
            </span>

            <select
              value={
                sanctionType
              }
              onChange={(
                event
              ) =>
                setSanctionType(
                  event.target.value
                )
              }
            >
              <option value="warning">
                Попередження
              </option>
              <option value="temporary_block">
                Тимчасове блокування
              </option>
              <option value="permanent_block">
                Постійне блокування
              </option>
            </select>
          </label>

          {sanctionType ===
            "temporary_block" && (
            <label>
              <span>
                Термін
              </span>

              <select
                value={
                  durationHours
                }
                onChange={(
                  event
                ) =>
                  setDurationHours(
                    Number(
                      event.target.value
                    )
                  )
                }
              >
                <option value={1}>
                  1 година
                </option>
                <option value={24}>
                  24 години
                </option>
                <option value={72}>
                  3 дні
                </option>
                <option value={168}>
                  7 днів
                </option>
                <option value={720}>
                  30 днів
                </option>
              </select>
            </label>
          )}

          <label className="admin-sanctions-reason">
            <span>
              Причина *
            </span>

            <textarea
              value={
                reason
              }
              maxLength={1500}
              onChange={(
                event
              ) =>
                setReason(
                  event.target.value
                )
              }
              placeholder="Що сталося і чому застосовується санкція?"
            />
          </label>

          <button
            type="button"
            className="admin-sanctions-submit"
            disabled={
              reason.trim().length <
                3 ||
              busy
            }
            onClick={
              apply
            }
          >
            {busy
              ? "Застосовуємо..."
              : sanctionType ===
                "warning"
              ? "Надіслати попередження"
              : "Застосувати блокування"}
          </button>
        </div>

        <section className="admin-sanctions-history">
          <header>
            <div>
              <span>
                ІСТОРІЯ
              </span>

              <h3>
                Санкції користувача
              </h3>
            </div>

            <strong>
              {history.length}
            </strong>
          </header>

          {loading ? (
            <p className="admin-empty">
              Завантажуємо історію...
            </p>
          ) : history.length ? (
            <div>
              {history.map(
                (
                  item
                ) => (
                  <article
                    key={
                      item.id
                    }
                    className={`admin-sanction-row is-${item.type}`}
                  >
                    <div className="admin-sanction-row__icon">
                      <YatutIcon
                        name={
                          item.type ===
                            "warning"
                            ? "bell"
                            : "profile"
                        }
                        size={17}
                      />
                    </div>

                    <div>
                      <header>
                        <strong>
                          {item.type ===
                            "warning"
                            ? "Попередження"
                            : item.type ===
                              "temporary_block"
                            ? "Тимчасове блокування"
                            : "Постійне блокування"}
                        </strong>

                        <span className={item.active ? "active" : ""}>
                          {item.active
                            ? "Активна"
                            : "Завершена"}
                        </span>
                      </header>

                      <p>
                        {
                          item.reason
                        }
                      </p>

                      <small>
                        {
                          item.createdBy
                        } · {
                          formatDate(
                            item.createdAt
                          )
                        }
                      </small>

                      {item.expiresAt && (
                        <small>
                          До: {
                            formatDate(
                              item.expiresAt
                            )
                          }
                        </small>
                      )}

                      {item.liftNote && (
                        <blockquote>
                          {
                            item.liftNote
                          }
                        </blockquote>
                      )}
                    </div>

                    {item.active && (
                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          lift(
                            item
                          )
                        }
                      >
                        Зняти
                      </button>
                    )}
                  </article>
                )
              )}
            </div>
          ) : (
            <p className="admin-empty">
              Санкцій ще не було.
            </p>
          )}
        </section>
      </section>
    </div>
  );
}
