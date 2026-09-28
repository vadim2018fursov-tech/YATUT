import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Image as ImageIcon,
  Lock,
  MapPin,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";

import {
  captureNativePhoto,
  captureNativeVideo,
  isNativeMediaPicker,
  pickNativeMedia,
  revokeMediaPreview,
} from "../services/mediaPickerService";

import {
  deleteStorageObject,
  uploadPostMedia,
} from "../services/storageService";

import {
  createBackendPost,
} from "../services/feedBackendService";

import {
  nativeLightHaptic,
  nativeMediumHaptic,
  nativeSelectionHaptic,
} from "../services/nativeFeedbackService";

const AUDIENCES = [
  {
    id: "public",
    icon: Globe2,
    title: "Публічно",
    description:
      "Допис побачать усі у ЯТУТ.",
  },
  {
    id: "friends",
    icon: Users,
    title: "Друзі",
    description:
      "Тільки ваші друзі.",
  },
  {
    id: "private",
    icon: Lock,
    title: "Лише я",
    description:
      "Приватна публікація.",
  },
];

export default function CreatePostPage({
  onNavigate,
  authSession = null,
}) {
  const fileInputRef =
    useRef(null);

  const nativeMediaAvailable =
    isNativeMediaPicker();

  const [
    text,
    setText,
  ] = useState("");

  const [
    file,
    setFile,
  ] = useState(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");

  const [
    mediaType,
    setMediaType,
  ] = useState(null);

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    visibility,
    setVisibility,
  ] = useState(
    "public"
  );

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    publishProgress,
    setPublishProgress,
  ] = useState(0);

  const [
    publishStage,
    setPublishStage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    publishedPost,
    setPublishedPost,
  ] = useState(null);

  const hasContent =
    Boolean(
      text.trim() ||
      file
    );

  const canPublish =
    Boolean(
      authSession?.user?.id &&
      hasContent &&
      !publishing
    );

  useEffect(
    () => {
      return () =>
        revokeMediaPreview(
          previewUrl
        );
    },
    [
      previewUrl,
    ]
  );

  function applyFile(
    nextFile
  ) {
    if (!nextFile) {
      return;
    }

    const mime =
      String(
        nextFile.type ||
        ""
      );

    if (
      !mime.startsWith(
        "image/"
      ) &&
      !mime.startsWith(
        "video/"
      )
    ) {
      setError(
        "Оберіть фото або відео."
      );

      return;
    }

    revokeMediaPreview(
      previewUrl
    );

    setFile(
      nextFile
    );

    setMediaType(
      mime.startsWith(
        "video/"
      )
        ? "video"
        : "image"
    );

    setPreviewUrl(
      URL.createObjectURL(
        nextFile
      )
    );

    setError(
      ""
    );
  }

  async function chooseMedia() {
    nativeSelectionHaptic();

    if (
      nativeMediaAvailable
    ) {
      const result =
        await pickNativeMedia(
          "all"
        );

      applyFile(
        result?.file
      );

      return;
    }

    fileInputRef.current
      ?.click();
  }

  async function capturePhoto() {
    nativeSelectionHaptic();

    const result =
      await captureNativePhoto();

    applyFile(
      result?.file
    );
  }

  async function captureVideo() {
    nativeSelectionHaptic();

    const result =
      await captureNativeVideo();

    applyFile(
      result?.file
    );
  }

  function clearMedia() {
    revokeMediaPreview(
      previewUrl
    );

    setPreviewUrl(
      ""
    );

    setFile(
      null
    );

    setMediaType(
      null
    );
  }

  async function publish() {
    if (
      !canPublish
    ) {
      return;
    }

    let upload =
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
        file
          ? 3
          : 70
      );

      setPublishStage(
        file
          ? "Завантажуємо медіа"
          : "Публікуємо допис"
      );

      if (file) {
        upload =
          await uploadPostMedia(
            authSession,
            file,
            {
              onProgress:
                (
                  progress
                ) => {
                  setPublishProgress(
                    Math.min(
                      82,
                      Math.max(
                        4,
                        Math.round(
                          progress *
                            0.82
                        )
                      )
                    )
                  );
                },
            }
          );
      }

      setPublishProgress(
        88
      );

      setPublishStage(
        "Публікуємо у стрічку"
      );

      created =
        await createBackendPost(
          authSession,
          {
            text:
              text.trim(),
            media:
              upload?.url ||
              null,
            mediaType:
              upload?.mediaType ||
              mediaType,
            location:
              location.trim() ||
              null,
            visibility,
          }
        );

      if (!created?.id) {
        throw new Error(
          "Не вдалося створити допис."
        );
      }

      setPublishProgress(
        100
      );

      setPublishStage(
        "Опубліковано"
      );

      setPublishedPost(
        created
      );

      nativeLightHaptic();
    } catch (
      publishError
    ) {
      if (
        upload?.path &&
        !created
      ) {
        await deleteStorageObject(
          authSession,
          "post-media",
          upload.path
        ).catch(
          () => {}
        );
      }

      setPublishProgress(
        0
      );

      setPublishStage(
        ""
      );

      setError(
        publishError?.message ||
        "Не вдалося опублікувати допис."
      );
    } finally {
      setPublishing(
        false
      );
    }
  }

  if (
    publishedPost
  ) {
    return (
      <motion.section
        className="yatut-content-success"
        initial={{
          opacity: 0,
          scale: 0.98,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
      >
        <motion.div
          className="yatut-content-success__icon"
          initial={{
            scale: 0.5,
            rotate: -10,
          }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 28,
          }}
        >
          <CheckCircle2
            size={34}
          />
        </motion.div>

        <small>
          ЯТУТ
        </small>

        <h1>
          Допис опубліковано
        </h1>

        <p>
          Він уже у стрічці та синхронізований між пристроями.
        </p>

        <div className="yatut-content-success__actions">
          <button
            type="button"
            className="is-primary"
            onClick={() =>
              onNavigate?.(
                "home",
                {
                  postId:
                    publishedPost.id,
                }
              )
            }
          >
            Відкрити допис
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "create"
              )
            }
          >
            Створити ще
          </button>
        </div>
      </motion.section>
    );
  }

  return (
    <div className="yatut-content-create">
      <header className="yatut-content-create__header">
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
            <ImageIcon
              size={21}
            />
          </span>

          <div>
            <small>
              СТРІЧКА ЯТУТ
            </small>

            <h1>
              Новий допис
            </h1>

            <p>
              Текст, фото або відео — одразу у вашу стрічку.
            </p>
          </div>
        </div>
      </header>

      <div className="yatut-content-create__grid">
        <section className="yatut-content-editor">
          <label className="yatut-content-editor__text">
            <span>
              Що у тебе нового?
            </span>

            <textarea
              value={
                text
              }
              onChange={(
                event
              ) =>
                setText(
                  event.target.value
                )
              }
              maxLength={
                4000
              }
              placeholder="Поділіться думкою, новиною або моментом…"
            />

            <small>
              {
                text.length
              } / 4000
            </small>
          </label>

          <AnimatePresence
            mode="wait"
          >
            {previewUrl ? (
              <motion.div
                key="preview"
                className="yatut-content-preview has-media"
                initial={{
                  opacity: 0,
                  scale: 0.985,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.985,
                }}
              >
                {mediaType ===
                "video" ? (
                  <video
                    src={
                      previewUrl
                    }
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={
                      previewUrl
                    }
                    alt=""
                  />
                )}

                <button
                  type="button"
                  className="yatut-content-preview__remove"
                  onClick={
                    clearMedia
                  }
                  aria-label="Прибрати медіа"
                >
                  <X
                    size={18}
                  />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="empty"
                type="button"
                className="yatut-content-preview"
                whileTap={{
                  scale: 0.985,
                }}
                onClick={
                  chooseMedia
                }
              >
                <span>
                  <Upload
                    size={27}
                  />
                </span>

                <strong>
                  Додати фото або відео
                </strong>

                <p>
                  Медіа завантажиться у ЯТУТ Storage перед публікацією.
                </p>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="yatut-content-source-actions">
            <motion.button
              type="button"
              whileTap={{
                scale: 0.96,
              }}
              onClick={
                chooseMedia
              }
            >
              <ImageIcon
                size={16}
              />

              Медіатека
            </motion.button>

            {nativeMediaAvailable && (
              <>
                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={
                    capturePhoto
                  }
                >
                  <ImageIcon
                    size={16}
                  />

                  Фото
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={
                    captureVideo
                  }
                >
                  <Video
                    size={16}
                  />

                  Відео
                </motion.button>
              </>
            )}
          </div>

          <input
            ref={
              fileInputRef
            }
            hidden
            type="file"
            accept="image/*,video/*"
            onChange={(
              event
            ) => {
              applyFile(
                event.target.files?.[0]
              );

              event.target.value =
                "";
            }}
          />
        </section>

        <aside className="yatut-content-settings">
          <label className="yatut-content-field">
            <span>
              <MapPin
                size={15}
              />

              Локація
            </span>

            <input
              value={
                location
              }
              onChange={(
                event
              ) =>
                setLocation(
                  event.target.value
                )
              }
              maxLength={
                80
              }
              placeholder="Наприклад, Київ"
            />
          </label>

          <div className="yatut-content-audience">
            <span>
              Хто побачить допис
            </span>

            <div>
              {AUDIENCES.map(
                (
                  item
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <motion.button
                      key={
                        item.id
                      }
                      type="button"
                      className={
                        visibility ===
                        item.id
                          ? "is-active"
                          : ""
                      }
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={() => {
                        nativeSelectionHaptic();

                        setVisibility(
                          item.id
                        );
                      }}
                    >
                      <Icon
                        size={17}
                      />

                      <span>
                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <small>
                          {
                            item.description
                          }
                        </small>
                      </span>
                    </motion.button>
                  );
                }
              )}
            </div>
          </div>

          {publishing && (
            <div className="yatut-content-progress">
              <div>
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

              <div className="yatut-content-progress__track">
                <i
                  style={{
                    width:
                      `${publishProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="yatut-content-error">
              {
                error
              }
            </div>
          )}

          <motion.button
            type="button"
            className="yatut-content-publish"
            whileTap={
              canPublish
                ? {
                    scale: 0.98,
                  }
                : undefined
            }
            disabled={
              !canPublish
            }
            onClick={
              publish
            }
          >
            {publishing
              ? "Публікуємо…"
              : "Опублікувати"}
          </motion.button>

          <small className="yatut-content-note">
            Після публікації допис одразу зʼявиться у вашому профілі та стрічці.
          </small>
        </aside>
      </div>
    </div>
  );
}
