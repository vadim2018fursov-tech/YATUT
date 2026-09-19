import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  Minus,
  Plus,
  Send,
  Share2,
  X,
} from "lucide-react";

import "../../styles/gallery-viewer.css";

function flattenComments(
  comments = [],
  depth = 0
) {
  const result = [];

  comments.forEach(
    (comment) => {
      result.push({
        ...comment,
        depth,
      });

      if (
        Array.isArray(
          comment.replies
        ) &&
        comment.replies.length
      ) {
        result.push(
          ...flattenComments(
            comment.replies,
            depth + 1
          )
        );
      }
    }
  );

  return result;
}

function GalleryComments({
  post,
  onAddComment,
}) {
  const [
    text,
    setText,
  ] = useState("");

  const comments =
    useMemo(
      () =>
        flattenComments(
          post.commentItems ||
            []
        ),
      [post.commentItems]
    );

  function submit() {
    const clean =
      text.trim();

    if (!clean) {
      return;
    }

    onAddComment?.(
      post.id,
      clean
    );

    setText("");
  }

  return (
    <aside className="yatut-gallery-comments">
      <header>
        <div>
          <MessageCircle
            size={18}
          />

          <strong>
            Коментарі
          </strong>
        </div>

        <span>
          {Number(
            post.comments ||
              0
          )}
        </span>
      </header>

      <div className="yatut-gallery-comments-list">
        {comments.length ? (
          comments.map(
            (comment) => (
              <article
                key={
                  comment.id
                }
                className={
                  comment.depth
                    ? "is-reply"
                    : ""
                }
              >
                <div className="yatut-gallery-comment-avatar">
                  {comment.initials ||
                    comment.authorName?.[0] ||
                    "К"}
                </div>

                <div>
                  <strong>
                    {comment.authorName ||
                      "Користувач"}
                  </strong>

                  {comment.replyToName && (
                    <span className="yatut-gallery-mention">
                      @
                      {
                        comment.replyToName
                      }
                    </span>
                  )}

                  <p>
                    {
                      comment.text
                    }
                  </p>

                  <small>
                    {comment.time ||
                      "щойно"}

                    {Number(
                      comment.likes ||
                        0
                    ) >
                      0 &&
                      ` · ♥ ${comment.likes}`}
                  </small>
                </div>
              </article>
            )
          )
        ) : (
          <div className="yatut-gallery-comments-empty">
            <MessageCircle
              size={24}
            />

            <strong>
              Коментарів ще немає
            </strong>

            <span>
              Будьте першим
            </span>
          </div>
        )}
      </div>

      <div className="yatut-gallery-comment-composer">
        <div>
          В
        </div>

        <section>
          <input
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
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                event.preventDefault();

                submit();
              }
            }}
            placeholder="Написати коментар..."
          />

          <button
            type="button"
            disabled={
              !text.trim()
            }
            onClick={
              submit
            }
          >
            <Send
              size={16}
            />
          </button>
        </section>
      </div>
    </aside>
  );
}

function PostGalleryViewer({
  post,
  images,
  initialIndex = 0,
  onClose,
  onAddComment,
}) {
  const [
    index,
    setIndex,
  ] = useState(
    Math.min(
      initialIndex,
      Math.max(
        images.length - 1,
        0
      )
    )
  );

  const [
    zoom,
    setZoom,
  ] = useState(1);

  const [
    uiVisible,
    setUiVisible,
  ] = useState(true);

  const currentImage =
    images[index];

  useEffect(() => {
    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function keyboard(
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
        "+"
      ) {
        zoomIn();
      }

      if (
        event.key ===
        "-"
      ) {
        zoomOut();
      }
    }

    window.addEventListener(
      "keydown",
      keyboard
    );

    return () => {
      document.body.style.overflow =
        oldOverflow;

      window.removeEventListener(
        "keydown",
        keyboard
      );
    };
  });

  useEffect(() => {
    setZoom(1);
  }, [index]);

  function next() {
    setIndex(
      (current) =>
        current >=
        images.length - 1
          ? 0
          : current + 1
    );
  }

  function previous() {
    setIndex(
      (current) =>
        current <= 0
          ? images.length - 1
          : current - 1
    );
  }

  function zoomIn() {
    setZoom(
      (current) =>
        Math.min(
          3,
          Number(
            (
              current +
              0.25
            ).toFixed(2)
          )
        )
    );
  }

  function zoomOut() {
    setZoom(
      (current) =>
        Math.max(
          1,
          Number(
            (
              current -
              0.25
            ).toFixed(2)
          )
        )
    );
  }

  async function share() {
    const url =
      `${window.location.origin}${window.location.pathname}#post=${encodeURIComponent(
        post.id
      )}`;

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            `${post.authorName || "ЯТУТ"} · ЯТУТ`,

          text:
            post.text ||
            "Публікація в ЯТУТ",

          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        url
      );
    } catch (
      error
    ) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.warn(
          "GALLERY SHARE ERROR:",
          error
        );
      }
    }
  }

  function download() {
    if (!currentImage) {
      return;
    }

    const link =
      document.createElement(
        "a"
      );

    link.href =
      currentImage;

    link.download =
      `yatut-${post.id}-${index + 1}.jpg`;

    link.rel =
      "noopener";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  }

  if (
    !images?.length ||
    !currentImage
  ) {
    return null;
  }

  return (
    <div className="yatut-gallery-overlay">
      <section className="yatut-gallery-shell">
        <div
          className={`yatut-gallery-media-side ${
            uiVisible
              ? "is-ui-visible"
              : ""
          }`}
          onClick={() =>
            setUiVisible(
              !uiVisible
            )
          }
        >
          <div className="yatut-gallery-background">
            <img
              src={
                currentImage
              }
              alt=""
            />
          </div>

          <header className="yatut-gallery-topbar">
            <div className="yatut-gallery-brand">
              <span>
                Я
              </span>

              <strong>
                ЯТУТ
              </strong>
            </div>

            <div className="yatut-gallery-top-actions">
              <span className="yatut-gallery-counter">
                {index + 1}
                {" / "}
                {images.length}
              </span>

              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  zoomOut();
                }}
                disabled={
                  zoom <= 1
                }
                title="Зменшити"
              >
                <Minus
                  size={18}
                />
              </button>

              <span className="yatut-gallery-zoom">
                {Math.round(
                  zoom * 100
                )}
                %
              </span>

              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  zoomIn();
                }}
                disabled={
                  zoom >= 3
                }
                title="Збільшити"
              >
                <Plus
                  size={18}
                />
              </button>

              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  download();
                }}
                title="Завантажити"
              >
                <Download
                  size={18}
                />
              </button>

              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  share();
                }}
                title="Поширити"
              >
                <Share2
                  size={18}
                />
              </button>

              <button
                type="button"
                className="yatut-gallery-close"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  onClose?.();
                }}
              >
                <X
                  size={21}
                />
              </button>
            </div>
          </header>

          <div className="yatut-gallery-image-stage">
            <img
              src={
                currentImage
              }
              alt="Фото публікації"
              draggable="false"
              style={{
                transform:
                  `scale(${zoom})`,
              }}
              onDoubleClick={(
                event
              ) => {
                event.stopPropagation();

                setZoom(
                  (current) =>
                    current >
                    1
                      ? 1
                      : 2
                );
              }}
            />
          </div>

          {images.length >
            1 && (
            <>
              <button
                type="button"
                className="yatut-gallery-arrow yatut-gallery-arrow-left"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  previous();
                }}
              >
                <ChevronLeft
                  size={28}
                />
              </button>

              <button
                type="button"
                className="yatut-gallery-arrow yatut-gallery-arrow-right"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  next();
                }}
              >
                <ChevronRight
                  size={28}
                />
              </button>
            </>
          )}

          {images.length >
            1 && (
            <div
              className="yatut-gallery-thumbs"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              {images.map(
                (
                  image,
                  imageIndex
                ) => (
                  <button
                    key={`${image}-${imageIndex}`}
                    type="button"
                    className={
                      imageIndex ===
                      index
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setIndex(
                        imageIndex
                      )
                    }
                  >
                    <img
                      src={
                        image
                      }
                      alt=""
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="yatut-gallery-info-side">
          <div className="yatut-gallery-post-head">
            <div className="yatut-gallery-post-avatar">
              {post.initials ||
                post.authorName?.[0] ||
                "Я"}
            </div>

            <div>
              <strong>
                {post.authorName ||
                  "Користувач"}
              </strong>

              <span>
                {post.time ||
                  "щойно"}

                {post.location
                  ? ` · ${post.location}`
                  : ""}
              </span>
            </div>
          </div>

          {post.text && (
            <p className="yatut-gallery-post-text">
              {
                post.text
              }
            </p>
          )}

          {post.mood && (
            <div className="yatut-gallery-post-mood">
              {
                post.mood
              }
            </div>
          )}

          <GalleryComments
            post={
              post
            }
            onAddComment={
              onAddComment
            }
          />
        </div>
      </section>
    </div>
  );
}

export default PostGalleryViewer;