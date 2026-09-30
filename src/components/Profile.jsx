import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  createPortal,
} from "react-dom";

import "./ProfileV2.css";
import YatutIcon from "./YatutIcon";
import YatutMediaViewer from "./ui/YatutMediaViewer";
import useYatutAutoAnimate from "../hooks/useYatutAutoAnimate";

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
  hasMyActiveStory,
} from "../services/storyBackendService";

import {
  subscribeStoriesRealtime,
} from "../services/realtimeService";

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
    website: "",
    instagram: "",
    telegram: "",
    birthday: "",
    cover: "",
    avatar: "",
    status: "Я тут",
    statusText: "",
    followers: 0,
    following: 0,
    friends: 0,
    posts: 0,
    pulseReach: 0,
    verified: false,
    founder: false,
    earlyUser: false,
    online: true,
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


function loadProfileCropImage(
  src
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const image =
        new Image();

      image.onload =
        () =>
          resolve(
            image
          );

      image.onerror =
        () =>
          reject(
            new Error(
              "Не вдалося підготувати фото."
            )
          );

      image.src =
        src;
    }
  );
}

async function cropProfileImage(
  file,
  {
    x = 50,
    y = 50,
    zoom = 1,
    aspect = 1,
    maxWidth = 1200,
    prefix = "profile",
  } = {}
) {
  if (!file) {
    return null;
  }

  const source =
    await fileToDataUrl(
      file
    );

  const image =
    await loadProfileCropImage(
      source
    );

  const sourceWidth =
    image.naturalWidth ||
    image.width;

  const sourceHeight =
    image.naturalHeight ||
    image.height;

  if (
    !sourceWidth ||
    !sourceHeight
  ) {
    throw new Error(
      "Не вдалося визначити розмір фото."
    );
  }

  const safeAspect =
    Math.max(
      0.25,
      Number(
        aspect
      ) ||
        1
    );

  const safeZoom =
    Math.max(
      1,
      Math.min(
        3,
        Number(
          zoom
        ) ||
          1
      )
    );

  const sourceAspect =
    sourceWidth /
    sourceHeight;

  let baseCropWidth =
    sourceWidth;

  let baseCropHeight =
    sourceHeight;

  if (
    sourceAspect >
    safeAspect
  ) {
    baseCropWidth =
      sourceHeight *
      safeAspect;
  } else {
    baseCropHeight =
      sourceWidth /
      safeAspect;
  }

  const cropWidth =
    baseCropWidth /
    safeZoom;

  const cropHeight =
    baseCropHeight /
    safeZoom;

  const normalizedX =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          x
        ) ||
          0
      )
    ) /
    100;

  const normalizedY =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          y
        ) ||
          0
      )
    ) /
    100;

  const sourceX =
    Math.max(
      0,
      (
        sourceWidth -
        cropWidth
      ) *
        normalizedX
    );

  const sourceY =
    Math.max(
      0,
      (
        sourceHeight -
        cropHeight
      ) *
        normalizedY
    );

  const outputWidth =
    Math.max(
      320,
      Math.min(
        maxWidth,
        Math.round(
          cropWidth
        )
      )
    );

  const outputHeight =
    Math.max(
      1,
      Math.round(
        outputWidth /
        safeAspect
      )
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    outputWidth;

  canvas.height =
    outputHeight;

  const context =
    canvas.getContext(
      "2d",
      {
        alpha: false,
      }
    );

  if (!context) {
    throw new Error(
      "Не вдалося підготувати кадрування."
    );
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const blob =
    await new Promise(
      (
        resolve,
        reject
      ) => {
        canvas.toBlob(
          (
            value
          ) => {
            if (value) {
              resolve(
                value
              );

              return;
            }

            reject(
              new Error(
                "Не вдалося зберегти кадрування."
              )
            );
          },
          "image/jpeg",
          0.92
        );
      }
    );

  return new File(
    [
      blob,
    ],
    `${prefix}-${Date.now()}.jpg`,
    {
      type:
        "image/jpeg",
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
    mobileMoreOpen,
    setMobileMoreOpen,
  ] =
    useState(false);

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
    hasActiveStory,
    setHasActiveStory,
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

  const [
    profileMedia,
    setProfileMedia,
  ] = useState({
    open: false,
    src: "",
    type: "image",
  });

  const mobileStatusWrapRef =
    useRef(null);

  const desktopStatusWrapRef =
    useRef(null);

  const [
    profilePostsAnimateRef,
  ] = useYatutAutoAnimate({
    duration: 230,
  });

  function openProfileMedia(
    src,
    type = "image"
  ) {
    if (!src) {
      return;
    }

    setProfileMedia({
      open: true,
      src,
      type,
    });
  }

  useEffect(
    () => {
      document.documentElement.classList.add(
        "yatut-profile-immersive"
      );
      document.body.classList.add(
        "yatut-profile-immersive"
      );

      return () => {
        document.documentElement.classList.remove(
          "yatut-profile-immersive"
        );
        document.body.classList.remove(
          "yatut-profile-immersive"
        );
      };
    },
    []
  );

  useEffect(
    () => {
      const cover =
        String(
          profile.cover ||
          ""
        ).trim();

      const cssCover =
        cover
          ? `url("${cover.replace(
              /"/g,
              "\\\""
            )}")`
          : "none";

      document.documentElement.style.setProperty(
        "--yatut-profile-cover-image",
        cssCover
      );

      document.body.classList.toggle(
        "has-yatut-profile-cover",
        Boolean(
          cover
        )
      );

      return () => {
        document.documentElement.style.removeProperty(
          "--yatut-profile-cover-image"
        );

        document.body.classList.remove(
          "has-yatut-profile-cover"
        );
      };
    },
    [
      profile.cover,
    ]
  );

  useEffect(
    () => {
      if (
        !authSession?.user?.id
      ) {
        setHasActiveStory(
          false
        );

        return undefined;
      }

      let active =
        true;

      let refreshTimer =
        null;

      const refreshStoryState =
        async () => {
          try {
            const next =
              await hasMyActiveStory(
                authSession
              );

            if (active) {
              setHasActiveStory(
                next
              );
            }
          } catch (
            error
          ) {
            console.warn(
              "PROFILE STORY STATE ERROR:",
              error
            );
          }
        };

      refreshStoryState();

      const channel =
        subscribeStoriesRealtime({
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
                  refreshStoryState,
                  90
                );
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

        channel?.close?.();
      };
    },
    [
      authSession?.user?.id,
      authSession?.access_token,
    ]
  );

  useEffect(
    () => {
      if (!statusOpen) {
        return undefined;
      }

      function handlePointerDown(
        event
      ) {
        const target =
          event.target;

        const insideMobile =
          mobileStatusWrapRef.current
            ?.contains?.(
              target
            );

        const insideDesktop =
          desktopStatusWrapRef.current
            ?.contains?.(
              target
            );

        if (
          !insideMobile &&
          !insideDesktop
        ) {
          setStatusOpen(
            false
          );
        }
      }

      function handleKeyDown(
        event
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          setStatusOpen(
            false
          );
        }
      }

      document.addEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.addEventListener(
        "keydown",
        handleKeyDown
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          handlePointerDown
        );

        document.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };
    },
    [
      statusOpen,
    ]
  );

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
                statusText:
                  socialProfile?.statusText ??
                  remote?.status_text ??
                  previous.statusText,
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
                founder:
                  Boolean(
                    remote?.founder
                  ),
                earlyUser:
                  Boolean(
                    remote?.early_user
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

  const earnedAchievements =
    useMemo(
      () =>
        ACHIEVEMENTS.filter(
          (
            item
          ) => {
            if (
              item.id ===
              "founder"
            ) {
              return Boolean(
                profile.founder
              );
            }

            if (
              item.id ===
              "verified"
            ) {
              return Boolean(
                profile.verified
              );
            }

            if (
              item.id ===
              "early"
            ) {
              return Boolean(
                profile.earlyUser
              );
            }

            return false;
          }
        ),
      [
        profile.founder,
        profile.verified,
        profile.earlyUser,
      ]
    );

  const reputation =
    authSession?.user?.id
      ? [
          {
            label:
              "Надійність",
            value:
              0,
            text:
              "Ще немає достатньо даних",
          },
          {
            label:
              "Активність",
            value:
              0,
            text:
              "Зʼявиться після активності у ЯТУТ",
          },
          {
            label:
              "Вклад",
            value:
              0,
            text:
              "Зʼявиться після участі у спільнотах",
          },
        ]
      : [
          {
            label:
              "Надійність",
            value:
              96,
            text:
              "Високий рівень довіри",
          },
          {
            label:
              "Активність",
            value:
              88,
            text:
              "Регулярно у ЯТУТ",
          },
          {
            label:
              "Вклад",
            value:
              92,
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

  async function updateStatus(
    status,
    statusText
  ) {
    const nextProfile = {
      ...profile,
      status,
      statusText,
    };

    setProfile(
      nextProfile
    );

    setStatusOpen(
      false
    );

    window.dispatchEvent(
      new CustomEvent(
        "yatut:profile-updated",
        {
          detail:
            nextProfile,
        }
      )
    );

    if (
      authSession?.user?.id
    ) {
      try {
        await updateMyProfile(
          authSession,
          nextProfile
        );
      } catch (
        error
      ) {
        console.warn(
          "PROFILE STATUS SAVE ERROR:",
          error
        );
      }
    }
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
    <section className="profile-v2-page profile-v4-immersive">
      <div
        className="profile-v2-wallpaper"
        style={
          profile.cover
            ? {
                backgroundImage:
                  `url("${profile.cover}")`,
              }
            : undefined
        }
      />

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
              <motion.button
                type="button"
                className="profile-v3-mobile-avatar"
                whileTap={{
                  scale: 0.96,
                }}
                onClick={() =>
                  openProfileMedia(
                    profile.avatar,
                    "image"
                  )
                }
                aria-label="Відкрити фото профілю"
                disabled={
                  !profile.avatar
                }
              >
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
              </motion.button>

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
                  Редагувати профіль
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

                <div
                  className={`profile-v3-mobile-more-wrap ${
                    mobileMoreOpen
                      ? "is-open"
                      : ""
                  }`.trim()}
                >
                  <button
                    className="profile-v3-mobile-action profile-v3-mobile-more-trigger"
                    type="button"
                    aria-label="Більше"
                    aria-haspopup="menu"
                    aria-expanded={
                      mobileMoreOpen
                    }
                    onClick={() =>
                      setMobileMoreOpen(
                        (
                          current
                        ) =>
                          !current
                      )
                    }
                  >
                    <YatutIcon
                      name="more"
                      size={18}
                    />
                    <YatutIcon
                      name="chevronDown"
                      size={11}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileMoreOpen && (
                      <motion.div
                        className="profile-v3-mobile-more-menu"
                        role="menu"
                        initial={{
                          opacity: 0,
                          y: 6,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 4,
                          scale: 0.98,
                        }}
                        transition={{
                          duration: 0.15,
                        }}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveTab(
                              "about"
                            );
                            setMobileMoreOpen(
                              false
                            );
                          }}
                        >
                          Про мене
                        </button>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveTab(
                              "achievements"
                            );
                            setMobileMoreOpen(
                              false
                            );
                          }}
                        >
                          Досягнення
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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

            {(profile.city ||
              profile.country ||
              profile.work) && (
              <div className="profile-v3-mobile-meta">
                {(profile.city ||
                  profile.country) && (
                  <span>
                    <YatutIcon
                      name="pin"
                      size={15}
                    />

                    {
                      [
                        profile.city,
                        profile.country,
                      ]
                        .map(
                          (
                            value
                          ) =>
                            String(
                              value ||
                              ""
                            )
                              .trim()
                              .replace(
                                /^[,;\s]+/,
                                ""
                              )
                        )
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        )
                    }
                  </span>
                )}

                {profile.work && (
                  <span>
                    <YatutIcon
                      name="business"
                      size={15}
                    />

                    {
                      profile.work
                    }
                  </span>
                )}
              </div>
            )}

            <div
              ref={
                mobileStatusWrapRef
              }
              className="profile-v3-mobile-status-wrap"
            >
              <button
                className="profile-v3-mobile-status"
                type="button"
                aria-expanded={
                  statusOpen
                }
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

            <div
              className={`profile-v2-avatar-wrap ${
                hasActiveStory
                  ? "has-story"
                  : ""
              } ${
                profile.online
                  ? "is-online"
                  : ""
              }`.trim()}
              data-story={
                hasActiveStory
                  ? "active"
                  : "none"
              }
            >

              <div className="profile-v2-avatar-pulse">

                <motion.button
                  type="button"
                  className="profile-v2-avatar"
                  whileHover={{
                    scale: 1.012,
                  }}
                  whileTap={{
                    scale: 0.965,
                  }}
                  transition={{
                    type:
                      "spring",
                    stiffness:
                      460,
                    damping:
                      34,
                  }}
                  onClick={() =>
                    openProfileMedia(
                      profile.avatar,
                      "image"
                    )
                  }
                  aria-label={
                    hasActiveStory
                      ? "Відкрити фото профілю. Є активна історія"
                      : "Відкрити фото профілю"
                  }
                  disabled={
                    !profile.avatar
                  }
                >

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

                </motion.button>

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

                {(profile.city ||
                  profile.country) && (
                  <span>
                    <YatutIcon
                      name="pin"
                      size={15}
                    />

                    {
                      [
                        profile.city,
                        profile.country,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          ", "
                        )
                    }
                  </span>
                )}

                {profile.work && (
                  <span>
                    <YatutIcon
                      name="business"
                      size={15}
                    />

                    {
                      profile.work
                    }
                  </span>
                )}

              </div>

              {/* STATUS */}

              <div
                ref={
                  desktopStatusWrapRef
                }
                className="profile-v2-status-wrap"
              >

                <button
                  className="profile-v2-status"
                  type="button"
                  aria-expanded={
                    statusOpen
                  }
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
                  <motion.button
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
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={() =>
                      setActiveTab(
                        id
                      )
                    }
                  >
                    {activeTab ===
                      id && (
                      <motion.span
                        layoutId="profile-v2-tab-active"
                        className="profile-v2-tab-active"
                        transition={{
                          type: "spring",
                          stiffness: 470,
                          damping: 38,
                        }}
                      />
                    )}

                    <span className="profile-v2-tab-label">
                      {
                        label
                      }
                    </span>
                  </motion.button>
                )
              )}

            </nav>

            {/* =================================================
                POSTS
            ================================================= */}

            {activeTab ===
              "posts" && (
              <div
                ref={
                  profilePostsAnimateRef
                }
                className="profile-v2-post-list"
              >

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
                    <motion.article
                      key={
                        post.id
                      }
                      layout
                      className="profile-v2-post-card"
                      initial={{
                        opacity: 0,
                        y: 10,
                        scale: 0.992,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.985,
                      }}
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

                          <AnimatePresence>
                          {postMenuId ===
                            post.id && (
                            <motion.div
                              className="profile-v2-post-menu"
                              initial={{
                                opacity: 0,
                                y: 6,
                                scale: 0.96,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                              }}
                              exit={{
                                opacity: 0,
                                y: 4,
                                scale: 0.97,
                              }}
                              transition={{
                                duration: 0.16,
                              }}
                            >
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
                            </motion.div>
                          )}
                          </AnimatePresence>
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
                        <motion.button
                          type="button"
                          className="profile-v2-post-media-button"
                          whileTap={{
                            scale: 0.992,
                          }}
                          onClick={() =>
                            openProfileMedia(
                              post.media,
                              "image"
                            )
                          }
                          aria-label="Відкрити фото"
                        >
                          <img
                            src={
                              post.media
                            }
                            alt=""
                          />
                        </motion.button>
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

                        <motion.button
                          type="button"
                          whileTap={{
                            scale: 0.9,
                          }}
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
                        </motion.button>

                        <motion.button
                          type="button"
                          whileTap={{
                            scale: 0.92,
                          }}
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
                        </motion.button>

                        <motion.button
                          type="button"
                          whileTap={{
                            scale: 0.92,
                          }}
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
                        </motion.button>

                        <motion.button
                          type="button"
                          whileTap={{
                            scale: 0.92,
                          }}
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
                        </motion.button>

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

                    </motion.article>
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
                      earnedAchievements.length
                    }
                  </strong>

                </div>

                <div className="profile-v2-achievements-grid">

                  {earnedAchievements.length > 0 ? (
                    earnedAchievements.map(
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
                    )
                  ) : (
                    <p className="profile-v2-empty-note">
                      Перші досягнення зʼявляться тут після активності у ЯТУТ.
                    </p>
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
                  value={
                    authSession?.user?.id
                      ? "0"
                      : "+128"
                  }
                  detail={
                    authSession?.user?.id
                      ? "дані ще накопичуються"
                      : "за 7 днів"
                  }
                />

                <PulseItem
                  label="Нових зв’язків"
                  value={
                    authSession?.user?.id
                      ? "0"
                      : "+14"
                  }
                  detail={
                    authSession?.user?.id
                      ? "ще немає нових звʼязків"
                      : "цього тижня"
                  }
                />

                <PulseItem
                  label="Людей поруч"
                  value={
                    authSession?.user?.id
                      ? "0"
                      : "7"
                  }
                  detail={
                    authSession?.user?.id
                      ? "ще немає даних"
                      : "у вашому колі"
                  }
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

                {earnedAchievements
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

            window.dispatchEvent(
              new CustomEvent(
                "yatut:profile-updated",
                {
                  detail:
                    finalProfile,
                }
              )
            );

            setEditing(
              false
            );
          }}
        />
      )}

      <YatutMediaViewer
        open={
          profileMedia.open
        }
        onOpenChange={(
          open
        ) =>
          setProfileMedia(
            (
              previous
            ) => ({
              ...previous,
              open,
            })
          )
        }
        src={
          profileMedia.src
        }
        type={
          profileMedia.type
        }
        alt={
          profile.name
        }
      />

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


  const [
    cropEditor,
    setCropEditor,
  ] =
    useState(null);

  const [
    cropApplying,
    setCropApplying,
  ] =
    useState(false);

  const [
    imageSources,
    setImageSources,
  ] =
    useState({
      avatar: null,
      cover: null,
    });

  useEffect(
    () => {
      document.documentElement
        .classList.add(
          "yatut-profile-editor-open"
        );

      document.body
        .classList.add(
          "yatut-profile-editor-open"
        );

      return () => {
        document.documentElement
          .classList.remove(
            "yatut-profile-editor-open"
          );

        document.body
          .classList.remove(
            "yatut-profile-editor-open"
          );
      };
    },
    []
  );

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

      setCropEditor({
        field,
        file,
        src:
          dataUrl,
        crop: {
          x: 50,
          y: 50,
          zoom: 1,
        },
      });
    } catch (error) {
      console.error(
        "PROFILE IMAGE ERROR:",
        error
      );
    }
  }

  function reopenCropEditor(
    field
  ) {
    const source =
      imageSources[
        field
      ];

    if (!source) {
      return;
    }

    setCropEditor({
      field,
      file:
        source.file,
      src:
        source.src,
      crop: {
        ...source.crop,
      },
    });
  }

  async function applyCrop() {
    if (
      !cropEditor ||
      cropApplying
    ) {
      return;
    }

    try {
      setCropApplying(
        true
      );

      const isAvatar =
        cropEditor.field ===
        "avatar";

      const preparedFile =
        await cropProfileImage(
          cropEditor.file,
          {
            ...cropEditor.crop,
            aspect:
              isAvatar
                ? 1
                : 9 / 16,
            maxWidth:
              isAvatar
                ? 1024
                : 1080,
            prefix:
              isAvatar
                ? "avatar"
                : "cover",
          }
        );

      const previewUrl =
        await fileToDataUrl(
          preparedFile
        );

      setDraft(
        (
          previous
        ) => ({
          ...previous,
          [cropEditor.field]:
            previewUrl,
        })
      );

      if (isAvatar) {
        setAvatarFile(
          preparedFile
        );
      } else {
        setCoverFile(
          preparedFile
        );
      }

      setImageSources(
        (
          previous
        ) => ({
          ...previous,
          [cropEditor.field]: {
            file:
              cropEditor.file,
            src:
              cropEditor.src,
            crop: {
              ...cropEditor.crop,
            },
          },
        })
      );

      setCropEditor(
        null
      );
    } catch (error) {
      console.error(
        "PROFILE CROP ERROR:",
        error
      );

      window.alert(
        error?.message ||
        "Не вдалося підготувати кадрування."
      );
    } finally {
      setCropApplying(
        false
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

      const preparedAvatarFile =
        avatarFile ||
        null;

      const preparedCoverFile =
        coverFile ||
        null;

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
          preparedAvatarFile,

        _coverFile:
          preparedCoverFile,
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

  return createPortal(
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
        >
          {draft.cover ? (
            <img
              className="profile-v2-edit-cover-image"
              src={
                draft.cover
              }
              alt=""
            />
          ) : null}

          <div className="profile-v2-edit-cover-actions">
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

            {imageSources.cover && (
              <button
                type="button"
                className="profile-v2-edit-recrop"
                onClick={() =>
                  reopenCropEditor(
                    "cover"
                  )
                }
              >
                Налаштувати кадр
              </button>
            )}
          </div>
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

            {imageSources.avatar && (
              <button
                type="button"
                className="profile-v2-edit-recrop"
                onClick={() =>
                  reopenCropEditor(
                    "avatar"
                  )
                }
              >
                Налаштувати кадр
              </button>
            )}

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
          onClick={(
            event
          ) => {
            event.currentTarget.value =
              "";
          }}
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
          onClick={(
            event
          ) => {
            event.currentTarget.value =
              "";
          }}
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

      {cropEditor && (
        <ProfileImageCropper
          editor={
            cropEditor
          }
          applying={
            cropApplying
          }
          onCropChange={(
            nextCrop
          ) =>
            setCropEditor(
              (
                previous
              ) =>
                previous
                  ? {
                      ...previous,
                      crop:
                        nextCrop,
                    }
                  : previous
            )
          }
          onCancel={() =>
            setCropEditor(
              null
            )
          }
          onApply={
            applyCrop
          }
        />
      )}

    </div>,
    document.body
  );
}

/* =========================================================
   PROFILE IMAGE CROPPER
========================================================= */

function ProfileImageCropper({
  editor,
  applying,
  onCropChange,
  onCancel,
  onApply,
}) {
  const stageRef =
    useRef(null);

  const pointersRef =
    useRef(
      new Map()
    );

  const gestureRef =
    useRef(null);

  const isAvatar =
    editor.field ===
    "avatar";

  const crop =
    editor.crop || {
      x: 50,
      y: 50,
      zoom: 1,
    };

  function clamp(
    value,
    min,
    max
  ) {
    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }

  function patchCrop(
    patch
  ) {
    onCropChange?.({
      ...crop,
      ...patch,
    });
  }

  function distance(
    first,
    second
  ) {
    return Math.hypot(
      second.x -
        first.x,
      second.y -
        first.y
    );
  }

  function midpoint(
    first,
    second
  ) {
    return {
      x:
        (
          first.x +
          second.x
        ) /
        2,
      y:
        (
          first.y +
          second.y
        ) /
        2,
    };
  }

  function beginPan(
    pointer
  ) {
    gestureRef.current = {
      type:
        "pan",
      pointerId:
        pointer.id,
      start:
        pointer,
      crop: {
        ...crop,
      },
    };
  }

  function beginPinch() {
    const pointers =
      [
        ...pointersRef
          .current
          .values(),
      ];

    if (
      pointers.length <
      2
    ) {
      return;
    }

    const first =
      pointers[0];

    const second =
      pointers[1];

    gestureRef.current = {
      type:
        "pinch",
      startDistance:
        Math.max(
          1,
          distance(
            first,
            second
          )
        ),
      startMidpoint:
        midpoint(
          first,
          second
        ),
      crop: {
        ...crop,
      },
    };
  }

  function handlePointerDown(
    event
  ) {
    if (
      applying
    ) {
      return;
    }

    event.preventDefault();

    event.currentTarget
      .setPointerCapture?.(
        event.pointerId
      );

    pointersRef.current.set(
      event.pointerId,
      {
        id:
          event.pointerId,
        x:
          event.clientX,
        y:
          event.clientY,
      }
    );

    const pointerCount =
      pointersRef.current
        .size;

    if (
      pointerCount ===
      1
    ) {
      beginPan({
        id:
          event.pointerId,
        x:
          event.clientX,
        y:
          event.clientY,
      });
    } else if (
      pointerCount >=
      2
    ) {
      beginPinch();
    }
  }

  function handlePointerMove(
    event
  ) {
    if (
      !pointersRef.current.has(
        event.pointerId
      )
    ) {
      return;
    }

    event.preventDefault();

    pointersRef.current.set(
      event.pointerId,
      {
        id:
          event.pointerId,
        x:
          event.clientX,
        y:
          event.clientY,
      }
    );

    const stage =
      stageRef.current;

    const gesture =
      gestureRef.current;

    if (
      !stage ||
      !gesture
    ) {
      return;
    }

    const rect =
      stage.getBoundingClientRect();

    const pointers =
      [
        ...pointersRef.current
          .values(),
      ];

    if (
      pointers.length >=
      2
    ) {
      if (
        gesture.type !==
        "pinch"
      ) {
        beginPinch();

        return;
      }

      const first =
        pointers[0];

      const second =
        pointers[1];

      const currentDistance =
        Math.max(
          1,
          distance(
            first,
            second
          )
        );

      const currentMidpoint =
        midpoint(
          first,
          second
        );

      const nextZoom =
        clamp(
          gesture.crop.zoom *
            (
              currentDistance /
              gesture.startDistance
            ),
          1,
          3
        );

      const horizontalMove =
        (
          currentMidpoint.x -
          gesture.startMidpoint.x
        ) /
        Math.max(
          1,
          rect.width
        );

      const verticalMove =
        (
          currentMidpoint.y -
          gesture.startMidpoint.y
        ) /
        Math.max(
          1,
          rect.height
        );

      onCropChange?.({
        ...gesture.crop,
        zoom:
          nextZoom,
        x:
          clamp(
            gesture.crop.x -
              horizontalMove *
                100,
            0,
            100
          ),
        y:
          clamp(
            gesture.crop.y -
              verticalMove *
                100,
            0,
            100
          ),
      });

      return;
    }

    if (
      pointers.length ===
      1
    ) {
      const pointer =
        pointers[0];

      if (
        gesture.type !==
          "pan" ||
        gesture.pointerId !==
          pointer.id
      ) {
        beginPan(
          pointer
        );

        return;
      }

      const sensitivity =
        100 /
        Math.max(
          1,
          gesture.crop.zoom
        );

      onCropChange?.({
        ...gesture.crop,
        x:
          clamp(
            gesture.crop.x -
              (
                (
                  pointer.x -
                  gesture.start.x
                ) /
                Math.max(
                  1,
                  rect.width
                )
              ) *
                sensitivity,
            0,
            100
          ),
        y:
          clamp(
            gesture.crop.y -
              (
                (
                  pointer.y -
                  gesture.start.y
                ) /
                Math.max(
                  1,
                  rect.height
                )
              ) *
                sensitivity,
            0,
            100
          ),
      });
    }
  }

  function handlePointerEnd(
    event
  ) {
    pointersRef.current.delete(
      event.pointerId
    );

    event.currentTarget
      .releasePointerCapture?.(
        event.pointerId
      );

    const pointers =
      [
        ...pointersRef.current
          .values(),
      ];

    if (
      pointers.length ===
      1
    ) {
      beginPan(
        pointers[0]
      );
    } else if (
      pointers.length >=
      2
    ) {
      beginPinch();
    } else {
      gestureRef.current =
        null;
    }
  }

  useEffect(
    () => {
      function onKeyDown(
        event
      ) {
        if (
          event.key ===
          "Escape" &&
          !applying
        ) {
          onCancel?.();
        }
      }

      window.addEventListener(
        "keydown",
        onKeyDown
      );

      return () =>
        window.removeEventListener(
          "keydown",
          onKeyDown
        );
    },
    [
      applying,
      onCancel,
    ]
  );

  return (
    <div
      className="profile-image-cropper-backdrop profile-image-cropper-native"
      role="dialog"
      aria-modal="true"
      aria-label={
        isAvatar
          ? "Кадрування фото профілю"
          : "Кадрування фону профілю"
      }
    >
      <section className="profile-image-cropper-sheet">
        <header className="profile-image-cropper-native-header">
          <button
            type="button"
            className="profile-image-cropper-native-close"
            onClick={
              onCancel
            }
            disabled={
              applying
            }
            aria-label="Скасувати"
          >
            <YatutIcon
              name="close"
              size={28}
            />
          </button>

          <div className="profile-image-cropper-native-title">
            <strong>
              {isAvatar
                ? "Фото профілю"
                : "Фон профілю"}
            </strong>

            <span>
              {isAvatar
                ? "Перемістіть і масштабуйте фото"
                : "Налаштуйте, як фон виглядатиме у профілі"}
            </span>
          </div>

          <button
            type="button"
            className="profile-image-cropper-native-apply"
            onClick={
              onApply
            }
            disabled={
              applying
            }
            aria-label="Застосувати"
          >
            {applying
              ? "…"
              : "✓"}
          </button>
        </header>

        <div
          ref={
            stageRef
          }
          className={
            `profile-image-cropper-native-stage ${
              isAvatar
                ? "is-avatar"
                : "is-cover"
            }`
          }
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            handlePointerEnd
          }
          onPointerCancel={
            handlePointerEnd
          }
        >
          <img
            className="profile-image-cropper-native-backdrop-image"
            src={
              editor.src
            }
            alt=""
            draggable="false"
          />

          <div
            className={
              `profile-image-cropper-native-frame ${
                isAvatar
                  ? "is-avatar"
                  : "is-cover"
              }`
            }
          >
            <img
              src={
                editor.src
              }
              alt=""
              draggable="false"
              style={{
                objectPosition:
                  `${crop.x}% ${crop.y}%`,
                transform:
                  `scale(${crop.zoom})`,
                transformOrigin:
                  `${crop.x}% ${crop.y}%`,
              }}
            />

            {!isAvatar && (
              <>
                <div className="profile-image-cropper-native-cover-ui">
                  <span className="brand">
                    <b>
                      Я
                    </b>

                    <strong>
                      ТУТ
                    </strong>
                  </span>

                  <span className="avatar-dot" />
                </div>

                <div className="profile-image-cropper-native-cover-fade" />
              </>
            )}
          </div>

          <div
            className={
              `profile-image-cropper-native-mask ${
                isAvatar
                  ? "is-avatar"
                  : "is-cover"
              }`
            }
          />

          <div className="profile-image-cropper-native-tip">
            <span>
              1 палець
            </span>
            <strong>
              переміщення
            </strong>

            <i />

            <span>
              2 пальці
            </span>
            <strong>
              масштаб
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

