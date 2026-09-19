import {
  useRef,
  useState,
} from "react";

import VoiceRecorder from "./VoiceRecorder";

const EMOJI_GROUPS = [
  {
    title:
      "Популярні",

    emojis: [
      "😀",
      "😂",
      "🥹",
      "😍",
      "🥰",
      "😎",
      "🤔",
      "😭",
      "😡",
      "🥳",
      "👍",
      "👏",
      "🙏",
      "🤝",
      "❤️",
      "💜",
      "🔥",
      "✨",
      "🎉",
      "💯",
    ],
  },

  {
    title:
      "Емоції",

    emojis: [
      "😃",
      "😄",
      "😁",
      "😊",
      "😘",
      "😜",
      "🤪",
      "😮",
      "😱",
      "🤯",
      "😢",
      "😴",
      "🥶",
      "😇",
      "🤩",
      "😏",
      "🙄",
      "😬",
      "🤐",
      "🫡",
    ],
  },

  {
    title:
      "Жести",

    emojis: [
      "👍",
      "👎",
      "👌",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "👊",
      "✊",
      "🤝",
      "👏",
      "🙌",
      "🙏",
      "💪",
      "👋",
    ],
  },
];

function MessageComposer({
  draft,
  setDraft,

  attachment,

  onAttachment,
  onClearAttachment,

  replyTo,
  onCancelReply,

  editingMessage,
  onCancelEdit,

  onSend,
  onSendVoice,

  onWidgetRequest,
}) {
  const imageRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const fileRef =
    useRef(null);

  const [
    emojiOpen,
    setEmojiOpen,
  ] = useState(false);

  const [
    attachmentsOpen,
    setAttachmentsOpen,
  ] = useState(false);

  const [
    voiceOpen,
    setVoiceOpen,
  ] = useState(false);

  const addEmoji = (
    emoji
  ) => {
    setDraft(
      (previous) =>
        `${previous}${emoji}`
    );
  };

  if (
    voiceOpen
  ) {
    return (
      <footer className="chat-composer voice-mode">

        <VoiceRecorder
          onCancel={() =>
            setVoiceOpen(
              false
            )
          }
          onSend={(
            blob,
            duration
          ) => {
            setVoiceOpen(
              false
            );

            onSendVoice?.(
              blob,
              duration
            );
          }}
        />

      </footer>
    );
  }

  return (
    <>
      {(replyTo ||
        editingMessage) && (
        <div className="composer-context-bar">

          <div className="composer-context-icon">
            {editingMessage
              ? "✏️"
              : "↩️"}
          </div>

          <div className="composer-context-content">

            <strong>
              {editingMessage
                ? "Редагування повідомлення"
                : "Відповідь"}
            </strong>

            <span>
              {editingMessage
                ? editingMessage.text
                : replyTo?.text ||
                  (replyTo?.type ===
                  "voice"
                    ? "🎙 Голосове повідомлення"
                    : "Вкладення")}
            </span>

          </div>

          <button
            className="composer-context-close"
            onClick={
              editingMessage
                ? onCancelEdit
                : onCancelReply
            }
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
              <span className="attachment-file-icon">
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
              onClearAttachment
            }
          >
            ×
          </button>

        </div>
      )}

      <footer className="chat-composer">

        <input
          ref={
            imageRef
          }
          type="file"
          accept="image/*"
          hidden
          onChange={(
            event
          ) =>
            onAttachment?.(
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
          type="file"
          accept="video/*"
          hidden
          onChange={(
            event
          ) =>
            onAttachment?.(
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
          type="file"
          hidden
          onChange={(
            event
          ) =>
            onAttachment?.(
              event.target
                .files?.[0],
              "file"
            )
          }
        />

        {/* ATTACHMENTS */}

        <div className="chat-plus-wrap">

          <button
            className={`chat-plus ${
              attachmentsOpen
                ? "active"
                : ""
            }`}
            onClick={() => {
              setAttachmentsOpen(
                !attachmentsOpen
              );

              setEmojiOpen(
                false
              );
            }}
          >
            +
          </button>

          {attachmentsOpen && (
            <div className="yatut-attach-popover">

              <button
                onClick={() =>
                  imageRef.current?.click()
                }
              >
                <span>
                  🖼️
                </span>

                Фото
              </button>

              <button
                onClick={() =>
                  videoRef.current?.click()
                }
              >
                <span>
                  🎬
                </span>

                Відео
              </button>

              <button
                onClick={() =>
                  fileRef.current?.click()
                }
              >
                <span>
                  📎
                </span>

                Файл
              </button>

              <button
                onClick={() => {
                  setAttachmentsOpen(
                    false
                  );

                  onWidgetRequest?.(
                    "poll"
                  );
                }}
              >
                <span>
                  📊
                </span>

                Опитування
              </button>

              <button
                onClick={() => {
                  setAttachmentsOpen(
                    false
                  );

                  onWidgetRequest?.(
                    "event"
                  );
                }}
              >
                <span>
                  🎉
                </span>

                Подія
              </button>

              <button
                onClick={() => {
                  setAttachmentsOpen(
                    false
                  );

                  onWidgetRequest?.(
                    "location"
                  );
                }}
              >
                <span>
                  📍
                </span>

                Місце
              </button>

              <button
                onClick={() => {
                  setAttachmentsOpen(
                    false
                  );

                  onWidgetRequest?.(
                    "contact"
                  );
                }}
              >
                <span>
                  👤
                </span>

                Контакт
              </button>

            </div>
          )}

        </div>

        {/* TEXT */}

        <textarea
          value={
            draft
          }
          placeholder={
            editingMessage
              ? "Редагувати повідомлення..."
              : "Повідомлення..."
          }
          onChange={(
            event
          ) =>
            setDraft(
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
              !event.shiftKey
            ) {
              event.preventDefault();

              onSend?.();
            }
          }}
        />

        {/* EMOJI */}

        <div className="yatut-emoji-wrapper">

          <button
            className={`chat-emoji ${
              emojiOpen
                ? "active"
                : ""
            }`}
            onClick={() => {
              setEmojiOpen(
                !emojiOpen
              );

              setAttachmentsOpen(
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

                <span>
                  😊
                </span>
              </div>

              <div className="yatut-emoji-scroll">

                {EMOJI_GROUPS.map(
                  (
                    group
                  ) => (
                    <section
                      className="yatut-emoji-section"
                      key={
                        group.title
                      }
                    >

                      <div className="yatut-emoji-section-title">
                        {
                          group.title
                        }
                      </div>

                      <div className="yatut-emoji-grid">

                        {group.emojis.map(
                          (
                            emoji,
                            index
                          ) => (
                            <button
                              key={`${group.title}-${index}`}
                              onClick={() =>
                                addEmoji(
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

                    </section>
                  )
                )}

              </div>

            </div>
          )}

        </div>

        {/* VOICE */}

        {!editingMessage && (
          <button
            className="chat-voice-button"
            onClick={() => {
              setEmojiOpen(
                false
              );

              setAttachmentsOpen(
                false
              );

              setVoiceOpen(
                true
              );
            }}
            title="Голосове повідомлення"
          >
            🎙
          </button>
        )}

        {/* SEND */}

        <button
          className="chat-send"
          onClick={
            onSend
          }
        >
          {editingMessage
            ? "✓"
            : "➤"}
        </button>

      </footer>
    </>
  );
}

export default MessageComposer;