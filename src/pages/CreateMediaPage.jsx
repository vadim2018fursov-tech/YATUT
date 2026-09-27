import {
  useEffect,
  useMemo,
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
  deleteStorageObject,
  uploadPulseMedia,
  uploadPulseThumbnail,
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
    defaultTitle:
      "Новий Clip",
  },

  video: {
    icon: Camera,
    title: "Нове відео",
    description:
      "Відео, влог або повна історія.",
    defaultTitle:
      "Нове відео",
  },

  live: {
    icon: Radio,
    title: "Новий LIVE",
    description:
      "Прямий ефір у ЯТУТ PULSE.",
    defaultTitle:
      "LIVE",
  },

  moment: {
    icon: Zap,
    title: "PULSE Момент",
    description:
      "Покажи, що відбувається тут і зараз.",
    defaultTitle:
      "PULSE Момент",
  },

  wave: {
    icon: Waves,
    title: "Продовжити хвилю",
    description:
      "Додай свою частину до спільної історії.",
    defaultTitle:
      "Хвиля PULSE",
  },
};

function createVideoMetadata(
  source
) {
  return new Promise(
    (
      resolve
    ) => {
      const video =
        document.createElement(
          "video"
        );

      video.preload =
        "metadata";
      video.muted =
        true;
      video.playsInline =
        true;
      video.src =
        source;

      const finish =
        (
          value = {}
        ) => {
          video.removeAttribute(
            "src"
          );
          video.load();

          resolve(
            value
          );
        };

      video.onloadedmetadata =
        () => {
          finish({
            duration:
              Number.isFinite(
                video.duration
              )
                ? video.duration
                : null,
            width:
              video.videoWidth ||
              null,
            height:
              video.videoHeight ||
              null,
          });
        };

      video.onerror =
        () =>
          finish({
            duration:
              null,
            width:
              null,
            height:
              null,
          });
    }
  );
}

function createVideoThumbnail(
  source
) {
  return new Promise(
    (
      resolve
    ) => {
      const video =
        document.createElement(
          "video"
        );

      video.preload =
        "auto";
      video.muted =
        true;
      video.playsInline =
        true;
      video.crossOrigin =
        "anonymous";
      video.src =
        source;

      let settled =
        false;

      const finish =
        (
          file = null
        ) => {
          if (
            settled
          ) {
            return;
          }

          settled =
            true;

          video.removeAttribute(
            "src"
          );
          video.load();

          resolve(
            file
          );
        };

      video.onerror =
        () =>
          finish(
            null
          );

      video.onloadeddata =
        () => {
          try {
            const width =
              video.videoWidth ||
              720;

            const height =
              video.videoHeight ||
              1280;

            const scale =
              Math.min(
                1,
                1280 /
                  Math.max(
                    width,
                    height
                  )
              );

            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width =
              Math.max(
                1,
                Math.round(
                  width *
                    scale
                )
              );

            canvas.height =
              Math.max(
                1,
                Math.round(
                  height *
                    scale
                )
              );

            const context =
              canvas.getContext(
                "2d"
              );

            context?.drawImage(
              video,
              0,
              0,
              canvas.width,
              canvas.height
            );

            canvas.toBlob(
              (
                blob
              ) => {
                if (!blob) {
                  finish(
                    null
                  );

                  return;
                }

                finish(
                  new File(
                    [
                      blob,
                    ],
                    `pulse-cover-${Date.now()}.jpg`,
                    {
                      type:
                        "image/jpeg",
                    }
                  )
                );
              },
              "image/jpeg",
              0.86
            );
          } catch {
            finish(
              null
            );
          }
        };
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

  const nativeMediaAvailable =
    isNativeMediaPicker();

  const [
    file,
    setFile,
  ] =
    useState(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState("");

  const [
    durationSeconds,
    setDurationSeconds,
  ] =
    useState(null);

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    locationName,
    setLocationName,
  ] =
    useState("");

  const [
    visibility,
    setVisibility,
  ] =
    useState(
      "public"
    );

  const [
    publishing,
    setPublishing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const isLive =
    type ===
    "live";

  const effectiveTitle =
    title.trim() ||
    config.defaultTitle;

  const canPublish =
    Boolean(
      authSession?.user?.id &&
      file &&
      !publishing &&
      !isLive
    );

  useEffect(
    () => {
      return () => {
        revokeMediaPreview(
          previewUrl
        );
      };
    },
    [
      previewUrl,
    ]
  );

  const mediaShape =
    useMemo(
      () => {
        if (!file) {
          return "";
        }

        const name =
          String(
            file.name ||
            ""
          );

        return [
          name,
          file.type,
        ]
          .filter(
            Boolean
          )
          .join(
            " · "
          );
      },
      [
        file,
      ]
    );

  async function applyFile(
    nextFile,
    preferredDuration =
      null
  ) {
    if (!nextFile) {
      return;
    }

    if (
      !String(
        nextFile.type ||
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
      nextFile.size >
      100 *
        1024 *
        1024
    ) {
      setError(
        "Відео має бути до 100 МБ."
      );

      return;
    }

    setError("");
    setSuccess("");

    revokeMediaPreview(
      previewUrl
    );

    const nextPreview =
      URL.createObjectURL(
        nextFile
      );

    setFile(
      nextFile
    );

    setPreviewUrl(
      nextPreview
    );

    if (
      preferredDuration
    ) {
      setDurationSeconds(
        Number(
          preferredDuration
        ) ||
        null
      );
    }

    const metadata =
      await createVideoMetadata(
        nextPreview
      );

    if (
      metadata.duration
    ) {
      setDurationSeconds(
        metadata.duration
      );
    }
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

        await applyFile(
          selected.file,
          selected.duration
        );

        revokeMediaPreview(
          selected.previewUrl
        );
      } catch (
        pickerError
      ) {
        setError(
          pickerError?.message ||
          "Не вдалося відкрити медіатеку."
        );
      }

      return;
    }

    fileInputRef.current
      ?.click();
  }

  async function recordVideo() {
    try {
      const selected =
        await captureNativeVideo();

      if (!selected) {
        return;
      }

      await applyFile(
        selected.file,
        selected.duration
      );

      revokeMediaPreview(
        selected.previewUrl
      );
    } catch (
      cameraError
    ) {
      setError(
        cameraError?.message ||
        "Не вдалося відкрити камеру."
      );
    }
  }

  function clearVideo() {
    revokeMediaPreview(
      previewUrl
    );

    setFile(
      null
    );

    setPreviewUrl(
      ""
    );

    setDurationSeconds(
      null
    );

    setSuccess(
      ""
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  async function publish() {
    if (
      !canPublish
    ) {
      return;
    }

    let uploaded =
      null;

    let thumbnail =
      null;

    let created =
      null;

    try {
      setPublishing(
        true
      );

      setError(
        ""
      );

      setSuccess(
        "Завантажуємо відео…"
      );

      uploaded =
        await uploadPulseMedia(
          authSession,
          file,
          type
        );

      try {
        const thumbnailFile =
          await createVideoThumbnail(
            previewUrl
          );

        if (
          thumbnailFile
        ) {
          thumbnail =
            await uploadPulseThumbnail(
              authSession,
              thumbnailFile,
              type
            );
        }
      } catch (
        thumbnailError
      ) {
        console.warn(
          "PULSE THUMBNAIL ERROR:",
          thumbnailError
        );
      }

      setSuccess(
        "Публікуємо у PULSE…"
      );

      created =
        await createPulseMedia(
          authSession,
          {
            kind:
              type,
            title:
              effectiveTitle,
            description:
              description.trim(),
            mediaUrl:
              uploaded?.url,
            mediaPath:
              uploaded?.path,
            thumbnailUrl:
              thumbnail?.url ||
              null,
            thumbnailPath:
              thumbnail?.path ||
              null,
            mimeType:
              uploaded?.mimeType ||
              file.type,
            durationSeconds:
              durationSeconds,
            locationName:
              locationName.trim() ||
              null,
            visibility,
          }
        );

      if (!created) {
        throw new Error(
          "Не вдалося створити публікацію PULSE."
        );
      }

      setSuccess(
        "Опубліковано ✓"
      );

      window.setTimeout(
        () => {
          onNavigate?.(
            created.type ===
              "clip"
              ? "clips"
              : "watch",
            {
              videoId:
                created.id,
            }
          );
        },
        320
      );
    } catch (
      publishError
    ) {
      console.warn(
        "PULSE PUBLISH ERROR:",
        publishError
      );

      if (
        !created
      ) {
        const cleanup =
          [
            thumbnail?.path,
            uploaded?.path,
          ]
            .filter(
              Boolean
            )
            .map(
              (
                path
              ) =>
                deleteStorageObject(
                  authSession,
                  "post-media",
                  path
                ).catch(
                  (
                    cleanupError
                  ) => {
                    console.warn(
                      "PULSE STORAGE ROLLBACK ERROR:",
                      cleanupError
                    );
                  }
                )
            );

        if (
          cleanup.length
        ) {
          await Promise.all(
            cleanup
          );
        }
      }

      setSuccess(
        ""
      );

      setError(
        publishError?.message ||
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
          className={`yatut-media-create__preview ${
            previewUrl
              ? "has-media"
              : ""
          }`.trim()}
        >
          {isLive ? (
            <div className="yatut-media-create__live-note">
              <Radio
                size={34}
              />

              <strong>
                LIVE буде окремим модулем
              </strong>

              <p>
                Для прямого ефіру потрібен окремий live pipeline.
                Звичайні відео, Clips, Моменти та Хвилі вже
                публікуються у справжній PULSE.
              </p>
            </div>
          ) : previewUrl ? (
            <>
              <video
                className="yatut-media-create__video"
                src={
                  previewUrl
                }
                controls
                playsInline
                preload="metadata"
              />

              <div className="yatut-media-create__media-actions">
                <button
                  type="button"
                  onClick={
                    chooseVideo
                  }
                >
                  Замінити
                </button>

                <button
                  type="button"
                  onClick={
                    clearVideo
                  }
                >
                  Прибрати
                </button>
              </div>

              <small className="yatut-media-create__file-meta">
                {
                  mediaShape
                }
              </small>
            </>
          ) : (
            <>
              <div className="yatut-media-create__preview-icon">
                <Upload
                  size={30}
                />
              </div>

              <strong>
                Додай відео
              </strong>

              <p>
                Обери ролик з медіатеки або запиши його прямо
                в ЯТУТ. Після публікації він зʼявиться у PULSE.
              </p>

              <div className="yatut-media-create__source-actions">
                <button
                  type="button"
                  onClick={
                    chooseVideo
                  }
                >
                  <Upload
                    size={16}
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
                      size={16}
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
            hidden
            type="file"
            accept="video/*"
            onChange={(
              event
            ) =>
              applyFile(
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
              onChange={(
                event
              ) =>
                setTitle(
                  event.target
                    .value
                )
              }
              placeholder={
                config.defaultTitle
              }
              maxLength={
                140
              }
              disabled={
                isLive
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
              onChange={(
                event
              ) =>
                setDescription(
                  event.target
                    .value
                )
              }
              placeholder="Розкажи про це відео..."
              maxLength={
                3000
              }
              disabled={
                isLive
              }
            />
          </div>

          <div className="yatut-media-field">
            <label>
              Локація
            </label>

            <div className="yatut-media-location-input">
              <MapPin
                size={17}
              />

              <input
                value={
                  locationName
                }
                onChange={(
                  event
                ) =>
                  setLocationName(
                    event.target
                      .value
                  )
                }
                placeholder="Наприклад: Київ, Поділ"
                maxLength={
                  120
                }
                disabled={
                  isLive
                }
              />
            </div>
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
                isLive
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

              Для всіх
            </button>

            <button
              type="button"
              className={
                visibility ===
                "friends"
                  ? "is-active"
                  : ""
              }
              disabled={
                isLive
              }
              onClick={() =>
                setVisibility(
                  "friends"
                )
              }
            >
              <MapPin
                size={17}
              />

              Друзі
            </button>
          </div>

          {error && (
            <div className="yatut-media-create__status is-error">
              {
                error
              }
            </div>
          )}

          {success && (
            <div className="yatut-media-create__status is-success">
              {
                success
              }
            </div>
          )}

          <button
            type="button"
            className="yatut-media-publish"
            disabled={
              !canPublish
            }
            onClick={
              publish
            }
          >
            {publishing
              ? "Публікуємо…"
              : isLive
              ? "LIVE — наступний модуль"
              : "Опублікувати"}
          </button>

          <small className="yatut-media-create__note">
            {authSession?.user?.id
              ? file
                ? "Файл буде збережено в Supabase Storage, а публікація — у PULSE."
                : "Оберіть відео, щоб продовжити."
              : "Увійдіть в акаунт, щоб публікувати у PULSE."}
          </small>
        </aside>
      </section>
    </div>
  );
}
