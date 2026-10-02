import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileText,
  Images,
  Radio,
  Sparkles,
  Video,
} from "lucide-react";

import {
  motion,
} from "motion/react";

import {
  nativeSelectionHaptic,
} from "../services/nativeFeedbackService";

const createItems = [
  {
    id: "post",
    icon: FileText,
    eyebrow: "СТРІЧКА ЯТУТ",
    title: "Допис",
    description: "Текст, фото або відео у профіль та головну стрічку.",
    color: "blue",
  },
  {
    id: "story",
    icon: Images,
    eyebrow: "STORIES",
    title: "Історія",
    description: "Фото, відео або текст, що живе 24 години.",
    color: "pink",
  },
  {
    id: "clip",
    icon: Video,
    eyebrow: "PULSE · КОРОТКЕ",
    title: "Кліп",
    description: "Вертикальне коротке відео. Тут же можна увімкнути режим «Зараз».",
    color: "purple",
  },
  {
    id: "video",
    icon: Video,
    eyebrow: "PULSE · ДОВГЕ",
    title: "Влог",
    description: "Довге відео: історія, огляд, подорож або повноцінний випуск.",
    color: "blue",
  },
  {
    id: "live",
    icon: Radio,
    eyebrow: "PULSE · LIVE",
    title: "Прямий ефір",
    description: "Почни трансляцію наживо. Це окремий режим, а не завантаження файлу.",
    color: "violet",
  },
  {
    id: "event",
    icon: CalendarDays,
    eyebrow: "ПОРУЧ · ПОДІЯ",
    title: "Подія",
    description: "Створи зустріч або активність офлайн чи онлайн.",
    color: "green",
  },
  {
    id: "studio",
    icon: BarChart3,
    eyebrow: "ДЛЯ АВТОРІВ",
    title: "Creator Studio",
    description: "Статистика контенту, аудиторії та PULSE.",
    color: "studio",
  },
];

const QUICK_IDS = [
  "post",
  "story",
  "clip",
  "video",
  "live",
  "event",
];

function CreateCard({
  item,
  variant = "default",
  onCreate,
}) {
  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      className={`yatut-create-card yatut-create-card--${item.color} yatut-create-card--${variant}`}
      whileHover={{
        y: -3,
      }}
      whileTap={{
        scale: 0.97,
      }}
      transition={{
        type: "spring",
        stiffness: 480,
        damping: 34,
      }}
      onClick={() => {
        nativeSelectionHaptic();

        onCreate(
          item
        );
      }}
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
    </motion.button>
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
      "live"
    ) {
      onNavigate?.(
        "live",
        {
          startLive:
            true,
          source:
            "createHub",
        }
      );

      return;
    }

    if (
      item.id ===
      "post"
    ) {
      onNavigate?.(
        "createPost"
      );

      return;
    }

    if (
      item.id ===
      "story"
    ) {
      onNavigate?.(
        "createStory"
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
    <motion.div
      className="yatut-create-page"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
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
              Допис, історія, Кліп, Влог,
              LIVE або Подія — без дублювання форматів.
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
    </motion.div>
  );
}
