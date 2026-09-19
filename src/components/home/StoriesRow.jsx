import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image,
  MapPin,
  Pause,
  Play,
  Plus,
  Send,
  Sparkles,
  Type,
  X,
} from "lucide-react";

import {
  createStory,
  loadStories,
  loadViewedStories,
  markStoryViewed,
  saveOwnStories,
  subscribeStories,
} from "../../storage/premiumStoriesService";

import {
  sendStoryReaction,
  sendStoryReply,
} from "../../storage/storyMessageService";

import "../../styles/stories-premium.css";

const STORY_DURATION =
  6000;

const REACTIONS = [
  "💜",
  "🔥",
  "✨",
  "😂",
  "😮",
  "👏",
];

function fileToDataUrl(
  file
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        () =>
          reject(
            reader.error
          );

      reader.readAsDataURL(
        file
      );
    }
  );
}

function formatStoryTime(
  createdAt
) {
  const diff =
    Date.now() -
    Number(
      createdAt ||
        Date.now()
    );

  const minutes =
    Math.max(
      1,
      Math.floor(
        diff /
          60000
      )
    );

  if (
    minutes <
    60
  ) {
    return `${minutes} хв`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  return `${hours} год`;
}

function StoryCircle({
  story,
  viewed,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`yatut-story-circle ${
        viewed
          ? "is-viewed"
          : "is-new"
      }`}
      onClick={
        onClick
      }
    >
      <span className="yatut-story-circle-ring">
        <span className="yatut-story-circle-inner">
          {story.type ===
            "image" &&
          story.media ? (
            <img
              src={
                story.media
              }
              alt=""
            />
          ) : (
            <span className="yatut-story-circle-letter">
              {
                story.initials
              }
            </span>
          )}
        </span>

        {story.online && (
          <i className="yatut-story-presence" />
        )}
      </span>

      <span className="yatut-story-circle-name">
        {
          story.authorName
        }
      </span>
    </button>
  );
}

function AddStoryCircle({
  story,
  onClick,
}) {
  return (
    <button
      type="button"
      className="yatut-add-story"
      onClick={
        onClick
      }
    >
      <span className="yatut-add-story-avatar">
        {story?.media ? (
          <img
            src={
              story.media
            }
            alt=""
          />
        ) : (
          <span>
            В
          </span>
        )}

        <i>
          <Plus
            size={14}
          />
        </i>
      </span>

      <span>
        Ваша історія
      </span>
    </button>
  );
}

function StoryCreator({
  onClose,
  onCreate,
}) {
  const fileRef =
    useRef(null);

  const [
    mode,
    setMode,
  ] = useState(
    "text"
  );

  const [
    text,
    setText,
  ] = useState("");

  const [
    media,
    setMedia,
  ] = useState(null);

  const [
    background,
    setBackground,
  ] = useState(
    "purple"
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function chooseFile(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return;
    }

    try {
      setLoading(
        true
      );

      const result =
        await fileToDataUrl(
          file
        );

      setMedia(
        result
      );

      setMode(
        "image"
      );
    } catch (
      error
    ) {
      console.error(
        "STORY IMAGE ERROR:",
        error
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  function publish() {
    if (
      mode ===
        "text" &&
      !text.trim()
    ) {
      return;
    }

    if (
      mode ===
        "image" &&
      !media
    ) {
      return;
    }

    onCreate?.({
      type:
        mode,

      media,

      text,

      background,
    });

    onClose?.();
  }

  return (
    <div className="yatut-story-create-overlay">
      <section className="yatut-story-create-modal">
        <header>
          <div>
            <span>
              ЯТУТ
            </span>

            <h2>
              Нова історія
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            <X
              size={20}
            />
          </button>
        </header>

        <div className="yatut-story-create-tabs">
          <button
            type="button"
            className={
              mode ===
              "text"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setMode(
                "text"
              )
            }
          >
            <Type
              size={17}
            />

            Текст
          </button>

          <button
            type="button"
            className={
              mode ===
              "image"
                ? "is-active"
                : ""
            }
            onClick={() =>
              fileRef.current?.click()
            }
          >
            <Image
              size={17}
            />

            Фото
          </button>
        </div>

        <input
          ref={
            fileRef
          }
          type="file"
          accept="image/*"
          hidden
          onChange={
            chooseFile
          }
        />

        <div
          className={`yatut-story-create-preview theme-${background}`}
        >
          {mode ===
            "image" &&
          media ? (
            <>
              <img
                src={
                  media
                }
                alt=""
              />

              <div className="yatut-story-create-photo-overlay">
                <textarea
                  value={
                    text
                  }
                  onChange={(
                    event
                  ) =>
                    setText(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Додати підпис..."
                />
              </div>
            </>
          ) : (
            <textarea
              className="yatut-story-create-text"
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
              placeholder="Що відбувається?"
              autoFocus
            />
          )}

          {loading && (
            <div className="yatut-story-create-loading">
              Завантаження…
            </div>
          )}
        </div>

        {mode ===
          "text" && (
          <div className="yatut-story-backgrounds">
            {[
              "purple",
              "sunset",
              "ocean",
              "dark",
            ].map(
              (item) => (
                <button
                  key={
                    item
                  }
                  type="button"
                  className={`theme-${item} ${
                    background ===
                    item
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() =>
                    setBackground(
                      item
                    )
                  }
                  aria-label={
                    item
                  }
                />
              )
            )}
          </div>
        )}

        <footer>
          <div>
            <MapPin
              size={15}
            />

            Київ
          </div>

          <button
            type="button"
            className="yatut-story-publish"
            onClick={
              publish
            }
            disabled={
              loading ||
              (mode ===
                "text" &&
                !text.trim()) ||
              (mode ===
                "image" &&
                !media)
            }
          >
            <Sparkles
              size={16}
            />

            Опублікувати
          </button>
        </footer>
      </section>
    </div>
  );
}

function StoryViewer({
  stories,
  initialIndex,
  onClose,
  onViewed,
}) {
  const [
    index,
    setIndex,
  ] = useState(
    initialIndex
  );

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    paused,
    setPaused,
  ] = useState(false);

  const [
    reply,
    setReply,
  ] = useState("");

  const [
    reactionsOpen,
    setReactionsOpen,
  ] = useState(false);

  const [
    reaction,
    setReaction,
  ] = useState(null);

  const [
    sendingReply,
    setSendingReply,
  ] = useState(false);

  const [
    replySent,
    setReplySent,
  ] = useState(false);

  const [
    reactionSending,
    setReactionSending,
  ] = useState(false);

  const story =
    stories[index];

  useEffect(() => {
    if (!story) {
      return;
    }

    onViewed?.(
      story.id
    );

    setProgress(0);
    setReaction(null);
    setReply("");
    setReplySent(false);
    setReactionsOpen(false);
  }, [
    story?.id,
  ]);

  useEffect(() => {
    if (
      !story ||
      paused
    ) {
      return;
    }

    const step =
      50;

    const timer =
      window.setInterval(
        () => {
          setProgress(
            (previous) => {
              const next =
                previous +
                (step /
                  STORY_DURATION) *
                  100;

              if (
                next >=
                100
              ) {
                window.clearInterval(
                  timer
                );

                if (
                  index <
                  stories.length -
                    1
                ) {
                  setTimeout(
                    () =>
                      setIndex(
                        index +
                          1
                      ),
                    0
                  );
                } else {
                  setTimeout(
                    () =>
                      onClose?.(),
                    0
                  );
                }

                return 100;
              }

              return next;
            }
          );
        },
        step
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    index,
    paused,
    story,
    stories.length,
    onClose,
  ]);

  useEffect(() => {
    function keyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose?.();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        next();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        previous();
      }

      if (
        event.key ===
          " " &&
        document.activeElement
          ?.tagName !==
          "INPUT"
      ) {
        event.preventDefault();

        setPaused(
          (value) =>
            !value
        );
      }
    }

    window.addEventListener(
      "keydown",
      keyDown
    );

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        keyDown
      );

      document.body.style.overflow =
        oldOverflow;
    };
  });

  function next() {
    if (
      index >=
      stories.length -
        1
    ) {
      onClose?.();
      return;
    }

    setIndex(
      index + 1
    );
  }

  function previous() {
    if (
      index <= 0
    ) {
      setProgress(0);
      return;
    }

    setIndex(
      index - 1
    );
  }

  async function sendReply() {
    const clean =
      reply.trim();

    if (
      !clean ||
      sendingReply ||
      story.authorId ===
        "me"
    ) {
      return;
    }

    try {
      setSendingReply(
        true
      );

      const sent =
        await sendStoryReply({
          story,
          text:
            clean,
        });

      if (sent) {
        setReply("");
        setReplySent(
          true
        );

        setTimeout(
          () =>
            setReplySent(
              false
            ),
          1800
        );
      }
    } catch (
      error
    ) {
      console.error(
        "STORY REPLY SEND ERROR:",
        error
      );
    } finally {
      setSendingReply(
        false
      );

      setPaused(
        false
      );
    }
  }

  async function react(
    emoji
  ) {
    if (
      reactionSending ||
      story.authorId ===
        "me"
    ) {
      return;
    }

    try {
      setReactionSending(
        true
      );

      setReaction(
        emoji
      );

      setReactionsOpen(
        false
      );

      await sendStoryReaction({
        story,
        emoji,
      });

      setTimeout(
        () =>
          setReaction(
            null
          ),
        1400
      );
    } catch (
      error
    ) {
      console.error(
        "STORY REACTION ERROR:",
        error
      );
    } finally {
      setReactionSending(
        false
      );
    }
  }

  if (!story) {
    return null;
  }

  return (
    <div className="yatut-story-viewer">
      <div className="yatut-story-viewer-bg">
        {story.type ===
          "image" &&
        story.media && (
          <img
            src={
              story.media
            }
            alt=""
          />
        )}
      </div>

      <section
        className={`yatut-story-stage theme-${
          story.background ||
          "dark"
        }`}
      >
        <div className="yatut-story-progress">
          {stories.map(
            (
              item,
              itemIndex
            ) => (
              <span
                key={
                  item.id
                }
              >
                <i
                  style={{
                    width:
                      itemIndex <
                      index
                        ? "100%"
                        : itemIndex ===
                            index
                          ? `${progress}%`
                          : "0%",
                  }}
                />
              </span>
            )
          )}
        </div>

        <header className="yatut-story-viewer-head">
          <div className="yatut-story-author">
            <div className="yatut-story-viewer-avatar">
              {
                story.initials
              }
            </div>

            <div>
              <strong>
                {
                  story.authorName
                }
              </strong>

              <span>
                {formatStoryTime(
                  story.createdAt
                )}

                {story.location
                  ? ` · ${story.location}`
                  : ""}
              </span>
            </div>
          </div>

          <div className="yatut-story-head-actions">
            <button
              type="button"
              onClick={() =>
                setPaused(
                  !paused
                )
              }
              aria-label={
                paused
                  ? "Продовжити"
                  : "Пауза"
              }
            >
              {paused ? (
                <Play
                  size={18}
                />
              ) : (
                <Pause
                  size={18}
                />
              )}
            </button>

            <button
              type="button"
              onClick={
                onClose
              }
              aria-label="Закрити"
            >
              <X
                size={20}
              />
            </button>
          </div>
        </header>

        <div className="yatut-story-content">
          {story.type ===
            "image" &&
          story.media ? (
            <img
              src={
                story.media
              }
              alt=""
            />
          ) : (
            <div className="yatut-story-text-content">
              {
                story.text
              }
            </div>
          )}

          {story.type ===
            "image" &&
            story.text && (
              <div className="yatut-story-caption">
                {
                  story.text
                }
              </div>
            )}

          {reaction && (
            <div className="yatut-story-big-reaction">
              {
                reaction
              }
            </div>
          )}
        </div>

        <button
          type="button"
          className="yatut-story-nav yatut-story-prev"
          onClick={
            previous
          }
          aria-label="Попередня історія"
        >
          <ChevronLeft
            size={27}
          />
        </button>

        <button
          type="button"
          className="yatut-story-nav yatut-story-next"
          onClick={
            next
          }
          aria-label="Наступна історія"
        >
          <ChevronRight
            size={27}
          />
        </button>

        <footer className="yatut-story-viewer-footer">
          {story.authorId !==
            "me" ? (
            <>
              {reactionsOpen && (
                <div className="yatut-story-reactions">
                  {REACTIONS.map(
                    (
                      emoji
                    ) => (
                      <button
                        key={
                          emoji
                        }
                        type="button"
                        disabled={
                          reactionSending
                        }
                        onClick={() =>
                          react(
                            emoji
                          )
                        }
                      >
                        {
                          emoji
                        }
                      </button>
                    )
                  )}
                </div>
              )}

              {replySent && (
                <div
                  style={{
                    marginBottom:
                      "8px",
                    minHeight:
                      "34px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap:
                      "6px",
                    borderRadius:
                      "12px",
                    background:
                      "rgba(34,197,94,.20)",
                    color:
                      "#fff",
                    fontSize:
                      "10px",
                    fontWeight:
                      "800",
                    backdropFilter:
                      "blur(12px)",
                  }}
                >
                  <Check
                    size={15}
                  />

                  Надіслано в повідомлення
                </div>
              )}

              <div className="yatut-story-reply">
                <input
                  value={
                    reply
                  }
                  onFocus={() =>
                    setPaused(
                      true
                    )
                  }
                  onBlur={() => {
                    if (
                      !sendingReply
                    ) {
                      setPaused(
                        false
                      );
                    }
                  }}
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
                      "Enter"
                    ) {
                      event.preventDefault();

                      sendReply();
                    }
                  }}
                  placeholder={`Відповісти ${story.authorName}...`}
                />

                <button
                  type="button"
                  onClick={() => {
                    setReactionsOpen(
                      !reactionsOpen
                    );

                    setPaused(
                      true
                    );
                  }}
                  aria-label="Реакція"
                >
                  <Heart
                    size={19}
                  />
                </button>

                <button
                  type="button"
                  className="yatut-story-reply-send"
                  disabled={
                    !reply.trim() ||
                    sendingReply
                  }
                  onClick={
                    sendReply
                  }
                  aria-label="Надіслати"
                >
                  {sendingReply ? (
                    <span>
                      …
                    </span>
                  ) : (
                    <Send
                      size={18}
                    />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="yatut-story-own-label">
              Ваша історія · доступна 24 години
            </div>
          )}
        </footer>
      </section>
    </div>
  );
}

function StoriesRow() {
  const [
    stories,
    setStories,
  ] = useState(
    () =>
      loadStories()
  );

  const [
    viewed,
    setViewed,
  ] = useState(
    () =>
      loadViewedStories()
  );

  const [
    viewerIndex,
    setViewerIndex,
  ] = useState(null);

  const [
    creatorOpen,
    setCreatorOpen,
  ] = useState(false);

  useEffect(() => {
    return subscribeStories(
      (
        updatedStories
      ) => {
        setStories(
          updatedStories
        );

        setViewed(
          loadViewedStories()
        );
      }
    );
  }, []);

  const ownStory =
    stories.find(
      (story) =>
        story.authorId ===
        "me"
    );

  function addStory(
    data
  ) {
    const story =
      createStory(
        data
      );

    const existingOwn =
      stories.filter(
        (item) =>
          item.authorId ===
          "me"
      );

    saveOwnStories([
      story,
      ...existingOwn,
    ]);

    setStories(
      loadStories()
    );
  }

  function viewedStory(
    storyId
  ) {
    markStoryViewed(
      storyId
    );

    setViewed(
      (previous) =>
        previous.includes(
          storyId
        )
          ? previous
          : [
              ...previous,
              storyId,
            ]
    );
  }

  return (
    <>
      <section className="yatut-stories-row">
        <AddStoryCircle
          story={
            ownStory
          }
          onClick={() => {
            if (
              ownStory
            ) {
              const index =
                stories.findIndex(
                  (story) =>
                    story.id ===
                    ownStory.id
                );

              setViewerIndex(
                index
              );
            } else {
              setCreatorOpen(
                true
              );
            }
          }}
        />

        {stories
          .filter(
            (story) =>
              story.authorId !==
              "me"
          )
          .map(
            (
              story
            ) => {
              const index =
                stories.findIndex(
                  (item) =>
                    item.id ===
                    story.id
                );

              return (
                <StoryCircle
                  key={
                    story.id
                  }
                  story={
                    story
                  }
                  viewed={
                    viewed.includes(
                      story.id
                    )
                  }
                  onClick={() =>
                    setViewerIndex(
                      index
                    )
                  }
                />
              );
            }
          )}

        {ownStory && (
          <button
            type="button"
            className="yatut-story-add-more"
            onClick={() =>
              setCreatorOpen(
                true
              )
            }
          >
            <Plus
              size={20}
            />

            Додати
          </button>
        )}
      </section>

      {creatorOpen && (
        <StoryCreator
          onClose={() =>
            setCreatorOpen(
              false
            )
          }
          onCreate={
            addStory
          }
        />
      )}

      {viewerIndex !==
        null && (
        <StoryViewer
          stories={
            stories
          }
          initialIndex={
            viewerIndex
          }
          onViewed={
            viewedStory
          }
          onClose={() =>
            setViewerIndex(
              null
            )
          }
        />
      )}
    </>
  );
}

export default StoriesRow;