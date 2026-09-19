export const regions = {
  kyiv: {
    id: "kyiv",
    slug: "kyiv",

    name: "Київ",
    shortName: "Київ",

    country: "Україна",

    accent: "#7C3AED",
    accentSoft: "#A78BFA",

    pulseColor: "purple",

    peopleNow: 12400,
    friendsNearby: 12,
    eventsToday: 156,
    newPlaces: 87,

    position: {
      x: 56,
      y: 36,
    },

    backgrounds: {
      hero:
        "/assets/regions/kyiv/hero.webp",

      sidebar:
        "/assets/regions/kyiv/sidebar.webp",

      profile:
        "/assets/regions/kyiv/profile.webp",
    },
  },

  lviv: {
    id: "lviv",
    slug: "lviv",

    name: "Львів",
    shortName: "Львів",

    country: "Україна",

    accent: "#F59E0B",
    accentSoft: "#FCD34D",

    pulseColor: "orange",

    peopleNow: 6200,
    friendsNearby: 4,
    eventsToday: 68,
    newPlaces: 34,

    position: {
      x: 28,
      y: 42,
    },

    backgrounds: {
      hero:
        "/assets/regions/lviv/hero.webp",

      sidebar:
        "/assets/regions/lviv/sidebar.webp",

      profile:
        "/assets/regions/lviv/profile.webp",
    },
  },

  odesa: {
    id: "odesa",
    slug: "odesa",

    name: "Одеса",
    shortName: "Одеса",

    country: "Україна",

    accent: "#C026D3",
    accentSoft: "#E879F9",

    pulseColor: "pink",

    peopleNow: 8700,
    friendsNearby: 7,
    eventsToday: 91,
    newPlaces: 52,

    position: {
      x: 53,
      y: 76,
    },

    backgrounds: {
      hero:
        "/assets/regions/odesa/hero.webp",

      sidebar:
        "/assets/regions/odesa/sidebar.webp",

      profile:
        "/assets/regions/odesa/profile.webp",
    },
  },

  dnipro: {
    id: "dnipro",
    slug: "dnipro",

    name: "Дніпро",
    shortName: "Дніпро",

    country: "Україна",

    accent: "#2563EB",
    accentSoft: "#60A5FA",

    pulseColor: "blue",

    peopleNow: 5100,
    friendsNearby: 3,
    eventsToday: 44,
    newPlaces: 21,

    position: {
      x: 72,
      y: 56,
    },

    backgrounds: {
      hero:
        "/assets/regions/dnipro/hero.webp",

      sidebar:
        "/assets/regions/dnipro/sidebar.webp",

      profile:
        "/assets/regions/dnipro/profile.webp",
    },
  },

  kharkiv: {
    id: "kharkiv",
    slug: "kharkiv",

    name: "Харків",
    shortName: "Харків",

    country: "Україна",

    accent: "#8B5CF6",
    accentSoft: "#C4B5FD",

    pulseColor: "purple",

    peopleNow: 4800,
    friendsNearby: 2,
    eventsToday: 39,
    newPlaces: 18,

    position: {
      x: 82,
      y: 38,
    },

    backgrounds: {
      hero:
        "/assets/regions/kharkiv/hero.webp",

      sidebar:
        "/assets/regions/kharkiv/sidebar.webp",

      profile:
        "/assets/regions/kharkiv/profile.webp",
    },
  },
};

export const currentUserRegionId =
  "kyiv";

export const currentRegion =
  regions[currentUserRegionId];

export const regionList =
  Object.values(
    regions
  );

export function getRegion(
  regionId
) {
  if (!regionId) {
    return currentRegion;
  }

  return (
    regions[
      String(
        regionId
      ).toLowerCase()
    ] ||
    currentRegion
  );
}

export function formatPeopleNow(
  value
) {
  const number =
    Number(
      value || 0
    );

  if (
    number >=
    1000000
  ) {
    return `${(
      number /
      1000000
    ).toFixed(1)}M`;
  }

  if (
    number >=
    1000
  ) {
    return `${(
      number /
      1000
    ).toFixed(1)}K`;
  }

  return String(
    number
  );
}