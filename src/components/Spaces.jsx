import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CommunityEventsSection from "./spaces/CommunityEventsSection";

import {
  openSchoolChat,
} from "../bridges/schoolChatBridge";

/* =========================================================
   ЯТУТ — SPACES
========================================================= */

const STORAGE_KEY =
  "yatut-spaces-v2";

const LEGACY_KEYS = [
  "yatut-spaces-v1",
  "yatut-spaces",
];

/* =========================================================
   TEMPLATES
========================================================= */

const SPACE_TEMPLATES = [
  {
    id: "public-page",
    group: "Публічні",
    icon: "🌐",
    title: "Публічна сторінка",
    description:
      "Публічна спільнота, бренд, автор або проєкт.",
    type: "public",
  },

  {
    id: "channel",
    group: "Публічні",
    icon: "📣",
    title: "Канал",
    description:
      "Новини, публікації та контент від авторів.",
    type: "channel",
  },

  {
    id: "school",
    group: "Освіта",
    icon: "🏫",
    title: "Школа",
    description:
      "Учні, вчителі, класи, розклад, домашні завдання.",
    type: "school",
  },

  {
    id: "kindergarten",
    group: "Освіта",
    icon: "🧸",
    title: "Дитячий садок",
    description:
      "Батьки, вихователі, групи, події та оголошення.",
    type: "kindergarten",
  },

  {
    id: "university",
    group: "Освіта",
    icon: "🎓",
    title: "Університет",
    description:
      "Факультети, групи, студенти, викладачі.",
    type: "university",
  },

  {
    id: "courses",
    group: "Освіта",
    icon: "💻",
    title: "Курси / Онлайн-школа",
    description:
      "Навчальні програми, заняття, групи та матеріали.",
    type: "courses",
  },

  {
    id: "health",
    group: "Організації",
    icon: "🏥",
    title: "Здоровʼя / Клініка",
    description:
      "Лікарі, пацієнти, записи та документи.",
    type: "health",
    sensitive: true,
  },

  {
    id: "building",
    group: "Організації",
    icon: "🏠",
    title: "ЖК / Будинок / ОСББ",
    description:
      "Мешканці, оголошення, ремонти, аварії, голосування.",
    type: "building",
  },

  {
    id: "city",
    group: "Організації",
    icon: "🏙️",
    title: "Місто / Громада",
    description:
      "Мешканці, локальні новини, події та ініціативи.",
    type: "city",
  },

  {
    id: "charity",
    group: "Організації",
    icon: "🤝",
    title: "Благодійність / Волонтери",
    description:
      "Збори, волонтери, задачі, звіти та координація.",
    type: "charity",
  },

  {
    id: "sport",
    group: "Організації",
    icon: "⚽",
    title: "Спортивна команда / Академія",
    description:
      "Команди, тренування, матчі, розклад і учасники.",
    type: "sport",
  },

  {
    id: "creative",
    group: "Організації",
    icon: "🎭",
    title: "Творчий колектив",
    description:
      "Музика, театр, танці, творчі команди та проєкти.",
    type: "creative",
  },

  {
    id: "work",
    group: "Організації",
    icon: "💼",
    title: "Робота / Компанія",
    description:
      "Команди, задачі, конференції та внутрішня комунікація.",
    type: "work",
  },
];

/* =========================================================
   SCALE
========================================================= */

const SPACE_SCALES = [
  {
    id: "small",
    icon: "👥",
    title: "Мала",
    description:
      "До 100 учасників",
  },

  {
    id: "medium",
    icon: "🏘️",
    title: "Середня",
    description:
      "100–1 000 учасників",
  },

  {
    id: "large",
    icon: "🏙️",
    title: "Велика",
    description:
      "1 000–10 000 учасників",
  },

  {
    id: "massive",
    icon: "🌍",
    title: "Масштабна",
    description:
      "10 000+ учасників",
  },
];

/* =========================================================
   MODULES
========================================================= */

const MODULE_GROUPS = [
  {
    id: "social",
    title: "Комунікація",
    modules: [
      {
        id: "feed",
        icon: "📰",
        title: "Стрічка",
      },
      {
        id: "chat",
        icon: "💬",
        title: "Чат",
      },
      {
        id: "events",
        icon: "🎉",
        title: "Події",
      },
      {
        id: "members",
        icon: "👥",
        title: "Учасники",
      },
    ],
  },

  {
    id: "work",
    title: "Робота",
    modules: [
      {
        id: "tasks",
        icon: "✅",
        title: "Задачі",
      },
      {
        id: "calendar",
        icon: "📅",
        title: "Календар",
      },
      {
        id: "files",
        icon: "📁",
        title: "Файли",
      },
      {
        id: "meetings",
        icon: "🎥",
        title: "Конференції",
      },
    ],
  },

  {
    id: "education",
    title: "Освіта",
    modules: [
      {
        id: "classes",
        icon: "🏫",
        title: "Класи",
      },
      {
        id: "schedule",
        icon: "🗓️",
        title: "Розклад",
      },
      {
        id: "homework",
        icon: "📚",
        title: "Домашнє",
      },
      {
        id: "grades",
        icon: "📊",
        title: "Оцінки",
      },
    ],
  },

  {
    id: "community",
    title: "Організація",
    modules: [
      {
        id: "polls",
        icon: "🗳️",
        title: "Голосування",
      },
      {
        id: "announcements",
        icon: "📢",
        title: "Оголошення",
      },
      {
        id: "documents",
        icon: "📄",
        title: "Документи",
      },
      {
        id: "requests",
        icon: "📨",
        title: "Звернення",
      },
    ],
  },
];

/* =========================================================
   ROLES
========================================================= */

const ROLE_PRESETS = [
  {
    id: "owner",
    icon: "👑",
    title: "Власник",
    locked: true,
  },

  {
    id: "admin",
    icon: "🛡️",
    title: "Адміністратор",
  },

  {
    id: "moderator",
    icon: "⚙️",
    title: "Модератор",
  },

  {
    id: "member",
    icon: "👤",
    title: "Учасник",
  },
];

const PERMISSION_GROUPS = [
  {
    id: "content",
    title: "Контент",
    items: [
      {
        id: "publish",
        title: "Публікувати дописи",
      },
      {
        id: "editPosts",
        title: "Редагувати дописи",
      },
      {
        id: "deletePosts",
        title: "Видаляти дописи",
      },
      {
        id: "pinPosts",
        title: "Закріплювати дописи",
      },
    ],
  },

  {
    id: "people",
    title: "Учасники",
    items: [
      {
        id: "invite",
        title: "Запрошувати людей",
      },
      {
        id: "removeMembers",
        title: "Видаляти учасників",
      },
      {
        id: "manageRoles",
        title: "Керувати ролями",
        sensitive: true,
      },
    ],
  },

  {
    id: "management",
    title: "Керування",
    items: [
      {
        id: "editSpace",
        title: "Редагувати спільноту",
        sensitive: true,
      },
      {
        id: "manageModules",
        title: "Керувати модулями",
      },
      {
        id: "manageEvents",
        title: "Керувати подіями",
      },
      {
        id: "viewAnalytics",
        title: "Переглядати аналітику",
      },
    ],
  },
];

/* =========================================================
   DEFAULT PERMISSIONS
========================================================= */

const DEFAULT_PERMISSIONS = {
  owner: {
    publish: true,
    editPosts: true,
    deletePosts: true,
    pinPosts: true,
    invite: true,
    removeMembers: true,
    manageRoles: true,
    editSpace: true,
    manageModules: true,
    manageEvents: true,
    viewAnalytics: true,
  },

  admin: {
    publish: true,
    editPosts: true,
    deletePosts: true,
    pinPosts: true,
    invite: true,
    removeMembers: true,
    manageRoles: false,
    editSpace: true,
    manageModules: true,
    manageEvents: true,
    viewAnalytics: true,
  },

  moderator: {
    publish: true,
    editPosts: false,
    deletePosts: true,
    pinPosts: true,
    invite: true,
    removeMembers: false,
    manageRoles: false,
    editSpace: false,
    manageModules: false,
    manageEvents: true,
    viewAnalytics: false,
  },

  member: {
    publish: true,
    editPosts: false,
    deletePosts: false,
    pinPosts: false,
    invite: true,
    removeMembers: false,
    manageRoles: false,
    editSpace: false,
    manageModules: false,
    manageEvents: false,
    viewAnalytics: false,
  },
};

/* =========================================================
   DEMO SCHOOL
========================================================= */

function createDefaultSchool() {
  return {
    classes: [
      {
        id: "class-10a",
        title: "10-А",
      },
      {
        id: "class-10b",
        title: "10-Б",
      },
      {
        id: "class-11a",
        title: "11-А",
      },
    ],

    subjects: [
      {
        id: "math",
        title: "Математика",
        icon: "📐",
      },
      {
        id: "ukrainian",
        title: "Українська мова",
        icon: "📘",
      },
      {
        id: "english",
        title: "Англійська",
        icon: "🇬🇧",
      },
    ],

    teachers: [
      {
        id: "teacher-1",
        name: "Олена",
        surname: "Коваль",
        subjectIds: [
          "math",
        ],
        classIds: [
          "class-10a",
          "class-10b",
        ],
      },

      {
        id: "teacher-2",
        name: "Ірина",
        surname: "Мельник",
        subjectIds: [
          "ukrainian",
          "english",
        ],
        classIds: [
          "class-10a",
          "class-11a",
        ],
      },
    ],

    students: [
      {
        id: "student-1",
        name: "Максим",
        surname: "Шевченко",
        classId:
          "class-10a",
      },
      {
        id: "student-2",
        name: "Софія",
        surname: "Романенко",
        classId:
          "class-10a",
      },
      {
        id: "student-3",
        name: "Марія",
        surname: "Коваль",
        classId:
          "class-10b",
      },
    ],

    parents: [
      {
        id: "parent-1",
        name: "Наталія",
        surname: "Шевченко",
        childIds: [
          "student-1",
        ],
      },
    ],
  };
}

/* =========================================================
   HELPERS
========================================================= */

function createId(
  prefix = "space"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function slugify(
  value = ""
) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(
      /['’ʼ"]/g,
      ""
    )
    .replace(
      /[^a-zа-яёіїєґ0-9]+/gi,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(
      0,
      40
    );
}

function clonePermissions() {
  return JSON.parse(
    JSON.stringify(
      DEFAULT_PERMISSIONS
    )
  );
}

function defaultModulesForType(
  type
) {
  const base = [
    "feed",
    "chat",
    "events",
    "members",
  ];

  if (
    [
      "school",
      "university",
      "courses",
      "kindergarten",
    ].includes(type)
  ) {
    return [
      ...base,
      "classes",
      "schedule",
      "homework",
      "grades",
      "files",
      "meetings",
    ];
  }

  if (
    type ===
    "work"
  ) {
    return [
      ...base,
      "tasks",
      "calendar",
      "files",
      "meetings",
      "announcements",
    ];
  }

  if (
    type ===
      "building" ||
    type ===
      "city"
  ) {
    return [
      ...base,
      "polls",
      "announcements",
      "documents",
      "requests",
    ];
  }

  if (
    type ===
    "health"
  ) {
    return [
      ...base,
      "calendar",
      "documents",
      "requests",
    ];
  }

  return base;
}

function createDemoSpaces() {
  return [];
}

function normalizeSpace(
  space
) {
  const type =
    space.type ||
    space.templateType ||
    "public";

  return {
    id:
      space.id ||
      createId(),

    title:
      space.title ||
      space.name ||
      "Спільнота",

    username:
      space.username ||
      slugify(
        space.title ||
          space.name ||
          "space"
      ),

    description:
      space.description ||
      "",

    type,

    templateId:
      space.templateId ||
      type,

    scale:
      space.scale ||
      "small",

    privacy:
      space.privacy ||
      "public",

    city:
      space.city ||
      "Київ",

    avatar:
      space.avatar ||
      null,

    cover:
      space.cover ||
      null,

    ownerId:
      space.ownerId ||
      "me",

    members:
      Array.isArray(
        space.members
      )
        ? space.members
        : [
            "me",
          ],

    modules:
      Array.isArray(
        space.modules
      )
        ? space.modules
        : defaultModulesForType(
            type
          ),

    permissions:
      space.permissions ||
      clonePermissions(),

    school:
      type ===
        "school"
        ? space.school ||
          createDefaultSchool()
        : space.school ||
          null,

    createdAt:
      space.createdAt ||
      Date.now(),

    updatedAt:
      space.updatedAt ||
      Date.now(),
  };
}

function loadSpaces() {
  const keys = [
    STORAGE_KEY,
    ...LEGACY_KEYS,
  ];

  for (const key of keys) {
    try {
      const raw =
        localStorage.getItem(
          key
        );

      if (!raw) {
        continue;
      }

      const parsed =
        JSON.parse(
          raw
        );

      if (
        Array.isArray(
          parsed
        )
      ) {
        return parsed.map(
          normalizeSpace
        );
      }
    } catch (
      error
    ) {
      console.warn(
        "SPACES LOAD ERROR:",
        error
      );
    }
  }

  return createDemoSpaces();
}

function saveSpaces(
  spaces
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        spaces
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        "yatut:spaces-changed",
        {
          detail:
            spaces,
        }
      )
    );
  } catch (
    error
  ) {
    console.warn(
      "SPACES SAVE ERROR:",
      error
    );
  }
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

function templateForSpace(
  space
) {
  return (
    SPACE_TEMPLATES.find(
      (template) =>
        template.id ===
          space.templateId ||
        template.type ===
          space.type
    ) ||
    SPACE_TEMPLATES[0]
  );
}

function moduleById(
  id
) {
  for (const group of MODULE_GROUPS) {
    const found =
      group.modules.find(
        (module) =>
          module.id ===
          id
      );

    if (found) {
      return found;
    }
  }

  return null;
}

/* =========================================================
   SPACE CARD
========================================================= */

function SpaceCard({
  space,
  onOpen,
}) {
  const template =
    templateForSpace(
      space
    );

  return (
    <article className="space-card">
      <button
        type="button"
        className="space-card-cover"
        style={
          space.cover
            ? {
                backgroundImage:
                  `url("${space.cover}")`,
              }
            : {
                background:
                  "linear-gradient(135deg,#8b5cf6,#6d28d9)",
              }
        }
        onClick={() =>
          onOpen(
            space.id
          )
        }
      />

      <div className="space-card-body">
        <div className="space-card-avatar">
          {space.avatar ? (
            <img
              src={
                space.avatar
              }
              alt=""
            />
          ) : (
            template.icon
          )}
        </div>

        <span className="space-card-type">
          {
            template.title
          }
        </span>

        <button
          type="button"
          className="space-card-title"
          onClick={() =>
            onOpen(
              space.id
            )
          }
        >
          {
            space.title
          }
        </button>

        <span className="space-card-handle">
          @
          {
            space.username
          }
        </span>

        <p>
          {space.description ||
            "Простір ЯТУТ для людей, спілкування та спільних справ."}
        </p>

        <div className="space-card-meta">
          <span>
            👥{" "}
            {
              space.members
                .length
            }
          </span>

          <span>
            🧩{" "}
            {
              space.modules
                .length
            }{" "}
            модулів
          </span>

          <span>
            📍{" "}
            {
              space.city
            }
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CREATE / EDIT ENGINE
========================================================= */

function SpaceEngine({
  initialSpace = null,
  onClose,
  onSave,
}) {
  const editing =
    Boolean(
      initialSpace
    );

  const coverRef =
    useRef(null);

  const avatarRef =
    useRef(null);

  const [
    step,
    setStep,
  ] = useState(
    editing
      ? 3
      : 1
  );

  const [
    templateId,
    setTemplateId,
  ] = useState(
    initialSpace
      ?.templateId ||
      null
  );

  const selectedTemplate =
    SPACE_TEMPLATES.find(
      (template) =>
        template.id ===
        templateId
    ) ||
    null;

  const [
    scale,
    setScale,
  ] = useState(
    initialSpace
      ?.scale ||
      "small"
  );

  const [
    modules,
    setModules,
  ] = useState(
    initialSpace
      ?.modules ||
      []
  );

  const [
    title,
    setTitle,
  ] = useState(
    initialSpace
      ?.title ||
      ""
  );

  const [
    username,
    setUsername,
  ] = useState(
    initialSpace
      ?.username ||
      ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    initialSpace
      ?.description ||
      ""
  );

  const [
    city,
    setCity,
  ] = useState(
    initialSpace
      ?.city ||
      "Київ"
  );

  const [
    privacy,
    setPrivacy,
  ] = useState(
    initialSpace
      ?.privacy ||
      "public"
  );

  const [
    cover,
    setCover,
  ] = useState(
    initialSpace
      ?.cover ||
      null
  );

  const [
    avatar,
    setAvatar,
  ] = useState(
    initialSpace
      ?.avatar ||
      null
  );

  useEffect(() => {
    if (
      !selectedTemplate
    ) {
      return;
    }

    if (
      editing
    ) {
      return;
    }

    setModules(
      defaultModulesForType(
        selectedTemplate.type
      )
    );
  }, [
    templateId,
    editing,
    selectedTemplate,
  ]);

  useEffect(() => {
    const old =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        old;
    };
  }, []);

  async function chooseImage(
    file,
    setter
  ) {
    if (
      !file ||
      !file.type.startsWith(
        "image/"
      )
    ) {
      return;
    }

    try {
      const dataUrl =
        await fileToDataUrl(
          file
        );

      setter(
        dataUrl
      );
    } catch (
      error
    ) {
      console.warn(
        "IMAGE READ ERROR:",
        error
      );
    }
  }

  function chooseTemplate(
    id
  ) {
    setTemplateId(
      id
    );
  }

  function toggleModule(
    moduleId
  ) {
    setModules(
      (
        previous
      ) =>
        previous.includes(
          moduleId
        )
          ? previous.filter(
              (id) =>
                id !==
                moduleId
            )
          : [
              ...previous,
              moduleId,
            ]
    );
  }

  function canNext() {
    if (
      step === 1
    ) {
      return Boolean(
        selectedTemplate
      );
    }

    if (
      step === 2
    ) {
      return Boolean(
        scale
      );
    }

    if (
      step === 3
    ) {
      return (
        title.trim()
          .length >= 2 &&
        username.trim()
          .length >= 2
      );
    }

    return true;
  }

  function next() {
    if (
      !canNext()
    ) {
      return;
    }

    if (
      step < 4
    ) {
      setStep(
        step + 1
      );
    }
  }

  function back() {
    if (
      step > 1
    ) {
      setStep(
        step - 1
      );

      return;
    }

    onClose?.();
  }

  function save() {
    if (
      !selectedTemplate ||
      !title.trim()
    ) {
      return;
    }

    const normalizedUsername =
      slugify(
        username ||
          title
      );

    const result =
      normalizeSpace({
        ...(initialSpace ||
          {}),

        id:
          initialSpace?.id ||
          createId(),

        title:
          title.trim(),

        username:
          normalizedUsername,

        description:
          description.trim(),

        city:
          city.trim() ||
          "Київ",

        privacy,

        type:
          selectedTemplate.type,

        templateId:
          selectedTemplate.id,

        scale,

        modules,

        avatar,

        cover,

        school:
          selectedTemplate.type ===
          "school"
            ? initialSpace
                ?.school ||
              createDefaultSchool()
            : initialSpace
                ?.school ||
              null,

        permissions:
          initialSpace
            ?.permissions ||
          clonePermissions(),

        updatedAt:
          Date.now(),
      });

    onSave?.(
      result
    );
  }

  const groupedTemplates =
    useMemo(() => {
      const result =
        {};

      SPACE_TEMPLATES.forEach(
        (
          template
        ) => {
          if (
            !result[
              template.group
            ]
          ) {
            result[
              template.group
            ] = [];
          }

          result[
            template.group
          ].push(
            template
          );
        }
      );

      return result;
    }, []);

  return (
    <div
      className="space-engine-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="space-engine-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="space-engine-header">
          <div>
            <span>
              ЯТУТ SPACE ENGINE
            </span>

            <h2>
              {editing
                ? "Редагувати простір"
                : "Створити простір"}
            </h2>
          </div>

          <div className="space-engine-progress">
            {[
              1,
              2,
              3,
              4,
            ].map(
              (
                item
              ) => (
                <span
                  key={
                    item
                  }
                  className={
                    item <=
                    step
                      ? "active"
                      : ""
                  }
                >
                  {
                    item
                  }
                </span>
              )
            )}
          </div>

          <button
            type="button"
            className="space-engine-close"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <div className="space-engine-body">
          {step ===
            1 && (
            <>
              <div className="space-step-intro">
                <span>
                  КРОК 1
                </span>

                <h3>
                  Що ви створюєте?
                </h3>

                <p>
                  Оберіть тип простору. ЯТУТ автоматично підготує рекомендовані модулі.
                </p>
              </div>

              {Object.entries(
                groupedTemplates
              ).map(
                ([
                  group,
                  templates,
                ]) => (
                  <section
                    key={
                      group
                    }
                    className="space-template-section"
                  >
                    <h4>
                      {
                        group
                      }
                    </h4>

                    <div className="space-template-grid">
                      {templates.map(
                        (
                          template
                        ) => (
                          <button
                            key={
                              template.id
                            }
                            type="button"
                            className={`space-template-card ${
                              templateId ===
                              template.id
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              chooseTemplate(
                                template.id
                              )
                            }
                          >
                            <span className="space-template-icon">
                              {
                                template.icon
                              }
                            </span>

                            <strong>
                              {
                                template.title
                              }
                            </strong>

                            <p>
                              {
                                template.description
                              }
                            </p>

                            {templateId ===
                              template.id && (
                              <b>
                                ✓
                              </b>
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </section>
                )
              )}
            </>
          )}

          {step ===
            2 && (
            <>
              <div className="space-step-intro">
                <span>
                  КРОК 2
                </span>

                <h3>
                  Масштаб і модулі
                </h3>

                <p>
                  Вкажіть приблизний розмір та виберіть, які можливості потрібні простору.
                </p>
              </div>

              <section className="space-scale-section">
                <h4>
                  Масштаб
                </h4>

                <div className="space-scale-grid">
                  {SPACE_SCALES.map(
                    (
                      item
                    ) => (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        className={
                          scale ===
                          item.id
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setScale(
                            item.id
                          )
                        }
                      >
                        <span>
                          {
                            item.icon
                          }
                        </span>

                        <strong>
                          {
                            item.title
                          }
                        </strong>

                        <small>
                          {
                            item.description
                          }
                        </small>
                      </button>
                    )
                  )}
                </div>

                {scale ===
                  "massive" && (
                  <div className="space-massive-notice">
                    Для великих спільнот ЯТУТ автоматично підготує розширену модерацію, ролі та аналітику.
                  </div>
                )}
              </section>

              {MODULE_GROUPS.map(
                (
                  group
                ) => (
                  <section
                    key={
                      group.id
                    }
                    className="space-modules-section"
                  >
                    <div className="space-modules-header">
                      <div>
                        <h4>
                          {
                            group.title
                          }
                        </h4>

                        <p>
                          Активуйте потрібні функції.
                        </p>
                      </div>

                      <strong>
                        {
                          group.modules.filter(
                            (
                              module
                            ) =>
                              modules.includes(
                                module.id
                              )
                          ).length
                        }
                      </strong>
                    </div>

                    <div className="space-modules-grid">
                      {group.modules.map(
                        (
                          module
                        ) => {
                          const active =
                            modules.includes(
                              module.id
                            );

                          return (
                            <button
                              key={
                                module.id
                              }
                              type="button"
                              className={
                                active
                                  ? "active"
                                  : ""
                              }
                              onClick={() =>
                                toggleModule(
                                  module.id
                                )
                              }
                            >
                              <span>
                                {
                                  module.icon
                                }
                              </span>

                              <strong>
                                {
                                  module.title
                                }
                              </strong>

                              {active && (
                                <b>
                                  ✓
                                </b>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </section>
                )
              )}
            </>
          )}

          {step ===
            3 && (
            <>
              <div className="space-step-intro">
                <span>
                  КРОК 3
                </span>

                <h3>
                  Оформлення простору
                </h3>

                <p>
                  Назва, адреса, опис, місто, аватар та обкладинка.
                </p>
              </div>

              <div
                className="space-create-cover"
                style={
                  cover
                    ? {
                        backgroundImage:
                          `url("${cover}")`,
                        backgroundSize:
                          "cover",
                        backgroundPosition:
                          "center",
                      }
                    : undefined
                }
              >
                {!cover && (
                  <span>
                    🖼️
                  </span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    coverRef.current?.click()
                  }
                >
                  {cover
                    ? "Змінити обкладинку"
                    : "Додати обкладинку"}
                </button>

                <input
                  ref={
                    coverRef
                  }
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(
                    event
                  ) =>
                    chooseImage(
                      event
                        .target
                        .files?.[0],
                      setCover
                    )
                  }
                />
              </div>

              <div className="space-avatar-row">
                <div className="space-create-avatar">
                  {avatar ? (
                    <img
                      src={
                        avatar
                      }
                      alt=""
                    />
                  ) : (
                    selectedTemplate
                      ?.icon ||
                    "Я"
                  )}
                </div>

                <div>
                  <strong>
                    Аватар
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      avatarRef.current?.click()
                    }
                  >
                    Завантажити
                  </button>
                </div>

                <input
                  ref={
                    avatarRef
                  }
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(
                    event
                  ) =>
                    chooseImage(
                      event
                        .target
                        .files?.[0],
                      setAvatar
                    )
                  }
                />
              </div>

              <div className="space-field-row">
                <label className="space-field">
                  <span>
                    Назва *
                  </span>

                  <input
                    value={
                      title
                    }
                    onChange={(
                      event
                    ) => {
                      const next =
                        event
                          .target
                          .value;

                      setTitle(
                        next
                      );

                      if (
                        !editing &&
                        !username
                      ) {
                        setUsername(
                          slugify(
                            next
                          )
                        );
                      }
                    }}
                    placeholder="Назва простору"
                  />
                </label>

                <label className="space-field">
                  <span>
                    Адреса
                  </span>

                  <div className="space-username-input">
                    <b>
                      @
                    </b>

                    <input
                      value={
                        username
                      }
                      onChange={(
                        event
                      ) =>
                        setUsername(
                          slugify(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      placeholder="username"
                    />
                  </div>
                </label>
              </div>

              <label className="space-field">
                <span>
                  Опис
                </span>

                <textarea
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Розкажіть про цей простір..."
                />
              </label>

              <div className="space-field-row">
                <label className="space-field">
                  <span>
                    Місто
                  </span>

                  <input
                    value={
                      city
                    }
                    onChange={(
                      event
                    ) =>
                      setCity(
                        event
                          .target
                          .value
                      )
                    }
                  />
                </label>

                <label className="space-field">
                  <span>
                    Доступ
                  </span>

                  <select
                    value={
                      privacy
                    }
                    onChange={(
                      event
                    ) =>
                      setPrivacy(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="public">
                      Публічний
                    </option>

                    <option value="private">
                      Приватний
                    </option>

                    <option value="request">
                      За заявкою
                    </option>
                  </select>
                </label>
              </div>

              {selectedTemplate
                ?.sensitive && (
                <div className="space-sensitive-warning">
                  🔐 Цей тип простору містить чутливі дані. ЯТУТ застосовуватиме посилені права доступу.
                </div>
              )}
            </>
          )}

          {step ===
            4 && (
            <>
              <div className="space-step-intro">
                <span>
                  КРОК 4
                </span>

                <h3>
                  Перевірте все
                </h3>

                <p>
                  Після створення всі ці дані можна буде змінити в адмін-режимі.
                </p>
              </div>

              <article className="space-summary-card">
                <div className="space-summary-top">
                  <div className="space-summary-avatar">
                    {avatar ? (
                      <img
                        src={
                          avatar
                        }
                        alt=""
                      />
                    ) : (
                      selectedTemplate
                        ?.icon ||
                      "Я"
                    )}
                  </div>

                  <div>
                    <span>
                      {
                        selectedTemplate
                          ?.title
                      }
                    </span>

                    <h3>
                      {
                        title
                      }
                    </h3>

                    <p>
                      @
                      {
                        username
                      }
                    </p>
                  </div>
                </div>

                <div className="space-summary-stats">
                  <div>
                    <strong>
                      {
                        SPACE_SCALES.find(
                          (
                            item
                          ) =>
                            item.id ===
                            scale
                        )
                          ?.title
                      }
                    </strong>

                    <span>
                      масштаб
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        modules.length
                      }
                    </strong>

                    <span>
                      модулів
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        city
                      }
                    </strong>

                    <span>
                      місто
                    </span>
                  </div>
                </div>

                <div className="space-summary-modules">
                  {modules.map(
                    (
                      id
                    ) => {
                      const module =
                        moduleById(
                          id
                        );

                      if (
                        !module
                      ) {
                        return null;
                      }

                      return (
                        <span
                          key={
                            id
                          }
                        >
                          {
                            module.icon
                          }{" "}
                          {
                            module.title
                          }
                        </span>
                      );
                    }
                  )}
                </div>
              </article>
            </>
          )}
        </div>

        <footer className="space-engine-footer">
          <button
            type="button"
            className="space-engine-back"
            onClick={
              back
            }
          >
            {step ===
            1
              ? "Скасувати"
              : "Назад"}
          </button>

          {step <
          4 ? (
            <button
              type="button"
              className="space-engine-next"
              disabled={
                !canNext()
              }
              onClick={
                next
              }
            >
              Продовжити
            </button>
          ) : (
            <button
              type="button"
              className="space-engine-create"
              onClick={
                save
              }
            >
              {editing
                ? "Зберегти зміни"
                : "Створити простір"}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

/* =========================================================
   PERMISSIONS ENGINE
========================================================= */

function PermissionsEngine({
  space,
  onChange,
}) {
  const [
    role,
    setRole,
  ] = useState(
    "admin"
  );

  const permissions =
    space.permissions ||
    clonePermissions();

  const active =
    permissions[
      role
    ] ||
    {};

  function toggle(
    permissionId
  ) {
    if (
      role ===
      "owner"
    ) {
      return;
    }

    onChange?.({
      ...space,

      permissions: {
        ...permissions,

        [role]: {
          ...active,

          [permissionId]:
            !active[
              permissionId
            ],
        },
      },

      updatedAt:
        Date.now(),
    });
  }

  return (
    <section className="space-permissions-engine">
      <div className="space-permissions-heading">
        <div>
          <span>
            РОЛІ ТА ПРАВА
          </span>

          <h2>
            Керування доступом
          </h2>

          <p>
            Визначте, що може робити кожна роль у просторі.
          </p>
        </div>

        <div className="space-permission-count">
          <strong>
            {
              Object.values(
                active
              ).filter(
                Boolean
              ).length
            }
          </strong>

          <span>
            дозволів
          </span>
        </div>
      </div>

      <div className="space-permissions-layout">
        <aside className="space-role-list">
          <span>
            РОЛІ
          </span>

          {ROLE_PRESETS.map(
            (
              item
            ) => (
              <button
                key={
                  item.id
                }
                type="button"
                className={
                  role ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setRole(
                    item.id
                  )
                }
              >
                <span>
                  {
                    item.icon
                  }
                </span>

                <div>
                  <strong>
                    {
                      item.title
                    }
                  </strong>

                  <small>
                    {item.locked
                      ? "Повний доступ"
                      : "Налаштовується"}
                  </small>
                </div>
              </button>
            )
          )}
        </aside>

        <main className="space-permission-main">
          <div className="space-permission-groups">
            {PERMISSION_GROUPS.map(
              (
                group
              ) => (
                <section
                  key={
                    group.id
                  }
                  className="space-permission-group"
                >
                  <h4>
                    {
                      group.title
                    }
                  </h4>

                  {group.items.map(
                    (
                      item
                    ) => {
                      const enabled =
                        Boolean(
                          active[
                            item.id
                          ]
                        );

                      return (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          className={`space-permission-row ${
                            enabled
                              ? "active"
                              : ""
                          } ${
                            item.sensitive
                              ? "sensitive"
                              : ""
                          }`}
                          disabled={
                            role ===
                            "owner"
                          }
                          onClick={() =>
                            toggle(
                              item.id
                            )
                          }
                        >
                          <div>
                            <strong>
                              {
                                item.title
                              }
                            </strong>

                            {item.sensitive && (
                              <small>
                                Важливий дозвіл
                              </small>
                            )}
                          </div>

                          <span className="space-permission-switch">
                            <i />
                          </span>
                        </button>
                      );
                    }
                  )}
                </section>
              )
            )}
          </div>
        </main>
      </div>
    </section>
  );
}

/* =========================================================
   SCHOOL MODULE
========================================================= */

function SchoolModule({
  space,
  onNavigate,
}) {
  const school =
    space.school ||
    createDefaultSchool();

  const [
    activeClassId,
    setActiveClassId,
  ] = useState(
    school.classes?.[0]
      ?.id ||
      null
  );

  async function openChat(
    type,
    subjectId = null
  ) {
    try {
      await openSchoolChat({
        space,
        school,
        type,

        classId:
          type ===
          "school"
            ? null
            : activeClassId,

        subjectId,

        onNavigate,
      });
    } catch (
      error
    ) {
      console.error(
        "SCHOOL CHAT ERROR:",
        error
      );
    }
  }

  return (
    <section className="space-info-card">
      <div className="space-detail-section-head">
        <div>
          <span>
            SCHOOL ENGINE
          </span>

          <h2>
            Шкільний простір
          </h2>
        </div>

        <strong>
          🏫
        </strong>
      </div>

      <div className="space-live-modules space-live-modules-full">
        <button
          type="button"
          onClick={() =>
            openChat(
              "school"
            )
          }
        >
          <span>
            💬
          </span>

          <strong>
            Загальний чат
          </strong>

          <small>
            Вся школа
          </small>
        </button>

        <button
          type="button"
        >
          <span>
            📅
          </span>

          <strong>
            Розклад
          </strong>

          <small>
            Уроки та заняття
          </small>
        </button>

        <button
          type="button"
        >
          <span>
            📚
          </span>

          <strong>
            Домашнє
          </strong>

          <small>
            Завдання
          </small>
        </button>

        <button
          type="button"
        >
          <span>
            🎥
          </span>

          <strong>
            Онлайн
          </strong>

          <small>
            Конференції
          </small>
        </button>
      </div>

      <div className="space-members-demo">
        <div className="space-detail-section-head">
          <div>
            <span>
              КЛАСИ
            </span>

            <h2>
              Оберіть клас
            </h2>
          </div>
        </div>

        <div className="space-summary-modules">
          {school.classes.map(
            (
              item
            ) => (
              <button
                key={
                  item.id
                }
                type="button"
                className={
                  activeClassId ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveClassId(
                    item.id
                  )
                }
              >
                🎓{" "}
                {
                  item.title
                }
              </button>
            )
          )}
        </div>

        {activeClassId && (
          <div className="space-live-modules space-live-modules-full">
            <button
              type="button"
              onClick={() =>
                openChat(
                  "class"
                )
              }
            >
              <span>
                🎓
              </span>

              <strong>
                Чат класу
              </strong>
            </button>

            <button
              type="button"
              onClick={() =>
                openChat(
                  "parents"
                )
              }
            >
              <span>
                👨‍👩‍👧
              </span>

              <strong>
                Батьки
              </strong>
            </button>

            {school.subjects
              .slice(
                0,
                2
              )
              .map(
                (
                  subject
                ) => (
                  <button
                    key={
                      subject.id
                    }
                    type="button"
                    onClick={() =>
                      openChat(
                        "subject",
                        subject.id
                      )
                    }
                  >
                    <span>
                      {
                        subject.icon
                      }
                    </span>

                    <strong>
                      {
                        subject.title
                      }
                    </strong>
                  </button>
                )
              )}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   MODULES VIEW
========================================================= */

function ActiveModules({
  space,
}) {
  const grouped =
    MODULE_GROUPS.map(
      (
        group
      ) => ({
        ...group,

        modules:
          group.modules.filter(
            (
              module
            ) =>
              space.modules.includes(
                module.id
              )
          ),
      })
    ).filter(
      (
        group
      ) =>
        group.modules
          .length > 0
    );

  return (
    <div className="space-module-groups">
      {grouped.map(
        (
          group
        ) => (
          <section
            key={
              group.id
            }
            className="space-info-card"
          >
            <div className="space-detail-section-head">
              <div>
                <span>
                  АКТИВНІ МОДУЛІ
                </span>

                <h2>
                  {
                    group.title
                  }
                </h2>
              </div>

              <strong>
                {
                  group.modules
                    .length
                }
              </strong>
            </div>

            <div className="space-live-modules">
              {group.modules.map(
                (
                  module
                ) => (
                  <div
                    key={
                      module.id
                    }
                    className="space-live-module"
                  >
                    <span>
                      {
                        module.icon
                      }
                    </span>

                    <strong>
                      {
                        module.title
                      }
                    </strong>

                    <small>
                      Активний
                    </small>
                  </div>
                )
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
}

/* =========================================================
   MEMBERS
========================================================= */

function MembersView({
  space,
}) {
  return (
    <section className="space-info-card">
      <div className="space-detail-section-head">
        <div>
          <span>
            УЧАСНИКИ
          </span>

          <h2>
            Люди простору
          </h2>
        </div>

        <strong>
          {
            space.members
              .length
          }
        </strong>
      </div>

      <div className="space-members-demo">
        {space.members.map(
          (
            memberId
          ) => (
            <div
              key={
                memberId
              }
              className="space-member-row"
            >
              <span>
                {memberId ===
                "me"
                  ? "В"
                  : "У"}
              </span>

              <div>
                <strong>
                  {memberId ===
                  "me"
                    ? "Вадим"
                    : "Учасник"}
                </strong>

                <small>
                  {memberId ===
                  space.ownerId
                    ? "Власник"
                    : "Учасник"}
                </small>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  space,
}) {
  const template =
    templateForSpace(
      space
    );

  return (
    <>
      <section className="space-info-card">
        <h2>
          Про простір
        </h2>

        <p>
          {space.description ||
            "Опис ще не додано."}
        </p>

        <div className="space-info-grid">
          <div>
            <span>
              Тип
            </span>

            <strong>
              {
                template.title
              }
            </strong>
          </div>

          <div>
            <span>
              Місто
            </span>

            <strong>
              {
                space.city
              }
            </strong>
          </div>

          <div>
            <span>
              Доступ
            </span>

            <strong>
              {space.privacy ===
              "public"
                ? "Публічний"
                : space.privacy ===
                  "private"
                ? "Приватний"
                : "За заявкою"}
            </strong>
          </div>
        </div>
      </section>

      <ActiveModules
        space={
          space
        }
      />
    </>
  );
}

/* =========================================================
   DETAIL PAGE
========================================================= */

function SpaceDetail({
  space,
  onBack,
  onNavigate,
  onEdit,
  onUpdate,
  onDelete,
}) {
  const [
    tab,
    setTab,
  ] = useState(
    "overview"
  );

  const template =
    templateForSpace(
      space
    );

  const tabs = [
    {
      id:
        "overview",
      title:
        "Головна",
    },

    {
      id:
        "modules",
      title:
        "Модулі",
    },

    {
      id:
        "members",
      title:
        "Учасники",
    },

    {
      id:
        "events",
      title:
        "Події",
    },

    ...(space.type ===
    "school"
      ? [
          {
            id:
              "school",
            title:
              "Школа",
          },
        ]
      : []),

    {
      id:
        "permissions",
      title:
        "Права",
    },

    {
      id:
        "admin",
      title:
        "Адмін",
    },
  ];

  function openCommunityChat() {
    sessionStorage.setItem(
      "yatut-open-chat-id",
      `community-${space.id}`
    );

    sessionStorage.setItem(
      "yatut-open-chat-payload",
      JSON.stringify({
        id:
          `community-${space.id}`,

        type:
          "group",

        title:
          space.title,

        initials:
          template.icon,

        members:
          space.members,

        admins: [
          "me",
        ],

        communityId:
          space.id,

        communityName:
          space.title,

        lastMessage:
          "Чат спільноти",

        updatedAt:
          Date.now(),
      })
    );

    onNavigate?.(
      "chats"
    );
  }

  function shareSpace() {
    const url =
      `${window.location.origin}${window.location.pathname}#space=${encodeURIComponent(
        space.id
      )}`;

    navigator.clipboard
      ?.writeText(
        url
      )
      .then(
        () => {
          window.alert(
            "Посилання скопійовано"
          );
        }
      )
      .catch(
        () => {}
      );
  }

  return (
    <section className="space-detail-page">
      <button
        type="button"
        className="space-detail-back"
        onClick={
          onBack
        }
      >
        ← До спільнот
      </button>

      <div
        className="space-detail-cover"
        style={
          space.cover
            ? {
                backgroundImage:
                  `url("${space.cover}")`,
              }
            : {
                background:
                  "linear-gradient(135deg,#7c3aed,#a855f7)",
              }
        }
      />

      <header className="space-detail-header">
        <div className="space-detail-avatar">
          {space.avatar ? (
            <img
              src={
                space.avatar
              }
              alt=""
            />
          ) : (
            template.icon
          )}
        </div>

        <div>
          <span>
            {
              template.title
            }
          </span>

          <h1>
            {
              space.title
            }
          </h1>

          <p>
            @
            {
              space.username
            }
          </p>

          <div className="space-detail-meta">
            <span>
              👥{" "}
              {
                space.members
                  .length
              }
            </span>

            <span>
              📍{" "}
              {
                space.city
              }
            </span>

            <span>
              🧩{" "}
              {
                space.modules
                  .length
              }{" "}
              модулів
            </span>
          </div>

          <div className="community-detail-actions">
            <button
              type="button"
              className="community-chat-main"
              onClick={
                openCommunityChat
              }
            >
              💬 Повідомлення
            </button>

            <button
              type="button"
              className="community-share-main"
              onClick={
                shareSpace
              }
            >
              ↗
            </button>

            <button
              type="button"
              className="community-owner-badge"
              onClick={
                onEdit
              }
            >
              ✏️ Редагувати
            </button>
          </div>
        </div>

        <span className="space-detail-owner">
          👑 Власник
        </span>
      </header>

      <nav className="space-detail-nav">
        {tabs.map(
          (
            item
          ) => (
            <button
              key={
                item.id
              }
              type="button"
              className={
                tab ===
                item.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab(
                  item.id
                )
              }
            >
              {
                item.title
              }
            </button>
          )
        )}
      </nav>

      {tab ===
        "events" ? (
        <CommunityEventsSection
          community={{
            id:
              space.id,

            name:
              space.title,

            title:
              space.title,

            avatar:
              space.avatar,

            cover:
              space.cover,

            username:
              space.username,
          }}
          onNavigate={
            onNavigate
          }
        />
      ) : tab ===
        "permissions" ? (
        <PermissionsEngine
          space={
            space
          }
          onChange={
            onUpdate
          }
        />
      ) : (
        <div className="space-detail-layout">
          <main>
            {tab ===
              "overview" && (
              <Overview
                space={
                  space
                }
              />
            )}

            {tab ===
              "modules" && (
              <ActiveModules
                space={
                  space
                }
              />
            )}

            {tab ===
              "members" && (
              <MembersView
                space={
                  space
                }
              />
            )}

            {tab ===
              "school" && (
              <SchoolModule
                space={
                  space
                }
                onNavigate={
                  onNavigate
                }
              />
            )}

            {tab ===
              "admin" && (
              <section className="space-info-card">
                <div className="space-detail-section-head">
                  <div>
                    <span>
                      ADMIN MODE
                    </span>

                    <h2>
                      Повний редактор
                    </h2>
                  </div>

                  <strong>
                    ⚙️
                  </strong>
                </div>

                <p>
                  Після створення можна змінити назву, опис, тип, масштаб, оформлення, модулі та доступ.
                </p>

                <div className="space-live-modules">
                  <button
                    type="button"
                    onClick={
                      onEdit
                    }
                  >
                    <span>
                      ✏️
                    </span>

                    <strong>
                      Редагувати
                    </strong>

                    <small>
                      Усі дані
                    </small>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTab(
                        "permissions"
                      )
                    }
                  >
                    <span>
                      🛡️
                    </span>

                    <strong>
                      Ролі
                    </strong>

                    <small>
                      Права доступу
                    </small>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTab(
                        "modules"
                      )
                    }
                  >
                    <span>
                      🧩
                    </span>

                    <strong>
                      Модулі
                    </strong>

                    <small>
                      Активні функції
                    </small>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTab(
                        "events"
                      )
                    }
                  >
                    <span>
                      🎉
                    </span>

                    <strong>
                      Події
                    </strong>

                    <small>
                      Події спільноти
                    </small>
                  </button>
                </div>

                <button
                  type="button"
                  className="space-admin-danger"
                  onClick={
                    onDelete
                  }
                >
                  Видалити простір
                </button>
              </section>
            )}
          </main>

          <aside>
            <section className="space-info-card">
              <span className="space-card-type">
                ПРОСТІР
              </span>

              <h2>
                {
                  space.title
                }
              </h2>

              <p>
                {space.description ||
                  "Простір ЯТУТ."}
              </p>
            </section>

            <section className="space-info-card">
              <span className="space-card-type">
                ШВИДКІ ДІЇ
              </span>

              <div className="space-live-modules">
                <button
                  type="button"
                  onClick={
                    openCommunityChat
                  }
                >
                  <span>
                    💬
                  </span>

                  <strong>
                    Чат
                  </strong>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTab(
                      "events"
                    )
                  }
                >
                  <span>
                    🎉
                  </span>

                  <strong>
                    Події
                  </strong>
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

function Spaces({
  onNavigate,
}) {
  const [
    spaces,
    setSpaces,
  ] = useState(
    () =>
      loadSpaces()
  );

  const [
    activeSpaceId,
    setActiveSpaceId,
  ] = useState(
    null
  );

  const [
    engineOpen,
    setEngineOpen,
  ] = useState(
    false
  );

  const [
    editingSpace,
    setEditingSpace,
  ] = useState(
    null
  );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState(
    "all"
  );

  useEffect(() => {
    saveSpaces(
      spaces
    );
  }, [
    spaces,
  ]);

  const activeSpace =
    spaces.find(
      (
        space
      ) =>
        space.id ===
        activeSpaceId
    ) ||
    null;

  const visibleSpaces =
    useMemo(() => {
      const clean =
        query
          .trim()
          .toLowerCase();

      return spaces.filter(
        (
          space
        ) => {
          const matchesSearch =
            !clean ||
            [
              space.title,
              space.username,
              space.description,
              space.city,
            ]
              .filter(
                Boolean
              )
              .join(
                " "
              )
              .toLowerCase()
              .includes(
                clean
              );

          const matchesType =
            typeFilter ===
              "all" ||
            space.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );
    }, [
      spaces,
      query,
      typeFilter,
    ]);

  function openCreate() {
    setEditingSpace(
      null
    );

    setEngineOpen(
      true
    );
  }

  function openEdit(
    space
  ) {
    setEditingSpace(
      space
    );

    setEngineOpen(
      true
    );
  }

  function saveSpace(
    nextSpace
  ) {
    setSpaces(
      (
        previous
      ) => {
        const exists =
          previous.some(
            (
              space
            ) =>
              space.id ===
              nextSpace.id
          );

        if (
          exists
        ) {
          return previous.map(
            (
              space
            ) =>
              space.id ===
              nextSpace.id
                ? nextSpace
                : space
          );
        }

        return [
          nextSpace,
          ...previous,
        ];
      }
    );

    setEngineOpen(
      false
    );

    setEditingSpace(
      null
    );

    setActiveSpaceId(
      nextSpace.id
    );
  }

  function updateSpace(
    nextSpace
  ) {
    setSpaces(
      (
        previous
      ) =>
        previous.map(
          (
            space
          ) =>
            space.id ===
            nextSpace.id
              ? nextSpace
              : space
        )
    );
  }

  function deleteSpace(
    space
  ) {
    const confirmed =
      window.confirm(
        `Видалити простір «${space.title}»?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setSpaces(
      (
        previous
      ) =>
        previous.filter(
          (
            item
          ) =>
            item.id !==
            space.id
        )
    );

    setActiveSpaceId(
      null
    );
  }

  if (
    activeSpace
  ) {
    return (
      <>
        <SpaceDetail
          space={
            activeSpace
          }
          onBack={() =>
            setActiveSpaceId(
              null
            )
          }
          onNavigate={
            onNavigate
          }
          onEdit={() =>
            openEdit(
              activeSpace
            )
          }
          onUpdate={
            updateSpace
          }
          onDelete={() =>
            deleteSpace(
              activeSpace
            )
          }
        />

        {engineOpen && (
          <SpaceEngine
            initialSpace={
              editingSpace
            }
            onClose={() => {
              setEngineOpen(
                false
              );

              setEditingSpace(
                null
              );
            }}
            onSave={
              saveSpace
            }
          />
        )}
      </>
    );
  }

  return (
    <>
      <section className="spaces-page">
        <section className="spaces-hero">
          <div>
            <span>
              ЯТУТ СПІЛЬНОТИ
            </span>

            <h1>
              Люди обʼєднуються тут
            </h1>

            <p>
              Створюйте спільноти для школи, роботи, міста, будинку, команди, бізнесу або будь-якої групи людей.
            </p>

            <button
              type="button"
              onClick={
                openCreate
              }
            >
              + Створити простір
            </button>
          </div>

          <div className="spaces-hero-art">
            <div>
              Я
            </div>

            <span>
              👥
            </span>

            <b>
              ✨
            </b>
          </div>
        </section>

        <div className="spaces-controls">
          <label>
            <span>
              🔎
            </span>

            <input
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event
                    .target
                    .value
                )
              }
              placeholder="Знайти спільноту"
            />
          </label>

          <select
            value={
              typeFilter
            }
            onChange={(
              event
            ) =>
              setTypeFilter(
                event
                  .target
                  .value
              )
            }
          >
            <option value="all">
              Усі типи
            </option>

            <option value="public">
              Публічні
            </option>

            <option value="school">
              Школи
            </option>

            <option value="work">
              Робота
            </option>

            <option value="building">
              ОСББ
            </option>

            <option value="city">
              Міста
            </option>
          </select>
        </div>

        <div className="spaces-title">
          <div>
            <span>
              ВАШІ ПРОСТОРИ
            </span>

            <h2>
              Спільноти
            </h2>
          </div>

          <strong>
            {
              visibleSpaces.length
            }
          </strong>
        </div>

        {visibleSpaces.length >
        0 ? (
          <div className="spaces-grid">
            {visibleSpaces.map(
              (
                space
              ) => (
                <SpaceCard
                  key={
                    space.id
                  }
                  space={
                    space
                  }
                  onOpen={
                    setActiveSpaceId
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="spaces-empty">
            <span>
              👥
            </span>

            <h3>
              {spaces.length >
              0
                ? "Нічого не знайдено"
                : "Створіть свій перший простір"}
            </h3>

            <p>
              {spaces.length >
              0
                ? "Спробуйте змінити пошук або фільтр."
                : "Школа, робота, клуб, ОСББ, команда чи власна спільнота — все може жити всередині ЯТУТ."}
            </p>

            {spaces.length ===
              0 && (
              <button
                type="button"
                onClick={
                  openCreate
                }
              >
                + Створити
              </button>
            )}
          </div>
        )}
      </section>

      {engineOpen && (
        <SpaceEngine
          initialSpace={
            editingSpace
          }
          onClose={() => {
            setEngineOpen(
              false
            );

            setEditingSpace(
              null
            );
          }}
          onSave={
            saveSpace
          }
        />
      )}
    </>
  );
}

export default Spaces;