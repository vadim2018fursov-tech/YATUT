import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  motion,
} from "motion/react";

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Film,
  Globe2,
  Image as ImageIcon,
  Lock,
  MapPin,
  Play,
  Radio,
  Scissors,
  Sparkles,
  Upload,
  Users,
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

import {
  nativeLightHaptic,
  nativeMediumHaptic,
  nativeSelectionHaptic,
} from "../services/nativeFeedbackService";

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

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

function formatTime(
  value
) {
  const number =
    Number(
      value || 0
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "0:00";
  }

  const total =
    Math.max(
      0,
      Math.floor(
        number
      )
    );

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (
        total % 3600
      ) / 60
    );

  const seconds =
    total % 60;

  if (
    hours >
    0
  ) {
    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  }

  return `${minutes}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}

function formatBytes(
  value
) {
  const bytes =
    Number(
      value || 0
    );

  if (
    bytes >=
    1024 *
      1024
  ) {
    return `${(
      bytes /
      (
        1024 *
        1024
      )
    ).toFixed(
      1
    )} МБ`;
  }

  if (
    bytes >=
    1024
  ) {
    return `${Math.round(
      bytes /
      1024
    )} КБ`;
  }

  return `${bytes} Б`;
}

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
  source,
  requestedTime =
    0
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

      const capture =
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
              0.88
            );
          } catch {
            finish(
              null
            );
          }
        };

      video.onerror =
        () =>
          finish(
            null
          );

      video.onloadedmetadata =
        () => {
          const duration =
            Number.isFinite(
              video.duration
            )
              ? video.duration
              : 0;

          const maxTime =
            Math.max(
              0,
              duration -
                0.05
            );

          const safeTime =
            clamp(
              Number(
                requestedTime ||
                0
              ),
              0,
              maxTime
            );

          if (
            safeTime >
            0.01
          ) {
            video.currentTime =
              safeTime;

            return;
          }

          if (
            video.readyState >=
            2
          ) {
            capture();
          } else {
            video.onloadeddata =
              capture;
          }
        };

      video.onseeked =
        capture;
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

  const videoRef =
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
    videoWidth,
    setVideoWidth,
  ] =
    useState(null);

  const [
    videoHeight,
    setVideoHeight,
  ] =
    useState(null);

  const [
    trimStart,
    setTrimStart,
  ] =
    useState(0);

  const [
    trimEnd,
    setTrimEnd,
  ] =
    useState(null);

  const [
    previewingTrim,
    setPreviewingTrim,
  ] =
    useState(false);

  const [
    coverTime,
    setCoverTime,
  ] =
    useState(0);

  const [
    coverFile,
    setCoverFile,
  ] =
    useState(null);

  const [
    coverPreviewUrl,
    setCoverPreviewUrl,
  ] =
    useState("");

  const [
    coverBusy,
    setCoverBusy,
  ] =
    useState(false);

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
    publishProgress,
    setPublishProgress,
  ] =
    useState(0);

  const [
    publishStage,
    setPublishStage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    publishedMedia,
    setPublishedMedia,
  ] =
    useState(null);

  const isLive =
    type ===
    "live";

  const effectiveTitle =
    title.trim() ||
    config.defaultTitle;

  const safeDuration =
    Number(
      durationSeconds ||
      0
    );

  const effectiveTrimEnd =
    Number(
      trimEnd ??
      safeDuration
    );

  const selectedDuration =
    Math.max(
      0,
      effectiveTrimEnd -
        Number(
          trimStart ||
          0
        )
    );

  const canPublish =
    Boolean(
      authSession?.user?.id &&
      file &&
      !publishing &&
      !isLive &&
      selectedDuration >
        0.4
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

  useEffect(
    () => {
      return () => {
        revokeMediaPreview(
          coverPreviewUrl
        );
      };
    },
    [
      coverPreviewUrl,
    ]
  );

  const mediaShape =
    useMemo(
      () => {
        if (!file) {
          return "";
        }

        const resolution =
          videoWidth &&
          videoHeight
            ? `${videoWidth}×${videoHeight}`
            : null;

        return [
          file.name,
          formatBytes(
            file.size
          ),
          resolution,
          safeDuration
            ? formatTime(
                safeDuration
              )
            : null,
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
        videoWidth,
        videoHeight,
        safeDuration,
      ]
    );

  async function setCoverFromFrame(
    time =
      coverTime
  ) {
    if (
      !previewUrl
    ) {
      return;
    }

    setCoverBusy(
      true
    );

    try {
      const nextCover =
        await createVideoThumbnail(
          previewUrl,
          time
        );

      if (
        !nextCover
      ) {
        throw new Error(
          "Не вдалося створити обкладинку."
        );
      }

      revokeMediaPreview(
        coverPreviewUrl
      );

      setCoverFile(
        nextCover
      );

      setCoverPreviewUrl(
        URL.createObjectURL(
          nextCover
        )
      );

      setError(
        ""
      );
    } catch (
      coverError
    ) {
      setError(
        coverError?.message ||
        "Не вдалося створити обкладинку."
      );
    } finally {
      setCoverBusy(
        false
      );
    }
  }

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

    setError(
      ""
    );

    setPublishedMedia(
      null
    );

    setPublishProgress(
      0
    );

    setPublishStage(
      ""
    );

    revokeMediaPreview(
      previewUrl
    );

    revokeMediaPreview(
      coverPreviewUrl
    );

    setCoverFile(
      null
    );

    setCoverPreviewUrl(
      ""
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

    const metadata =
      await createVideoMetadata(
        nextPreview
      );

    const duration =
      Number(
        metadata.duration ||
        preferredDuration ||
        0
      );

    setDurationSeconds(
      duration ||
      null
    );

    setVideoWidth(
      metadata.width ||
      null
    );

    setVideoHeight(
      metadata.height ||
      null
    );

    setTrimStart(
      0
    );

    setTrimEnd(
      duration ||
      null
    );

    const initialCoverTime =
      duration
        ? clamp(
            duration *
              0.15,
            0,
            Math.min(
              duration,
              3
            )
          )
        : 0;

    setCoverTime(
      initialCoverTime
    );

    if (
      duration
    ) {
      const firstCover =
        await createVideoThumbnail(
          nextPreview,
          initialCoverTime
        );

      if (
        firstCover
      ) {
        setCoverFile(
          firstCover
        );

        setCoverPreviewUrl(
          URL.createObjectURL(
            firstCover
          )
        );
      }
    }
  }

  async function chooseVideo() {
    nativeSelectionHaptic();

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
    nativeSelectionHaptic();

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
    videoRef.current?.pause();

    revokeMediaPreview(
      previewUrl
    );

    revokeMediaPreview(
      coverPreviewUrl
    );

    setFile(
      null
    );

    setPreviewUrl(
      ""
    );

    setCoverFile(
      null
    );

    setCoverPreviewUrl(
      ""
    );

    setDurationSeconds(
      null
    );

    setVideoWidth(
      null
    );

    setVideoHeight(
      null
    );

    setTrimStart(
      0
    );

    setTrimEnd(
      null
    );

    setCoverTime(
      0
    );

    setPreviewingTrim(
      false
    );

    setPublishProgress(
      0
    );

    setPublishStage(
      ""
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function changeTrimStart(
    rawValue
  ) {
    if (
      !safeDuration
    ) {
      return;
    }

    const next =
      clamp(
        Number(
          rawValue
        ),
        0,
        Math.max(
          0,
          effectiveTrimEnd -
            0.5
        )
      );

    setTrimStart(
      next
    );

    if (
      videoRef.current
    ) {
      videoRef.current.currentTime =
        next;
    }
  }

  function changeTrimEnd(
    rawValue
  ) {
    if (
      !safeDuration
    ) {
      return;
    }

    const next =
      clamp(
        Number(
          rawValue
        ),
        Number(
          trimStart ||
          0
        ) +
          0.5,
        safeDuration
      );

    setTrimEnd(
      next
    );

    if (
      videoRef.current &&
      videoRef.current.currentTime >
        next
    ) {
      videoRef.current.currentTime =
        Number(
          trimStart ||
          0
        );
    }
  }

  function previewTrim() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime =
      Number(
        trimStart ||
        0
      );

    setPreviewingTrim(
      true
    );

    video
      .play()
      .catch(
        () => {
          setPreviewingTrim(
            false
          );
        }
      );
  }

  function handlePreviewTimeUpdate(
    event
  ) {
    if (
      !previewingTrim
    ) {
      return;
    }

    const video =
      event.currentTarget;

    if (
      video.currentTime >=
      effectiveTrimEnd
    ) {
      video.pause();

      video.currentTime =
        Number(
          trimStart ||
          0
        );

      setPreviewingTrim(
        false
      );
    }
  }

  function seekCover(
    rawValue
  ) {
    if (
      !safeDuration
    ) {
      return;
    }

    const next =
      clamp(
        Number(
          rawValue
        ),
        0,
        safeDuration
      );

    setCoverTime(
      next
    );

    if (
      videoRef.current
    ) {
      videoRef.current.pause();

      videoRef.current.currentTime =
        next;
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
      nativeMediumHaptic();

      setPublishing(
        true
      );

      setError(
        ""
      );

      setPublishProgress(
        2
      );

      setPublishStage(
        "Готуємо відео"
      );

      uploaded =
        await uploadPulseMedia(
          authSession,
          file,
          type,
          {
            onProgress:
              (
                progress
              ) => {
                setPublishStage(
                  "Завантажуємо відео"
                );

                setPublishProgress(
                  Math.min(
                    84,
                    Math.max(
                      3,
                      Math.round(
                        progress *
                          0.84
                      )
                    )
                  )
                );
              },
          }
        );

      setPublishProgress(
        87
      );

      setPublishStage(
        "Готуємо обкладинку"
      );

      let finalCover =
        coverFile;

      if (
        !finalCover
      ) {
        finalCover =
          await createVideoThumbnail(
            previewUrl,
            coverTime
          );
      }

      if (
        finalCover
      ) {
        thumbnail =
          await uploadPulseThumbnail(
            authSession,
            finalCover,
            type
          );
      }

      setPublishProgress(
        94
      );

      setPublishStage(
        "Публікуємо у PULSE"
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
            trimStartSeconds:
              Number(
                trimStart ||
                0
              ),
            trimEndSeconds:
              effectiveTrimEnd ||
              null,
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

      setPublishProgress(
        100
      );

      setPublishStage(
        "Опубліковано"
      );

      setPublishedMedia(
        created
      );

      nativeLightHaptic();
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

      setPublishProgress(
        0
      );

      setPublishStage(
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

  function openPublished() {
    if (
      !publishedMedia
    ) {
      return;
    }

    onNavigate?.(
      publishedMedia.type ===
        "clip"
        ? "clips"
        : "watch",
      {
        videoId:
          publishedMedia.id,
      }
    );
  }

  if (
    publishedMedia
  ) {
    return (
      <motion.section
        className="yatut-media-success"
        initial={{
          opacity: 0,
          y: 10,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
      >
        <div className="yatut-media-success__icon">
          <CheckCircle2
            size={34}
          />
        </div>

        <small>
          ЯТУТ PULSE
        </small>

        <h1>
          Опубліковано
        </h1>

        <p>
          Відео вже у PULSE та синхронізоване між пристроями.
        </p>

        <div className="yatut-media-success__card">
          <div className="yatut-media-success__cover">
            {publishedMedia.thumbnail ? (
              <img
                src={
                  publishedMedia.thumbnail
                }
                alt=""
              />
            ) : (
              <Film
                size={28}
              />
            )}
          </div>

          <div>
            <strong>
              {
                publishedMedia.title
              }
            </strong>

            <span>
              {formatTime(
                selectedDuration
              )}
              {locationName.trim()
                ? ` · ${locationName.trim()}`
                : ""}
            </span>
          </div>
        </div>

        <div className="yatut-media-success__actions">
          <button
            type="button"
            className="is-primary"
            onClick={
              openPublished
            }
          >
            <Play
              size={17}
              fill="currentColor"
            />

            Переглянути
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "pulse"
              )
            }
          >
            До PULSE
          </button>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.div
      className="yatut-media-create yatut-media-create--editor"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
    >
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
        <div className="yatut-media-editor">
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
                  Clips, відео, Моменти та Хвилі вже публікуються
                  у справжній PULSE.
                </p>
              </div>
            ) : previewUrl ? (
              <>
                <video
                  ref={
                    videoRef
                  }
                  className="yatut-media-create__video"
                  src={
                    previewUrl
                  }
                  controls
                  playsInline
                  preload="metadata"
                  onTimeUpdate={
                    handlePreviewTimeUpdate
                  }
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
                  в ЯТУТ. Перед публікацією можна вибрати фрагмент
                  і обкладинку.
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

          {previewUrl &&
            !isLive && (
              <div className="yatut-media-editor__tools">
                <section className="yatut-media-edit-card">
                  <div className="yatut-media-edit-card__title">
                    <span>
                      <Scissors
                        size={17}
                      />
                    </span>

                    <div>
                      <strong>
                        Фрагмент
                      </strong>

                      <small>
                        {formatTime(
                          selectedDuration
                        )} у публікації
                      </small>
                    </div>
                  </div>

                  <div className="yatut-media-trim">
                    <div className="yatut-media-trim__labels">
                      <span>
                        Початок
                        <strong>
                          {formatTime(
                            trimStart
                          )}
                        </strong>
                      </span>

                      <span>
                        Кінець
                        <strong>
                          {formatTime(
                            effectiveTrimEnd
                          )}
                        </strong>
                      </span>
                    </div>

                    <label>
                      <span>
                        Від
                      </span>

                      <input
                        type="range"
                        min="0"
                        max={
                          safeDuration ||
                          0
                        }
                        step="0.1"
                        value={
                          trimStart
                        }
                        onChange={(
                          event
                        ) =>
                          changeTrimStart(
                            event.target
                              .value
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        До
                      </span>

                      <input
                        type="range"
                        min="0"
                        max={
                          safeDuration ||
                          0
                        }
                        step="0.1"
                        value={
                          effectiveTrimEnd
                        }
                        onChange={(
                          event
                        ) =>
                          changeTrimEnd(
                            event.target
                              .value
                          )
                        }
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="yatut-media-preview-fragment"
                    onClick={
                      previewTrim
                    }
                  >
                    <Play
                      size={15}
                      fill="currentColor"
                    />

                    Переглянути фрагмент
                  </button>
                </section>

                <section className="yatut-media-edit-card">
                  <div className="yatut-media-edit-card__title">
                    <span>
                      <ImageIcon
                        size={17}
                      />
                    </span>

                    <div>
                      <strong>
                        Обкладинка
                      </strong>

                      <small>
                        Кадр на {formatTime(
                          coverTime
                        )}
                      </small>
                    </div>
                  </div>

                  <div className="yatut-media-cover">
                    <div className="yatut-media-cover__preview">
                      {coverPreviewUrl ? (
                        <img
                          src={
                            coverPreviewUrl
                          }
                          alt="Обкладинка PULSE"
                        />
                      ) : (
                        <ImageIcon
                          size={26}
                        />
                      )}
                    </div>

                    <div className="yatut-media-cover__controls">
                      <input
                        type="range"
                        min="0"
                        max={
                          safeDuration ||
                          0
                        }
                        step="0.1"
                        value={
                          coverTime
                        }
                        onChange={(
                          event
                        ) =>
                          seekCover(
                            event.target
                              .value
                          )
                        }
                      />

                      <button
                        type="button"
                        disabled={
                          coverBusy
                        }
                        onClick={() =>
                          setCoverFromFrame(
                            coverTime
                          )
                        }
                      >
                        {coverBusy
                          ? "Готуємо…"
                          : "Встановити цей кадр"}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
        </div>

        <aside className="yatut-media-create__settings">
          <div className="yatut-media-field">
            <label>
              Назва
              <span>
                {
                  title.length
                }/140
              </span>
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
              <span>
                {
                  description.length
                }/3000
              </span>
            </label>

            <textarea
              rows={5}
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

          <div className="yatut-media-audience">
            <label>
              Хто побачить
            </label>

            <div className="yatut-media-options yatut-media-options--three">
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
                <Globe2
                  size={16}
                />

                <span>
                  <strong>
                    Для всіх
                  </strong>

                  <small>
                    У PULSE
                  </small>
                </span>
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
                <Users
                  size={16}
                />

                <span>
                  <strong>
                    Друзі
                  </strong>

                  <small>
                    Тільки друзі
                  </small>
                </span>
              </button>

              <button
                type="button"
                className={
                  visibility ===
                  "private"
                    ? "is-active"
                    : ""
                }
                disabled={
                  isLive
                }
                onClick={() =>
                  setVisibility(
                    "private"
                  )
                }
              >
                <Lock
                  size={16}
                />

                <span>
                  <strong>
                    Лише я
                  </strong>

                  <small>
                    Приватно
                  </small>
                </span>
              </button>
            </div>
          </div>

          {file &&
            !isLive && (
              <div className="yatut-media-summary">
                <Sparkles
                  size={16}
                />

                <div>
                  <strong>
                    Готово до PULSE
                  </strong>

                  <span>
                    {formatTime(
                      selectedDuration
                    )}
                    {" · "}
                    {visibility ===
                      "public"
                      ? "Для всіх"
                      : visibility ===
                        "friends"
                      ? "Друзі"
                      : "Лише я"}
                  </span>
                </div>
              </div>
            )}

          {publishing && (
            <div className="yatut-media-progress">
              <div className="yatut-media-progress__top">
                <span>
                  {
                    publishStage
                  }
                </span>

                <strong>
                  {
                    publishProgress
                  }%
                </strong>
              </div>

              <div className="yatut-media-progress__track">
                <i
                  style={{
                    width:
                      `${publishProgress}%`,
                  }}
                />
              </div>

              <small>
                Не закривай ЯТУТ до завершення завантаження.
              </small>
            </div>
          )}

          {error && (
            <div className="yatut-media-create__status is-error">
              {
                error
              }
            </div>
          )}

          <motion.button
            type="button"
            className="yatut-media-publish"
            disabled={
              !canPublish
            }
            whileTap={
              canPublish
                ? {
                    scale: 0.98,
                  }
                : undefined
            }
            onClick={
              publish
            }
          >
            {publishing
              ? `Публікуємо · ${publishProgress}%`
              : isLive
              ? "LIVE — наступний модуль"
              : "Опублікувати у PULSE"}
          </motion.button>

          <small className="yatut-media-create__note">
            {authSession?.user?.id
              ? file
                ? "Відео та обкладинка зберігаються у Supabase Storage. Обраний фрагмент використовується у PULSE."
                : "Оберіть відео, щоб продовжити."
              : "Увійдіть в акаунт, щоб публікувати у PULSE."}
          </small>
        </aside>
      </section>
    </motion.div>
  );
}
