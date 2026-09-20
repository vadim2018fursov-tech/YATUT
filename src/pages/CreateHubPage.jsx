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
    eyebrow: "КОРОТКЕ ВІДЕО",
    title: "Clip",
    description: "Швидке вертикальне відео.",
    color: "purple",
  },
  {
    id: "video",
    icon: Video,
    eyebrow: "ВІДЕО / ВЛОГ",
    title: "Відео",
    description: "Історія, огляд або повноцінний влог.",
    color: "blue",
  },
  {
    id: "live",
    icon: Radio,
    eyebrow: "ПРЯМИЙ ЕФІР",
    title: "LIVE",
    description: "Покажи, що відбувається просто зараз.",
    color: "pink",
  },
  {
    id: "event",
    icon: CalendarDays,
    eyebrow: "ЗУСТРІЧІ ТА АКТИВНОСТІ",
    title: "Подія",
    description: "Збери людей офлайн або онлайн.",
    color: "green",
  },
  {
    id: "moment",
    icon: Zap,
    eyebrow: "ЯТУТ PULSE",
    title: "PULSE Момент",
    description: "Короткий живий момент, привʼязаний до місця та часу.",
    color: "orange",
  },
  {
    id: "wave",
    icon: Waves,
    eyebrow: "ЯТУТ ХВИЛЯ",
    title: "Продовжити хвилю",
    description: "Додай свій момент до спільної історії міста.",
    color: "violet",
  },
  {
    id: "studio",
    icon: BarChart3,
    eyebrow: "ДЛЯ АВТОРІВ",
    title: "Creator Studio",
    description: "Статистика контенту, аудиторії та ЯТУТ PULSE.",
    color: "studio",
  },
];

const QUICK_IDS = [
  "clip",
  "video",
  "live",
  "event",
];

const PULSE_IDS = [
  "moment",
  "wave",
];

function CreateCard({
  item,
  variant = "default",
  onCreate,
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className={`yatut-create-card yatut-create-card--${item.color} yatut-create-card--${variant}`}
      onClick={() =>
        onCreate(
          item
        )
      }
      aria-label={`Створити: ${item.title}`}
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

export default function CreateHubPage({
  onNavigate,
}) {
  const quickItems =
    createItems.filter(
      (item) =>
        QUICK_IDS.includes(
          item.id
        )
    );

  const pulseItems =
    createItems.filter(
      (item) =>
        PULSE_IDS.includes(
          item.id
        )
    );

  const studioItem =
    createItems.find(
      (item) =>
        item.id ===
        "studio"
    );

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
        "events",
        {
          createEvent:
            true,
          source:
            "createHub",
        }
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
            Обери формат і поділись тим,
            що відбувається у твоєму житті
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
              Clip, відео, LIVE,
              момент, хвиля або подія.
            </p>
          </div>
        </div>
      </section>

      <section className="yatut-create-section yatut-create-section--quick">
        <header className="yatut-create-section__header">
          <div>
            <small>
              ШВИДКИЙ СТАРТ
            </small>

            <h2>
              Що створюємо?
            </h2>
          </div>

          <span>
            Обери формат
          </span>
        </header>

        <div className="yatut-create-grid yatut-create-grid--quick">
          {quickItems.map(
            (item) => (
              <CreateCard
                key={
                  item.id
                }
                item={
                  item
                }
                variant="quick"
                onCreate={
                  handleCreate
                }
              />
            )
          )}
        </div>
      </section>

      <section className="yatut-create-section yatut-create-section--pulse">
        <header className="yatut-create-section__header">
          <div>
            <small>
              ЯТУТ PULSE
            </small>

            <h2>
              Живі моменти
            </h2>
          </div>

          <span>
            Тут і зараз
          </span>
        </header>

        <div className="yatut-create-grid yatut-create-grid--pulse">
          {pulseItems.map(
            (item) => (
              <CreateCard
                key={
                  item.id
                }
                item={
                  item
                }
                variant="pulse"
                onCreate={
                  handleCreate
                }
              />
            )
          )}
        </div>
      </section>

      {studioItem && (
        <section className="yatut-create-section yatut-create-section--tools">
          <header className="yatut-create-section__header">
            <div>
              <small>
                ДЛЯ АВТОРІВ
              </small>

              <h2>
                Інструменти
              </h2>
            </div>
          </header>

          <CreateCard
            item={
              studioItem
            }
            variant="wide"
            onCreate={
              handleCreate
            }
          />
        </section>
      )}
    </div>
  );
}
