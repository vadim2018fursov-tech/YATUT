const KEY =
  "yatut-community-event-context-v1";

export function setCommunityEventContext(
  community
) {
  if (!community?.id) {
    return;
  }

  const context = {
    communityId:
      community.id,

    communityName:
      community.name ||
      community.title ||
      "Спільнота",

    communityAvatar:
      community.avatar ||
      null,

    communityCover:
      community.cover ||
      null,

    createdAt:
      Date.now(),
  };

  sessionStorage.setItem(
    KEY,
    JSON.stringify(
      context
    )
  );
}

export function getCommunityEventContext() {
  try {
    const raw =
      sessionStorage.getItem(
        KEY
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(raw);

    if (!parsed?.communityId) {
      return null;
    }

    return parsed;
  } catch (
    error
  ) {
    console.warn(
      "COMMUNITY EVENT CONTEXT ERROR:",
      error
    );

    return null;
  }
}

export function consumeCommunityEventContext() {
  const context =
    getCommunityEventContext();

  if (context) {
    sessionStorage.removeItem(
      KEY
    );
  }

  return context;
}

export function clearCommunityEventContext() {
  sessionStorage.removeItem(
    KEY
  );
}

export function openCommunityEventCreator({
  community,
  onNavigate,
}) {
  if (!community?.id) {
    return;
  }

  setCommunityEventContext(
    community
  );

  onNavigate?.(
    "events",
    {
      createEvent:
        true,

      communityId:
        community.id,
    }
  );
}