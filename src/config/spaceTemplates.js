/* =========================================================
   YATUT SPACE ENGINE V3
   TEMPLATES + MODULES + NAVIGATION
========================================================= */

/* =========================================================
   SCALE
========================================================= */

export const SPACE_SCALES = [
  {
    id: "small",
    title: "Невеликий",
    description: "До 100 учасників",
    icon: "🌱",
  },

  {
    id: "medium",
    title: "Середній",
    description: "100 – 10 000",
    icon: "🌿",
  },

  {
    id: "large",
    title: "Великий",
    description: "10 000 – 1 млн",
    icon: "🌳",
  },

  {
    id: "massive",
    title: "Масовий",
    description: "1 млн+ аудиторії",
    icon: "🌍",
  },
];

/* =========================================================
   MODULES
========================================================= */

export const SPACE_MODULES = {
  feed: {
    id: "feed",
    title: "Дописи",
    icon: "📰",
    description: "Новини та публікації",
  },

  discussions: {
    id: "discussions",
    title: "Обговорення",
    icon: "💬",
    description: "Теми, питання та відповіді",
  },

  chat: {
    id: "chat",
    title: "Чати",
    icon: "💭",
    description: "Спілкування учасників",
  },

  events: {
    id: "events",
    title: "Події",
    icon: "🎉",
    description: "Зустрічі та заходи",
  },

  members: {
    id: "members",
    title: "Учасники",
    icon: "👥",
    description: "Люди простору",
  },

  media: {
    id: "media",
    title: "Фото та відео",
    icon: "🖼️",
    description: "Медіатека простору",
  },

  documents: {
    id: "documents",
    title: "Документи",
    icon: "📁",
    description: "Файли та матеріали",
  },

  announcements: {
    id: "announcements",
    title: "Оголошення",
    icon: "📢",
    description: "Важлива інформація",
  },

  polls: {
    id: "polls",
    title: "Опитування",
    icon: "📊",
    description: "Голосування та опитування",
  },

  moderation: {
    id: "moderation",
    title: "Модерація",
    icon: "🛡️",
    description: "Безпека та контроль",
    adminOnly: true,
  },

  analytics: {
    id: "analytics",
    title: "Аналітика",
    icon: "📈",
    description: "Статистика простору",
    adminOnly: true,
  },

  schedule: {
    id: "schedule",
    title: "Розклад",
    icon: "📅",
    description: "Календар і розклад",
  },

  classes: {
    id: "classes",
    title: "Класи / групи",
    icon: "🏫",
    description: "Навчальні групи",
  },

  subjects: {
    id: "subjects",
    title: "Предмети",
    icon: "📚",
    description: "Навчальні дисципліни",
  },

  lessons: {
    id: "lessons",
    title: "Уроки",
    icon: "🧑‍🏫",
    description: "Уроки та заняття",
  },

  homework: {
    id: "homework",
    title: "Домашні завдання",
    icon: "📝",
    description: "Завдання для учнів",
  },

  grades: {
    id: "grades",
    title: "Оцінки",
    icon: "⭐",
    description: "Успішність учнів",
    protected: true,
  },

  attendance: {
    id: "attendance",
    title: "Відвідування",
    icon: "✅",
    description: "Присутність на заняттях",
    protected: true,
  },

  parents: {
    id: "parents",
    title: "Батьки",
    icon: "👨‍👩‍👧",
    description: "Батьківський доступ",
  },

  tests: {
    id: "tests",
    title: "Тести",
    icon: "🧠",
    description: "Перевірка знань",
  },

  certificates: {
    id: "certificates",
    title: "Сертифікати",
    icon: "🎓",
    description: "Навчальні сертифікати",
  },

  tasks: {
    id: "tasks",
    title: "Задачі",
    icon: "✅",
    description: "Робочі задачі",
  },

  projects: {
    id: "projects",
    title: "Проєкти",
    icon: "📌",
    description: "Проєкти команди",
  },

  meetings: {
    id: "meetings",
    title: "Зустрічі",
    icon: "🤝",
    description: "Робочі зустрічі",
  },

  departments: {
    id: "departments",
    title: "Відділи",
    icon: "🏢",
    description: "Структура компанії",
  },

  shifts: {
    id: "shifts",
    title: "Графік / зміни",
    icon: "🕐",
    description: "Робочі зміни",
  },

  vacancies: {
    id: "vacancies",
    title: "Вакансії",
    icon: "💼",
    description: "Відкриті позиції",
  },

  live: {
    id: "live",
    title: "Прямі ефіри",
    icon: "🔴",
    description: "Трансляції наживо",
  },

  music: {
    id: "music",
    title: "Музика",
    icon: "🎵",
    description: "Треки та релізи",
  },

  videos: {
    id: "videos",
    title: "Відео",
    icon: "🎬",
    description: "Відеоконтент",
  },

  followers: {
    id: "followers",
    title: "Підписники",
    icon: "⭐",
    description: "Аудиторія сторінки",
  },

  fan_club: {
    id: "fan_club",
    title: "Fan Club",
    icon: "💜",
    description: "Спільнота прихильників",
  },

  editorial: {
    id: "editorial",
    title: "Редакція",
    icon: "✍️",
    description: "Редакційний процес",
    adminOnly: true,
  },

  content_calendar: {
    id: "content_calendar",
    title: "Контент-календар",
    icon: "🗓️",
    description: "Планування контенту",
    adminOnly: true,
  },

  collections: {
    id: "collections",
    title: "Збори",
    icon: "❤️",
    description: "Благодійні збори",
  },

  volunteer_tasks: {
    id: "volunteer_tasks",
    title: "Задачі волонтерів",
    icon: "🤲",
    description: "Робота волонтерів",
  },

  reports: {
    id: "reports",
    title: "Звіти",
    icon: "📋",
    description: "Звіти та прозорість",
  },

  teams: {
    id: "teams",
    title: "Команди",
    icon: "⚽",
    description: "Спортивні команди",
  },

  training: {
    id: "training",
    title: "Тренування",
    icon: "🏃",
    description: "Графік тренувань",
  },

  competitions: {
    id: "competitions",
    title: "Змагання",
    icon: "🏆",
    description: "Турніри та старти",
  },

  results: {
    id: "results",
    title: "Результати",
    icon: "🥇",
    description: "Результати змагань",
  },

  sports_stats: {
    id: "sports_stats",
    title: "Статистика",
    icon: "📊",
    description: "Спортивна статистика",
  },

  rehearsals: {
    id: "rehearsals",
    title: "Репетиції",
    icon: "🎭",
    description: "Розклад репетицій",
  },

  performances: {
    id: "performances",
    title: "Виступи",
    icon: "🎤",
    description: "Концерти та виступи",
  },

  products: {
    id: "products",
    title: "Товари",
    icon: "🛍️",
    description: "Каталог товарів",
  },

  services: {
    id: "services",
    title: "Послуги",
    icon: "🧰",
    description: "Каталог послуг",
  },

  reviews: {
    id: "reviews",
    title: "Відгуки",
    icon: "⭐",
    description: "Відгуки користувачів",
  },

  support: {
    id: "support",
    title: "Підтримка",
    icon: "🎧",
    description: "Допомога клієнтам",
  },

  bookings: {
    id: "bookings",
    title: "Бронювання",
    icon: "📆",
    description: "Запис та бронювання",
  },

  residents: {
    id: "residents",
    title: "Мешканці",
    icon: "🏠",
    description: "Жителі будинку",
  },

  requests: {
    id: "requests",
    title: "Заявки",
    icon: "🛠️",
    description: "Звернення мешканців",
  },

  emergencies: {
    id: "emergencies",
    title: "Аварії",
    icon: "🚨",
    description: "Термінові повідомлення",
  },

  voting: {
    id: "voting",
    title: "Голосування",
    icon: "🗳️",
    description: "Спільні рішення",
  },

  city_projects: {
    id: "city_projects",
    title: "Проєкти громади",
    icon: "🏙️",
    description: "Міські ініціативи",
  },

  appeals: {
    id: "appeals",
    title: "Звернення",
    icon: "📨",
    description: "Звернення мешканців",
  },

  routes: {
    id: "routes",
    title: "Маршрути",
    icon: "🗺️",
    description: "Маршрути подорожей",
  },

  travel_points: {
    id: "travel_points",
    title: "Точки маршруту",
    icon: "📍",
    description: "Місця маршруту",
  },

  expenses: {
    id: "expenses",
    title: "Витрати",
    icon: "💳",
    description: "Спільні витрати",
  },

  publications: {
    id: "publications",
    title: "Публікації",
    icon: "📄",
    description: "Наукові матеріали",
  },

  research_projects: {
    id: "research_projects",
    title: "Дослідження",
    icon: "🔬",
    description: "Наукові проєкти",
  },

  experiments: {
    id: "experiments",
    title: "Експерименти",
    icon: "🧪",
    description: "Дослідницька робота",
  },

  conferences: {
    id: "conferences",
    title: "Конференції",
    icon: "🎤",
    description: "Наукові конференції",
  },

  medical_team: {
    id: "medical_team",
    title: "Лікарі",
    icon: "🩺",
    description: "Команда спеціалістів",
  },

  appointments: {
    id: "appointments",
    title: "Прийоми",
    icon: "📅",
    description: "Записи до лікарів",
    protected: true,
  },

  medical_documents: {
    id: "medical_documents",
    title: "Медичні документи",
    icon: "🔐",
    description: "Захищені медичні дані",
    sensitive: true,
    protected: true,
  },

  patient_area: {
    id: "patient_area",
    title: "Кабінет пацієнта",
    icon: "🔒",
    description: "Особистий кабінет",
    sensitive: true,
    protected: true,
  },

  reminders: {
    id: "reminders",
    title: "Нагадування",
    icon: "⏰",
    description: "Нагадування та сповіщення",
  },

  menu: {
    id: "menu",
    title: "Харчування / меню",
    icon: "🍽️",
    description: "Меню та харчування",
  },

  voice_rooms: {
    id: "voice_rooms",
    title: "Голосові кімнати",
    icon: "🎙️",
    description: "Голосове спілкування",
  },

  tournaments: {
    id: "tournaments",
    title: "Турніри",
    icon: "🎮",
    description: "Ігрові змагання",
  },
};

/* =========================================================
   NAVIGATION HELPERS
========================================================= */

function navSection(
  id,
  title,
  icon,
  modules
) {
  return {
    id,
    title,
    icon,
    modules,
  };
}

export function buildDefaultNavigation(
  template
) {
  if (!template) {
    return [];
  }

  if (
    template.navigationLayout
  ) {
    return template.navigationLayout.map(
      (section) => ({
        ...section,
        modules: [
          ...section.modules,
        ],
      })
    );
  }

  return [
    navSection(
      "main",
      "Головне",
      "🏠",
      template.modules || []
    ),
  ];
}

/* =========================================================
   TEMPLATES
========================================================= */

export const SPACE_TEMPLATES = [
  {
    id: "community",
    icon: "👥",
    title: "Спільнота",
    description:
      "Пости, фото, відео, люди та спілкування.",
    group: "Основні",

    modules: [
      "feed",
      "discussions",
      "chat",
      "events",
      "members",
      "media",
      "polls",
      "moderation",
    ],

    roles: [
      "owner",
      "admin",
      "moderator",
      "member",
    ],

    navigationLayout: [
      navSection(
        "main",
        "Головне",
        "🏠",
        [
          "feed",
          "events",
        ]
      ),

      navSection(
        "communication",
        "Спілкування",
        "💬",
        [
          "discussions",
          "chat",
        ]
      ),

      navSection(
        "people",
        "Люди",
        "👥",
        [
          "members",
          "media",
          "polls",
        ]
      ),
    ],
  },

  {
    id: "discussion",
    icon: "💬",
    title: "Обговорення / Форум",
    description:
      "Теми, питання, відповіді та дискусії.",
    group: "Основні",

    modules: [
      "discussions",
      "members",
      "chat",
      "polls",
      "moderation",
    ],

    roles: [
      "owner",
      "admin",
      "moderator",
      "member",
    ],

    navigationLayout: [
      navSection(
        "discussion",
        "Обговорення",
        "💬",
        [
          "discussions",
          "polls",
        ]
      ),

      navSection(
        "community",
        "Спільнота",
        "👥",
        [
          "members",
          "chat",
        ]
      ),
    ],
  },

  {
    id: "work",
    icon: "💼",
    title: "Робочий простір",
    description:
      "Команда, задачі, зустрічі, документи та проєкти.",
    group: "Основні",

    modules: [
      "feed",
      "chat",
      "tasks",
      "projects",
      "meetings",
      "schedule",
      "departments",
      "documents",
      "events",
      "shifts",
      "vacancies",
    ],

    roles: [
      "owner",
      "admin",
      "manager",
      "hr",
      "employee",
    ],

    navigationLayout: [
      navSection(
        "work",
        "Робота",
        "✅",
        [
          "tasks",
          "projects",
          "meetings",
          "schedule",
        ]
      ),

      navSection(
        "team",
        "Команда",
        "👥",
        [
          "departments",
          "shifts",
          "vacancies",
        ]
      ),

      navSection(
        "communication",
        "Комунікація",
        "💬",
        [
          "feed",
          "chat",
          "documents",
        ]
      ),

      navSection(
        "company",
        "Компанія",
        "🏢",
        [
          "events",
        ]
      ),
    ],
  },

  {
    id: "organization",
    icon: "🏛️",
    title: "Організація",
    description:
      "Клуб, команда або громадська організація.",
    group: "Основні",

    modules: [
      "feed",
      "members",
      "chat",
      "events",
      "documents",
      "announcements",
      "polls",
    ],

    roles: [
      "owner",
      "admin",
      "moderator",
      "member",
    ],

    navigationLayout: [
      navSection(
        "main",
        "Головне",
        "🏛️",
        [
          "feed",
          "announcements",
          "events",
        ]
      ),

      navSection(
        "people",
        "Учасники",
        "👥",
        [
          "members",
          "chat",
        ]
      ),

      navSection(
        "resources",
        "Матеріали",
        "📁",
        [
          "documents",
          "polls",
        ]
      ),
    ],
  },

  {
    id: "public_page",
    icon: "⭐",
    title: "Публічна сторінка",
    description:
      "Для артистів, блогерів, спортсменів, політиків, науковців та інших публічних людей.",
    group: "Публічні",
    defaultScale: "large",

    modules: [
      "feed",
      "followers",
      "videos",
      "media",
      "live",
      "events",
      "fan_club",
      "moderation",
      "analytics",
      "editorial",
      "content_calendar",
    ],

    roles: [
      "owner",
      "representative",
      "admin",
      "editor",
      "content_manager",
      "moderator",
      "event_manager",
      "analyst",
    ],

    navigationLayout: [
      navSection(
        "content",
        "Контент",
        "🎬",
        [
          "feed",
          "videos",
          "media",
        ]
      ),

      navSection(
        "audience",
        "Аудиторія",
        "⭐",
        [
          "followers",
          "fan_club",
        ]
      ),

      navSection(
        "live",
        "Наживо",
        "🔴",
        [
          "live",
          "events",
        ]
      ),

      navSection(
        "management",
        "Керування",
        "⚙️",
        [
          "editorial",
          "content_calendar",
          "analytics",
        ]
      ),
    ],
  },

  {
    id: "channel",
    icon: "📢",
    title: "Канал",
    description:
      "Публікації від автора або редакції.",
    group: "Публічні",

    modules: [
      "feed",
      "followers",
      "media",
      "videos",
      "moderation",
      "analytics",
      "editorial",
    ],

    roles: [
      "owner",
      "admin",
      "editor",
      "moderator",
    ],

    navigationLayout: [
      navSection(
        "content",
        "Контент",
        "📰",
        [
          "feed",
          "media",
          "videos",
        ]
      ),

      navSection(
        "audience",
        "Аудиторія",
        "⭐",
        [
          "followers",
        ]
      ),

      navSection(
        "management",
        "Керування",
        "⚙️",
        [
          "editorial",
          "analytics",
        ]
      ),
    ],
  },

  /* =======================================================
     EDUCATION
  ======================================================= */

  {
    id: "school",
    type: "education",
    subtype: "school",
    icon: "🏫",
    title: "Школа",
    description:
      "Вся школа: адміністрація, класи, учні, вчителі та батьки.",
    group: "Навчання",

    modules: [
      "feed",
      "classes",
      "subjects",
      "schedule",
      "lessons",
      "homework",
      "grades",
      "attendance",
      "parents",
      "announcements",
      "documents",
      "events",
      "chat",
      "members",
    ],

    roles: [
      "director",
      "admin",
      "teacher",
      "class_teacher",
      "student",
      "parent",
    ],

    navigationLayout: [
      navSection(
        "main",
        "Головне",
        "🏠",
        [
          "feed",
          "announcements",
          "events",
        ]
      ),

      navSection(
        "education",
        "Навчання",
        "🎓",
        [
          "classes",
          "subjects",
          "schedule",
          "lessons",
          "homework",
        ]
      ),

      navSection(
        "progress",
        "Успішність",
        "⭐",
        [
          "grades",
          "attendance",
        ]
      ),

      navSection(
        "people",
        "Люди",
        "👥",
        [
          "members",
          "parents",
        ]
      ),

      navSection(
        "communication",
        "Спілкування",
        "💬",
        [
          "chat",
          "documents",
        ]
      ),
    ],
  },

  {
    id: "kindergarten",
    type: "education",
    subtype: "kindergarten",
    icon: "🧸",
    title: "Дитячий садок",
    description:
      "Групи, вихователі, батьки, харчування та відвідування.",
    group: "Навчання",

    modules: [
      "feed",
      "classes",
      "schedule",
      "attendance",
      "parents",
      "menu",
      "announcements",
      "events",
      "chat",
      "media",
      "members",
    ],

    roles: [
      "director",
      "admin",
      "teacher",
      "parent",
    ],

    navigationLayout: [
      navSection(
        "main",
        "Головне",
        "🏠",
        [
          "feed",
          "announcements",
          "events",
        ]
      ),

      navSection(
        "groups",
        "Групи",
        "🧸",
        [
          "classes",
          "schedule",
          "attendance",
          "menu",
        ]
      ),

      navSection(
        "people",
        "Люди",
        "👨‍👩‍👧",
        [
          "members",
          "parents",
        ]
      ),

      navSection(
        "communication",
        "Спілкування",
        "💬",
        [
          "chat",
          "media",
        ]
      ),
    ],
  },

  {
    id: "university",
    type: "education",
    subtype: "university",
    icon: "🎓",
    title: "Університет",
    description:
      "Факультети, кафедри, групи, викладачі та студенти.",
    group: "Навчання",

    modules: [
      "feed",
      "classes",
      "subjects",
      "schedule",
      "lessons",
      "homework",
      "grades",
      "attendance",
      "documents",
      "research_projects",
      "publications",
      "events",
      "chat",
      "members",
    ],

    roles: [
      "rector",
      "admin",
      "dean",
      "teacher",
      "student",
    ],

    navigationLayout: [
      navSection(
        "main",
        "Головне",
        "🏠",
        [
          "feed",
          "events",
        ]
      ),

      navSection(
        "education",
        "Навчання",
        "🎓",
        [
          "classes",
          "subjects",
          "schedule",
          "lessons",
          "homework",
        ]
      ),

      navSection(
        "progress",
        "Навчальний прогрес",
        "⭐",
        [
          "grades",
          "attendance",
        ]
      ),

      navSection(
        "science",
        "Наука",
        "🔬",
        [
          "research_projects",
          "publications",
        ]
      ),

      navSection(
        "community",
        "Університет",
        "👥",
        [
          "members",
          "documents",
          "chat",
        ]
      ),
    ],
  },

  {
    id: "courses",
    type: "education",
    subtype: "courses",
    icon: "🧑‍🏫",
    title: "Курси / Онлайн-школа",
    description:
      "Групи, уроки, завдання, тести та сертифікати.",
    group: "Навчання",

    modules: [
      "classes",
      "lessons",
      "homework",
      "tests",
      "grades",
      "documents",
      "certificates",
      "chat",
      "events",
      "members",
    ],

    roles: [
      "owner",
      "admin",
      "teacher",
      "student",
    ],

    navigationLayout: [
      navSection(
        "education",
        "Навчання",
        "🎓",
        [
          "classes",
          "lessons",
          "homework",
          "tests",
          "grades",
        ]
      ),

      navSection(
        "materials",
        "Матеріали",
        "📚",
        [
          "documents",
          "certificates",
        ]
      ),

      navSection(
        "community",
        "Спільнота",
        "👥",
        [
          "members",
          "events",
          "chat",
        ]
      ),
    ],
  },

  /* =======================================================
     ORGANIZATIONS
  ======================================================= */

  {
    id: "healthcare",
    icon: "🏥",
    title: "Здоровʼя / Клініка",
    description:
      "Лікарі, прийоми, нагадування та приватний кабінет пацієнта.",
    group: "Організації",
    sensitive: true,

    modules: [
      "feed",
      "medical_team",
      "appointments",
      "patient_area",
      "medical_documents",
      "reminders",
      "documents",
      "events",
      "support",
    ],

    roles: [
      "owner",
      "clinic_admin",
      "doctor",
      "staff",
      "patient",
    ],

    navigationLayout: [
      navSection(
        "public",
        "Публічне",
        "🏥",
        [
          "feed",
          "medical_team",
          "events",
          "support",
        ]
      ),

      navSection(
        "appointments",
        "Записи",
        "📅",
        [
          "appointments",
          "reminders",
        ]
      ),

      navSection(
        "protected",
        "Захищено",
        "🔐",
        [
          "patient_area",
          "medical_documents",
          "documents",
        ]
      ),
    ],
  },

  {
    id: "residential",
    icon: "🏠",
    title: "ЖК / Будинок / ОСББ",
    description:
      "Мешканці, оголошення, заявки, аварії та голосування.",
    group: "Організації",

    modules: [
      "feed",
      "residents",
      "announcements",
      "requests",
      "emergencies",
      "voting",
      "documents",
      "events",
      "chat",
    ],

    roles: [
      "owner",
      "admin",
      "manager",
      "resident",
    ],

    navigationLayout: [
      navSection(
        "home",
        "Будинок",
        "🏠",
        [
          "feed",
          "announcements",
          "emergencies",
        ]
      ),

      navSection(
        "services",
        "Сервіс",
        "🛠️",
        [
          "requests",
          "documents",
        ]
      ),

      navSection(
        "community",
        "Громада",
        "👥",
        [
          "residents",
          "voting",
          "events",
          "chat",
        ]
      ),
    ],
  },

  {
    id: "city",
    icon: "🏙️",
    title: "Місто / Громада",
    description:
      "Новини міста, проєкти, звернення та події.",
    group: "Організації",

    modules: [
      "feed",
      "discussions",
      "polls",
      "voting",
      "city_projects",
      "appeals",
      "events",
      "documents",
      "moderation",
    ],

    roles: [
      "owner",
      "admin",
      "official",
      "moderator",
      "resident",
    ],

    navigationLayout: [
      navSection(
        "city",
        "Місто",
        "🏙️",
        [
          "feed",
          "events",
          "city_projects",
        ]
      ),

      navSection(
        "participation",
        "Участь",
        "🗳️",
        [
          "discussions",
          "polls",
          "voting",
          "appeals",
        ]
      ),

      navSection(
        "documents",
        "Інформація",
        "📁",
        [
          "documents",
        ]
      ),
    ],
  },

  {
    id: "charity",
    icon: "❤️",
    title: "Благодійність / Волонтери",
    description:
      "Збори, потреби, звіти та волонтерські задачі.",
    group: "Організації",

    modules: [
      "feed",
      "collections",
      "volunteer_tasks",
      "reports",
      "documents",
      "events",
      "chat",
      "members",
    ],

    roles: [
      "owner",
      "admin",
      "coordinator",
      "volunteer",
      "member",
    ],

    navigationLayout: [
      navSection(
        "charity",
        "Допомога",
        "❤️",
        [
          "collections",
          "volunteer_tasks",
          "events",
        ]
      ),

      navSection(
        "transparency",
        "Прозорість",
        "📋",
        [
          "reports",
          "documents",
        ]
      ),

      navSection(
        "community",
        "Спільнота",
        "👥",
        [
          "feed",
          "members",
          "chat",
        ]
      ),
    ],
  },

  {
    id: "sports",
    icon: "⚽",
    title: "Спортивна команда / Академія",
    description:
      "Команди, тренери, тренування та змагання.",
    group: "Організації",

    modules: [
      "feed",
      "teams",
      "training",
      "schedule",
      "competitions",
      "results",
      "sports_stats",
      "parents",
      "events",
      "chat",
      "media",
      "members",
    ],

    roles: [
      "owner",
      "admin",
      "coach",
      "athlete",
      "parent",
    ],

    navigationLayout: [
      navSection(
        "sport",
        "Спорт",
        "⚽",
        [
          "teams",
          "training",
          "schedule",
          "competitions",
          "results",
          "sports_stats",
        ]
      ),

      navSection(
        "people",
        "Команда",
        "👥",
        [
          "members",
          "parents",
        ]
      ),

      navSection(
        "community",
        "Спільнота",
        "💬",
        [
          "feed",
          "events",
          "chat",
          "media",
        ]
      ),
    ],
  },

  {
    id: "creative",
    icon: "🎭",
    title: "Творчий колектив",
    description:
      "Театр, музика, танці, репетиції та виступи.",
    group: "Організації",

    modules: [
      "feed",
      "members",
      "rehearsals",
      "schedule",
      "performances",
      "events",
      "documents",
      "media",
      "chat",
    ],

    roles: [
      "owner",
      "director",
      "manager",
      "artist",
      "member",
    ],

    navigationLayout: [
      navSection(
        "creative",
        "Творчість",
        "🎭",
        [
          "rehearsals",
          "performances",
          "schedule",
        ]
      ),

      navSection(
        "community",
        "Колектив",
        "👥",
        [
          "members",
          "chat",
          "documents",
        ]
      ),

      navSection(
        "public",
        "Публічне",
        "🎤",
        [
          "feed",
          "events",
          "media",
        ]
      ),
    ],
  },

  {
    id: "spiritual",
    icon: "⛪",
    title: "Духовна громада",
    description:
      "Оголошення, події, волонтерство та спілкування.",
    group: "Організації",

    modules: [
      "feed",
      "announcements",
      "events",
      "members",
      "chat",
      "documents",
    ],

    roles: [
      "owner",
      "admin",
      "moderator",
      "member",
    ],

    navigationLayout: [
      navSection(
        "main",
        "Громада",
        "⛪",
        [
          "feed",
          "announcements",
          "events",
        ]
      ),

      navSection(
        "people",
        "Спілкування",
        "👥",
        [
          "members",
          "chat",
          "documents",
        ]
      ),
    ],
  },

  /* =======================================================
     BUSINESS
  ======================================================= */

  {
    id: "business_page",
    icon: "🛍️",
    title: "Бренд / Магазин / Бізнес",
    description:
      "Товари, послуги, акції, вакансії та підтримка.",
    group: "Бізнес",

    modules: [
      "feed",
      "products",
      "services",
      "reviews",
      "support",
      "vacancies",
      "events",
      "analytics",
      "followers",
    ],

    roles: [
      "owner",
      "admin",
      "manager",
      "support",
      "content_manager",
    ],

    navigationLayout: [
      navSection(
        "business",
        "Бізнес",
        "🛍️",
        [
          "products",
          "services",
          "reviews",
          "support",
        ]
      ),

      navSection(
        "content",
        "Контент",
        "📰",
        [
          "feed",
          "events",
          "vacancies",
        ]
      ),

      navSection(
        "audience",
        "Аудиторія",
        "⭐",
        [
          "followers",
          "analytics",
        ]
      ),
    ],
  },

  {
    id: "place",
    icon: "🏨",
    title: "Місце / Заклад",
    description:
      "Ресторан, клуб, готель, музей або кінотеатр.",
    group: "Бізнес",

    modules: [
      "feed",
      "services",
      "reviews",
      "bookings",
      "events",
      "media",
      "support",
      "analytics",
    ],

    roles: [
      "owner",
      "admin",
      "manager",
      "staff",
    ],

    navigationLayout: [
      navSection(
        "place",
        "Заклад",
        "🏨",
        [
          "services",
          "bookings",
          "reviews",
          "support",
        ]
      ),

      navSection(
        "public",
        "Актуальне",
        "🎉",
        [
          "feed",
          "events",
          "media",
        ]
      ),
    ],
  },

  /* =======================================================
     INTERESTS
  ======================================================= */

  {
    id: "gaming",
    icon: "🎮",
    title: "Ігрова спільнота / Клан",
    description:
      "Команда, турніри та голосові кімнати.",
    group: "Інтереси",

    modules: [
      "feed",
      "members",
      "chat",
      "voice_rooms",
      "tournaments",
      "events",
      "media",
    ],

    roles: [
      "owner",
      "admin",
      "captain",
      "moderator",
      "member",
    ],

    navigationLayout: [
      navSection(
        "gaming",
        "Гра",
        "🎮",
        [
          "tournaments",
          "events",
          "voice_rooms",
        ]
      ),

      navSection(
        "team",
        "Команда",
        "👥",
        [
          "members",
          "chat",
        ]
      ),

      navSection(
        "content",
        "Контент",
        "🎬",
        [
          "feed",
          "media",
        ]
      ),
    ],
  },

  {
    id: "club",
    icon: "📚",
    title: "Клуб",
    description:
      "Книжковий, професійний або тематичний клуб.",
    group: "Інтереси",

    modules: [
      "feed",
      "discussions",
      "members",
      "events",
      "documents",
      "chat",
    ],

    roles: [
      "owner",
      "admin",
      "moderator",
      "member",
    ],

    navigationLayout: [
      navSection(
        "club",
        "Клуб",
        "📚",
        [
          "feed",
          "discussions",
          "events",
        ]
      ),

      navSection(
        "people",
        "Учасники",
        "👥",
        [
          "members",
          "chat",
          "documents",
        ]
      ),
    ],
  },

  {
    id: "travel",
    icon: "🌍",
    title: "Подорож / Експедиція",
    description:
      "Маршрут, учасники, документи, витрати та фото.",
    group: "Інтереси",

    modules: [
      "feed",
      "routes",
      "travel_points",
      "members",
      "expenses",
      "documents",
      "events",
      "chat",
      "media",
    ],

    roles: [
      "owner",
      "organizer",
      "guide",
      "member",
    ],

    navigationLayout: [
      navSection(
        "route",
        "Маршрут",
        "🗺️",
        [
          "routes",
          "travel_points",
          "events",
        ]
      ),

      navSection(
        "trip",
        "Подорож",
        "🌍",
        [
          "members",
          "expenses",
          "documents",
        ]
      ),

      navSection(
        "community",
        "Спогади",
        "📸",
        [
          "feed",
          "media",
          "chat",
        ]
      ),
    ],
  },

  /* =======================================================
     PROFESSIONAL
  ======================================================= */

  {
    id: "research",
    icon: "🧪",
    title: "Наукова лабораторія",
    description:
      "Дослідження, публікації, експерименти та конференції.",
    group: "Професійні",

    modules: [
      "research_projects",
      "publications",
      "experiments",
      "documents",
      "tasks",
      "conferences",
      "events",
      "discussions",
      "chat",
    ],

    roles: [
      "owner",
      "lead_researcher",
      "researcher",
      "assistant",
      "student",
    ],

    navigationLayout: [
      navSection(
        "research",
        "Дослідження",
        "🔬",
        [
          "research_projects",
          "experiments",
          "tasks",
        ]
      ),

      navSection(
        "science",
        "Наукові матеріали",
        "📄",
        [
          "publications",
          "documents",
          "conferences",
        ]
      ),

      navSection(
        "communication",
        "Спільнота",
        "💬",
        [
          "discussions",
          "events",
          "chat",
        ]
      ),
    ],
  },

  {
    id: "media",
    icon: "📰",
    title: "Медіа / Редакція",
    description:
      "Автори, редактори, публікації та аналітика.",
    group: "Професійні",

    modules: [
      "feed",
      "editorial",
      "content_calendar",
      "documents",
      "media",
      "analytics",
      "moderation",
      "events",
    ],

    roles: [
      "owner",
      "editor_in_chief",
      "editor",
      "journalist",
      "content_manager",
      "moderator",
      "analyst",
    ],

    navigationLayout: [
      navSection(
        "content",
        "Контент",
        "📰",
        [
          "feed",
          "media",
          "events",
        ]
      ),

      navSection(
        "editorial",
        "Редакція",
        "✍️",
        [
          "editorial",
          "content_calendar",
          "documents",
        ]
      ),

      navSection(
        "control",
        "Контроль",
        "📈",
        [
          "analytics",
          "moderation",
        ]
      ),
    ],
  },
];

/* =========================================================
   MASSIVE
========================================================= */

export const MASSIVE_SCALE_MODULES = [
  "moderation",
  "analytics",
  "editorial",
];

/* =========================================================
   HELPERS
========================================================= */

export function getTemplate(
  id
) {
  return SPACE_TEMPLATES.find(
    (template) =>
      template.id === id
  );
}

export function getModule(
  id
) {
  return SPACE_MODULES[id];
}

export function buildModules(
  template,
  scale = "small"
) {
  const modules = [
    ...(template?.modules ||
      []),
  ];

  if (
    scale === "massive"
  ) {
    MASSIVE_SCALE_MODULES.forEach(
      (module) => {
        if (
          !modules.includes(
            module
          )
        ) {
          modules.push(
            module
          );
        }
      }
    );
  }

  return modules;
}

export function mergeNavigationWithModules(
  layout = [],
  enabledModules = []
) {
  const result =
    layout.map(
      (section) => ({
        ...section,

        modules:
          section.modules.filter(
            (id) =>
              enabledModules.includes(
                id
              )
          ),
      })
    );

  const alreadyPlaced =
    result.flatMap(
      (section) =>
        section.modules
    );

  const missing =
    enabledModules.filter(
      (id) =>
        !alreadyPlaced.includes(
          id
        )
    );

  if (
    missing.length
  ) {
    result.push({
      id: "other",
      title: "Інше",
      icon: "🧩",
      modules: missing,
    });
  }

  return result.filter(
    (section) =>
      section.modules.length >
      0
  );
}