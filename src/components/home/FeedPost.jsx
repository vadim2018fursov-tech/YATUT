import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bookmark,
  Check,
  Clipboard,
  Earth,
  EyeOff,
  Flag,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Reply,
  Send,
  Share2,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import SharePostModal from "./SharePostModal";
import PostGalleryViewer from "./PostGalleryViewer";

import {
  getPremiumMediaUrl,
  revokePremiumMediaUrl,
} from "../../storage/premiumMediaService";

import "../../styles/post-menu.css";
import "../../styles/comment-threads.css";
import "../../styles/post-reactions.css";
import "../../styles/post-content-meta.css";

const POST_REACTIONS = [
  {
    id: "fire",
    emoji: "🔥",
    label: "Влучно",
  },
  {
    id: "important",
    emoji: "✨",
    label: "Важливо",
  },
  {
    id: "support",
    emoji: "〰️",
    label: "Підтримую",
  },
  {
    id: "heart",
    emoji: "❤️",
    label: "Люблю",
  },
  {
    id: "laugh",
    emoji: "😂",
    label: "Смішно",
  },
  {
    id: "wow",
    emoji: "😮",
    label: "Ого",
  },
  {
    id: "sad",
    emoji: "😢",
    label: "Сумно",
  },
];

const AUDIENCE_MAP = {
  public: {
    label: "Усі",
    Icon: Earth,
  },

  friends: {
    label: "Друзі",
    Icon: Users,
  },

  "friends-of-friends": {
    label:
      "Друзі друзів",
    Icon: UserRound,
  },

  private: {
    label:
      "Тільки я",
    Icon: Lock,
  },
};

function FeedMedia({
  images = [],
  video = null,
  onOpenImage,
}) {
  if (
    !images.length &&
    !video?.url
  ) {
    return null;
  }

  return (
    <div className="yatut-post-media">
      {images.length ===
        1 && (
        <button
          type="button"
          className="premium-feed-single-image yatut-feed-media-button"
          onClick={() =>
            onOpenImage?.(
              0
            )
          }
        >
          <img
            src={
              images[0]
            }
            alt="Фото публікації"
            loading="lazy"
          />
        </button>
      )}

      {images.length ===
        2 && (
        <div className="premium-feed-gallery-two">
          {images.map(
            (
              image,
              index
            ) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className="yatut-feed-media-button"
                onClick={() =>
                  onOpenImage?.(
                    index
                  )
                }
              >
                <img
                  src={
                    image
                  }
                  alt="Фото публікації"
                  loading="lazy"
                />
              </button>
            )
          )}
        </div>
      )}

      {images.length >=
        3 && (
        <div className="premium-feed-gallery">
          <button
            type="button"
            className="yatut-feed-media-button"
            onClick={() =>
              onOpenImage?.(
                0
              )
            }
          >
            <img
              src={
                images[0]
              }
              alt="Фото публікації"
              loading="lazy"
            />
          </button>

          <div>
            {images
              .slice(
                1,
                3
              )
              .map(
                (
                  image,
                  index
                ) => {
                  const realIndex =
                    index + 1;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className="yatut-post-gallery-slot yatut-feed-media-button"
                      onClick={() =>
                        onOpenImage?.(
                          realIndex
                        )
                      }
                    >
                      <img
                        src={
                          image
                        }
                        alt="Фото публікації"
                        loading="lazy"
                      />

                      {index ===
                        1 &&
                        images.length >
                          3 && (
                          <span className="yatut-post-more-media">
                            +
                            {images.length -
                              3}
                          </span>
                        )}
                    </button>
                  );
                }
              )}
          </div>
        </div>
      )}

      {video?.url && (
        <div className="yatut-feed-video">
          <video
            src={
              video.url
            }
            controls
            playsInline
            preload="metadata"
          />

          {video.name && (
            <div className="yatut-feed-video-name">
              {
                video.name
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostContext({
  post,
}) {
  const taggedPeople =
    Array.isArray(
      post.taggedPeople
    )
      ? post.taggedPeople
      : [];

  if (
    !post.mood &&
    !taggedPeople.length
  ) {
    return null;
  }

  return (
    <div className="yatut-post-context">
      {post.mood && (
        <span className="yatut-post-mood">
          {
            post.mood
          }
        </span>
      )}

      {taggedPeople.length >
        0 && (
        <span className="yatut-post-tagged">
          з{" "}
          <strong>
            {taggedPeople
              .slice(
                0,
                2
              )
              .map(
                (
                  person
                ) =>
                  person.name
              )
              .join(", ")}
          </strong>

          {taggedPeople.length >
            2 && (
            <>
              {" "}
              та ще{" "}
              {taggedPeople.length -
                2}
            </>
          )}
        </span>
      )}
    </div>
  );
}

function PostAudience({
  audience,
}) {
  const item =
    AUDIENCE_MAP[
      audience
    ] ||
    AUDIENCE_MAP.public;

  const Icon =
    item.Icon;

  return (
    <span
      className="yatut-post-audience"
      title={`Аудиторія: ${item.label}`}
    >
      <Icon
        size={11}
      />

      {
        item.label
      }
    </span>
  );
}

function ReactionPicker({
  post,
  open,
  onReaction,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="yatut-reaction-picker"
      onMouseLeave={
        onClose
      }
    >
      {POST_REACTIONS.map(
        (
          reaction
        ) => (
          <button
            key={
              reaction.id
            }
            type="button"
            className={
              post.myReaction ===
              reaction.id
                ? "is-selected"
                : ""
            }
            onClick={() =>
              onReaction?.(
                post.id,
                reaction.id
              )
            }
          >
            <span>
              {
                reaction.emoji
              }
            </span>

            <small>
              {
                reaction.label
              }
            </small>
          </button>
        )
      )}
    </div>
  );
}

function PostReactionSummary({
  post,
}) {
  const counts =
    post.reactionCounts ||
    {};

  const active =
    POST_REACTIONS
      .map(
        (
          reaction
        ) => ({
          ...reaction,

          count:
            Number(
              counts[
                reaction.id
              ] || 0
            ),
        })
      )
      .filter(
        (
          reaction
        ) =>
          reaction.count >
          0
      )
      .sort(
        (a, b) =>
          b.count -
          a.count
      );

  const total =
    active.reduce(
      (
        sum,
        reaction
      ) =>
        sum +
        reaction.count,
      0
    );

  if (!total) {
    return <span />;
  }

  return (
    <div className="yatut-reaction-summary">
      <div>
        {active
          .slice(
            0,
            3
          )
          .map(
            (
              reaction
            ) => (
              <span
                key={
                  reaction.id
                }
              >
                {
                  reaction.emoji
                }
              </span>
            )
          )}
      </div>

      <strong>
        {total}
      </strong>
    </div>
  );
}

function PostMenu({
  post,
  isOwn,
  onEdit,
  onDelete,
  onHide,
  onReport,
  onCopy,
  onSave,
  onClose,
}) {
  const ref =
    useRef(null);

  const [
    copied,
    setCopied,
  ] = useState(false);

  useEffect(() => {
    function outside(
      event
    ) {
      if (
        ref.current &&
        !ref.current.contains(
          event.target
        )
      ) {
        onClose?.();
      }
    }

    document.addEventListener(
      "mousedown",
      outside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        outside
      );
  }, [onClose]);

  async function copy() {
    await onCopy?.(
      post
    );

    setCopied(
      true
    );

    setTimeout(
      () =>
        setCopied(
          false
        ),
      1300
    );
  }

  return (
    <div
      ref={
        ref
      }
      className="yatut-post-menu"
    >
      {isOwn ? (
        <>
          <button
            type="button"
            onClick={() => {
              onEdit?.();
              onClose?.();
            }}
          >
            <span>
              <Pencil
                size={17}
              />
            </span>

            <div>
              <strong>
                Редагувати
              </strong>

              <small>
                Змінити текст публікації
              </small>
            </div>
          </button>

          <button
            type="button"
            onClick={
              copy
            }
          >
            <span>
              {copied ? (
                <Check
                  size={17}
                />
              ) : (
                <Clipboard
                  size={17}
                />
              )}
            </span>

            <div>
              <strong>
                {copied
                  ? "Скопійовано"
                  : "Копіювати посилання"}
              </strong>
            </div>
          </button>

          <div className="yatut-post-menu-divider" />

          <button
            type="button"
            className="is-danger"
            onClick={() => {
              onDelete?.(
                post.id
              );

              onClose?.();
            }}
          >
            <span>
              <Trash2
                size={17}
              />
            </span>

            <div>
              <strong>
                Видалити
              </strong>
            </div>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              onSave?.(
                post.id
              );

              onClose?.();
            }}
          >
            <span>
              <Bookmark
                size={17}
              />
            </span>

            <div>
              <strong>
                {post.saved
                  ? "Прибрати зі збережених"
                  : "Зберегти допис"}
              </strong>
            </div>
          </button>

          <button
            type="button"
            onClick={
              copy
            }
          >
            <span>
              <Clipboard
                size={17}
              />
            </span>

            <div>
              <strong>
                Копіювати посилання
              </strong>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onHide?.(
                post.id
              );

              onClose?.();
            }}
          >
            <span>
              <EyeOff
                size={17}
              />
            </span>

            <div>
              <strong>
                Сховати допис
              </strong>
            </div>
          </button>

          <div className="yatut-post-menu-divider" />

          <button
            type="button"
            className="is-warning"
            onClick={() => {
              onReport?.(
                post.id
              );

              onClose?.();
            }}
          >
            <span>
              <Flag
                size={17}
              />
            </span>

            <div>
              <strong>
                Поскаржитися
              </strong>
            </div>
          </button>
        </>
      )}
    </div>
  );
}

function CommentMenu({
  canDelete,
  onDelete,
  onReport,
  onClose,
}) {
  return (
    <div className="yatut-comment-menu">
      {canDelete ? (
        <button
          type="button"
          className="is-danger"
          onClick={() => {
            onDelete?.();
            onClose?.();
          }}
        >
          <Trash2
            size={15}
          />

          Видалити
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            onReport?.();
            onClose?.();
          }}
        >
          <Flag
            size={15}
          />

          Поскаржитися
        </button>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  post,
  onReply,
  onLike,
  onDelete,
  onReport,
  depth = 0,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    repliesOpen,
    setRepliesOpen,
  ] = useState(false);

  const replies =
    Array.isArray(
      comment.replies
    )
      ? comment.replies
      : [];

  const canDelete =
    comment.authorId ===
      "me" ||
    post.authorId ===
      "me";

  return (
    <div
      className={`yatut-comment-thread ${
        depth >
        0
          ? "is-reply"
          : ""
      }`}
    >
      <div className="yatut-comment-row">
        <div className="yatut-comment-avatar">
          {comment.initials ||
            comment.authorName?.[0] ||
            "К"}
        </div>

        <div className="yatut-comment-main">
          <div className="yatut-comment-bubble">
            <div className="yatut-comment-head">
              <strong>
                {comment.authorName ||
                  "Користувач"}
              </strong>

              <div className="yatut-comment-menu-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(
                      !menuOpen
                    )
                  }
                >
                  <MoreHorizontal
                    size={15}
                  />
                </button>

                {menuOpen && (
                  <CommentMenu
                    canDelete={
                      canDelete
                    }
                    onDelete={() =>
                      onDelete?.(
                        comment.id
                      )
                    }
                    onReport={() =>
                      onReport?.(
                        comment.id
                      )
                    }
                    onClose={() =>
                      setMenuOpen(
                        false
                      )
                    }
                  />
                )}
              </div>
            </div>

            {comment.replyToName && (
              <span className="yatut-comment-mention">
                @{comment.replyToName}
              </span>
            )}

            <p>
              {
                comment.text
              }
            </p>
          </div>

          <div className="yatut-comment-actions">
            <span>
              {comment.time ||
                "щойно"}
            </span>

            <button
              type="button"
              className={
                comment.liked
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                onLike?.(
                  comment.id
                )
              }
            >
              <Heart
                size={12}
                fill={
                  comment.liked
                    ? "currentColor"
                    : "none"
                }
              />

              Подобається

              {Number(
                comment.likes ||
                  0
              ) > 0 && (
                <b>
                  {
                    comment.likes
                  }
                </b>
              )}
            </button>

            {depth ===
              0 && (
              <button
                type="button"
                onClick={() =>
                  onReply?.(
                    comment
                  )
                }
              >
                <Reply
                  size={12}
                />

                Відповісти
              </button>
            )}
          </div>

          {replies.length >
            0 && (
            <>
              <button
                type="button"
                className="yatut-comment-show-replies"
                onClick={() =>
                  setRepliesOpen(
                    !repliesOpen
                  )
                }
              >
                <span />

                {repliesOpen
                  ? "Сховати відповіді"
                  : `Показати відповіді (${replies.length})`}
              </button>

              {repliesOpen && (
                <div className="yatut-comment-replies">
                  {replies.map(
                    (
                      reply
                    ) => (
                      <CommentItem
                        key={
                          reply.id
                        }
                        comment={
                          reply
                        }
                        post={
                          post
                        }
                        depth={
                          1
                        }
                        onReply={
                          onReply
                        }
                        onLike={
                          onLike
                        }
                        onDelete={
                          onDelete
                        }
                        onReport={
                          onReport
                        }
                      />
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedPost({
  post,
  onReaction,
  onSave,
  onAddComment,
  onAddReply,
  onLikeComment,
  onDeleteComment,
  onReportComment,
  onShare,
  onEdit,
  onDelete,
  onHide,
  onReport,
  onCopyLink,
}) {
  const [
    resolvedImages,
    setResolvedImages,
  ] = useState([]);

  const [
    resolvedVideo,
    setResolvedVideo,
  ] = useState(null);

  const [
    galleryIndex,
    setGalleryIndex,
  ] = useState(null);

  const [
    commentsOpen,
    setCommentsOpen,
  ] = useState(false);

  const [
    shareOpen,
    setShareOpen,
  ] = useState(false);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    reactionOpen,
    setReactionOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    editText,
    setEditText,
  ] = useState(
    post.text ||
      ""
  );

  const [
    commentText,
    setCommentText,
  ] = useState("");

  const [
    replyingTo,
    setReplyingTo,
  ] = useState(null);

  const reactionTimerRef =
    useRef(null);

  useEffect(() => {
    let cancelled =
      false;

    const createdUrls =
      [];

    async function resolveMedia() {
      const imageUrls =
        [];

      for (
        const image of
        post.images ||
        []
      ) {
        const url =
          await getPremiumMediaUrl(
            image
          );

        if (url) {
          imageUrls.push(
            url
          );

          if (
            url.startsWith(
              "blob:"
            )
          ) {
            createdUrls.push(
              url
            );
          }
        }
      }

      let videoValue =
        null;

      if (
        post.video
      ) {
        const url =
          await getPremiumMediaUrl(
            post.video
          );

        if (url) {
          videoValue = {
            ...post.video,
            url,
          };

          if (
            url.startsWith(
              "blob:"
            )
          ) {
            createdUrls.push(
              url
            );
          }
        }
      }

      if (
        cancelled
      ) {
        createdUrls.forEach(
          revokePremiumMediaUrl
        );

        return;
      }

      setResolvedImages(
        imageUrls
      );

      setResolvedVideo(
        videoValue
      );
    }

    resolveMedia();

    return () => {
      cancelled =
        true;

      createdUrls.forEach(
        revokePremiumMediaUrl
      );
    };
  }, [
    post.images,
    post.video,
  ]);

  const saved =
    Boolean(
      post.saved
    );

  const isOwn =
    post.authorId ===
    "me";

  const comments =
    Number(
      post.comments ||
        0
    );

  const shares =
    Number(
      post.shares ||
        0
    );

  const commentItems =
    Array.isArray(
      post.commentItems
    )
      ? post.commentItems
      : [];

  const currentReaction =
    POST_REACTIONS.find(
      (
        reaction
      ) =>
        reaction.id ===
        post.myReaction
    );

  function openReactionLater() {
    window.clearTimeout(
      reactionTimerRef.current
    );

    reactionTimerRef.current =
      window.setTimeout(
        () =>
          setReactionOpen(
            true
          ),
        380
      );
  }

  function submitComment() {
    const clean =
      commentText.trim();

    if (!clean) {
      return;
    }

    if (
      replyingTo
    ) {
      onAddReply?.(
        post.id,
        replyingTo.id,
        clean
      );
    } else {
      onAddComment?.(
        post.id,
        clean
      );
    }

    setCommentText("");
    setReplyingTo(
      null
    );
  }

  const postForShare = {
    ...post,

    images:
      resolvedImages,

    video:
      resolvedVideo,
  };

  return (
    <>
      <article
        className="premium-feed-post"
        id={`premium-post-${post.id}`}
      >
        <header className="premium-feed-post-header">
          <div className="premium-feed-author">
            <span className="premium-feed-avatar">
              {post.initials ||
                "Я"}
            </span>

            <div className="yatut-post-author-copy">
              <div className="premium-feed-author-name">
                <strong>
                  {post.authorName ||
                    "Користувач"}
                </strong>

                {post.verified && (
                  <span>
                    ✓
                  </span>
                )}

                <PostContext
                  post={
                    post
                  }
                />
              </div>

              <div className="yatut-post-subline">
                <small>
                  {post.edited
                    ? "відредаговано · "
                    : ""}

                  {post.time ||
                    "щойно"}
                </small>

                {post.location && (
                  <>
                    <span>
                      ·
                    </span>

                    <small>
                      {
                        post.location
                      }
                    </small>
                  </>
                )}

                <span>
                  ·
                </span>

                <PostAudience
                  audience={
                    post.audience
                  }
                />
              </div>
            </div>
          </div>

          <div className="premium-feed-top-actions">
            <span>
              # ЯТУТ
            </span>

            <div className="yatut-post-menu-wrap">
              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    !menuOpen
                  )
                }
              >
                <MoreHorizontal
                  size={18}
                />
              </button>

              {menuOpen && (
                <PostMenu
                  post={
                    post
                  }
                  isOwn={
                    isOwn
                  }
                  onEdit={() =>
                    setEditing(
                      true
                    )
                  }
                  onDelete={
                    onDelete
                  }
                  onHide={
                    onHide
                  }
                  onReport={
                    onReport
                  }
                  onCopy={
                    onCopyLink
                  }
                  onSave={
                    onSave
                  }
                  onClose={() =>
                    setMenuOpen(
                      false
                    )
                  }
                />
              )}
            </div>
          </div>
        </header>

        {editing ? (
          <div className="yatut-post-edit">
            <textarea
              autoFocus
              value={
                editText
              }
              onChange={(
                event
              ) =>
                setEditText(
                  event.target
                    .value
                )
              }
            />

            <div>
              <button
                type="button"
                className="yatut-edit-cancel"
                onClick={() => {
                  setEditText(
                    post.text ||
                      ""
                  );

                  setEditing(
                    false
                  );
                }}
              >
                <X
                  size={16}
                />

                Скасувати
              </button>

              <button
                type="button"
                className="yatut-edit-save"
                onClick={() => {
                  onEdit?.(
                    post.id,
                    editText.trim()
                  );

                  setEditing(
                    false
                  );
                }}
              >
                <Check
                  size={16}
                />

                Зберегти
              </button>
            </div>
          </div>
        ) : (
          post.text && (
            <p className="premium-feed-text">
              {
                post.text
              }
            </p>
          )
        )}

        <FeedMedia
          images={
            resolvedImages
          }
          video={
            resolvedVideo
          }
          onOpenImage={
            setGalleryIndex
          }
        />

        <div className="premium-feed-meta">
          <PostReactionSummary
            post={
              post
            }
          />

          <span>
            {comments} коментарі
            {" · "}
            {shares} поширень
          </span>
        </div>

        <footer className="premium-feed-actions">
          <div
            className="yatut-post-reaction-action"
            onMouseEnter={
              openReactionLater
            }
            onMouseLeave={() => {
              window.clearTimeout(
                reactionTimerRef.current
              );

              window.setTimeout(
                () =>
                  setReactionOpen(
                    false
                  ),
                180
              );
            }}
          >
            <button
              type="button"
              className={
                currentReaction
                  ? "is-active yatut-main-reaction"
                  : "yatut-main-reaction"
              }
              onClick={() =>
                onReaction?.(
                  post.id,
                  post.myReaction ||
                    "fire"
                )
              }
            >
              <span className="yatut-current-reaction-emoji">
                {currentReaction
                  ? currentReaction.emoji
                  : "🔥"}
              </span>

              {currentReaction
                ? currentReaction.label
                : "Влучно"}
            </button>

            <ReactionPicker
              post={
                post
              }
              open={
                reactionOpen
              }
              onReaction={(
                postId,
                reactionId
              ) => {
                onReaction?.(
                  postId,
                  reactionId
                );

                setReactionOpen(
                  false
                );
              }}
              onClose={() =>
                setReactionOpen(
                  false
                )
              }
            />
          </div>

          <button
            type="button"
            className={
              commentsOpen
                ? "is-active"
                : ""
            }
            onClick={() =>
              setCommentsOpen(
                !commentsOpen
              )
            }
          >
            <MessageCircle
              size={18}
            />

            Коментувати
          </button>

          <button
            type="button"
            onClick={() =>
              setShareOpen(
                true
              )
            }
          >
            <Share2
              size={18}
            />

            Поширити
          </button>

          <button
            type="button"
            className={
              saved
                ? "is-active"
                : ""
            }
            onClick={() =>
              onSave?.(
                post.id
              )
            }
          >
            <Bookmark
              size={18}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />

            {saved
              ? "Збережено"
              : "Зберегти"}
          </button>
        </footer>

        {commentsOpen && (
          <section className="yatut-comments-area">
            {commentItems.length >
            0 ? (
              <div className="yatut-comments-list">
                {commentItems.map(
                  (
                    comment
                  ) => (
                    <CommentItem
                      key={
                        comment.id
                      }
                      comment={
                        comment
                      }
                      post={
                        post
                      }
                      onReply={(
                        item
                      ) => {
                        setReplyingTo(
                          item
                        );

                        setCommentText(
                          `@${item.authorName} `
                        );
                      }}
                      onLike={(
                        commentId
                      ) =>
                        onLikeComment?.(
                          post.id,
                          commentId
                        )
                      }
                      onDelete={(
                        commentId
                      ) =>
                        onDeleteComment?.(
                          post.id,
                          commentId
                        )
                      }
                      onReport={(
                        commentId
                      ) =>
                        onReportComment?.(
                          post.id,
                          commentId
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="yatut-comments-empty">
                Коментарів ще немає. Будьте першим.
              </div>
            )}

            {replyingTo && (
              <div className="yatut-reply-context">
                <Reply
                  size={14}
                />

                <span>
                  Відповідь для{" "}
                  <strong>
                    {
                      replyingTo.authorName
                    }
                  </strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(
                      null
                    );

                    setCommentText(
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

            <div className="yatut-comment-composer">
              <div className="yatut-comment-current-avatar">
                В
              </div>

              <div className="yatut-comment-input-wrap">
                <input
                  value={
                    commentText
                  }
                  onChange={(
                    event
                  ) =>
                    setCommentText(
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

                      submitComment();
                    }
                  }}
                  placeholder="Написати коментар..."
                />

                <button
                  type="button"
                  disabled={
                    !commentText.trim()
                  }
                  onClick={
                    submitComment
                  }
                >
                  <Send
                    size={17}
                  />
                </button>
              </div>
            </div>
          </section>
        )}
      </article>

      {shareOpen && (
        <SharePostModal
          post={
            postForShare
          }
          onClose={() =>
            setShareOpen(
              false
            )
          }
          onShared={() =>
            onShare?.(
              post.id
            )
          }
        />
      )}

      {galleryIndex !==
        null &&
        resolvedImages.length >
          0 && (
          <PostGalleryViewer
            post={
              post
            }
            images={
              resolvedImages
            }
            initialIndex={
              galleryIndex
            }
            onAddComment={
              onAddComment
            }
            onClose={() =>
              setGalleryIndex(
                null
              )
            }
          />
        )}
    </>
  );
}

export default FeedPost;