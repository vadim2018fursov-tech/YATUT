import {
  useEffect,
  useMemo,
  useState,
} from "react";

import YatutIcon from "./YatutIcon";

import "../styles/device-permissions.css";

import {
  getDevicePermissionState,
  queryBrowserPermission,
  requestLocationPermission,
  requestMediaPermissions,
  requestPushPermission,
} from "../services/devicePermissionService";

function statusLabel(
  value
) {
  if (
    value ===
    "granted"
  ) {
    return "Дозволено";
  }

  if (
    value ===
    "denied"
  ) {
    return "Заборонено";
  }

  if (
    value ===
    "unsupported"
  ) {
    return "Недоступно";
  }

  if (
    value ===
    "picker"
  ) {
    return "За запитом";
  }

  return "Не налаштовано";
}

export default function DevicePermissions({
  authSession = null,
  onDone,
}) {
  const [
    states,
    setStates,
  ] =
    useState(
      () =>
        getDevicePermissionState()
    );

  const [
    busy,
    setBusy,
  ] =
    useState(null);

  const [
    message,
    setMessage,
  ] =
    useState("");

  async function refresh() {
    const base =
      getDevicePermissionState();

    const [
      camera,
      microphone,
      location,
    ] =
      await Promise.all([
        queryBrowserPermission(
          "camera"
        ),
        queryBrowserPermission(
          "microphone"
        ),
        queryBrowserPermission(
          "geolocation"
        ),
      ]);

    setStates({
      ...base,
      camera:
        base.camera ===
        "unsupported"
          ? "unsupported"
          : camera,
      microphone:
        base.microphone ===
        "unsupported"
          ? "unsupported"
          : microphone,
      location:
        base.location ===
        "unsupported"
          ? "unsupported"
          : location,
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  const rows =
    useMemo(
      () => [
        {
          id:
            "notifications",
          icon:
            "bell",
          title:
            "Сповіщення",
          text:
            "Нові події, запити у друзі та важливі оновлення ЯТУТ.",
          status:
            states.push
              ?.requiresInstall
              ? "install"
              : states.notification,
        },
        {
          id:
            "camera",
          icon:
            "camera",
          title:
            "Камера",
          text:
            "Фото, відео, сторіс та майбутні відеодзвінки.",
          status:
            states.camera,
        },
        {
          id:
            "microphone",
          icon:
            "mic",
          title:
            "Мікрофон",
          text:
            "Відео, голосові повідомлення та дзвінки.",
          status:
            states.microphone,
        },
        {
          id:
            "location",
          icon:
            "location",
          title:
            "Геолокація",
          text:
            "ЯТУТ Поруч, локальні події та рекомендації поблизу.",
          status:
            states.location,
        },
        {
          id:
            "gallery",
          icon:
            "image",
          title:
            "Фото та відео",
          text:
            "Браузер відкриє системний вибір файлів саме тоді, коли ви захочете щось завантажити.",
          status:
            "picker",
        },
      ],
      [
        states,
      ]
    );

  async function requestOne(
    id
  ) {
    if (
      busy
    ) {
      return;
    }

    setBusy(
      id
    );
    setMessage("");

    try {
      if (
        id ===
        "notifications"
      ) {
        await requestPushPermission(
          authSession
        );
      }

      if (
        id ===
        "camera" ||
        id ===
        "microphone"
      ) {
        await requestMediaPermissions();
      }

      if (
        id ===
        "location"
      ) {
        await requestLocationPermission();
      }

      if (
        id ===
        "gallery"
      ) {
        setMessage(
          "Доступ до фото та відео буде запитано системою під час вибору файлу."
        );
      }

      await refresh();
    } catch (
      error
    ) {
      setMessage(
        error?.message ||
        "Не вдалося змінити дозвіл."
      );

      await refresh();
    } finally {
      setBusy(
        null
      );
    }
  }

  async function allowRecommended() {
    if (
      busy
    ) {
      return;
    }

    setBusy(
      "all"
    );
    setMessage("");

    const errors =
      [];

    try {
      try {
        await requestPushPermission(
          authSession
        );
      } catch (
        error
      ) {
        errors.push(
          error?.message ||
            "Сповіщення"
        );
      }

      try {
        await requestMediaPermissions();
      } catch (
        error
      ) {
        errors.push(
          error?.message ||
            "Камера та мікрофон"
        );
      }

      try {
        await requestLocationPermission();
      } catch (
        error
      ) {
        errors.push(
          error?.message ||
            "Геолокація"
        );
      }

      await refresh();

      if (
        errors.length
      ) {
        setMessage(
          "Частину дозволів браузер не надав. Їх можна увімкнути окремо нижче або в налаштуваннях пристрою."
        );
      } else {
        setMessage(
          "Готово. Основні дозволи ЯТУТ налаштовані."
        );
      }
    } finally {
      setBusy(
        null
      );
    }
  }

  return (
    <main className="device-permissions-page">
      <section className="device-permissions-card">
        <header className="device-permissions-header">
          <div className="device-permissions-brand">
            <span>
              Я
            </span>

            <strong>
              ЯТУТ
            </strong>
          </div>

          <span className="device-permissions-kicker">
            ДОЗВОЛИ ПРИСТРОЮ
          </span>

          <h1>
            Налаштуємо ЯТУТ для цього пристрою
          </h1>

          <p>
            Дозволи потрібні лише для функцій, які ви використовуєте. Їх завжди можна змінити пізніше.
          </p>
        </header>

        <div className="device-permissions-list">
          {rows.map(
            (
              item
            ) => {
              const enabled =
                item.status ===
                  "granted" ||
                item.status ===
                  "picker";

              const requiresInstall =
                item.status ===
                "install";

              return (
                <article
                  className={\`device-permission-row \${enabled ? "is-enabled" : ""}\`}
                  key={
                    item.id
                  }
                >
                  <div className="device-permission-icon">
                    <YatutIcon
                      name={
                        item.icon
                      }
                      size={21}
                    />
                  </div>

                  <div className="device-permission-copy">
                    <div>
                      <strong>
                        {
                          item.title
                        }
                      </strong>

                      <span
                        className={\`device-permission-status \${enabled ? "is-enabled" : ""}\`}
                      >
                        {requiresInstall
                          ? "Потрібне встановлення"
                          : statusLabel(
                              item.status
                            )}
                      </span>
                    </div>

                    <p>
                      {
                        item.text
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      busy !==
                        null ||
                      item.status ===
                        "unsupported" ||
                      enabled ||
                      requiresInstall
                    }
                    onClick={() =>
                      requestOne(
                        item.id
                      )
                    }
                  >
                    {busy ===
                    item.id
                      ? "..."
                      : requiresInstall
                      ? "Встановіть ЯТУТ"
                      : enabled
                      ? "Готово"
                      : "Дозволити"}
                  </button>
                </article>
              );
            }
          )}
        </div>

        {states.push
          ?.requiresInstall && (
          <div className="device-permissions-note">
            На iPhone та iPad push-сповіщення вмикаються після додавання ЯТУТ на головний екран і запуску встановленої версії.
          </div>
        )}

        {message && (
          <div className="device-permissions-message">
            {
              message
            }
          </div>
        )}

        <div className="device-permissions-actions">
          <button
            type="button"
            className="device-permissions-primary"
            disabled={
              busy !==
              null
            }
            onClick={
              allowRecommended
            }
          >
            {busy ===
            "all"
              ? "Налаштовуємо…"
              : "Дозволити рекомендоване"}
          </button>

          <button
            type="button"
            className="device-permissions-secondary"
            disabled={
              busy !==
              null
            }
            onClick={
              onDone
            }
          >
            Продовжити в ЯТУТ
          </button>
        </div>

        <small>
          Повідомлення у чатах не потребують окремого дозволу. Системний дозвіл потрібен лише для push, коли ЯТУТ закритий.
        </small>
      </section>
    </main>
  );
}
