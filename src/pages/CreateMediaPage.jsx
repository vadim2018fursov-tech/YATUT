import {
  useEffect,
  useRef,
  useState,
} from "react";

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

import {
  captureNativeVideo,
  isNativeMediaPicker,
  pickNativeMedia,
  revokeMediaPreview,
} from "../services/mediaPickerService";

import {
  uploadPulseMedia,
} from "../services/storageService";

import {
  createPulseMedia,
} from "../services/pulseBackendService";

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

const MAX_VIDEO_SIZE =
  100 *
  1024 *
  1024;

function readVideoDuration(
  file
) {
  return new Promise(
    (
      resolve
    ) => {
      if (!file) {
        resolve(null);
        return;
      }

      const url =
        URL.createObjectURL(
          file
        );

      const video =
        document.createElement(
          "video"
        );

      const finish = (
        value
      ) => {
        URL.revokeObjectURL(
          url
        );

        video.removeAttribute(
          "src"
        );

        resolve(
          value
        );
      };

      video.preload =
        "metadata";

      video.onloadedmetadata =
        () =>
          finish(
            Number.isFinite(
              video.duration
            )
              ? Math.round(
                  video.duration
                )
              : null
          );

      video.onerror =
        () =>
          finish(
            null
          );

      video.src =
        url;
    }
  );
}

export default function CreateMediaPage({
  type = "video",
  onNavigate,
  authSession = null,
}) {
  const config =
    typeConfig[
      type
    ] ||
    typeConfig.video;

  const Icon =
    config.icon;

  const fileInputRef =
    useRef(null);

  const [
    mediaFile,
    setMediaFile,
  ] = useState(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    locationName,
    setLocationName,
  ] = useState("");

  const [
    visibility,
    setVisibility,
  ] = useState(
    "public"
  );

  const [
    durationSeconds,
    setDurationSeconds,
  ] = useState(null);

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const nativeMediaAvailable =
    isNativeMediaPicker();

  const liveMode =
    type ===
    "live";

  useEffect(
    () => () => {
      if (
        previewUrl.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    },
    [
      previewUrl,
    ]
  );

  async function selectVideoFile(
    file,
    {
      duration = null,
    } = {}
  ) {
    if (!file) {
      return;
    }

    if (
      !String(
        file.type ||
        ""
      ).startsWith(
        "video/"
      )
    ) {
      setError(
        "Для PULSE оберіть відеофайл."
      );
      return;
    }

    if (
      file.size >
      MAX_VIDEO_SIZE
    ) {
      setError(
        "Відео має бути до 100 МБ."
      );
      return;
    }

    if (
      previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const nextPreview =
      URL.createObjectURL(
        file
      );

    setMediaFile(
      file
    );

    setPreviewUrl(
      nextPreview
    );

    setError("");

    const measuredDuration =
      duration ||
      await readVideoDuration(
        file
      );

    setDurationSeconds(
      measuredDuration ||
      null
    );
  }

  async function chooseVideo() {
    if (
      nativeMediaAvailable
    ) {
      try {
        const selected =
          await pickNativeMedia(
            "video"
          );

        if (!selected) {
          return;
        }

        await selectVideoFile(
          selected.file,
          {
            duration:
              selected.duration,
          }
        );

        revokeMediaPreview(
          selected.previewUrl
        );
      } catch (
        nextError
      ) {
        setError(
          nextError?.message ||
          "Не вдалося відкрити медіатеку."
        );
      }

      return;
    }

    fileInputRef.current
      ?.click();
  }

  async function recordVideo() {
    if (
      !nativeMediaAvailable
    ) {
      fileInputRef.current
        ?.click();

      return;
    }

    try {
      const selected =
        await captureNativeVideo();

      if (!selected) {
        return;
      }

      await selectVideoFile(
        selected.file,
        {
          duration:
            selected.duration,
        }
      );

      revokeMediaPreview(
        selected.previewUrl
      );
    } catch (
      nextError
    ) {
      setError(
        nextError?.message ||
        "Не вдалося записати відео."
      );
    }
  }

  function removeVideo() {
    if (
      previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setPreviewUrl("");
    setMediaFile(null);
    setDurationSeconds(null);
    setError("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  async function publish() {
    if (
      publishing ||
      liveMode ||
      !mediaFile
    ) {
      return;
    }

    if (
      !authSession?.user?.id
    ) {
      setError(
        "Потрібно увійти в акаунт."
      );
      return;
    }

    setPublishing(
      true
    );
    setError("");

    try {
      const uploaded =
        await uploadPulseMedia(
          authSession,
          mediaFile,
          type
        );

      if (
        !uploaded?.url ||
        !uploaded?.path
      ) {
        throw new Error(
          "Не вдалося завантажити відео."
        );
      }

      const created =
        await createPulseMedia(
          authSession,
          {
            kind:
              type,
            title:
              title.trim() ||
              config.title,
            description:
              description.trim(),
            mediaUrl:
              uploaded.url,
            mediaPath:
              uploaded.path,
            mimeType:
              uploaded.mimeType ||
              mediaFile.type,
            durationSeconds,
            locationName:
              locationName.trim() ||
              null,
            visibility,
          }
        );

      if (!created) {
        throw new Error(
          "PULSE не повернув створене відео."
        );
      }

      removeVideo();

      if (
        created.type ===
        "clip"
      ) {
        onNavigate?.(
          "clips",
          {
            videoId:
              created.id,
          }
        );
      } else {
        onNavigate?.(
          "watch",
          {
            videoId:
              created.id,
          }
        );
      }
    } catch (
      nextError
    ) {
      console.error(
        "PULSE PUBLISH ERROR:",
        nextError
      );

      setError(
        nextError?.message ||
        "Не вдалося опублікувати відео."
      );
    } finally {
      setPublishing(
        false
      );
    }
  }

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
        <div
          className={
            `yatut-media-create__preview ${
              previewUrl
                ? "has-media"
                : ""
            }`
          }
        >
          {previewUrl ? (
            <>
              <video
                src={
                  previewUrl
                }
                controls
                playsInline
                preload="metadata"
              />

              <div className="yatut-media-create__preview-actions">
                <button
                  type="button"
                  onClick={
                    chooseVideo
                  }
                >
                  <Upload
                    size={17}
                  />

                  Замінити
                </button>

                {nativeMediaAvailable && (
                  <button
                    type="button"
                    onClick={
                      recordVideo
                    }
                  >
                    <Camera
                      size={17}
                    />

                    Зняти нове
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    removeVideo
                  }
                >
                  Видалити
                </button>
              </div>
            </>
          ) : liveMode ? (
            <>
              <div className="yatut-media-create__preview-icon">
                <Radio
                  size={30}
                />
              </div>

              <strong>
                LIVE вже готуємо
              </strong>

              <p>
                Завантаження відео вже працює.
                Для LIVE потрібен окремий
                streaming-сервер, тому не
                підміняємо ефір звичайним файлом.
              </p>
            </>
          ) : (
            <>
              <div className="yatut-media-create__preview-icon">
                <Upload
                  size={30}
                />
              </div>

              <strong>
                Додай відео у PULSE
              </strong>

              <p>
                Галерея працює на всіх
                пристроях. У застосунку
                можна одразу записати
                відео камерою.
              </p>

              <div className="yatut-media-create__source-actions">
                <button
                  type="button"
                  onClick={
                    chooseVideo
                  }
                >
                  <Upload
                    size={18}
                  />

                  Обрати відео
                </button>

                {nativeMediaAvailable && (
                  <button
                    type="button"
                    onClick={
                      recordVideo
                    }
                  >
                    <Camera
                      size={18}
                    />

                    Записати
                  </button>
                )}
              </div>
            </>
          )}

          <input
            ref={
              fileInputRef
            }
            type="file"
            accept="video/*"
            hidden
            onChange={(
              event
            ) =>
              selectVideoFile(
                event.target
                  .files?.[0]
              )
            }
          />
        </div>

        <aside className="yatut-media-create__settings">
          <div className="yatut-media-field">
            <label>
              Назва
            </label>

            <input
              type="text"
              value={
                title
              }
              maxLength={120}
              placeholder="Назва відео"
              disabled={
                liveMode
              }
              onChange={(
                event
              ) =>
                setTitle(
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="yatut-media-field">
            <label>
              Опис
            </label>

            <textarea
              rows={4}
              value={
                description
              }
              maxLength={1200}
              placeholder="Розкажи про це відео..."
              disabled={
                liveMode
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event.target
                    .value
                )
              }
            />
          </div>

          <div className="yatut-media-field">
            <label>
              Локація
            </label>

            <div className="yatut-media-location yatut-media-location--input">
              <MapPin
                size={17}
              />

              <input
                type="text"
                value={
                  locationName
                }
                maxLength={100}
                placeholder="Місто або місце"
                disabled={
                  liveMode
                }
                onChange={(
                  event
                ) =>
                  setLocationName(
                    event.target
                      .value
                  )
                }
              />
            </div>
          </div>

          <div className="yatut-media-field">
            <label>
              Аудиторія
            </label>

            <select
              className="yatut-media-visibility"
              value={
                visibility
              }
              disabled={
                liveMode
              }
              onChange={(
                event
              ) =>
                setVisibility(
                  event.target
                    .value
                )
              }
            >
              <option value="public">
                Для всіх
              </option>

              <option value="friends">
                Друзі
              </option>

              <option value="private">
                Лише я
              </option>
            </select>
          </div>

          <div className="yatut-media-options">
            <button
              type="button"
              className={
                visibility ===
                "public"
                  ? "is-active"
                  : ""
              }
              disabled={
                liveMode
              }
              onClick={() =>
                setVisibility(
                  "public"
                )
              }
            >
              <Sparkles
                size={17}
              />

              Для тебе
            </button>

            <button
              type="button"
              className={
                locationName.trim()
                  ? "is-active"
                  : ""
              }
              disabled={
                liveMode
              }
              onClick={() =>
                document
                  .querySelector(
                    ".yatut-media-location--input input"
                  )
                  ?.focus()
              }
            >
              <MapPin
                size={17}
              />

              Поруч
            </button>
          </div>

          {error && (
            <div className="yatut-media-create__error">
              {
                error
              }
            </div>
          )}

          <button
            type="button"
            className="yatut-media-publish"
            disabled={
              liveMode ||
              publishing ||
              !mediaFile
            }
            onClick={
              publish
            }
          >
            {liveMode
              ? "LIVE — наступний модуль"
              : publishing
              ? "Публікуємо…"
              : "Опублікувати"}
          </button>

          <small className="yatut-media-create__note">
            {liveMode
              ? "Для LIVE підключимо окрему інфраструктуру трансляцій."
              : "Відео зберігається у Supabase Storage і одразу з’являється у PULSE."}
          </small>
        </aside>
      </section>
    </div>
  );
}
