import {
  ArrowLeft,
  Camera,
  Film,
  MapPin,
  Radio,
  Sparkles,
  Upload,
  Waves,
  Zap,
} from "lucide-react";

const typeConfig = {
  clip: {
    icon: Film,
    title: "Новий Clip",
    description:
      "Коротке вертикальне відео.",
  },

  video: {
    icon: Camera,
    title: "Нове відео",
    description:
      "Відео, влог або повна історія.",
  },

  live: {
    icon: Radio,
    title: "Новий LIVE",
    description:
      "Прямий ефір у ЯТУТ PULSE.",
  },

  moment: {
    icon: Zap,
    title: "PULSE Момент",
    description:
      "Покажи, що відбувається тут і зараз.",
  },

  wave: {
    icon: Waves,
    title: "Продовжити хвилю",
    description:
      "Додай свою частину до спільної історії.",
  },
};

export default function CreateMediaPage({
  type = "video",
  onNavigate,
}) {
  const config =
    typeConfig[
      type
    ] ||
    typeConfig.video;

  const Icon =
    config.icon;

  return (
    <div className="yatut-media-create">
      <header className="yatut-media-create__header">
        <button
          type="button"
          onClick={() =>
            onNavigate?.(
              "create"
            )
          }
        >
          <ArrowLeft
            size={18}
          />

          Створити
        </button>

        <div>
          <span>
            <Icon
              size={20}
            />
          </span>

          <div>
            <small>
              ЯТУТ PULSE
            </small>

            <h1>
              {
                config.title
              }
            </h1>

            <p>
              {
                config.description
              }
            </p>
          </div>
        </div>
      </header>

      <section className="yatut-media-create__workspace">
        <div className="yatut-media-create__preview">
          <div className="yatut-media-create__preview-icon">
            <Upload
              size={30}
            />
          </div>

          <strong>
            Тут буде твоє відео
          </strong>

          <p>
            Завантаження файлів
            поки не підключаємо.
            Сам екран створення
            вже готовий для
            наступної фази.
          </p>

          <button
            type="button"
            disabled
          >
            Обрати відео
          </button>
        </div>

        <aside className="yatut-media-create__settings">
          <div className="yatut-media-field">
            <label>
              Назва
            </label>

            <input
              type="text"
              placeholder="Назва відео"
            />
          </div>

          <div className="yatut-media-field">
            <label>
              Опис
            </label>

            <textarea
              rows={4}
              placeholder="Розкажи про це відео..."
            />
          </div>

          <div className="yatut-media-field">
            <label>
              Локація
            </label>

            <button
              type="button"
              className="yatut-media-location"
              disabled
              title="Локацію для відео підключимо разом із публікацією"
            >
              <MapPin
                size={17}
              />

              Додати місце
            </button>
          </div>

          <div className="yatut-media-options">
            <button
              type="button"
              disabled
              title="Вибір аудиторії підключимо разом із публікацією"
            >
              <Sparkles
                size={17}
              />

              Для тебе
            </button>

            <button
              type="button"
              disabled
              title="Режим Поруч підключимо разом із публікацією"
            >
              <MapPin
                size={17}
              />

              Поруч
            </button>
          </div>

          <button
            type="button"
            className="yatut-media-publish"
            disabled
          >
            Опублікувати
          </button>

          <small className="yatut-media-create__note">
            Публікацію підключимо,
            коли почнемо backend
            і реальне зберігання
            відео.
          </small>
        </aside>
      </section>
    </div>
  );
}