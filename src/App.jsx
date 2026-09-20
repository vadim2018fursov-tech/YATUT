import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./App.css";
import "./styles/global-create.css";
import "./styles/spaces-premium.css";
import "./styles/community-events.css";
import "./styles/events-community-link.css";
import "./styles/events-premium.css";
import "./styles/events-pulse.css";
import "./styles/now-page-v2.css";
import "./styles/pulse-tokens.css";
import "./styles/pulse-page.css";
import "./styles/pulse-map.css";
import "./styles/pulse-video.css";
import "./styles/pulse-wave.css";
import "./styles/pulse-mobile.css";
import "./styles/pulse-immersive-mobile.css";
import "./styles/pulse-clips.css";
import "./styles/pulse-city.css";
import "./styles/pulse-watch.css";
import "./styles/pulse-player.css";
import "./styles/pulse-live-page.css";
import "./styles/pulse-studio.css";
import "./styles/pulse-motion.css";
import "./styles/pulse-responsive.css";
import "./styles/pulse-clips-layout-fix.css";
import "./mobile-app-hotfix.css";
import "./styles/chat-conversation-mobile.css";
import "./styles/pulse-long-video-mobile.css";

import Stories from "./components/Stories";
import Profile from "./components/Profile";
import Friends from "./components/Friends";
import Search from "./components/Search";
import Chats from "./components/Chats";
import Spaces from "./components/Spaces";

import Nearby from "./components/Nearby";
import Business from "./components/Business";
import Saved from "./components/Saved";
import Settings from "./components/Settings";
import Notifications from "./components/Notifications";

import NowPage from "./pages/NowPage";
import PulsePage from "./pages/PulsePage";
import ClipsPage from "./pages/ClipsPage";
import WatchPage from "./pages/WatchPage";
import LivePage from "./pages/LivePage";
import CityPulsePage from "./pages/CityPulsePage";
import EventsPulsePage from "./pages/EventsPulsePage";
import CreatorStudioPage from "./pages/CreatorStudioPage";
import CreateHubPage from "./pages/CreateHubPage";
import CreateMediaPage from "./pages/CreateMediaPage";

import YatutIcon from "./components/YatutIcon";

import {
  createSavedPost,
  isSaved,
  removeSavedItem,
  subscribeSavedItems,
  toggleSaved,
} from "./storage/savedService";

import {
  getNotifications,
  getUnreadCount,
  ingestNotificationEvent,
  markNotificationRead,
  subscribeNotifications,
} from "./storage/notificationService";

/* =========================================================
   YATUT APP
========================================================= */

const HOME_STORAGE_KEY =
  "yatut-home-posts-v7";

/* =========================================================
   MAIN NAVIGATION
========================================================= */

const MAIN_NAV = [
  {
    id: "home",
    icon: "home",
    title: "Головна",
  },

  {
    id: "now",
    icon: "now",
    title: "Зараз",
  },

  {
    id: "pulse",
    icon: "pulse",
    title: "PULSE",
  },

  {
    id: "friends",
    icon: "friends",
    title: "Друзі",
  },

  {
    id: "search",
    icon: "search",
    title: "Пошук",
  },

  {
    id: "chats",
    icon: "chats",
    title: "Чати",
  },

  {
    id: "communities",
    icon: "community",
    title: "Спільноти",
  },

  {
    id: "events",
    icon: "events",
    title: "Події",
  },

  {
    id: "nearby",
    icon: "nearby",
    title: "Поруч",
  },

  {
    id: "business",
    icon: "business",
    title: "Бізнес",
  },
];

const SECONDARY_NAV = [
  {
    id: "saved",
    icon: "saved",
    title: "Збережене",
  },

  {
    id: "settings",
    icon: "settings",
    title: "Налаштування",
  },
];

const MOBILE_NAV = [
  {
    id: "home",
    icon: "home",
    title: "Головна",
  },

  {
    id: "pulse",
    icon: "pulse",
    title: "PULSE",
  },

  {
    id: "create",
    icon: "Я",
    title: "Створити",
  },

  {
    id: "chats",
    icon: "chats",
    title: "Чати",
  },

  {
    id: "profile",
    icon: "friends",
    title: "Профіль",
  },
];

/* =========================================================
   DEMO POSTS
========================================================= */

const DEMO_POSTS = [
  {
    id:
      "welcome-yatut",

    authorId:
      "yatut",

    authorName:
      "ЯТУТ",

    authorUsername:
      "yatut",

    authorInitial:
      "Я",

    own:
      false,

    text:
      "Твоя мережа. Твої люди. Твоє життя. Тут починається ЯТУТ.",

    media:
      null,

    mediaType:
      null,

    liked:
      false,

    likes:
      128,

    comments: [
      {
        id:
          "welcome-comment-1",

        authorId:
          "maria",

        authorName:
          "Марія Коваль",

        authorInitial:
          "М",

        text:
          "Виглядає дуже цікаво 👀",

        createdAt:
          Date.now() -
          12 *
            60 *
            1000,

        replies:
          [],
      },
    ],

    shares:
      17,

    createdAt:
      Date.now() -
      18 *
        60 *
        1000,
  },

  {
    id:
      "welcome-people",

    authorId:
      "maria",

    authorName:
      "Марія Коваль",

    authorUsername:
      "maria.koval",

    authorInitial:
      "М",

    own:
      false,

    text:
      "Хто сьогодні в Києві? Хочу ввечері прогулятися центром ✨",

    media:
      null,

    mediaType:
      null,

    liked:
      true,

    likes:
      24,

    comments:
      [],

    shares:
      2,

    createdAt:
      Date.now() -
      41 *
        60 *
        1000,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function createId(
  prefix = "id"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/* =========================================================
   RELATIVE TIME
========================================================= */

function formatRelativeTime(
  value
) {
  const created =
    Number(
      value ||
        Date.now()
    );

  const diff =
    Math.max(
      0,
      Date.now() -
        created
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
    return "зараз";
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

/* =========================================================
   LOAD POSTS
========================================================= */

function safeLoadPosts() {
  try {
    const raw =
      localStorage.getItem(
        HOME_STORAGE_KEY
      );

    if (!raw) {
      return DEMO_POSTS;
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return DEMO_POSTS;
    }

    return parsed.map(
      (
        post
      ) => ({
        ...post,

        comments:
          Array.isArray(
            post.comments
          )
            ? post.comments.map(
                (
                  comment
                ) => ({
                  ...comment,

                  replies:
                    Array.isArray(
                      comment.replies
                    )
                      ? comment.replies
                      : [],
                })
              )
            : [],
      })
    );
  } catch (error) {
    console.warn(
      "HOME POSTS LOAD ERROR:",
      error
    );

    return DEMO_POSTS;
  }
}

/* =========================================================
   SAVE POSTS
========================================================= */

function safeSavePosts(
  posts
) {
  try {
    localStorage.setItem(
      HOME_STORAGE_KEY,
      JSON.stringify(
        posts
      )
    );
  } catch (error) {
    console.warn(
      "HOME POSTS SAVE ERROR:",
      error
    );
  }
}

/* =========================================================
   FILE TO DATA URL
========================================================= */

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

/* =========================================================
   HIGHLIGHT
========================================================= */

function highlightElement(
  element
) {
  if (!element) {
    return;
  }

  if (
    typeof element.animate ===
    "function"
  ) {
    element.animate(
      [
        {
          boxShadow:
            "0 0 0 0 rgba(99,91,255,0)",
        },

        {
          boxShadow:
            "0 0 0 4px rgba(99,91,255,0.18)",
        },

        {
          boxShadow:
            "0 0 0 0 rgba(99,91,255,0)",
        },
      ],

      {
        duration:
          1800,

        easing:
          "ease",
      }
    );
  }
}

/* =========================================================
   POST COMPOSER
========================================================= */

function PostComposer({
  onPublish,
}) {
  const [
    text,
    setText,
  ] =
    useState("");

  const [
    media,
    setMedia,
  ] =
    useState(null);

  const [
    mediaType,
    setMediaType,
  ] =
    useState(null);

  const [
    publishing,
    setPublishing,
  ] =
    useState(false);

  const imageInputRef =
    useRef(null);

  const videoInputRef =
    useRef(null);

  async function chooseFile(
    file,
    type
  ) {
    if (!file) {
      return;
    }

    try {
      const dataUrl =
        await fileToDataUrl(
          file
        );

      setMedia(
        dataUrl
      );

      setMediaType(
        type
      );
    } catch (error) {
      console.error(
        "MEDIA READ ERROR:",
        error
      );
    }
  }

  async function publish() {
    const cleanText =
      text.trim();

    if (
      !cleanText &&
      !media
    ) {
      return;
    }

    if (
      publishing
    ) {
      return;
    }

    try {
      setPublishing(
        true
      );

      await onPublish({
        text:
          cleanText,

        media,

        mediaType,
      });

      setText("");

      setMedia(
        null
      );

      setMediaType(
        null
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }

      if (
        videoInputRef.current
      ) {
        videoInputRef.current.value =
          "";
      }
    } finally {
      setPublishing(
        false
      );
    }
  }

  return (
    <section className="post-composer">
      <div className="composer-main">
        <button
          className="avatar"
          type="button"
        >
          В
        </button>

        <textarea
          value={
            text
          }
          onChange={(
            event
          ) =>
            setText(
              event.target.value
            )
          }
          placeholder="Що у вас нового?"
          maxLength={
            4000
          }
        />
      </div>

      {media && (
        <div className="composer-media-preview">
          {mediaType ===
          "video" ? (
            <video
              src={
                media
              }
              controls
              playsInline
            />
          ) : (
            <img
              src={
                media
              }
              alt="Попередній перегляд"
            />
          )}

          <button
            type="button"
            onClick={() => {
              setMedia(
                null
              );

              setMediaType(
                null
              );
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="composer-footer">
        <div className="composer-tools">
          <button
            type="button"
            onClick={() =>
              imageInputRef.current?.click()
            }
          >
            <YatutIcon
              name="image"
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
            <YatutIcon
              name="video"
              size={17}
            />

            Відео
          </button>

          <button
            type="button"
          >
            <YatutIcon
              name="pin"
              size={17}
            />

            Місце
          </button>

          <button
            type="button"
          >
            <YatutIcon
              name="poll"
              size={17}
            />

            Опитування
          </button>

          <button
            type="button"
          >
            <YatutIcon
              name="events"
              size={17}
            />

            Подія
          </button>
        </div>

        <button
          className="publish-button"
          type="button"
          disabled={
            publishing ||
            (!text.trim() &&
              !media)
          }
          onClick={
            publish
          }
        >
          {publishing
            ? "Публікуємо..."
            : "Опублікувати"}
        </button>
      </div>

      <input
        ref={
          imageInputRef
        }
        className="hidden-file-input"
        type="file"
        accept="image/*"
        onChange={(
          event
        ) =>
          chooseFile(
            event.target.files?.[0],
            "image"
          )
        }
      />

      <input
        ref={
          videoInputRef
        }
        className="hidden-file-input"
        type="file"
        accept="video/*"
        onChange={(
          event
        ) =>
          chooseFile(
            event.target.files?.[0],
            "video"
          )
        }
      />
    </section>
  );
}

/* =========================================================
   COMMENT ITEM
========================================================= */

function CommentItem({
  comment,
}) {
  return (
    <div
      id={`yatut-comment-${comment.id}`}
      className="comment-thread"
      data-comment-id={
        comment.id
      }
    >
      <div className="comment-row">
        <div className="comment-avatar">
          {comment.authorInitial ||
            "К"}
        </div>

        <div className="comment-body">
          <div className="comment-bubble">
            <strong>
              {comment.authorName ||
                "Користувач"}
            </strong>

            <p>
              {
                comment.text
              }
            </p>
          </div>

          <div className="comment-meta-actions">
            <span>
              {formatRelativeTime(
                comment.createdAt
              )}
            </span>

            <button
              type="button"
            >
              Подобається
            </button>

            <button
              type="button"
            >
              Відповісти
            </button>
          </div>

          {Array.isArray(
            comment.replies
          ) &&
            comment.replies.length >
              0 && (
              <div className="comment-replies">
                {comment.replies.map(
                  (
                    reply
                  ) => (
                    <div
                      id={`yatut-reply-${reply.id}`}
                      className="comment-row comment-reply-row"
                      key={
                        reply.id
                      }
                    >
                      <div className="comment-avatar">
                        {reply.authorInitial ||
                          "К"}
                      </div>

                      <div className="comment-body">
                        <div className="comment-bubble">
                          <strong>
                            {reply.authorName ||
                              "Користувач"}
                          </strong>

                          <p>
                            {
                              reply.text
                            }
                          </p>
                        </div>

                        <div className="comment-meta-actions">
                          <span>
                            {formatRelativeTime(
                              reply.createdAt
                            )}
                          </span>

                          <button
                            type="button"
                          >
                            Подобається
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMMENTS
========================================================= */

function PostComments({
  post,
  onAddComment,
}) {
  const [
    draft,
    setDraft,
  ] =
    useState("");

  function submit() {
    const text =
      draft.trim();

    if (!text) {
      return;
    }

    onAddComment(
      post.id,
      text
    );

    setDraft("");
  }

  return (
    <section className="comments-section">
      {post.comments
        ?.length ? (
        <div>
          {post.comments.map(
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
              />
            )
          )}
        </div>
      ) : (
        <div className="comments-empty">
          Коментарів ще немає. Будьте першим.
        </div>
      )}

      <div className="comment-composer">
        <div className="comment-avatar">
          В
        </div>

        <div className="comment-input-box">
          <textarea
            value={
              draft
            }
            onChange={(
              event
            ) =>
              setDraft(
                event.target.value
              )
            }
            placeholder="Написати коментар..."
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
            className="send-comment"
            type="button"
            disabled={
              !draft.trim()
            }
            onClick={
              submit
            }
          >
            ↑
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   POST CARD
========================================================= */

function PostCard({
  post,
  commentsOpen,
  saved,
  onToggleComments,
  onToggleLike,
  onDelete,
  onAddComment,
  onShare,
  onToggleSaved,
}) {
  return (
    <article
      id={`yatut-post-${post.id}`}
      className="post-card"
      data-post-id={
        post.id
      }
    >
      <header className="post-header">
        <div className="post-author">
          <div className="avatar">
            {post.authorInitial ||
              "Я"}
          </div>

          <div>
            <strong>
              {
                post.authorName
              }
            </strong>

            <span>
              @
              {
                post.authorUsername
              }{" "}
              ·{" "}
              {formatRelativeTime(
                post.createdAt
              )}
            </span>
          </div>
        </div>

        {post.own ? (
          <button
            className="post-delete-button"
            type="button"
            onClick={() =>
              onDelete(
                post.id
              )
            }
            aria-label="Видалити допис"
          >
            <YatutIcon
              name="more"
              size={18}
            />
          </button>
        ) : (
          <button
            className="post-delete-button"
            type="button"
            aria-label="Меню допису"
          >
            <YatutIcon
              name="more"
              size={18}
            />
          </button>
        )}
      </header>

      {post.text && (
        <div className="post-text">
          {
            post.text
          }
        </div>
      )}

      {post.media && (
        <div className="post-media">
          {post.mediaType ===
          "video" ? (
            <video
              src={
                post.media
              }
              controls
              playsInline
            />
          ) : (
            <img
              src={
                post.media
              }
              alt="Медіа допису"
            />
          )}
        </div>
      )}

      <div className="post-stats">
        <span>
          {post.likes ||
            0}{" "}
          вподобань
        </span>

        <span>
          {post.comments
            ?.length ||
            0}{" "}
          коментарів
        </span>

        <span>
          {post.shares ||
            0}{" "}
          поширень
        </span>
      </div>

      <div className="post-actions">
        <button
          className={
            post.liked
              ? "reaction-active"
              : ""
          }
          type="button"
          onClick={() =>
            onToggleLike(
              post.id
            )
          }
        >
          <YatutIcon
            name="heart"
            size={17}
          />

          Подобається
        </button>

        <button
          type="button"
          onClick={() =>
            onToggleComments(
              post.id
            )
          }
        >
          <YatutIcon
            name="chats"
            size={17}
          />

          Коментар
        </button>

        <button
          type="button"
          onClick={() =>
            onShare(
              post.id
            )
          }
        >
          <YatutIcon
            name="share"
            size={17}
          />

          Поділитися
        </button>

        <button
          className={`post-save-button ${
            saved
              ? "reaction-active"
              : ""
          }`}
          type="button"
          onClick={
            onToggleSaved
          }
        >
          <YatutIcon
            name="saved"
            size={17}
          />

          <span>
            Зберегти
          </span>
        </button>
      </div>

      {commentsOpen && (
        <PostComments
          post={
            post
          }
          onAddComment={
            onAddComment
          }
        />
      )}
    </article>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home({
  onNavigate,
}) {
  const [
    feedTab,
    setFeedTab,
  ] =
    useState(
      "for-you"
    );

  const [
    posts,
    setPosts,
  ] =
    useState(
      () =>
        safeLoadPosts()
    );

  const [
    openComments,
    setOpenComments,
  ] =
    useState({});

  const [
    savedVersion,
    setSavedVersion,
  ] =
    useState(0);

  useEffect(() => {
    safeSavePosts(
      posts
    );
  }, [
    posts,
  ]);

  useEffect(() => {
    const unsubscribe =
      subscribeSavedItems(
        () => {
          setSavedVersion(
            (
              previous
            ) =>
              previous +
              1
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /* =======================================================
     INCOMING ACTIVITY
  ======================================================= */

  useEffect(() => {
    function handleIncomingActivity(
      event
    ) {
      const activity =
        event?.detail;

      if (
        !activity?.type
      ) {
        return;
      }

      ingestNotificationEvent(
        activity
      );
    }

    window.addEventListener(
      "yatut:incoming-activity",
      handleIncomingActivity
    );

    return () => {
      window.removeEventListener(
        "yatut:incoming-activity",
        handleIncomingActivity
      );
    };
  }, []);

  /* =======================================================
     OPEN POST FROM NOTIFICATION
  ======================================================= */

  useEffect(() => {
    let timer =
      null;

    try {
      const raw =
        sessionStorage.getItem(
          "yatut-open-route-payload"
        );

      if (!raw) {
        return undefined;
      }

      const parsed =
        JSON.parse(
          raw
        );

      if (
        parsed?.route !==
        "home"
      ) {
        return undefined;
      }

      const payload =
        parsed?.payload ||
        {};

      const postId =
        payload.postId;

      const commentId =
        payload.commentId;

      const replyId =
        payload.replyId;

      const shouldOpenComments =
        Boolean(
          payload.openComments ||
            commentId ||
            replyId
        );

      if (!postId) {
        sessionStorage.removeItem(
          "yatut-open-route-payload"
        );

        return undefined;
      }

      setFeedTab(
        "for-you"
      );

      if (
        shouldOpenComments
      ) {
        setOpenComments(
          (
            previous
          ) => ({
            ...previous,

            [postId]:
              true,
          })
        );
      }

      timer =
        window.setTimeout(
          () => {
            if (
              commentId
            ) {
              const commentElement =
                document.getElementById(
                  `yatut-comment-${commentId}`
                );

              if (
                commentElement
              ) {
                commentElement.scrollIntoView({
                  behavior:
                    "smooth",

                  block:
                    "center",
                });

                highlightElement(
                  commentElement
                );

                sessionStorage.removeItem(
                  "yatut-open-route-payload"
                );

                return;
              }
            }

            if (
              replyId
            ) {
              const replyElement =
                document.getElementById(
                  `yatut-reply-${replyId}`
                );

              if (
                replyElement
              ) {
                replyElement.scrollIntoView({
                  behavior:
                    "smooth",

                  block:
                    "center",
                });

                highlightElement(
                  replyElement
                );

                sessionStorage.removeItem(
                  "yatut-open-route-payload"
                );

                return;
              }
            }

            const postElement =
              document.getElementById(
                `yatut-post-${postId}`
              );

            if (
              postElement
            ) {
              postElement.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "center",
              });

              highlightElement(
                postElement
              );
            }

            sessionStorage.removeItem(
              "yatut-open-route-payload"
            );
          },
          shouldOpenComments
            ? 220
            : 120
        );
    } catch (error) {
      console.warn(
        "HOME OPEN ROUTE PAYLOAD ERROR:",
        error
      );
    }

    return () => {
      if (
        timer
      ) {
        window.clearTimeout(
          timer
        );
      }
    };
  }, [
    posts,
  ]);

  const visiblePosts =
    useMemo(
      () => {
        if (
          feedTab ===
          "friends"
        ) {
          return posts.filter(
            (
              post
            ) =>
              post.authorId !==
              "yatut"
          );
        }

        if (
          feedTab ===
          "following"
        ) {
          return posts.filter(
            (
              post
            ) =>
              [
                "yatut",
                "maria",
              ].includes(
                post.authorId
              )
          );
        }

        return posts;
      },
      [
        feedTab,
        posts,
      ]
    );

  async function publishPost({
    text,
    media,
    mediaType,
  }) {
    const post = {
      id:
        createId(
          "post"
        ),

      authorId:
        "me",

      authorName:
        "Вадим",

      authorUsername:
        "vadim",

      authorInitial:
        "В",

      own:
        true,

      text,

      media,

      mediaType,

      liked:
        false,

      likes:
        0,

      comments:
        [],

      shares:
        0,

      createdAt:
        Date.now(),
    };

    setPosts(
      (
        previous
      ) => [
        post,
        ...previous,
      ]
    );
  }

  function toggleLike(
    postId
  ) {
    setPosts(
      (
        previous
      ) =>
        previous.map(
          (
            post
          ) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            const nextLiked =
              !post.liked;

            return {
              ...post,

              liked:
                nextLiked,

              likes:
                Math.max(
                  0,

                  Number(
                    post.likes ||
                      0
                  ) +
                    (nextLiked
                      ? 1
                      : -1)
                ),
            };
          }
        )
    );
  }

  function deletePost(
    postId
  ) {
    const confirmed =
      window.confirm(
        "Видалити цей допис?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    setPosts(
      (
        previous
      ) =>
        previous.filter(
          (
            post
          ) =>
            post.id !==
            postId
        )
    );

    removeSavedItem(
      "post",
      postId
    );
  }

  function toggleComments(
    postId
  ) {
    setOpenComments(
      (
        previous
      ) => ({
        ...previous,

        [postId]:
          !previous[
            postId
          ],
      })
    );
  }

  function addComment(
    postId,
    text
  ) {
    const comment = {
      id:
        createId(
          "comment"
        ),

      authorId:
        "me",

      authorName:
        "Вадим",

      authorInitial:
        "В",

      text,

      createdAt:
        Date.now(),

      replies:
        [],
    };

    setPosts(
      (
        previous
      ) =>
        previous.map(
          (
            post
          ) =>
            post.id ===
            postId
              ? {
                  ...post,

                  comments: [
                    ...(post.comments ||
                      []),

                    comment,
                  ],
                }
              : post
        )
    );
  }

  function addIncomingComment({
    postId,
    commentId,
    personId,
    personName,
    personInitial,
    text,
  }) {
    if (
      !postId ||
      !personId ||
      !text
    ) {
      return;
    }

    const comment = {
      id:
        commentId ||
        createId(
          "comment"
        ),

      authorId:
        personId,

      authorName:
        personName ||
        "Користувач",

      authorInitial:
        personInitial ||
        String(
          personName ||
            "К"
        )
          .charAt(0)
          .toUpperCase(),

      text,

      createdAt:
        Date.now(),

      replies:
        [],
    };

    setPosts(
      (
        previous
      ) =>
        previous.map(
          (
            post
          ) =>
            post.id ===
            postId
              ? {
                  ...post,

                  comments: [
                    ...(post.comments ||
                      []),

                    comment,
                  ],
                }
              : post
        )
    );

    ingestNotificationEvent({
      type:
        "post.comment",

      data: {
        postId,

        commentId:
          comment.id,

        commentText:
          text,

        personId,

        personName,

        personInitial,
      },
    });
  }

  function addIncomingReply({
    postId,
    commentId,
    replyId,
    personId,
    personName,
    personInitial,
    text,
  }) {
    if (
      !postId ||
      !commentId ||
      !personId ||
      !text
    ) {
      return;
    }

    const reply = {
      id:
        replyId ||
        createId(
          "reply"
        ),

      authorId:
        personId,

      authorName:
        personName ||
        "Користувач",

      authorInitial:
        personInitial ||
        String(
          personName ||
            "К"
        )
          .charAt(0)
          .toUpperCase(),

      text,

      createdAt:
        Date.now(),
    };

    setPosts(
      (
        previous
      ) =>
        previous.map(
          (
            post
          ) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            return {
              ...post,

              comments:
                (
                  post.comments ||
                  []
                ).map(
                  (
                    comment
                  ) =>
                    comment.id ===
                    commentId
                      ? {
                          ...comment,

                          replies: [
                            ...(comment.replies ||
                              []),

                            reply,
                          ],
                        }
                      : comment
                ),
            };
          }
        )
    );

    ingestNotificationEvent({
      type:
        "comment.reply",

      data: {
        postId,

        commentId,

        replyId:
          reply.id,

        replyText:
          text,

        personId,

        personName,

        personInitial,
      },
    });
  }

  function addIncomingLike({
    postId,
    personId,
    personName,
    personInitial,
  }) {
    if (
      !postId ||
      !personId
    ) {
      return;
    }

    let postText =
      "";

    setPosts(
      (
        previous
      ) =>
        previous.map(
          (
            post
          ) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            postText =
              post.text ||
              "";

            return {
              ...post,

              likes:
                Number(
                  post.likes ||
                    0
                ) +
                1,
            };
          }
        )
    );

    ingestNotificationEvent({
      type:
        "post.like",

      data: {
        postId,

        postText,

        personId,

        personName,

        personInitial,
      },
    });
  }

  function addIncomingMention({
    postId,
    commentId = null,
    personId,
    personName,
    personInitial,
    text,
  }) {
    if (
      !personId
    ) {
      return;
    }

    ingestNotificationEvent({
      type:
        "mention",

      data: {
        postId,

        commentId,

        personId,

        personName,

        personInitial,

        text,
      },
    });
  }

  useEffect(() => {
    window.YATUT_FEED = {
      receiveLike:
        addIncomingLike,

      receiveComment:
        addIncomingComment,

      receiveReply:
        addIncomingReply,

      receiveMention:
        addIncomingMention,
    };

    return () => {
      if (
        window.YATUT_FEED
      ) {
        delete window.YATUT_FEED;
      }
    };
  });

  function sharePost(
    postId
  ) {
    setPosts(
      (
        previous
      ) =>
        previous.map(
          (
            post
          ) =>
            post.id ===
            postId
              ? {
                  ...post,

                  shares:
                    Number(
                      post.shares ||
                        0
                    ) +
                    1,
                }
              : post
        )
    );
  }

  function togglePostSaved(
    post
  ) {
    if (
      !post?.id
    ) {
      return;
    }

    toggleSaved(
      createSavedPost(
        post
      )
    );

    setSavedVersion(
      (
        previous
      ) =>
        previous +
        1
    );
  }

  return (
    <div className="feed-column">
      <Stories />

      <nav className="feed-tabs">
        <button
          className={`feed-tab ${
            feedTab ===
            "for-you"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() =>
            setFeedTab(
              "for-you"
            )
          }
        >
          Для вас
        </button>

        <button
          className={`feed-tab ${
            feedTab ===
            "friends"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() =>
            setFeedTab(
              "friends"
            )
          }
        >
          Друзі
        </button>

        <button
          className={`feed-tab ${
            feedTab ===
            "following"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() =>
            setFeedTab(
              "following"
            )
          }
        >
          Підписки
        </button>
      </nav>

      <PostComposer
        onPublish={
          publishPost
        }
      />

      <div
        className="feed"
        data-saved-version={
          savedVersion
        }
      >
        {visiblePosts.length ? (
          visiblePosts.map(
            (
              post
            ) => (
              <PostCard
                key={
                  post.id
                }
                post={
                  post
                }
                commentsOpen={Boolean(
                  openComments[
                    post.id
                  ]
                )}
                saved={isSaved(
                  "post",
                  post.id
                )}
                onToggleComments={
                  toggleComments
                }
                onToggleLike={
                  toggleLike
                }
                onDelete={
                  deletePost
                }
                onAddComment={
                  addComment
                }
                onShare={
                  sharePost
                }
                onToggleSaved={() =>
                  togglePostSaved(
                    post
                  )
                }
              />
            )
          )
        ) : (
          <div className="card empty-card">
            Тут поки немає дописів.
          </div>
        )}
      </div>

      <section className="card temporary-page">
        <div className="temporary-icon">
          Я
        </div>

        <h1>
          Знайди своїх
        </h1>

        <p>
          Знаходьте друзів,
          спільноти, навчальні
          простори та події
          навколо вас.
        </p>

        <div
          style={{
            marginTop:
              18,

            display:
              "flex",

            flexWrap:
              "wrap",

            justifyContent:
              "center",

            gap:
              8,
          }}
        >
          <button
            className="publish-button"
            type="button"
            onClick={() =>
              onNavigate(
                "friends"
              )
            }
          >
            Друзі
          </button>

          <button
            className="publish-button"
            type="button"
            onClick={() =>
              onNavigate(
                "communities"
              )
            }
          >
            Спільноти
          </button>

          <button
            className="publish-button"
            type="button"
            onClick={() =>
              onNavigate(
                "events"
              )
            }
          >
            Події
          </button>

          <button
            className="publish-button"
            type="button"
            onClick={() =>
              onNavigate(
                "nearby"
              )
            }
          >
            Поруч
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   RIGHT SIDEBAR
========================================================= */

function RightSidebar({
  onNavigate,
  onOpenChat,
}) {
  return (
    <aside className="right-sidebar">
      <section className="right-card">
        <header className="right-card-header">
          <span>
            ЗАРАЗ
          </span>

          <button
            type="button"
          >
            <YatutIcon
              name="more"
              size={17}
            />
          </button>
        </header>

        <button
          className="now-item"
          type="button"
          onClick={() =>
            onNavigate(
              "nearby"
            )
          }
        >
          <div className="now-icon">
            <YatutIcon
              name="nearby"
              size={19}
            />
          </div>

          <div>
            <strong>
              Поруч із вами
            </strong>

            <small>
              Люди, місця та активності
            </small>
          </div>
        </button>

        <button
          className="now-item"
          type="button"
          onClick={() =>
            onNavigate(
              "events"
            )
          }
        >
          <div className="now-icon">
            <YatutIcon
              name="events"
              size={19}
            />
          </div>

          <div>
            <strong>
              Події поруч
            </strong>

            <small>
              Дивитися події у вашому місті
            </small>
          </div>
        </button>

        <button
          className="now-item"
          type="button"
          onClick={() =>
            onNavigate(
              "communities"
            )
          }
        >
          <div className="now-icon">
            <YatutIcon
              name="community"
              size={19}
            />
          </div>

          <div>
            <strong>
              Нові спільноти
            </strong>

            <small>
              Школи, клуби та робочі простори
            </small>
          </div>
        </button>
      </section>

      <section className="right-card">
        <header className="right-card-header">
          <span>
            ЛЮДИ ОНЛАЙН
          </span>

          <button
            type="button"
            onClick={() =>
              onNavigate(
                "friends"
              )
            }
          >
            <YatutIcon
              name="arrowRight"
              size={16}
            />
          </button>
        </header>

        <button
          className="suggestion-person"
          type="button"
          onClick={() =>
            onOpenChat(
              "maria"
            )
          }
        >
          <div className="avatar">
            М
          </div>

          <div>
            <strong>
              Марія Коваль
            </strong>

            <small>
              онлайн · написати
            </small>
          </div>
        </button>

        <button
          className="suggestion-person"
          type="button"
          onClick={() =>
            onOpenChat(
              "oleksandr"
            )
          }
        >
          <div className="avatar">
            О
          </div>

          <div>
            <strong>
              Олександр Бондар
            </strong>

            <small>
              онлайн · написати
            </small>
          </div>
        </button>

        <button
          className="right-see-all"
          type="button"
          onClick={() =>
            onNavigate(
              "friends"
            )
          }
        >
          Усі друзі
        </button>
      </section>

      <section className="right-card">
        <header className="right-card-header">
          <span>
            ЯТУТ
          </span>
        </header>

        <button
          className="now-item"
          type="button"
          onClick={() =>
            onNavigate(
              "search"
            )
          }
        >
          <div className="now-icon">
            <YatutIcon
              name="search"
              size={19}
            />
          </div>

          <div>
            <strong>
              Знайди своїх
            </strong>

            <small>
              Люди, міста, навчання та робота
            </small>
          </div>
        </button>

        <button
          className="now-item"
          type="button"
          onClick={() =>
            onNavigate(
              "business"
            )
          }
        >
          <div className="now-icon">
            <YatutIcon
              name="business"
              size={19}
            />
          </div>

          <div>
            <strong>
              ЯТУТ Бізнес
            </strong>

            <small>
              Компанії та послуги
            </small>
          </div>
        </button>
      </section>
    </aside>
  );
}

/* =========================================================
   TOP BAR
========================================================= */

function TopBar({
  currentPage,
  onNavigate,
  notificationOpen,
  onToggleNotifications,
  unreadNotifications,
  unreadChatMessages,
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button
          className="brand"
          type="button"
          onClick={() =>
            onNavigate(
              "home"
            )
          }
          aria-label="ЯТУТ — Головна"
        >
          <span className="brand-ya">
            Я
          </span>

          <strong className="brand-tut">
            ТУТ
          </strong>
        </button>

        <button
          className="desktop-search"
          type="button"
          onClick={() =>
            onNavigate(
              "search"
            )
          }
          aria-label="Пошук у ЯТУТ"
        >
          <span className="desktop-search-content">
            <YatutIcon
              name="search"
              size={18}
            />

            <span>
              Пошук у ЯТУТ
            </span>
          </span>

        </button>

        <div className="topbar-actions">
          {/* MOBILE SEARCH */}

          <button
            className="icon-button mobile-search-action"
            type="button"
            onClick={() =>
              onNavigate(
                "search"
              )
            }
            aria-label="Пошук"
            title="Пошук"
          >
            <YatutIcon
              name="search"
              size={20}
            />
          </button>

          {/* NOW */}

          <button
            className={`icon-button topbar-now-button ${
              currentPage ===
              "now"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              onNavigate(
                "now"
              )
            }
            aria-label="Зараз"
            title="Зараз"
          >
            <YatutIcon
              name="now"
              size={20}
            />
          </button>

          {/* NOTIFICATIONS */}

          <button
            className={`icon-button ${
              notificationOpen
                ? "active"
                : ""
            }`}
            type="button"
            onClick={
              onToggleNotifications
            }
            aria-label="Сповіщення"
            aria-expanded={
              notificationOpen
            }
            data-notification-trigger
          >
            <YatutIcon
              name="bell"
              size={20}
            />

            {unreadNotifications >
              0 && (
              <span className="notification-dot">
                {unreadNotifications >
                9
                  ? "9+"
                  : unreadNotifications}
              </span>
            )}
          </button>

          {/* CHATS */}

          <button
            className={`icon-button ${
              currentPage ===
              "chats"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              onNavigate(
                "chats"
              )
            }
            aria-label="Чати"
            style={{
              position:
                "relative",

              overflow:
                "visible",
            }}
          >
            <YatutIcon
              name="chats"
              size={20}
            />

            {unreadChatMessages >
              0 && (
              <span
                className="chat-topbar-badge"
                style={{
                  position:
                    "absolute",

                  top:
                    4,

                  right:
                    2,

                  minWidth:
                    19,

                  height:
                    19,

                  padding:
                    "0 5px",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  border:
                    "2px solid #fff",

                  borderRadius:
                    999,

                  background:
                    "#635BFF",

                  color:
                    "#fff",

                  fontSize:
                    10,

                  fontWeight:
                    900,

                  lineHeight:
                    1,

                  boxSizing:
                    "border-box",

                  boxShadow:
                    "0 5px 14px rgba(99,91,255,.25)",

                  pointerEvents:
                    "none",
                }}
              >
                {unreadChatMessages >
                9
                  ? "9+"
                  : unreadChatMessages}
              </span>
            )}
          </button>

          {/* PROFILE */}

          <button
            className="profile-mini"
            type="button"
            onClick={() =>
              onNavigate(
                "profile"
              )
            }
            aria-label="Мій профіль"
          >
            В
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   LEFT SIDEBAR
========================================================= */

function LeftSidebar({
  currentPage,
  onNavigate,
}) {
  return (
    <aside className="left-sidebar">
      <nav className="main-nav">
        {MAIN_NAV.map(
          (
            item
          ) => (
            <button
              key={
                item.id
              }
              className={
                currentPage ===
                item.id
                  ? "active"
                  : ""
              }
              type="button"
              onClick={() =>
                onNavigate(
                  item.id
                )
              }
            >
              <span className="nav-icon">
                <YatutIcon
                  name={
                    item.icon
                  }
                  size={20}
                />
              </span>

              <strong>
                {
                  item.title
                }
              </strong>
            </button>
          )
        )}

        <div className="nav-separator" />

        {SECONDARY_NAV.map(
          (
            item
          ) => (
            <button
              key={
                item.id
              }
              className={
                currentPage ===
                item.id
                  ? "active"
                  : ""
              }
              type="button"
              onClick={() =>
                onNavigate(
                  item.id
                )
              }
            >
              <span className="nav-icon">
                <YatutIcon
                  name={
                    item.icon
                  }
                  size={20}
                />
              </span>

              <strong>
                {
                  item.title
                }
              </strong>
            </button>
          )
        )}
      </nav>

      <div className="sidebar-profile-card">
        <button
          type="button"
          onClick={() =>
            onNavigate(
              "profile"
            )
          }
        >
          <div className="avatar">
            В
          </div>

          <div>
            <strong>
              Вадим
            </strong>

            <span>
              @vadim
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function MobileNavigation({
  currentPage,
  onNavigate,
  unreadChatMessages,
}) {
  return (
    <nav className="mobile-nav">
      {MOBILE_NAV.map(
        (
          item
        ) => {
          if (
            item.id ===
            "create"
          ) {
            return (
              <button
                key={
                  item.id
                }
                className={`mobile-create-button ${
                  [
                    "create",
                    "createMedia",
                    "creatorStudio",
                  ].includes(
                    currentPage
                  )
                    ? "active"
                    : ""
                }`.trim()}
                type="button"
                aria-current={
                  [
                    "create",
                    "createMedia",
                    "creatorStudio",
                  ].includes(
                    currentPage
                  )
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  onNavigate(
                    "create"
                  )
                }
              >
                <span>
                  Я
                </span>

                <small>
                  Створити
                </small>
              </button>
            );
          }

          const active =
            currentPage ===
            item.id;

          return (
            <button
              key={
                item.id
              }
              className={`${
                active
                  ? "active"
                  : ""
              } ${
                item.id ===
                "pulse"
                  ? "mobile-pulse-button"
                  : ""
              }`.trim()}
              type="button"
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              onClick={() =>
                onNavigate(
                  item.id
                )
              }
              style={{
                position:
                  "relative",
              }}
            >
              {item.id ===
              "profile" ? (
                <span className="mobile-profile-avatar">
                  В
                </span>
              ) : (
                <span>
                  <YatutIcon
                    name={
                      item.icon
                    }
                    size={21}
                  />
                </span>
              )}

              {item.id ===
                "chats" &&
                unreadChatMessages >
                  0 && (
                  <span
                    style={{
                      position:
                        "absolute",

                      top:
                        3,

                      left:
                        "calc(50% + 5px)",

                      minWidth:
                        17,

                      height:
                        17,

                      padding:
                        "0 4px",

                      display:
                        "grid",

                      placeItems:
                        "center",

                      border:
                        "2px solid #fff",

                      borderRadius:
                        999,

                      background:
                        "#635BFF",

                      color:
                        "#fff",

                      fontSize:
                        9,

                      fontWeight:
                        900,

                      lineHeight:
                        1,

                      boxSizing:
                        "border-box",

                      pointerEvents:
                        "none",
                    }}
                  >
                    {unreadChatMessages >
                    9
                      ? "9+"
                      : unreadChatMessages}
                  </span>
                )}

              <small>
                {
                  item.title
                }
              </small>
            </button>
          );
        }
      )}
    </nav>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(
      "home"
    );

  const [
    chatPersonId,
    setChatPersonId,
  ] =
    useState(null);

  const [
    selectedCityId,
    setSelectedCityId,
  ] =
    useState("kyiv");

  const [
    selectedVideoId,
    setSelectedVideoId,
  ] =
    useState(null);

  const [
    selectedLiveVideoId,
    setSelectedLiveVideoId,
  ] =
    useState(null);

  const [
    selectedCreateType,
    setSelectedCreateType,
  ] =
    useState("video");

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] =
    useState(
      false
    );

  const [
    unreadNotifications,
    setUnreadNotifications,
  ] =
    useState(
      () =>
        getUnreadCount()
    );

  /* =======================================================
     CHAT BADGE

     Используем только уведомления type="message".
  ======================================================= */

  const [
    unreadChatMessages,
    setUnreadChatMessages,
  ] =
    useState(
      () =>
        getNotifications().filter(
          (
            notification
          ) =>
            !notification.read &&
            notification.type ===
              "message"
        ).length
    );

  /* =======================================================
     LIVE NOTIFICATION SYNC
  ======================================================= */

  useEffect(() => {
    const unsubscribe =
      subscribeNotifications(
        (
          notifications
        ) => {
          setUnreadNotifications(
            notifications.filter(
              (
                notification
              ) =>
                !notification.read
            ).length
          );

          setUnreadChatMessages(
            notifications.filter(
              (
                notification
              ) =>
                !notification.read &&
                notification.type ===
                  "message"
            ).length
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  /* =======================================================
     MARK MESSAGE NOTIFICATIONS READ
  ======================================================= */

  function markChatNotificationsRead() {
    const unreadMessages =
      getNotifications().filter(
        (
          notification
        ) =>
          !notification.read &&
          notification.type ===
            "message"
      );

    unreadMessages.forEach(
      (
        notification
      ) => {
        markNotificationRead(
          notification.id
        );
      }
    );
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function goToPage(
    page,
    payload = null
  ) {
    if (!page) {
      return;
    }

    setNotificationsOpen(
      false
    );

    if (
      payload &&
      page !==
        "chats"
    ) {
      try {
        sessionStorage.setItem(
          "yatut-open-route-payload",
          JSON.stringify({
            route:
              page,

            payload,
          })
        );
      } catch (error) {
        console.warn(
          "ROUTE PAYLOAD SAVE ERROR:",
          error
        );
      }
    }

    /* =====================================================
       CHATS
    ===================================================== */

    if (
      page ===
      "chats"
    ) {
      /*
        Когда пользователь открывает раздел Чаты,
        считаем message-уведомления просмотренными.
      */

      markChatNotificationsRead();

      if (
        typeof payload ===
        "string"
      ) {
        setChatPersonId(
          payload
        );
      } else if (
        payload?.personId
      ) {
        setChatPersonId(
          payload.personId
        );
      } else {
        setChatPersonId(
          null
        );
      }

      /*
        Если уведомление передало конкретный chatId,
        сохраняем его для существующего Chats.jsx.
      */

      if (
        payload?.chatId
      ) {
        try {
          sessionStorage.setItem(
            "yatut-open-chat-id",
            payload.chatId
          );
        } catch (error) {
          console.warn(
            "OPEN CHAT ID SAVE ERROR:",
            error
          );
        }
      }
    }

    if (
      page === "cityPulse" &&
      payload?.cityId
    ) {
      setSelectedCityId(
        payload.cityId
      );
    }

    if (
      page === "clips" ||
      page === "watch"
    ) {
      setSelectedVideoId(
        payload?.videoId ||
        null
      );
    }

    if (
      page === "live"
    ) {
      setSelectedLiveVideoId(
        payload?.videoId ||
        null
      );
    }

    if (
      page === "createMedia" &&
      payload?.type
    ) {
      setSelectedCreateType(
        payload.type
      );
    }

    setCurrentPage(
      page
    );

    window.scrollTo({
      top:
        0,

      left:
        0,

      behavior:
        "auto",
    });
  }

  /* =======================================================
     OPEN PERSON CHAT
  ======================================================= */

  function openPersonChat(
    personId
  ) {
    if (
      !personId
    ) {
      return;
    }

    setNotificationsOpen(
      false
    );

    /*
      Переход в чат из Friends/Profile также считается
      просмотром message-уведомлений.
    */

    markChatNotificationsRead();

    setChatPersonId(
      personId
    );

    setCurrentPage(
      "chats"
    );

    window.scrollTo({
      top:
        0,

      left:
        0,

      behavior:
        "auto",
    });
  }

  /* =======================================================
     ROUTER
  ======================================================= */

  function renderPage() {
    switch (
      currentPage
    ) {
      case "home":
        return (
          <Home
            onNavigate={
              goToPage
            }
          />
        );

      case "now":
        return (
          <NowPage
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "pulse":
        return (
          <PulsePage
            onNavigate={
              goToPage
            }
          />
        );

      case "clips":
        return (
          <ClipsPage
            key={
              selectedVideoId ||
              "clips"
            }
            initialVideoId={
              selectedVideoId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "watch":
        return (
          <WatchPage
            key={
              selectedVideoId ||
              "watch"
            }
            initialVideoId={
              selectedVideoId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "live":
        return (
          <LivePage
            key={
              selectedLiveVideoId ||
              "live"
            }
            initialVideoId={
              selectedLiveVideoId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "cityPulse":
        return (
          <CityPulsePage
            cityId={
              selectedCityId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "create":
        return (
          <CreateHubPage
            onNavigate={
              goToPage
            }
          />
        );

      case "createMedia":
        return (
          <CreateMediaPage
            type={
              selectedCreateType
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "creatorStudio":
        return (
          <CreatorStudioPage
            onNavigate={
              goToPage
            }
          />
        );

      case "friends":
        return (
          <Friends
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "search":
        return (
          <Search
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "chats":
        return (
          <Chats
            initialPersonId={
              chatPersonId
            }
          />
        );

      case "communities":
        return (
          <Spaces
            onNavigate={
              goToPage
            }
          />
        );

      case "events":
        return (
          <EventsPulsePage
            onNavigate={
              goToPage
            }
          />
        );

      case "profile":
        return (
          <Profile
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "nearby":
        return (
          <Nearby
            onNavigate={
              goToPage
            }
          />
        );

      case "business":
        return (
          <Business
            onNavigate={
              goToPage
            }
          />
        );

      case "saved":
        return (
          <Saved
            onNavigate={
              goToPage
            }
          />
        );

      case "settings":
        return (
          <Settings />
        );

      default:
        return (
          <Home
            onNavigate={
              goToPage
            }
          />
        );
    }
  }

  const showRightSidebar =
    currentPage ===
    "home";

  const sidebarCurrentPage =
    [
      "clips",
      "watch",
      "live",
      "cityPulse",
    ].includes(
      currentPage
    )
      ? "pulse"
      : currentPage;

  const hideGlobalMobileNav =
    [
      "clips",
      "watch",
      "live",
      "cityPulse",
    ].includes(
      currentPage
    );

  return (
    <div className="app">
      <TopBar
        currentPage={
          currentPage
        }
        onNavigate={
          goToPage
        }
        notificationOpen={
          notificationsOpen
        }
        onToggleNotifications={() =>
          setNotificationsOpen(
            (
              previous
            ) =>
              !previous
          )
        }
        unreadNotifications={
          unreadNotifications
        }
        unreadChatMessages={
          unreadChatMessages
        }
      />

      <Notifications
        open={
          notificationsOpen
        }
        onClose={() =>
          setNotificationsOpen(
            false
          )
        }
        onNavigate={
          goToPage
        }
      />

      <div
        className={`${
          showRightSidebar
            ? "layout"
            : "layout layout-wide"
        } ${
          currentPage ===
          "pulse"
            ? "layout-pulse-immersive"
            : ""
        }`.trim()}
      >
        <LeftSidebar
          currentPage={
            sidebarCurrentPage
          }
          onNavigate={
            goToPage
          }
        />

        <main className="main-content">
          {
            renderPage()
          }
        </main>

        {showRightSidebar && (
          <RightSidebar
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        )}
      </div>

      {!hideGlobalMobileNav && (
        <MobileNavigation
          currentPage={
            currentPage
          }
          onNavigate={
            goToPage
          }
          unreadChatMessages={
            unreadChatMessages
          }
        />
      )}
    </div>
  );
}

export default App;