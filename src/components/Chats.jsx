import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
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
  },

  oleksandr: {
    id: "oleksandr",
    name: "Олександр Бондар",
    username: "bondar",
    initials: "О",
    online: true,
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
  },
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
          className="message-more-trigger"
          onClick={() => {
            setMenu(!menu);
            setReactions(false);
          }}
        >
          •••
        </button>

        {menu && (
          <div className="message-action-menu">

            <button
              onClick={() => {
                onReply(message);
                setMenu(false);
              }}
            >
              ↩️ Відповісти
            </button>

            <button
              onClick={() => {
                onForward(
                  message
                );
                setMenu(false);
              }}
            >
              ➡️ Переслати
            </button>

            <button
              onClick={() => {
                onPin(message);
                setMenu(false);
              }}
            >
              📌{" "}
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
                  ✏️ Редагувати
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
                🗑️ Видалити
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

  const imageRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const fileRef =
    useRef(null);

  const bottomRef =
    useRef(null);

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

  const filteredChats =
    useMemo(() => {
      const query =
        chatSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return chats;
      }

      return chats.filter(
        (chat) =>
          chatTitle(chat)
            .toLowerCase()
            .includes(query)
      );
    }, [
      chats,
      chatSearch,
    ]);

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
                className="new-chat-button"
                onClick={() =>
                  setNewChatOpen(
                    !newChatOpen
                  )
                }
              >
                +
              </button>

              {newChatOpen && (
                <div className="chat-create-popover">

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
                    👥 Нова група
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

            🔎

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
              placeholder="Пошук у чатах"
            />

          </label>

          <div className="chat-items">

            {filteredChats.map(
              (chat) => (
                <button
                  key={chat.id}
                  className={`chat-item ${
                    activeChatId ===
                    chat.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    openChat(
                      chat
                    )
                  }
                >

                  <div
                    className={`chat-avatar ${
                      chat.type ===
                      "group"
                        ? "group"
                        : ""
                    }`}
                  >
                    {chatInitials(
                      chat
                    )}

                    {chat.personId &&
                      PEOPLE[
                        chat.personId
                      ]?.online && (
                        <span />
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
                        "👥 "}
                      {chat.lastMessage ||
                        "Діалог"}
                    </p>

                  </div>

                  {chat.unread >
                    0 && (
                    <div className="chat-unread">
                      {
                        chat.unread
                      }
                    </div>
                  )}

                </button>
              )
            )}

          </div>

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
                    className="chat-dialog-person"
                    onClick={() =>
                      setInfoOpen(
                        !infoOpen
                      )
                    }
                  >

                    <div className="chat-header-avatar">
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
                    onClick={() =>
                      setInfoOpen(
                        !infoOpen
                      )
                    }
                  >
                    •••
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

                  <div className="chat-plus-wrap">

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
                    >
                      +
                    </button>

                    {attachOpen && (
                      <div className="yatut-attach-popover">

                        <button
                          onClick={() =>
                            imageRef.current?.click()
                          }
                        >
                          🖼️ Фото
                        </button>

                        <button
                          onClick={() =>
                            videoRef.current?.click()
                          }
                        >
                          🎥 Відео
                        </button>

                        <button
                          onClick={() =>
                            fileRef.current?.click()
                          }
                        >
                          📎 Файл
                        </button>

                        <button>
                          📊 Опитування
                        </button>

                        <button>
                          📍 Місце
                        </button>

                        <button>
                          👤 Контакт
                        </button>

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

                  <div className="yatut-emoji-wrapper">

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
                    >
                      😊
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
                                onClick={() =>
                                  setDraft(
                                    (
                                      previous
                                    ) =>
                                      `${previous}${emoji}`
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
                      🎙
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
          <aside className="chat-info-panel">

            <header className="chat-info-header">

              <strong>
                Інформація
              </strong>

              <button
                onClick={() =>
                  setInfoOpen(
                    false
                  )
                }
              >
                ×
              </button>

            </header>

            <div className="chat-info-profile">

              <div className="chat-info-avatar">
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
                <section className="chat-info-section">

                  <button className="chat-info-row-button">
                    👤 Відкрити профіль
                  </button>

                  <button className="chat-info-row-button">
                    🔕 Вимкнути сповіщення
                  </button>

                  <button className="chat-info-row-button">
                    🖼️ Медіа та файли
                  </button>

                  <button className="chat-info-row-button danger">
                    🚫 Заблокувати
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