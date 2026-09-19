import {
  Fragment,
  useState,
} from "react";

const REACTIONS = [
  "❤️",
  "😂",
  "🔥",
  "👍",
  "😮",
  "😢",
];

function formatTime(
  createdAt
) {
  return new Date(
    createdAt
  ).toLocaleTimeString(
    "uk-UA",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}

function formatVoiceDuration(
  seconds = 0
) {
  const minutes =
    Math.floor(
      seconds / 60
    );

  const rest =
    seconds % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    rest
  ).padStart(
    2,
    "0"
  )}`;
}

function HighlightedText({
  text,
  query,
}) {
  if (
    !text ||
    !query?.trim()
  ) {
    return text;
  }

  const cleanQuery =
    query.trim();

  const source =
    text.toLowerCase();

  const target =
    cleanQuery.toLowerCase();

  const parts = [];

  let cursor = 0;

  let index =
    source.indexOf(
      target,
      cursor
    );

  while (
    index !== -1
  ) {
    if (
      index >
      cursor
    ) {
      parts.push(
        text.slice(
          cursor,
          index
        )
      );
    }

    parts.push(
      <mark
        className="chat-search-mark"
        key={`${index}-${cursor}`}
      >
        {text.slice(
          index,
          index +
            cleanQuery.length
        )}
      </mark>
    );

    cursor =
      index +
      cleanQuery.length;

    index =
      source.indexOf(
        target,
        cursor
      );
  }

  if (
    cursor <
    text.length
  ) {
    parts.push(
      text.slice(
        cursor
      )
    );
  }

  return parts.map(
    (
      part,
      index
    ) => (
      <Fragment
        key={
          index
        }
      >
        {part}
      </Fragment>
    )
  );
}

function MessageBubble({
  message,
  person,
  searchQuery,
  searchActive,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onForward,
  onVotePoll,
  onJoinConference,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    reactionsOpen,
    setReactionsOpen,
  ] = useState(false);

  const mine =
    message.senderId ===
    "me";

  const renderWidget =
    () => {
      const widget =
        message.widget;

      if (!widget) {
        return null;
      }

      if (
        widget.type ===
        "poll"
      ) {
        return (
          <div className="chat-widget">
            <span className="chat-widget-label">
              📊 ОПИТУВАННЯ
            </span>

            <strong className="chat-widget-title">
              {
                widget.question
              }
            </strong>

            <div className="chat-widget-poll-options">
              {widget.options?.map(
                (
                  option
                ) => (
                  <button
                    key={
                      option.id
                    }
                    className={
                      widget.selectedOptionId ===
                      option.id
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      onVotePoll?.(
                        message.id,
                        option.id
                      )
                    }
                  >
                    <span>
                      {
                        option.text
                      }
                    </span>

                    <b>
                      {
                        option.votes ||
                        0
                      }
                    </b>
                  </button>
                )
              )}
            </div>
          </div>
        );
      }

      if (
        widget.type ===
        "event"
      ) {
        return (
          <div className="chat-widget">
            <span className="chat-widget-label">
              🎉 ПОДІЯ
            </span>

            <strong className="chat-widget-title">
              {
                widget.title
              }
            </strong>

            <p>
              📅{" "}
              {
                widget.date ||
                "Дата не вказана"
              }

              {widget.time
                ? ` • ${widget.time}`
                : ""}
            </p>

            {widget.place && (
              <p>
                📍{" "}
                {
                  widget.place
                }
              </p>
            )}

            <button className="chat-widget-main-action">
              Переглянути подію
            </button>
          </div>
        );
      }

      if (
        widget.type ===
        "contact"
      ) {
        return (
          <div className="chat-widget">
            <span className="chat-widget-label">
              👤 КОНТАКТ
            </span>

            <div className="chat-contact-widget">
              <div className="chat-contact-avatar">
                {
                  widget.name?.[
                    0
                  ] || "?"
                }
              </div>

              <div>
                <strong>
                  {
                    widget.name
                  }
                </strong>

                {widget.phone && (
                  <span>
                    {
                      widget.phone
                    }
                  </span>
                )}

                {widget.username && (
                  <span>
                    @
                    {
                      widget.username
                    }
                  </span>
                )}
              </div>
            </div>

            <button className="chat-widget-main-action">
              Відкрити контакт
            </button>
          </div>
        );
      }

      if (
        widget.type ===
        "location"
      ) {
        return (
          <div className="chat-widget">
            <span className="chat-widget-label">
              📍 МІСЦЕ
            </span>

            <div className="chat-location-preview">
              <span>
                Я
              </span>
            </div>

            <strong className="chat-widget-title">
              {
                widget.place ||
                widget.city
              }
            </strong>

            {widget.city && (
              <p>
                {
                  widget.city
                }
              </p>
            )}

            {widget.note && (
              <p>
                {
                  widget.note
                }
              </p>
            )}
          </div>
        );
      }

      if (
        widget.type ===
        "conference"
      ) {
        return (
          <div className="conference-message-widget">
            <div className="conference-widget-icon">
              📹
            </div>

            <div className="conference-widget-content">
              <span>
                КОНФЕРЕНЦІЯ ЯТУТ
              </span>

              <strong>
                {widget.title ||
                  "Відеозустріч"}
              </strong>

              <p>
                👥{" "}
                {widget.memberCount ||
                  1}{" "}
                учасників
              </p>

              <button
                onClick={() =>
                  onJoinConference?.(
                    widget
                  )
                }
              >
                Приєднатися
              </button>
            </div>
          </div>
        );
      }

      return null;
    };

  return (
    <div
      id={`message-${message.id}`}
      className={`message-row ${
        mine
          ? "mine"
          : ""
      } ${
        searchActive
          ? "chat-search-result-active"
          : ""
      }`}
    >
      {!mine && (
        <div className="message-avatar">
          {
            person?.initials ||
            "?"
          }
        </div>
      )}

      <div className="message-shell">
        <button
          className="message-more-trigger"
          onClick={() => {
            setMenuOpen(
              !menuOpen
            );

            setReactionsOpen(
              false
            );
          }}
        >
          •••
        </button>

        {menuOpen && (
          <div className="message-action-menu">
            <button
              onClick={() => {
                onReply?.(
                  message
                );

                setMenuOpen(
                  false
                );
              }}
            >
              <span>
                ↩️
              </span>
              Відповісти
            </button>

            <button
              onClick={() => {
                onForward?.(
                  message
                );

                setMenuOpen(
                  false
                );
              }}
            >
              <span>
                ➡️
              </span>
              Переслати
            </button>

            <button
              onClick={() => {
                onPin?.(
                  message
                );

                setMenuOpen(
                  false
                );
              }}
            >
              <span>
                📌
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
                    onEdit?.(
                      message
                    );

                    setMenuOpen(
                      false
                    );
                  }}
                >
                  <span>
                    ✏️
                  </span>
                  Редагувати
                </button>
              )}

            {mine && (
              <button
                className="danger"
                onClick={() => {
                  onDelete?.(
                    message
                  );

                  setMenuOpen(
                    false
                  );
                }}
              >
                <span>
                  🗑️
                </span>
                Видалити
              </button>
            )}
          </div>
        )}

        <button
          className="message-reaction-trigger"
          onClick={() => {
            setReactionsOpen(
              !reactionsOpen
            );

            setMenuOpen(
              false
            );
          }}
        >
          ♡
        </button>

        {reactionsOpen && (
          <div className="message-reaction-popover">
            {REACTIONS.map(
              (
                emoji
              ) => (
                <button
                  key={
                    emoji
                  }
                  onClick={() => {
                    onReaction?.(
                      message.id,
                      emoji
                    );

                    setReactionsOpen(
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

        <div
          className={`message-bubble ${
            mine
              ? "mine"
              : ""
          }`}
        >
          {message.forwardedFrom && (
            <div className="forwarded-label">
              ↪ Переслане повідомлення
            </div>
          )}

          {message.replyTo && (
            <button
              className="message-reply-quote"
              onClick={() =>
                document
                  .getElementById(
                    `message-${message.replyTo.id}`
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                    block:
                      "center",
                  })
              }
            >
              <span className="reply-quote-line" />

              <div>
                <strong>
                  {message.replyTo.senderId ===
                  "me"
                    ? "Ви"
                    : person?.name ||
                      "Користувач"}
                </strong>

                <p>
                  {message.replyTo.text ||
                    (message.replyTo.type ===
                    "voice"
                      ? "🎙 Голосове повідомлення"
                      : message.replyTo.type ===
                        "image"
                      ? "🖼 Фото"
                      : message.replyTo.type ===
                        "video"
                      ? "🎥 Відео"
                      : "📎 Вкладення")}
                </p>
              </div>
            </button>
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
                <span className="chat-file-icon">
                  📎
                </span>

                <div>
                  <strong>
                    {
                      message.fileName
                    }
                  </strong>

                  <small>
                    Відкрити файл
                  </small>
                </div>
              </a>
            )}

          {message.type ===
            "voice" &&
            message.fileUrl && (
              <div className="voice-message">
                <button className="voice-message-icon">
                  🎙
                </button>

                <div className="voice-message-main">
                  <div className="voice-message-wave">
                    {Array.from({
                      length: 22,
                    }).map(
                      (
                        _,
                        index
                      ) => (
                        <span
                          key={
                            index
                          }
                        />
                      )
                    )}
                  </div>

                  <audio
                    controls
                    preload="metadata"
                    src={
                      message.fileUrl
                    }
                  />
                </div>

                <span className="voice-message-duration">
                  {formatVoiceDuration(
                    message.voiceDuration
                  )}
                </span>
              </div>
            )}

          {message.type ===
            "widget" &&
            renderWidget()}

          {message.text && (
            <p>
              <HighlightedText
                text={
                  message.text
                }
                query={
                  searchQuery
                }
              />
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
              onReaction?.(
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

export default MessageBubble;