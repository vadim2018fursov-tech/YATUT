import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./ProfileV2.css";
import YatutIcon from "./YatutIcon";

import {
  createSavedPost,
  isSaved,
  toggleSaved,
} from "../storage/savedService";

import {
  shareYatutItem,
} from "../utils/shareYatutItem";

import {
  getMyProfile,
  updateMyProfile,
} from "../services/authService";

import {
  getBackendUserProfile,
} from "../services/socialBackendService";

import {
  addBackendComment,
  createBackendPost,
  deleteBackendPost,
  loadBackendFeed,
  toggleBackendPostLike,
} from "../services/feedBackendService";

import {
  uploadProfileImage,
} from "../services/storageService";

const PROFILE_STORAGE_KEY = "yatut-profile-v2";
const PROFILE_POSTS_STORAGE_KEY = "yatut-profile-posts-v2";

const DEFAULT_PROFILE = {
  name: "Вадим",
  username: "vadim",
  bio: "Створюю ЯТУТ — українську соціальну мережу про людей, зв’язки, міста та реальне життя.",
  city: "Київ",
  country: "Україна",
  work: "Засновник ЯТУТ",
  education: "Київ",
  website: "",
  instagram: "",
  telegram: "",
  birthday: "",
  cover: "",
  avatar: "",
  status: "Я тут",
  statusText: "Зараз у Києві",
  followers: 1284,
  following: 386,
  friends: 214,
  posts: 37,
  pulseReach: 38400,
  verified: true,
  founder: true,
  earlyUser: true,
  online: true,

  interests: [
    "Технології",
    "Дизайн",
    "Україна",
    "Стартапи",
    "Мистецтво",
    "Подорожі",
  ],
};

const ACHIEVEMENTS = [
  {
    id: "founder",
    title: "Засновник ЯТУТ",
    subtitle: "Створює майбутнє мережі",
    tone: "violet",
    symbol: "Я",
  },

  {
    id: "verified",
    title: "ЯТУТ Перевірено",
    subtitle: "Підтверджений профіль",
    tone: "indigo",
    symbol: "✓",
  },

  {
    id: "early",
    title: "Перші тут",
    subtitle: "Ранній користувач",
    tone: "silver",
    symbol: "1",
  },

  {
    id: "community",
    title: "Серце спільноти",
    subtitle: "Допомагає іншим",
    tone: "coral",
    symbol: "♥",
  },

  {
    id: "organizer",
    title: "Організатор",
    subtitle: "Створює події та зустрічі",
    tone: "amber",
    symbol: "✦",
  },

  {
    id: "trusted",
    title: "Надійний друг",
    subtitle: "Висока довіра",
    tone: "green",
    symbol: "✓",
  },
];

const DEFAULT_PROFILE_POSTS = [
  {
    id: "profile-post-1",
    type: "own",
    text:
      "Сьогодні ще один великий крок у розвитку ЯТУТ. Хочу, щоб це була мережа не лише про контент, а про людей, які реально можуть знайти одне одного.",
    meta: "2 год",
    likes: 84,
    comments: 17,
  },

  {
    id: "profile-repost-friend",
    type: "repost",
    text:
      "Вечірній Київ сьогодні особливий. Хто зараз у центрі — відгукніться ✨",
    meta: "4 год",
    likes: 231,
    comments: 38,
    repostedFrom: {
      kind: "friend",
      name: "Марія Коваль",
      username: "maria.koval",
      initial: "М",
      label: "Допис друга",
    },
  },

  {
    id: "profile-repost-community",
    type: "repost",
    text:
      "На вихідних збираємо людей на відкриту зустріч ЯТУТ у центрі Києва. Знайомства, ідеї та місто без формальностей.",
    meta: "Вчора",
    likes: 418,
    comments: 64,
    repostedFrom: {
      kind: "community",
      name: "ЯТУТ Київ",
      username: "yatut.kyiv",
      initial: "Я",
      label: "Репост зі спільноти",
    },
  },

  {
    id: "profile-post-2",
    type: "own",
    text:
      "Київ дуже надихає на новий дизайн. Думаю над тим, як зробити «Поруч» по-справжньому живим.",
    meta: "2 дні",
    likes: 126,
    comments: 21,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function profileStorageKey(
  base,
  userId
) {
  return userId
    ? `${base}:${userId}`
    : base;
}

function profileDefaultsForUser(
  user
) {
  if (
    !user?.id
  ) {
    return DEFAULT_PROFILE;
  }

  const metadata =
    user.user_metadata ||
    {};

  return {
    ...DEFAULT_PROFILE,
    name:
      metadata.full_name ||
      user.email
        ?.split("@")[0] ||
      "Користувач ЯТУТ",
    username:
      metadata.username ||
      user.email
        ?.split("@")[0] ||
      "user",
    bio: "",
    city: "",
    country: "Україна",
    work: "",
    education: "",
    status: "Я тут",
    statusText: "",
    followers: 0,
    following: 0,
    friends: 0,
    posts: 0,
    pulseReach: 0,
    verified: false,
    founder: false,
    earlyUser: true,
    interests: [],
  };
}

function safeLoadProfilePosts(
  userId = null
) {
  try {
    const raw =
      localStorage.getItem(
        profileStorageKey(
          PROFILE_POSTS_STORAGE_KEY,
          userId
        )
      );

    if (!raw) {
      return userId
        ? []
        : DEFAULT_PROFILE_POSTS;
    }

    const parsed =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : DEFAULT_PROFILE_POSTS;
  } catch {
    return DEFAULT_PROFILE_POSTS;
  }
}

function safeLoadProfile(
  user = null
) {
  const defaults =
    profileDefaultsForUser(
      user
    );

  try {
    const raw =
      localStorage.getItem(
        profileStorageKey(
          PROFILE_STORAGE_KEY,
          user?.id
        )
      );

    if (!raw) {
      return defaults;
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...defaults,
      ...(parsed || {}),

      interests:
        Array.isArray(
          parsed?.interests
        )
          ? parsed.interests
          : defaults.interests,
    };
  } catch (error) {
    console.warn(
      "PROFILE LOAD ERROR:",
      error
    );

    return DEFAULT_PROFILE;
  }
}

function formatProfileNumber(
  value
) {
  const number =
    Number(value || 0);

  if (number >= 1000000) {
    return `${(
      number /
      1000000
    )
      .toFixed(1)
      .replace(".", ",")}M`;
  }

  if (number >= 1000) {
    return `${(
      number /
      1000
    )
      .toFixed(
        number >= 10000
          ? 1
          : 0
      )
      .replace(".", ",")}K`;
  }

  return String(number);
}

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
   PROFILE
========================================================= */

export default function Profile({
  onNavigate,
  onOpenChat,
  authSession = null,
}) {
  const [
    profile,
    setProfile,
  ] =
    useState(
      () =>
        safeLoadProfile(
          authSession?.user ||
          null
        )
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "posts"
    );

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] =
    useState(false);

  const [
    profilePosts,
    setProfilePosts,
  ] =
    useState(
      () =>
        safeLoadProfilePosts(
          authSession?.user?.id ||
          null
        )
    );

  const [
    newPostText,
    setNewPostText,
  ] =
    useState("");

  const [
    openProfileComments,
    setOpenProfileComments,
  ] =
    useState({});

  const [
    profileCommentDrafts,
    setProfileCommentDrafts,
  ] =
    useState({});

  const [
    savedVersion,
    setSavedVersion,
  ] =
    useState(0);

  const [
    postMenuId,
    setPostMenuId,
  ] =
    useState(null);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        profileStorageKey(
          PROFILE_STORAGE_KEY,
          authSession?.user?.id ||
          null
        ),

        JSON.stringify(
          profile
        )
      );
    } catch (error) {
      console.warn(
        "PROFILE SAVE ERROR:",
        error
      );
    }
  }, [
    profile,
    authSession?.user?.id,
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(
        profileStorageKey(
          PROFILE_POSTS_STORAGE_KEY,
          authSession?.user?.id ||
          null
        ),
        JSON.stringify(
          profilePosts
        )
      );
    } catch (error) {
      console.warn(
        "PROFILE POSTS SAVE ERROR:",
        error
      );
    }
  }, [
    profilePosts,
    authSession?.user?.id,
  ]);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      return undefined;
    }

    let mounted =
      true;

    Promise.all([
      getMyProfile(
        authSession
      ),
      getBackendUserProfile(
        authSession,
        authSession.user.id
      ),
      loadBackendFeed(
        authSession
      ),
    ])
      .then(
        ([
          remote,
          socialProfile,
          feed,
        ]) => {
          if (
            !mounted
          ) {
            return;
          }

          if (
            remote ||
            socialProfile
          ) {
            setProfile(
              (previous) => ({
                ...previous,
                name:
                  socialProfile?.name ||
                  remote?.full_name ||
                  previous.name,
                username:
                  socialProfile?.username ||
                  remote?.username ||
                  previous.username,
                bio:
                  socialProfile?.bio ??
                  remote?.bio ??
                  previous.bio,
                city:
                  socialProfile?.city ??
                  remote?.city ??
                  previous.city,
                country:
                  socialProfile?.country ??
                  remote?.country ??
                  previous.country,
                status:
                  socialProfile?.status ??
                  remote?.status ??
                  previous.status,
                avatar:
                  socialProfile?.avatar ??
                  remote?.avatar_url ??
                  previous.avatar,
                cover:
                  socialProfile?.cover ??
                  remote?.cover_url ??
                  previous.cover,
                verified:
                  Boolean(
                    socialProfile?.verified ??
                    remote?.verified
                  ),
                friends:
                  Number(
                    socialProfile?.friendsCount ??
                    previous.friends ??
                    0
                  ),
                followers:
                  Number(
                    socialProfile?.followersCount ??
                    previous.followers ??
                    0
                  ),
                following:
                  Number(
                    socialProfile?.followingCount ??
                    previous.following ??
                    0
                  ),
                posts:
                  Number(
                    socialProfile?.posts?.length ??
                    previous.posts ??
                    0
                  ),
              })
            );
          }

          const ownPosts =
            (
              Array.isArray(
                feed
              )
                ? feed
                : []
            )
              .filter(
                (
                  post
                ) =>
                  post.authorId ===
                  authSession.user.id
              )
              .map(
                (
                  post
                ) => ({
                  id:
                    post.id,
                  backend:
                    true,
                  type:
                    "own",
                  text:
                    post.text ||
                    "",
                  media:
                    post.media ||
                    null,
                  mediaType:
                    post.mediaType ||
                    null,
                  createdAt:
                    post.createdAt,
                  meta:
                    new Date(
                      post.createdAt
                    ).toLocaleDateString(
                      "uk-UA",
                      {
                        day:
                          "numeric",
                        month:
                          "short",
                      }
                    ),
                  liked:
                    Boolean(
                      post.liked
                    ),
                  likes:
                    Number(
                      post.likes ||
                      0
                    ),
                  comments:
                    Array.isArray(
                      post.comments
                    )
                      ? post.comments.length
                      : 0,
                  commentItems:
                    (
                      Array.isArray(
                        post.comments
                      )
                        ? post.comments
                        : []
                    ).map(
                      (
                        comment
                      ) => ({
                        id:
                          comment.id,
                        author:
                          comment.authorName ||
                          "Користувач",
                        text:
                          comment.text ||
                          "",
                      })
                    ),
                })
              );

          setProfilePosts(
            ownPosts
          );
        }
      )
      .catch(
        (error) => {
          console.warn(
            "REMOTE PROFILE LOAD ERROR:",
            error
          );
        }
      );

    return () => {
      mounted =
        false;
    };
  }, [
    authSession,
  ]);

  /* =======================================================
     PROFILE ROUTE PAYLOAD
  ======================================================= */

  useEffect(() => {
    let timer =
      null;

    function applyPayload(
      payload
    ) {
      if (
        payload?.tab
      ) {
        setActiveTab(
          payload.tab
        );
      }

      if (
        payload?.action ===
        "edit"
      ) {
        setEditing(
          true
        );
      }

      if (
        payload?.postId
      ) {
        setActiveTab(
          "posts"
        );

        timer =
          window.setTimeout(
            () => {
              const element =
                document.getElementById(
                  `profile-post-${payload.postId}`
                );

              element?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "center",
              });
            },
            120
          );
      }

      try {
        sessionStorage.removeItem(
          "yatut-open-route-payload"
        );
      } catch {
        // No-op.
      }
    }

    try {
      const raw =
        sessionStorage.getItem(
          "yatut-open-route-payload"
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        if (
          parsed?.route ===
          "profile"
        ) {
          applyPayload(
            parsed.payload ||
            {}
          );
        }
      }
    } catch (
      error
    ) {
      console.warn(
        "PROFILE ROUTE PAYLOAD ERROR:",
        error
      );
    }

    function handleRoute(
      event
    ) {
      if (
        event?.detail?.route !==
        "profile"
      ) {
        return;
      }

      applyPayload(
        event.detail.payload ||
        {}
      );
    }

    window.addEventListener(
      "yatut:route-payload",
      handleRoute
    );

    return () => {
      window.removeEventListener(
        "yatut:route-payload",
        handleRoute
      );

      if (timer) {
        window.clearTimeout(
          timer
        );
      }
    };
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(
      () => [
        {
          id: "friends",
          label: "Друзі",
          value:
            formatProfileNumber(
              profile.friends
            ),
        },

        {
          id: "followers",
          label:
            "Підписники",
          value:
            formatProfileNumber(
              profile.followers
            ),
        },

        {
          id: "posts",
          label:
            "Дописи",
          value:
            formatProfileNumber(
              profile.posts
            ),
        },

        {
          id: "pulse",
          label:
            "PULSE",
          value:
            formatProfileNumber(
              profile.pulseReach
            ),
        },
      ],
      [profile]
    );

  const reputation = [
    {
      label:
        "Надійність",

      value: 96,

      text:
        "Високий рівень довіри",
    },

    {
      label:
        "Активність",

      value: 88,

      text:
        "Регулярно у ЯТУТ",
    },

    {
      label:
        "Вклад",

      value: 92,

      text:
        "Розвиває спільноту",
    },
  ];

  function handleProfileStat(
    statId
  ) {
    if (
      statId ===
      "friends"
    ) {
      onNavigate?.(
        "friends"
      );

      return;
    }

    if (
      statId ===
      "posts"
    ) {
      setActiveTab(
        "posts"
      );

      return;
    }

    if (
      statId ===
      "pulse"
    ) {
      setActiveTab(
        "pulse"
      );

      return;
    }

    if (
      statId ===
      "followers"
    ) {
      onNavigate?.(
        "friends",
        {
          tab:
            "followers",
        }
      );
    }
  }

  /* =======================================================
     STATUS
  ======================================================= */

  function updateStatus(
    status,
    statusText
  ) {
    setProfile(
      (
        previous
      ) => ({
        ...previous,

        status,

        statusText,
      })
    );

    setStatusOpen(
      false
    );
  }

  async function publishProfilePost() {
    const text =
      newPostText.trim();

    if (!text) {
      return;
    }

    if (
      authSession?.user?.id
    ) {
      try {
        await createBackendPost(
          authSession,
          {
            text,
            visibility:
              "public",
          }
        );

        const feed =
          await loadBackendFeed(
            authSession
          );

        const ownPosts =
          feed
            .filter(
              (
                item
              ) =>
                item.authorId ===
                authSession.user.id
            )
            .map(
              (
                item
              ) => ({
                id:
                  item.id,
                backend:
                  true,
                type:
                  "own",
                text:
                  item.text ||
                  "",
                media:
                  item.media ||
                  null,
                mediaType:
                  item.mediaType ||
                  null,
                createdAt:
                  item.createdAt,
                meta:
                  "щойно",
                liked:
                  Boolean(
                    item.liked
                  ),
                likes:
                  Number(
                    item.likes ||
                    0
                  ),
                comments:
                  Array.isArray(
                    item.comments
                  )
                    ? item.comments.length
                    : 0,
                commentItems:
                  (
                    Array.isArray(
                      item.comments
                    )
                      ? item.comments
                      : []
                  ).map(
                    (
                      comment
                    ) => ({
                      id:
                        comment.id,
                      author:
                        comment.authorName ||
                        "Користувач",
                      text:
                        comment.text ||
                        "",
                    })
                  ),
              })
            );

        setProfilePosts(
          ownPosts
        );

        setNewPostText(
          ""
        );

        setProfile(
          (
            current
          ) => ({
            ...current,
            posts:
              ownPosts.length,
          })
        );
      } catch (
        error
      ) {
        console.warn(
          "PROFILE POST CREATE ERROR:",
          error
        );
      }

      return;
    }

    const post = {
      id:
        `profile-own-${Date.now()}`,
      type:
        "own",
      text,
      meta:
        "щойно",
      likes:
        0,
      comments:
        0,
    };

    setProfilePosts(
      (current) => [
        post,
        ...current,
      ]
    );

    setNewPostText("");

    setProfile(
      (current) => ({
        ...current,
        posts:
          Number(
            current.posts ||
            0
          ) + 1,
      })
    );
  }

  async function toggleProfilePostLike(
    postId
  ) {
    const target =
      profilePosts.find(
        (
          post
        ) =>
          post.id ===
          postId
      );

    if (
      target?.backend &&
      authSession?.user?.id
    ) {
      const nextLiked =
        !target.liked;

      setProfilePosts(
        (
          current
        ) =>
          current.map(
            (
              post
            ) =>
              post.id ===
              postId
                ? {
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
                          (
                            nextLiked
                              ? 1
                              : -1
                          )
                      ),
                  }
                : post
          )
      );

      try {
        await toggleBackendPostLike(
          authSession,
          postId,
          target.liked
        );
      } catch (
        error
      ) {
        console.warn(
          "PROFILE POST LIKE ERROR:",
          error
        );
      }

      return;
    }

    setProfilePosts(
      (
        current
      ) =>
        current.map(
          (
            post
          ) => {
            if (
              post.id !==
              postId
            ) {
              return post;
            }

            const liked =
              !post.liked;

            return {
              ...post,

              liked,

              likes:
                Math.max(
                  0,

                  Number(
                    post.likes ||
                      0
                  ) +
                    (
                      liked
                        ? 1
                        : -1
                    )
                ),
            };
          }
        )
    );
  }

  function toggleProfileComments(
    postId
  ) {
    setOpenProfileComments(
      (
        current
      ) => ({
        ...current,

        [postId]:
          !current[
            postId
          ],
      })
    );
  }

  async function addProfileComment(
    postId
  ) {
    const text =
      (
        profileCommentDrafts[
          postId
        ] ||
        ""
      ).trim();

    if (!text) {
      return;
    }

    const target =
      profilePosts.find(
        (
          post
        ) =>
          post.id ===
          postId
      );

    if (
      target?.backend &&
      authSession?.user?.id
    ) {
      try {
        const created =
          await addBackendComment(
            authSession,
            postId,
            text
          );

        setProfilePosts(
          (
            current
          ) =>
            current.map(
              (
                post
              ) =>
                post.id ===
                postId
                  ? {
                      ...post,
                      comments:
                        Number(
                          post.comments ||
                          0
                        ) +
                        1,
                      commentItems: [
                        ...(
                          post.commentItems ||
                          []
                        ),
                        {
                          id:
                            created?.id ||
                            `profile-comment-${Date.now()}`,
                          author:
                            profile.name,
                          text,
                        },
                      ],
                    }
                  : post
            )
        );

        setProfileCommentDrafts(
          (
            current
          ) => ({
            ...current,
            [postId]:
              "",
          })
        );
      } catch (
        error
      ) {
        console.warn(
          "PROFILE COMMENT ERROR:",
          error
        );
      }

      return;
    }

    setProfilePosts(
      (
        current
      ) =>
        current.map(
          (
            post
          ) =>
            post.id ===
            postId
              ? {
                  ...post,

                  comments:
                    Number(
                      post.comments ||
                        0
                    ) + 1,

                  commentItems: [
                    ...(
                      post.commentItems ||
                      []
                    ),

                    {
                      id:
                        `profile-comment-${Date.now()}`,

                      author:
                        profile.name,

                      text,

                      createdAt:
                        Date.now(),
                    },
                  ],
                }
              : post
        )
    );

    setProfileCommentDrafts(
      (
        current
      ) => ({
        ...current,

        [postId]:
          "",
      })
    );
  }

  async function shareProfilePost(
    post
  ) {
    await shareYatutItem({
      title:
        `Допис ${profile.name} у ЯТУТ`,

      text:
        post.text ||
        "",

      path:
        `/profile/posts/${encodeURIComponent(post.id)}`,
    });
  }

  function toggleProfilePostSaved(
    post
  ) {
    const savedPost =
      createSavedPost({
        ...post,

        authorId:
          "me",

        authorName:
          profile.name,

        authorUsername:
          profile.username,

        authorInitial:
          profile.name
            ?.[0]
            ?.toUpperCase() ||
          "В",

        createdAt:
          post.createdAt ||
          Date.now(),
      });

    toggleSaved({
      ...savedPost,

      source:
        "profile",

      route:
        "profile",

      routePayload: {
        tab:
          "posts",

        postId:
          post.id,
      },
    });

    setSavedVersion(
      (
        value
      ) =>
        value + 1
    );
  }

  async function removeProfilePost(
    postId
  ) {
    const target =
      profilePosts.find(
        (
          post
        ) =>
          post.id ===
          postId
      );

    if (
      target?.backend &&
      authSession?.user?.id
    ) {
      try {
        await deleteBackendPost(
          authSession,
          postId
        );
      } catch (
        error
      ) {
        console.warn(
          "PROFILE POST DELETE ERROR:",
          error
        );

        return;
      }
    }

    setProfilePosts(
      (
        current
      ) =>
        current.filter(
          (
            post
          ) =>
            post.id !==
            postId
        )
    );

    setPostMenuId(
      null
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="profile-v2-page">
      <div className="profile-v2-wallpaper" />

      <section className="profile-v2-shell">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="profile-v2-hero">

          {/* COVER */}

          <div
            className="profile-v2-cover"
            style={
              profile.cover
                ? {
                    backgroundImage:
                      `linear-gradient(
                        180deg,
                        rgba(13,15,24,.06),
                        rgba(13,15,24,.48)
                      ),
                      url("${profile.cover}")`,
                  }
                : undefined
            }
          >
            <div className="profile-v2-cover-glow" />

            <div className="profile-v2-cover-copy">

              <span>
                ЯТУТ • КИЇВ
              </span>

              <h2>
                Люди. Місця.
                Можливості.
              </h2>

              <p>
                Тут починаються
                справжні зв’язки.
              </p>

            </div>
          </div>

          {/* =================================================
              MOBILE COMPACT PROFILE CARD
          ================================================= */}

          <section className="profile-v3-mobile-card">
            <div
              className={`profile-v3-mobile-avatar-wrap ${
                profile.online
                  ? "is-online"
                  : ""
              }`.trim()}
            >
              <div className="profile-v3-mobile-avatar">
                {profile.avatar ? (
                  <img
                    src={
                      profile.avatar
                    }
                    alt={
                      profile.name
                    }
                  />
                ) : (
                  <span>
                    {profile.name
                      ?.[0]
                      ?.toUpperCase() ||
                      "В"}
                  </span>
                )}
              </div>

            </div>

            <div className="profile-v3-mobile-identity-row">
              <div className="profile-v3-mobile-identity">
                <div className="profile-v3-mobile-name-row">
                  <h1>
                    {
                      profile.name
                    }
                  </h1>

                  {profile.verified && (
                    <span className="profile-v3-mobile-badge verified">
                      Я
                    </span>
                  )}

                  {profile.founder && (
                    <span className="profile-v3-mobile-badge founder">
                      ✦
                    </span>
                  )}
                </div>

                <div className="profile-v3-mobile-username">
                  @
                  {
                    profile.username
                  }
                </div>
              </div>

              <div className="profile-v3-mobile-actions">
                <button
                  className="profile-v3-mobile-edit"
                  type="button"
                  onClick={() =>
                    setEditing(
                      true
                    )
                  }
                >
                  Редагувати
                </button>

                <button
                  className="profile-v3-mobile-action"
                  type="button"
                  onClick={() =>
                    onNavigate?.(
                      "settings"
                    )
                  }
                  aria-label="Налаштування"
                >
                  <YatutIcon
                    name="settings"
                    size={18}
                  />
                </button>

                <button
                  className="profile-v3-mobile-action"
                  type="button"
                  aria-label="Більше про профіль"
                  onClick={() =>
                    setActiveTab(
                      "about"
                    )
                  }
                >
                  <YatutIcon
                    name="more"
                    size={18}
                  />
                </button>
              </div>
            </div>

            <div className="profile-v3-mobile-stats">
              {stats.map(
                (
                  item
                ) => (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      handleProfileStat(
                        item.id
                      )
                    }
                  >
                    <strong>
                      {
                        item.value
                      }
                    </strong>

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </button>
                )
              )}
            </div>

            <p className="profile-v3-mobile-bio">
              {
                profile.bio
              }
            </p>

            <div className="profile-v3-mobile-meta">
              <span>
                <YatutIcon
                  name="pin"
                  size={15}
                />

                {
                  profile.city
                }
                ,{" "}
                {
                  profile.country
                }
              </span>

              <span>
                <YatutIcon
                  name="business"
                  size={15}
                />

                {
                  profile.work
                }
              </span>
            </div>

            <div className="profile-v3-mobile-status-wrap">
              <button
                className="profile-v3-mobile-status"
                type="button"
                onClick={() =>
                  setStatusOpen(
                    (
                      value
                    ) =>
                      !value
                  )
                }
              >
                <span className="profile-v3-mobile-status-dot" />

                <strong>
                  {
                    profile.status
                  }
                </strong>

                <small>
                  {
                    profile.statusText
                  }
                </small>

                <YatutIcon
                  name="chevronDown"
                  size={14}
                />
              </button>

              {statusOpen && (
                <div className="profile-v2-status-menu profile-v3-mobile-status-menu">
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        "Я тут",
                        "Зараз у Києві"
                      )
                    }
                  >
                    <span className="status-tone violet" />

                    <div>
                      <strong>
                        Я тут
                      </strong>

                      <small>
                        Показати присутність
                      </small>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        "У дорозі",
                        "Відповім пізніше"
                      )
                    }
                  >
                    <span className="status-tone blue" />

                    <div>
                      <strong>
                        У дорозі
                      </strong>

                      <small>
                        Тимчасовий статус
                      </small>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        "Не турбувати",
                        "Потрібен фокус"
                      )
                    }
                  >
                    <span className="status-tone coral" />

                    <div>
                      <strong>
                        Не турбувати
                      </strong>

                      <small>
                        Приховати активність
                      </small>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              PROFILE HEAD
          ================================================= */}

          <div className="profile-v2-head">

            {/* AVATAR */}

            <div className="profile-v2-avatar-wrap">

              <div className="profile-v2-avatar-pulse">

                <div className="profile-v2-avatar">

                  {profile.avatar ? (
                    <img
                      src={
                        profile.avatar
                      }
                      alt={
                        profile.name
                      }
                    />
                  ) : (
                    <span>
                      {profile.name
                        ?.[0]
                        ?.toUpperCase() ||
                        "В"}
                    </span>
                  )}

                </div>

              </div>

              {profile.online && (
                <span className="profile-v2-online-dot" />
              )}

            </div>

            {/* IDENTITY */}

            <div className="profile-v2-identity">

              <div className="profile-v2-name-row">

                <h1>
                  {
                    profile.name
                  }
                </h1>

                {profile.verified && (
                  <span
                    className="profile-v2-name-badge verified"
                    title="ЯТУТ Перевірено"
                  >
                    Я
                  </span>
                )}

                {profile.founder && (
                  <span
                    className="profile-v2-name-badge founder"
                    title="Засновник ЯТУТ"
                  >
                    ✦
                  </span>
                )}

              </div>

              <div className="profile-v2-username">
                @
                {
                  profile.username
                }
              </div>

              <p className="profile-v2-bio">
                {
                  profile.bio
                }
              </p>

              {/* META */}

              <div className="profile-v2-meta">

                <span>
                  <YatutIcon
                    name="pin"
                    size={15}
                  />

                  {
                    profile.city
                  }
                  ,{" "}
                  {
                    profile.country
                  }
                </span>

                <span>
                  <YatutIcon
                    name="business"
                    size={15}
                  />

                  {
                    profile.work
                  }
                </span>

              </div>

              {/* STATUS */}

              <div className="profile-v2-status-wrap">

                <button
                  className="profile-v2-status"
                  type="button"
                  onClick={() =>
                    setStatusOpen(
                      (
                        value
                      ) =>
                        !value
                    )
                  }
                >
                  <span className="profile-v2-status-dot" />

                  <strong>
                    {
                      profile.status
                    }
                  </strong>

                  <small>
                    {
                      profile.statusText
                    }
                  </small>

                  <YatutIcon
                    name="chevronDown"
                    size={15}
                  />
                </button>

                {statusOpen && (
                  <div className="profile-v2-status-menu">

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          "Я тут",
                          "Зараз у Києві"
                        )
                      }
                    >
                      <span className="status-tone violet" />

                      <div>
                        <strong>
                          Я тут
                        </strong>

                        <small>
                          Показати
                          присутність
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          "У дорозі",
                          "Відповім пізніше"
                        )
                      }
                    >
                      <span className="status-tone blue" />

                      <div>
                        <strong>
                          У дорозі
                        </strong>

                        <small>
                          Тимчасовий
                          статус
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          "Не турбувати",
                          "Потрібен фокус"
                        )
                      }
                    >
                      <span className="status-tone coral" />

                      <div>
                        <strong>
                          Не турбувати
                        </strong>

                        <small>
                          Приховати
                          активність
                        </small>
                      </div>
                    </button>

                  </div>
                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="profile-v2-actions">

              <button
                className="profile-v2-primary"
                type="button"
                onClick={() =>
                  setEditing(
                    true
                  )
                }
              >
                Редагувати профіль
              </button>

              <button
                className="profile-v2-icon-button"
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "settings"
                  )
                }
                aria-label="Налаштування"
              >
                <YatutIcon
                  name="settings"
                  size={18}
                />
              </button>

              <button
                className="profile-v2-icon-button"
                type="button"
                aria-label="Більше про профіль"
                onClick={() =>
                  setActiveTab(
                    "about"
                  )
                }
              >
                <YatutIcon
                  name="more"
                  size={18}
                />
              </button>

            </div>

          </div>

          {/* =================================================
              PROFILE STATS
          ================================================= */}

          <div className="profile-v2-stats">

            {stats.map(
              (
                item
              ) => (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    handleProfileStat(
                      item.id
                    )
                  }
                >
                  <strong>
                    {
                      item.value
                    }
                  </strong>

                  <span>
                    {
                      item.label
                    }
                  </span>
                </button>
              )
            )}

          </div>

        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="profile-v2-grid">

          {/* =================================================
              MAIN
          ================================================= */}

          <main className="profile-v2-main">

            {/* TABS */}

            <nav className="profile-v2-tabs">

              {[
                [
                  "posts",
                  "Дописи",
                ],

                [
                  "about",
                  "Про мене",
                ],

                [
                  "pulse",
                  "PULSE",
                ],

                [
                  "achievements",
                  "Досягнення",
                ],
              ].map(
                (
                  [
                    id,
                    label,
                  ]
                ) => (
                  <button
                    key={
                      id
                    }
                    className={
                      activeTab ===
                      id
                        ? "active"
                        : ""
                    }
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        id
                      )
                    }
                  >
                    {
                      label
                    }
                  </button>
                )
              )}

            </nav>

            {/* =================================================
                POSTS
            ================================================= */}

            {activeTab ===
              "posts" && (
              <div className="profile-v2-post-list">

                <section className="profile-v2-inline-composer">

                  <div className="profile-v2-inline-composer__top">

                    <div className="profile-v2-inline-composer__avatar">
                      {profile.avatar ? (
                        <img
                          src={
                            profile.avatar
                          }
                          alt=""
                        />
                      ) : (
                        profile.name
                          ?.[0]
                          ?.toUpperCase() ||
                        "В"
                      )}
                    </div>

                    <textarea
                      value={
                        newPostText
                      }
                      onChange={(
                        event
                      ) =>
                        setNewPostText(
                          event.target
                            .value
                        )
                      }
                      placeholder="Що у тебе нового?"
                      rows={3}
                    />

                  </div>

                  <div className="profile-v2-inline-composer__bottom">

                    <span>
                      Допис буде опубліковано у твоєму профілі
                    </span>

                    <button
                      type="button"
                      disabled={
                        !newPostText
                          .trim()
                      }
                      onClick={
                        publishProfilePost
                      }
                    >
                      Опублікувати
                    </button>

                  </div>

                </section>

                {profilePosts.map(
                  (
                    post
                  ) => (
                    <article
                      key={
                        post.id
                      }
                      className="profile-v2-post-card"
                    >

                      {post.repostedFrom && (
                        <div className="profile-v2-repost-label">
                          <YatutIcon
                            name="share"
                            size={14}
                          />

                          <span>
                            {post.repostedFrom.label}
                          </span>
                        </div>
                      )}

                      <header>

                        <div className="profile-v2-post-avatar">

                          {profile.avatar ? (
                            <img
                              src={
                                profile.avatar
                              }
                              alt=""
                            />
                          ) : (
                            profile.name
                              ?.[0] ||
                            "В"
                          )}

                        </div>

                        <div>

                          <strong>
                            {
                              profile.name
                            }
                          </strong>

                          <span>
                            @
                            {
                              profile.username
                            }
                            {" "}
                            ·{" "}
                            {
                              post.meta
                            }
                          </span>

                        </div>

                        <div className="profile-v2-post-menu-wrap">
                          <button
                            type="button"
                            aria-label="Меню"
                            onClick={() =>
                              setPostMenuId(
                                (
                                  current
                                ) =>
                                  current ===
                                  post.id
                                    ? null
                                    : post.id
                              )
                            }
                          >
                            <YatutIcon
                              name="more"
                              size={17}
                            />
                          </button>

                          {postMenuId ===
                            post.id && (
                            <div className="profile-v2-post-menu">
                              <button
                                type="button"
                                onClick={() =>
                                  shareProfilePost(
                                    post
                                  )
                                }
                              >
                                Поділитися
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeProfilePost(
                                    post.id
                                  )
                                }
                              >
                                {post.type ===
                                "own"
                                  ? "Видалити допис"
                                  : "Приховати з профілю"}
                              </button>
                            </div>
                          )}
                        </div>

                      </header>

                      {post.repostedFrom && (
                        <section className="profile-v2-repost-origin">

                          <div className={`profile-v2-repost-origin__avatar ${post.repostedFrom.kind}`}>
                            {
                              post.repostedFrom.initial
                            }
                          </div>

                          <div>
                            <strong>
                              {
                                post.repostedFrom.name
                              }
                            </strong>

                            <span>
                              @
                              {
                                post.repostedFrom.username
                              }
                            </span>
                          </div>

                        </section>
                      )}

                      <p>
                        {
                          post.text
                        }
                      </p>

                      {post.media &&
                        post.mediaType ===
                          "image" && (
                        <img
                          src={
                            post.media
                          }
                          alt=""
                          style={{
                            width:
                              "100%",
                            maxHeight:
                              560,
                            objectFit:
                              "cover",
                            borderRadius:
                              18,
                            marginTop:
                              12,
                          }}
                        />
                      )}

                      {post.media &&
                        post.mediaType ===
                          "video" && (
                        <video
                          src={
                            post.media
                          }
                          controls
                          playsInline
                          style={{
                            width:
                              "100%",
                            maxHeight:
                              620,
                            borderRadius:
                              18,
                            marginTop:
                              12,
                          }}
                        />
                      )}

                      <footer>

                        <button
                          type="button"
                          className={
                            post.liked
                              ? "is-active"
                              : ""
                          }
                          onClick={() =>
                            toggleProfilePostLike(
                              post.id
                            )
                          }
                        >
                          <YatutIcon
                            name="heart"
                            size={16}
                          />

                          {
                            post.likes
                          }
                        </button>

                        <button
                          type="button"
                          className={
                            openProfileComments[
                              post.id
                            ]
                              ? "is-active"
                              : ""
                          }
                          onClick={() =>
                            toggleProfileComments(
                              post.id
                            )
                          }
                        >
                          <YatutIcon
                            name="chats"
                            size={16}
                          />

                          {
                            post.comments
                          }
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            shareProfilePost(
                              post
                            )
                          }
                        >
                          <YatutIcon
                            name="share"
                            size={16}
                          />

                          Поділитися
                        </button>

                        <button
                          type="button"
                          className={
                            isSaved(
                              "post",
                              post.id
                            )
                              ? "is-active"
                              : ""
                          }
                          onClick={() =>
                            toggleProfilePostSaved(
                              post
                            )
                          }
                          aria-label={
                            isSaved(
                              "post",
                              post.id
                            )
                              ? "Прибрати зі збережених"
                              : "Зберегти"
                          }
                        >
                          <YatutIcon
                            name="saved"
                            size={16}
                          />
                        </button>

                      </footer>

                      {openProfileComments[
                        post.id
                      ] && (
                        <section className="profile-v2-inline-comments">
                          {(post.commentItems ||
                            []).map(
                            (
                              comment
                            ) => (
                              <div
                                key={
                                  comment.id
                                }
                              >
                                <strong>
                                  {
                                    comment.author
                                  }
                                </strong>

                                <span>
                                  {
                                    comment.text
                                  }
                                </span>
                              </div>
                            )
                          )}

                          <div className="profile-v2-inline-comment-form">
                            <input
                              value={
                                profileCommentDrafts[
                                  post.id
                                ] ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                setProfileCommentDrafts(
                                  (
                                    current
                                  ) => ({
                                    ...current,

                                    [post.id]:
                                      event.target.value,
                                  })
                                )
                              }
                              placeholder="Написати коментар..."
                              onKeyDown={(
                                event
                              ) => {
                                if (
                                  event.key ===
                                  "Enter"
                                ) {
                                  event.preventDefault();

                                  addProfileComment(
                                    post.id
                                  );
                                }
                              }}
                            />

                            <button
                              type="button"
                              disabled={
                                !(
                                  profileCommentDrafts[
                                    post.id
                                  ] ||
                                  ""
                                ).trim()
                              }
                              onClick={() =>
                                addProfileComment(
                                  post.id
                                )
                              }
                            >
                              Надіслати
                            </button>
                          </div>
                        </section>
                      )}

                    </article>
                  )
                )}

              </div>
            )}

            {/* =================================================
                ABOUT
            ================================================= */}

            {activeTab ===
              "about" && (
              <section className="profile-v2-card profile-v2-about-card">

                <div className="profile-v2-card-head">

                  <div>
                    <span>
                      ПРО МЕНЕ
                    </span>

                    <h3>
                      Більше про{" "}
                      {
                        profile.name
                      }
                    </h3>
                  </div>

                </div>

                <div className="profile-v2-about-grid">

                  <AboutRow
                    icon="pin"
                    label="Місто"
                    value={`${profile.city}, ${profile.country}`}
                  />

                  <AboutRow
                    icon="business"
                    label="Робота"
                    value={
                      profile.work
                    }
                  />

                  <AboutRow
                    icon="community"
                    label="Освіта"
                    value={
                      profile.education
                    }
                  />

                  <AboutRow
                    icon="friends"
                    label="Статус"
                    value={
                      profile.statusText
                    }
                  />

                </div>

                <div className="profile-v2-interests">

                  <span>
                    ІНТЕРЕСИ
                  </span>

                  <div>

                    {profile.interests.map(
                      (
                        interest
                      ) => (
                        <button
                          key={
                            interest
                          }
                          type="button"
                          onClick={() =>
                            onNavigate?.(
                              "search",
                              {
                                query:
                                  interest,

                                tab:
                                  "people",
                              }
                            )
                          }
                        >
                          {
                            interest
                          }
                        </button>
                      )
                    )}

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                PULSE
            ================================================= */}

            {activeTab ===
              "pulse" && (
              <section className="profile-v2-card profile-v2-pulse-tab">

                <div className="profile-v2-pulse-tab__hero">

                  <span className="profile-v2-pulse-tab__icon">
                    <YatutIcon
                      name="pulse"
                      size={24}
                    />
                  </span>

                  <div>
                    <span>
                      ТВОЯ АКТИВНІСТЬ
                    </span>

                    <h3>
                      PULSE профілю
                    </h3>

                    <p>
                      Місця, відео,
                      люди та події,
                      з якими ти
                      пов’язаний зараз.
                    </p>
                  </div>

                  <strong>
                    {
                      formatProfileNumber(
                        profile.pulseReach
                      )
                    }
                    <small>
                      охоплення
                    </small>
                  </strong>

                </div>

                <div className="profile-v2-pulse-tab__stats">

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate?.(
                        "pulse"
                      )
                    }
                  >
                    <strong>
                      18
                    </strong>

                    <span>
                      хвиль
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate?.(
                        "live"
                      )
                    }
                  >
                    <strong>
                      4
                    </strong>

                    <span>
                      LIVE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate?.(
                        "cityPulse",
                        {
                          cityId:
                            "kyiv",
                        }
                      )
                    }
                  >
                    <strong>
                      17
                    </strong>

                    <span>
                      місць
                    </span>
                  </button>

                </div>

                <div className="profile-v2-pulse-tab__actions">

                  <button
                    type="button"
                    className="is-primary"
                    onClick={() =>
                      onNavigate?.(
                        "pulse"
                      )
                    }
                  >
                    Відкрити PULSE
                    <YatutIcon
                      name="arrowRight"
                      size={16}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate?.(
                        "cityPulse",
                        {
                          cityId:
                            "kyiv",
                        }
                      )
                    }
                  >
                    Київ зараз
                  </button>

                </div>

              </section>
            )}

            {/* =================================================
                ACHIEVEMENTS
            ================================================= */}

            {activeTab ===
              "achievements" && (
              <section className="profile-v2-card">

                <div className="profile-v2-card-head">

                  <div>
                    <span>
                      ЯТУТ
                    </span>

                    <h3>
                      Досягнення та
                      нагороди
                    </h3>
                  </div>

                  <strong className="profile-v2-achievement-count">
                    {
                      ACHIEVEMENTS.length
                    }
                  </strong>

                </div>

                <div className="profile-v2-achievements-grid">

                  {ACHIEVEMENTS.map(
                    (
                      item
                    ) => (
                      <Achievement
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                      />
                    )
                  )}

                </div>

              </section>
            )}

          </main>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="profile-v2-side">

            {/* PULSE */}

            <section className="profile-v2-card profile-v2-pulse-card">

              <div className="profile-v2-card-head">

                <div>
                  <span>
                    ПУЛЬС ЯТУТ
                  </span>

                  <h3>
                    Ваш профіль зараз
                  </h3>
                </div>

                <span className="profile-v2-live-chip">
                  LIVE
                </span>

              </div>

              <div className="profile-v2-pulse-list">

                <PulseItem
                  label="Переглядів профілю"
                  value="+128"
                  detail="за 7 днів"
                />

                <PulseItem
                  label="Нових зв’язків"
                  value="+14"
                  detail="цього тижня"
                />

                <PulseItem
                  label="Людей поруч"
                  value="7"
                  detail="у вашому колі"
                />

              </div>

            </section>

            {/* REPUTATION */}

            <section className="profile-v2-card">

              <div className="profile-v2-card-head">

                <div>
                  <span>
                    РЕПУТАЦІЯ
                  </span>

                  <h3>
                    Довіра у ЯТУТ
                  </h3>
                </div>

              </div>

              <div className="profile-v2-reputation">

                {reputation.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.label
                      }
                    >

                      <header>

                        <strong>
                          {
                            item.label
                          }
                        </strong>

                        <span>
                          {
                            item.value
                          }
                          %
                        </span>

                      </header>

                      <div className="profile-v2-progress">

                        <i
                          style={{
                            width:
                              `${item.value}%`,
                          }}
                        />

                      </div>

                      <small>
                        {
                          item.text
                        }
                      </small>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* BADGES */}

            <section className="profile-v2-card">

              <div className="profile-v2-card-head">

                <div>
                  <span>
                    ВАШІ ЗНАЧКИ
                  </span>

                  <h3>
                    Головні відзнаки
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "achievements"
                    )
                  }
                >
                  Усі
                </button>

              </div>

              <div className="profile-v2-badge-row">

                {ACHIEVEMENTS
                  .slice(
                    0,
                    4
                  )
                  .map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className={`profile-v2-mini-badge ${item.tone}`}
                        title={
                          item.title
                        }
                      >
                        {
                          item.symbol
                        }
                      </div>
                    )
                  )}

              </div>

            </section>

            {/* CONNECTION MAP */}

            <section className="profile-v2-card profile-v2-connection-card">

              <div className="profile-v2-connection-icon">
                <YatutIcon
                  name="friends"
                  size={23}
                />
              </div>

              <div>

                <span>
                  ЧОМУ МИ ЗНАЙОМІ?
                </span>

                <h3>
                  Карта ваших
                  зв’язків
                </h3>

                <p>
                  Дізнайтесь,
                  через кого,
                  місця та події
                  ви пов’язані
                  з іншими людьми.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "search"
                  )
                }
              >
                Відкрити

                <YatutIcon
                  name="arrowRight"
                  size={15}
                />
              </button>

            </section>

          </aside>

        </div>

      </section>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (
        <EditProfileModal
          profile={
            profile
          }
          onClose={() =>
            setEditing(
              false
            )
          }
          onSave={async (
            nextProfile
          ) => {
            const {
              _avatarFile,
              _coverFile,
              ...cleanProfile
            } =
              nextProfile;

            let finalProfile =
              cleanProfile;

            if (
              authSession?.user?.id
            ) {
              try {
                const [
                  avatarUrl,
                  coverUrl,
                ] =
                  await Promise.all([
                    _avatarFile
                      ? uploadProfileImage(
                          authSession,
                          _avatarFile,
                          "avatar"
                        )
                      : Promise.resolve(
                          cleanProfile.avatar ||
                          null
                        ),
                    _coverFile
                      ? uploadProfileImage(
                          authSession,
                          _coverFile,
                          "cover"
                        )
                      : Promise.resolve(
                          cleanProfile.cover ||
                          null
                        ),
                  ]);

                finalProfile = {
                  ...cleanProfile,
                  avatar:
                    avatarUrl ||
                    cleanProfile.avatar ||
                    "",
                  cover:
                    coverUrl ||
                    cleanProfile.cover ||
                    "",
                };

                await updateMyProfile(
                  authSession,
                  finalProfile
                );
              } catch (
                error
              ) {
                console.warn(
                  "REMOTE PROFILE SAVE ERROR:",
                  error
                );

                window.alert(
                  error?.message ||
                  "Не вдалося зберегти фото профілю."
                );

                return;
              }
            }

            setProfile(
              finalProfile
            );

            setEditing(
              false
            );
          }}
        />
      )}

    </section>
  );
}

/* =========================================================
   ABOUT ROW
========================================================= */

function AboutRow({
  icon,
  label,
  value,
}) {
  return (
    <article className="profile-v2-about-row">

      <div>
        <YatutIcon
          name={icon}
          size={17}
        />
      </div>

      <section>

        <span>
          {label}
        </span>

        <strong>
          {value ||
            "Не вказано"}
        </strong>

      </section>

    </article>
  );
}

/* =========================================================
   ACHIEVEMENT
========================================================= */

function Achievement({
  item,
}) {
  return (
    <article
      className={`profile-v2-achievement ${item.tone}`}
    >

      <div>
        {
          item.symbol
        }
      </div>

      <section>

        <strong>
          {
            item.title
          }
        </strong>

        <span>
          {
            item.subtitle
          }
        </span>

      </section>

    </article>
  );
}

/* =========================================================
   PULSE ITEM
========================================================= */

function PulseItem({
  label,
  value,
  detail,
}) {
  return (
    <article className="profile-v2-pulse-item">

      <div>

        <strong>
          {
            label
          }
        </strong>

        <span>
          {
            detail
          }
        </span>

      </div>

      <b>
        {
          value
        }
      </b>

    </article>
  );
}

/* =========================================================
   EDIT PROFILE MODAL
========================================================= */

function EditProfileModal({
  profile,
  onClose,
  onSave,
}) {
  const [
    draft,
    setDraft,
  ] =
    useState(
      profile
    );

  const avatarInputRef =
    useRef(null);

  const coverInputRef =
    useRef(null);

  const [
    avatarFile,
    setAvatarFile,
  ] =
    useState(null);

  const [
    coverFile,
    setCoverFile,
  ] =
    useState(null);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  /* =======================================================
     IMAGE
  ======================================================= */

  async function chooseImage(
    file,
    field
  ) {
    if (!file) {
      return;
    }

    try {
      const dataUrl =
        await fileToDataUrl(
          file
        );

      setDraft(
        (
          previous
        ) => ({
          ...previous,

          [field]:
            dataUrl,
        })
      );

      if (
        field ===
        "avatar"
      ) {
        setAvatarFile(
          file
        );
      } else {
        setCoverFile(
          file
        );
      }
    } catch (error) {
      console.error(
        "PROFILE IMAGE ERROR:",
        error
      );
    }
  }

  /* =======================================================
     FIELD
  ======================================================= */

  function setField(
    field,
    value
  ) {
    setDraft(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          value,
      })
    );
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function submit(
    event
  ) {
    event.preventDefault();

    if (
      saving
    ) {
      return;
    }

    try {
      setSaving(
        true
      );

      await onSave({
        ...profile,
        ...draft,

        name:
          draft.name
            ?.trim() ||
          profile.name,

        username:
          draft.username
            ?.trim()
            .replace(
              /^@/,
              ""
            ) ||
          profile.username,

        interests:
          Array.isArray(
            draft.interests
          )
            ? draft.interests
            : [],

        _avatarFile:
          avatarFile,

        _coverFile:
          coverFile,
      });
    } finally {
      setSaving(
        false
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="profile-v2-edit-backdrop"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <form
        className="profile-v2-edit-modal"
        onSubmit={
          submit
        }
      >

        {/* HEADER */}

        <header>

          <div>

            <span>
              ЯТУТ PROFILE
            </span>

            <h2>
              Редагувати профіль
            </h2>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Закрити"
          >
            <YatutIcon
              name="close"
              size={18}
            />
          </button>

        </header>

        {/* COVER */}

        <div
          className="profile-v2-edit-cover"
          style={
            draft.cover
              ? {
                  backgroundImage:
                    `linear-gradient(
                      180deg,
                      rgba(14,16,26,.08),
                      rgba(14,16,26,.38)
                    ),
                    url("${draft.cover}")`,
                }
              : undefined
          }
        >

          <button
            type="button"
            onClick={() =>
              coverInputRef
                .current
                ?.click()
            }
          >
            Змінити обкладинку
          </button>

        </div>

        {/* AVATAR */}

        <div className="profile-v2-edit-avatar-row">

          <div className="profile-v2-edit-avatar">

            {draft.avatar ? (
              <img
                src={
                  draft.avatar
                }
                alt=""
              />
            ) : (
              draft.name?.[0] ||
              "В"
            )}

          </div>

          <div>

            <strong>
              Фото профілю
            </strong>

            <span>
              JPG, PNG або WEBP
            </span>

            <button
              type="button"
              onClick={() =>
                avatarInputRef
                  .current
                  ?.click()
              }
            >
              Змінити фото
            </button>

          </div>

        </div>

        {/* BODY */}

        <div className="profile-v2-edit-body">

          {/* BASIC */}

          <section>

            <h3>
              Основне
            </h3>

            <div className="profile-v2-form-grid">

              <label>

                <span>
                  Ім’я
                </span>

                <input
                  value={
                    draft.name
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "name",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Username
                </span>

                <input
                  value={
                    draft.username
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "username",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

            </div>

            <label>

              <span>
                Про себе
              </span>

              <textarea
                value={
                  draft.bio
                }
                onChange={(
                  event
                ) =>
                  setField(
                    "bio",
                    event
                      .target
                      .value
                  )
                }
                maxLength={
                  500
                }
              />

            </label>

          </section>

          {/* INFO */}

          <section>

            <h3>
              Інформація
            </h3>

            <div className="profile-v2-form-grid">

              <label>

                <span>
                  Місто
                </span>

                <input
                  value={
                    draft.city
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "city",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Країна
                </span>

                <input
                  value={
                    draft.country
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "country",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Робота
                </span>

                <input
                  value={
                    draft.work
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "work",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Освіта
                </span>

                <input
                  value={
                    draft.education
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "education",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

            </div>

          </section>

          {/* INTERESTS */}

          <section>

            <h3>
              Інтереси
            </h3>

            <label>

              <span>
                Через кому
              </span>

              <input
                value={
                  draft.interests.join(
                    ", "
                  )
                }
                onChange={(
                  event
                ) =>
                  setField(
                    "interests",

                    event
                      .target
                      .value
                      .split(
                        ","
                      )
                      .map(
                        (
                          item
                        ) =>
                          item.trim()
                      )
                      .filter(
                        Boolean
                      )
                  )
                }
              />

            </label>

          </section>

        </div>

        {/* FOOTER */}

        <footer>

          <button
            className="profile-v2-edit-cancel"
            type="button"
            onClick={
              onClose
            }
          >
            Скасувати
          </button>

          <button
            className="profile-v2-edit-save"
            type="submit"
            disabled={
              saving
            }
          >
            {saving
              ? "Зберігаємо…"
              : "Зберегти"}
          </button>

        </footer>

        {/* FILE INPUTS */}

        <input
          ref={
            avatarInputRef
          }
          type="file"
          accept="image/*"
          hidden
          onChange={(
            event
          ) =>
            chooseImage(
              event
                .target
                .files?.[0],

              "avatar"
            )
          }
        />

        <input
          ref={
            coverInputRef
          }
          type="file"
          accept="image/*"
          hidden
          onChange={(
            event
          ) =>
            chooseImage(
              event
                .target
                .files?.[0],

              "cover"
            )
          }
        />

      </form>

    </div>
  );
}