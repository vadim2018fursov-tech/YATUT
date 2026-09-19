import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Radio,
  Sparkles,
  Video,
  Waves,
  Zap,
} from "lucide-react";

const createItems = [
  {
    id: "clip",
    icon: Video,
    eyebrow:
      "КОРОТКЕ ВІДЕО",
    title: "Clip",
    description:
      "Вертикальне коротке відео для швидкого перегляду.",
    color: "purple",
  },

  {
    id: "video",
    icon: Video,
    eyebrow:
      "ВІДЕО / ВЛОГ",
    title: "Відео",
    description:
      "Повноцінне відео, історія, огляд або влог.",
    color: "blue",
  },

  {
    id: "live",
    icon: Radio,
    eyebrow:
      "ПРЯМИЙ ЕФІР",
    title: "LIVE",
    description:
      "Почни прямий ефір і покажи, що відбувається зараз.",
    color: "pink",
  },

  {
    id: "moment",
    icon: Zap,
    eyebrow:
      "ЯТУТ PULSE",
    title:
      "PULSE Момент",
    description:
      "Короткий живий момент, привʼязаний до місця та часу.",
    color: "orange",
  },

  {
    id: "wave",
    icon: Waves,
    eyebrow:
      "ЯТУТ ХВИЛЯ",
    title:
      "Продовжити хвилю",
    description:
      "Додай своє місто та свій момент до спільної історії.",
    color: "violet",
  },

  {
    id: "event",
    icon: CalendarDays,
    eyebrow:
      "ПОДІЇ",
    title:
      "Створити подію",
    description:
      "Зустріч, концерт, активність або локальна подія.",
    color: "green",
  },

  {
    id: "studio",
    icon: BarChart3,
    eyebrow:
      "ДЛЯ АВТОРІВ",
    title:
      "Creator Studio",
    description:
      "Статистика відео, аудиторії, підписників і ЯТУТ PULSE.",
    color: "studio",
  },
];

export default function CreateHubPage({
  onNavigate,
}) {
  function handleCreate(
    item
  ) {
    if (
      item.id ===
      "studio"
    ) {
      onNavigate?.(
        "creatorStudio"
      );

      return;
    }

    if (
      item.id ===
      "event"
    ) {
      onNavigate?.(
        "events"
      );

      return;
    }

    if (
      item.id ===
      "wave"
    ) {
      onNavigate?.(
        "pulse"
      );

      return;
    }

    onNavigate?.(
      "createMedia",
      {
        type:
          item.id,
      }
    );
  }

  return (
    <div className="yatut-create-page">
      <header className="yatut-create-header">
        <button
          type="button"
          className="yatut-create-back"
          onClick={() =>
            onNavigate?.(
              "home"
            )
          }
        >
          <ArrowLeft
            size={18}
          />

          Назад
        </button>

        <div className="yatut-create-title">
          <span>
            <Sparkles
              size={17}
            />

            ЯТУТ
          </span>

          <h1>
            Створити
          </h1>

          <p>
            Поділись тим,
            що відбувається
            у твоєму житті
            та навколо тебе.
          </p>
        </div>
      </header>

      <section className="yatut-create-hero">
        <div className="yatut-create-hero__glow" />

        <div>
          <span className="yatut-create-hero__icon">
            <Activity
              size={27}
            />
          </span>

          <div>
            <small>
              ЯТУТ PULSE
            </small>

            <strong>
              Твоя історія
              починається тут
            </strong>

            <p>
              Clip, влог, LIVE,
              момент або хвиля —
              обери свій формат.
            </p>
          </div>
        </div>
      </section>

      <section className="yatut-create-grid">
        {createItems.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <button
                key={
                  item.id
                }
                type="button"
                className={`yatut-create-card yatut-create-card--${item.color}`}
                onClick={() =>
                  handleCreate(
                    item
                  )
                }
              >
                <span className="yatut-create-card__icon">
                  <Icon
                    size={23}
                  />
                </span>

                <div className="yatut-create-card__copy">
                  <small>
                    {
                      item.eyebrow
                    }
                  </small>

                  <strong>
                    {
                      item.title
                    }
                  </strong>

                  <p>
                    {
                      item.description
                    }
                  </p>
                </div>

                <span className="yatut-create-card__arrow">
                  <ChevronRight
                    size={19}
                  />
                </span>
              </button>
            );
          }
        )}
      </section>
    </div>
  );
}