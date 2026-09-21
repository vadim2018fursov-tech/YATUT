import {
  useEffect,
  useState,
} from "react";

import "./FeaturePages.css";

import YatutIcon from "./YatutIcon";

/* =========================================================
   YATUT SETTINGS V1
========================================================= */

const STORAGE_KEY =
  "yatut-settings-v1";

const DEFAULT_SETTINGS = {
  language: "uk",

  appearance:
    "system",

  profileVisibility:
    "everyone",

  messages:
    "friends",

  friendRequests:
    "everyone",

  onlineVisibility:
    "friends",

  lastSeen: true,

  showCity: true,

  nearbyEnabled: true,

  notifications: {
    messages: true,
    friends: true,
    communities: true,
    events: true,
    business: false,
    email: false,
  },

  security: {
    loginAlerts: true,
    twoFactor: false,
  },
};

const SECTIONS = [
  {
    id: "general",
    title: "Основне",
    icon: "settings",
  },
  {
    id: "privacy",
    title: "Приватність",
    icon: "shield",
  },
  {
    id: "notifications",
    title: "Сповіщення",
    icon: "bell",
  },
  {
    id: "security",
    title: "Безпека",
    icon: "shield",
  },
  {
    id: "data",
    title: "Дані",
    icon: "saved",
  },
];

function loadSettings() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,

      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications ||
          {}),
      },

      security: {
        ...DEFAULT_SETTINGS.security,
        ...(parsed.security ||
          {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function Settings({
  themeMode = "light",
  onThemeChange,
}) {
  const [
    section,
    setSection,
  ] =
    useState("general");

  const [
    settings,
    setSettings,
  ] =
    useState(
      loadSettings
    );

  const [
    savedState,
    setSavedState,
  ] =
    useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          settings
        )
      );
    } catch {
      // Settings still work for the current session.
    }

    setSavedState(
      true
    );

    const timer =
      setTimeout(
        () =>
          setSavedState(
            false
          ),
        1000
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [settings]);

  useEffect(() => {
    if (
      ![
        "light",
        "dark",
        "system",
      ].includes(
        themeMode
      )
    ) {
      return;
    }

    setSettings(
      (previous) =>
        previous.appearance ===
        themeMode
          ? previous
          : {
              ...previous,
              appearance:
                themeMode,
            }
    );
  }, [
    themeMode,
  ]);

  useEffect(() => {
    function applyRoutePayload(
      payload
    ) {
      const requestedSection =
        payload?.section;

      const exists =
        SECTIONS.some(
          (item) =>
            item.id ===
            requestedSection
        );

      if (
        exists
      ) {
        setSection(
          requestedSection
        );
      }

      try {
        sessionStorage.removeItem(
          "yatut-open-route-payload"
        );
      } catch {
        // No-op.
      }
    }

    try {
      const raw =
        sessionStorage.getItem(
          "yatut-open-route-payload"
        );

      if (
        raw
      ) {
        const parsed =
          JSON.parse(
            raw
          );

        if (
          parsed?.route ===
          "settings"
        ) {
          applyRoutePayload(
            parsed.payload ||
            {}
          );
        }
      }
    } catch (
      error
    ) {
      console.warn(
        "SETTINGS ROUTE PAYLOAD ERROR:",
        error
      );
    }

    function handleRoute(
      event
    ) {
      if (
        event?.detail?.route !==
        "settings"
      ) {
        return;
      }

      applyRoutePayload(
        event.detail.payload ||
        {}
      );
    }

    window.addEventListener(
      "yatut:route-payload",
      handleRoute
    );

    return () => {
      window.removeEventListener(
        "yatut:route-payload",
        handleRoute
      );
    };
  }, []);

  function patch(
    values
  ) {
    setSettings(
      (previous) => ({
        ...previous,
        ...values,
      })
    );
  }

  function updateAppearance(
    value
  ) {
    patch({
      appearance:
        value,
    });

    onThemeChange?.(
      value
    );
  }

  function patchNotifications(
    values
  ) {
    setSettings(
      (previous) => ({
        ...previous,

        notifications: {
          ...previous.notifications,
          ...values,
        },
      })
    );
  }

  function patchSecurity(
    values
  ) {
    setSettings(
      (previous) => ({
        ...previous,

        security: {
          ...previous.security,
          ...values,
        },
      })
    );
  }

  function exportSettings() {
    const blob =
      new Blob(
        [
          JSON.stringify(
            {
              exportedAt:
                new Date().toISOString(),

              settings,
            },
            null,
            2
          ),
        ],
        {
          type:
            "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      "yatut-settings.json";

    link.click();

    URL.revokeObjectURL(
      url
    );
  }

  function resetSettings() {
    const confirmed =
      window.confirm(
        "Повернути стандартні налаштування?"
      );

    if (!confirmed) {
      return;
    }

    setSettings(
      DEFAULT_SETTINGS
    );
  }

  return (
    <section className="feature-page">
      <header className="feature-hero settings-hero">
        <div>
          <span>
            ЯТУТ
          </span>

          <h1>
            Налаштування
          </h1>

          <p>
            Керуйте приватністю, сповіщеннями,
            безпекою та персоналізацією свого акаунта.
          </p>
        </div>

        <div className="settings-saved-state">
          {savedState && (
            <span>
              ✓ Збережено
            </span>
          )}

          <div className="feature-hero-icon">
            <YatutIcon
              name="settings"
              size={34}
            />
          </div>
        </div>
      </header>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <span>
            НАЛАШТУВАННЯ
          </span>

          {SECTIONS.map(
            (item) => (
              <button
                key={
                  item.id
                }
                className={
                  section ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSection(
                    item.id
                  )
                }
              >
                <YatutIcon
                  name={
                    item.icon
                  }
                  size={18}
                />

                <strong>
                  {
                    item.title
                  }
                </strong>

                <YatutIcon
                  name="chevronRight"
                  size={15}
                />
              </button>
            )
          )}
        </aside>

        <main className="settings-content">
          {section ===
            "general" && (
            <SettingsSection
              eyebrow="ОСНОВНЕ"
              title="Інтерфейс ЯТУТ"
              text="Мова та зовнішній вигляд."
            >
              <SettingsRow
                title="Мова"
                text="Мова інтерфейсу ЯТУТ."
              >
                <select
                  value={
                    settings.language
                  }
                  onChange={(
                    event
                  ) =>
                    patch({
                      language:
                        event
                          .target
                          .value,
                    })
                  }
                >
                  <option value="uk">
                    Українська
                  </option>

                  <option value="en">
                    English
                  </option>
                </select>
              </SettingsRow>

              <SettingsRow
                title="Оформлення"
                text="Світла, темна або системна тема."
              >
                <select
                  value={
                    settings.appearance
                  }
                  onChange={(
                    event
                  ) =>
                    updateAppearance(
                      event
                        .target
                        .value
                    )
                  }
                >
                  <option value="system">
                    Системна
                  </option>

                  <option value="light">
                    Світла
                  </option>

                  <option value="dark">
                    Темна
                  </option>
                </select>
              </SettingsRow>

              <SettingsToggle
                title="ЯТУТ Поруч"
                text="Використовувати приблизне місцезнаходження для локальних рекомендацій."
                checked={
                  settings.nearbyEnabled
                }
                onChange={(
                  value
                ) =>
                  patch({
                    nearbyEnabled:
                      value,
                  })
                }
              />

              <SettingsToggle
                title="Показувати місто"
                text="Показувати ваше місто у профілі."
                checked={
                  settings.showCity
                }
                onChange={(
                  value
                ) =>
                  patch({
                    showCity:
                      value,
                  })
                }
              />
            </SettingsSection>
          )}

          {section ===
            "privacy" && (
            <SettingsSection
              eyebrow="ПРИВАТНІСТЬ"
              title="Хто може вас бачити"
              text="Контролюйте видимість профілю та соціальних функцій."
            >
              <SettingsRow
                title="Хто бачить профіль"
                text="Видимість вашої сторінки."
              >
                <select
                  value={
                    settings.profileVisibility
                  }
                  onChange={(
                    event
                  ) =>
                    patch({
                      profileVisibility:
                        event
                          .target
                          .value,
                    })
                  }
                >
                  <option value="everyone">
                    Усі
                  </option>

                  <option value="friends">
                    Друзі
                  </option>

                  <option value="nobody">
                    Ніхто
                  </option>
                </select>
              </SettingsRow>

              <SettingsRow
                title="Повідомлення"
                text="Хто може написати вам у Messenger."
              >
                <select
                  value={
                    settings.messages
                  }
                  onChange={(
                    event
                  ) =>
                    patch({
                      messages:
                        event
                          .target
                          .value,
                    })
                  }
                >
                  <option value="everyone">
                    Усі
                  </option>

                  <option value="friends">
                    Друзі
                  </option>

                  <option value="nobody">
                    Ніхто
                  </option>
                </select>
              </SettingsRow>

              <SettingsRow
                title="Запити у друзі"
                text="Хто може надсилати вам запити."
              >
                <select
                  value={
                    settings.friendRequests
                  }
                  onChange={(
                    event
                  ) =>
                    patch({
                      friendRequests:
                        event
                          .target
                          .value,
                    })
                  }
                >
                  <option value="everyone">
                    Усі
                  </option>

                  <option value="mutual">
                    Друзі друзів
                  </option>

                  <option value="nobody">
                    Ніхто
                  </option>
                </select>
              </SettingsRow>

              <SettingsRow
                title="Статус онлайн"
                text="Хто бачить вашу активність."
              >
                <select
                  value={
                    settings.onlineVisibility
                  }
                  onChange={(
                    event
                  ) =>
                    patch({
                      onlineVisibility:
                        event
                          .target
                          .value,
                    })
                  }
                >
                  <option value="everyone">
                    Усі
                  </option>

                  <option value="friends">
                    Друзі
                  </option>

                  <option value="nobody">
                    Ніхто
                  </option>
                </select>
              </SettingsRow>

              <SettingsToggle
                title="Остання активність"
                text="Показувати час останньої активності."
                checked={
                  settings.lastSeen
                }
                onChange={(
                  value
                ) =>
                  patch({
                    lastSeen:
                      value,
                  })
                }
              />
            </SettingsSection>
          )}

          {section ===
            "notifications" && (
            <SettingsSection
              eyebrow="СПОВІЩЕННЯ"
              title="Що вам важливо"
              text="Оберіть події, про які ЯТУТ буде повідомляти."
            >
              <SettingsToggle
                title="Нові повідомлення"
                text="Чати та Messenger."
                checked={
                  settings.notifications.messages
                }
                onChange={(
                  value
                ) =>
                  patchNotifications({
                    messages:
                      value,
                  })
                }
              />

              <SettingsToggle
                title="Друзі"
                text="Запити, прийняті заявки та нові звʼязки."
                checked={
                  settings.notifications.friends
                }
                onChange={(
                  value
                ) =>
                  patchNotifications({
                    friends:
                      value,
                  })
                }
              />

              <SettingsToggle
                title="Спільноти"
                text="Новини просторів, у яких ви берете участь."
                checked={
                  settings.notifications.communities
                }
                onChange={(
                  value
                ) =>
                  patchNotifications({
                    communities:
                      value,
                  })
                }
              />

              <SettingsToggle
                title="Події"
                text="Нагадування та зміни подій."
                checked={
                  settings.notifications.events
                }
                onChange={(
                  value
                ) =>
                  patchNotifications({
                    events:
                      value,
                  })
                }
              />

              <SettingsToggle
                title="Бізнес"
                text="Акції та новини бізнес-сторінок."
                checked={
                  settings.notifications.business
                }
                onChange={(
                  value
                ) =>
                  patchNotifications({
                    business:
                      value,
                  })
                }
              />

              <SettingsToggle
                title="Email"
                text="Дублювати важливі сповіщення електронною поштою."
                checked={
                  settings.notifications.email
                }
                onChange={(
                  value
                ) =>
                  patchNotifications({
                    email:
                      value,
                  })
                }
              />
            </SettingsSection>
          )}

          {section ===
            "security" && (
            <SettingsSection
              eyebrow="БЕЗПЕКА"
              title="Захист акаунта"
              text="Додатковий контроль входу та безпеки."
            >
              <div className="settings-security-card">
                <div>
                  <YatutIcon
                    name="shield"
                    size={24}
                  />
                </div>

                <section>
                  <span>
                    СТАН ЗАХИСТУ
                  </span>

                  <strong>
                    Захист акаунта активний
                  </strong>

                  <p>
                    У локальній версії ЯТУТ ці параметри зберігаються на вашому пристрої.
                  </p>
                </section>
              </div>

              <SettingsToggle
                title="Сповіщення про вхід"
                text="Повідомляти про нові входи в акаунт."
                checked={
                  settings.security.loginAlerts
                }
                onChange={(
                  value
                ) =>
                  patchSecurity({
                    loginAlerts:
                      value,
                  })
                }
              />

              <SettingsToggle
                title="Двоетапна перевірка"
                text="Підготовка до майбутньої серверної авторизації."
                checked={
                  settings.security.twoFactor
                }
                onChange={(
                  value
                ) =>
                  patchSecurity({
                    twoFactor:
                      value,
                  })
                }
              />
            </SettingsSection>
          )}

          {section ===
            "data" && (
            <SettingsSection
              eyebrow="ВАШІ ДАНІ"
              title="Дані та сховище"
              text="Керуйте локальними параметрами ЯТУТ."
            >
              <div className="settings-data-card">
                <div>
                  <YatutIcon
                    name="saved"
                    size={25}
                  />
                </div>

                <section>
                  <strong>
                    Експорт налаштувань
                  </strong>

                  <p>
                    Завантажити копію поточних параметрів у форматі JSON.
                  </p>
                </section>

                <button
                  className="feature-secondary-button"
                  onClick={
                    exportSettings
                  }
                >
                  Експортувати
                </button>
              </div>

              <div className="settings-data-card danger">
                <div>
                  <YatutIcon
                    name="settings"
                    size={25}
                  />
                </div>

                <section>
                  <strong>
                    Скинути налаштування
                  </strong>

                  <p>
                    Повернути стандартні параметри.
                    Інші дані ЯТУТ не видаляються.
                  </p>
                </section>

                <button
                  className="feature-danger-button"
                  onClick={
                    resetSettings
                  }
                >
                  Скинути
                </button>
              </div>
            </SettingsSection>
          )}
        </main>
      </div>
    </section>
  );
}

function SettingsSection({
  eyebrow,
  title,
  text,
  children,
}) {
  return (
    <section className="settings-section">
      <header>
        <span>
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {text}
        </p>
      </header>

      <div className="settings-section-body">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  title,
  text,
  children,
}) {
  return (
    <div className="settings-row">
      <section>
        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>
      </section>

      <div className="settings-row-control">
        {children}
      </div>
    </div>
  );
}

function SettingsToggle({
  title,
  text,
  checked,
  onChange,
}) {
  return (
    <div className="settings-row">
      <section>
        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>
      </section>

      <button
        className={`yatut-switch ${
          checked
            ? "active"
            : ""
        }`}
        onClick={() =>
          onChange(
            !checked
          )
        }
        aria-pressed={
          checked
        }
      >
        <span />
      </button>
    </div>
  );
}