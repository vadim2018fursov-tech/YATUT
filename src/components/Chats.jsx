import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import YatutIcon from "./YatutIcon";
import useYatutAutoAnimate from "../hooks/useYatutAutoAnimate";

import {
  nativeLightHaptic,
} from "../services/nativeFeedbackService";

import {
  captureNativePhoto,
  captureNativeVideo,
  isNativeMediaPicker,
  pickNativeMedia,
  revokeMediaPreview,
} from "../services/mediaPickerService";

import {
  deleteChat,
  deleteMessage,
  getChat,
  getChats,
  getMessages,
  saveChat,
  saveMessage,
} from "../storage/database";

import {
  createBackendGroupChat,
  deleteBackendMessage,
  editBackendMessage,
  getBackendOtherReadAt,
  listBackendChats,
  loadBackendMessages,
  markBackendChatRead,
  openBackendDirectChat,
  sendBackendMessage,
} from "../services/chatBackendService";

import {
  subscribeChatListRealtime,
  subscribeChatRealtime,
} from "../services/realtimeService";

import {
  deleteStorageObject,
  uploadChatMedia,
} from "../services/storageService";

import {
  loadBackendSettings,
} from "../services/settingsBackendService";

import {
  getBackendFriendPeople,
} from "../services/socialBackendService";

import {
  getBackendRelationships,
  setBackendBlocked,
} from "../services/socialBackendService";

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

const LEGACY_DEMO_CHAT_IDS =
  new Set([
    "chat-maria",
    "chat-oleksandr",
    "chat-sofia",
  ]);

const LEGACY_DEMO_PERSON_IDS =
  new Set([
    "maria",
    "oleksandr",
    "anastasia",
    "max",
    "sofia",
    "vlad",
    "yulia",
  ]);

function isLegacyDemoChat(
  chat
) {
  if (!chat) {
    return false;
  }

  return (
    LEGACY_DEMO_CHAT_IDS.has(
      chat.id
    ) ||
    LEGACY_DEMO_PERSON_IDS.has(
      chat.personId
    )
  );
}

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

function dedupeChatMessages(
  list = []
) {
  const byId =
    new Set();

  const recentByFingerprint =
    new Map();

  return [...list]
    .filter(Boolean)
    .sort(
      (
        left,
        right
      ) =>
        Number(
          left.createdAt ||
          0
        ) -
        Number(
          right.createdAt ||
          0
        )
    )
    .filter(
      (
        message
      ) => {
        const id =
          String(
            message.id ||
            ""
          );

        if (
          id &&
          byId.has(
            id
          )
        ) {
          return false;
        }

        if (id) {
          byId.add(
            id
          );
        }

        const fingerprint = [
          message.chatId ||
            "",
          message.senderId ||
            "",
          message.type ||
            "text",
          message.text ||
            "",
          message.mediaPath ||
            "",
          message.fileName ||
            "",
        ].join(
          "::"
        );

        const createdAt =
          Number(
            message.createdAt ||
            0
          );

        const previousAt =
          recentByFingerprint.get(
            fingerprint
          );

        if (
          previousAt &&
          createdAt &&
          Math.abs(
            createdAt -
              previousAt
          ) <=
            3000
        ) {
          return false;
        }

        if (createdAt) {
          recentByFingerprint.set(
            fingerprint,
            createdAt
          );
        }

        return true;
      }
    );
}

function appendUniqueMessage(
  list,
  message
) {
  return dedupeChatMessages([
    ...list,
    message,
  ]);
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
    chat.person
      ?.name ||
    chat.title ||
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
    chat.person
      ?.initials ||
    chat.initials ||
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

  const screenStreamRef =
    useRef(null);

  const [
    screenSharing,
    setScreenSharing,
  ] = useState(false);

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

      screenStreamRef.current
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

  const toggleScreenShare =
    async () => {
      if (
        screenSharing
      ) {
        screenStreamRef.current
          ?.getTracks()
          .forEach(
            (
              track
            ) =>
              track.stop()
          );

        screenStreamRef.current =
          null;

        setScreenSharing(
          false
        );

        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            streamRef.current;
        }

        return;
      }

      if (
        !navigator
          .mediaDevices
          ?.getDisplayMedia
      ) {
        setError(
          "Демонстрація екрана недоступна на цьому пристрої."
        );

        return;
      }

      try {
        const screen =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          });

        screenStreamRef.current =
          screen;

        setScreenSharing(
          true
        );

        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            screen;
        }

        const track =
          screen.getVideoTracks()
            ?.[0];

        if (track) {
          track.onended =
            () => {
              screenStreamRef.current =
                null;

              setScreenSharing(
                false
              );

              if (
                videoRef.current
              ) {
                videoRef.current.srcObject =
                  streamRef.current;
              }
            };
        }
      } catch (
        shareError
      ) {
        if (
          shareError?.name !==
          "NotAllowedError" &&
        shareError?.name !==
          "AbortError"
        ) {
          setError(
            "Не вдалося почати демонстрацію екрана."
          );
        }
      }
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

          <button
            type="button"
            className={
              screenSharing
                ? "active"
                : ""
            }
            onClick={
              toggleScreenShare
            }
            aria-label={
              screenSharing
                ? "Зупинити демонстрацію екрана"
                : "Показати екран"
            }
          >
            {screenSharing
              ? "⏹️"
              : "🖥️"}
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
    <div
      className={`voice-recorder ${
        error
          ? "has-error"
          : "is-recording"
      }`.trim()}
    >

      <button
        type="button"
        className="voice-cancel-button"
        onClick={
          cancel
        }
        aria-label="Скасувати запис"
      >
        <YatutIcon
          name="close"
          size={18}
        />
      </button>

      <div className="voice-recording-status">

        <span className="voice-live-dot active" />

        <div>
          <strong>
            {error
              ? "Мікрофон недоступний"
              : "Записуємо"}
          </strong>

          <span>
            {error ||
              formatDuration(
                duration
              )}
          </span>
        </div>

      </div>

      <div
        className="voice-wave"
        aria-hidden="true"
      >

        {Array.from({
          length: 18,
        }).map(
          (_, index) => (
            <span
              key={
                index
              }
              style={{
                "--voice-wave-i":
                  index,
              }}
            />
          )
        )}

      </div>

      <button
        type="button"
        className="voice-send-button"
        disabled={
          Boolean(error)
        }
        onClick={send}
        aria-label="Надіслати голосове"
      >
        <YatutIcon
          name="send"
          size={18}
        />
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
  people = [],
}) {
  const [
    title,
    setTitle,
  ] = useState("");

  const [
    selected,
    setSelected,
  ] = useState([]);

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

  const messageLongPressTimerRef =
    useRef(null);

  const messageLongPressStartRef =
    useRef({
      x: 0,
      y: 0,
    });

  function cancelMessageLongPress() {
    if (
      messageLongPressTimerRef.current
    ) {
      window.clearTimeout(
        messageLongPressTimerRef.current
      );

      messageLongPressTimerRef.current =
        null;
    }
  }

  function startMessageLongPress(
    event
  ) {
    if (
      event.target.closest(
        "button, a, input, audio, video"
      )
    ) {
      return;
    }

    messageLongPressStartRef.current = {
      x:
        event.clientX,
      y:
        event.clientY,
    };

    cancelMessageLongPress();

    messageLongPressTimerRef.current =
      window.setTimeout(
        () => {
          nativeLightHaptic();
          setReactions(
            false
          );
          setMenu(
            true
          );
        },
        420
      );
  }

  function moveMessageLongPress(
    event
  ) {
    const dx =
      Math.abs(
        event.clientX -
          messageLongPressStartRef.current.x
      );

    const dy =
      Math.abs(
        event.clientY -
          messageLongPressStartRef.current.y
      );

    if (
      dx > 12 ||
      dy > 12
    ) {
      cancelMessageLongPress();
    }
  }

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

  useEffect(() => {
    return () => {
      cancelMessageLongPress();
    };
  }, []);

  const mine =
    message.senderId ===
    "me";

  const sender =
    message.sender ||
    PEOPLE[
      message.senderId
    ];

  return (
    <motion.div
      id={`message-${message.id}`}
      layout
      initial={{
        opacity: 0,
        y: 9,
        x:
          mine
            ? 8
            : -8,
        scale: 0.985,
      }}
      animate={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -5,
        scale: 0.98,
      }}
      transition={{
        type: "spring",
        stiffness: 430,
        damping: 34,
        mass: 0.72,
      }}
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
          {(
            sender?.avatar ||
            person?.avatar
          ) ? (
            <img
              src={
                sender?.avatar ||
                person?.avatar
              }
              alt=""
            />
          ) : (
            sender?.initials ||
            person?.initials ||
            "?"
          )}
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

        <AnimatePresence>
          {menu && (
          <motion.div
            ref={
              menuRef
            }
            className="message-action-menu"
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 5,
              scale: 0.97,
            }}
            transition={{
              duration: 0.17,
            }}
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

          </motion.div>
          )}
        </AnimatePresence>

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

        <AnimatePresence>
          {reactions && (
          <motion.div
            className="message-reaction-popover"
            initial={{
              opacity: 0,
              y: 6,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 4,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 34,
            }}
          >

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

          </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileTap={{
            scale: 0.985,
          }}
          onPointerDown={
            startMessageLongPress
          }
          onPointerMove={
            moveMessageLongPress
          }
          onPointerUp={
            cancelMessageLongPress
          }
          onPointerCancel={
            cancelMessageLongPress
          }
          onContextMenu={(
            event
          ) => {
            event.preventDefault();
            nativeLightHaptic();
            setReactions(
              false
            );
            setMenu(
              true
            );
          }}
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

        </motion.div>

        <div className="message-time">

          {formatTime(
            message.createdAt
          )}

          {mine && (
            <span
              title={
                message.backend
                  ? message.read
                    ? "Прочитано"
                    : "Надіслано"
                  : "Надіслано"
              }
            >
              {message.backend
                ? message.read
                  ? "✓✓"
                  : "✓"
                : "✓✓"}
            </span>
          )}

        </div>

        <AnimatePresence>
          {message.myReaction && (
          <motion.button
            key={
              message.myReaction
            }
            className="message-reaction-saved"
            initial={{
              opacity: 0,
              scale: 0.55,
              y: 5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.6,
              y: 4,
            }}
            whileTap={{
              scale: 0.85,
            }}
            transition={{
              type: "spring",
              stiffness: 620,
              damping: 30,
            }}
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
          </motion.button>
          )}
        </AnimatePresence>

      </div>

    </motion.div>
  );
}

function mergeBackendChatSnapshot(
  previous = [],
  backendChats = []
) {
  const previousById =
    new Map(
      previous.map(
        (
          chat
        ) => [
          chat.id,
          chat,
        ]
      )
    );

  const incomingIds =
    new Set(
      backendChats.map(
        (
          chat
        ) =>
          chat.id
      )
    );

  const mergedIncoming =
    backendChats.map(
      (
        chat
      ) => {
        const cached =
          previousById.get(
            chat.id
          );

        return {
          ...cached,
          ...chat,
          archived:
            cached?.archived ||
            false,
          hidden:
            cached?.hidden ||
            false,
          muted:
            cached?.muted ||
            false,
        };
      }
    );

  const stableDirectChats =
    previous.filter(
      (
        chat
      ) =>
        chat?.backend &&
        chat.type ===
          "direct" &&
        !incomingIds.has(
          chat.id
        )
    );

  return [
    ...mergedIncoming,
    ...stableDirectChats,
  ].sort(
    (
      left,
      right
    ) =>
      Number(
        right.updatedAt ||
        0
      ) -
      Number(
        left.updatedAt ||
        0
      )
  );
}

/* =========================================================
   CHATS
========================================================= */

function Chats({
  initialPersonId = null,
  onNavigate,
  authSession = null,
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
    backendPeople,
    setBackendPeople,
  ] = useState([]);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    draft,
    setDraft,
  ] = useState("");

  const [
    sending,
    setSending,
  ] = useState(false);

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
    chatToast,
    setChatToast,
  ] = useState("");

  const [
    mobileDialogOpen,
    setMobileDialogOpen,
  ] = useState(
    Boolean(
      initialPersonId
    )
  );

  const [
    remoteTyping,
    setRemoteTyping,
  ] =
    useState(false);

  const [
    remoteOnline,
    setRemoteOnline,
  ] =
    useState(false);

  const [
    ,
    setRealtimeStatus,
  ] =
    useState(
      "idle"
    );

  const [
    otherReadAt,
    setOtherReadAt,
  ] =
    useState(
      null
    );

  const [
    shareLiveActivity,
    setShareLiveActivity,
  ] =
    useState(
      false
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
    storyDragY,
    setStoryDragY,
  ] = useState(0);

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

  const nativeMediaAvailable =
    isNativeMediaPicker();

  const [
    chatItemsAnimateRef,
  ] = useYatutAutoAnimate({
    duration: 210,
  });

  const bottomRef =
    useRef(null);

  const messagesRef =
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

  useEffect(() => {
    const viewport =
      window.visualViewport;

    function syncVisualViewport() {
      const height =
        viewport?.height ||
        window.innerHeight;

      const width =
        viewport?.width ||
        window.innerWidth;

      const offsetTop =
        viewport?.offsetTop ||
        0;

      const offsetLeft =
        viewport?.offsetLeft ||
        0;

      document.documentElement.style.setProperty(
        "--yatut-visual-viewport-height",
        `${Math.round(
          height
        )}px`
      );

      document.documentElement.style.setProperty(
        "--yatut-visual-viewport-width",
        `${Math.round(
          width
        )}px`
      );

      document.documentElement.style.setProperty(
        "--yatut-visual-viewport-top",
        `${Math.round(
          offsetTop
        )}px`
      );

      document.documentElement.style.setProperty(
        "--yatut-visual-viewport-left",
        `${Math.round(
          offsetLeft
        )}px`
      );
    }

    syncVisualViewport();

    viewport?.addEventListener(
      "resize",
      syncVisualViewport
    );

    viewport?.addEventListener(
      "scroll",
      syncVisualViewport
    );

    window.addEventListener(
      "orientationchange",
      syncVisualViewport
    );

    window.addEventListener(
      "resize",
      syncVisualViewport
    );

    return () => {
      viewport?.removeEventListener(
        "resize",
        syncVisualViewport
      );

      viewport?.removeEventListener(
        "scroll",
        syncVisualViewport
      );

      window.removeEventListener(
        "orientationchange",
        syncVisualViewport
      );

      window.removeEventListener(
        "resize",
        syncVisualViewport
      );
    };
  }, []);


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

  const realtimeChannelRef =
    useRef(null);

  const sendInFlightRef =
    useRef(false);

  const typingSendTimerRef =
    useRef(null);

  const typingStopTimerRef =
    useRef(null);

  const remoteTypingTimerRef =
    useRef(null);

  const activeChat =
    chats.find(
      (chat) =>
        chat.id ===
        activeChatId
    );

  const activePerson =
    activeChat?.personId
      ? backendPeople.find(
          (
            person
          ) =>
            person.id ===
            activeChat.personId
        ) ||
        activeChat.person ||
        PEOPLE[
          activeChat.personId
        ] ||
        null
      : null;

  function activeChatIsVisible() {
    return (
      window.innerWidth >
        767 ||
      mobileDialogOpen
    );
  }

  useEffect(() => {
    if (
      !authSession?.user?.id ||
      !activeChat?.backend ||
      !activeChat?.personId
    ) {
      setShareLiveActivity(
        false
      );

      return undefined;
    }

    let active =
      true;

    Promise.all([
      loadBackendSettings(
        authSession
      ),
      getBackendRelationships(
        authSession
      ),
    ])
      .then(
        ([
          settings,
          relationships,
        ]) => {
          if (
            !active
          ) {
            return;
          }

          const visibility =
            settings?.onlineVisibility ||
            "friends";

          const relation =
            relationships?.[
              activeChat.personId
            ];

          setShareLiveActivity(
            visibility ===
              "everyone" ||
            (
              visibility ===
                "friends" &&
              relation?.friendStatus ===
                "friends"
            )
          );
        }
      )
      .catch(
        (
          error
        ) => {
          console.warn(
            "CHAT PRIVACY LOAD ERROR:",
            error
          );

          if (
            active
          ) {
            setShareLiveActivity(
              false
            );
          }
        }
      );

    return () => {
      active =
        false;
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
    activeChat?.id,
    activeChat?.backend,
    activeChat?.personId,
  ]);

  function showChatToast(
    text
  ) {
    setChatToast(
      text
    );

    window.setTimeout(
      () =>
        setChatToast(
          ""
        ),
      1700
    );
  }

  async function toggleActiveChatMute() {
    if (!activeChat) {
      return;
    }

    const nextMuted =
      !activeChat.muted;

    await toggleMutedChat(
      activeChat
    );

    showChatToast(
      nextMuted
        ? "Сповіщення вимкнено"
        : "Сповіщення увімкнено"
    );
  }

  async function toggleActiveChatBlock() {
    if (!activeChat) {
      return;
    }

    const blocked =
      !activeChat.blocked;

    try {
      if (
        activeChat.backend &&
        activeChat.personId &&
        authSession?.user?.id
      ) {
        await setBackendBlocked(
          authSession,
          activeChat.personId,
          blocked
        );
      }

      await updateChatState(
        activeChat,
        {
          blocked,
        }
      );

      setChats(
        (
          previous
        ) =>
          previous.map(
            (
              chat
            ) =>
              chat.id ===
              activeChat.id
                ? {
                    ...chat,
                    blocked,
                  }
                : chat
          )
      );

      showChatToast(
        blocked
          ? "Користувача заблоковано"
          : "Користувача розблоковано"
      );
    } catch (
      error
    ) {
      console.warn(
        "CHAT BLOCK ERROR:",
        error
      );

      showChatToast(
        error?.message ||
        "Не вдалося змінити блокування"
      );
    }
  }

  function openActiveCommunity() {
    if (
      !activeChat
        ?.communityId
    ) {
      return;
    }

    setInfoOpen(
      false
    );

    onNavigate?.(
      "communities",
      {
        communityId:
          activeChat.communityId,
      }
    );
  }

  function openActiveProfile() {
    if (
      !activeChat
        ?.personId
    ) {
      return;
    }

    setInfoOpen(
      false
    );

    onNavigate?.(
      "friends",
      {
        personId:
          activeChat.personId,
      }
    );
  }

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

    setStoryDragY(
      0
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

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      setBackendPeople(
        []
      );

      return undefined;
    }

    let active =
      true;

    getBackendFriendPeople(
      authSession,
      20
    )
      .then(
        (
          people
        ) => {
          if (
            active
          ) {
            setBackendPeople(
              people
            );
          }
        }
      )
      .catch(
        (
          error
        ) => {
          console.warn(
            "CHAT FRIEND PEOPLE LOAD ERROR:",
            error
          );
        }
      );

    return () => {
      active =
        false;
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
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

          stored =
            stored
              .map(
                (
                  chat
                ) => ({
                  ...chat,
                  type:
                    chat.type ||
                    "direct",
                })
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  (b.updatedAt ||
                    0) -
                  (a.updatedAt ||
                    0)
              );

          const demoIds =
            LEGACY_DEMO_CHAT_IDS;

          /*
            Никогда не смешиваем гостевые demo-чаты
            и реальные разговоры авторизованного аккаунта.
          */
          if (
            authSession?.user?.id
          ) {
            setChats(
              []
            );

            setActiveChatId(
              null
            );

            await Promise.all(
              Array.from(
                LEGACY_DEMO_CHAT_IDS
              ).map(
                (
                  chatId
                ) =>
                  deleteChat(
                    chatId
                  ).catch(
                    () => {}
                  )
              )
            );

            stored =
              stored.filter(
                (
                  chat
                ) =>
                  chat?.backend &&
                  !demoIds.has(
                    chat.id
                  ) &&
                  !isLegacyDemoChat(
                    chat
                  )
              );

            const backendChats =
              await listBackendChats(
                authSession
              );

            stored =
              mergeBackendChatSnapshot(
                stored,
                backendChats
              );

            await Promise.all(
              backendChats.map(
                (
                  chat
                ) =>
                  saveChat(
                    chat
                  )
              )
            );
          } else {
            /*
              Production never injects demo chats.
              Also purge stale demo rows left by older builds.
            */
            await Promise.all(
              Array.from(
                LEGACY_DEMO_CHAT_IDS
              ).map(
                (
                  chatId
                ) =>
                  deleteChat(
                    chatId
                  ).catch(
                    () => {}
                  )
              )
            );

            stored = [];
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
            requestedChatId &&
            !(
              authSession?.user?.id &&
              LEGACY_DEMO_CHAT_IDS.has(
                requestedChatId
              )
            )
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

            const backendTarget =
              Boolean(
                authSession
                  ?.user?.id
              ) &&
              /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(
                initialPersonId
              );

            if (
              backendTarget
            ) {
              chat =
                await openBackendDirectChat(
                  authSession,
                  initialPersonId
                );

              if (
                chat
              ) {
                await saveChat(
                  chat
                );

                stored = [
                  chat,
                  ...stored.filter(
                    (
                      item
                    ) =>
                      item.id !==
                      chat.id
                  ),
                ];

                setChats(
                  stored
                );
              }
            } else if (
              !chat &&
              !authSession?.user?.id
            ) {
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

            if (
              chat
            ) {
              setActiveChatId(
                chat.id
              );

              setMobileDialogOpen(
                true
              );

              requestHandled =
                true;
            }
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
  }, [
    authSession?.user?.id,
    authSession?.access_token,
    initialPersonId,
  ]);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      return undefined;
    }

    let active =
      true;

    let refreshTimer =
      null;

    async function refreshBackendChatList() {
      try {
        const backendChats =
          await listBackendChats(
            authSession
          );

        if (
          !active
        ) {
          return;
        }

        setChats(
          (
            previous
          ) =>
            mergeBackendChatSnapshot(
              previous,
              backendChats
            )
        );
      } catch (
        error
      ) {
        console.warn(
          "BACKEND CHAT LIST REALTIME ERROR:",
          error
        );
      }
    }

    const channel =
      subscribeChatListRealtime({
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
                refreshBackendChatList,
                80
              );
          },
        onStatus:
          (
            status
          ) => {
            if (
              status ===
              "error"
            ) {
              console.warn(
                "CHAT LIST REALTIME DEGRADED"
              );
            }
          },
      });

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

      channel.close();
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  /* =======================================================
     PERSON AFTER ALREADY MOUNTED
  ======================================================= */

  useEffect(() => {
    if (
      !initialPersonId
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

        const backendTarget =
          Boolean(
            authSession
              ?.user?.id
          ) &&
          /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(
            initialPersonId
          );

        if (
          backendTarget
        ) {
          try {
            chat =
              await openBackendDirectChat(
                authSession,
                initialPersonId
              );

            if (
              chat
            ) {
              await saveChat(
                chat
              );

              setChats(
                (
                  previous
                ) => [
                  chat,
                  ...previous.filter(
                    (
                      item
                    ) =>
                      item.id !==
                      chat.id
                  ),
                ]
              );
            }
          } catch (
            error
          ) {
            console.warn(
              "BACKEND CHAT OPEN ERROR:",
              error
            );

            showChatToast(
              "Не вдалося відкрити чат"
            );

            return;
          }
        } else if (
          !chat &&
          !authSession?.user?.id
        ) {
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
        } else if (
          authSession?.user?.id &&
          !backendTarget
        ) {
          if (
            LEGACY_DEMO_PERSON_IDS.has(
              initialPersonId
            )
          ) {
            await deleteChat(
              `chat-${initialPersonId}`
            ).catch(
              () => {}
            );
          }

          return;
        }

        if (
          chat
        ) {
          setActiveChatId(
            chat.id
          );

          setMobileDialogOpen(
            true
          );
        }
      };

    open();
  }, [
    initialPersonId,
    authSession,
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
            null;

          let readAt =
            null;

          if (
            activeChat?.backend &&
            authSession?.user?.id
          ) {
            [
              stored,
              readAt,
            ] =
              await Promise.all([
                loadBackendMessages(
                  authSession,
                  activeChatId
                ),
                getBackendOtherReadAt(
                  authSession,
                  activeChatId
                ),
              ]);

            setOtherReadAt(
              readAt
            );

            if (
              document.visibilityState ===
                "visible" &&
              activeChatIsVisible()
            ) {
              markBackendChatRead(
                authSession,
                activeChatId
              ).catch(
                (
                  error
                ) => {
                  console.warn(
                    "BACKEND READ MARK ERROR:",
                    error
                  );
                }
              );
            }
          } else {
            stored =
              await getMessages(
                activeChatId
              );

            setOtherReadAt(
              null
            );
          }

          setMessages(
            dedupeChatMessages(
              stored.map(
                (message) => ({
                ...message,

                read:
                  message.backend &&
                  message.senderId ===
                    "me"
                    ? Boolean(
                        readAt &&
                        Number(
                          message.createdAt
                        ) <=
                          Number(
                            readAt
                          )
                      )
                    : message.read,

                fileUrl:
                  message.fileBlob
                    ? URL.createObjectURL(
                        message.fileBlob
                      )
                    : null,
              })
              )
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
    activeChat?.backend,
    authSession?.user?.id,
    authSession?.access_token,
    mobileDialogOpen,
  ]);

  useEffect(() => {
    if (
      !activeChat?.backend ||
      !authSession?.user?.id
    ) {
      setRemoteTyping(
        false
      );

      setRemoteOnline(
        false
      );

      setRealtimeStatus(
        "idle"
      );

      setOtherReadAt(
        null
      );

      return undefined;
    }

    let active =
      true;

    async function refreshMessages(
      {
        markRead =
          false,
      } = {}
    ) {
      try {
        const [
          latest,
          readAt,
        ] =
          await Promise.all([
            loadBackendMessages(
              authSession,
              activeChat.id
            ),
            getBackendOtherReadAt(
              authSession,
              activeChat.id
            ),
          ]);

        if (
          active
        ) {
          setOtherReadAt(
            readAt
          );

          setMessages(
            dedupeChatMessages(
              latest.map(
                (
                  message
                ) => ({
                ...message,
                read:
                  message.senderId ===
                    "me"
                    ? Boolean(
                        readAt &&
                        Number(
                          message.createdAt
                        ) <=
                          Number(
                            readAt
                          )
                      )
                    : message.read,
                })
              )
            )
          );
        }

        if (
          markRead &&
          document.visibilityState ===
            "visible" &&
          activeChatIsVisible()
        ) {
          await markBackendChatRead(
            authSession,
            activeChat.id
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "BACKEND REALTIME MESSAGE REFRESH ERROR:",
          error
        );
      }
    }

    async function refreshChatList() {
      try {
        const backendChats =
          await listBackendChats(
            authSession
          );

        if (
          !active
        ) {
          return;
        }

        setChats(
          (
            previous
          ) =>
            mergeBackendChatSnapshot(
              previous,
              backendChats
            )
        );
      } catch (
        error
      ) {
        console.warn(
          "BACKEND REALTIME CHAT LIST ERROR:",
          error
        );
      }
    }

    const channel =
      subscribeChatRealtime({
        session:
          authSession,
        conversationId:
          activeChat.id,
        sharePresence:
          shareLiveActivity,
        onChange:
          (
            change
          ) => {
            if (
              change?.table ===
              "conversation_members"
            ) {
              refreshMessages({
                markRead:
                  false,
              });

              return;
            }

            refreshMessages({
              markRead:
                true,
            });

            refreshChatList();
          },
        onTyping:
          (
            payload
          ) => {
            if (
              payload?.userId !==
              activeChat.personId
            ) {
              return;
            }

            const typing =
              Boolean(
                payload.typing
              );

            setRemoteTyping(
              typing
            );

            if (
              remoteTypingTimerRef.current
            ) {
              window.clearTimeout(
                remoteTypingTimerRef.current
              );
            }

            if (
              typing
            ) {
              remoteTypingTimerRef.current =
                window.setTimeout(
                  () =>
                    setRemoteTyping(
                      false
                    ),
                  2800
                );
            }
          },
        onPresence:
          (
            eventName,
            payload
          ) => {
            const personId =
              activeChat.personId;

            if (
              !personId
            ) {
              return;
            }

            if (
              eventName ===
              "presence_state"
            ) {
              setRemoteOnline(
                Boolean(
                  payload?.[
                    personId
                  ]
                )
              );

              return;
            }

            if (
              payload?.joins?.[
                personId
              ]
            ) {
              setRemoteOnline(
                true
              );
            }

            if (
              payload?.leaves?.[
                personId
              ]
            ) {
              setRemoteOnline(
                false
              );

              setRemoteTyping(
                false
              );
            }
          },
        onStatus:
          (
            status
          ) => {
            if (
              active
            ) {
              setRealtimeStatus(
                status
              );
            }
          },
      });

    realtimeChannelRef.current =
      channel;

    // Slow safety refresh only; normal delivery is WebSocket-based.
    const fallbackTimer =
      window.setInterval(
        () => {
          refreshMessages({
            markRead:
              false,
          });
          refreshChatList();
        },
        15000
      );

    return () => {
      active =
        false;

      window.clearInterval(
        fallbackTimer
      );

      channel.close();

      if (
        realtimeChannelRef.current ===
        channel
      ) {
        realtimeChannelRef.current =
          null;
      }

      if (
        remoteTypingTimerRef.current
      ) {
        window.clearTimeout(
          remoteTypingTimerRef.current
        );

        remoteTypingTimerRef.current =
          null;
      }

      setRemoteTyping(
        false
      );

      setRemoteOnline(
        false
      );
    };
  }, [
    activeChat?.id,
    activeChat?.backend,
    activeChat?.personId,
    authSession?.user?.id,
    authSession?.access_token,
    shareLiveActivity,
    mobileDialogOpen,
  ]);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      return undefined;
    }

    let active =
      true;

    const refreshChats =
      async () => {
        try {
          const backendChats =
            await listBackendChats(
              authSession
            );

          if (
            !active
          ) {
            return;
          }

          setChats(
            [
              ...backendChats,
            ].sort(
              (
                left,
                right
              ) =>
                Number(
                  right.updatedAt ||
                  0
                ) -
                Number(
                  left.updatedAt ||
                  0
                )
            )
          );
        } catch (
          error
        ) {
          console.warn(
            "BACKEND CHAT LIST REFRESH ERROR:",
            error
          );
        }
      };

    const timer =
      window.setInterval(
        refreshChats,
        15000
      );

    return () => {
      active =
        false;

      window.clearInterval(
        timer
      );
    };
  }, [
    authSession,
  ]);

  useEffect(() => {
    if (
      !activeChat?.backend ||
      !authSession?.user?.id ||
      !shareLiveActivity ||
      editing
    ) {
      return undefined;
    }

    if (
      typingSendTimerRef.current
    ) {
      window.clearTimeout(
        typingSendTimerRef.current
      );
    }

    if (
      typingStopTimerRef.current
    ) {
      window.clearTimeout(
        typingStopTimerRef.current
      );
    }

    const typing =
      Boolean(
        draft.trim()
      );

    typingSendTimerRef.current =
      window.setTimeout(
        () => {
          realtimeChannelRef.current
            ?.sendTyping(
              typing
            );
        },
        180
      );

    if (
      typing
    ) {
      typingStopTimerRef.current =
        window.setTimeout(
          () => {
            realtimeChannelRef.current
              ?.sendTyping(
                false
              );
          },
          1600
        );
    }

    return () => {
      if (
        typingSendTimerRef.current
      ) {
        window.clearTimeout(
          typingSendTimerRef.current
        );
      }

      if (
        typingStopTimerRef.current
      ) {
        window.clearTimeout(
          typingStopTimerRef.current
        );
      }
    };
  }, [
    draft,
    editing,
    activeChat?.id,
    activeChat?.backend,
    authSession?.user?.id,
    shareLiveActivity,
  ]);

  useEffect(() => {
    const container =
      messagesRef.current;

    if (!container) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          container.scrollTop =
            container.scrollHeight;
        }
      );

    return () =>
      window.cancelAnimationFrame(
        frame
      );
  }, [
    messages.length,
    activeChatId,
  ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const productionChats =
    useMemo(
      () => {
        if (
          !authSession?.user?.id
        ) {
          return [];
        }

        return chats.filter(
          (
            chat
          ) =>
            !isLegacyDemoChat(
              chat
            )
        );
      },
      [
        chats,
        authSession?.user?.id,
      ]
    );

  const archivedCount =
    productionChats.filter(
      (chat) =>
        chat.archived &&
        !chat.hidden
    ).length;

  const hiddenCount =
    productionChats.filter(
      (chat) =>
        chat.hidden
    ).length;

  const onlinePeople =
    useMemo(
      () => {
        if (
          authSession?.user?.id
        ) {
          return backendPeople.slice(
            0,
            7
          );
        }

        return [];
      },
      [
        authSession?.user?.id,
        backendPeople,
      ]
    );

  const storyPeople =
    useMemo(
      () => {
        if (
          authSession?.user?.id
        ) {
          return [];
        }

        return [];
      },
      [
        authSession?.user?.id,
      ]
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
        productionChats.filter(
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
      productionChats,
      chatSearch,
      chatListView,
    ]);

  const chatActionChat =
    productionChats.find(
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

    setStoryDragY(
      0
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
    const touch =
      event.touches?.[0];

    if (!touch) {
      storyTouchStartRef.current =
        null;

      return;
    }

    storyTouchStartRef.current = {
      x:
        touch.clientX,
      y:
        touch.clientY,
    };
  }

  function handleStoryTouchMove(
    event
  ) {
    const start =
      storyTouchStartRef.current;

    const touch =
      event.touches?.[0];

    if (
      !start ||
      !touch
    ) {
      return;
    }

    const deltaX =
      touch.clientX -
      start.x;

    const deltaY =
      touch.clientY -
      start.y;

    const horizontalDistance =
      Math.abs(
        deltaX
      );

    if (
      deltaY >
        0 &&
      deltaY >
        horizontalDistance *
          1.05
    ) {
      const drag =
        Math.min(
          deltaY,
          180
        );

      setStoryDragY(
        drag
      );

      storySuppressTapRef.current =
        true;
    }
  }

  function handleStoryTouchEnd(
    event
  ) {
    const start =
      storyTouchStartRef.current;

    const touch =
      event.changedTouches?.[0];

    storyTouchStartRef.current =
      null;

    if (
      !start ||
      !touch
    ) {
      return;
    }

    const deltaX =
      touch.clientX -
      start.x;

    const deltaY =
      touch.clientY -
      start.y;

    const horizontalDistance =
      Math.abs(
        deltaX
      );

    const verticalDistance =
      Math.abs(
        deltaY
      );

    if (
      deltaY >
        72 &&
      verticalDistance >
        horizontalDistance *
          1.15
    ) {
      storySuppressTapRef.current =
        true;

      closeStory();

      return;
    }

    setStoryDragY(
      0
    );

    if (
      horizontalDistance <
        45 ||
      horizontalDistance <=
        verticalDistance
    ) {
      return;
    }

    storySuppressTapRef.current =
      true;

    if (
      deltaX >
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

      const backendTarget =
        Boolean(
          authSession?.user?.id
        ) &&
        /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(
          personId
        );

      if (
        backendTarget
      ) {
        try {
          chat =
            await openBackendDirectChat(
              authSession,
              personId
            );

          if (
            chat
          ) {
            await saveChat(
              chat
            );

            setChats(
              (
                previous
              ) => [
                chat,
                ...previous.filter(
                  (
                    item
                  ) =>
                    item.id !==
                    chat.id
                ),
              ]
            );
          }
        } catch (
          error
        ) {
          console.warn(
            "DIRECT CHAT CREATE ERROR:",
            error
          );

          showChatToast(
            error?.message ||
            "Не вдалося відкрити чат"
          );

          return;
        }
      } else if (
        !chat
      ) {
        chat = {
          id:
            `chat-${personId}`,
          type:
            "direct",
          personId,
          updatedAt:
            Date.now(),
          unread:
            0,
          lastMessage:
            "Новий діалог",
        };

        await saveChat(
          chat
        );

        setChats(
          (
            previous
          ) => [
            chat,
            ...previous,
          ]
        );
      }

      if (
        !chat
      ) {
        return;
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
      if (
        authSession?.user?.id
      ) {
        try {
          const memberIds =
            members.filter(
              (id) =>
                id !==
                "me"
            );

          const chat =
            await createBackendGroupChat(
              authSession,
              title,
              memberIds
            );

          if (!chat) {
            throw new Error(
              "Не вдалося створити групу"
            );
          }

          await saveChat(
            chat
          );

          setChats(
            (previous) => [
              chat,
              ...previous.filter(
                (item) =>
                  item.id !==
                  chat.id
              ),
            ]
          );

          setActiveChatId(
            chat.id
          );

          setMessages(
            []
          );

          setGroupOpen(
            false
          );

          setMobileDialogOpen(
            true
          );

          return;
        } catch (
          error
        ) {
          console.warn(
            "BACKEND GROUP CREATE ERROR:",
            error
          );

          showChatToast(
            error?.message ||
            "Не вдалося створити групу"
          );

          return;
        }
      }

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
      file.size >
      50 *
        1024 *
        1024
    ) {
      showChatToast(
        "Файл має бути до 50 МБ"
      );

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

  const pickChatNativeMedia =
    async (
      type
    ) => {
      try {
        const selected =
          await pickNativeMedia(
            type
          );

        if (!selected) {
          return;
        }

        selectAttachment(
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
        showChatToast(
          error?.message ||
          "Не вдалося відкрити медіатеку"
        );
      }
    };

  const captureChatNativeMedia =
    async (
      type
    ) => {
      try {
        const selected =
          type ===
          "video"
            ? await captureNativeVideo()
            : await captureNativePhoto();

        if (!selected) {
          return;
        }

        selectAttachment(
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
        showChatToast(
          error?.message ||
          "Не вдалося відкрити камеру"
        );
      }
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
      if (
        !activeChat ||
        sendInFlightRef.current
      ) {
        return;
      }

      if (
        activeChat.blocked
      ) {
        showChatToast(
          "Спочатку розблокуйте користувача"
        );

        return;
      }

      sendInFlightRef.current =
        true;

      setSending(
        true
      );

      try {
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

        if (
          activeChat.backend &&
          authSession?.user?.id
        ) {
          await editBackendMessage(
            authSession,
            updated.id,
            text
          );
        } else {
          await saveMessage(
            cleanMessage(
              updated
            )
          );
        }

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

      if (
        activeChat.backend &&
        authSession?.user?.id
      ) {
        try {
          let uploaded =
            null;

          if (
            attachment?.file
          ) {
            uploaded =
              await uploadChatMedia(
                authSession,
                activeChat.id,
                attachment.file
              );
          }

          const backendMessage =
            await sendBackendMessage(
              authSession,
              activeChat.id,
              {
                text,
                kind:
                  attachment?.type ||
                  "text",
                replyToId:
                  replyTo?.backend
                    ? replyTo.id
                    : null,
                mediaPath:
                  uploaded?.path ||
                  null,
                fileName:
                  uploaded?.fileName ||
                  null,
                mimeType:
                  uploaded?.mimeType ||
                  null,
              }
            );

          if (
            backendMessage
          ) {
            setMessages(
              (
                previous
              ) =>
                appendUniqueMessage(
                  previous,
                  backendMessage
                )
            );

            await updatePreview(
              activeChat,
              previewText(
                backendMessage
              )
            );
          }

          setDraft("");
          setReplyTo(null);
          setEmojiOpen(false);
          removeAttachment();
        } catch (
          error
        ) {
          console.warn(
            "BACKEND MESSAGE SEND ERROR:",
            error
          );

          showChatToast(
            error?.message ||
            "Не вдалося надіслати повідомлення"
          );
        }

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
        (
          previous
        ) =>
          appendUniqueMessage(
            previous,
            {
              ...message,
              fileUrl:
                attachment?.file
                  ? URL.createObjectURL(
                      attachment.file
                    )
                  : null,
            }
          )
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
      } finally {
        sendInFlightRef.current =
          false;

        setSending(
          false
        );
      }
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

      if (
        activeChat.backend &&
        authSession?.user?.id
      ) {
        try {
          const voiceFile =
            new File(
              [
                blob,
              ],
              `voice-${Date.now()}.webm`,
              {
                type:
                  blob.type ||
                  "audio/webm",
              }
            );

          const uploaded =
            await uploadChatMedia(
              authSession,
              activeChat.id,
              voiceFile
            );

          const backendMessage =
            await sendBackendMessage(
              authSession,
              activeChat.id,
              {
                text:
                  "",
                kind:
                  "audio",
                replyToId:
                  replyTo?.backend
                    ? replyTo.id
                    : null,
                mediaPath:
                  uploaded?.path ||
                  null,
                fileName:
                  uploaded?.fileName ||
                  voiceFile.name,
                mimeType:
                  uploaded?.mimeType ||
                  voiceFile.type,
                durationMs:
                  Math.round(
                    Number(
                      duration ||
                      0
                    ) *
                      1000
                  ),
              }
            );

          if (
            backendMessage
          ) {
            setMessages(
              (
                previous
              ) =>
                appendUniqueMessage(
                  previous,
                  backendMessage
                )
            );

            await updatePreview(
              activeChat,
              "🎙 Голосове"
            );
          }

          setVoiceOpen(
            false
          );

          setReplyTo(
            null
          );
        } catch (
          error
        ) {
          console.warn(
            "BACKEND VOICE SEND ERROR:",
            error
          );

          showChatToast(
            error?.message ||
            "Не вдалося надіслати голосове"
          );
        }

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
      if (
        activeChat?.backend &&
        authSession?.user?.id &&
        message.backend
      ) {
        await deleteBackendMessage(
          authSession,
          message.id
        );

        if (
          message.mediaPath
        ) {
          deleteStorageObject(
            authSession,
            "chat-media",
            message.mediaPath
          ).catch(
            (
              error
            ) => {
              console.warn(
                "CHAT MEDIA DELETE ERROR:",
                error
              );
            }
          );
        }
      } else {
        await deleteMessage(
          message.id
        );
      }

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
      if (
        activeChat?.backend
      ) {
        showChatToast(
          "Реакції у хмарних чатах — наступний модуль"
        );

        return;
      }

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
      if (
        activeChat?.backend
      ) {
        showChatToast(
          "Закріплення у хмарних чатах — наступний модуль"
        );

        return;
      }

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
            style={{
              "--story-drag-y":
                `${storyDragY}px`,
              "--story-drag-scale":
                String(
                  1 -
                  Math.min(
                    storyDragY,
                    180
                  ) /
                    2200
                ),
            }}
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
            onTouchMove={
              handleStoryTouchMove
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

                  {(
                    authSession?.user?.id
                      ? backendPeople
                      : []
                  ).map(
                    (
                      person
                    ) => (
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
                          {person.avatar ? (
                            <img
                              src={
                                person.avatar
                              }
                              alt=""
                            />
                          ) : (
                            person.initials ||
                            person.initial ||
                            "Я"
                          )}
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
              {authSession?.user?.id
                ? "Друзі"
                : "Активні"}
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
                          person.initials ||
                          person.initial ||
                          "Я"
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

          <div
            ref={
              chatItemsAnimateRef
            }
            className="chat-items"
          >

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
                      {(
                        chat.person?.avatar ||
                        (
                          chat.personId &&
                          PEOPLE[
                            chat.personId
                          ]?.avatar
                        )
                      ) ? (
                        <img
                          src={
                            chat.person?.avatar ||
                            PEOPLE[
                              chat.personId
                            ]?.avatar
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
                  {
                    chatListView === "inbox" &&
                    authSession?.user?.id
                      ? "Додайте друзів і почніть першу розмову."
                      : "Утримуйте чат, щоб керувати ним."
                  }
                </span>

                {chatListView === "inbox" &&
                  authSession?.user?.id && (
                  <div className="chat-list-empty-actions">
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate?.(
                          "search"
                        )
                      }
                    >
                      <YatutIcon
                        name="search"
                        size={15}
                      />
                      Знайти людей
                    </button>

                    {backendPeople.length >= 2 && (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          setGroupOpen(
                            true
                          )
                        }
                      >
                        <YatutIcon
                          name="friends"
                          size={15}
                        />
                        Нова група
                      </button>
                    )}
                  </div>
                )}
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
                  {(
                    chatActionChat.person?.avatar ||
                    (
                      chatActionChat.personId &&
                      PEOPLE[
                        chatActionChat.personId
                      ]?.avatar
                    )
                  ) ? (
                    <img
                      src={
                        chatActionChat.person?.avatar ||
                        PEOPLE[
                          chatActionChat.personId
                        ]?.avatar
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
                        (
                          activeChat.backend
                            ? remoteOnline
                            : activePerson?.online
                        )
                          ? "is-online"
                          : ""
                      }`.trim()}
                    >
                      {activePerson?.avatar ? (
                        <img
                          src={
                            activePerson.avatar
                          }
                          alt=""
                        />
                      ) : (
                        chatInitials(
                          activeChat
                        )
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
                          : remoteTyping
                          ? "Друкує…"
                          : (
                              activeChat.backend
                                ? remoteOnline
                                : activePerson
                                    ?.online
                            )
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

              <div
                ref={
                  messagesRef
                }
                className="chat-messages"
              >

                <div className="chat-day">
                  Сьогодні
                </div>

                <AnimatePresence
                  initial={false}
                >
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
                </AnimatePresence>

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
                              nativeMediaAvailable
                                ? pickChatNativeMedia(
                                    "image"
                                  )
                                : imageRef.current?.click()
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
                              nativeMediaAvailable
                                ? pickChatNativeMedia(
                                    "video"
                                  )
                                : videoRef.current?.click()
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

                          {nativeMediaAvailable && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  captureChatNativeMedia(
                                    "image"
                                  )
                                }
                              >
                                <span className="chat-attach-icon violet">
                                  <YatutIcon
                                    name="image"
                                    size={20}
                                  />
                                </span>

                                <strong>
                                  Камера
                                </strong>

                                <small>
                                  Зняти фото
                                </small>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  captureChatNativeMedia(
                                    "video"
                                  )
                                }
                              >
                                <span className="chat-attach-icon blue">
                                  <YatutIcon
                                    name="video"
                                    size={20}
                                  />
                                </span>

                                <strong>
                                  Камера
                                </strong>

                                <small>
                                  Записати відео
                                </small>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            disabled
                            title="Опитування в чатах — наступний модуль"
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
                            disabled
                            title="Надсилання локації — наступний модуль"
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
                            disabled
                            title="Контакти в чатах — наступний модуль"
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
                    onFocus={() => {
                      window.setTimeout(
                        () => {
                          const container =
                            messagesRef.current;

                          if (
                            container
                          ) {
                            container.scrollTop =
                              container.scrollHeight;
                          }
                        },
                        80
                      );
                    }}
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

                        if (
                          event.repeat ||
                          sending ||
                          sendInFlightRef.current
                        ) {
                          return;
                        }

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
                    type="button"
                    className={`chat-send ${
                      sending
                        ? "is-sending"
                        : ""
                    }`.trim()}
                    disabled={
                      sending
                    }
                    aria-busy={
                      sending
                    }
                    onClick={() => {
                      if (
                        sending ||
                        sendInFlightRef.current
                      ) {
                        return;
                      }

                      nativeLightHaptic();

                      sendMessage();
                    }}
                  >
                    {sending
                      ? "…"
                      : editing
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
                  (
                    activeChat.backend
                      ? remoteOnline
                      : activePerson?.online
                  )
                    ? "is-online"
                    : ""
                }`.trim()}
              >
                {activePerson?.avatar ? (
                  <img
                    src={
                      activePerson.avatar
                    }
                    alt=""
                  />
                ) : (
                  chatInitials(
                    activeChat
                  )
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

                <button
                  type="button"
                  className="chat-info-primary-action"
                  onClick={
                    openActiveCommunity
                  }
                >
                  👥 Відкрити спільноту
                </button>

                <button
                  type="button"
                  className="chat-info-row-button"
                  onClick={
                    toggleActiveChatMute
                  }
                >
                  {activeChat.muted
                    ? "🔔 Увімкнути сповіщення"
                    : "🔕 Вимкнути сповіщення"}
                </button>

                <button
                  type="button"
                  className="chat-info-row-button"
                  disabled
                  title="Медіагалерея буде окремим модулем"
                >
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

                  <button
                    type="button"
                    className="chat-info-row-button"
                    onClick={
                      openActiveProfile
                    }
                  >
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

                  <button
                    type="button"
                    className="chat-info-row-button"
                    onClick={
                      toggleActiveChatMute
                    }
                  >
                    <span className="chat-info-menu-icon">
                      <YatutIcon
                        name="notification"
                        size={17}
                      />
                    </span>

                    <span>
                      {activeChat.muted
                        ? "Увімкнути сповіщення"
                        : "Вимкнути сповіщення"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="chat-info-row-button"
                    disabled
                    title="Медіагалерея буде окремим модулем"
                  >
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

                  <button
                    type="button"
                    className="chat-info-row-button danger"
                    onClick={
                      toggleActiveChatBlock
                    }
                  >
                    <span className="chat-info-menu-icon">
                      <YatutIcon
                        name="shield"
                        size={17}
                      />
                    </span>

                    <span>
                      {activeChat.blocked
                        ? "Розблокувати"
                        : "Заблокувати"}
                    </span>
                  </button>

                </section>
              )}

          </aside>
        )}

      </section>

      {chatToast && (
        <div className="chat-global-toast">
          {
            chatToast
          }
        </div>
      )}

      {groupOpen && (
        <GroupModal
          people={
            authSession?.user?.id
              ? backendPeople
              : []
          }
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