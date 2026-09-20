import {
  currentRegion,
  regions,
} from "./regions";

/* =========================================================
   USERS
========================================================= */

export const pulseUsers = {
  maria: {
    id: "maria",

    name:
      "Марія Коваль",

    username:
      "maria.koval",

    initials:
      "М",

    city:
      "kyiv",

    verified:
      true,

    online:
      true,
  },

  oleksandr: {
    id:
      "oleksandr",

    name:
      "Олександр Бондар",

    username:
      "bondar",

    initials:
      "О",

    city:
      "kyiv",

    verified:
      false,

    online:
      true,
  },

  anastasia: {
    id:
      "anastasia",

    name:
      "Анастасія Мельник",

    username:
      "nastia",

    initials:
      "А",

    city:
      "lviv",

    verified:
      false,

    online:
      false,
  },

  sofia: {
    id:
      "sofia",

    name:
      "Софія Романенко",

    username:
      "sofia.r",

    initials:
      "С",

    city:
      "odesa",

    verified:
      true,

    online:
      true,
  },

  max: {
    id:
      "max",

    name:
      "Максим Шевченко",

    username:
      "max.sh",

    initials:
      "М",

    city:
      "dnipro",

    verified:
      false,

    online:
      false,
  },
};

/* =========================================================
   VIDEOS
========================================================= */

export const pulseVideos = [
  {
    id:
      "clip-podil",

    type:
      "clip",

    title:
      "Вечірній Поділ",

    description:
      "Тут особлива атмосфера прямо зараз.",

    author:
      pulseUsers.maria,

    city:
      "kyiv",

    location: {
      name:
        "Поділ",

      distance:
        800,
    },

    peopleHere:
      428,

    friendsNearby:
      12,

    views:
      12400,

    duration:
      "0:34",

    isLive:
      false,

    isMoment:
      true,

    isTrending:
      true,

    recommendationType:
      "nearby",

    thumbnail:
      "/assets/regions/kyiv/sidebar.webp",

    video:
      "",
  },

  {
    id:
      "clip-lviv",

    type:
      "clip",

    title:
      "Неймовірний Львів",

    description:
      "Ранкове місто, яке прокидається.",

    author:
      pulseUsers.anastasia,

    city:
      "lviv",

    location: {
      name:
        "Площа Ринок",

      distance:
        null,
    },

    peopleHere:
      231,

    friendsNearby:
      4,

    views:
      84000,

    duration:
      "1:12",

    isLive:
      false,

    isMoment:
      false,

    isTrending:
      true,

    recommendationType:
      "city",

    thumbnail:
      "/assets/regions/lviv/sidebar.webp",

    video:
      "",
  },

  {
    id:
      "clip-odesa",

    type:
      "clip",

    title:
      "Одеса прокидається",

    description:
      "Море, ранок і місто прямо зараз.",

    author:
      pulseUsers.sofia,

    city:
      "odesa",

    location: {
      name:
        "Аркадія",

      distance:
        null,
    },

    peopleHere:
      196,

    friendsNearby:
      7,

    views:
      221000,

    duration:
      "0:28",

    isLive:
      false,

    isMoment:
      true,

    isTrending:
      true,

    recommendationType:
      "forYou",

    thumbnail:
      "/assets/regions/odesa/sidebar.webp",

    video:
      "",
  },

  {
    id:
      "vlog-carpathians",

    type:
      "vlog",

    title:
      "Друзі. Гори. Свобода.",

    description:
      "Велика подорож із друзями.",

    author:
      pulseUsers.oleksandr,

    city:
      "lviv",

    location: {
      name:
        "Карпати",

      distance:
        null,
    },

    peopleHere:
      88,

    friendsNearby:
      5,

    views:
      96000,

    duration:
      "12:48",

    isLive:
      false,

    isMoment:
      false,

    isTrending:
      false,

    category:
      "Подорожі",

    published:
      "сьогодні",

    recommendationType:
      "friends",

    thumbnail:
      "/assets/regions/lviv/hero.webp",

    video:
      "",

    qualitySources: {
      auto:
        "",
      "1080p":
        "",
      "720p":
        "",
      "480p":
        "",
      "360p":
        "",
    },
  },

  {
    id:
      "vlog-kyiv-day",

    type:
      "vlog",

    category:
      "Міста",

    title:
      "Один день у Києві: від Подолу до вечірнього центру",

    description:
      "Довге відео про місто, людей, каву та місця, куди хочеться повертатися.",

    author:
      pulseUsers.maria,

    city:
      "kyiv",

    location: {
      name:
        "Київ",

      distance:
        null,
    },

    peopleHere:
      174,

    friendsNearby:
      8,

    views:
      184000,

    duration:
      "18:24",

    published:
      "2 дні тому",

    isLive:
      false,

    isMoment:
      false,

    isTrending:
      true,

    recommendationType:
      "forYou",

    thumbnail:
      "/assets/regions/kyiv/hero.webp",

    video:
      "",

    qualitySources: {
      auto:
        "",
      "1080p":
        "",
      "720p":
        "",
      "480p":
        "",
      "360p":
        "",
    },
  },

  {
    id:
      "vlog-odesa-weekend",

    type:
      "vlog",

    category:
      "Подорожі",

    title:
      "Вікенд в Одесі без плану",

    description:
      "Море, ранкові прогулянки, локальні заклади та випадкові знайомства.",

    author:
      pulseUsers.sofia,

    city:
      "odesa",

    location: {
      name:
        "Одеса",

      distance:
        null,
    },

    peopleHere:
      121,

    friendsNearby:
      5,

    views:
      127000,

    duration:
      "24:09",

    published:
      "4 дні тому",

    isLive:
      false,

    isMoment:
      false,

    isTrending:
      false,

    recommendationType:
      "friends",

    thumbnail:
      "/assets/regions/odesa/sidebar.webp",

    video:
      "",

    qualitySources: {
      auto:
        "",
      "1080p":
        "",
      "720p":
        "",
      "480p":
        "",
      "360p":
        "",
    },
  },

  {
    id:
      "vlog-lviv-food",

    type:
      "vlog",

    category:
      "Лайфстайл",

    title:
      "Львів, який не показують у туристичних гайдах",

    description:
      "Дворики, маленькі кавʼярні, розмови з місцевими та вечірнє місто.",

    author:
      pulseUsers.anastasia,

    city:
      "lviv",

    location: {
      name:
        "Львів",

      distance:
        null,
    },

    peopleHere:
      96,

    friendsNearby:
      3,

    views:
      214000,

    duration:
      "31:42",

    published:
      "1 тиждень тому",

    isLive:
      false,

    isMoment:
      false,

    isTrending:
      true,

    recommendationType:
      "city",

    thumbnail:
      "/assets/regions/lviv/hero.webp",

    video:
      "",

    qualitySources: {
      auto:
        "",
      "1080p":
        "",
      "720p":
        "",
      "480p":
        "",
      "360p":
        "",
    },
  },

  {
    id:
      "event-atlas",

    type:
      "event",

    title:
      "Atlas Weekend 2026",

    description:
      "Фестиваль просто зараз.",

    author:
      pulseUsers.maria,

    city:
      "kyiv",

    location: {
      name:
        "ВДНГ",

      distance:
        null,
    },

    peopleHere:
      3200,

    friendsNearby:
      18,

    views:
      312000,

    duration:
      null,

    isLive:
      true,

    isMoment:
      false,

    isTrending:
      true,

    recommendationType:
      "events",

    thumbnail:
      "/assets/regions/kyiv/hero.webp",

    video:
      "",
  },

  {
    id:
      "live-khreshchatyk",

    type:
      "live",

    title:
      "Хрещатик зараз",

    description:
      "Прямий ефір із центру Києва.",

    author:
      pulseUsers.oleksandr,

    city:
      "kyiv",

    location: {
      name:
        "Хрещатик",

      distance:
        1200,
    },

    peopleHere:
      1200,

    friendsNearby:
      8,

    views:
      1200,

    duration:
      null,

    isLive:
      true,

    isMoment:
      true,

    isTrending:
      true,

    recommendationType:
      "live",

    thumbnail:
      "/assets/regions/kyiv/profile.webp",

    video:
      "",
  },

  {
    id:
      "live-odesa-sunset",

    type:
      "live",

    title:
      "Захід сонця в Одесі",

    description:
      "Море просто зараз.",

    author:
      pulseUsers.sofia,

    city:
      "odesa",

    location: {
      name:
        "Ланжерон",

      distance:
        null,
    },

    peopleHere:
      842,

    friendsNearby:
      4,

    views:
      842,

    duration:
      null,

    isLive:
      true,

    isMoment:
      true,

    isTrending:
      false,

    recommendationType:
      "live",

    thumbnail:
      "/assets/regions/odesa/hero.webp",

    video:
      "",
  },
];

/* =========================================================
   RECOMMENDATION COLLECTIONS
========================================================= */

export const pulseRecommendations = {
  forYou:
    pulseVideos.filter(
      (video) =>
        [
          "forYou",
          "nearby",
          "city",
        ].includes(
          video.recommendationType
        )
    ),

  nearby:
    pulseVideos.filter(
      (video) =>
        video.recommendationType ===
        "nearby"
    ),

  friends:
    pulseVideos.filter(
      (video) =>
        video.recommendationType ===
        "friends"
    ),

  city:
    pulseVideos.filter(
      (video) =>
        video.city ===
        currentRegion.id
    ),

  events:
    pulseVideos.filter(
      (video) =>
        video.recommendationType ===
        "events"
    ),

  live:
    pulseVideos.filter(
      (video) =>
        video.isLive
    ),

  following:
    pulseVideos.slice(
      0,
      3
    ),

  wave:
    pulseVideos.slice(
      0,
      4
    ),
};

/* =========================================================
   TRENDING
========================================================= */

export const pulseTrending = [
  {
    id:
      "trend-1",

    rank:
      1,

    title:
      "Київ вночі",

    views:
      1200000,

    city:
      "kyiv",

    thumbnail:
      "/assets/regions/kyiv/sidebar.webp",
  },

  {
    id:
      "trend-2",

    rank:
      2,

    title:
      "Одеса сьогодні",

    views:
      986000,

    city:
      "odesa",

    thumbnail:
      "/assets/regions/odesa/sidebar.webp",
  },

  {
    id:
      "trend-3",

    rank:
      3,

    title:
      "Неймовірний Львів",

    views:
      764000,

    city:
      "lviv",

    thumbnail:
      "/assets/regions/lviv/sidebar.webp",
  },

  {
    id:
      "trend-4",

    rank:
      4,

    title:
      "Дніпро. Новий день",

    views:
      542000,

    city:
      "dnipro",

    thumbnail:
      "/assets/regions/dnipro/sidebar.webp",
  },

  {
    id:
      "trend-5",

    rank:
      5,

    title:
      "Україна очима молоді",

    views:
      489000,

    city:
      "kyiv",

    thumbnail:
      "/assets/regions/kyiv/profile.webp",
  },
];

/* =========================================================
   CITY NODES
========================================================= */

export const pulseCityNodes =
  Object.values(
    regions
  ).map(
    (region) => ({
      id:
        region.id,

      city:
        region.name,

      peopleNow:
        region.peopleNow,

      activity:
        Math.min(
          100,
          Math.round(
            region.peopleNow /
              130
          )
        ),

      position:
        region.position,

      color:
        region.pulseColor,

      isTrending:
        [
          "kyiv",
          "odesa",
          "lviv",
        ].includes(
          region.id
        ),

      background:
        region.backgrounds
          .hero,
    })
  );

/* =========================================================
   WAVE
========================================================= */

export const pulseWave = {
  id:
    "wave-1",

  title:
    "ЯТУТ Хвиля",

  subtitle:
    "Одне відео. Багато міст. Разом створюємо хвилю.",

  prompt:
    "Покажи свій вечір",

  items: [
    {
      id:
        "wave-kyiv",

      city:
        "kyiv",

      author:
        pulseUsers.maria,

      views:
        12400,

      location:
        "Поділ",

      thumbnail:
        "/assets/regions/kyiv/sidebar.webp",
    },

    {
      id:
        "wave-lviv",

      city:
        "lviv",

      author:
        pulseUsers.anastasia,

      views:
        6800,

      location:
        "Проспект Свободи",

      thumbnail:
        "/assets/regions/lviv/sidebar.webp",
    },

    {
      id:
        "wave-odesa",

      city:
        "odesa",

      author:
        pulseUsers.sofia,

      views:
        8100,

      location:
        "Дерибасівська",

      thumbnail:
        "/assets/regions/odesa/sidebar.webp",
    },

    {
      id:
        "wave-dnipro",

      city:
        "dnipro",

      author:
        pulseUsers.max,

      views:
        5400,

      location:
        "Набережна",

      thumbnail:
        "/assets/regions/dnipro/sidebar.webp",
    },
  ],
};

/* =========================================================
   NEARBY
========================================================= */

export const pulseNearby = {
  location:
    "Київ",

  distance:
    800,

  peopleNow:
    428,

  friendsNearby:
    12,

  videosLastHour:
    8,

  eventsToday:
    6,

  friends: [
    pulseUsers.maria,
    pulseUsers.oleksandr,
    pulseUsers.sofia,
  ],
};

/* =========================================================
   PULSE SUMMARY
========================================================= */

export const pulseSummary = {
  totalPeopleNow:
    32540,

  currentCity:
    currentRegion,

  cities:
    pulseCityNodes,

  trending:
    pulseTrending,

  live:
    pulseRecommendations.live,

  nearby:
    pulseNearby,

  wave:
    pulseWave,
};