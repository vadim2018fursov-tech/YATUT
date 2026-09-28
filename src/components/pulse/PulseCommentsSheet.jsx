import {
  Send,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Dialog,
} from "radix-ui";

import {
  createPulseComment,
  deletePulseComment,
  isPulseBackendId,
  loadPulseComments,
} from "../../services/pulseSocialService";

import {
  subscribePulseRealtime,
} from "../../services/realtimeService";

import useYatutAutoAnimate from "../../hooks/useYatutAutoAnimate";

import "./PulseCommentsSheet.css";

function relativeTime(
  value
) {
  const time =
    Number(
      value ||
      0
    );

  const diff =
    Math.max(
      0,
      Date.now() -
        time
    );

  const minutes =
    Math.floor(
      diff /
      60000
    );

  if (
    minutes <
    1
  ) {
    return "щойно";
  }

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

  if (
    hours <
    24
  ) {
    return `${hours} год`;
  }

  const days =
    Math.floor(
      hours /
      24
    );

  return `${days} дн`;
}

export default function PulseCommentsSheet({
  open,
  video,
  authSession,
  onClose,
  onCountChange,
}) {
  const [
    comments,
    setComments,
  ] =
    useState([]);

  const [
    text,
    setText,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    replyingTo,
    setReplyingTo,
  ] =
    useState(null);

  const [
    commentsListRef,
  ] = useYatutAutoAnimate({
    duration: 220,
  });

  const backend =
    Boolean(
      video?.backend &&
      isPulseBackendId(
        video?.id
      )
    );

  const currentUserId =
    authSession?.user?.id ||
    null;

  const rootComments =
    useMemo(
      () =>
        comments.filter(
          (
            comment
          ) =>
            !comment.parentId
        ),
      [
        comments,
      ]
    );

  const repliesByParent =
    useMemo(
      () => {
        const map =
          new Map();

        comments.forEach(
          (
            comment
          ) => {
            if (
              !comment.parentId
            ) {
              return;
            }

            const list =
              map.get(
                comment.parentId
              ) ||
              [];

            list.push(
              comment
            );

            map.set(
              comment.parentId,
              list
            );
          }
        );

        return map;
      },
      [
        comments,
      ]
    );

  async function refresh() {
    if (
      !open ||
      !backend
    ) {
      return;
    }

    try {
      setLoading(
        true
      );

      const rows =
        await loadPulseComments(
          authSession,
          video.id,
          {
            limit:
              150,
            newestFirst:
              false,
          }
        );

      setComments(
        rows
      );

      onCountChange?.(
        rows.length
      );
    } catch (
      loadError
    ) {
      console.warn(
        "PULSE COMMENTS LOAD ERROR:",
        loadError
      );

      setError(
        "Не вдалося завантажити коментарі."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  useEffect(
    () => {
      if (
        !open
      ) {
        setReplyingTo(
          null
        );

        setText(
          ""
        );

        setError(
          ""
        );

        return;
      }

      refresh();

      if (
        !backend ||
        !authSession?.user?.id
      ) {
        return;
      }

      let timer =
        null;

      const realtime =
        subscribePulseRealtime({
          session:
            authSession,
          onChange:
            () => {
              window.clearTimeout(
                timer
              );

              timer =
                window.setTimeout(
                  refresh,
                  120
                );
            },
        });

      return () => {
        window.clearTimeout(
          timer
        );

        realtime?.close?.();
      };
    },
    [
      open,
      backend,
      video?.id,
      authSession?.user?.id,
      authSession?.access_token,
    ]
  );

  async function submit() {
    const clean =
      text.trim();

    if (
      !clean ||
      !backend ||
      !currentUserId ||
      sending
    ) {
      return;
    }

    try {
      setSending(
        true
      );

      setError(
        ""
      );

      const created =
        await createPulseComment(
          authSession,
          video.id,
          clean,
          replyingTo?.id ||
            null
        );

      if (
        created
      ) {
        setComments(
          (
            previous
          ) => [
            ...previous,
            created,
          ]
        );

        onCountChange?.(
          comments.length +
            1
        );
      }

      setText(
        ""
      );

      setReplyingTo(
        null
      );
    } catch (
      sendError
    ) {
      console.warn(
        "PULSE COMMENT SEND ERROR:",
        sendError
      );

      setError(
        sendError?.message ||
        "Не вдалося додати коментар."
      );
    } finally {
      setSending(
        false
      );
    }
  }

  async function removeComment(
    comment
  ) {
    if (
      comment?.author?.id !==
      currentUserId
    ) {
      return;
    }

    try {
      await deletePulseComment(
        authSession,
        comment.id
      );

      setComments(
        (
          previous
        ) =>
          previous.filter(
            (
              item
            ) =>
              item.id !==
              comment.id &&
              item.parentId !==
              comment.id
          )
      );
    } catch (
      deleteError
    ) {
      console.warn(
        "PULSE COMMENT DELETE ERROR:",
        deleteError
      );

      setError(
        "Не вдалося видалити коментар."
      );
    }
  }

  function reply(
    comment
  ) {
    setReplyingTo(
      comment
    );

    setText(
      `@${comment.author?.username || "user"} `
    );
  }

  if (!open) {
    return null;
  }

  return (
    <Dialog.Root
      open={
        open
      }
      onOpenChange={(
        nextOpen
      ) => {
        if (
          !nextOpen
        ) {
          onClose?.();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="pulse-comments-backdrop" />

        <Dialog.Content
          asChild
          aria-describedby={
            undefined
          }
        >
      <section className="pulse-comments-sheet">
        <div
          className="pulse-comments-sheet__handle"
          aria-hidden="true"
        />
        <header className="pulse-comments-sheet__header">
          <div>
            <Dialog.Title
              asChild
            >
              <strong>
                Коментарі
              </strong>
            </Dialog.Title>

            <span>
              {
                comments.length
              }
            </span>
          </div>

          <Dialog.Close
            asChild
          >
            <button
              type="button"
              aria-label="Закрити коментарі"
            >
              <X
                size={20}
              />
            </button>
          </Dialog.Close>
        </header>

        <div
          ref={
            commentsListRef
          }
          className="pulse-comments-sheet__list"
        >
          {!backend ? (
            <div className="pulse-comments-sheet__empty">
              <strong>
                Демо-відео
              </strong>

              <span>
                Реальні коментарі працюють для опублікованих відео ЯТУТ.
              </span>
            </div>
          ) : loading &&
            !comments.length ? (
            <div className="pulse-comments-sheet__empty">
              <strong>
                Завантажуємо…
              </strong>
            </div>
          ) : !comments.length ? (
            <div className="pulse-comments-sheet__empty">
              <strong>
                Поки без коментарів
              </strong>

              <span>
                Будь першим, хто відреагує.
              </span>
            </div>
          ) : (
            rootComments.map(
              (
                comment
              ) => (
                <div
                  key={
                    comment.id
                  }
                  className="pulse-comments-thread"
                >
                  <CommentRow
                    comment={
                      comment
                    }
                    currentUserId={
                      currentUserId
                    }
                    onReply={
                      reply
                    }
                    onDelete={
                      removeComment
                    }
                  />

                  {(repliesByParent.get(
                    comment.id
                  ) ||
                    []).map(
                    (
                      replyComment
                    ) => (
                      <CommentRow
                        key={
                          replyComment.id
                        }
                        comment={
                          replyComment
                        }
                        currentUserId={
                          currentUserId
                        }
                        onReply={() =>
                          reply(
                            comment
                          )
                        }
                        onDelete={
                          removeComment
                        }
                        reply
                      />
                    )
                  )}
                </div>
              )
            )
          )}
        </div>

        {error && (
          <div className="pulse-comments-sheet__error">
            {
              error
            }
          </div>
        )}

        {backend &&
          currentUserId && (
          <footer className="pulse-comments-sheet__composer">
            {replyingTo && (
              <div className="pulse-comments-sheet__replying">
                <span>
                  Відповідь @
                  {
                    replyingTo.author
                      ?.username
                  }
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(
                      null
                    );

                    setText(
                      ""
                    );
                  }}
                >
                  <X
                    size={14}
                  />
                </button>
              </div>
            )}

            <div>
              <span className="pulse-comments-sheet__me">
                {
                  authSession?.user
                    ?.email
                    ?.charAt(
                      0
                    )
                    .toUpperCase() ||
                  "Я"
                }
              </span>

              <textarea
                rows={1}
                value={
                  text
                }
                maxLength={
                  2000
                }
                placeholder="Додати коментар…"
                onChange={(
                  event
                ) =>
                  setText(
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

                    submit();
                  }
                }}
              />

              <button
                type="button"
                className="pulse-comments-sheet__send"
                disabled={
                  !text.trim() ||
                  sending
                }
                onClick={
                  submit
                }
                aria-label="Надіслати коментар"
              >
                <Send
                  size={18}
                />
              </button>
            </div>
          </footer>
        )}
      </section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CommentRow({
  comment,
  currentUserId,
  onReply,
  onDelete,
  reply = false,
}) {
  const author =
    comment.author ||
    {};

  return (
    <article
      className={`pulse-comments-row ${
        reply
          ? "is-reply"
          : ""
      }`.trim()}
    >
      <span className="pulse-comments-row__avatar">
        {author.avatar ? (
          <img
            src={
              author.avatar
            }
            alt=""
          />
        ) : (
          author.initials ||
          "Я"
        )}
      </span>

      <div className="pulse-comments-row__body">
        <div className="pulse-comments-row__meta">
          <strong>
            {
              author.name ||
              "Користувач"
            }
          </strong>

          <span>
            @
            {
              author.username ||
              "user"
            }
            {" · "}
            {relativeTime(
              comment.createdAt
            )}
          </span>
        </div>

        <p>
          {
            comment.text
          }
        </p>

        <div className="pulse-comments-row__actions">
          <button
            type="button"
            onClick={() =>
              onReply?.(
                comment
              )
            }
          >
            Відповісти
          </button>

          {author.id ===
            currentUserId && (
            <button
              type="button"
              className="is-delete"
              onClick={() =>
                onDelete?.(
                  comment
                )
              }
            >
              <Trash2
                size={13}
              />

              Видалити
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
