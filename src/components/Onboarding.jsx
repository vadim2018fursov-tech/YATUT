import YatutIcon from "./YatutIcon";

import "../styles/onboarding.css";

export default function Onboarding({
  profile = null,
  busy = false,
  onContinue,
  onSkip,
}) {
  const name =
    profile?.name ||
    profile?.full_name ||
    "Користувач ЯТУТ";

  const username =
    profile?.username ||
    "user";

  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "Я";

  const steps = [
    {
      icon: "profile",
      title:
        "Оформи профіль",
      text:
        "Додай фото, місто та кілька слів про себе — так друзям буде легше тебе впізнати.",
    },
    {
      icon: "search",
      title:
        "Знайди своїх",
      text:
        "Шукай людей за імʼям або username, надсилай заявки та збирай своє коло.",
    },
    {
      icon: "chats",
      title:
        "Почни спілкування",
      text:
        "Після додавання в друзі відкривай особисті й групові чати з синхронізацією між пристроями.",
    },
  ];

  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <div className="onboarding-brand">
          <span className="onboarding-brand-mark">
            Я
          </span>

          <strong>
            ЯТУТ
          </strong>
        </div>

        <div className="onboarding-profile">
          <div className="onboarding-avatar">
            {profile?.avatar ? (
              <img
                src={
                  profile.avatar
                }
                alt=""
              />
            ) : (
              initial
            )}
          </div>

          <div>
            <span>
              Ласкаво просимо
            </span>

            <h1>
              {name}
            </h1>

            <p>
              @{username}
            </p>
          </div>
        </div>

        <div className="onboarding-copy">
          <span className="onboarding-kicker">
            ПЕРШІ КРОКИ
          </span>

          <h2>
            Зробімо ЯТУТ твоїм
          </h2>

          <p>
            Три прості кроки — і профіль готовий до справжнього спілкування.
          </p>
        </div>

        <div className="onboarding-steps">
          {steps.map(
            (
              step,
              index
            ) => (
              <article
                key={
                  step.title
                }
                className="onboarding-step"
              >
                <div className="onboarding-step-icon">
                  <YatutIcon
                    name={
                      step.icon
                    }
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    0{index + 1}
                  </span>

                  <strong>
                    {step.title}
                  </strong>

                  <p>
                    {step.text}
                  </p>
                </div>
              </article>
            )
          )}
        </div>

        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-primary"
            disabled={
              busy
            }
            onClick={
              onContinue
            }
          >
            {busy
              ? "Зберігаємо…"
              : "Налаштувати профіль"}
          </button>

          <button
            type="button"
            className="onboarding-secondary"
            disabled={
              busy
            }
            onClick={
              onSkip
            }
          >
            Пропустити поки що
          </button>
        </div>

        <small className="onboarding-note">
          Цей екран показується лише під час першого запуску акаунта.
        </small>
      </section>
    </main>
  );
}
