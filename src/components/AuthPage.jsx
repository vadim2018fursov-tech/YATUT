import {
  useEffect,
  useState,
} from "react";

import "../styles/auth.css";

import {
  checkUsernameAvailable,
  getAuthCapabilities,
  isAuthBackendConfigured,
  isValidUsername,
  normalizeUsername,
  requestPasswordReset,
  signInWithOAuth,
  signInWithPassword,
  signUp,
  updatePassword,
} from "../services/authService";

export default function AuthPage({
  onAuthenticated,
}) {
  const configured =
    isAuthBackendConfigured();

  const [
    mode,
    setMode,
  ] =
    useState(
      () =>
        window.location.pathname ===
        "/auth/reset"
          ? "reset"
          : "login"
    );

  const [
    form,
    setForm,
  ] =
    useState({
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    providers,
    setProviders,
  ] =
    useState({
      email: true,
      google: false,
      facebook: false,
    });

  const [
    usernameStatus,
    setUsernameStatus,
  ] =
    useState({
      state: "idle",
      text: "",
    });

  useEffect(() => {
    let active =
      true;

    getAuthCapabilities()
      .then(
        (capabilities) => {
          if (
            active
          ) {
            setProviders(
              capabilities
            );
          }
        }
      );

    return () => {
      active =
        false;
    };
  }, []);

  /* =======================================================
     USERNAME AVAILABILITY
  ======================================================= */

  useEffect(() => {
    if (
      mode !== "register"
    ) {
      setUsernameStatus({
        state: "idle",
        text: "",
      });

      return undefined;
    }

    const username =
      normalizeUsername(
        form.username
      );

    if (!username) {
      setUsernameStatus({
        state: "idle",
        text: "",
      });

      return undefined;
    }

    if (
      !isValidUsername(
        username
      )
    ) {
      setUsernameStatus({
        state: "invalid",
        text:
          "3–30 символів: латинські літери, цифри, крапка або _.",
      });

      return undefined;
    }

    let active =
      true;

    setUsernameStatus({
      state: "checking",
      text:
        "Перевіряємо username…",
    });

    const timer =
      window.setTimeout(
        async () => {
          try {
            const available =
              await checkUsernameAvailable(
                username
              );

            if (!active) {
              return;
            }

            setUsernameStatus({
              state:
                available
                  ? "available"
                  : "taken",
              text:
                available
                  ? "@" + username + " вільний"
                  : "@" + username + " вже зайнятий",
            });
          } catch (
            error
          ) {
            if (!active) {
              return;
            }

            console.warn(
              "USERNAME AVAILABILITY ERROR:",
              error
            );

            setUsernameStatus({
              state: "idle",
              text: "",
            });
          }
        },
        320
      );

    return () => {
      active =
        false;

      window.clearTimeout(
        timer
      );
    };
  }, [
    mode,
    form.username,
  ]);

  function patch(
    key,
    value
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [key]:
          value,
      })
    );
  }

  async function submit(
    event
  ) {
    event.preventDefault();

    if (
      !configured ||
      busy
    ) {
      return;
    }

    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (
        mode ===
        "forgot"
      ) {
        await requestPasswordReset(
          form.email.trim()
        );

        setMessage(
          "Ми надіслали лист для відновлення пароля. Перевірте пошту та відкрийте посилання з листа."
        );

        return;
      }

      if (
        mode ===
        "reset"
      ) {
        if (
          form.password.length <
          8
        ) {
          throw new Error(
            "Пароль має містити щонайменше 8 символів."
          );
        }

        if (
          form.password !==
          form.confirmPassword
        ) {
          throw new Error(
            "Паролі не співпадають."
          );
        }

        const session =
          await updatePassword(
            form.password
          );

        onAuthenticated?.(
          session
        );

        return;
      }

      if (
        mode ===
        "register"
      ) {
        const username =
          normalizeUsername(
            form.username
          );

        if (
          !isValidUsername(
            username
          )
        ) {
          throw new Error(
            "Username має містити 3–30 символів: латинські літери, цифри, крапка або _."
          );
        }

        const available =
          await checkUsernameAvailable(
            username
          );

        if (!available) {
          throw new Error(
            "Цей username вже зайнятий."
          );
        }

        const result =
          await signUp({
            email:
              form.email.trim(),
            password:
              form.password,
            fullName:
              form.fullName.trim(),
            username,
          });

        if (
          result.session
        ) {
          onAuthenticated?.(
            result.session
          );

          return;
        }

        setMessage(
          "Акаунт створено. Перевірте пошту та підтвердьте email, після чого увійдіть."
        );

        setMode(
          "login"
        );

        return;
      }

      const session =
        await signInWithPassword({
          email:
            form.email.trim(),
          password:
            form.password,
        });

      onAuthenticated?.(
        session
      );
    } catch (
      submitError
    ) {
      setError(
        submitError?.message ||
        "Не вдалося виконати вхід."
      );
    } finally {
      setBusy(
        false
      );
    }
  }

  function socialLogin(
    provider
  ) {
    if (
      !configured ||
      busy
    ) {
      return;
    }

    try {
      setError("");
      signInWithOAuth(
        provider
      );
    } catch (
      socialError
    ) {
      setError(
        socialError?.message ||
        "Не вдалося відкрити авторизацію."
      );
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            Я
          </div>

          <div>
            <strong>
              ЯТУТ
            </strong>

            <span>
              Твоя мережа. Твої люди.
            </span>
          </div>
        </div>

        <h1>
          {mode ===
          "login"
            ? "З поверненням"
            : mode ===
              "register"
            ? "Створити акаунт"
            : mode ===
              "forgot"
            ? "Відновити пароль"
            : "Новий пароль"}
        </h1>

        <p className="auth-lead">
          {mode ===
          "login"
            ? "Увійдіть, щоб продовжити у ЯТУТ."
            : mode ===
              "register"
            ? "Ваш профіль, друзі, чати та PULSE будуть привʼязані до одного акаунта."
            : mode ===
              "forgot"
            ? "Вкажіть email акаунта. Ми надішлемо посилання для зміни пароля."
            : "Введіть новий пароль для вашого акаунта ЯТУТ."}
        </p>

        {!configured && (
          <div className="auth-setup">
            Backend ще не підключений до цього deployment.
            Поточний прототип ЯТУТ продовжує працювати без авторизації,
            а після додавання Supabase environment variables цей екран
            стане реальною точкою входу.
          </div>
        )}

        {(mode === "login" ||
          mode === "register") && (
          <div className="auth-tabs">
          <button
            type="button"
            className={
              mode ===
              "login"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode(
                "login"
              );
              setError("");
              setMessage("");
            }}
          >
            Увійти
          </button>

          <button
            type="button"
            className={
              mode ===
              "register"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode(
                "register"
              );
              setError("");
              setMessage("");
            }}
          >
            Реєстрація
          </button>
        </div>
        )}

        {(mode === "forgot" ||
          mode === "reset") && (
          <button
            className="auth-back-link"
            type="button"
            onClick={() => {
              setMode(
                "login"
              );
              setError("");
              setMessage("");
              window.history.replaceState(
                {},
                "",
                "/auth"
              );
            }}
          >
            ← Повернутися до входу
          </button>
        )}

        <form
          className="auth-form"
          onSubmit={
            submit
          }
        >
          {mode ===
            "register" && (
            <>
              <label className="auth-field">
                <span>
                  Імʼя та прізвище
                </span>

                <input
                  value={
                    form.fullName
                  }
                  onChange={(
                    event
                  ) =>
                    patch(
                      "fullName",
                      event.target.value
                    )
                  }
                  autoComplete="name"
                  required
                />
              </label>

              <label className="auth-field">
                <span>
                  Username
                </span>

                <input
                  value={
                    form.username
                  }
                  onChange={(
                    event
                  ) =>
                    patch(
                      "username",
                      event.target.value
                    )
                  }
                  placeholder="@username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  minLength={3}
                  maxLength={31}
                  spellCheck={false}
                  required
                  aria-describedby="auth-username-status"
                />

                <small
                  id="auth-username-status"
                  className={
                    "auth-username-status " +
                    usernameStatus.state
                  }
                >
                  {
                    usernameStatus.text ||
                    "Латиниця, цифри, крапка або _"
                  }
                </small>
              </label>
            </>
          )}

          {mode !==
            "reset" && (
            <label className="auth-field">
            <span>
              Email
            </span>

            <input
              type="email"
              value={
                form.email
              }
              onChange={(
                event
              ) =>
                patch(
                  "email",
                  event.target.value
                )
              }
              autoComplete="email"
              inputMode="email"
              required
            />
          </label>
          )}

          {mode !==
            "forgot" && (
            <label className="auth-field">
            <span>
              Пароль
            </span>

            <input
              type="password"
              value={
                form.password
              }
              onChange={(
                event
              ) =>
                patch(
                  "password",
                  event.target.value
                )
              }
              autoComplete={
                mode ===
                "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={8}
              required
            />
          </label>
          )}

          {mode ===
            "login" && (
            <button
              className="auth-forgot-link"
              type="button"
              onClick={() => {
                setMode(
                  "forgot"
                );
                setError("");
                setMessage("");
              }}
            >
              Забули пароль?
            </button>
          )}

          {mode ===
            "reset" && (
            <label className="auth-field">
              <span>
                Повторіть пароль
              </span>

              <input
                type="password"
                value={
                  form.confirmPassword
                }
                onChange={(
                  event
                ) =>
                  patch(
                    "confirmPassword",
                    event.target.value
                  )
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          <button
            className="auth-primary"
            type="submit"
            disabled={
              busy ||
              !configured ||
              (
                mode ===
                  "register" &&
                [
                  "invalid",
                  "checking",
                  "taken",
                ].includes(
                  usernameStatus.state
                )
              )
            }
          >
            {busy
              ? "Зачекайте…"
              : mode ===
                "login"
              ? "Увійти"
              : mode ===
                "register"
              ? "Створити акаунт"
              : mode ===
                "forgot"
              ? "Надіслати посилання"
              : "Зберегти новий пароль"}
          </button>
        </form>

        {(mode ===
          "login" ||
          mode ===
            "register") && (
          <>
            <div className="auth-divider">
              або
            </div>

            <div className="auth-socials">
          <button
            className="auth-social"
            type="button"
            disabled={
              busy ||
              !configured ||
              !providers.google
            }
            onClick={() =>
              socialLogin(
                "google"
              )
            }
          >
            {providers.google
              ? "Google"
              : "Google · скоро"}
          </button>

          <button
            className="auth-social"
            type="button"
            disabled={
              busy ||
              !configured ||
              !providers.facebook
            }
            onClick={() =>
              socialLogin(
                "facebook"
              )
            }
          >
            {providers.facebook
              ? "Facebook"
              : "Facebook · скоро"}
          </button>
            </div>
          </>
        )}

        {configured &&
          (mode === "login" ||
            mode === "register") &&
          !providers.google &&
          !providers.facebook && (
          <div className="auth-message">
            Email-вхід уже активний. Google та Facebook
            увімкнуться тут автоматично після додавання
            OAuth-провайдерів у Supabase.
          </div>
        )}

        {message && (
          <div className="auth-message">
            {
              message
            }
          </div>
        )}

        {error && (
          <div className="auth-message error">
            {
              error
            }
          </div>
        )}

        <p className="auth-legal">
          Продовжуючи, ви погоджуєтесь із правилами ЯТУТ
          та політикою конфіденційності.
        </p>
      </section>
    </main>
  );
}
