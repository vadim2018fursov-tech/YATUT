const STORAGE_KEY = "yatut-premium-home-posts-v1";
const CHANGE_EVENT = "yatut:premium-home-posts-changed";

function createId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export function getPremiumPosts(fallbackPosts = []) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return fallbackPosts;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return fallbackPosts;
    }

    return parsed;
  } catch (error) {
    console.warn("PREMIUM HOME LOAD ERROR:", error);

    return fallbackPosts;
  }
}

export function savePremiumPosts(posts) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(posts)
    );

    window.dispatchEvent(
      new CustomEvent(CHANGE_EVENT, {
        detail: posts,
      })
    );

    return true;
  } catch (error) {
    console.warn("PREMIUM HOME SAVE ERROR:", error);

    return false;
  }
}

export function createPremiumPost({
  text = "",
  image = null,
}) {
  return {
    id: createId("post"),

    authorId: "me",
    authorName: "Вадим",
    username: "vadim",
    initials: "В",

    verified: false,

    location: "Київ",
    time: "щойно",

    text: String(text || "").trim(),

    images: image
      ? [image]
      : [],

    likes: 0,
    liked: false,

    comments: 0,
    shares: 0,

    saved: false,

    createdAt: Date.now(),
  };
}

export function subscribePremiumPosts(callback) {
  function handleChange(event) {
    if (typeof callback !== "function") {
      return;
    }

    callback(
      Array.isArray(event.detail)
        ? event.detail
        : []
    );
  }

  window.addEventListener(
    CHANGE_EVENT,
    handleChange
  );

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      handleChange
    );
  };
}