const COMMUNITY_INVITES_KEY =
  "yatut-community-invites-v1";

const SPACES_KEY =
  "yatut-spaces-v2";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function unique(values) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : []).filter(Boolean)
    ),
  ];
}

export function getAcceptedCommunityInvites() {
  if (typeof window === "undefined") {
    return [];
  }

  const parsed = safeParse(
    localStorage.getItem(COMMUNITY_INVITES_KEY),
    []
  );

  return Array.isArray(parsed) ? parsed : [];
}

function saveAcceptedCommunityInvites(records) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    COMMUNITY_INVITES_KEY,
    JSON.stringify(records)
  );
}

function normalizeInvitedSpace(payload) {
  const source =
    payload?.space &&
    typeof payload.space === "object"
      ? payload.space
      : {};

  const id =
    payload?.spaceId ||
    payload?.communityId ||
    source.id;

  if (!id) {
    return null;
  }

  const title =
    source.title ||
    source.name ||
    payload?.communityName ||
    "Спільнота ЯТУТ";

  return {
    ...source,
    id,
    title,
    username:
      source.username ||
      String(title)
        .toLowerCase()
        .replace(/[^a-zа-яёіїєґ0-9]+/gi, ".")
        .replace(/^\.+|\.+$/g, "") ||
      "community",
    description:
      source.description ||
      "Спільнота, до якої вас запросили у ЯТУТ.",
    type: source.type || "public",
    templateId:
      source.templateId ||
      source.type ||
      "public-page",
    scale: source.scale || "small",
    privacy: source.privacy || "public",
    city: source.city || "Україна",
    ownerId:
      source.ownerId ||
      payload?.inviterId ||
      "community",
    members: unique([
      "me",
      ...(source.members || []),
    ]),
    modules:
      Array.isArray(source.modules)
        ? source.modules
        : ["feed", "chat", "events", "members"],
    createdAt:
      source.createdAt ||
      Date.now(),
    updatedAt: Date.now(),
  };
}

export function mergeAcceptedCommunityInvites(spaces) {
  const base = Array.isArray(spaces)
    ? [...spaces]
    : [];

  const records =
    getAcceptedCommunityInvites();

  records.forEach((record) => {
    const invited =
      normalizeInvitedSpace(
        record?.payload ||
        record
      );

    if (!invited?.id) {
      return;
    }

    const index =
      base.findIndex(
        (space) =>
          space.id ===
          invited.id
      );

    if (index >= 0) {
      base[index] = {
        ...base[index],
        members: unique([
          "me",
          ...(base[index].members || []),
        ]),
        updatedAt: Date.now(),
      };
      return;
    }

    base.unshift(invited);
  });

  return base;
}

export function acceptCommunityInvite(payload) {
  const invited =
    normalizeInvitedSpace(payload);

  if (!invited?.id) {
    return null;
  }

  const existing =
    getAcceptedCommunityInvites();

  const nextRecords = [
    {
      id: invited.id,
      acceptedAt: Date.now(),
      payload: {
        ...payload,
        space: invited,
      },
    },
    ...existing.filter((item) => {
      const itemId =
        item.id ||
        item?.payload?.spaceId ||
        item?.payload?.communityId;
      return itemId !== invited.id;
    }),
  ];

  saveAcceptedCommunityInvites(nextRecords);

  const currentSpaces =
    safeParse(
      localStorage.getItem(SPACES_KEY),
      null
    );

  if (Array.isArray(currentSpaces)) {
    const merged =
      mergeAcceptedCommunityInvites(
        currentSpaces
      );

    localStorage.setItem(
      SPACES_KEY,
      JSON.stringify(merged)
    );

    window.dispatchEvent(
      new CustomEvent(
        "yatut:spaces-changed",
        { detail: merged }
      )
    );
  } else {
    window.dispatchEvent(
      new CustomEvent(
        "yatut:community-membership-changed",
        {
          detail: {
            spaceId: invited.id,
          },
        }
      )
    );
  }

  return invited;
}
