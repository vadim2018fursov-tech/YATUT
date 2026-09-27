import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./styles/tokens.css";
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
import "./styles/mobile-more-menu.css";
import "./styles/pulse-final-polish.css";
import "./styles/final-ui-polish.css";
import "./styles/dark-theme-v2.css";

import Stories from "./components/Stories";
import Profile from "./components/Profile";
import Friends from "./components/Friends";
import FriendsErrorBoundary from "./components/FriendsErrorBoundary";
import Search from "./components/Search";
import Chats from "./components/Chats";
import Spaces from "./components/Spaces";

import Nearby from "./components/Nearby";
import Business from "./components/Business";
import Saved from "./components/Saved";
import Settings from "./components/Settings";
import Notifications from "./components/Notifications";
import MobileMoreMenu from "./components/MobileMoreMenu";
import AuthPage from "./components/AuthPage";
import Onboarding from "./components/Onboarding";
import DevicePermissions from "./components/DevicePermissions";
import AdminCenter from "./components/AdminCenter";
import AccountRestriction from "./components/AccountRestriction";

import NowPage from "./pages/NowPage";
import PulsePage from "./pages/PulsePage";
import ClipsPage from "./pages/ClipsPage";
import WatchPage from "./pages/WatchPage";
import LivePage from "./pages/LivePage";
import CityPulsePage from "./pages/CityPulsePage";
import EventsPulsePage from "./pages/EventsPulsePage";
import CreatorStudioPage from "./pages/CreatorStudioPage";
import CreatorProfilePage from "./pages/CreatorProfilePage";
import CreateHubPage from "./pages/CreateHubPage";
import CreateMediaPage from "./pages/CreateMediaPage";

import YatutIcon from "./components/YatutIcon";

import {
  shareYatutItem,
} from "./utils/shareYatutItem";

import {
  nativeSelectionHaptic,
} from "./services/nativeFeedbackService";

import {
  captureNativePhoto,
  captureNativeVideo,
  isNativeMediaPicker,
  pickNativeMedia,
  revokeMediaPreview,
} from "./services/mediaPickerService";

import {
  createSavedPost,
  getSavedItems,
  isSaved,
  removeSavedItem,
  replaceSavedItems,
  subscribeSavedItems,
  toggleSaved,
} from "./storage/savedService";

import {
  getNotifications,
  ingestNotificationEvent,
  markNotificationRead,
  removeNotification,
  replaceNotifications,
  subscribeNotifications,
} from "./storage/notificationService";

import {
  completeMyOnboarding,
  getAuthSession,
  getMyProfile,
  isAuthBackendConfigured,
  signOut,
  subscribeAuthState,
} from "./services/authService";

import {
  addBackendComment,
  createBackendPost,
  deleteBackendPost,
  incrementBackendShare,
  loadBackendFeed,
  toggleBackendPostLike,
} from "./services/feedBackendService";

import {
  getBackendFriendPeople,
  getBackendRelationships,
} from "./services/socialBackendService";

import {
  subscribeFeedRealtime,
  subscribeNotificationsRealtime,
  subscribeSavedRealtime,
  subscribeSocialGraphRealtime,
} from "./services/realtimeService";

import {
  deleteBackendNotification,
  loadBackendNotifications,
  markBackendNotificationRead,
} from "./services/notificationBackendService";

import {
  uploadPostMedia,
} from "./services/storageService";

import {
  loadBackendSavedItems,
  syncBackendSavedDelta,
  syncBackendSavedItems,
} from "./services/savedBackendService";

import {
  acknowledgeMyWarning,
  getMyAccountAccessState,
} from "./services/accountAccessService";

import {
  syncPushSubscription,
} from "./services/pushNotificationService";

/* =========================================================
   YATUT APP
========================================================= */

const HOME_STORAGE_KEY =
  "yatut-home-posts-v7";

const SETTINGS_STORAGE_KEY =
  "yatut-settings-v1";

const SAVED_OWNER_KEY =
  "yatut-saved-owner-v1";

/* =========================================================
   URL ROUTER
========================================================= */

const ROUTE_TITLES = {
  home: "ЯТУТ",
  now: "Зараз · ЯТУТ",
  pulse: "PULSE · ЯТУТ",
  clips: "Кліпи · PULSE · ЯТУТ",
  watch: "Відео · PULSE · ЯТУТ",
  live: "LIVE · PULSE · ЯТУТ",
  cityPulse: "Місто · PULSE · ЯТУТ",
  create: "Створити · ЯТУТ",
  createMedia: "Створити медіа · ЯТУТ",
  creatorStudio: "Студія автора · ЯТУТ",
  creator: "Автор · ЯТУТ",
  friends: "Друзі · ЯТУТ",
  search: "Пошук · ЯТУТ",
  chats: "Чати · ЯТУТ",
  notifications: "Сповіщення · ЯТУТ",
  communities: "Спільноти · ЯТУТ",
  events: "Події · ЯТУТ",
  profile: "Профіль · ЯТУТ",
  nearby: "Поруч · ЯТУТ",
  business: "Бізнес · ЯТУТ",
  saved: "Збережене · ЯТУТ",
  settings: "Налаштування · ЯТУТ",
  admin: "Адмін · ЯТУТ",
  auth: "Вхід · ЯТУТ",
};

function decodeRoutePart(value) {
  try {
    return decodeURIComponent(value || "");
  } catch {
    return value || "";
  }
}

function routeFromLocation() {
  const url = new URL(window.location.href);
  const parts = url.pathname
    .split("/")
    .filter(Boolean)
    .map(decodeRoutePart);
  const first = parts[0] || "";
  const query = url.searchParams;

  if (!first) return { page: "home", payload: null };

  if (
    first === "auth"
  ) {
    return {
      page: "auth",
      payload:
        parts[1] ===
          "callback"
          ? {
              callback:
                true,
            }
          : null,
    };
  }

  if (first === "posts" && parts[1]) {
    return {
      page: "home",
      payload: {
        postId: parts[1],
        commentId: query.get("comment") || null,
        openComments: query.get("comments") === "1",
      },
    };
  }

  if (first === "people" && parts[1]) {
    return { page: "friends", payload: { personId: parts[1] } };
  }

  if (first === "pulse") {
    if (parts[1] === "clips") {
      return {
        page: "clips",
        payload:
          parts[2]
            ? {
                videoId:
                  parts[2],
                openComments:
                  query.get(
                    "comments"
                  ) ===
                  "1",
              }
            : null,
      };
    }
    if (parts[1] === "watch") {
      return {
        page: "watch",
        payload:
          parts[2]
            ? {
                videoId:
                  parts[2],
                openComments:
                  query.get(
                    "comments"
                  ) ===
                  "1",
              }
            : null,
      };
    }
    if (parts[1] === "live") {
      return { page: "live", payload: parts[2] ? { videoId: parts[2] } : null };
    }
    if (parts[1] === "city") {
      return { page: "cityPulse", payload: { cityId: parts[2] || "kyiv" } };
    }
    return { page: "pulse", payload: null };
  }

  if (first === "chats") {
    const chatId = parts[1] || query.get("chat");
    const personId = query.get("person");
    return {
      page: "chats",
      payload:
        chatId || personId
          ? { chatId: chatId || null, personId: personId || null }
          : null,
    };
  }

  if (first === "communities") {
    return {
      page: "communities",
      payload:
        parts[1] || query.get("post")
          ? {
              communityId: parts[1] || null,
              postId: query.get("post") || null,
            }
          : null,
    };
  }

  if (first === "events") {
    if (parts[1]) return { page: "events", payload: { eventId: parts[1] } };
    if (query.get("create") === "1") {
      return {
        page: "events",
        payload: {
          createEvent: true,
          communityId: query.get("community") || null,
        },
      };
    }
    return { page: "events", payload: null };
  }

  if (first === "profile") {
    if (parts[1] === "posts" && parts[2]) {
      return { page: "profile", payload: { postId: parts[2] } };
    }
    const tab = query.get("tab");
    const edit = query.get("edit") === "1";
    return {
      page: "profile",
      payload: tab || edit ? { tab: tab || null, action: edit ? "edit" : null } : null,
    };
  }

  if (first === "nearby") {
    return { page: "nearby", payload: parts[1] ? { placeId: parts[1] } : null };
  }

  if (first === "business") {
    return {
      page: "business",
      payload: parts[1] ? { businessId: parts[1] } : null,
    };
  }

  if (first === "creator" && parts[1]) {
    return { page: "creator", payload: { creatorId: parts[1] } };
  }

  if (first === "create") {
    if (parts[1] === "media") {
      return {
        page: "createMedia",
        payload: { type: parts[2] || "video" },
      };
    }
    return { page: "create", payload: null };
  }

  if (first === "studio") return { page: "creatorStudio", payload: null };

  if (first === "search") {
    const search = query.get("q");
    const tab = query.get("tab");
    return {
      page: "search",
      payload: search || tab ? { query: search || "", tab: tab || "all" } : null,
    };
  }

  if (first === "settings") {
    return {
      page: "settings",
      payload: parts[1] ? { section: parts[1] } : null,
    };
  }

  if (first === "admin") {
    return {
      page: "admin",
      payload: null,
    };
  }

  const simple = {
    now: "now",
    friends: "friends",
    saved: "saved",
    notifications: "notifications",
  };

  return simple[first]
    ? { page: simple[first], payload: null }
    : { page: "home", payload: null };
}

function routeToUrl(page, payload = null) {
  const encode = (value) => encodeURIComponent(String(value));

  switch (page) {
    case "auth":
      return "/auth";

    case "home": {
      if (!payload?.postId) return "/";
      const params = new URLSearchParams();
      if (payload.commentId) params.set("comment", payload.commentId);
      if (payload.openComments) params.set("comments", "1");
      const suffix = params.toString();
      return `/posts/${encode(payload.postId)}${suffix ? `?${suffix}` : ""}`;
    }
    case "now": return "/now";
    case "pulse": return "/pulse";
    case "clips": {
      if (!payload?.videoId) return "/pulse/clips";
      return `/pulse/clips/${encode(payload.videoId)}${payload.openComments ? "?comments=1" : ""}`;
    }
    case "watch": {
      if (!payload?.videoId) return "/pulse/watch";
      return `/pulse/watch/${encode(payload.videoId)}${payload.openComments ? "?comments=1" : ""}`;
    }
    case "live":
      return payload?.videoId ? `/pulse/live/${encode(payload.videoId)}` : "/pulse/live";
    case "cityPulse":
      return `/pulse/city/${encode(payload?.cityId || "kyiv")}`;
    case "create": return "/create";
    case "createMedia":
      return `/create/media/${encode(payload?.type || "video")}`;
    case "creatorStudio": return "/studio";
    case "creator":
      return `/creator/${encode(payload?.creatorId || payload?.personId || payload?.authorId || "maria")}`;
    case "friends":
      return payload?.personId ? `/people/${encode(payload.personId)}` : "/friends";
    case "search": {
      const params = new URLSearchParams();
      if (payload?.query || payload?.search) params.set("q", payload.query || payload.search);
      if (payload?.tab && payload.tab !== "all") params.set("tab", payload.tab);
      const suffix = params.toString();
      return `/search${suffix ? `?${suffix}` : ""}`;
    }
    case "chats": {
      const chatId = payload?.chatId;
      const personId = typeof payload === "string" ? payload : payload?.personId;
      const params = new URLSearchParams();
      if (personId) params.set("person", personId);
      const suffix = params.toString();
      return `/chats${chatId ? `/${encode(chatId)}` : ""}${suffix ? `?${suffix}` : ""}`;
    }
    case "communities": {
      const communityId = payload?.communityId || payload?.spaceId;
      const params = new URLSearchParams();
      if (payload?.postId) params.set("post", payload.postId);
      const suffix = params.toString();
      return `/communities${communityId ? `/${encode(communityId)}` : ""}${suffix ? `?${suffix}` : ""}`;
    }
    case "events":
      if (payload?.eventId) return `/events/${encode(payload.eventId)}`;
      if (payload?.createEvent) {
        const params = new URLSearchParams({ create: "1" });
        if (payload.communityId) params.set("community", payload.communityId);
        return `/events?${params.toString()}`;
      }
      return "/events";
    case "profile":
      if (payload?.postId) return `/profile/posts/${encode(payload.postId)}`;
      if (payload?.action === "edit") return "/profile?edit=1";
      if (payload?.tab) return `/profile?tab=${encode(payload.tab)}`;
      return "/profile";
    case "nearby":
      return payload?.placeId ? `/nearby/${encode(payload.placeId)}` : "/nearby";
    case "business":
      return payload?.businessId ? `/business/${encode(payload.businessId)}` : "/business";
    case "saved": return "/saved";
    case "notifications": return "/notifications";
    case "settings":
      return payload?.section ? `/settings/${encode(payload.section)}` : "/settings";
    case "admin":
      return "/admin";
    default: return "/";
  }
}

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

  {
    id: "admin",
    icon: "profile",
    title: "Адмін",
    founderOnly: true,
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
    id: "chats",
    icon: "chats",
    title: "Чати",
  },

  {
    id: "notifications",
    icon: "bell",
    title: "Сповіщення",
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

function authenticatedWelcomePosts() {
  return DEMO_POSTS
    .filter(
      (
        post
      ) =>
        post.authorId ===
        "yatut"
    )
    .map(
      (
        post
      ) => ({
        ...post,
        liked:
          false,
        likes:
          0,
        comments:
          [],
        shares:
          0,
        system:
          true,
      })
    );
}

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

                  liked:
                    Boolean(
                      comment.liked
                    ),

                  likes:
                    Number(
                      comment.likes ||
                        0
                    ),

                  replies:
                    Array.isArray(
                      comment.replies
                    )
                      ? comment.replies.map(
                          (
                            reply
                          ) => ({
                            ...reply,

                            liked:
                              Boolean(
                                reply.liked
                              ),

                            likes:
                              Number(
                                reply.likes ||
                                  0
                              ),
                          })
                        )
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
  onNavigate,
  viewerProfile = null,
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
    mediaFile,
    setMediaFile,
  ] =
    useState(null);

  const [
    publishing,
    setPublishing,
  ] =
    useState(false);

  const [
    nativeCaptureOpen,
    setNativeCaptureOpen,
  ] =
    useState(false);

  const nativeMediaAvailable =
    isNativeMediaPicker();

  const [
    locationOpen,
    setLocationOpen,
  ] =
    useState(false);

  const [
    locationText,
    setLocationText,
  ] =
    useState("");

  const [
    pollOpen,
    setPollOpen,
  ] =
    useState(false);

  const [
    pollQuestion,
    setPollQuestion,
  ] =
    useState("");

  const [
    pollOptions,
    setPollOptions,
  ] =
    useState([
      "",
      "",
    ]);

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

    if (
      file.size >
      100 *
        1024 *
        1024
    ) {
      window.alert(
        "Файл має бути до 100 МБ."
      );

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

      setMediaFile(
        file
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

  async function chooseNativeGallery(
    type
  ) {
    try {
      const selected =
        await pickNativeMedia(
          type
        );

      if (!selected) {
        return;
      }

      await chooseFile(
        selected.file,
        selected.mediaType ||
          type
      );

      revokeMediaPreview(
        selected.previewUrl
      );

      setNativeCaptureOpen(
        false
      );
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося відкрити медіатеку."
      );
    }
  }

  async function captureNativeMedia(
    type
  ) {
    try {
      const selected =
        type ===
        "video"
          ? await captureNativeVideo()
          : await captureNativePhoto();

      if (!selected) {
        return;
      }

      await chooseFile(
        selected.file,
        selected.mediaType ||
          type
      );

      revokeMediaPreview(
        selected.previewUrl
      );

      setNativeCaptureOpen(
        false
      );
    } catch (
      error
    ) {
      window.alert(
        error?.message ||
        "Не вдалося відкрити камеру."
      );
    }
  }

  async function publish() {
    const cleanText =
      text.trim();

    const cleanLocation =
      locationText.trim();

    const cleanPollOptions =
      pollOptions
        .map(
          (option) =>
            option.trim()
        )
        .filter(Boolean);

    const hasPoll =
      pollOpen &&
      pollQuestion.trim() &&
      cleanPollOptions.length >=
        2;

    if (
      !cleanText &&
      !media &&
      !hasPoll
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

        mediaFile,

        mediaType,

        location:
          cleanLocation ||
          null,

        poll:
          hasPoll
            ? {
                question:
                  pollQuestion.trim(),

                options:
                  cleanPollOptions.map(
                    (
                      option,
                      index
                    ) => ({
                      id:
                        `poll-option-${Date.now()}-${index}`,

                      text:
                        option,

                      votes:
                        0,
                    })
                  ),

                votedOptionId:
                  null,
              }
            : null,
      });

      setText("");

      setMedia(
        null
      );

      setMediaType(
        null
      );

      setMediaFile(
        null
      );

      setLocationText("");
      setLocationOpen(false);
      setPollQuestion("");
      setPollOptions([
        "",
        "",
      ]);
      setPollOpen(false);
      setNativeCaptureOpen(
        false
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
          onClick={() =>
            onNavigate?.(
              "profile"
            )
          }
          aria-label="Відкрити профіль"
        >
          {viewerProfile?.avatar ? (
            <img
              src={
                viewerProfile.avatar
              }
              alt=""
            />
          ) : (
            viewerProfile?.initial ||
            "Я"
          )}
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

      {locationOpen && (
        <div className="composer-inline-location">
          <YatutIcon
            name="pin"
            size={17}
          />

          <input
            value={
              locationText
            }
            onChange={(
              event
            ) =>
              setLocationText(
                event.target.value
              )
            }
            placeholder="Наприклад: Поділ, Київ"
            autoFocus
          />

          <button
            type="button"
            onClick={() => {
              setLocationText("");
              setLocationOpen(false);
            }}
            aria-label="Прибрати місце"
          >
            ×
          </button>
        </div>
      )}

      {pollOpen && (
        <div className="composer-poll-editor">
          <div className="composer-poll-head">
            <strong>
              Опитування
            </strong>

            <button
              type="button"
              onClick={() => {
                setPollOpen(false);
                setPollQuestion("");
                setPollOptions([
                  "",
                  "",
                ]);
              }}
              aria-label="Закрити опитування"
            >
              ×
            </button>
          </div>

          <input
            value={
              pollQuestion
            }
            onChange={(
              event
            ) =>
              setPollQuestion(
                event.target.value
              )
            }
            placeholder="Ваше запитання"
          />

          {pollOptions.map(
            (
              option,
              index
            ) => (
              <div
                className="composer-poll-option"
                key={
                  index
                }
              >
                <input
                  value={
                    option
                  }
                  onChange={(
                    event
                  ) =>
                    setPollOptions(
                      (
                        previous
                      ) =>
                        previous.map(
                          (
                            value,
                            optionIndex
                          ) =>
                            optionIndex ===
                            index
                              ? event.target.value
                              : value
                        )
                    )
                  }
                  placeholder={`Варіант ${index + 1}`}
                />

                {pollOptions.length >
                  2 && (
                  <button
                    type="button"
                    onClick={() =>
                      setPollOptions(
                        (
                          previous
                        ) =>
                          previous.filter(
                            (
                              _,
                              optionIndex
                            ) =>
                              optionIndex !==
                              index
                          )
                      )
                    }
                    aria-label="Видалити варіант"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          )}

          {pollOptions.length <
            6 && (
            <button
              type="button"
              className="composer-poll-add"
              onClick={() =>
                setPollOptions(
                  (
                    previous
                  ) => [
                    ...previous,
                    "",
                  ]
                )
              }
            >
              + Додати варіант
            </button>
          )}
        </div>
      )}

      {nativeMediaAvailable &&
        nativeCaptureOpen && (
        <div className="composer-native-capture">
          <button
            type="button"
            onClick={() =>
              captureNativeMedia(
                "image"
              )
            }
          >
            <span>
              📷
            </span>

            <div>
              <strong>
                Зняти фото
              </strong>

              <small>
                Відкрити камеру
              </small>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              captureNativeMedia(
                "video"
              )
            }
          >
            <span>
              🎥
            </span>

            <div>
              <strong>
                Записати відео
              </strong>

              <small>
                Камера + мікрофон
              </small>
            </div>
          </button>
        </div>
      )}

      <div className="composer-footer">
        <div className="composer-tools">
          <button
            type="button"
            onClick={() =>
              nativeMediaAvailable
                ? chooseNativeGallery(
                    "image"
                  )
                : imageInputRef.current?.click()
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
              nativeMediaAvailable
                ? chooseNativeGallery(
                    "video"
                  )
                : videoInputRef.current?.click()
            }
          >
            <YatutIcon
              name="video"
              size={17}
            />

            Відео
          </button>

          {nativeMediaAvailable && (
            <button
              type="button"
              className={
                nativeCaptureOpen
                  ? "active"
                  : ""
              }
              onClick={() =>
                setNativeCaptureOpen(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
            >
              <YatutIcon
                name="video"
                size={17}
              />

              Камера
            </button>
          )}

          <button
            type="button"
            className={
              locationOpen
                ? "active"
                : ""
            }
            onClick={() =>
              setLocationOpen(
                (
                  previous
                ) =>
                  !previous
              )
            }
          >
            <YatutIcon
              name="pin"
              size={17}
            />

            Місце
          </button>

          <button
            type="button"
            className={
              pollOpen
                ? "active"
                : ""
            }
            onClick={() =>
              setPollOpen(
                (
                  previous
                ) =>
                  !previous
              )
            }
          >
            <YatutIcon
              name="poll"
              size={17}
            />

            Опитування
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "events",
                {
                  createEvent:
                    true,

                  source:
                    "homeComposer",
                }
              )
            }
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
            (
              !text.trim() &&
              !media &&
              !(
                pollOpen &&
                pollQuestion.trim() &&
                pollOptions
                  .map(
                    (
                      option
                    ) =>
                      option.trim()
                  )
                  .filter(Boolean)
                  .length >=
                  2
              )
            )
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
  onToggleLike,
  onReply,
  onToggleReplyLike,
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
          {comment.authorAvatar ? (
            <img
              src={
                comment.authorAvatar
              }
              alt=""
            />
          ) : (
            comment.authorInitial ||
            "К"
          )}
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
              className={
                comment.liked
                  ? "comment-liked"
                  : ""
              }
              onClick={() =>
                onToggleLike(
                  comment.id
                )
              }
            >
              Подобається
              {Number(
                comment.likes ||
                  0
              ) >
                0
                ? ` · ${comment.likes}`
                : ""}
            </button>

            <button
              type="button"
              onClick={() =>
                onReply(
                  comment
                )
              }
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
                        {reply.authorAvatar ? (
                          <img
                            src={
                              reply.authorAvatar
                            }
                            alt=""
                          />
                        ) : (
                          reply.authorInitial ||
                          "К"
                        )}
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
                            className={
                              reply.liked
                                ? "comment-liked"
                                : ""
                            }
                            onClick={() =>
                              onToggleReplyLike(
                                comment.id,
                                reply.id
                              )
                            }
                          >
                            Подобається
                            {Number(
                              reply.likes ||
                                0
                            ) >
                              0
                              ? ` · ${reply.likes}`
                              : ""}
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
  onAddReply,
  onToggleCommentLike,
  onToggleReplyLike,
  viewerProfile = null,
}) {
  const [
    draft,
    setDraft,
  ] =
    useState("");

  const [
    replyTarget,
    setReplyTarget,
  ] =
    useState(null);

  function submit() {
    const text =
      draft.trim();

    if (!text) {
      return;
    }

    if (replyTarget) {
      onAddReply(
        post.id,
        replyTarget.id,
        text
      );
    } else {
      onAddComment(
        post.id,
        text
      );
    }

    setDraft("");
    setReplyTarget(null);
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
                onToggleLike={(
                  commentId
                ) =>
                  onToggleCommentLike(
                    post.id,
                    commentId
                  )
                }
                onReply={
                  setReplyTarget
                }
                onToggleReplyLike={(
                  commentId,
                  replyId
                ) =>
                  onToggleReplyLike(
                    post.id,
                    commentId,
                    replyId
                  )
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

      {replyTarget && (
        <div className="replying-label">
          <span>
            Відповідь для{" "}
            <strong>
              {
                replyTarget.authorName
              }
            </strong>
          </span>

          <button
            type="button"
            onClick={() =>
              setReplyTarget(
                null
              )
            }
            aria-label="Скасувати відповідь"
          >
            ×
          </button>
        </div>
      )}

      <div className="comment-composer">
        <div className="comment-avatar">
          {viewerProfile?.avatar ? (
            <img
              src={
                viewerProfile.avatar
              }
              alt=""
            />
          ) : (
            viewerProfile?.initial ||
            "Я"
          )}
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
            placeholder={
              replyTarget
                ? `Відповісти ${replyTarget.authorName}...`
                : "Написати коментар..."
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
  onAddReply,
  onToggleCommentLike,
  onToggleReplyLike,
  onVotePoll,
  onShare,
  onToggleSaved,
  onNavigate,
  viewerProfile = null,
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
            {post.authorAvatar ? (
              <img
                src={
                  post.authorAvatar
                }
                alt=""
              />
            ) : (
              post.authorInitial ||
              "Я"
            )}
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
) : null}
      </header>

      {post.text && (
        <div className="post-text">
          {
            post.text
          }
        </div>
      )}

      {post.eventId && (
        <button
          type="button"
          className="post-event-link"
          onClick={() =>
            onNavigate?.(
              "events",
              {
                eventId:
                  post.eventId,
              }
            )
          }
        >
          <span className="post-event-link__icon">
            <YatutIcon
              name="events"
              size={18}
            />
          </span>

          <span>
            <small>
              ПОДІЯ ЯТУТ
            </small>

            <strong>
              Відкрити подію
            </strong>
          </span>

          <YatutIcon
            name="arrowRight"
            size={16}
          />
        </button>
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

      {post.location && (
        <div className="post-location-row">
          <span className="post-location-chip">
            <YatutIcon
              name="pin"
              size={13}
            />

            {
              post.location
            }
          </span>
        </div>
      )}

      {post.poll && (
        <section className="post-poll">
          <h4>
            {
              post.poll.question
            }
          </h4>

          {(post.poll.options ||
            []).map(
            (
              option
            ) => {
              const selected =
                post.poll
                  .votedOptionId ===
                option.id;

              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  className={`poll-option ${selected ? "selected" : ""}`.trim()}
                  onClick={() =>
                    onVotePoll(
                      post.id,
                      option.id
                    )
                  }
                >
                  <span>
                    {
                      option.text
                    }
                  </span>

                  <strong>
                    {
                      option.votes ||
                      0
                    }
                  </strong>
                </button>
              );
            }
          )}

          {post.poll
            .votedOptionId && (
            <div className="poll-voted">
              Ваш голос враховано
            </div>
          )}
        </section>
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
          onAddReply={
            onAddReply
          }
          onToggleCommentLike={
            onToggleCommentLike
          }
          onToggleReplyLike={
            onToggleReplyLike
          }
          viewerProfile={
            viewerProfile
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
  authSession = null,
  viewerProfile = null,
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
        authSession?.user?.id
          ? authenticatedWelcomePosts()
          : safeLoadPosts()
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

  const [
    backendFriendIds,
    setBackendFriendIds,
  ] =
    useState(
      () =>
        new Set()
    );

  const [
    feedLoading,
    setFeedLoading,
  ] =
    useState(
      Boolean(
        authSession?.user?.id
      )
    );

  async function refreshBackendFeed() {
    if (
      !authSession?.user?.id
    ) {
      return;
    }

    const [
      backendPosts,
      relationships,
    ] =
      await Promise.all([
        loadBackendFeed(
          authSession
        ),
        getBackendRelationships(
          authSession
        ),
      ]);

    const welcomePosts =
      authenticatedWelcomePosts();

    setPosts([
      ...backendPosts,
      ...welcomePosts.filter(
        (
          welcome
        ) =>
          !backendPosts.some(
            (
              post
            ) =>
              post.id ===
              welcome.id
          )
      ),
    ]);

    setBackendFriendIds(
      new Set(
        Object.entries(
          relationships ||
          {}
        )
          .filter(
            ([
              ,
              relation,
            ]) =>
              relation
                ?.friendStatus ===
              "friends"
          )
          .map(
            ([
              personId,
            ]) =>
              personId
          )
      )
    );
  }

  useEffect(() => {
    if (
      authSession?.user?.id
    ) {
      return;
    }

    safeSavePosts(
      posts
    );
  }, [
    posts,
    authSession?.user?.id,
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

    const refresh =
      async () => {
        try {
          setFeedLoading(
            true
          );

          await refreshBackendFeed();
        } catch (
          error
        ) {
          console.warn(
            "BACKEND FEED LOAD ERROR:",
            error
          );
        } finally {
          if (
            active
          ) {
            setFeedLoading(
              false
            );
          }
        }
      };

    refresh();

    const channel =
      subscribeFeedRealtime({
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
                refresh,
                120
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
                "FEED REALTIME DEGRADED"
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
          if (
            authSession?.user?.id
          ) {
            return posts.filter(
              (
                post
              ) =>
                post.authorId ===
                  authSession.user.id ||
                backendFriendIds.has(
                  post.authorId
                )
            );
          }

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
          if (
            authSession?.user?.id
          ) {
            return posts.filter(
              (
                post
              ) =>
                post.authorId ===
                  "yatut" ||
                post.authorId ===
                  authSession.user.id ||
                backendFriendIds.has(
                  post.authorId
                )
            );
          }

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
        authSession?.user?.id,
        backendFriendIds,
      ]
    );

  async function publishPost({
    text,
    media,
    mediaFile,
    mediaType,
    location,
    poll,
  }) {
    if (
      authSession?.user?.id
    ) {
      let uploadedMedia =
        null;

      try {
        if (
          mediaFile
        ) {
          uploadedMedia =
            await uploadPostMedia(
              authSession,
              mediaFile
            );
        }

        await createBackendPost(
          authSession,
          {
            text,
            media:
              uploadedMedia?.url ||
              null,
            mediaType:
              uploadedMedia?.mediaType ||
              mediaType,
            location,
            poll,
            visibility:
              "public",
          }
        );

        await refreshBackendFeed();
      } catch (
        error
      ) {
        console.warn(
          "BACKEND POST PUBLISH ERROR:",
          error
        );

        window.alert(
          error?.message ||
          "Не вдалося опублікувати допис."
        );

        throw error;
      }

      return;
    }

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

      location:
        location ||
        null,

      poll:
        poll ||
        null,

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

  async function toggleLike(
    postId
  ) {
    const current =
      posts.find(
        (
          post
        ) =>
          post.id ===
          postId
      );

    if (!current) {
      return;
    }

    if (
      current.backend &&
      authSession?.user?.id
    ) {
      const nextLiked =
        !current.liked;

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
          current.liked
        );
      } catch (
        error
      ) {
        console.warn(
          "BACKEND POST LIKE ERROR:",
          error
        );

        await refreshBackendFeed();
      }

      return;
    }

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

  async function deletePost(
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

    const target =
      posts.find(
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
          "BACKEND POST DELETE ERROR:",
          error
        );

        return;
      }
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

  async function addComment(
    postId,
    text
  ) {
    const targetPost =
      posts.find(
        (
          post
        ) =>
          post.id ===
          postId
      );

    if (
      targetPost?.backend &&
      authSession?.user?.id
    ) {
      try {
        await addBackendComment(
          authSession,
          postId,
          text
        );

        await refreshBackendFeed();
      } catch (
        error
      ) {
        console.warn(
          "BACKEND COMMENT ERROR:",
          error
        );
      }

      return;
    }

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

      liked:
        false,

      likes:
        0,

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

  async function addReply(
    postId,
    commentId,
    text
  ) {
    const targetPost =
      posts.find(
        (
          post
        ) =>
          post.id ===
          postId
      );

    if (
      targetPost?.backend &&
      authSession?.user?.id
    ) {
      try {
        await addBackendComment(
          authSession,
          postId,
          text,
          commentId
        );

        await refreshBackendFeed();
      } catch (
        error
      ) {
        console.warn(
          "BACKEND REPLY ERROR:",
          error
        );
      }

      return;
    }

    const reply = {
      id:
        createId(
          "reply"
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

      liked:
        false,

      likes:
        0,
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
                                ...(
                                  comment.replies ||
                                  []
                                ),

                                reply,
                              ],
                            }
                          : comment
                    ),
                }
              : post
        )
    );
  }

  function toggleCommentLike(
    postId,
    commentId
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

                  comments:
                    (
                      post.comments ||
                      []
                    ).map(
                      (
                        comment
                      ) => {
                        if (
                          comment.id !==
                          commentId
                        ) {
                          return comment;
                        }

                        const liked =
                          !comment.liked;

                        return {
                          ...comment,

                          liked,

                          likes:
                            Math.max(
                              0,

                              Number(
                                comment.likes ||
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
                    ),
                }
              : post
        )
    );
  }

  function toggleReplyLike(
    postId,
    commentId,
    replyId
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

                              replies:
                                (
                                  comment.replies ||
                                  []
                                ).map(
                                  (
                                    reply
                                  ) => {
                                    if (
                                      reply.id !==
                                      replyId
                                    ) {
                                      return reply;
                                    }

                                    const liked =
                                      !reply.liked;

                                    return {
                                      ...reply,

                                      liked,

                                      likes:
                                        Math.max(
                                          0,

                                          Number(
                                            reply.likes ||
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
                                ),
                            }
                          : comment
                    ),
                }
              : post
        )
    );
  }

  function votePoll(
    postId,
    optionId
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
                postId ||
              !post.poll
            ) {
              return post;
            }

            const previousVote =
              post.poll
                .votedOptionId;

            return {
              ...post,

              poll: {
                ...post.poll,

                votedOptionId:
                  optionId,

                options:
                  (
                    post.poll
                      .options ||
                    []
                  ).map(
                    (
                      option
                    ) => {
                      let votes =
                        Number(
                          option.votes ||
                            0
                        );

                      if (
                        previousVote ===
                          option.id &&
                        previousVote !==
                          optionId
                      ) {
                        votes =
                          Math.max(
                            0,
                            votes - 1
                          );
                      }

                      if (
                        option.id ===
                          optionId &&
                        previousVote !==
                          optionId
                      ) {
                        votes +=
                          1;
                      }

                      return {
                        ...option,

                        votes,
                      };
                    }
                  ),
              },
            };
          }
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

  async function sharePost(
    postId
  ) {
    const post =
      posts.find(
        (
          item
        ) =>
          item.id ===
          postId
      );

    if (!post) {
      return;
    }

    const result =
      await shareYatutItem({
        title:
          `Допис ${post.authorName || "ЯТУТ"} у ЯТУТ`,

        text:
          post.text ||
          "",

        path:
          `/posts/${encodeURIComponent(post.id)}`,
      });

    if (
      !result?.shared &&
      !result?.copied
    ) {
      return;
    }

    if (
      post.backend &&
      authSession?.user?.id
    ) {
      try {
        const count =
          await incrementBackendShare(
            authSession,
            postId
          );

        setPosts(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item.id ===
                postId
                  ? {
                      ...item,
                      shares:
                        Number(
                          count ||
                          item.shares ||
                          0
                        ),
                    }
                  : item
            )
        );
      } catch (
        error
      ) {
        console.warn(
          "BACKEND SHARE COUNT ERROR:",
          error
        );
      }

      return;
    }

    setPosts(
      (
        previous
      ) =>
        previous.map(
          (
            item
          ) =>
            item.id ===
            postId
              ? {
                  ...item,

                  shares:
                    Number(
                      item.shares ||
                        0
                    ) +
                    1,
                }
              : item
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
      <Stories
        authSession={
          authSession
        }
      />

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
        onNavigate={
          onNavigate
        }
        viewerProfile={
          viewerProfile
        }
      />

      {authSession?.user?.id &&
        !feedLoading &&
        backendFriendIds.size === 0 && (
        <section className="home-start-card">
          <div className="home-start-card__icon">
            <YatutIcon
              name="friends"
              size={22}
            />
          </div>

          <div className="home-start-card__copy">
            <span>
              ПОЧАТОК У ЯТУТ
            </span>

            <strong>
              Знайдіть перших людей
            </strong>

            <p>
              Додайте друзів — і стрічка «Друзі», особисті чати та спільні активності почнуть наповнюватися реальним контентом.
            </p>
          </div>

          <div className="home-start-card__actions">
            <button
              type="button"
              className="is-primary"
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

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "friends"
                )
              }
            >
              Друзі
            </button>
          </div>
        </section>
      )}

      {feedLoading && (
        <div className="card empty-card">
          Оновлюємо стрічку ЯТУТ…
        </div>
      )}

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
                onAddReply={
                  addReply
                }
                onToggleCommentLike={
                  toggleCommentLike
                }
                onToggleReplyLike={
                  toggleReplyLike
                }
                onVotePoll={
                  votePoll
                }
                onShare={
                  sharePost
                }
                onToggleSaved={() =>
                  togglePostSaved(
                    post
                  )
                }
                onNavigate={
                  onNavigate
                }
                viewerProfile={
                  viewerProfile
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
  friends = [],
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
            onClick={() =>
              onNavigate(
                "now"
              )
            }
            aria-label="Відкрити Зараз"
          >
            <YatutIcon
              name="arrowRight"
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
            ВАШІ ДРУЗІ
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

        {friends.length ? (
          friends
            .slice(
              0,
              3
            )
            .map(
              (
                person
              ) => (
                <button
                  key={
                    person.id
                  }
                  className="suggestion-person"
                  type="button"
                  onClick={() =>
                    onOpenChat(
                      person.id
                    )
                  }
                >
                  <div className="avatar">
                    {person.avatar ? (
                      <img
                        src={
                          person.avatar
                        }
                        alt=""
                      />
                    ) : (
                      person.initial ||
                      person.initials ||
                      "Я"
                    )}
                  </div>

                  <div>
                    <strong>
                      {
                        person.name
                      }
                    </strong>

                    <small>
                      {person.city
                        ? `${person.city} · написати`
                        : "Відкрити чат"}
                    </small>
                  </div>
                </button>
              )
            )
        ) : (
          <button
            className="right-see-all"
            type="button"
            onClick={() =>
              onNavigate(
                "search"
              )
            }
          >
            Знайти друзів
          </button>
        )}

        {friends.length >
          0 && (
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
        )}
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
  mobileMenuOpen,
  onToggleMobileMenu,
  themeMode,
  onToggleTheme,
  unreadNotifications,
  viewerProfile = null,
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
          {/* THEME */}

          <button
            className={`icon-button topbar-theme-action ${
              themeMode ===
              "dark"
                ? "active"
                : ""
            }`.trim()}
            type="button"
            onClick={
              onToggleTheme
            }
            aria-label="Змінити тему"
            aria-pressed={
              themeMode ===
              "dark"
            }
            title="Тема"
          >
            <YatutIcon
              name="theme"
              size={20}
            />
          </button>

          {/* DESKTOP NOTIFICATIONS */}

          <button
            className={`icon-button topbar-notification-action ${
              notificationOpen
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() => {
              if (
                window.matchMedia?.(
                  "(max-width: 767px)"
                )?.matches
              ) {
                onNavigate(
                  "notifications"
                );

                return;
              }

              onToggleNotifications?.();
            }}
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

          {/* MOBILE CREATE */}

          <button
            className={`icon-button topbar-create-action ${
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
            onClick={() =>
              onNavigate(
                "create"
              )
            }
            aria-label="Створити"
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
            title="Створити"
          >
            <YatutIcon
              name="plus"
              size={21}
            />
          </button>

          {/* MOBILE MENU */}

          <button
            className={`icon-button topbar-menu-action ${
              mobileMenuOpen
                ? "active"
                : ""
            }`.trim()}
            type="button"
            onClick={
              onToggleMobileMenu
            }
            aria-label="Меню ЯТУТ"
            aria-expanded={
              mobileMenuOpen
            }
            title="Меню"
          >
            <YatutIcon
              name="menuGrid"
              size={20}
            />
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
            {viewerProfile?.avatar ? (
              <img
                src={
                  viewerProfile.avatar
                }
                alt=""
              />
            ) : (
              viewerProfile?.initial ||
              "Я"
            )}
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
  viewerProfile = null,
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
              onClick={() => {
                nativeSelectionHaptic();

                onNavigate(
                  item.id
                );
              }}
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

        {SECONDARY_NAV
          .filter(
            (
              item
            ) =>
              !item.founderOnly ||
              viewerProfile?.founder
          )
          .map(
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
              onClick={() => {
                nativeSelectionHaptic();

                onNavigate(
                  item.id
                );
              }}
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
            {viewerProfile?.avatar ? (
              <img
                src={
                  viewerProfile.avatar
                }
                alt=""
              />
            ) : (
              viewerProfile?.initial ||
              "Я"
            )}
          </div>

          <div>
            <strong>
              {viewerProfile?.name ||
                "Користувач ЯТУТ"}
            </strong>

            <span>
              @{viewerProfile?.username ||
                "user"}
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
  notificationOpen,
  unreadNotifications,
  onToggleNotifications,
  viewerProfile = null,
}) {
  return (
    <nav
      className="mobile-nav"
      aria-label="Головна навігація"
    >
      {MOBILE_NAV.map(
        (
          item
        ) => {
          const isNotifications =
            item.id ===
            "notifications";

          const active =
            currentPage ===
            item.id;

          const badgeValue =
            item.id ===
            "chats"
              ? unreadChatMessages
              : isNotifications
              ? unreadNotifications
              : 0;

          return (
            <button
              key={
                item.id
              }
              className={`mobile-nav-item ${
                active
                  ? "active"
                  : ""
              } ${
                badgeValue > 0
                  ? "has-unread"
                  : ""
              } ${
                item.id ===
                "pulse"
                  ? "mobile-pulse-button"
                  : ""
              } ${
                item.id ===
                "chats"
                  ? "mobile-chat-center"
                  : ""
              } ${
                isNotifications
                  ? "mobile-notification-button"
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
            >
              {item.id ===
              "profile" ? (
                <span className="mobile-profile-avatar">
                  {viewerProfile?.avatar ? (
                    <img
                      src={
                        viewerProfile.avatar
                      }
                      alt=""
                    />
                  ) : (
                    viewerProfile?.initial ||
                    "Я"
                  )}
                </span>
              ) : (
                <span className="mobile-nav-icon">
                  <YatutIcon
                    name={
                      item.icon
                    }
                    size={
                      item.id ===
                      "chats"
                        ? 22
                        : 21
                    }
                  />
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
      () =>
        routeFromLocation()
          .page
    );

  const [
    routeRevision,
    setRouteRevision,
  ] =
    useState(0);

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
    selectedVideoOpenComments,
    setSelectedVideoOpenComments,
  ] =
    useState(false);

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
    selectedCreatorId,
    setSelectedCreatorId,
  ] =
    useState("maria");

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] =
    useState(
      false
    );

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] =
    useState(
      false
    );

  const authBackendConfigured =
    isAuthBackendConfigured();

  const [
    authSession,
    setAuthSession,
  ] =
    useState(
      null
    );

  const [
    authReady,
    setAuthReady,
  ] =
    useState(
      !authBackendConfigured
    );

  const [
    accountAccessReady,
    setAccountAccessReady,
  ] =
    useState(
      !authBackendConfigured
    );

  const [
    accountAccessState,
    setAccountAccessState,
  ] =
    useState({
      status:
        "active",
      block:
        null,
      warning:
        null,
    });

  const [
    accountAccessBusy,
    setAccountAccessBusy,
  ] =
    useState(false);

  const [
    shellProfile,
    setShellProfile,
  ] =
    useState(null);

  const [
    onboardingReady,
    setOnboardingReady,
  ] =
    useState(
      false
    );

  const [
    needsOnboarding,
    setNeedsOnboarding,
  ] =
    useState(
      false
    );

  const [
    onboardingBusy,
    setOnboardingBusy,
  ] =
    useState(
      false
    );

  const [
    permissionsReady,
    setPermissionsReady,
  ] =
    useState(false);

  const [
    needsDevicePermissions,
    setNeedsDevicePermissions,
  ] =
    useState(false);

  useEffect(() => {
    const userId =
      authSession?.user?.id;

    if (
      !userId
    ) {
      setPermissionsReady(
        true
      );

      setNeedsDevicePermissions(
        false
      );

      return;
    }

    try {
      const done =
        localStorage.getItem(
          `yatut-device-permissions-v1:${userId}`
        ) ===
        "done";

      setNeedsDevicePermissions(
        !done
      );
    } catch {
      setNeedsDevicePermissions(
        true
      );
    }

    setPermissionsReady(
      true
    );
  }, [
    authSession?.user?.id,
  ]);

  function finishDevicePermissions() {
    const userId =
      authSession?.user?.id;

    if (
      userId
    ) {
      try {
        localStorage.setItem(
          `yatut-device-permissions-v1:${userId}`,
          "done"
        );
      } catch {
        // The flow can still finish for the current session.
      }
    }

    setNeedsDevicePermissions(
      false
    );

    setPermissionsReady(
      true
    );
  }


  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      setShellProfile(
        null
      );

      return undefined;
    }

    let active =
      true;

    function normalizeProfile(
      profile = {}
    ) {
      const fallbackName =
        authSession.user
          ?.user_metadata
          ?.full_name ||
        authSession.user.email
          ?.split("@")[0] ||
        "Користувач ЯТУТ";

      const name =
        profile.name ||
        profile.full_name ||
        fallbackName;

      return {
        name,
        username:
          profile.username ||
          authSession.user
            ?.user_metadata
            ?.username ||
          authSession.user.email
            ?.split("@")[0] ||
          "user",
        avatar:
          profile.avatar ||
          profile.avatar_url ||
          null,
        initial:
          name
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "Я",
        founder:
          Boolean(
            profile.founder
          ),
      };
    }

    setShellProfile(
      normalizeProfile()
    );

    const refresh =
      () =>
        getMyProfile(
          authSession
        )
          .then(
            (
              profile
            ) => {
              if (
                active &&
                profile
              ) {
                setShellProfile(
                  normalizeProfile(
                    profile
                  )
                );
              }
            }
          )
          .catch(
            (
              error
            ) => {
              console.warn(
                "SHELL PROFILE LOAD ERROR:",
                error
              );
            }
          );

    refresh();

    function handleProfileUpdated(
      event
    ) {
      if (
        !active
      ) {
        return;
      }

      if (
        event?.detail
      ) {
        setShellProfile(
          normalizeProfile(
            event.detail
          )
        );
      } else {
        refresh();
      }
    }

    window.addEventListener(
      "yatut:profile-updated",
      handleProfileUpdated
    );

    return () => {
      active =
        false;

      window.removeEventListener(
        "yatut:profile-updated",
        handleProfileUpdated
      );
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  /* =======================================================
     ACCOUNT ACCESS STATE
  ======================================================= */

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      setAccountAccessReady(
        !authBackendConfigured
      );

      setAccountAccessState({
        status:
          "active",
        block:
          null,
        warning:
          null,
      });

      return undefined;
    }

    let active =
      true;

    async function refreshAccess() {
      try {
        const next =
          await getMyAccountAccessState(
            authSession
          );

        if (
          !active
        ) {
          return;
        }

        setAccountAccessState(
          (
            previous
          ) => {
            try {
              return JSON.stringify(
                previous
              ) ===
                JSON.stringify(
                  next
                )
                ? previous
                : next;
            } catch {
              return next;
            }
          }
        );

        setAccountAccessReady(
          true
        );
      } catch (
        error
      ) {
        console.warn(
          "ACCOUNT ACCESS STATE ERROR:",
          error
        );

        if (
          active
        ) {
          setAccountAccessReady(
            true
          );
        }
      }
    }

    function refreshWhenVisible() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshAccess();
      }
    }

    function handleNativeState(
      event
    ) {
      if (
        event?.detail
          ?.isActive
      ) {
        refreshAccess();
      }
    }

    refreshAccess();

    window.addEventListener(
      "focus",
      refreshAccess
    );

    document.addEventListener(
      "visibilitychange",
      refreshWhenVisible
    );

    window.addEventListener(
      "yatut:native-app-state",
      handleNativeState
    );

    return () => {
      active =
        false;

      window.removeEventListener(
        "focus",
        refreshAccess
      );

      document.removeEventListener(
        "visibilitychange",
        refreshWhenVisible
      );

      window.removeEventListener(
        "yatut:native-app-state",
        handleNativeState
      );
    };
  }, [
    authBackendConfigured,
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      return undefined;
    }

    let active =
      true;

    async function syncDevicePush() {
      try {
        await syncPushSubscription(
          authSession
        );
      } catch (
        error
      ) {
        if (
          active
        ) {
          console.warn(
            "DEVICE PUSH SYNC ERROR:",
            error
          );
        }
      }
    }

    function syncWhenVisible() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        syncDevicePush();
      }
    }

    function handleNativeState(
      event
    ) {
      if (
        event?.detail
          ?.isActive
      ) {
        syncDevicePush();
      }
    }

    syncDevicePush();

    document.addEventListener(
      "visibilitychange",
      syncWhenVisible
    );

    window.addEventListener(
      "yatut:native-app-state",
      handleNativeState
    );

    return () => {
      active =
        false;

      document.removeEventListener(
        "visibilitychange",
        syncWhenVisible
      );

      window.removeEventListener(
        "yatut:native-app-state",
        handleNativeState
      );
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  async function handleWarningAcknowledge() {
    const sanctionId =
      accountAccessState
        ?.warning
        ?.id;

    if (
      !sanctionId ||
      accountAccessBusy
    ) {
      return;
    }

    try {
      setAccountAccessBusy(
        true
      );

      await acknowledgeMyWarning(
        authSession,
        sanctionId
      );

      const next =
        await getMyAccountAccessState(
          authSession
        );

      setAccountAccessState(
        next
      );
    } catch (
      error
    ) {
      console.warn(
        "WARNING ACKNOWLEDGE ERROR:",
        error
      );
    } finally {
      setAccountAccessBusy(
        false
      );
    }
  }

  /* =======================================================
     ONBOARDING STATE
  ======================================================= */

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      setOnboardingReady(
        false
      );

      setNeedsOnboarding(
        false
      );

      return undefined;
    }

    let active =
      true;

    setOnboardingReady(
      false
    );

    getMyProfile(
      authSession
    )
      .then(
        (
          profile
        ) => {
          if (!active) {
            return;
          }

          setNeedsOnboarding(
            !profile
              ?.onboarding_completed_at
          );

          setOnboardingReady(
            true
          );
        }
      )
      .catch(
        (
          error
        ) => {
          console.warn(
            "ONBOARDING STATE ERROR:",
            error
          );

          if (
            active
          ) {
            setNeedsOnboarding(
              false
            );

            setOnboardingReady(
              true
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
  ]);

  async function finishOnboarding(
    nextPage
  ) {
    if (
      !authSession?.user?.id ||
      onboardingBusy
    ) {
      return;
    }

    try {
      setOnboardingBusy(
        true
      );

      await completeMyOnboarding(
        authSession
      );

      setNeedsOnboarding(
        false
      );

      if (
        nextPage ===
        "profile"
      ) {
        try {
          sessionStorage.setItem(
            "yatut-open-route-payload",
            JSON.stringify({
              route:
                "profile",
              payload: {
                action:
                  "edit",
              },
            })
          );
        } catch {
          // No-op.
        }
      }

      setCurrentPage(
        nextPage
      );

      setRouteRevision(
        (
          previous
        ) =>
          previous +
          1
      );

      window.history.replaceState(
        {
          yatut:
            true,
          page:
            nextPage,
        },
        "",
        nextPage ===
          "home"
          ? "/"
          : `/${nextPage}`
      );
    } catch (
      error
    ) {
      console.warn(
        "ONBOARDING COMPLETE ERROR:",
        error
      );
    } finally {
      setOnboardingBusy(
        false
      );
    }
  }

  const [
    sidebarFriends,
    setSidebarFriends,
  ] =
    useState([]);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      setSidebarFriends(
        []
      );

      return undefined;
    }

    let active =
      true;

    let refreshTimer =
      null;

    const refresh =
      () =>
        getBackendFriendPeople(
          authSession,
          6
        )
          .then(
            (
              people
            ) => {
              if (
                active
              ) {
                setSidebarFriends(
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
                "SIDEBAR FRIENDS LOAD ERROR:",
                error
              );
            }
          );

    refresh();

    const channel =
      subscribeSocialGraphRealtime({
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
                refresh,
                100
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

      channel.close();
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  const [
    themeMode,
    setThemeMode,
  ] =
    useState(
      () => {
        try {
          const storedTheme =
            localStorage.getItem(
              "yatut-theme"
            );

          if (
            [
              "light",
              "dark",
              "system",
            ].includes(
              storedTheme
            )
          ) {
            return storedTheme;
          }

          const rawSettings =
            localStorage.getItem(
              SETTINGS_STORAGE_KEY
            );

          const settings =
            rawSettings
              ? JSON.parse(
                  rawSettings
                )
              : null;

          const appearance =
            settings?.appearance;

          return [
            "light",
            "dark",
            "system",
          ].includes(
            appearance
          )
            ? appearance
            : "light";
        } catch {
          return "light";
        }
      }
    );

  const [
    systemPrefersDark,
    setSystemPrefersDark,
  ] =
    useState(
      () => {
        try {
          return Boolean(
            window.matchMedia?.(
              "(prefers-color-scheme: dark)"
            )?.matches
          );
        } catch {
          return false;
        }
      }
    );

  const [
    unreadNotifications,
    setUnreadNotifications,
  ] =
    useState(
      () =>
        getNotifications().filter(
          (
            notification
          ) =>
            !notification.read &&
            notification.type !==
              "message"
        ).length
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
     AUTH SESSION
  ======================================================= */

  useEffect(() => {
    if (
      !authBackendConfigured
    ) {
      setAuthReady(
        true
      );

      return undefined;
    }

    let mounted =
      true;

    getAuthSession()
      .then(
        (session) => {
          if (
            !mounted
          ) {
            return;
          }

          setAuthSession(
            session
          );

          setAuthReady(
            true
          );
        }
      )
      .catch(
        (error) => {
          console.warn(
            "AUTH SESSION ERROR:",
            error
          );

          if (
            mounted
          ) {
            setAuthSession(
              null
            );

            setAuthReady(
              true
            );
          }
        }
      );

    const unsubscribe =
      subscribeAuthState(
        (session) => {
          setAuthSession(
            session
          );
        }
      );

    return () => {
      mounted =
        false;

      unsubscribe();
    };
  }, [
    authBackendConfigured,
  ]);

  function handleAuthenticated(
    session
  ) {
    setAuthSession(
      session
    );

    setCurrentPage(
      "home"
    );

    setRouteRevision(
      (
        previous
      ) =>
        previous +
        1
    );

    window.history.replaceState(
      {
        yatut:
          true,
        page:
          "home",
      },
      "",
      "/"
    );
  }

  useEffect(() => {
    if (
      !authSession ||
      currentPage !==
        "auth"
    ) {
      return;
    }

    setCurrentPage(
      "home"
    );

    setRouteRevision(
      (
        previous
      ) =>
        previous +
        1
    );

    window.history.replaceState(
      {
        yatut:
          true,
        page:
          "home",
      },
      "",
      "/"
    );
  }, [
    authSession,
    currentPage,
  ]);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      setAuthSession(
        null
      );

      setPermissionsReady(
        false
      );

      setNeedsDevicePermissions(
        false
      );

      setAccountAccessReady(
        !authBackendConfigured
      );

      setAccountAccessState({
        status:
          "active",
        block:
          null,
        warning:
          null,
      });

      replaceNotifications(
        []
      );

      setCurrentPage(
        "auth"
      );

      setNotificationsOpen(
        false
      );

      setMobileMenuOpen(
        false
      );

      window.history.replaceState(
        {
          yatut:
            true,
          page:
            "auth",
        },
        "",
        "/auth"
      );
    }
  }

  /* =======================================================
     CROSS-DEVICE SAVED SYNC
  ======================================================= */

  useEffect(() => {
    if (
      !authReady
    ) {
      return undefined;
    }

    const userId =
      authSession?.user?.id;

    if (
      !userId
    ) {
      try {
        if (
          localStorage.getItem(
            SAVED_OWNER_KEY
          )
        ) {
          replaceSavedItems(
            []
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "SAVED SIGN-OUT CLEANUP ERROR:",
          error
        );
      }

      return undefined;
    }

    let active =
      true;

    let initialized =
      false;

    let applyingRemote =
      false;

    let pushTimer =
      null;

    let refreshTimer =
      null;

    let lastLocalItems =
      [];

    let pendingPrevious =
      null;

    let pendingNext =
      null;

    function itemKey(
      item
    ) {
      return `${
        item?.type ||
        ""
      }:${
        item?.sourceId ||
        ""
      }`;
    }

    function mergeSaved(
      remoteItems,
      localItems
    ) {
      const merged =
        new Map();

      [
        ...(
          Array.isArray(
            remoteItems
          )
            ? remoteItems
            : []
        ),
        ...(
          Array.isArray(
            localItems
          )
            ? localItems
            : []
        ),
      ].forEach(
        (
          item
        ) => {
          if (
            !item?.type ||
            !item?.sourceId
          ) {
            return;
          }

          const key =
            itemKey(
              item
            );

          const previous =
            merged.get(
              key
            );

          if (
            !previous ||
            Number(
              item.updatedAt ||
              item.savedAt ||
              0
            ) >=
              Number(
                previous.updatedAt ||
                previous.savedAt ||
                0
              )
          ) {
            merged.set(
              key,
              item
            );
          }
        }
      );

      return [
        ...merged.values(),
      ].sort(
        (
          left,
          right
        ) =>
          Number(
            right.savedAt ||
            0
          ) -
          Number(
            left.savedAt ||
            0
          )
      );
    }

    async function bootstrap() {
      try {
        let localItems =
          getSavedItems();

        const previousOwner =
          localStorage.getItem(
            SAVED_OWNER_KEY
          );

        if (
          previousOwner &&
          previousOwner !==
            userId
        ) {
          applyingRemote =
            true;

          replaceSavedItems(
            []
          );

          applyingRemote =
            false;

          localItems =
            [];
        }

        const remoteItems =
          await loadBackendSavedItems(
            authSession
          );

        if (
          !active
        ) {
          return;
        }

        const merged =
          mergeSaved(
            remoteItems,
            localItems
          );

        applyingRemote =
          true;

        replaceSavedItems(
          merged
        );

        lastLocalItems =
          merged;

        applyingRemote =
          false;

        localStorage.setItem(
          SAVED_OWNER_KEY,
          userId
        );

        await syncBackendSavedItems(
          authSession,
          merged
        );

        if (
          active
        ) {
          initialized =
            true;
        }
      } catch (
        error
      ) {
        console.warn(
          "SAVED BACKEND BOOTSTRAP ERROR:",
          error
        );

        if (
          active
        ) {
          initialized =
            true;
        }
      }
    }

    async function refreshFromBackend() {
      if (
        !initialized ||
        !active
      ) {
        return;
      }

      try {
        const remoteItems =
          await loadBackendSavedItems(
            authSession
          );

        if (
          !active
        ) {
          return;
        }

        applyingRemote =
          true;

        replaceSavedItems(
          remoteItems
        );

        lastLocalItems =
          remoteItems;

        applyingRemote =
          false;

        localStorage.setItem(
          SAVED_OWNER_KEY,
          userId
        );
      } catch (
        error
      ) {
        console.warn(
          "SAVED REALTIME REFRESH ERROR:",
          error
        );

        applyingRemote =
          false;
      }
    }

    const unsubscribeLocal =
      subscribeSavedItems(
        (
          items
        ) => {
          if (
            applyingRemote
          ) {
            lastLocalItems =
              items;

            return;
          }

          if (
            !initialized
          ) {
            return;
          }

          if (
            !pendingPrevious
          ) {
            pendingPrevious =
              lastLocalItems;
          }

          pendingNext =
            items;

          lastLocalItems =
            items;

          if (
            pushTimer
          ) {
            window.clearTimeout(
              pushTimer
            );
          }

          pushTimer =
            window.setTimeout(
              () => {
                const previous =
                  pendingPrevious ||
                  [];

                const next =
                  pendingNext ||
                  lastLocalItems;

                pendingPrevious =
                  null;

                pendingNext =
                  null;

                syncBackendSavedDelta(
                  authSession,
                  previous,
                  next
                ).catch(
                  (
                    error
                  ) => {
                    console.warn(
                      "SAVED BACKEND PUSH ERROR:",
                      error
                    );
                  }
                );
              },
              120
            );
        }
      );

    const channel =
      subscribeSavedRealtime({
        session:
          authSession,
        onChange:
          () => {
            if (
              !initialized
            ) {
              return;
            }

            if (
              refreshTimer
            ) {
              window.clearTimeout(
                refreshTimer
              );
            }

            refreshTimer =
              window.setTimeout(
                refreshFromBackend,
                120
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
                "SAVED REALTIME DEGRADED"
              );
            }
          },
      });

    bootstrap();

    return () => {
      active =
        false;

      initialized =
        false;

      unsubscribeLocal();

      if (
        pushTimer
      ) {
        window.clearTimeout(
          pushTimer
        );
      }

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
    authReady,
    authSession?.user?.id,
    authSession?.access_token,
  ]);

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
                !notification.read &&
                notification.type !==
                  "message"
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

    async function refreshNotifications() {
      try {
        const next =
          await loadBackendNotifications(
            authSession
          );

        if (
          active
        ) {
          replaceNotifications(
            next
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "BACKEND NOTIFICATIONS LOAD ERROR:",
          error
        );
      }
    }

    refreshNotifications();

    const channel =
      subscribeNotificationsRealtime({
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
                refreshNotifications,
                100
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
                "NOTIFICATIONS REALTIME DEGRADED"
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
     MARK MESSAGE NOTIFICATIONS READ
  ======================================================= */

  function markChatNotificationsRead() {
    const messageNotifications =
      getNotifications().filter(
        (
          notification
        ) =>
          notification.type ===
          "message"
      );

    messageNotifications.forEach(
      (
        notification
      ) => {
        removeNotification(
          notification.id
        );

        if (
          notification.backend &&
          authSession?.user?.id
        ) {
          deleteBackendNotification(
            authSession,
            notification.id
          ).catch(
            (
              error
            ) => {
              console.warn(
                "BACKEND MESSAGE NOTIFICATION DELETE ERROR:",
                error
              );
            }
          );
        } else if (
          !notification.read
        ) {
          markNotificationRead(
            notification.id
          );
        }
      }
    );
  }

  useEffect(() => {
    let media = null;

    try {
      media =
        window.matchMedia?.(
          "(prefers-color-scheme: dark)"
        ) ||
        null;
    } catch {
      media = null;
    }

    if (!media) {
      return undefined;
    }

    const syncSystemTheme =
      () =>
        setSystemPrefersDark(
          Boolean(
            media.matches
          )
        );

    syncSystemTheme();

    media.addEventListener?.(
      "change",
      syncSystemTheme
    );

    return () => {
      media.removeEventListener?.(
        "change",
        syncSystemTheme
      );
    };
  }, []);

  const themeIsDark =
    themeMode ===
      "dark" ||
    (
      themeMode ===
        "system" &&
      systemPrefersDark
    );

  function setThemePreference(
    mode
  ) {
    const nextMode =
      [
        "light",
        "dark",
        "system",
      ].includes(
        mode
      )
        ? mode
        : "light";

    setThemeMode(
      nextMode
    );

    try {
      const rawSettings =
        localStorage.getItem(
          SETTINGS_STORAGE_KEY
        );

      const settings =
        rawSettings
          ? JSON.parse(
              rawSettings
            )
          : {};

      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          ...settings,
          appearance:
            nextMode,
        })
      );
    } catch {
      // Settings synchronization is optional for this session.
    }
  }

  useEffect(() => {
    document.body.classList.toggle(
      "yatut-dark-mode",
      themeIsDark
    );

    document.documentElement.style.colorScheme =
      themeIsDark
        ? "dark"
        : "light";

    try {
      localStorage.setItem(
        "yatut-theme",
        themeMode
      );
    } catch {
      // Theme still works for the current session.
    }
  }, [
    themeIsDark,
    themeMode,
  ]);

  useEffect(() => {
    document.title =
      ROUTE_TITLES[
        currentPage
      ] ||
      "ЯТУТ";

    document
      .querySelector(
        'meta[name="theme-color"]'
      )
      ?.setAttribute(
        "content",
        themeIsDark
          ? "#0d0d14"
          : "#f7f7fb"
      );
  }, [
    currentPage,
    themeIsDark,
  ]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function goToPage(
    page,
    payload = null,
    options = {}
  ) {
    if (!page) {
      return;
    }

    const {
      updateHistory =
        true,
      replaceHistory =
        false,
      scroll =
        true,
    } = options;

    if (
      payload !==
        null &&
      payload !==
        undefined
    ) {
      setRouteRevision(
        (
          previous
        ) =>
          previous +
          1
      );
    }

    setNotificationsOpen(
      false
    );

    setMobileMenuOpen(
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

      window.dispatchEvent(
        new CustomEvent(
          "yatut:route-payload",
          {
            detail: {
              route:
                page,

              payload,
            },
          }
        )
      );
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

      setSelectedVideoOpenComments(
        Boolean(
          payload?.openComments
        )
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

    if (
      page ===
      "creator"
    ) {
      setSelectedCreatorId(
        payload?.creatorId ||
        payload?.personId ||
        payload?.authorId ||
        "maria"
      );
    }

    if (
      updateHistory
    ) {
      const targetUrl =
        routeToUrl(
          page,
          payload
        );

      const currentUrl =
        `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (
        targetUrl &&
        targetUrl !==
          currentUrl
      ) {
        window.history[
          replaceHistory
            ? "replaceState"
            : "pushState"
        ](
          {
            yatut:
              true,
            page,
            payload,
          },
          "",
          targetUrl
        );
      }
    }

    setCurrentPage(
      page
    );

    if (
      scroll
    ) {
      window.scrollTo({
        top:
          0,

        left:
          0,

        behavior:
          "auto",
      });
    }
  }

  /* =======================================================
     BROWSER HISTORY
  ======================================================= */

  useEffect(() => {
    function applyLocation() {
      const route =
        routeFromLocation();

      goToPage(
        route.page,
        route.payload,
        {
          updateHistory:
            false,
          scroll:
            false,
        }
      );
    }

    applyLocation();

    window.addEventListener(
      "popstate",
      applyLocation
    );

    return () => {
      window.removeEventListener(
        "popstate",
        applyLocation
      );
    };
  }, []);

  /* =======================================================
     SHARED LINK BRIDGE
  ======================================================= */

  useEffect(() => {
    function openSharedLink() {
      const rawHash =
        window.location.hash
          ?.replace(
            /^#/,
            ""
          )
          .trim();

      if (!rawHash) {
        return;
      }

      const params =
        new URLSearchParams(
          rawHash
        );

      const spaceId =
        params.get(
          "space"
        );

      if (spaceId) {
        goToPage(
          "communities",
          {
            communityId:
              spaceId,

            postId:
              params.get(
                "post"
              ) ||
              null,
          },
          {
            replaceHistory:
              true,
          }
        );

        return;
      }

      const eventId =
        params.get(
          "event"
        );

      if (eventId) {
        goToPage(
          "events",
          {
            eventId,
          },
          {
            replaceHistory:
              true,
          }
        );

        return;
      }

      const profilePostId =
        params.get(
          "profile-post"
        );

      if (profilePostId) {
        goToPage(
          "profile",
          {
            postId:
              profilePostId,
          },
          {
            replaceHistory:
              true,
          }
        );

        return;
      }

      const postId =
        params.get(
          "post"
        );

      if (postId) {
        goToPage(
          "home",
          {
            postId,
          },
          {
            replaceHistory:
              true,
          }
        );
      }
    }

    openSharedLink();

    window.addEventListener(
      "hashchange",
      openSharedLink
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        openSharedLink
      );
    };
  }, []);

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

    goToPage(
      "chats",
      {
        personId,
      }
    );
  }

  /* =======================================================
     ROUTER
  ======================================================= */

  function renderPage() {
    switch (
      currentPage
    ) {
      case "auth":
        return (
          <AuthPage
            onAuthenticated={
              handleAuthenticated
            }
          />
        );

      case "home":
        return (
          <Home
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
            viewerProfile={
              shellProfile
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
            authSession={
              authSession
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
            authSession={
              authSession
            }
            initialCommentsOpen={
              selectedVideoOpenComments
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
            authSession={
              authSession
            }
            initialCommentsOpen={
              selectedVideoOpenComments
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
            authSession={
              authSession
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

      case "creator":
        return (
          <CreatorProfilePage
            key={
              selectedCreatorId
            }
            creatorId={
              selectedCreatorId
            }
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
          />
        );

      case "friends":
        return (
          <FriendsErrorBoundary
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          >
            <Friends
              onNavigate={
                goToPage
              }
              onOpenChat={
                openPersonChat
              }
              authSession={
                authSession
              }
            />
          </FriendsErrorBoundary>
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
            authSession={
              authSession
            }
          />
        );

      case "chats":
        return (
          <Chats
            initialPersonId={
              chatPersonId
            }
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
          />
        );

      case "notifications":
        return (
          <Notifications
            open
            pageMode
            onClose={() => {
              if (
                window.history.length >
                1
              ) {
                window.history.back();
              } else {
                goToPage(
                  "home"
                );
              }
            }}
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
          />
        );

      case "communities":
        return (
          <Spaces
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
          />
        );

      case "events":
        return (
          <EventsPulsePage
            onNavigate={
              goToPage
            }
            authSession={
              authSession
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
            authSession={
              authSession
            }
          />
        );

      case "nearby":
        return (
          <Nearby
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
          />
        );

      case "business":
        return (
          <Business
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
          />
        );

      case "saved":
        return (
          <Saved
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
          />
        );

      case "settings":
        return (
          <Settings
            themeMode={
              themeMode
            }
            onThemeChange={
              setThemePreference
            }
            authSession={
              authSession
            }
            onSignOut={
              handleSignOut
            }
          />
        );

      default:
        return (
          <Home
            onNavigate={
              goToPage
            }
            authSession={
              authSession
            }
            viewerProfile={
              shellProfile
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
      "creator",
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
      "creator",
    ].includes(
      currentPage
    );

  if (
    authBackendConfigured &&
    !authReady
  ) {
    return (
      <div className="auth-loading">
        <div>
          <div className="auth-brand-mark">
            Я
          </div>

          <strong>
            ЯТУТ
          </strong>
        </div>
      </div>
    );
  }

  if (
    authBackendConfigured &&
    !authSession
  ) {
    return (
      <AuthPage
        onAuthenticated={
          handleAuthenticated
        }
      />
    );
  }

  if (
    authBackendConfigured &&
    authSession &&
    !accountAccessReady
  ) {
    return (
      <div className="auth-loading">
        <div>
          <div className="auth-brand-mark">
            Я
          </div>

          <strong>
            ЯТУТ
          </strong>
        </div>
      </div>
    );
  }

  if (
    authBackendConfigured &&
    authSession &&
    [
      "blocked",
      "warning",
    ].includes(
      accountAccessState
        ?.status
    )
  ) {
    return (
      <AccountRestriction
        state={
          accountAccessState
        }
        busy={
          accountAccessBusy
        }
        onAcknowledge={
          handleWarningAcknowledge
        }
        onSignOut={
          handleSignOut
        }
      />
    );
  }

  if (
    authBackendConfigured &&
    authSession &&
    !onboardingReady
  ) {
    return (
      <div className="auth-loading">
        <div>
          <div className="auth-brand-mark">
            Я
          </div>

          <strong>
            ЯТУТ
          </strong>
        </div>
      </div>
    );
  }

  if (
    authBackendConfigured &&
    authSession &&
    needsOnboarding
  ) {
    return (
      <Onboarding
        profile={
          shellProfile
        }
        busy={
          onboardingBusy
        }
        onContinue={() =>
          finishOnboarding(
            "profile"
          )
        }
        onSkip={() =>
          finishOnboarding(
            "home"
          )
        }
      />
    );
  }

  if (
    authBackendConfigured &&
    authSession &&
    !permissionsReady
  ) {
    return (
      <div className="auth-loading">
        <div>
          <div className="auth-brand-mark">
            Я
          </div>

          <strong>
            ЯТУТ
          </strong>
        </div>
      </div>
    );
  }

  if (
    authBackendConfigured &&
    authSession &&
    needsDevicePermissions
  ) {
    return (
      <DevicePermissions
        authSession={
          authSession
        }
        onDone={
          finishDevicePermissions
        }
      />
    );
  }

  if (
    currentPage ===
    "auth"
  ) {
    return (
      <AuthPage
        onAuthenticated={
          handleAuthenticated
        }
      />
    );
  }

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
        onToggleNotifications={() => {
          setMobileMenuOpen(
            false
          );

          goToPage(
            "notifications"
          );
        }}
        mobileMenuOpen={
          mobileMenuOpen
        }
        onToggleMobileMenu={() => {
          setNotificationsOpen(
            false
          );

          setMobileMenuOpen(
            (
              previous
            ) =>
              !previous
          );
        }}
        themeMode={
          themeIsDark
            ? "dark"
            : "light"
        }
        onToggleTheme={() =>
          setThemePreference(
            themeIsDark
              ? "light"
              : "dark"
          )
        }
        unreadNotifications={
          unreadNotifications
        }
        viewerProfile={
          shellProfile
        }
      />

      <MobileMoreMenu
        open={
          mobileMenuOpen
        }
        viewerProfile={
          shellProfile
        }
        currentPage={
          currentPage
        }
        onClose={() =>
          setMobileMenuOpen(
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
          viewerProfile={
            shellProfile
          }
        />

        <main className="main-content">
          <Fragment
            key={`${currentPage}-${routeRevision}`}
          >
            {
              renderPage()
            }
          </Fragment>
        </main>

        {showRightSidebar && (
          <RightSidebar
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
            friends={
              sidebarFriends
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
          notificationOpen={
            notificationsOpen
          }
          unreadNotifications={
            unreadNotifications
          }
          viewerProfile={
            shellProfile
          }
          onToggleNotifications={() => {
            setMobileMenuOpen(
              false
            );

            goToPage(
              "notifications"
            );
          }}
        />
      )}
    </div>
  );
}

export default App;