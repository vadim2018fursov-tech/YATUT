export const currentCity = {
  id: "kyiv",
  name: "Київ",
  hero: "/assets/yatut/cities/kyiv/hero.jpg",
  cityCard: "/assets/yatut/cities/kyiv/city-card.jpg",
  miniBanner: "/assets/yatut/cities/kyiv/mini-banner.jpg",
  heroScript: "Київ\nЯ тут ♡",
  peopleNow: 2430,
  eventsToday: 156,
  newPlaces: 87,
  friendsNearby: 12,
};

export const stories = [
  {
    id: "create",
    type: "create",
    label: "Додати історію",
  },
  {
    id: "mine",
    type: "profile",
    label: "Моя історія",
    initials: "В",
    active: true,
  },
  {
    id: "kyiv",
    type: "city",
    label: "Київ зараз",
    image: "/assets/yatut/cities/kyiv/hero.jpg",
  },
  {
    id: "friends",
    type: "people",
    label: "Друзі поруч",
    initials: "М",
    extra: "+3",
  },
  {
    id: "popular",
    type: "city",
    label: "Популярне",
    image: "/assets/yatut/cities/kyiv/city-card.jpg",
  },
  {
    id: "events",
    type: "city",
    label: "Події",
    image: "/assets/yatut/cities/kyiv/mini-banner.jpg",
  },
  {
    id: "communities",
    type: "brand",
    label: "Спільноти",
    initials: "Я",
  },
];

export const pulseStats = [
  {
    id: "online",
    value: 12,
    label: "друзів онлайн",
    faces: ["М", "О", "С"],
    extra: "+7",
  },
  {
    id: "nearby",
    value: 4,
    label: "друзі поруч",
    faces: ["А", "М", "В"],
    extra: "+1",
  },
  {
    id: "events",
    value: 2,
    label: "події сьогодні",
    image: "/assets/yatut/cities/kyiv/mini-banner.jpg",
    note: "19:00   20:30",
  },
  {
    id: "history",
    value: 1,
    label: "стара знайома знову тут",
    faces: ["М"],
  },
  {
    id: "communities",
    value: 3,
    label: "активні спільноти",
    faces: ["О", "М", "С"],
    extra: "+12",
  },
  {
    id: "places",
    value: 5,
    label: "місць рекомендують",
    image: "/assets/yatut/cities/kyiv/cityCard.jpg",
  },
];

export const nearbyPeople = [
  {
    id: "maria",
    name: "Марія",
    initials: "М",
    x: 23,
    y: 25,
  },
  {
    id: "max",
    name: "Максим",
    initials: "М",
    x: 72,
    y: 18,
  },
  {
    id: "sofia",
    name: "Софія",
    initials: "С",
    x: 80,
    y: 68,
  },
  {
    id: "andrii",
    name: "Андрій",
    initials: "А",
    x: 18,
    y: 68,
  },
];

export const nearbyPlaces = [
  {
    id: "svitlo",
    title: 'Кавʼярня "Svitlo"',
    subtitle: "Популярне місце сьогодні",
    distance: "120 м",
    image: "/assets/yatut/cities/kyiv/city-card.jpg",
  },
  {
    id: "vilni",
    title: 'Виставка "Вільні"',
    subtitle: "Починається о 19:00",
    distance: "340 м",
    image: "/assets/yatut/cities/kyiv/mini-banner.jpg",
  },
  {
    id: "park",
    title: "Парк Шевченка",
    subtitle: "Відпочинок · Природа",
    distance: "560 м",
    image: "/assets/yatut/cities/kyiv/hero.jpg",
  },
  {
    id: "wave",
    title: 'Бар "Хвиля"',
    subtitle: "Музика · Друзі · Атмосфера",
    distance: "800 м",
    image: "/assets/yatut/cities/kyiv/city-card.jpg",
  },
];

export const suggestions = [
  {
    id: "kateryna",
    name: "Катерина",
    initials: "К",
    mutual: 8,
  },
  {
    id: "maksym",
    name: "Максим",
    initials: "М",
    mutual: 5,
  },
  {
    id: "iryna",
    name: "Ірина",
    initials: "І",
    mutual: 3,
  },
  {
    id: "dmytro",
    name: "Дмитро",
    initials: "Д",
    mutual: 12,
  },
];

export const upcomingEvents = [
  {
    id: "music",
    title: "Вечір української музики",
    meta: "Сьогодні, 19:00 · Київ, Atlas",
    action: "Я йду",
    image: "/assets/yatut/cities/kyiv/mini-banner.jpg",
  },
  {
    id: "food",
    title: "Фестиваль вуличної їжі",
    meta: "Завтра, 12:00 · Арт-завод Платформа",
    action: "Цікаво",
    image: "/assets/yatut/cities/kyiv/city-card.jpg",
  },
  {
    id: "yoga",
    title: "Ранкова йога в парку",
    meta: "Нд, 10:00 · Парк Шевченка",
    action: "Я йду",
    image: "/assets/yatut/cities/kyiv/hero.jpg",
  },
];

export const feedPosts = [
  {
    id: "post-maria-podil",
    authorId: "maria",
    authorName: "Марія Коваль",
    username: "maria.koval",
    initials: "М",
    verified: true,
    location: "Поділ, Київ",
    time: "2 год тому",
    text:
      "Неймовірний вечір на Подолі!\nЦе місто завжди надихає 💜\nА з ким ви сьогодні тут? 😊",
    likes: 124,
    comments: 23,
    shares: 5,
    images: [
      "/assets/yatut/cities/kyiv/hero.jpg",
    ],
  },
];