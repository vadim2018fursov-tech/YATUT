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
  Sparkles,
  Type,
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
  createBackendStory,
} from "../services/storyBackendService";

import {
  nativeLightHaptic,
  nativeMediumHaptic,
  nativeSelectionHaptic,
} from "../services/nativeFeedbackService";

const THEMES = [
  {
    id: "purple",
    label: "Фіолетова",
  },
  {
    id: "blue",
    label: "Синя",
  },
  {
    id: "pink",
    label: "Рожева",
  },
  {
    id: "green",
    label: "Зелена",
  },
  {
    id: "dark",
    label: "Темна",
  },
];

const AUDIENCES = [
  {
    id: "friends",
    icon: Users,
    title: "Друзі",
  },
  {
    id: "public",
    icon: Globe2,
    title: "Публічно",
  },
  {
    id: "private",
    icon: Lock,
    title: "Лише я",
  },
];

export default function CreateStoryPage({
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
    theme,
    setTheme,
  ] = useState(
    "purple"
  );

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
    visibility,
    setVisibility,
  ] = useState(
    "friends"
  );

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    stage,
    setStage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    published,
    setPublished,
  ] = useState(false);

  const canPublish =
    Boolean(
      authSession?.user?.id &&
      (
        text.trim() ||
        file
      ) &&
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
        "До історії можна додати фото або відео."
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

    try {
      nativeMediumHaptic();

      setPublishing(
        true
      );

      setError(
        ""
      );

      setStage(
        file
          ? "Завантажуємо медіа…"
          : "Створюємо історію…"
      );

      const created =
        await createBackendStory(
          authSession,
          {
            type:
              mediaType ||
              "text",
            text:
              text.trim(),
            background:
              theme,
            file,
            visibility,
          }
        );

      if (!created?.id) {
        throw new Error(
          "Не вдалося створити історію."
        );
      }

      setStage(
        "Опубліковано"
      );

      setPublished(
        true
      );

      nativeLightHaptic();
    } catch (
      publishError
    ) {
      setStage(
        ""
      );

      setError(
        publishError?.message ||
        "Не вдалося опублікувати історію."
      );
    } finally {
      setPublishing(
        false
      );
    }
  }

  if (published) {
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
            rotate: -12,
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
          STORIES
        </small>

        <h1>
          Історія опублікована
        </h1>

        <p>
          Вона вже доступна у Stories та зникне автоматично після завершення терміну.
        </p>

        <div className="yatut-content-success__actions">
          <button
            type="button"
            className="is-primary"
            onClick={() =>
              onNavigate?.(
                "home"
              )
            }
          >
            До Stories
          </button>

          <button
            type="button"
            onClick={() => {
              setPublished(
                false
              );

              setText(
                ""
              );

              clearMedia();
            }}
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
            <Sparkles
              size={21}
            />
          </span>

          <div>
            <small>
              STORIES
            </small>

            <h1>
              Нова історія
            </h1>

            <p>
              Текст, фото або відео у повноекранному форматі.
            </p>
          </div>
        </div>
      </header>

      <div className="yatut-content-create__grid">
        <section className="yatut-content-editor">
          <AnimatePresence
            mode="wait"
          >
            {previewUrl ? (
              <motion.div
                key="media"
                className="yatut-story-create-preview has-media"
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

                {text.trim() && (
                  <div className="yatut-story-create-preview__text">
                    {
                      text
                    }
                  </div>
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
              <motion.div
                key="text"
                className={`yatut-story-create-preview theme-${theme}`}
                initial={{
                  opacity: 0,
                  scale: 0.985,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
              >
                <Type
                  size={25}
                />

                <strong>
                  {text.trim() ||
                    "Твоя історія"}
                </strong>

                <small>
                  Попередній перегляд
                </small>
              </motion.div>
            )}
          </AnimatePresence>

          <label className="yatut-content-editor__text">
            <span>
              Текст історії
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
                800
              }
              placeholder="Напиши щось…"
            />

            <small>
              {
                text.length
              } / 800
            </small>
          </label>

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
              <Upload
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
          {!file && (
            <div className="yatut-story-theme-picker">
              <span>
                Фон
              </span>

              <div>
                {THEMES.map(
                  (
                    item
                  ) => (
                    <motion.button
                      key={
                        item.id
                      }
                      type="button"
                      className={`theme-${item.id} ${
                        theme ===
                        item.id
                          ? "is-active"
                          : ""
                      }`}
                      whileTap={{
                        scale: 0.9,
                      }}
                      onClick={() => {
                        nativeSelectionHaptic();

                        setTheme(
                          item.id
                        );
                      }}
                      aria-label={
                        item.label
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

          <div className="yatut-content-audience">
            <span>
              Хто побачить історію
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

                      <strong>
                        {
                          item.title
                        }
                      </strong>
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
                    stage
                  }
                </span>

                <strong>
                  •••
                </strong>
              </div>

              <div className="yatut-content-progress__track is-indeterminate">
                <i />
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
              ? "Публікуємо…"
              : "Опублікувати історію"}
          </motion.button>

          <small className="yatut-content-note">
            Історія синхронізується між пристроями та зʼявиться у стрічці Stories.
          </small>
        </aside>
      </div>
    </div>
  );
}
