import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  Image,
  MapPin,
  Music2,
  Smile,
  Tag,
  Users,
  Video,
  X,
} from "lucide-react";

import {
  savePremiumMedia,
  savePremiumMediaFiles,
} from "../../storage/premiumMediaService";

import "../../styles/create-post-premium.css";

const AUDIENCES = [
  {
    id: "public",
    label: "Усі",
    description:
      "Публікацію бачать усі користувачі",
  },

  {
    id: "friends",
    label: "Друзі",
    description:
      "Публікацію бачать тільки друзі",
  },

  {
    id:
      "friends-of-friends",
    label:
      "Друзі друзів",
    description:
      "Друзі та їхні друзі",
  },

  {
    id: "private",
    label:
      "Тільки я",
    description:
      "Публікація тільки для вас",
  },
];

const MOODS = [
  "😊 Радію",
  "🔥 Натхненний",
  "😌 Спокійно",
  "🥳 Святкую",
  "💪 Мотивований",
  "🤔 Думаю",
];

const PEOPLE = [
  {
    id: "maria",
    name:
      "Марія Коваль",
    initials:
      "М",
  },

  {
    id:
      "oleksandr",
    name:
      "Олександр Бондар",
    initials:
      "О",
  },

  {
    id: "sofia",
    name:
      "Софія Романенко",
    initials:
      "С",
  },

  {
    id: "yulia",
    name:
      "Юлія Савченко",
    initials:
      "Ю",
  },
];

function createPreviewItem(
  file
) {
  return {
    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    file,

    url:
      URL.createObjectURL(
        file
      ),
  };
}

function CreatePost({
  onPublish,
}) {
  const imageInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const [
    text,
    setText,
  ] = useState("");

  const [
    images,
    setImages,
  ] = useState([]);

  const [
    video,
    setVideo,
  ] = useState(null);

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    mood,
    setMood,
  ] = useState("");

  const [
    taggedPeople,
    setTaggedPeople,
  ] = useState([]);

  const [
    audience,
    setAudience,
  ] = useState(
    "public"
  );

  const [
    audienceOpen,
    setAudienceOpen,
  ] = useState(false);

  const [
    moodOpen,
    setMoodOpen,
  ] = useState(false);

  const [
    peopleOpen,
    setPeopleOpen,
  ] = useState(false);

  const [
    locationOpen,
    setLocationOpen,
  ] = useState(false);

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    publishProgress,
    setPublishProgress,
  ] = useState("");

  const activeAudience =
    useMemo(
      () =>
        AUDIENCES.find(
          (item) =>
            item.id ===
            audience
        ) ||
        AUDIENCES[0],
      [audience]
    );

  const canPublish =
    Boolean(
      text.trim() ||
        images.length ||
        video
    );

  useEffect(() => {
    return () => {
      images.forEach(
        (image) => {
          if (
            image.url?.startsWith(
              "blob:"
            )
          ) {
            URL.revokeObjectURL(
              image.url
            );
          }
        }
      );

      if (
        video?.url?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          video.url
        );
      }
    };
  }, []);

  function chooseImages(
    event
  ) {
    const files =
      Array.from(
        event.target.files ||
          []
      );

    if (!files.length) {
      return;
    }

    const available =
      Math.max(
        0,
        6 -
          images.length
      );

    const selected =
      files
        .filter(
          (file) =>
            file.type.startsWith(
              "image/"
            )
        )
        .slice(
          0,
          available
        )
        .map(
          createPreviewItem
        );

    setImages(
      (previous) => [
        ...previous,
        ...selected,
      ]
    );

    setExpanded(
      true
    );

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  }

  function chooseVideo(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (
      !file ||
      !file.type.startsWith(
        "video/"
      )
    ) {
      return;
    }

    if (
      video?.url?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        video.url
      );
    }

    setVideo(
      createPreviewItem(
        file
      )
    );

    setExpanded(
      true
    );

    if (
      videoInputRef.current
    ) {
      videoInputRef.current.value =
        "";
    }
  }

  function removeImage(
    imageId
  ) {
    setImages(
      (previous) => {
        const target =
          previous.find(
            (image) =>
              image.id ===
              imageId
          );

        if (
          target?.url?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            target.url
          );
        }

        return previous.filter(
          (image) =>
            image.id !==
            imageId
        );
      }
    );
  }

  function removeVideo() {
    if (
      video?.url?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        video.url
      );
    }

    setVideo(
      null
    );
  }

  function togglePerson(
    person
  ) {
    setTaggedPeople(
      (previous) => {
        const exists =
          previous.some(
            (item) =>
              item.id ===
              person.id
          );

        if (exists) {
          return previous.filter(
            (item) =>
              item.id !==
              person.id
          );
        }

        return [
          ...previous,
          person,
        ];
      }
    );
  }

  function reset() {
    images.forEach(
      (image) => {
        if (
          image.url?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            image.url
          );
        }
      }
    );

    if (
      video?.url?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        video.url
      );
    }

    setText("");
    setImages([]);
    setVideo(null);
    setLocation("");
    setMood("");
    setTaggedPeople([]);
    setAudience(
      "public"
    );
    setExpanded(
      false
    );
    setAudienceOpen(
      false
    );
    setMoodOpen(
      false
    );
    setPeopleOpen(
      false
    );
    setLocationOpen(
      false
    );
    setPublishProgress(
      ""
    );
  }

  async function publish() {
    if (
      !canPublish ||
      publishing
    ) {
      return;
    }

    try {
      setPublishing(
        true
      );

      setPublishProgress(
        "Зберігаємо медіа..."
      );

      const storedImages =
        await savePremiumMediaFiles(
          images.map(
            (item) =>
              item.file
          ),
          "image"
        );

      let storedVideo =
        null;

      if (
        video?.file
      ) {
        storedVideo =
          await savePremiumMedia(
            video.file,
            "video"
          );
      }

      setPublishProgress(
        "Публікуємо..."
      );

      await onPublish?.({
        text:
          text.trim(),

        images:
          storedImages,

        video:
          storedVideo,

        location:
          location.trim(),

        mood,

        taggedPeople,

        audience,
      });

      reset();
    } catch (
      error
    ) {
      console.error(
        "CREATE POST ERROR:",
        error
      );

      setPublishProgress(
        "Не вдалося опублікувати"
      );
    } finally {
      setPublishing(
        false
      );
    }
  }

  return (
    <section
      className={`yatut-create-post ${
        expanded
          ? "is-expanded"
          : ""
      }`}
    >
      <div className="yatut-create-post-top">
        <div className="yatut-create-post-avatar">
          В
        </div>

        <button
          type="button"
          className="yatut-create-post-placeholder"
          onClick={() =>
            setExpanded(
              true
            )
          }
        >
          Що у вас нового?
        </button>
      </div>

      {!expanded && (
        <div className="yatut-create-post-quick">
          <button
            type="button"
            onClick={() =>
              imageInputRef.current?.click()
            }
          >
            <Image
              size={17}
            />

            Фото
          </button>

          <button
            type="button"
            onClick={() =>
              videoInputRef.current?.click()
            }
          >
            <Video
              size={17}
            />

            Відео
          </button>

          <button
            type="button"
            onClick={() => {
              setExpanded(
                true
              );

              setLocationOpen(
                true
              );
            }}
          >
            <MapPin
              size={17}
            />

            Місце
          </button>
        </div>
      )}

      {expanded && (
        <>
          <div className="yatut-create-post-head">
            <div>
              <strong>
                Вадим
              </strong>

              <div className="yatut-create-post-audience-wrap">
                <button
                  type="button"
                  className="yatut-create-post-audience"
                  onClick={() =>
                    setAudienceOpen(
                      !audienceOpen
                    )
                  }
                >
                  <Users
                    size={13}
                  />

                  {
                    activeAudience.label
                  }

                  <ChevronDown
                    size={13}
                  />
                </button>

                {audienceOpen && (
                  <div className="yatut-create-audience-menu">
                    {AUDIENCES.map(
                      (item) => (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          className={
                            audience ===
                            item.id
                              ? "is-active"
                              : ""
                          }
                          onClick={() => {
                            setAudience(
                              item.id
                            );

                            setAudienceOpen(
                              false
                            );
                          }}
                        >
                          <strong>
                            {
                              item.label
                            }
                          </strong>

                          <small>
                            {
                              item.description
                            }
                          </small>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="yatut-create-post-close"
              onClick={
                reset
              }
            >
              <X
                size={18}
              />
            </button>
          </div>

          <textarea
            className="yatut-create-post-textarea"
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
            placeholder="Що у вас нового?"
            autoFocus
          />

          {(mood ||
            location ||
            taggedPeople.length >
              0) && (
            <div className="yatut-create-post-meta">
              {mood && (
                <span>
                  {
                    mood
                  }
                </span>
              )}

              {location && (
                <span>
                  <MapPin
                    size={12}
                  />

                  {
                    location
                  }
                </span>
              )}

              {taggedPeople.length >
                0 && (
                <span>
                  <Tag
                    size={12}
                  />

                  з{" "}
                  {taggedPeople
                    .map(
                      (person) =>
                        person.name
                    )
                    .join(
                      ", "
                    )}
                </span>
              )}
            </div>
          )}

          {images.length >
            0 && (
            <div
              className={`yatut-create-media-grid yatut-create-media-count-${Math.min(
                images.length,
                4
              )}`}
            >
              {images.map(
                (
                  image
                ) => (
                  <div
                    key={
                      image.id
                    }
                    className="yatut-create-media-item"
                  >
                    <img
                      src={
                        image.url
                      }
                      alt=""
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          image.id
                        )
                      }
                    >
                      <X
                        size={15}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {video && (
            <div className="yatut-create-video-preview">
              <video
                src={
                  video.url
                }
                controls
                playsInline
              />

              <button
                type="button"
                onClick={
                  removeVideo
                }
              >
                <X
                  size={16}
                />
              </button>
            </div>
          )}

          {locationOpen && (
            <div className="yatut-create-extra-panel">
              <div className="yatut-create-extra-title">
                <MapPin
                  size={15}
                />

                Додати місце
              </div>

              <input
                type="text"
                value={
                  location
                }
                onChange={(
                  event
                ) =>
                  setLocation(
                    event.target
                      .value
                  )
                }
                placeholder="Наприклад: Київ, Поділ"
              />

              <button
                type="button"
                onClick={() =>
                  setLocationOpen(
                    false
                  )
                }
              >
                Готово
              </button>
            </div>
          )}

          {moodOpen && (
            <div className="yatut-create-extra-panel">
              <div className="yatut-create-extra-title">
                <Smile
                  size={15}
                />

                Настрій
              </div>

              <div className="yatut-create-moods">
                {MOODS.map(
                  (item) => (
                    <button
                      key={
                        item
                      }
                      type="button"
                      className={
                        mood ===
                        item
                          ? "is-active"
                          : ""
                      }
                      onClick={() => {
                        setMood(
                          item
                        );

                        setMoodOpen(
                          false
                        );
                      }}
                    >
                      {
                        item
                      }
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {peopleOpen && (
            <div className="yatut-create-extra-panel">
              <div className="yatut-create-extra-title">
                <Tag
                  size={15}
                />

                Позначити людей
              </div>

              <div className="yatut-create-people">
                {PEOPLE.map(
                  (person) => {
                    const selected =
                      taggedPeople.some(
                        (item) =>
                          item.id ===
                          person.id
                      );

                    return (
                      <button
                        key={
                          person.id
                        }
                        type="button"
                        className={
                          selected
                            ? "is-active"
                            : ""
                        }
                        onClick={() =>
                          togglePerson(
                            person
                          )
                        }
                      >
                        <span>
                          {
                            person.initials
                          }
                        </span>

                        <strong>
                          {
                            person.name
                          }
                        </strong>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          <div className="yatut-create-post-tools">
            <button
              type="button"
              onClick={() =>
                imageInputRef.current?.click()
              }
            >
              <Image
                size={17}
              />

              Фото
            </button>

            <button
              type="button"
              onClick={() =>
                videoInputRef.current?.click()
              }
            >
              <Video
                size={17}
              />

              Відео
            </button>

            <button
              type="button"
              className={
                locationOpen
                  ? "is-active"
                  : ""
              }
              onClick={() => {
                setLocationOpen(
                  !locationOpen
                );

                setMoodOpen(
                  false
                );

                setPeopleOpen(
                  false
                );
              }}
            >
              <MapPin
                size={17}
              />

              Місце
            </button>

            <button
              type="button"
              className={
                peopleOpen
                  ? "is-active"
                  : ""
              }
              onClick={() => {
                setPeopleOpen(
                  !peopleOpen
                );

                setMoodOpen(
                  false
                );

                setLocationOpen(
                  false
                );
              }}
            >
              <Tag
                size={17}
              />

              Люди
            </button>

            <button
              type="button"
              className={
                moodOpen
                  ? "is-active"
                  : ""
              }
              onClick={() => {
                setMoodOpen(
                  !moodOpen
                );

                setPeopleOpen(
                  false
                );

                setLocationOpen(
                  false
                );
              }}
            >
              <Smile
                size={17}
              />

              Настрій
            </button>

            <button
              type="button"
              disabled
            >
              <Music2
                size={17}
              />

              Музика
            </button>
          </div>

          {publishProgress && (
            <div className="yatut-create-post-progress">
              {
                publishProgress
              }
            </div>
          )}

          <button
            type="button"
            className="yatut-create-post-publish"
            disabled={
              !canPublish ||
              publishing
            }
            onClick={
              publish
            }
          >
            {publishing
              ? "Зачекайте..."
              : "Опублікувати"}
          </button>
        </>
      )}

      <input
        ref={
          imageInputRef
        }
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={
          chooseImages
        }
      />

      <input
        ref={
          videoInputRef
        }
        type="file"
        accept="video/*"
        hidden
        onChange={
          chooseVideo
        }
      />
    </section>
  );
}

export default CreatePost;