import {
  useState,
} from "react";

import "../styles/auth.css";

import {
  isAuthBackendConfigured,
  signInWithOAuth,
  signInWithPassword,
  signUp,
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
      "login"
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
        "register"
      ) {
        const result =
          await signUp({
            email:
              form.email.trim(),
            password:
              form.password,
            fullName:
              form.fullName.trim(),
            username:
              form.username
                .trim()
                .replace(
                  /^@/,
                  ""
                ),
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
            : "Створити акаунт"}
        </h1>

        <p className="auth-lead">
          {mode ===
          "login"
            ? "Увійдіть, щоб продовжити у ЯТУТ."
            : "Ваш профіль, друзі, чати та PULSE будуть привʼязані до одного акаунта."}
        </p>

        {!configured && (
          <div className="auth-setup">
            Backend ще не підключений до цього deployment.
            Поточний прототип ЯТУТ продовжує працювати без авторизації,
            а після додавання Supabase environment variables цей екран
            стане реальною точкою входу.
          </div>
        )}

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
                  required
                />
              </label>
            </>
          )}

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

          <button
            className="auth-primary"
            type="submit"
            disabled={
              busy ||
              !configured
            }
          >
            {busy
              ? "Зачекайте…"
              : mode ===
                "login"
              ? "Увійти"
              : "Створити акаунт"}
          </button>
        </form>

        <div className="auth-divider">
          або
        </div>

        <div className="auth-socials">
          <button
            className="auth-social"
            type="button"
            disabled={
              busy ||
              !configured
            }
            onClick={() =>
              socialLogin(
                "google"
              )
            }
          >
            Google
          </button>

          <button
            className="auth-social"
            type="button"
            disabled={
              busy ||
              !configured
            }
            onClick={() =>
              socialLogin(
                "facebook"
              )
            }
          >
            Facebook
          </button>
        </div>

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
