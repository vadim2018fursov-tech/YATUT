import {
  useEffect,
  useState,
} from "react";

import "../styles/home-premium.css";
import "../styles/home-premium-fixes.css";
import "../styles/home-interactions.css";
import "../styles/share-post.css";

import StoriesRow from "../components/home/StoriesRow";
import HeroBanner from "../components/home/HeroBanner";
import PulseYatut from "../components/home/PulseYatut";
import CreatePost from "../components/home/CreatePost";
import FeedPost from "../components/home/FeedPost";
import CitySidebarCard from "../components/home/CitySidebarCard";
import HomeRightRail from "../components/home/HomeRightRail";

import {
  feedPosts,
} from "../data/homeMockData";

import {
  createPremiumPost,
  loadPremiumFeed,
  savePremiumFeed,
} from "../storage/premiumFeedService";

const REACTION_IDS = [
  "fire",
  "important",
  "support",
  "heart",
  "laugh",
  "wow",
  "sad",
];

function normalizeReactionCounts(
  post
) {
  if (
    post.reactionCounts &&
    typeof post.reactionCounts ===
      "object"
  ) {
    const result =
      {};

    REACTION_IDS.forEach(
      (id) => {
        result[id] =
          Number(
            post.reactionCounts[
              id
            ] || 0
          );
      }
    );

    return result;
  }

  const legacyLikes =
    Number(
      post.likes || 0
    );

  return {
    fire: 0,
    important: 0,
    support: 0,
    heart:
      legacyLikes,
    laugh: 0,
    wow: 0,
    sad: 0,
  };
}

function normalizeComment(
  comment
) {
  return {
    ...comment,

    authorId:
      comment.authorId ||
      null,

    likes:
      Number(
        comment.likes ||
          0
      ),

    liked:
      Boolean(
        comment.liked
      ),

    replies:
      Array.isArray(
        comment.replies
      )
        ? comment.replies.map(
            normalizeComment
          )
        : [],
  };
}

function normalizePosts(
  posts
) {
  return posts.map(
    (post) => {
      const reactionCounts =
        normalizeReactionCounts(
          post
        );

      const legacyReaction =
        post.myReaction ||
        (post.liked
          ? "heart"
          : null);

      const totalReactions =
        Object.values(
          reactionCounts
        ).reduce(
          (
            sum,
            value
          ) =>
            sum +
            Number(
              value || 0
            ),
          0
        );

      return {
        ...post,

        images:
          Array.isArray(
            post.images
          )
            ? post.images
            : post.image
              ? [
                  post.image,
                ]
              : [],

        video:
          post.video ||
          null,

        mood:
          post.mood ||
          "",

        taggedPeople:
          Array.isArray(
            post.taggedPeople
          )
            ? post.taggedPeople
            : [],

        audience:
          post.audience ||
          "public",

        reactionCounts,

        myReaction:
          legacyReaction,

        likes:
          totalReactions,

        liked:
          Boolean(
            legacyReaction
          ),

        comments:
          Number(
            post.comments ||
              0
          ),

        shares:
          Number(
            post.shares ||
              0
          ),

        saved:
          Boolean(
            post.saved
          ),

        hidden:
          Boolean(
            post.hidden
          ),

        reported:
          Boolean(
            post.reported
          ),

        commentItems:
          Array.isArray(
            post.commentItems
          )
            ? post.commentItems.map(
                normalizeComment
              )
            : [],
      };
    }
  );
}

function createComment(
  text,
  extra = {}
) {
  return {
    id:
      `comment-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    authorId:
      "me",

    authorName:
      "Вадим",

    initials:
      "В",

    text,

    time:
      "щойно",

    createdAt:
      Date.now(),

    likes:
      0,

    liked:
      false,

    replies:
      [],

    ...extra,
  };
}

function countComments(
  items = []
) {
  return items.reduce(
    (
      total,
      item
    ) =>
      total +
      1 +
      countComments(
        item.replies ||
          []
      ),
    0
  );
}

function updateCommentTree(
  comments,
  commentId,
  updater
) {
  return comments.map(
    (comment) => {
      if (
        comment.id ===
        commentId
      ) {
        return updater(
          comment
        );
      }

      if (
        comment.replies
          ?.length
      ) {
        return {
          ...comment,

          replies:
            updateCommentTree(
              comment.replies,
              commentId,
              updater
            ),
        };
      }

      return comment;
    }
  );
}

function removeCommentTree(
  comments,
  commentId
) {
  return comments
    .filter(
      (comment) =>
        comment.id !==
        commentId
    )
    .map(
      (comment) => ({
        ...comment,

        replies:
          removeCommentTree(
            comment.replies ||
              [],
            commentId
          ),
      })
    );
}

function HomePage({
  renderLeftNavigation = null,
}) {
  const [
    posts,
    setPosts,
  ] = useState(
    () =>
      normalizePosts(
        loadPremiumFeed(
          feedPosts
        )
      )
  );

  useEffect(() => {
    savePremiumFeed(
      posts
    );
  }, [posts]);

  function publishPost(
    data
  ) {
    const post =
      createPremiumPost(
        data
      );

    setPosts(
      (previous) => [
        post,
        ...previous,
      ]
    );
  }

  function reactToPost(
    postId,
    reactionId
  ) {
    if (
      !REACTION_IDS.includes(
        reactionId
      )
    ) {
      return;
    }

    setPosts(
      (previous) =>
        previous.map(
          (post) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            const counts = {
              ...normalizeReactionCounts(
                post
              ),
            };

            const current =
              post.myReaction ||
              null;

            if (
              current ===
              reactionId
            ) {
              counts[
                reactionId
              ] =
                Math.max(
                  0,
                  Number(
                    counts[
                      reactionId
                    ] || 0
                  ) - 1
                );

              const total =
                Object.values(
                  counts
                ).reduce(
                  (
                    sum,
                    value
                  ) =>
                    sum +
                    Number(
                      value || 0
                    ),
                  0
                );

              return {
                ...post,
                reactionCounts:
                  counts,
                myReaction:
                  null,
                liked:
                  false,
                likes:
                  total,
              };
            }

            if (
              current &&
              REACTION_IDS.includes(
                current
              )
            ) {
              counts[
                current
              ] =
                Math.max(
                  0,
                  Number(
                    counts[
                      current
                    ] || 0
                  ) - 1
                );
            }

            counts[
              reactionId
            ] =
              Number(
                counts[
                  reactionId
                ] || 0
              ) + 1;

            const total =
              Object.values(
                counts
              ).reduce(
                (
                  sum,
                  value
                ) =>
                  sum +
                  Number(
                    value || 0
                  ),
                0
              );

            return {
              ...post,

              reactionCounts:
                counts,

              myReaction:
                reactionId,

              liked:
                true,

              likes:
                total,
            };
          }
        )
    );
  }

  function toggleSave(
    postId
  ) {
    setPosts(
      (previous) =>
        previous.map(
          (post) =>
            post.id ===
            postId
              ? {
                  ...post,
                  saved:
                    !Boolean(
                      post.saved
                    ),
                }
              : post
        )
    );
  }

  function addComment(
    postId,
    text
  ) {
    const clean =
      String(
        text || ""
      ).trim();

    if (!clean) {
      return;
    }

    setPosts(
      (previous) =>
        previous.map(
          (post) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            const next = [
              ...(post.commentItems ||
                []),

              createComment(
                clean
              ),
            ];

            return {
              ...post,

              commentItems:
                next,

              comments:
                countComments(
                  next
                ),
            };
          }
        )
    );
  }

  function addReply(
    postId,
    parentId,
    text
  ) {
    let clean =
      String(
        text || ""
      ).trim();

    if (!clean) {
      return;
    }

    setPosts(
      (previous) =>
        previous.map(
          (post) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            let parentName =
              "";

            function findName(
              comments
            ) {
              for (
                const comment of
                comments
              ) {
                if (
                  comment.id ===
                  parentId
                ) {
                  parentName =
                    comment.authorName ||
                    "";

                  return;
                }

                findName(
                  comment.replies ||
                    []
                );
              }
            }

            findName(
              post.commentItems ||
                []
            );

            if (
              parentName &&
              clean.startsWith(
                `@${parentName}`
              )
            ) {
              clean =
                clean
                  .slice(
                    parentName.length +
                      1
                  )
                  .trim();
            }

            const reply =
              createComment(
                clean,
                {
                  replyToId:
                    parentId,

                  replyToName:
                    parentName,
                }
              );

            const next =
              updateCommentTree(
                post.commentItems ||
                  [],
                parentId,
                (
                  comment
                ) => ({
                  ...comment,

                  replies: [
                    ...(comment.replies ||
                      []),
                    reply,
                  ],
                })
              );

            return {
              ...post,

              commentItems:
                next,

              comments:
                countComments(
                  next
                ),
            };
          }
        )
    );
  }

  function toggleCommentLike(
    postId,
    commentId
  ) {
    setPosts(
      (previous) =>
        previous.map(
          (post) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            return {
              ...post,

              commentItems:
                updateCommentTree(
                  post.commentItems ||
                    [],
                  commentId,
                  (
                    comment
                  ) => {
                    const wasLiked =
                      Boolean(
                        comment.liked
                      );

                    return {
                      ...comment,

                      liked:
                        !wasLiked,

                      likes:
                        Math.max(
                          0,
                          Number(
                            comment.likes ||
                              0
                          ) +
                            (wasLiked
                              ? -1
                              : 1)
                        ),
                    };
                  }
                ),
            };
          }
        )
    );
  }

  function deleteComment(
    postId,
    commentId
  ) {
    const accepted =
      window.confirm(
        "Видалити цей коментар?"
      );

    if (!accepted) {
      return;
    }

    setPosts(
      (previous) =>
        previous.map(
          (post) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            const next =
              removeCommentTree(
                post.commentItems ||
                  [],
                commentId
              );

            return {
              ...post,

              commentItems:
                next,

              comments:
                countComments(
                  next
                ),
            };
          }
        )
    );
  }

  function reportComment(
    postId,
    commentId
  ) {
    setPosts(
      (previous) =>
        previous.map(
          (post) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            return {
              ...post,

              commentItems:
                updateCommentTree(
                  post.commentItems ||
                    [],
                  commentId,
                  (
                    comment
                  ) => ({
                    ...comment,
                    reported:
                      true,
                  })
                ),
            };
          }
        )
    );

    window.alert(
      "Скаргу на коментар передано модерації ЯТУТ."
    );
  }

  function sharePost(
    postId
  ) {
    setPosts(
      (previous) =>
        previous.map(
          (post) =>
            post.id ===
            postId
              ? {
                  ...post,

                  shares:
                    Number(
                      post.shares ||
                        0
                    ) + 1,
                }
              : post
        )
    );
  }

  function editPost(
    postId,
    text
  ) {
    setPosts(
      (previous) =>
        previous.map(
          (post) =>
            post.id ===
            postId
              ? {
                  ...post,

                  text,

                  edited:
                    true,

                  editedAt:
                    Date.now(),
                }
              : post
        )
    );
  }

  function deletePost(
    postId
  ) {
    const accepted =
      window.confirm(
        "Видалити цю публікацію?"
      );

    if (!accepted) {
      return;
    }

    setPosts(
      (previous) =>
        previous.filter(
          (post) =>
            post.id !==
            postId
        )
    );
  }

  function hidePost(
    postId
  ) {
    setPosts(
      (previous) =>
        previous.map(
          (post) =>
            post.id ===
            postId
              ? {
                  ...post,
                  hidden:
                    true,
                }
              : post
        )
    );
  }

  function reportPost(
    postId
  ) {
    setPosts(
      (previous) =>
        previous.map(
          (post) =>
            post.id ===
            postId
              ? {
                  ...post,

                  reported:
                    true,

                  hidden:
                    true,
                }
              : post
        )
    );

    window.alert(
      "Дякуємо. Скаргу передано модерації ЯТУТ."
    );
  }

  async function copyPostLink(
    post
  ) {
    const url =
      `${window.location.origin}${window.location.pathname}#post=${encodeURIComponent(
        post.id
      )}`;

    try {
      await navigator.clipboard.writeText(
        url
      );
    } catch {
      window.prompt(
        "Скопіюйте посилання:",
        url
      );
    }
  }

  const visiblePosts =
    posts.filter(
      (post) =>
        !post.hidden
    );

  return (
    <div className="premium-home-page">
      <aside className="premium-home-left">
        {renderLeftNavigation && (
          <div className="premium-home-left-navigation">
            {renderLeftNavigation}
          </div>
        )}

        <CitySidebarCard />
      </aside>

      <main className="premium-home-center">
        <StoriesRow />

        <HeroBanner />

        <PulseYatut />

        <CreatePost
          onPublish={
            publishPost
          }
        />

        <div className="premium-home-feed">
          {visiblePosts.map(
            (post) => (
              <FeedPost
                key={
                  post.id
                }
                post={
                  post
                }
                onReaction={
                  reactToPost
                }
                onSave={
                  toggleSave
                }
                onAddComment={
                  addComment
                }
                onAddReply={
                  addReply
                }
                onLikeComment={
                  toggleCommentLike
                }
                onDeleteComment={
                  deleteComment
                }
                onReportComment={
                  reportComment
                }
                onShare={
                  sharePost
                }
                onEdit={
                  editPost
                }
                onDelete={
                  deletePost
                }
                onHide={
                  hidePost
                }
                onReport={
                  reportPost
                }
                onCopyLink={
                  copyPostLink
                }
              />
            )
          )}
        </div>
      </main>

      <HomeRightRail />
    </div>
  );
}

export default HomePage;