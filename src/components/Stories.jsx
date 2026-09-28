import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  motion,
} from "motion/react";

import useYatutCarousel from "../hooks/useYatutCarousel";

import {
  deleteStory,
  getStories,
  saveStory,
} from "../storage/database";

import {
  createBackendStory,
  deleteBackendStory,
  loadBackendStories,
  markBackendStoryViewed,
} from "../services/storyBackendService";

import {
  openBackendDirectChat,
  sendBackendMessage,
} from "../services/chatBackendService";

import {
  subscribeStoriesRealtime,
} from "../services/realtimeService";

import {
  captureNativePhoto,
  captureNativeVideo,
  isNativeMediaPicker,
  pickNativeMedia,
  revokeMediaPreview,
} from "../services/mediaPickerService";

/* =========================================================
   DEMO STORIES
========================================================= */

const DAY =
  24 * 60 * 60 * 1000;

const DEMO_STORIES = [
  {
    id: "story-maria",
    ownerId: "maria",
    ownerName: "Марія Коваль",
    initials: "М",
    type: "text",
    text: "Ранкова кава і трохи Києва ☕",
    background:
      "linear-gradient(145deg, #635BFF, #9B72FF)",
    createdAt:
      Date.now() - 1000 * 60 * 18,
    expiresAt:
      Date.now() + DAY,
    viewed: false,
  },

  {
    id: "story-oleksandr",
    ownerId: "oleksandr",
    ownerName: "Олександр",
    initials: "О",
    type: "text",
    text: "Сьогодні продуктивний день 🚀",
    background:
      "linear-gradient(145deg, #2447E8, #23A7F2)",
    createdAt:
      Date.now() - 1000 * 60 * 42,
    expiresAt:
      Date.now() + DAY,
    viewed: false,
  },

  {
    id: "story-anastasia",
    ownerId: "anastasia",
    ownerName: "Анастасія",
    initials: "А",
    type: "text",
    text: "Львів сьогодні неймовірний ✨",
    background:
      "linear-gradient(145deg, #D94E93, #FF7A68)",
    createdAt:
      Date.now() - 1000 * 60 * 61,
    expiresAt:
      Date.now() + DAY,
    viewed: false,
  },

  {
    id: "story-max",
    ownerId: "max",
    ownerName: "Максим",
    initials: "М",
    type: "text",
    text: "Хто сьогодні на тренування? 💪",
    background:
      "linear-gradient(145deg, #20242D, #56606E)",
    createdAt:
      Date.now() - 1000 * 60 * 73,
    expiresAt:
      Date.now() + DAY,
    viewed: false,
  },

  {
    id: "story-sofia",
    ownerId: "sofia",
    ownerName: "Софія",
    initials: "С",
    type: "text",
    text: "Знайшла дуже затишне місце ☕",
    background:
      "linear-gradient(145deg, #087653, #25BF86)",
    createdAt:
      Date.now() - 1000 * 60 * 60,
    expiresAt:
      Date.now() + DAY,
    viewed: false,
  },
];

const TEXT_BACKGROUNDS = [
  "linear-gradient(145deg, #635BFF, #9B72FF)",
  "linear-gradient(145deg, #FF4F8B, #FF8668)",
  "linear-gradient(145deg, #087653, #25BF86)",
  "linear-gradient(145deg, #1F6FEB, #55B8FF)",
  "linear-gradient(145deg, #171827, #4B5263)",
];

/* =========================================================
   HELPERS
========================================================= */

function createId() {
  return `story-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function timeAgo(
  createdAt
) {
  const minutes =
    Math.max(
      1,
      Math.floor(
        (Date.now() -
          createdAt) /
          60000
      )
    );

  if (minutes < 60) {
    return `${minutes} хв`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  return `${hours} год`;
}

/* =========================================================
   STORIES
========================================================= */

function Stories({
  authSession = null,
}) {
  const [
    stories,
    setStories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    viewerIndex,
    setViewerIndex,
  ] = useState(null);

  const [
    viewerHeld,
    setViewerHeld,
  ] = useState(false);

  const [
    creatorOpen,
    setCreatorOpen,
  ] = useState(false);

  const [
    creatorMode,
    setCreatorMode,
  ] = useState(null);

  const [
    text,
    setText,
  ] = useState("");

  const [
    selectedBackground,
    setSelectedBackground,
  ] = useState(
    TEXT_BACKGROUNDS[0]
  );

  const [
    media,
    setMedia,
  ] = useState(null);

  const [
    reply,
    setReply,
  ] = useState("");

  const [
    reactionOpen,
    setReactionOpen,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] = useState("");

  const imageInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);

  const autoNextRef =
    useRef(null);

  const [
    storiesViewportRef,
  ] = useYatutCarousel({
    align: "start",
    containScroll:
      "trimSnaps",
    dragFree: true,
  });

  const currentOwnerId =
    authSession?.user?.id ||
    "me";

  const nativeMediaAvailable =
    isNativeMediaPicker();

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    let active =
      true;

    let refreshTimer =
      null;

    const load =
      async () => {
        try {
          if (
            authSession?.user?.id
          ) {
            const saved =
              await loadBackendStories(
                authSession
              );

            if (
              active
            ) {
              setStories(
                saved
              );
            }

            return;
          }

          let saved =
            await getStories();

          if (
            saved.length ===
            0
          ) {
            for (
              const story of
              DEMO_STORIES
            ) {
              await saveStory(
                story
              );
            }

            saved = [
              ...DEMO_STORIES,
            ];
          }

          if (
            active
          ) {
            setStories(
              saved
            );
          }
        } catch (
          error
        ) {
          console.error(
            "STORIES LOAD ERROR:",
            error
          );

          if (
            active &&
            !authSession?.user?.id
          ) {
            setStories(
              DEMO_STORIES
            );
          }
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      };

    setLoading(
      true
    );

    load();

    const channel =
      authSession?.user?.id
        ? subscribeStoriesRealtime({
            session:
              authSession,
            onChange:
              () => {
                if (
                  refreshTimer
                ) {
                  window.clearTimeout(
                    refreshTimer
                  );
                }

                refreshTimer =
                  window.setTimeout(
                    load,
                    100
                  );
              },
          })
        : null;

    return () => {
      active =
        false;

      if (
        refreshTimer
      ) {
        window.clearTimeout(
          refreshTimer
        );
      }

      channel?.close();
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  /* =======================================================
     GROUP / SORT
  ======================================================= */

  const visibleStories =
    useMemo(() => {
      return [...stories].sort(
        (a, b) =>
          (a.createdAt ||
            0) -
          (b.createdAt ||
            0)
      );
    }, [stories]);

  const myStories =
    visibleStories.filter(
      (story) =>
        story.ownerId ===
        currentOwnerId
    );

  const friendStories =
    visibleStories.filter(
      (story) =>
        story.ownerId !==
        currentOwnerId
    );

  const viewerStory =
    viewerIndex !== null
      ? visibleStories[
          viewerIndex
        ]
      : null;

  useEffect(() => {
    if (
      !viewerStory?.backend ||
      !authSession?.user?.id ||
      viewerStory.ownerId ===
        authSession.user.id ||
      viewerStory.viewed
    ) {
      return;
    }

    markBackendStoryViewed(
      authSession,
      viewerStory.id
    )
      .then(
        () => {
          setStories(
            (
              previous
            ) =>
              previous.map(
                (
                  story
                ) =>
                  story.id ===
                  viewerStory.id
                    ? {
                        ...story,
                        viewed:
                          true,
                      }
                    : story
              )
          );
        }
      )
      .catch(
        (error) => {
          console.warn(
            "STORY VIEW ERROR:",
            error
          );
        }
      );
  }, [
    viewerStory?.id,
    viewerStory?.viewed,
    authSession?.user?.id,
  ]);

  /* =======================================================
     BODY LOCK
  ======================================================= */

  useEffect(() => {
    if (
      creatorOpen ||
      viewerStory
    ) {
      const previous =
        document.body.style
          .overflow;

      document.body.style.overflow =
        "hidden";

      return () => {
        document.body.style.overflow =
          previous;
      };
    }
  }, [
    creatorOpen,
    viewerStory,
  ]);

  /* =======================================================
     VIEWER TIMER
  ======================================================= */

  useEffect(() => {
    clearTimeout(
      autoNextRef.current
    );

    if (
      !viewerStory ||
      viewerHeld
    ) {
      return;
    }

    if (
      viewerStory.type ===
      "video"
    ) {
      return;
    }

    autoNextRef.current =
      setTimeout(() => {
        nextStory();
      }, 7000);

    return () =>
      clearTimeout(
        autoNextRef.current
      );
  }, [
    viewerIndex,
    viewerStory?.id,
    viewerHeld,
  ]);

  /* =======================================================
     OPEN / CLOSE
  ======================================================= */

  const openCreator =
    () => {
      setViewerIndex(
        null
      );

      setCreatorOpen(
        true
      );

      setCreatorMode(
        null
      );

      setText("");

      clearMedia();
    };

  const closeCreator =
    () => {
      setCreatorOpen(
        false
      );

      setCreatorMode(
        null
      );

      setText("");

      clearMedia();
    };

  const openStory =
    (storyId) => {
      /*
        КРИТИЧЕСКИ ВАЖНО:
        окно создания закрывается,
        поэтому два окна больше
        не накладываются друг на друга.
      */

      setCreatorOpen(
        false
      );

      setCreatorMode(
        null
      );

      clearMedia();

      const index =
        visibleStories.findIndex(
          (story) =>
            story.id ===
            storyId
        );

      if (index >= 0) {
        setViewerIndex(
          index
        );

        setReply("");

        setReactionOpen(
          false
        );
      }
    };

  const closeViewer =
    () => {
      clearTimeout(
        autoNextRef.current
      );

      setViewerIndex(
        null
      );

      setReply("");

      setReactionOpen(
        false
      );
    };

  const previousStory =
    () => {
      if (
        viewerIndex ===
        null
      ) {
        return;
      }

      if (
        viewerIndex <= 0
      ) {
        setViewerIndex(
          visibleStories.length -
            1
        );
      } else {
        setViewerIndex(
          viewerIndex - 1
        );
      }
    };

  const nextStory =
    () => {
      if (
        viewerIndex ===
        null
      ) {
        return;
      }

      if (
        viewerIndex >=
        visibleStories.length -
          1
      ) {
        closeViewer();
      } else {
        setViewerIndex(
          viewerIndex + 1
        );
      }
    };

  /* =======================================================
     MEDIA
  ======================================================= */

  const selectMedia = (
    file,
    type
  ) => {
    if (!file) {
      return;
    }

    clearMedia();

    setMedia({
      file,
      type,
      url:
        URL.createObjectURL(
          file
        ),
    });
  };

  const clearMedia =
    () => {
      setMedia(
        (previous) => {
          if (
            previous?.url
          ) {
            URL.revokeObjectURL(
              previous.url
            );
          }

          return null;
        }
      );
    };

  async function pickStoryNativeMedia(
    type
  ) {
    try {
      const selected =
        await pickNativeMedia(
          type
        );

      if (!selected) {
        return;
      }

      selectMedia(
        selected.file,
        selected.mediaType ||
          type
      );

      revokeMediaPreview(
        selected.previewUrl
      );
    } catch (
      error
    ) {
      showToast(
        error?.message ||
        "Не вдалося відкрити медіатеку"
      );
    }
  }

  async function captureStoryNativeMedia(
    type
  ) {
    try {
      const selected =
        type ===
        "video"
          ? await captureNativeVideo()
          : await captureNativePhoto();

      if (!selected) {
        return;
      }

      selectMedia(
        selected.file,
        selected.mediaType ||
          type
      );

      revokeMediaPreview(
        selected.previewUrl
      );
    } catch (
      error
    ) {
      showToast(
        error?.message ||
        "Не вдалося відкрити камеру"
      );
    }
  }

  /* =======================================================
     CREATE
  ======================================================= */

  const publishStory =
    async () => {
      if (
        creatorMode ===
          "text" &&
        !text.trim()
      ) {
        return;
      }

      if (
        (creatorMode ===
          "image" ||
          creatorMode ===
            "video") &&
        !media
      ) {
        return;
      }

      if (
        authSession?.user?.id
      ) {
        try {
          await createBackendStory(
            authSession,
            {
              type:
                creatorMode,
              text:
                creatorMode ===
                "text"
                  ? text.trim()
                  : text.trim(),
              background:
                selectedBackground,
              file:
                media?.file ||
                null,
              visibility:
                "friends",
            }
          );

          const saved =
            await loadBackendStories(
              authSession
            );

          setStories(
            saved
          );

          closeCreator();

          showToast(
            "Історію опубліковано ✨"
          );
        } catch (
          error
        ) {
          console.error(
            "SAVE BACKEND STORY ERROR:",
            error
          );

          showToast(
            error?.message ||
            "Не вдалося опублікувати історію"
          );
        }

        return;
      }

      const now =
        Date.now();

      const story = {
        id: createId(),

        ownerId: "me",

        ownerName: "Вадим",

        initials: "В",

        type:
          creatorMode,

        text:
          creatorMode ===
          "text"
            ? text.trim()
            : "",

        background:
          selectedBackground,

        mediaBlob:
          media?.file ||
          null,

        mediaType:
          media?.file?.type ||
          null,

        createdAt:
          now,

        expiresAt:
          now + DAY,

        viewed: false,
      };

      try {
        await saveStory(
          story
        );

        setStories(
          (previous) => [
            ...previous,
            story,
          ]
        );

        closeCreator();

        showToast(
          "Історію опубліковано ✨"
        );
      } catch (
        error
      ) {
        console.error(
          "SAVE STORY ERROR:",
          error
        );
      }
    };

  /* =======================================================
     DELETE OWN STORY
  ======================================================= */

  const removeCurrentStory =
    async () => {
      if (
        !viewerStory ||
        viewerStory.ownerId !==
          currentOwnerId
      ) {
        return;
      }

      try {
        if (
          viewerStory.backend &&
          authSession?.user?.id
        ) {
          await deleteBackendStory(
            authSession,
            viewerStory
          );
        } else {
          await deleteStory(
            viewerStory.id
          );
        }

        setStories(
          (previous) =>
            previous.filter(
              (story) =>
                story.id !==
                viewerStory.id
            )
        );

        closeViewer();

        showToast(
          "Історію видалено"
        );
      } catch (
        error
      ) {
        console.error(
          "DELETE STORY ERROR:",
          error
        );
      }
    };

  const showToast = (
    value
  ) => {
    setToast(
      value
    );

    setTimeout(
      () =>
        setToast(""),
      1800
    );
  };

  /* =======================================================
     MEDIA URL
  ======================================================= */

  const viewerMediaUrl =
    useMemo(() => {
      if (
        viewerStory?.media
      ) {
        return viewerStory.media;
      }

      if (
        !viewerStory
          ?.mediaBlob
      ) {
        return null;
      }

      return URL.createObjectURL(
        viewerStory.mediaBlob
      );
    }, [
      viewerStory?.id,
      viewerStory?.media,
    ]);

  useEffect(() => {
    return () => {
      if (
        viewerMediaUrl &&
        viewerMediaUrl.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          viewerMediaUrl
        );
      }
    };
  }, [
    viewerMediaUrl,
  ]);

  async function sendStoryMessage(
    textValue
  ) {
    const clean =
      String(
        textValue ||
        ""
      ).trim();

    if (
      !clean ||
      !viewerStory
    ) {
      return false;
    }

    if (
      viewerStory.backend &&
      authSession?.user?.id
    ) {
      try {
        const chat =
          await openBackendDirectChat(
            authSession,
            viewerStory.ownerId
          );

        await sendBackendMessage(
          authSession,
          chat.id,
          {
            text:
              clean,
            kind:
              "text",
          }
        );

        return true;
      } catch (
        error
      ) {
        console.warn(
          "STORY MESSAGE ERROR:",
          error
        );

        showToast(
          error?.message ||
          "Не вдалося надіслати відповідь"
        );

        return false;
      }
    }

    return true;
  }

  /* =======================================================
     CREATOR PORTAL
  ======================================================= */

  const creatorPortal =
    creatorOpen
      ? createPortal(
          <div
            className="yatut-story-backdrop"
            onMouseDown={
              closeCreator
            }
          >
            <section
              className="yatut-story-create"
              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <header className="yatut-story-create-header">

                <div>
                  <span>
                    ЯТУТ
                  </span>

                  <h2>
                    Нова історія
                  </h2>
                </div>

                <button
                  className="yatut-story-close-light"
                  onClick={
                    closeCreator
                  }
                >
                  ×
                </button>

              </header>

              {!creatorMode && (
                <div className="yatut-story-create-start">

                  <button
                    onClick={() =>
                      setCreatorMode(
                        "image"
                      )
                    }
                  >
                    <span>
                      🖼️
                    </span>

                    <strong>
                      Фото
                    </strong>

                    <small>
                      Додати фото
                    </small>
                  </button>

                  <button
                    onClick={() =>
                      setCreatorMode(
                        "video"
                      )
                    }
                  >
                    <span>
                      🎥
                    </span>

                    <strong>
                      Відео
                    </strong>

                    <small>
                      Додати відео
                    </small>
                  </button>

                  <button
                    onClick={() =>
                      setCreatorMode(
                        "text"
                      )
                    }
                  >
                    <span>
                      Aa
                    </span>

                    <strong>
                      Текст
                    </strong>

                    <small>
                      Створити історію
                    </small>
                  </button>

                </div>
              )}

              {creatorMode ===
                "image" && (
                <div className="yatut-story-editor">

                  <input
                    ref={
                      imageInputRef
                    }
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(
                      event
                    ) =>
                      selectMedia(
                        event.target
                          .files?.[0],
                        "image"
                      )
                    }
                  />

                  {!media ? (
                    <button
                      className="yatut-story-upload-zone"
                      onClick={() =>
                        nativeMediaAvailable
                          ? pickStoryNativeMedia(
                              "image"
                            )
                          : imageInputRef.current?.click()
                      }
                    >
                      <span>
                        🖼️
                      </span>

                      <strong>
                        Обрати фото
                      </strong>

                      <small>
                        JPG, PNG, HEIC
                      </small>
                    </button>
                  ) : (
                    <div className="yatut-story-media-preview">
                      <img
                        src={
                          media.url
                        }
                        alt=""
                      />

                      <button
                        onClick={() =>
                          nativeMediaAvailable
                          ? pickStoryNativeMedia(
                              "image"
                            )
                          : imageInputRef.current?.click()
                        }
                      >
                        Замінити
                      </button>
                    </div>
                  )}

                  {nativeMediaAvailable && (
                    <button
                      type="button"
                      className="yatut-story-native-capture"
                      onClick={() =>
                        captureStoryNativeMedia(
                          "image"
                        )
                      }
                    >
                      <span>📷</span>
                      Зняти фото
                    </button>
                  )}

                </div>
              )}

              {creatorMode ===
                "video" && (
                <div className="yatut-story-editor">

                  <input
                    ref={
                      videoInputRef
                    }
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(
                      event
                    ) =>
                      selectMedia(
                        event.target
                          .files?.[0],
                        "video"
                      )
                    }
                  />

                  {!media ? (
                    <button
                      className="yatut-story-upload-zone"
                      onClick={() =>
                        nativeMediaAvailable
                          ? pickStoryNativeMedia(
                              "video"
                            )
                          : videoInputRef.current?.click()
                      }
                    >
                      <span>
                        🎥
                      </span>

                      <strong>
                        Обрати відео
                      </strong>

                      <small>
                        MP4, MOV, WebM
                      </small>
                    </button>
                  ) : (
                    <div className="yatut-story-media-preview">
                      <video
                        src={
                          media.url
                        }
                        controls
                        playsInline
                      />

                      <button
                        onClick={() =>
                          nativeMediaAvailable
                          ? pickStoryNativeMedia(
                              "video"
                            )
                          : videoInputRef.current?.click()
                        }
                      >
                        Замінити
                      </button>
                    </div>
                  )}

                  {nativeMediaAvailable && (
                    <button
                      type="button"
                      className="yatut-story-native-capture"
                      onClick={() =>
                        captureStoryNativeMedia(
                          "video"
                        )
                      }
                    >
                      <span>🎥</span>
                      Записати відео
                    </button>
                  )}

                </div>
              )}

              {creatorMode ===
                "text" && (
                <div className="yatut-story-text-editor">

                  <div
                    className="yatut-story-text-preview"
                    style={{
                      background:
                        selectedBackground,
                    }}
                  >
                    <textarea
                      autoFocus
                      maxLength={
                        180
                      }
                      value={
                        text
                      }
                      onChange={(
                        event
                      ) =>
                        setText(
                          event.target
                            .value
                        )
                      }
                      placeholder="Напишіть щось..."
                    />
                  </div>

                  <div className="yatut-story-backgrounds">
                    {TEXT_BACKGROUNDS.map(
                      (
                        background
                      ) => (
                        <button
                          key={
                            background
                          }
                          className={
                            selectedBackground ===
                            background
                              ? "active"
                              : ""
                          }
                          style={{
                            background,
                          }}
                          onClick={() =>
                            setSelectedBackground(
                              background
                            )
                          }
                        />
                      )
                    )}
                  </div>

                </div>
              )}

              {creatorMode && (
                <footer className="yatut-story-create-footer">

                  <button
                    className="yatut-story-back-button"
                    onClick={() => {
                      clearMedia();

                      setText("");

                      setCreatorMode(
                        null
                      );
                    }}
                  >
                    Назад
                  </button>

                  <button
                    className="yatut-story-publish"
                    disabled={
                      creatorMode ===
                        "text"
                        ? !text.trim()
                        : !media
                    }
                    onClick={
                      publishStory
                    }
                  >
                    Опублікувати
                  </button>

                </footer>
              )}

            </section>
          </div>,
          document.body
        )
      : null;

  /* =======================================================
     VIEWER PORTAL
  ======================================================= */

  const viewerPortal =
    viewerStory
      ? createPortal(
          <div
            className="yatut-story-backdrop yatut-story-viewer-backdrop"
            onMouseDown={
              closeViewer
            }
          >
            <motion.section
              className="yatut-story-window"
              drag
              dragDirectionLock
              dragConstraints={{
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              }}
              dragElastic={{
                top: 0.32,
                right: 0.18,
                bottom: 0.5,
                left: 0.18,
              }}
              dragSnapToOrigin
              onDragEnd={(
                _event,
                info
              ) => {
                const {
                  x,
                  y,
                } =
                  info.offset;

                if (
                  y > 105 &&
                  Math.abs(
                    y
                  ) >
                    Math.abs(
                      x
                    )
                ) {
                  closeViewer();

                  return;
                }

                if (
                  x < -78
                ) {
                  nextStory();

                  return;
                }

                if (
                  x > 78
                ) {
                  previousStory();
                }
              }}
              onPointerDown={(
                event
              ) => {
                event.stopPropagation();
                setViewerHeld(
                  true
                );
              }}
              onPointerUp={() =>
                setViewerHeld(
                  false
                )
              }
              onPointerCancel={() =>
                setViewerHeld(
                  false
                )
              }
              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >

              {/* PROGRESS */}

              <div className="yatut-story-progress">
                {visibleStories.map(
                  (
                    story,
                    index
                  ) => (
                    <span
                      key={
                        story.id
                      }
                      className={
                        index <
                        viewerIndex
                          ? "done"
                          : index ===
                            viewerIndex
                          ? "active"
                          : ""
                      }
                    >
                      <i />
                    </span>
                  )
                )}
              </div>

              {/* CONTENT */}

              <div
                className="yatut-story-content"
                style={
                  viewerStory.type ===
                  "text"
                    ? {
                        background:
                          viewerStory.background ||
                          TEXT_BACKGROUNDS[0],
                      }
                    : undefined
                }
              >
                {viewerStory.type ===
                  "image" &&
                  viewerMediaUrl && (
                    <img
                      src={
                        viewerMediaUrl
                      }
                      alt=""
                    />
                  )}

                {viewerStory.type ===
                  "video" &&
                  viewerMediaUrl && (
                    <video
                      src={
                        viewerMediaUrl
                      }
                      autoPlay
                      playsInline
                      controls={false}
                      onEnded={
                        nextStory
                      }
                    />
                  )}

                {viewerStory.type ===
                  "text" && (
                    <div className="yatut-story-text">
                      {
                        viewerStory.text
                      }
                    </div>
                  )}
              </div>

              {/* TOP */}

              <header className="yatut-story-viewer-header">

                <div className="yatut-story-viewer-user">

                  <div className="yatut-story-viewer-avatar">
                    {viewerStory.avatar ? (
                      <img
                        src={
                          viewerStory.avatar
                        }
                        alt={
                          viewerStory.ownerName
                        }
                      />
                    ) : (
                      viewerStory.initials
                    )}
                  </div>

                  <div>
                    <strong>
                      {
                        viewerStory.ownerName
                      }
                    </strong>

                    <span>
                      {timeAgo(
                        viewerStory.createdAt
                      )}
                    </span>
                  </div>

                </div>

                <div className="yatut-story-top-actions">

                  {viewerStory.ownerId ===
                    currentOwnerId && (
                    <button
                      onClick={
                        removeCurrentStory
                      }
                      title="Видалити історію"
                    >
                      🗑
                    </button>
                  )}

                  <button
                    onClick={
                      closeViewer
                    }
                  >
                    ×
                  </button>

                </div>

              </header>

              {/* NAVIGATION */}

              <button
                className="yatut-story-nav yatut-story-nav-left"
                onClick={
                  previousStory
                }
              >
                ‹
              </button>

              <button
                className="yatut-story-nav yatut-story-nav-right"
                onClick={
                  nextStory
                }
              >
                ›
              </button>

              {/* FOOTER */}

              {viewerStory.ownerId !==
                currentOwnerId && (
                <footer className="yatut-story-viewer-footer">

                  <div className="yatut-story-reply">

                    <input
                      value={
                        reply
                      }
                      onChange={(
                        event
                      ) =>
                        setReply(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" &&
                          reply.trim()
                        ) {
                          event.preventDefault();

                          sendStoryMessage(
                            `↩ Відповідь на історію\n${reply.trim()}`
                          ).then(
                            (
                              sent
                            ) => {
                              if (
                                sent
                              ) {
                                showToast(
                                  "Відповідь надіслано 💬"
                                );

                                setReply(
                                  ""
                                );
                              }
                            }
                          );
                        }
                      }}
                      placeholder="Відповісти..."
                    />

                    <button
                      onClick={() =>
                        setReactionOpen(
                          !reactionOpen
                        )
                      }
                    >
                      ♡
                    </button>

                    <button
                      className="yatut-story-reply-send"
                      disabled={
                        !reply.trim()
                      }
                      onClick={() => {
                        if (
                          !reply.trim()
                        ) {
                          return;
                        }

                        sendStoryMessage(
                          `↩ Відповідь на історію\n${reply.trim()}`
                        ).then(
                          (
                            sent
                          ) => {
                            if (
                              sent
                            ) {
                              showToast(
                                "Відповідь надіслано 💬"
                              );

                              setReply(
                                ""
                              );
                            }
                          }
                        );
                      }}
                    >
                      ➤
                    </button>

                  </div>

                  {reactionOpen && (
                    <div className="yatut-story-reactions">

                      {[
                        "❤️",
                        "😂",
                        "🔥",
                        "😍",
                        "👏",
                        "😮",
                      ].map(
                        (
                          emoji
                        ) => (
                          <button
                            key={
                              emoji
                            }
                            onClick={() => {
                              sendStoryMessage(
                                `${emoji} Реакція на історію`
                              ).then(
                                (
                                  sent
                                ) => {
                                  if (
                                    sent
                                  ) {
                                    showToast(
                                      `${emoji} Реакцію надіслано`
                                    );
                                  }
                                }
                              );

                              setReactionOpen(
                                false
                              );
                            }}
                          >
                            {
                              emoji
                            }
                          </button>
                        )
                      )}

                    </div>
                  )}

                </footer>
              )}

            </motion.section>
          </div>,
          document.body
        )
      : null;

  /* =======================================================
     MAIN STRIP
  ======================================================= */

  return (
    <>
      <section
        ref={
          storiesViewportRef
        }
        className="yatut-stories-strip yatut-stories-embla"
      >
        <div className="yatut-stories-track">

        {/* MY STORY */}

        <button
          className="yatut-story-item"
          onClick={() => {
            if (
              myStories.length >
              0
            ) {
              openStory(
                myStories[
                  myStories.length -
                    1
                ].id
              );
            } else {
              openCreator();
            }
          }}
        >

          <div className="yatut-story-avatar-wrap own">

            <div className="yatut-story-avatar">
              Я
            </div>

            <button
              className="yatut-story-add"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                openCreator();
              }}
            >
              +
            </button>

          </div>

          <span>
            Ваша історія
          </span>

        </button>

        {/* FRIENDS */}

        {!loading &&
          friendStories.map(
            (story) => (
              <button
                className="yatut-story-item"
                key={
                  story.id
                }
                onClick={() =>
                  openStory(
                    story.id
                  )
                }
              >

                <div
                  className={`yatut-story-avatar-wrap ${
                    story.viewed
                      ? "viewed"
                      : "unseen"
                  }`}
                >
                  <div className="yatut-story-avatar">
                    {story.avatar ? (
                      <img
                        src={
                          story.avatar
                        }
                        alt={
                          story.ownerName
                        }
                      />
                    ) : (
                      story.initials
                    )}
                  </div>
                </div>

                <span>
                  {
                    story.ownerName
                      .split(" ")[0]
                  }
                </span>

              </button>
            )
          )}

        </div>
      </section>

      {creatorPortal}

      {viewerPortal}

      {toast &&
        createPortal(
          <div className="yatut-story-toast">
            {
              toast
            }
          </div>,
          document.body
        )}
    </>
  );
}

export default Stories;