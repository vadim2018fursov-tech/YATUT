import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import YatutIcon from "./YatutIcon";

import {
  deleteChat,
  deleteMessage,
  getChat,
  getChats,
  getMessages,
  saveChat,
  saveMessage,
} from "../storage/database";

/* =========================================================
   PEOPLE
========================================================= */

const PEOPLE = {
  me: {
    id: "me",
    name: "Вадим",
    username: "vadim",
    initials: "В",
    online: true,
  },

  maria: {
    id: "maria",
    name: "Марія Коваль",
    username: "maria.koval",
    initials: "М",
    online: true,
    storyStatus: "new",
  },

  oleksandr: {
    id: "oleksandr",
    name: "Олександр Бондар",
    username: "bondar",
    initials: "О",
    online: true,
    storyStatus: "viewed",
  },

  anastasia: {
    id: "anastasia",
    name: "Анастасія Мельник",
    username: "nastia",
    initials: "А",
    online: false,
  },

  max: {
    id: "max",
    name: "Максим Шевченко",
    username: "max.sh",
    initials: "М",
    online: false,
  },

  sofia: {
    id: "sofia",
    name: "Софія Романенко",
    username: "sofia.r",
    initials: "С",
    online: true,
    storyStatus: null,
  },

  vlad: {
    id: "vlad",
    name: "Владислав Мороз",
    username: "vlad.moroz",
    initials: "В",
    online: false,
  },

  yulia: {
    id: "yulia",
    name: "Юлія Савченко",
    username: "yulia.s",
    initials: "Ю",
    online: true,
    storyStatus: "new",
  },
};

/* =========================================================
   STORIES — DEMO DATA
   Real media URLs can replace backgrounds later.
========================================================= */

const STORY_SETS = {
  maria: [
    {
      id: "story-maria-1",
      duration: 5200,
      background:
        "radial-gradient(circle at 20% 18%, rgba(97,91,255,.55), transparent 28%), radial-gradient(circle at 78% 35%, rgba(80,209,173,.36), transparent 28%), linear-gradient(145deg, #141728 0%, #313b6d 48%, #090a11 100%)",
      caption:
        "Вечірній Київ 💜",
      time:
        "3 год",
    },
    {
      id: "story-maria-2",
      duration: 5200,
      background:
        "radial-gradient(circle at 72% 28%, rgba(255,108,172,.48), transparent 26%), radial-gradient(circle at 30% 72%, rgba(107,99,255,.56), transparent 32%), linear-gradient(145deg, #1a1022, #3c244b 52%, #0c0b12)",
      caption:
        "Мій сьогоднішній настрій ✨",
      time:
        "2 год",
    },
  ],

  oleksandr: [
    {
      id: "story-oleksandr-1",
      duration: 5200,
      background:
        "radial-gradient(circle at 35% 25%, rgba(255,210,77,.56), transparent 28%), radial-gradient(circle at 72% 68%, rgba(255,144,74,.42), transparent 30%), linear-gradient(150deg, #2a2211, #5d4420 52%, #10100c)",
      caption:
        "Дорога додому",
      time:
        "4 год",
    },
  ],

  yulia: [
    {
      id: "story-yulia-1",
      duration: 5200,
      background:
        "radial-gradient(circle at 30% 30%, rgba(86,195,255,.52), transparent 28%), radial-gradient(circle at 70% 62%, rgba(111,92,255,.44), transparent 30%), linear-gradient(150deg, #0a1822, #183b55 48%, #080b11)",
      caption:
        "Сьогодні було красиво",
      time:
        "1 год",
    },
    {
      id: "story-yulia-2",
      duration: 5200,
      background:
        "radial-gradient(circle at 78% 20%, rgba(87,224,179,.5), transparent 24%), radial-gradient(circle at 28% 68%, rgba(82,137,255,.5), transparent 30%), linear-gradient(150deg, #0d1d1a, #183d3b 50%, #080b0a)",
      caption:
        "Ще один момент 💫",
      time:
        "48 хв",
    },
  ],
};

/* =========================================================
   DEMO
========================================================= */

const DEMO_CHATS = [
  {
    id: "chat-maria",
    type: "direct",
    personId: "maria",
    updatedAt:
      Date.now() -
      1000,
    unread: 2,
    lastMessage:
      "Привіт 👋",
  },

  {
    id:
      "chat-oleksandr",
    type: "direct",
    personId:
      "oleksandr",
    updatedAt:
      Date.now() -
      400000,
    unread: 0,
    lastMessage:
      "До зустрічі!",
  },

  {
    id: "chat-sofia",
    type: "direct",
    personId: "sofia",
    updatedAt:
      Date.now() -
      800000,
    unread: 0,
    lastMessage:
      "Дякую ✨",
  },
];

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😂",
  "🥹",
  "😊",
  "😍",
  "🥰",
  "😘",
  "😎",
  "🤩",
  "🥳",
  "🤔",
  "😮",
  "🤯",
  "😢",
  "😭",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🙏",
  "🤝",
  "❤️",
  "💜",
  "🔥",
  "✨",
  "🎉",
  "💯",
  "🚀",
];

const REACTIONS = [
  "❤️",
  "😂",
  "🔥",
  "👍",
  "😮",
  "😢",
];

/* =========================================================
   HELPERS
========================================================= */

function createId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function formatTime(
  value
) {
  return new Date(
    value
  ).toLocaleTimeString(
    "uk-UA",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatChatListTime(
  value
) {
  const time =
    Number(
      value || 0
    );

  if (!time) {
    return "";
  }

  const now =
    Date.now();

  const diff =
    Math.max(
      0,
      now - time
    );

  if (
    diff <
    60000
  ) {
    return "зараз";
  }

  if (
    diff <
    3600000
  ) {
    return `${Math.max(
      1,
      Math.round(
        diff /
        60000
      )
    )} хв`;
  }

  const date =
    new Date(
      time
    );

  const today =
    new Date();

  if (
    date.toDateString() ===
    today.toDateString()
  ) {
    return date.toLocaleTimeString(
      "uk-UA",
      {
        hour:
          "2-digit",
        minute:
          "2-digit",
      }
    );
  }

  return date.toLocaleDateString(
    "uk-UA",
    {
      day:
        "2-digit",
      month:
        "2-digit",
    }
  );
}

function formatDuration(
  value = 0
) {
  const min =
    Math.floor(
      value / 60
    );

  const sec =
    value % 60;

  return `${String(
    min
  ).padStart(
    2,
    "0"
  )}:${String(
    sec
  ).padStart(
    2,
    "0"
  )}`;
}

function cleanMessage(
  message
) {
  const {
    fileUrl,
    ...rest
  } = message;

  return rest;
}

function chatTitle(chat) {
  if (!chat) {
    return "";
  }

  if (
    chat.type ===
      "group" ||
    chat.communityId
  ) {
    return (
      chat.title ||
      "Груповий чат"
    );
  }

  return (
    PEOPLE[chat.personId]
      ?.name ||
    "Користувач"
  );
}

function chatInitials(
  chat
) {
  if (!chat) {
    return "?";
  }

  if (
    chat.type ===
      "group" ||
    chat.communityId
  ) {
    return (
      chat.initials ||
      chat.title?.[0]
        ?.toUpperCase() ||
      "Г"
    );
  }

  return (
    PEOPLE[chat.personId]
      ?.initials ||
    "?"
  );
}

function previewText(
  message
) {
  if (!message) {
    return "";
  }

  if (
    message.type ===
    "voice"
  ) {
    return "🎙 Голосове";
  }

  if (
    message.type ===
    "image"
  ) {
    return "🖼 Фото";
  }

  if (
    message.type ===
    "video"
  ) {
    return "🎥 Відео";
  }

  if (
    message.type ===
    "file"
  ) {
    return "📎 Файл";
  }

  if (
    message.widget?.type ===
    "conference"
  ) {
    return "📹 Конференція";
  }

  return (
    message.text ||
    "Повідомлення"
  );
}

/* =========================================================
   CALL
========================================================= */

function CallModal({
  chat,
  mode,
  onClose,
}) {
  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const [
    muted,
    setMuted,
  ] = useState(false);

  const [
    cameraOff,
    setCameraOff,
  ] = useState(
    mode === "audio"
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let mounted = true;

    const start =
      async () => {
        try {
          if (
            !navigator
              .mediaDevices
              ?.getUserMedia
          ) {
            setError(
              "Камера та мікрофон недоступні."
            );

            return;
          }

          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                audio: true,

                video:
                  mode ===
                  "video",
              }
            );

          if (!mounted) {
            stream
              .getTracks()
              .forEach(
                (track) =>
                  track.stop()
              );

            return;
          }

          streamRef.current =
            stream;

          if (
            videoRef.current
          ) {
            videoRef.current.srcObject =
              stream;
          }
        } catch {
          setError(
            "Дозвольте доступ до камери та мікрофона."
          );
        }
      };

    start();

    return () => {
      mounted = false;

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    };
  }, [mode]);

  const toggleMic =
    () => {
      const tracks =
        streamRef.current
          ?.getAudioTracks() ||
        [];

      tracks.forEach(
        (track) => {
          track.enabled =
            muted;
        }
      );

      setMuted(
        !muted
      );
    };

  const toggleCamera =
    () => {
      const tracks =
        streamRef.current
          ?.getVideoTracks() ||
        [];

      tracks.forEach(
        (track) => {
          track.enabled =
            cameraOff;
        }
      );

      setCameraOff(
        !cameraOff
      );
    };

  return (
    <div className="call-backdrop">

      <section className="call-window">

        <div className="call-top">

          <strong>
            {mode ===
            "audio"
              ? "Аудіодзвінок"
              : chat?.type ===
                  "group"
              ? "Конференція"
              : "Відеодзвінок"}
          </strong>

          <span>
            ЯТУТ
          </span>

        </div>

        <div className="call-stage">

          {mode ===
            "video" &&
          !cameraOff ? (
            <video
              ref={
                videoRef
              }
              autoPlay
              playsInline
              muted
              className="call-self-video"
            />
          ) : (
            <div className="call-avatar-big">
              {chatInitials(
                chat
              )}
            </div>
          )}

          <h2>
            {chatTitle(
              chat
            )}
          </h2>

          <p>
            {error ||
              "Зʼєднання..."}
          </p>

        </div>

        <div className="call-controls">

          <button
            onClick={
              toggleMic
            }
          >
            {muted
              ? "🔇"
              : "🎙️"}
          </button>

          {mode ===
            "video" && (
            <button
              onClick={
                toggleCamera
              }
            >
              {cameraOff
                ? "🚫"
                : "📹"}
            </button>
          )}

          <button>
            🖥️
          </button>

          <button
            className="call-end"
            onClick={
              onClose
            }
          >
            ☎
          </button>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   VOICE RECORDER
========================================================= */

function VoiceRecorder({
  onCancel,
  onSend,
}) {
  const recorderRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const timerRef =
    useRef(null);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let mounted = true;

    const start =
      async () => {
        try {
          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                audio: true,
              }
            );

          if (!mounted) {
            return;
          }

          streamRef.current =
            stream;

          const recorder =
            new MediaRecorder(
              stream
            );

          recorderRef.current =
            recorder;

          chunksRef.current =
            [];

          recorder.ondataavailable =
            (event) => {
              if (
                event.data.size >
                0
              ) {
                chunksRef.current.push(
                  event.data
                );
              }
            };

          recorder.start();

          timerRef.current =
            setInterval(
              () =>
                setDuration(
                  (value) =>
                    value + 1
                ),
              1000
            );
        } catch {
          setError(
            "Немає доступу до мікрофона."
          );
        }
      };

    start();

    return () => {
      mounted = false;

      clearInterval(
        timerRef.current
      );

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    };
  }, []);

  const stopTracks =
    () => {
      clearInterval(
        timerRef.current
      );

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    };

  const cancel = () => {
    const recorder =
      recorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.onstop =
        () => {
          stopTracks();
          onCancel();
        };

      recorder.stop();
    } else {
      stopTracks();
      onCancel();
    }
  };

  const send = () => {
    const recorder =
      recorderRef.current;

    if (
      !recorder ||
      recorder.state ===
        "inactive"
    ) {
      return;
    }

    recorder.onstop =
      () => {
        const blob =
          new Blob(
            chunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            }
          );

        stopTracks();

        onSend(
          blob,
          Math.max(
            duration,
            1
          )
        );
      };

    recorder.stop();
  };

  return (
    <div className="voice-recorder">

      <button
        onClick={
          cancel
        }
      >
        ×
      </button>

      <div className="voice-recording-status">

        <span className="voice-live-dot active" />

        <div>
          <strong>
            Голосове повідомлення
          </strong>

          <span>
            {error ||
              formatDuration(
                duration
              )}
          </span>
        </div>

      </div>

      <div className="voice-wave">

        {Array.from({
          length: 20,
        }).map(
          (_, index) => (
            <span
              key={
                index
              }
            />
          )
        )}

      </div>

      <button
        disabled={
          Boolean(error)
        }
        onClick={send}
      >
        ➤
      </button>

    </div>
  );
}

/* =========================================================
   GROUP MODAL
========================================================= */

function GroupModal({
  onClose,
  onCreate,
}) {
  const [
    title,
    setTitle,
  ] = useState("");

  const [
    selected,
    setSelected,
  ] = useState([]);

  const people =
    Object.values(
      PEOPLE
    ).filter(
      (person) =>
        person.id !==
        "me"
    );

  const toggle = (
    id
  ) => {
    setSelected(
      (previous) =>
        previous.includes(id)
          ? previous.filter(
              (item) =>
                item !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };

  return (
    <div
      className="chat-modal-backdrop"
      onClick={onClose}
    >

      <section
        className="group-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <header className="chat-modal-header">

          <div>
            <span>
              ЯТУТ
            </span>

            <strong>
              Нова група
            </strong>
          </div>

          <button
            onClick={
              onClose
            }
          >
            ×
          </button>

        </header>

        <div className="group-modal-body">

          <label className="group-name-field">

            <span>
              Назва
            </span>

            <input
              autoFocus
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target
                    .value
                )
              }
              placeholder="Назва групи"
            />

          </label>

          <div className="group-members-select">

            {people.map(
              (person) => {
                const active =
                  selected.includes(
                    person.id
                  );

                return (
                  <button
                    key={
                      person.id
                    }
                    className={
                      active
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      toggle(
                        person.id
                      )
                    }
                  >

                    <span className="group-person-avatar">
                      {
                        person.initials
                      }
                    </span>

                    <div>
                      <strong>
                        {
                          person.name
                        }
                      </strong>

                      <small>
                        @
                        {
                          person.username
                        }
                      </small>
                    </div>

                    <b>
                      {active
                        ? "✓"
                        : ""}
                    </b>

                  </button>
                );
              }
            )}

          </div>

        </div>

        <footer className="group-modal-footer">

          <span>
            {selected.length} обрано
          </span>

          <button
            disabled={
              !title.trim() ||
              selected.length <
                2
            }
            onClick={() =>
              onCreate({
                title:
                  title.trim(),

                members: [
                  "me",
                  ...selected,
                ],
              })
            }
          >
            Створити
          </button>

        </footer>

      </section>

    </div>
  );
}

/* =========================================================
   FORWARD
========================================================= */

function ForwardModal({
  chats,
  onClose,
  onForward,
}) {
  const [
    search,
    setSearch,
  ] = useState("");

  const filtered =
    chats.filter(
      (chat) =>
        chatTitle(chat)
          .toLowerCase()
          .includes(
            search
              .toLowerCase()
          )
    );

  return (
    <div
      className="chat-modal-backdrop"
      onClick={onClose}
    >

      <section
        className="forward-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <header className="chat-modal-header">

          <div>
            <span>
              ЯТУТ
            </span>

            <strong>
              Переслати
            </strong>
          </div>

          <button
            onClick={
              onClose
            }
          >
            ×
          </button>

        </header>

        <label className="forward-search">
          🔎

          <input
            autoFocus
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Знайти чат"
          />
        </label>

        <div className="forward-chat-list">

          {filtered.map(
            (chat) => (
              <div
                className="forward-chat-row"
                key={chat.id}
              >

                <div className="forward-chat-avatar">
                  {chatInitials(
                    chat
                  )}
                </div>

                <div className="forward-chat-info">

                  <strong>
                    {chatTitle(
                      chat
                    )}
                  </strong>

                  <span>
                    {chat.communityId
                      ? "Чат спільноти"
                      : chat.type ===
                        "group"
                      ? "Груповий чат"
                      : "Особистий чат"}
                  </span>

                </div>

                <button
                  onClick={() =>
                    onForward(
                      chat
                    )
                  }
                >
                  Надіслати
                </button>

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   MESSAGE
========================================================= */

function MessageBubble({
  message,
  chat,
  person,
  search,
  activeSearch,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onPin,
  onReaction,
  onJoinCall,
}) {
  const [
    menu,
    setMenu,
  ] = useState(false);

  const [
    reactions,
    setReactions,
  ] = useState(false);

  const menuRef =
    useRef(null);

  const menuTriggerRef =
    useRef(null);

  useEffect(() => {
    if (!menu) {
      return;
    }

    function handleOutsidePress(
      event
    ) {
      if (
        menuRef.current?.contains(
          event.target
        ) ||
        menuTriggerRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      setMenu(false);
    }

    document.addEventListener(
      "pointerdown",
      handleOutsidePress
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleOutsidePress
      );
  }, [
    menu,
  ]);

  const mine =
    message.senderId ===
    "me";

  const sender =
    PEOPLE[
      message.senderId
    ];

  return (
    <div
      id={`message-${message.id}`}
      className={`message-row ${
        mine ? "mine" : ""
      } ${
        activeSearch
          ? "chat-search-result-active"
          : ""
      }`}
    >

      {!mine && (
        <div className="message-avatar">
          {sender?.initials ||
            person?.initials ||
            "?"}
        </div>
      )}

      <div className="message-shell">

        <button
          ref={
            menuTriggerRef
          }
          className="message-more-trigger"
          onClick={() => {
            setMenu(!menu);
            setReactions(false);
          }}
        >
          •••
        </button>

        {menu && (
          <div
            ref={
              menuRef
            }
            className="message-action-menu"
          >
            <div className="message-action-reactions">
              {REACTIONS.map(
                (
                  emoji
                ) => (
                  <button
                    key={
                      emoji
                    }
                    type="button"
                    className="message-action-reaction"
                    onClick={() => {
                      onReaction(
                        message.id,
                        emoji
                      );
                      setMenu(
                        false
                      );
                    }}
                    aria-label={`Реакція ${emoji}`}
                  >
                    {
                      emoji
                    }
                  </button>
                )
              )}
            </div>

            <div className="message-action-separator" />

            <button
              onClick={() => {
                onReply(message);
                setMenu(false);
              }}
            >
              <span className="message-action-icon">
                <YatutIcon
                  name="reply"
                  size={16}
                />
              </span>

              Відповісти
            </button>

            <button
              onClick={() => {
                onForward(
                  message
                );
                setMenu(false);
              }}
            >
              <span className="message-action-icon">
                <YatutIcon
                  name="forward"
                  size={16}
                />
              </span>

              Переслати
            </button>

            <button
              onClick={() => {
                onPin(message);
                setMenu(false);
              }}
            >
              <span className="message-action-icon">
                <YatutIcon
                  name="pin"
                  size={16}
                />
              </span>

              {message.pinned
                ? "Відкріпити"
                : "Закріпити"}
            </button>

            {mine &&
              message.type ===
                "text" && (
                <button
                  onClick={() => {
                    onEdit(
                      message
                    );
                    setMenu(
                      false
                    );
                  }}
                >
                  <span className="message-action-icon">
                    <YatutIcon
                      name="edit"
                      size={16}
                    />
                  </span>

                  Редагувати
                </button>
              )}

            {mine && (
              <button
                className="danger"
                onClick={() => {
                  onDelete(
                    message
                  );
                  setMenu(false);
                }}
              >
                <span className="message-action-icon">
                  <YatutIcon
                    name="trash"
                    size={16}
                  />
                </span>

                Видалити
              </button>
            )}

          </div>
        )}

        <button
          className="message-reaction-trigger"
          onClick={() => {
            setReactions(
              !reactions
            );
            setMenu(false);
          }}
        >
          ♡
        </button>

        {reactions && (
          <div className="message-reaction-popover">

            {REACTIONS.map(
              (emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReaction(
                      message.id,
                      emoji
                    );

                    setReactions(
                      false
                    );
                  }}
                >
                  {emoji}
                </button>
              )
            )}

          </div>
        )}

        <div
          className={`message-bubble ${
            mine ? "mine" : ""
          }`}
        >

          {message.forwardedFrom && (
            <div className="forwarded-label">
              ↪ Переслане повідомлення
            </div>
          )}

          {chat.type ===
            "group" &&
            !mine && (
              <div className="group-message-author">
                {sender?.name ||
                  "Учасник"}
              </div>
            )}

          {message.replyTo && (
            <div className="message-reply-quote">

              <strong>
                {message.replyTo
                  .senderId ===
                "me"
                  ? "Ви"
                  : PEOPLE[
                      message.replyTo
                        .senderId
                    ]?.name ||
                    "Користувач"}
              </strong>

              <span>
                {message.replyTo
                  .text ||
                  "Вкладення"}
              </span>

            </div>
          )}

          {message.type ===
            "image" &&
            message.fileUrl && (
              <img
                className="chat-image"
                src={
                  message.fileUrl
                }
                alt=""
              />
            )}

          {message.type ===
            "video" &&
            message.fileUrl && (
              <video
                className="chat-video"
                src={
                  message.fileUrl
                }
                controls
                playsInline
              />
            )}

          {message.type ===
            "file" &&
            message.fileUrl && (
              <a
                className="chat-file"
                href={
                  message.fileUrl
                }
                download={
                  message.fileName
                }
              >
                📎{" "}
                <span>
                  {
                    message.fileName
                  }
                </span>
              </a>
            )}

          {message.type ===
            "voice" &&
            message.fileUrl && (
              <div className="voice-message">

                <span>
                  🎙
                </span>

                <audio
                  controls
                  src={
                    message.fileUrl
                  }
                />

                <small>
                  {formatDuration(
                    message.voiceDuration
                  )}
                </small>

              </div>
            )}

          {message.widget?.type ===
            "conference" && (
            <div className="conference-message-widget">

              <span>
                📹
              </span>

              <div>
                <small>
                  КОНФЕРЕНЦІЯ ЯТУТ
                </small>

                <strong>
                  {
                    message.widget
                      .title
                  }
                </strong>

                <button
                  onClick={
                    onJoinCall
                  }
                >
                  Приєднатися
                </button>
              </div>

            </div>
          )}

          {message.text && (
            <p>
              {search ? (
                <>
                  {message.text}
                </>
              ) : (
                message.text
              )}
            </p>
          )}

          {message.edited && (
            <span className="message-edited">
              ред.
            </span>
          )}

        </div>

        <div className="message-time">

          {formatTime(
            message.createdAt
          )}

          {mine && (
            <span>
              ✓✓
            </span>
          )}

        </div>

        {message.myReaction && (
          <button
            className="message-reaction-saved"
            onClick={() =>
              onReaction(
                message.id,
                message.myReaction
              )
            }
          >
            {
              message.myReaction
            }
          </button>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   CHATS
========================================================= */

function Chats({
  initialPersonId = null,
}) {
  const [
    chats,
    setChats,
  ] = useState([]);

  const [
    activeChatId,
    setActiveChatId,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    draft,
    setDraft,
  ] = useState("");

  const [
    chatSearch,
    setChatSearch,
  ] = useState("");

  const [
    messageSearch,
    setMessageSearch,
  ] = useState("");

  const [
    messageSearchOpen,
    setMessageSearchOpen,
  ] = useState(false);

  const [
    replyTo,
    setReplyTo,
  ] = useState(null);

  const [
    editing,
    setEditing,
  ] = useState(null);

  const [
    forwarding,
    setForwarding,
  ] = useState(null);

  const [
    attachment,
    setAttachment,
  ] = useState(null);

  const [
    emojiOpen,
    setEmojiOpen,
  ] = useState(false);

  const [
    attachOpen,
    setAttachOpen,
  ] = useState(false);

  const [
    voiceOpen,
    setVoiceOpen,
  ] = useState(false);

  const [
    groupOpen,
    setGroupOpen,
  ] = useState(false);

  const [
    newChatOpen,
    setNewChatOpen,
  ] = useState(false);

  const [
    newChatPoint,
    setNewChatPoint,
  ] = useState({
    top: 160,
    right: 16,
  });

  const [
    infoOpen,
    setInfoOpen,
  ] = useState(false);

  const [
    callMode,
    setCallMode,
  ] = useState(null);

  const [
    mobileDialogOpen,
    setMobileDialogOpen,
  ] = useState(
    Boolean(
      initialPersonId
    )
  );

  const [
    chatListView,
    setChatListView,
  ] = useState(
    "inbox"
  );

  const [
    chatActionChatId,
    setChatActionChatId,
  ] = useState(null);

  const [
    chatActionPoint,
    setChatActionPoint,
  ] = useState({
    x: 24,
    y: 220,
  });

  const [
    storyViewer,
    setStoryViewer,
  ] = useState(null);

  const [
    storyProgress,
    setStoryProgress,
  ] = useState(0);

  const [
    storyPaused,
    setStoryPaused,
  ] = useState(false);

  const [
    storyReactionOpen,
    setStoryReactionOpen,
  ] = useState(false);

  const [
    storyMoreOpen,
    setStoryMoreOpen,
  ] = useState(false);

  const [
    storyReply,
    setStoryReply,
  ] = useState("");

  const [
    viewedStories,
    setViewedStories,
  ] = useState(
    () =>
      new Set()
  );

  const imageRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const fileRef =
    useRef(null);

  const bottomRef =
    useRef(null);

  const emojiRef =
    useRef(null);

  const attachRef =
    useRef(null);

  const infoPanelRef =
    useRef(null);

  const infoTriggerRef =
    useRef(null);

  const personTriggerRef =
    useRef(null);

  const storyMoreRef =
    useRef(null);

  const storyTouchStartRef =
    useRef(null);

  const storyPressStartedAtRef =
    useRef(0);

  const storySuppressTapRef =
    useRef(false);

  const newChatPopoverRef =
    useRef(null);

  const newChatTriggerRef =
    useRef(null);

  const chatActionRef =
    useRef(null);

  const chatLongPressTimerRef =
    useRef(null);

  const chatLongPressStartRef =
    useRef({
      x: 0,
      y: 0,
    });

  const chatLongPressTriggeredRef =
    useRef(false);

  const activeChat =
    chats.find(
      (chat) =>
        chat.id ===
        activeChatId
    );

  const activePerson =
    activeChat?.personId
      ? PEOPLE[
          activeChat.personId
        ]
      : null;

  /* =======================================================
     MOBILE POPOVER OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    if (!emojiOpen) {
      return;
    }

    function handleEmojiOutside(
      event
    ) {
      if (
        emojiRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      setEmojiOpen(false);
    }

    document.addEventListener(
      "pointerdown",
      handleEmojiOutside
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleEmojiOutside
      );
  }, [
    emojiOpen,
  ]);

  useEffect(() => {
    if (!attachOpen) {
      return;
    }

    function handleAttachOutside(
      event
    ) {
      if (
        attachRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      setAttachOpen(false);
    }

    document.addEventListener(
      "pointerdown",
      handleAttachOutside
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleAttachOutside
      );
  }, [
    attachOpen,
  ]);

  useEffect(() => {
    if (!infoOpen) {
      return;
    }

    function handleInfoOutside(
      event
    ) {
      if (
        infoPanelRef.current?.contains(
          event.target
        ) ||
        infoTriggerRef.current?.contains(
          event.target
        ) ||
        personTriggerRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      setInfoOpen(false);
    }

    document.addEventListener(
      "pointerdown",
      handleInfoOutside
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleInfoOutside
      );
  }, [
    infoOpen,
  ]);

  useEffect(() => {
    if (!newChatOpen) {
      return;
    }

    function handleNewChatOutside(
      event
    ) {
      if (
        newChatPopoverRef.current?.contains(
          event.target
        ) ||
        newChatTriggerRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      setNewChatOpen(false);
    }

    document.addEventListener(
      "pointerdown",
      handleNewChatOutside
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleNewChatOutside
      );
  }, [
    newChatOpen,
  ]);

  useEffect(() => {
    if (!chatActionChatId) {
      return;
    }

    function handleChatActionOutside(
      event
    ) {
      if (
        chatActionRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      setChatActionChatId(
        null
      );
    }

    document.addEventListener(
      "pointerdown",
      handleChatActionOutside
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleChatActionOutside
      );
  }, [
    chatActionChatId,
  ]);

  useEffect(() => {
    if (!storyViewer) {
      return;
    }

    setStoryProgress(
      0
    );

    setStoryReactionOpen(
      false
    );

    setStoryMoreOpen(
      false
    );

    setStoryPaused(
      false
    );

    storySuppressTapRef.current =
      false;
  }, [
    storyViewer?.personId,
    storyViewer?.storyIndex,
  ]);

  useEffect(() => {
    if (
      !storyViewer ||
      storyPaused ||
      storyReactionOpen ||
      storyMoreOpen
    ) {
      return;
    }

    const timer =
      setInterval(
        () => {
          setStoryProgress(
            (previous) => {
              if (
                previous >=
                98
              ) {
                clearInterval(
                  timer
                );

                setTimeout(
                  () =>
                    goToNextStory(),
                  0
                );

                return 100;
              }

              return (
                previous +
                2
              );
            }
          );
        },
        100
      );

    return () =>
      clearInterval(
        timer
      );
  }, [
    storyViewer?.personId,
    storyViewer?.storyIndex,
    storyPaused,
    storyReactionOpen,
    storyMoreOpen,
  ]);

  useEffect(() => {
    if (!storyMoreOpen) {
      return;
    }

    function handleStoryMenuOutside(
      event
    ) {
      if (
        storyMoreRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      setStoryMoreOpen(
        false
      );
    }

    document.addEventListener(
      "pointerdown",
      handleStoryMenuOutside
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        handleStoryMenuOutside
      );
  }, [
    storyMoreOpen,
  ]);

  useEffect(() => {
    if (!storyViewer) {
      return;
    }

    document.body.classList.add(
      "story-viewer-open"
    );

    return () => {
      document.body.classList.remove(
        "story-viewer-open"
      );
    };
  }, [
    Boolean(
      storyViewer
    ),
  ]);

  /* =======================================================
     LOAD CHATS
  ======================================================= */

  useEffect(() => {
    const load =
      async () => {
        try {
          let stored =
            await getChats();

          if (
            stored.length ===
            0
          ) {
            for (
              const chat of
              DEMO_CHATS
            ) {
              await saveChat(
                chat
              );
            }

            stored = [
              ...DEMO_CHATS,
            ];
          }

          stored =
            stored
              .map(
                (chat) => ({
                  ...chat,

                  type:
                    chat.type ||
                    "direct",
                })
              )
              .sort(
                (a, b) =>
                  (b.updatedAt ||
                    0) -
                  (a.updatedAt ||
                    0)
              );

          setChats(stored);

          /* ===============================================
             COMMUNITY / EVENT / GROUP REQUESTED CHAT
          =============================================== */

          const requestedChatId =
            sessionStorage.getItem(
              "yatut-open-chat-id"
            );

          let requestHandled =
            false;

          if (
            requestedChatId
          ) {
            let requested =
              stored.find(
                (chat) =>
                  chat.id ===
                  requestedChatId
              );

            if (!requested) {
              requested =
                await getChat(
                  requestedChatId
                );

              if (requested) {
                stored = [
                  requested,
                  ...stored,
                ];

                setChats(
                  stored
                );
              }
            }

            if (requested) {
              setActiveChatId(
                requested.id
              );

              setMobileDialogOpen(
                true
              );

              requestHandled =
                true;
            }

            sessionStorage.removeItem(
              "yatut-open-chat-id"
            );
          }

          /* PROFILE PERSON */

          if (
            !requestHandled &&
            initialPersonId
          ) {
            let chat =
              stored.find(
                (item) =>
                  item.type !==
                    "group" &&
                  item.personId ===
                    initialPersonId
              );

            if (!chat) {
              chat = {
                id:
                  `chat-${initialPersonId}`,

                type:
                  "direct",

                personId:
                  initialPersonId,

                updatedAt:
                  Date.now(),

                unread: 0,

                lastMessage:
                  "Новий діалог",
              };

              await saveChat(
                chat
              );

              stored = [
                chat,
                ...stored,
              ];

              setChats(
                stored
              );
            }

            setActiveChatId(
              chat.id
            );

            setMobileDialogOpen(
              true
            );

            requestHandled =
              true;
          }

          if (
            !requestHandled &&
            stored[0]
          ) {
            setActiveChatId(
              stored[0].id
            );
          }
        } catch (error) {
          console.error(
            "CHAT LOAD ERROR:",
            error
          );
        }
      };

    load();
  }, []);

  /* =======================================================
     PERSON AFTER ALREADY MOUNTED
  ======================================================= */

  useEffect(() => {
    if (
      !initialPersonId ||
      chats.length === 0
    ) {
      return;
    }

    const open =
      async () => {
        let chat =
          chats.find(
            (item) =>
              item.type !==
                "group" &&
              item.personId ===
                initialPersonId
          );

        if (!chat) {
          chat = {
            id:
              `chat-${initialPersonId}`,
            type: "direct",
            personId:
              initialPersonId,
            updatedAt:
              Date.now(),
            unread: 0,
            lastMessage:
              "Новий діалог",
          };

          await saveChat(
            chat
          );

          setChats(
            (previous) => [
              chat,
              ...previous,
            ]
          );
        }

        setActiveChatId(
          chat.id
        );

        setMobileDialogOpen(
          true
        );
      };

    open();
  }, [
    initialPersonId,
  ]);

  /* =======================================================
     LOAD MESSAGES
  ======================================================= */

  useEffect(() => {
    const load =
      async () => {
        if (
          !activeChatId
        ) {
          setMessages([]);
          return;
        }

        try {
          let stored =
            await getMessages(
              activeChatId
            );

          if (
            activeChatId ===
              "chat-maria" &&
            stored.length ===
              0
          ) {
            const demo = [
              {
                id:
                  "demo-chat-message-1",
                chatId:
                  "chat-maria",
                senderId:
                  "maria",
                type: "text",
                text:
                  "Привіт 👋 Як справи?",
                createdAt:
                  Date.now() -
                  600000,
                pinned: false,
              },

              {
                id:
                  "demo-chat-message-2",
                chatId:
                  "chat-maria",
                senderId:
                  "me",
                type: "text",
                text:
                  "Привіт! Працюю над ЯТУТ 😎",
                createdAt:
                  Date.now() -
                  500000,
                pinned: false,
                myReaction:
                  "🔥",
              },
            ];

            for (
              const message of
              demo
            ) {
              await saveMessage(
                message
              );
            }

            stored = demo;
          }

          setMessages(
            stored.map(
              (message) => ({
                ...message,

                fileUrl:
                  message.fileBlob
                    ? URL.createObjectURL(
                        message.fileBlob
                      )
                    : null,
              })
            )
          );
        } catch (error) {
          console.error(
            "MESSAGE LOAD ERROR:",
            error
          );

          setMessages([]);
        }

        setReplyTo(null);
        setEditing(null);
        setDraft("");
        setInfoOpen(false);
        setMessageSearch("");
        setMessageSearchOpen(
          false
        );
      };

    load();
  }, [
    activeChatId,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [
    messages.length,
  ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const archivedCount =
    chats.filter(
      (chat) =>
        chat.archived &&
        !chat.hidden
    ).length;

  const hiddenCount =
    chats.filter(
      (chat) =>
        chat.hidden
    ).length;

  const onlinePeople =
    useMemo(
      () =>
        Object.values(
          PEOPLE
        )
          .filter(
            (person) =>
              person.id !==
                "me" &&
              person.online
          )
          .slice(
            0,
            7
          ),
      []
    );

  const storyPeople =
    useMemo(
      () =>
        Object.values(
          PEOPLE
        ).filter(
          (person) =>
            STORY_SETS[
              person.id
            ]?.length
        ),
      []
    );

  const currentStoryPerson =
    storyViewer
      ? PEOPLE[
          storyViewer.personId
        ] || null
      : null;

  const currentStorySet =
    storyViewer
      ? STORY_SETS[
          storyViewer.personId
        ] || []
      : [];

  const currentStory =
    storyViewer
      ? currentStorySet[
          storyViewer.storyIndex
        ] || null
      : null;

  const filteredChats =
    useMemo(() => {
      const query =
        chatSearch
          .trim()
          .toLowerCase();

      const source =
        chats.filter(
          (chat) => {
            if (
              chatListView ===
              "archive"
            ) {
              return (
                chat.archived &&
                !chat.hidden
              );
            }

            if (
              chatListView ===
              "hidden"
            ) {
              return Boolean(
                chat.hidden
              );
            }

            return (
              !chat.archived &&
              !chat.hidden
            );
          }
        );

      if (!query) {
        return source;
      }

      return source.filter(
        (chat) => {
          const title =
            chatTitle(
              chat
            )
              .toLowerCase();

          const preview =
            String(
              chat.lastMessage ||
              ""
            ).toLowerCase();

          return (
            title.includes(
              query
            ) ||
            preview.includes(
              query
            )
          );
        }
      );
    }, [
      chats,
      chatSearch,
      chatListView,
    ]);

  const chatActionChat =
    chats.find(
      (chat) =>
        chat.id ===
        chatActionChatId
    ) || null;

  const foundMessages =
    useMemo(() => {
      const query =
        messageSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return [];
      }

      return messages.filter(
        (message) =>
          message.text
            ?.toLowerCase()
            .includes(
              query
            )
      );
    }, [
      messages,
      messageSearch,
    ]);

  /* =======================================================
     STORIES
  ======================================================= */

  function getStoryRingStatus(
    person
  ) {
    const stories =
      STORY_SETS[
        person.id
      ] || [];

    if (!stories.length) {
      return "none";
    }

    const allViewed =
      stories.every(
        (
          story,
          index
        ) =>
          viewedStories.has(
            `${person.id}:${index}`
          )
      );

    if (allViewed) {
      return "viewed";
    }

    return (
      person.storyStatus ||
      "new"
    );
  }

  function markStoryViewed(
    personId,
    storyIndex
  ) {
    setViewedStories(
      (previous) => {
        const next =
          new Set(
            previous
          );

        next.add(
          `${personId}:${storyIndex}`
        );

        return next;
      }
    );
  }

  function openStory(
    personId,
    storyIndex = 0
  ) {
    const stories =
      STORY_SETS[
        personId
      ] || [];

    if (!stories.length) {
      createDirectChat(
        personId
      );

      return;
    }

    const safeIndex =
      Math.min(
        Math.max(
          storyIndex,
          0
        ),
        stories.length -
          1
      );

    setStoryViewer({
      personId,
      storyIndex:
        safeIndex,
    });

    markStoryViewed(
      personId,
      safeIndex
    );
  }

  function closeStory() {
    setStoryViewer(
      null
    );

    setStoryProgress(
      0
    );

    setStoryReactionOpen(
      false
    );

    setStoryMoreOpen(
      false
    );

    setStoryPaused(
      false
    );

    storySuppressTapRef.current =
      false;

    setStoryReply("");
  }

  function goToNextStory() {
    if (!storyViewer) {
      return;
    }

    const stories =
      STORY_SETS[
        storyViewer.personId
      ] || [];

    if (
      storyViewer.storyIndex <
      stories.length -
        1
    ) {
      const nextIndex =
        storyViewer.storyIndex +
        1;

      setStoryViewer({
        personId:
          storyViewer.personId,
        storyIndex:
          nextIndex,
      });

      markStoryViewed(
        storyViewer.personId,
        nextIndex
      );

      return;
    }

    const personIndex =
      storyPeople.findIndex(
        (person) =>
          person.id ===
          storyViewer.personId
      );

    if (
      personIndex >= 0 &&
      personIndex <
        storyPeople.length -
          1
    ) {
      const nextPerson =
        storyPeople[
          personIndex +
            1
        ];

      setStoryViewer({
        personId:
          nextPerson.id,
        storyIndex: 0,
      });

      markStoryViewed(
        nextPerson.id,
        0
      );

      return;
    }

    closeStory();
  }

  function goToPreviousStory() {
    if (!storyViewer) {
      return;
    }

    if (
      storyViewer.storyIndex >
      0
    ) {
      const previousIndex =
        storyViewer.storyIndex -
        1;

      setStoryViewer({
        personId:
          storyViewer.personId,
        storyIndex:
          previousIndex,
      });

      return;
    }

    const personIndex =
      storyPeople.findIndex(
        (person) =>
          person.id ===
          storyViewer.personId
      );

    if (
      personIndex >
      0
    ) {
      const previousPerson =
        storyPeople[
          personIndex -
            1
        ];

      const previousStories =
        STORY_SETS[
          previousPerson.id
        ] || [];

      const previousIndex =
        Math.max(
          0,
          previousStories.length -
            1
        );

      setStoryViewer({
        personId:
          previousPerson.id,
        storyIndex:
          previousIndex,
      });

      return;
    }

    setStoryProgress(
      0
    );
  }

  async function shareStory() {
    if (
      !currentStory ||
      !currentStoryPerson
    ) {
      return;
    }

    const text =
      `${currentStoryPerson.name} · ЯТУТ Story`;

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            "ЯТУТ",
          text,
        });

        return;
      }

      await navigator.clipboard?.writeText(
        text
      );
    } catch (
      error
    ) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.warn(
          "STORY SHARE ERROR:",
          error
        );
      }
    }
  }

  function sendStoryReaction(
    emoji
  ) {
    setStoryReactionOpen(
      false
    );

    setStoryReply(
      emoji
    );

    setTimeout(
      () =>
        setStoryReply(
          ""
        ),
      900
    );
  }

  function handleStoryPressStart(
    event
  ) {
    const target =
      event.target;

    if (
      target?.closest?.(
        ".story-viewer-header, .story-bottom, .story-more-popover"
      )
    ) {
      return;
    }

    storyPressStartedAtRef.current =
      Date.now();

    storySuppressTapRef.current =
      false;

    setStoryPaused(
      true
    );
  }

  function handleStoryPressEnd() {
    const startedAt =
      storyPressStartedAtRef.current;

    if (!startedAt) {
      return;
    }

    const heldFor =
      Date.now() -
      startedAt;

    storyPressStartedAtRef.current =
      0;

    if (
      heldFor >=
      260
    ) {
      storySuppressTapRef.current =
        true;
    }

    setStoryPaused(
      false
    );
  }

  function handleStoryPressCancel() {
    storyPressStartedAtRef.current =
      0;

    setStoryPaused(
      false
    );
  }

  function handleStoryZoneClick(
    direction
  ) {
    if (
      storySuppressTapRef.current
    ) {
      storySuppressTapRef.current =
        false;

      return;
    }

    if (
      direction ===
      "previous"
    ) {
      goToPreviousStory();

      return;
    }

    goToNextStory();
  }

  function handleStoryTouchStart(
    event
  ) {
    storyTouchStartRef.current =
      event.touches?.[0]
        ?.clientX ??
      null;
  }

  function handleStoryTouchEnd(
    event
  ) {
    const start =
      storyTouchStartRef.current;

    const end =
      event.changedTouches?.[0]
        ?.clientX;

    storyTouchStartRef.current =
      null;

    if (
      start == null ||
      end == null
    ) {
      return;
    }

    const delta =
      end - start;

    if (
      Math.abs(
        delta
      ) <
      45
    ) {
      return;
    }

    if (
      delta >
      0
    ) {
      goToPreviousStory();
    } else {
      goToNextStory();
    }
  }

  /* =======================================================
     CHAT OPEN
  ======================================================= */

  const openChat =
    async (chat) => {
      setActiveChatId(
        chat.id
      );

      setMobileDialogOpen(
        true
      );

      if (chat.unread) {
        const updated = {
          ...chat,
          unread: 0,
        };

        await saveChat(
          updated
        );

        setChats(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                chat.id
                  ? updated
                  : item
            )
        );
      }
    };

  function toggleNewChatMenu() {
    if (
      newChatOpen
    ) {
      setNewChatOpen(
        false
      );

      return;
    }

    const rect =
      newChatTriggerRef.current?.getBoundingClientRect();

    if (rect) {
      setNewChatPoint({
        top:
          Math.min(
            rect.bottom + 8,
            window.innerHeight -
              420
          ),
        right:
          Math.max(
            10,
            window.innerWidth -
              rect.right
          ),
      });
    }

    setNewChatOpen(
      true
    );
  }

  /* =======================================================
     CHAT LIST MANAGEMENT
  ======================================================= */

  function clearChatLongPress() {
    if (
      chatLongPressTimerRef.current
    ) {
      clearTimeout(
        chatLongPressTimerRef.current
      );

      chatLongPressTimerRef.current =
        null;
    }
  }

  function startChatLongPress(
    chat,
    event
  ) {
    if (
      event.pointerType ===
        "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    clearChatLongPress();

    chatLongPressTriggeredRef.current =
      false;

    chatLongPressStartRef.current = {
      x:
        event.clientX,
      y:
        event.clientY,
    };

    const x =
      event.clientX;
    const y =
      event.clientY;

    chatLongPressTimerRef.current =
      setTimeout(
        () => {
          chatLongPressTriggeredRef.current =
            true;

          setChatActionPoint({
            x,
            y,
          });

          setChatActionChatId(
            chat.id
          );

          if (
            navigator.vibrate
          ) {
            navigator.vibrate(
              10
            );
          }
        },
        480
      );
  }

  function moveChatLongPress(
    event
  ) {
    const start =
      chatLongPressStartRef.current;

    const distance =
      Math.hypot(
        event.clientX -
          start.x,
        event.clientY -
          start.y
      );

    if (
      distance >
      12
    ) {
      clearChatLongPress();
    }
  }

  function endChatLongPress() {
    clearChatLongPress();
  }

  function handleChatItemClick(
    chat
  ) {
    if (
      chatLongPressTriggeredRef.current
    ) {
      chatLongPressTriggeredRef.current =
        false;

      return;
    }

    openChat(
      chat
    );
  }

  async function updateChatState(
    chat,
    patch
  ) {
    if (!chat) {
      return;
    }

    const updated = {
      ...chat,
      ...patch,
    };

    await saveChat(
      updated
    );

    setChats(
      (previous) =>
        previous.map(
          (item) =>
            item.id ===
            chat.id
              ? updated
              : item
        )
    );

    setChatActionChatId(
      null
    );
  }

  async function toggleArchiveChat(
    chat
  ) {
    await updateChatState(
      chat,
      {
        archived:
          !chat.archived,
        hidden: false,
      }
    );
  }

  async function toggleHiddenChat(
    chat
  ) {
    await updateChatState(
      chat,
      {
        hidden:
          !chat.hidden,
        archived: false,
      }
    );
  }

  async function toggleMutedChat(
    chat
  ) {
    await updateChatState(
      chat,
      {
        muted:
          !chat.muted,
      }
    );
  }

  async function removeChatFromList(
    chat
  ) {
    if (!chat) {
      return;
    }

    await deleteChat(
      chat.id
    );

    setChats(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !==
            chat.id
        )
    );

    if (
      activeChatId ===
      chat.id
    ) {
      setActiveChatId(
        null
      );

      setMobileDialogOpen(
        false
      );
    }

    setChatActionChatId(
      null
    );
  }

  /* =======================================================
     DIRECT CHAT
  ======================================================= */

  const createDirectChat =
    async (
      personId
    ) => {
      let chat =
        chats.find(
          (item) =>
            item.type !==
              "group" &&
            item.personId ===
              personId
        );

      if (!chat) {
        chat = {
          id:
            `chat-${personId}`,
          type: "direct",
          personId,
          updatedAt:
            Date.now(),
          unread: 0,
          lastMessage:
            "Новий діалог",
        };

        await saveChat(
          chat
        );

        setChats(
          (previous) => [
            chat,
            ...previous,
          ]
        );
      }

      setActiveChatId(
        chat.id
      );

      setMobileDialogOpen(
        true
      );

      setNewChatOpen(
        false
      );
    };

  /* =======================================================
     GROUP
  ======================================================= */

  const createGroup =
    async ({
      title,
      members,
    }) => {
      const now =
        Date.now();

      const chat = {
        id:
          `group-${now}`,
        type: "group",
        title,
        initials:
          title[0]
            ?.toUpperCase() ||
          "Г",
        members,
        admins: ["me"],
        updatedAt: now,
        unread: 0,
        lastMessage:
          "Групу створено",
      };

      await saveChat(chat);

      const message = {
        id: createId(),
        chatId: chat.id,
        senderId: "me",
        type: "text",
        text:
          `Створено групу «${title}» 👋`,
        createdAt:
          Date.now(),
        system: true,
        pinned: false,
      };

      await saveMessage(
        message
      );

      setChats(
        (previous) => [
          chat,
          ...previous,
        ]
      );

      setActiveChatId(
        chat.id
      );

      setMessages([
        message,
      ]);

      setGroupOpen(false);

      setMobileDialogOpen(
        true
      );
    };

  /* =======================================================
     UPDATE PREVIEW
  ======================================================= */

  const updatePreview =
    async (
      chat,
      text
    ) => {
      if (!chat) {
        return;
      }

      const updated = {
        ...chat,
        lastMessage:
          text,
        updatedAt:
          Date.now(),
        unread: 0,
      };

      await saveChat(
        updated
      );

      setChats(
        (previous) =>
          previous
            .map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            )
            .sort(
              (a, b) =>
                (b.updatedAt ||
                  0) -
                (a.updatedAt ||
                  0)
            )
      );
    };

  /* =======================================================
     ATTACH
  ======================================================= */

  const selectAttachment = (
    file,
    type
  ) => {
    if (!file) {
      return;
    }

    if (
      attachment?.url
    ) {
      URL.revokeObjectURL(
        attachment.url
      );
    }

    setAttachment({
      file,
      type,
      url:
        URL.createObjectURL(
          file
        ),
    });

    setAttachOpen(
      false
    );
  };

  const removeAttachment =
    () => {
      if (
        attachment?.url
      ) {
        URL.revokeObjectURL(
          attachment.url
        );
      }

      setAttachment(null);
    };

  /* =======================================================
     SEND
  ======================================================= */

  const sendMessage =
    async () => {
      if (!activeChat) {
        return;
      }

      if (editing) {
        const text =
          draft.trim();

        if (!text) {
          return;
        }

        const updated = {
          ...editing,
          text,
          edited: true,
          editedAt:
            Date.now(),
        };

        await saveMessage(
          cleanMessage(
            updated
          )
        );

        setMessages(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            )
        );

        await updatePreview(
          activeChat,
          text
        );

        setDraft("");
        setEditing(null);

        return;
      }

      const text =
        draft.trim();

      if (
        !text &&
        !attachment
      ) {
        return;
      }

      const message = {
        id: createId(),
        chatId:
          activeChat.id,
        senderId: "me",
        type:
          attachment?.type ||
          "text",
        text,

        fileBlob:
          attachment?.file ||
          null,

        fileName:
          attachment?.file
            ?.name ||
          null,

        createdAt:
          Date.now(),

        pinned: false,
        myReaction: null,

        replyTo:
          replyTo
            ? {
                id:
                  replyTo.id,
                senderId:
                  replyTo.senderId,
                type:
                  replyTo.type,
                text:
                  replyTo.text ||
                  "",
              }
            : null,
      };

      await saveMessage(
        message
      );

      setMessages(
        (previous) => [
          ...previous,

          {
            ...message,

            fileUrl:
              attachment?.file
                ? URL.createObjectURL(
                    attachment.file
                  )
                : null,
          },
        ]
      );

      await updatePreview(
        activeChat,
        previewText(
          message
        )
      );

      setDraft("");
      setReplyTo(null);

      removeAttachment();

      setEmojiOpen(false);
    };

  /* =======================================================
     VOICE
  ======================================================= */

  const sendVoice =
    async (
      blob,
      duration
    ) => {
      if (!activeChat) {
        return;
      }

      const message = {
        id: createId(),
        chatId:
          activeChat.id,
        senderId: "me",
        type: "voice",
        text: "",
        fileBlob: blob,
        voiceDuration:
          duration,
        createdAt:
          Date.now(),
        pinned: false,

        replyTo:
          replyTo
            ? {
                id:
                  replyTo.id,
                senderId:
                  replyTo.senderId,
                text:
                  replyTo.text ||
                  "",
                type:
                  replyTo.type,
              }
            : null,
      };

      await saveMessage(
        message
      );

      setMessages(
        (previous) => [
          ...previous,

          {
            ...message,
            fileUrl:
              URL.createObjectURL(
                blob
              ),
          },
        ]
      );

      await updatePreview(
        activeChat,
        "🎙 Голосове"
      );

      setVoiceOpen(false);
      setReplyTo(null);
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const removeMessage =
    async (message) => {
      await deleteMessage(
        message.id
      );

      if (
        message.fileUrl
      ) {
        URL.revokeObjectURL(
          message.fileUrl
        );
      }

      setMessages(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              message.id
          )
      );
    };

  /* =======================================================
     REACTION
  ======================================================= */

  const react =
    async (
      id,
      emoji
    ) => {
      const message =
        messages.find(
          (item) =>
            item.id === id
        );

      if (!message) {
        return;
      }

      const updated = {
        ...message,

        myReaction:
          message.myReaction ===
          emoji
            ? null
            : emoji,
      };

      await saveMessage(
        cleanMessage(
          updated
        )
      );

      setMessages(
        (previous) =>
          previous.map(
            (item) =>
              item.id === id
                ? updated
                : item
          )
      );
    };

  /* =======================================================
     PIN
  ======================================================= */

  const togglePin =
    async (message) => {
      const newValue =
        !message.pinned;

      const updated =
        messages.map(
          (item) => ({
            ...item,

            pinned:
              item.id ===
              message.id
                ? newValue
                : false,
          })
        );

      setMessages(
        updated
      );

      for (
        const item of
        updated
      ) {
        await saveMessage(
          cleanMessage(
            item
          )
        );
      }
    };

  /* =======================================================
     FORWARD
  ======================================================= */

  const forward =
    async (
      targetChat
    ) => {
      if (!forwarding) {
        return;
      }

      const message = {
        ...cleanMessage(
          forwarding
        ),

        id: createId(),

        chatId:
          targetChat.id,

        senderId: "me",

        createdAt:
          Date.now(),

        pinned: false,

        myReaction: null,

        replyTo: null,

        forwardedFrom: {
          chatId:
            forwarding.chatId,

          senderId:
            forwarding.senderId,
        },
      };

      await saveMessage(
        message
      );

      await updatePreview(
        targetChat,
        `↪ ${previewText(
          message
        )}`
      );

      if (
        targetChat.id ===
        activeChatId
      ) {
        setMessages(
          (previous) => [
            ...previous,

            {
              ...message,

              fileUrl:
                message.fileBlob
                  ? URL.createObjectURL(
                      message.fileBlob
                    )
                  : null,
            },
          ]
        );
      }

      setForwarding(null);
    };

  /* =======================================================
     CONFERENCE
  ======================================================= */

  const startConference =
    async () => {
      if (!activeChat) {
        return;
      }

      if (
        activeChat.type ===
        "group"
      ) {
        const message = {
          id: createId(),
          chatId:
            activeChat.id,
          senderId: "me",
          type: "widget",

          widget: {
            type:
              "conference",

            title:
              chatTitle(
                activeChat
              ),

            memberCount:
              activeChat.members
                ?.length ||
              1,
          },

          createdAt:
            Date.now(),

          pinned: false,
        };

        await saveMessage(
          message
        );

        setMessages(
          (previous) => [
            ...previous,
            message,
          ]
        );

        await updatePreview(
          activeChat,
          "📹 Конференція"
        );
      }

      setCallMode(
        "video"
      );
    };

  const pinned =
    messages.find(
      (message) =>
        message.pinned
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {storyViewer &&
        currentStory &&
        currentStoryPerson &&
        createPortal(
          (
          <section
            className={`story-viewer ${
              storyPaused
                ? "is-paused"
                : ""
            }`.trim()}
            onPointerDown={
              handleStoryPressStart
            }
            onPointerUp={
              handleStoryPressEnd
            }
            onPointerCancel={
              handleStoryPressCancel
            }
            onContextMenu={(event) =>
              event.preventDefault()
            }
            onTouchStart={
              handleStoryTouchStart
            }
            onTouchEnd={
              handleStoryTouchEnd
            }
          >
            <div
              className="story-viewer-media"
              style={{
                "--story-background":
                  currentStory.background,
              }}
            >
              {currentStory.mediaUrl && (
                currentStory.type ===
                "video" ? (
                  <video
                    src={
                      currentStory.mediaUrl
                    }
                    autoPlay
                    muted
                    playsInline
                    loop
                  />
                ) : (
                  <img
                    src={
                      currentStory.mediaUrl
                    }
                    alt=""
                  />
                )
              )}
            </div>

            <div className="story-viewer-shade" />

            <div className="story-progress-row">
              {currentStorySet.map(
                (
                  story,
                  index
                ) => (
                  <span
                    key={
                      story.id
                    }
                  >
                    <i
                      style={{
                        width:
                          index <
                          storyViewer.storyIndex
                            ? "100%"
                            : index ===
                              storyViewer.storyIndex
                            ? `${storyProgress}%`
                            : "0%",
                      }}
                    />
                  </span>
                )
              )}
            </div>

            <div className="story-viewer-header">
              <button
                type="button"
                className="story-close"
                onClick={
                  closeStory
                }
                aria-label="Закрити історію"
              >
                <YatutIcon
                  name="close"
                  size={19}
                />
              </button>

              <div className="story-author">
                <span className="story-author-avatar">
                  {currentStoryPerson.avatar ? (
                    <img
                      src={
                        currentStoryPerson.avatar
                      }
                      alt=""
                    />
                  ) : (
                    currentStoryPerson.initials
                  )}
                </span>

                <div>
                  <strong>
                    {
                      currentStoryPerson.name
                    }
                  </strong>

                  <small>
                    {
                      currentStory.time
                    }
                  </small>
                </div>
              </div>

              <div
                ref={
                  storyMoreRef
                }
                className="story-more-wrap"
              >
                <button
                  type="button"
                  className="story-more"
                  onClick={() =>
                    setStoryMoreOpen(
                      (
                        previous
                      ) =>
                        !previous
                    )
                  }
                  aria-label="Дії з історією"
                >
                  <YatutIcon
                    name="more"
                    size={20}
                  />
                </button>

                {storyMoreOpen && (
                  <div className="story-more-popover">
                    <button
                      type="button"
                      onClick={() => {
                        setStoryMoreOpen(
                          false
                        );
                        closeStory();
                        createDirectChat(
                          currentStoryPerson.id
                        );
                      }}
                    >
                      <span>
                        <YatutIcon
                          name="friends"
                          size={16}
                        />
                      </span>

                      Профіль
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStoryMoreOpen(
                          false
                        )
                      }
                    >
                      <span>
                        <YatutIcon
                          name="volumeOff"
                          size={16}
                        />
                      </span>

                      Вимкнути історії
                    </button>

                    <button
                      type="button"
                      onClick={
                        shareStory
                      }
                    >
                      <span>
                        <YatutIcon
                          name="share"
                          size={16}
                        />
                      </span>

                      Переслати
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() =>
                        setStoryMoreOpen(
                          false
                        )
                      }
                    >
                      <span>
                        <YatutIcon
                          name="shield"
                          size={16}
                        />
                      </span>

                      Поскаржитися
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="story-hit-zone story-hit-left"
              onClick={() =>
                handleStoryZoneClick(
                  "previous"
                )
              }
              aria-label="Попередня історія"
            />

            <button
              type="button"
              className="story-hit-zone story-hit-right"
              onClick={() =>
                handleStoryZoneClick(
                  "next"
                )
              }
              aria-label="Наступна історія"
            />

            <div className="story-bottom">
              {currentStory.caption && (
                <p className="story-caption">
                  {
                    currentStory.caption
                  }
                </p>
              )}

              {storyReactionOpen && (
                <div className="story-reactions">
                  {REACTIONS.map(
                    (
                      emoji
                    ) => (
                      <button
                        key={
                          emoji
                        }
                        type="button"
                        onClick={() =>
                          sendStoryReaction(
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

              <div className="story-reply-bar">
                <input
                  value={
                    storyReply
                  }
                  onChange={(event) =>
                    setStoryReply(
                      event.target.value
                    )
                  }
                  onFocus={() =>
                    setStoryProgress(
                      (
                        previous
                      ) =>
                        previous
                    )
                  }
                  placeholder="Відповісти..."
                />

                <button
                  type="button"
                  className="story-reaction-button"
                  onClick={() =>
                    setStoryReactionOpen(
                      (
                        previous
                      ) =>
                        !previous
                    )
                  }
                  aria-label="Реакції"
                >
                  <YatutIcon
                    name="heart"
                    size={20}
                  />
                </button>

                <button
                  type="button"
                  className="story-share-button"
                  onClick={
                    shareStory
                  }
                  aria-label="Переслати історію"
                >
                  <YatutIcon
                    name="share"
                    size={19}
                  />
                </button>
              </div>
            </div>
          </section>
          ),
          document.body
        )}

      <section
        className={`messenger ${
          mobileDialogOpen
            ? "mobile-dialog-open"
            : ""
        } ${
          infoOpen
            ? "chat-info-open"
            : ""
        }`}
      >

        {/* LEFT */}

        <aside className="chat-list">

          <div className="chat-list-header">

            <div>
              <span>
                ЯТУТ
              </span>

              <h1>
                Чати
              </h1>
            </div>

            <div className="new-chat-wrapper">

              <button
                ref={
                  newChatTriggerRef
                }
                className="new-chat-button"
                onClick={
                  toggleNewChatMenu
                }
                aria-label="Новий чат"
              >
                <YatutIcon
                  name="edit"
                  size={18}
                />
              </button>

              {newChatOpen && (
                <div
                  ref={
                    newChatPopoverRef
                  }
                  className="chat-create-popover"
                  style={{
                    "--new-chat-top":
                      `${newChatPoint.top}px`,
                    "--new-chat-right":
                      `${newChatPoint.right}px`,
                  }}
                >

                  <button
                    onClick={() => {
                      setNewChatOpen(
                        false
                      );
                      setGroupOpen(
                        true
                      );
                    }}
                  >
                    <span className="create-chat-avatar group-create">
                      <YatutIcon
                        name="friends"
                        size={17}
                      />
                    </span>

                    <div>
                      <strong>
                        Нова група
                      </strong>

                      <small>
                        Створити спільний чат
                      </small>
                    </div>
                  </button>

                  {Object.values(
                    PEOPLE
                  )
                    .filter(
                      (person) =>
                        person.id !==
                        "me"
                    )
                    .map(
                      (person) => (
                        <button
                          key={
                            person.id
                          }
                          onClick={() =>
                            createDirectChat(
                              person.id
                            )
                          }
                        >
                          <span className="create-chat-avatar">
                            {
                              person.initials
                            }
                          </span>

                          <div>
                            <strong>
                              {
                                person.name
                              }
                            </strong>

                            <small>
                              @
                              {
                                person.username
                              }
                            </small>
                          </div>

                        </button>
                      )
                    )}

                </div>
              )}

            </div>

          </div>

          <label className="chat-search">

            <YatutIcon
              name="search"
              size={18}
            />

            <input
              value={
                chatSearch
              }
              onChange={(event) =>
                setChatSearch(
                  event.target
                    .value
                )
              }
              placeholder="Пошук"
            />

          </label>

          <section className="chat-activities-mobile">

            <div className="chat-mobile-section-title">
              Активні
            </div>

            <div className="chat-activity-row">

              {onlinePeople.map(
                (person) => (
                  <button
                    key={
                      person.id
                    }
                    type="button"
                    onClick={() =>
                      openStory(
                        person.id
                      )
                    }
                  >
                    <span
                      className={`chat-activity-avatar ${
                        `story-${getStoryRingStatus(
                          person
                        )}`
                      }`.trim()}
                    >
                      <span className="chat-avatar-media">
                        {person.avatar ? (
                          <img
                            src={
                              person.avatar
                            }
                            alt=""
                          />
                        ) : (
                          person.initials
                        )}
                      </span>
                    </span>

                    <small>
                      {
                        person.name.split(
                          " "
                        )[0]
                      }
                    </small>
                  </button>
                )
              )}

            </div>

          </section>

          <div className="chat-list-section-head">

            <strong>
              {chatListView ===
              "archive"
                ? "Архів"
                : chatListView ===
                  "hidden"
                ? "Приховані"
                : "Повідомлення"}
            </strong>

            <div className="chat-list-view-switch">

              <button
                type="button"
                className={
                  chatListView ===
                  "inbox"
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setChatListView(
                    "inbox"
                  );
                  setChatActionChatId(
                    null
                  );
                }}
              >
                Усі
              </button>

              {(archivedCount >
                0 ||
                chatListView ===
                  "archive") && (
                <button
                  type="button"
                  className={
                    chatListView ===
                    "archive"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setChatListView(
                      "archive"
                    );
                    setChatActionChatId(
                      null
                    );
                  }}
                >
                  Архів
                </button>
              )}

              {(hiddenCount >
                0 ||
                chatListView ===
                  "hidden") && (
                <button
                  type="button"
                  className={
                    chatListView ===
                    "hidden"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setChatListView(
                      "hidden"
                    );
                    setChatActionChatId(
                      null
                    );
                  }}
                >
                  Приховані
                </button>
              )}

            </div>

          </div>

          <div className="chat-items">

            {filteredChats.length ? (
              filteredChats.map(
                (chat) => (
                  <button
                    key={
                      chat.id
                    }
                    className={`chat-item ${
                      activeChatId ===
                      chat.id
                        ? "active"
                        : ""
                    } ${
                      chatActionChatId ===
                      chat.id
                        ? "context-open"
                        : ""
                    } ${
                      chat.muted
                        ? "is-muted"
                        : ""
                    }`.trim()}
                    onClick={() =>
                      handleChatItemClick(
                        chat
                      )
                    }
                    onPointerDown={(event) =>
                      startChatLongPress(
                        chat,
                        event
                      )
                    }
                    onPointerMove={
                      moveChatLongPress
                    }
                    onPointerUp={
                      endChatLongPress
                    }
                    onPointerCancel={
                      endChatLongPress
                    }
                    onPointerLeave={(event) => {
                      if (
                        event.pointerType ===
                        "mouse"
                      ) {
                        endChatLongPress();
                      }
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();

                      setChatActionPoint({
                        x:
                          event.clientX,
                        y:
                          event.clientY,
                      });

                      setChatActionChatId(
                        chat.id
                      );
                    }}
                  >

                    <div
                      className={`chat-avatar ${
                        chat.type ===
                        "group"
                          ? "group"
                          : ""
                      } ${
                        chat.personId &&
                        PEOPLE[
                          chat.personId
                        ]?.online
                          ? "is-online"
                          : ""
                      }`.trim()}
                    >
                      {chat.personId &&
                      PEOPLE[
                        chat.personId
                      ]?.avatar ? (
                        <img
                          src={
                            PEOPLE[
                              chat.personId
                            ].avatar
                          }
                          alt=""
                        />
                      ) : (
                        chatInitials(
                          chat
                        )
                      )}
                    </div>

                    <div className="chat-item-content">

                      <strong>
                        {chatTitle(
                          chat
                        )}
                      </strong>

                      <p>
                        {chat.communityId &&
                          "Спільнота · "}
                        {chat.lastMessage ||
                          "Діалог"}
                      </p>

                    </div>

                    <div className="chat-item-meta">

                      <time>
                        {formatChatListTime(
                          chat.updatedAt
                        )}
                      </time>

                      {chat.muted && (
                        <span className="chat-muted-indicator">
                          <YatutIcon
                            name="volumeOff"
                            size={13}
                          />
                        </span>
                      )}

                      {chat.unread >
                        0 && (
                        <span className="chat-unread">
                          {
                            chat.unread
                          }
                        </span>
                      )}

                    </div>

                  </button>
                )
              )
            ) : (
              <div className="chat-list-empty">
                <YatutIcon
                  name={
                    chatListView ===
                    "archive"
                      ? "archive"
                      : chatListView ===
                        "hidden"
                      ? "eyeOff"
                      : "chats"
                  }
                  size={24}
                />

                <strong>
                  {chatListView ===
                  "archive"
                    ? "Архів порожній"
                    : chatListView ===
                      "hidden"
                    ? "Немає прихованих чатів"
                    : "Чатів поки немає"}
                </strong>

                <span>
                  Утримуйте чат, щоб керувати ним.
                </span>
              </div>
            )}

          </div>

          {chatActionChat && (
            <div
              ref={
                chatActionRef
              }
              className="chat-list-action-popover"
              style={{
                "--chat-action-x":
                  `${chatActionPoint.x}px`,
                "--chat-action-y":
                  `${chatActionPoint.y}px`,
              }}
            >

              <div className="chat-list-action-head">

                <span className="chat-list-action-avatar">
                  {chatActionChat.personId &&
                  PEOPLE[
                    chatActionChat.personId
                  ]?.avatar ? (
                    <img
                      src={
                        PEOPLE[
                          chatActionChat.personId
                        ].avatar
                      }
                      alt=""
                    />
                  ) : (
                    chatInitials(
                      chatActionChat
                    )
                  )}
                </span>

                <div>
                  <strong>
                    {chatTitle(
                      chatActionChat
                    )}
                  </strong>

                  <small>
                    Керування чатом
                  </small>
                </div>

              </div>

              <div className="chat-list-action-separator" />

              <button
                type="button"
                onClick={() =>
                  toggleArchiveChat(
                    chatActionChat
                  )
                }
              >
                <span>
                  <YatutIcon
                    name="archive"
                    size={17}
                  />
                </span>

                {chatActionChat.archived
                  ? "Повернути з архіву"
                  : "Перемістити в архів"}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleHiddenChat(
                    chatActionChat
                  )
                }
              >
                <span>
                  <YatutIcon
                    name="eyeOff"
                    size={17}
                  />
                </span>

                {chatActionChat.hidden
                  ? "Показати чат"
                  : "Приховати"}
              </button>

              <button
                type="button"
                onClick={() =>
                  toggleMutedChat(
                    chatActionChat
                  )
                }
              >
                <span>
                  <YatutIcon
                    name="volumeOff"
                    size={17}
                  />
                </span>

                {chatActionChat.muted
                  ? "Увімкнути сповіщення"
                  : "Вимкнути сповіщення"}
              </button>

              <button
                type="button"
                className="danger"
                onClick={() =>
                  removeChatFromList(
                    chatActionChat
                  )
                }
              >
                <span>
                  <YatutIcon
                    name="trash"
                    size={17}
                  />
                </span>

                Видалити чат
              </button>

            </div>
          )}

        </aside>

        {/* DIALOG */}

        <section className="chat-dialog">

          {!activeChat ? (
            <div className="chat-empty-screen">

              <div>
                💬
              </div>

              <strong>
                Оберіть чат
              </strong>

              <span>
                Почніть спілкування у ЯТУТ
              </span>

            </div>
          ) : (
            <>

              <header className="chat-dialog-header">

                <div className="chat-dialog-left">

                  <button
                    className="chat-mobile-back"
                    onClick={() =>
                      setMobileDialogOpen(
                        false
                      )
                    }
                  >
                    ‹
                  </button>

                  <button
                    ref={
                      personTriggerRef
                    }
                    className="chat-dialog-person"
                    onClick={() =>
                      setInfoOpen(
                        !infoOpen
                      )
                    }
                  >

                    <div
                      className={`chat-header-avatar ${
                        activePerson?.online
                          ? "is-online"
                          : ""
                      }`.trim()}
                    >
                      {chatInitials(
                        activeChat
                      )}
                    </div>

                    <div>

                      <strong>
                        {chatTitle(
                          activeChat
                        )}
                      </strong>

                      <span>
                        {activeChat.communityId
                          ? "Спільнота"
                          : activeChat.type ===
                            "group"
                          ? `${
                              activeChat.members
                                ?.length ||
                              0
                            } учасників`
                          : activePerson
                              ?.online
                          ? "Онлайн"
                          : "Був(ла) нещодавно"}
                      </span>

                    </div>

                  </button>

                </div>

                <div className="chat-call-actions">

                  <button
                    onClick={() =>
                      setMessageSearchOpen(
                        !messageSearchOpen
                      )
                    }
                  >
                    🔎
                  </button>

                  <button
                    onClick={() =>
                      setCallMode(
                        "audio"
                      )
                    }
                  >
                    ☎
                  </button>

                  <button
                    onClick={
                      activeChat.type ===
                      "group"
                        ? startConference
                        : () =>
                            setCallMode(
                              "video"
                            )
                    }
                  >
                    📹
                  </button>

                  <button
                    ref={
                      infoTriggerRef
                    }
                    className="chat-more-button"
                    onClick={() =>
                      setInfoOpen(
                        !infoOpen
                      )
                    }
                    aria-label="Інформація про чат"
                  >
                    <YatutIcon
                      name="more"
                      size={20}
                    />
                  </button>

                </div>

              </header>

              {messageSearchOpen && (
                <div className="message-search-bar">

                  🔎

                  <input
                    autoFocus
                    value={
                      messageSearch
                    }
                    onChange={(event) =>
                      setMessageSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Пошук у переписці"
                  />

                  <span>
                    {
                      foundMessages.length
                    }{" "}
                    знайдено
                  </span>

                  <button
                    onClick={() => {
                      setMessageSearchOpen(
                        false
                      );
                      setMessageSearch(
                        ""
                      );
                    }}
                  >
                    ×
                  </button>

                </div>
              )}

              {pinned && (
                <button
                  className="pinned-message-bar"
                  onClick={() =>
                    document
                      .getElementById(
                        `message-${pinned.id}`
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                        block:
                          "center",
                      })
                  }
                >
                  📌

                  <div>
                    <strong>
                      Закріплене повідомлення
                    </strong>

                    <span>
                      {previewText(
                        pinned
                      )}
                    </span>
                  </div>

                </button>
              )}

              <div className="chat-messages">

                <div className="chat-day">
                  Сьогодні
                </div>

                {messages.map(
                  (message) => (
                    <MessageBubble
                      key={
                        message.id
                      }
                      message={
                        message
                      }
                      chat={
                        activeChat
                      }
                      person={
                        activePerson
                      }
                      search={
                        messageSearch
                      }
                      activeSearch={
                        Boolean(
                          messageSearch &&
                            message.text
                              ?.toLowerCase()
                              .includes(
                                messageSearch.toLowerCase()
                              )
                        )
                      }
                      onReply={(
                        message
                      ) => {
                        setEditing(
                          null
                        );
                        setDraft("");
                        setReplyTo(
                          message
                        );
                      }}
                      onEdit={(
                        message
                      ) => {
                        setReplyTo(
                          null
                        );
                        setEditing(
                          message
                        );
                        setDraft(
                          message.text
                        );
                      }}
                      onDelete={
                        removeMessage
                      }
                      onForward={
                        setForwarding
                      }
                      onPin={
                        togglePin
                      }
                      onReaction={
                        react
                      }
                      onJoinCall={() =>
                        setCallMode(
                          "video"
                        )
                      }
                    />
                  )
                )}

                <div
                  ref={
                    bottomRef
                  }
                />

              </div>

              {(replyTo ||
                editing) && (
                <div className="composer-context-bar">

                  <div>

                    <strong>
                      {editing
                        ? "Редагування"
                        : "Відповідь"}
                    </strong>

                    <span>
                      {editing?.text ||
                        replyTo?.text ||
                        "Вкладення"}
                    </span>

                  </div>

                  <button
                    onClick={() => {
                      setReplyTo(
                        null
                      );
                      setEditing(
                        null
                      );
                      setDraft("");
                    }}
                  >
                    ×
                  </button>

                </div>
              )}

              {attachment && (
                <div className="chat-attachment-preview">

                  <div>

                    {attachment.type ===
                    "image" ? (
                      <img
                        src={
                          attachment.url
                        }
                        alt=""
                      />
                    ) : attachment.type ===
                      "video" ? (
                      <video
                        src={
                          attachment.url
                        }
                      />
                    ) : (
                      <span>
                        📎
                      </span>
                    )}

                    <strong>
                      {
                        attachment.file
                          .name
                      }
                    </strong>

                  </div>

                  <button
                    onClick={
                      removeAttachment
                    }
                  >
                    ×
                  </button>

                </div>
              )}

              {voiceOpen ? (
                <footer className="chat-composer voice-mode">

                  <VoiceRecorder
                    onCancel={() =>
                      setVoiceOpen(
                        false
                      )
                    }
                    onSend={
                      sendVoice
                    }
                  />

                </footer>
              ) : (
                <footer className="chat-composer">

                  <input
                    ref={
                      imageRef
                    }
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      selectAttachment(
                        event.target
                          .files?.[0],
                        "image"
                      )
                    }
                  />

                  <input
                    ref={
                      videoRef
                    }
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      selectAttachment(
                        event.target
                          .files?.[0],
                        "video"
                      )
                    }
                  />

                  <input
                    ref={
                      fileRef
                    }
                    hidden
                    type="file"
                    onChange={(event) =>
                      selectAttachment(
                        event.target
                          .files?.[0],
                        "file"
                      )
                    }
                  />

                  <div
                    ref={
                      attachRef
                    }
                    className="chat-plus-wrap"
                  >

                    <button
                      className="chat-plus"
                      onClick={() => {
                        setAttachOpen(
                          !attachOpen
                        );
                        setEmojiOpen(
                          false
                        );
                      }}
                      aria-label="Додати"
                    >
                      <YatutIcon
                        name="plus"
                        size={20}
                      />
                    </button>

                    {attachOpen && (
                      <div className="yatut-attach-popover">
                        <div className="chat-attach-head">
                          <div>
                            <strong>
                              Додати
                            </strong>

                            <span>
                              Надішліть те, чим хочете поділитися
                            </span>
                          </div>

                          <button
                            type="button"
                            className="chat-attach-close"
                            onClick={() =>
                              setAttachOpen(
                                false
                              )
                            }
                            aria-label="Закрити"
                          >
                            <YatutIcon
                              name="close"
                              size={17}
                            />
                          </button>
                        </div>

                        <div className="chat-attach-grid">
                          <button
                            type="button"
                            onClick={() =>
                              imageRef.current?.click()
                            }
                          >
                            <span className="chat-attach-icon violet">
                              <YatutIcon
                                name="image"
                                size={20}
                              />
                            </span>

                            <strong>
                              Фото
                            </strong>

                            <small>
                              З галереї
                            </small>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              videoRef.current?.click()
                            }
                          >
                            <span className="chat-attach-icon blue">
                              <YatutIcon
                                name="video"
                                size={20}
                              />
                            </span>

                            <strong>
                              Відео
                            </strong>

                            <small>
                              Ролик або кліп
                            </small>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              fileRef.current?.click()
                            }
                          >
                            <span className="chat-attach-icon graphite">
                              <YatutIcon
                                name="homework"
                                size={20}
                              />
                            </span>

                            <strong>
                              Файл
                            </strong>

                            <small>
                              Документ
                            </small>
                          </button>

                          <button
                            type="button"
                          >
                            <span className="chat-attach-icon pink">
                              <YatutIcon
                                name="poll"
                                size={20}
                              />
                            </span>

                            <strong>
                              Опитування
                            </strong>

                            <small>
                              Запитайте друзів
                            </small>
                          </button>

                          <button
                            type="button"
                          >
                            <span className="chat-attach-icon green">
                              <YatutIcon
                                name="pin"
                                size={20}
                              />
                            </span>

                            <strong>
                              Місце
                            </strong>

                            <small>
                              Поділитися точкою
                            </small>
                          </button>

                          <button
                            type="button"
                          >
                            <span className="chat-attach-icon orange">
                              <YatutIcon
                                name="friends"
                                size={20}
                              />
                            </span>

                            <strong>
                              Контакт
                            </strong>

                            <small>
                              Надіслати профіль
                            </small>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  <textarea
                    value={draft}
                    onChange={(event) =>
                      setDraft(
                        event.target
                          .value
                      )
                    }
                    placeholder={
                      editing
                        ? "Редагувати повідомлення..."
                        : "Повідомлення..."
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                  />

                  <div
                    ref={
                      emojiRef
                    }
                    className="yatut-emoji-wrapper"
                  >

                    <button
                      className="chat-emoji"
                      onClick={() => {
                        setEmojiOpen(
                          !emojiOpen
                        );
                        setAttachOpen(
                          false
                        );
                      }}
                    aria-label="Смайли"
                    >
                      <YatutIcon
                        name="smile"
                        size={18}
                      />
                    </button>

                    {emojiOpen && (
                      <div className="yatut-emoji-popover">

                        <div className="yatut-emoji-top">
                          <strong>
                            Смайли
                          </strong>
                        </div>

                        <div className="yatut-emoji-grid">

                          {EMOJIS.map(
                            (
                              emoji,
                              index
                            ) => (
                              <button
                                key={
                                  index
                                }
                                onClick={() => {
                                  setDraft(
                                    (
                                      previous
                                    ) =>
                                      `${previous}${emoji}`
                                  );
                                  setEmojiOpen(
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

                      </div>
                    )}

                  </div>

                  {!editing && (
                    <button
                      className="chat-voice-button"
                      onClick={() => {
                        setVoiceOpen(
                          true
                        );
                        setEmojiOpen(
                          false
                        );
                        setAttachOpen(
                          false
                        );
                      }}
                    >
                      <YatutIcon
                        name="microphone"
                        size={19}
                      />
                    </button>
                  )}

                  <button
                    className="chat-send"
                    onClick={
                      sendMessage
                    }
                  >
                    {editing
                      ? "✓"
                      : "➤"}
                  </button>

                </footer>
              )}

            </>
          )}

        </section>

        {/* RIGHT INFO */}

        {activeChat &&
          infoOpen && (
          <aside
            ref={
              infoPanelRef
            }
            className="chat-info-panel"
          >

            <header className="chat-info-header">

              <strong>
                Інформація
              </strong>

              <button
                className="chat-info-close"
                onClick={() =>
                  setInfoOpen(
                    false
                  )
                }
                aria-label="Закрити"
              >
                <YatutIcon
                  name="close"
                  size={20}
                />
              </button>

            </header>

            <div className="chat-info-profile">

              <div
                className={`chat-info-avatar ${
                  activePerson?.online
                    ? "is-online"
                    : ""
                }`.trim()}
              >
                {chatInitials(
                  activeChat
                )}
              </div>

              <h3>
                {chatTitle(
                  activeChat
                )}
              </h3>

              <span>
                {activeChat.communityId
                  ? "Чат спільноти"
                  : activeChat.type ===
                    "group"
                  ? `${
                      activeChat.members
                        ?.length ||
                      0
                    } учасників`
                  : `@${
                      activePerson
                        ?.username ||
                      ""
                    }`}
              </span>

            </div>

            {activeChat.communityId && (
              <section className="chat-info-section">

                <button className="chat-info-primary-action">
                  👥 Відкрити спільноту
                </button>

                <button className="chat-info-row-button">
                  🔕 Сповіщення
                </button>

                <button className="chat-info-row-button">
                  🖼️ Медіа та файли
                </button>

                <button
                  className="chat-info-primary-action"
                  onClick={
                    startConference
                  }
                >
                  📹 Почати конференцію
                </button>

              </section>
            )}

            {!activeChat.communityId &&
              activeChat.type ===
                "group" && (
                <section className="chat-info-section">

                  <strong>
                    Учасники
                  </strong>

                  {(activeChat.members ||
                    []).map(
                    (id) => (
                      <div
                        className="chat-member-row"
                        key={id}
                      >

                        <div className="chat-member-avatar">
                          {PEOPLE[id]
                            ?.initials ||
                            "?"}
                        </div>

                        <div className="chat-member-name">

                          <strong>
                            {id ===
                            "me"
                              ? "Ви"
                              : PEOPLE[
                                  id
                                ]?.name ||
                                "Учасник"}
                          </strong>

                        </div>

                      </div>
                    )
                  )}

                  <button
                    className="chat-info-primary-action"
                    onClick={
                      startConference
                    }
                  >
                    📹 Почати конференцію
                  </button>

                </section>
              )}

            {activeChat.type !==
              "group" &&
              !activeChat.communityId && (
                <section className="chat-info-section chat-info-compact-actions">

                  <button className="chat-info-row-button">
                    <span className="chat-info-menu-icon">
                      <YatutIcon
                        name="friends"
                        size={17}
                      />
                    </span>

                    <span>
                      Відкрити профіль
                    </span>
                  </button>

                  <button className="chat-info-row-button">
                    <span className="chat-info-menu-icon">
                      <YatutIcon
                        name="notification"
                        size={17}
                      />
                    </span>

                    <span>
                      Вимкнути сповіщення
                    </span>
                  </button>

                  <button className="chat-info-row-button">
                    <span className="chat-info-menu-icon">
                      <YatutIcon
                        name="image"
                        size={17}
                      />
                    </span>

                    <span>
                      Медіа та файли
                    </span>
                  </button>

                  <button className="chat-info-row-button danger">
                    <span className="chat-info-menu-icon">
                      <YatutIcon
                        name="shield"
                        size={17}
                      />
                    </span>

                    <span>
                      Заблокувати
                    </span>
                  </button>

                </section>
              )}

          </aside>
        )}

      </section>

      {groupOpen && (
        <GroupModal
          onClose={() =>
            setGroupOpen(false)
          }
          onCreate={
            createGroup
          }
        />
      )}

      {forwarding && (
        <ForwardModal
          chats={chats}
          onClose={() =>
            setForwarding(null)
          }
          onForward={
            forward
          }
        />
      )}

      {callMode && (
        <CallModal
          chat={
            activeChat
          }
          mode={
            callMode
          }
          onClose={() =>
            setCallMode(null)
          }
        />
      )}
    </>
  );
}

export default Chats;