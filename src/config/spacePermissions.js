/* =========================================================
   YATUT ROLES & PERMISSIONS ENGINE V1
========================================================= */

/* =========================================================
   PERMISSION CATALOG
========================================================= */

export const PERMISSIONS = {
  view_space: {
    id: "view_space",
    title: "Перегляд простору",
    group: "Основне",
  },

  manage_space: {
    id: "manage_space",
    title: "Керування простором",
    group: "Керування",
  },

  manage_settings: {
    id: "manage_settings",
    title: "Налаштування",
    group: "Керування",
  },

  manage_modules: {
    id: "manage_modules",
    title: "Керування модулями",
    group: "Керування",
  },

  manage_roles: {
    id: "manage_roles",
    title: "Керування ролями",
    group: "Керування",
  },

  manage_members: {
    id: "manage_members",
    title: "Керування учасниками",
    group: "Керування",
  },

  invite_members: {
    id: "invite_members",
    title: "Запрошення учасників",
    group: "Керування",
  },

  create_post: {
    id: "create_post",
    title: "Створення дописів",
    group: "Контент",
  },

  edit_any_post: {
    id: "edit_any_post",
    title: "Редагування чужих дописів",
    group: "Контент",
  },

  delete_any_post: {
    id: "delete_any_post",
    title: "Видалення дописів",
    group: "Контент",
  },

  comment: {
    id: "comment",
    title: "Коментарі",
    group: "Контент",
  },

  moderate_comments: {
    id: "moderate_comments",
    title: "Модерація коментарів",
    group: "Модерація",
  },

  create_event: {
    id: "create_event",
    title: "Створення подій",
    group: "Події",
  },

  manage_events: {
    id: "manage_events",
    title: "Керування подіями",
    group: "Події",
  },

  use_chat: {
    id: "use_chat",
    title: "Доступ до чатів",
    group: "Спілкування",
  },

  manage_chat: {
    id: "manage_chat",
    title: "Керування чатами",
    group: "Спілкування",
  },

  start_call: {
    id: "start_call",
    title: "Дзвінки",
    group: "Спілкування",
  },

  start_conference: {
    id: "start_conference",
    title: "Конференції",
    group: "Спілкування",
  },

  upload_documents: {
    id: "upload_documents",
    title: "Завантаження документів",
    group: "Документи",
  },

  manage_documents: {
    id: "manage_documents",
    title: "Керування документами",
    group: "Документи",
  },

  view_analytics: {
    id: "view_analytics",
    title: "Перегляд аналітики",
    group: "Аналітика",
  },

  view_sensitive_data: {
    id: "view_sensitive_data",
    title: "Перегляд чутливих даних",
    group: "Безпека",
    sensitive: true,
  },

  manage_sensitive_data: {
    id: "manage_sensitive_data",
    title: "Керування чутливими даними",
    group: "Безпека",
    sensitive: true,
  },

  /* EDUCATION */

  manage_classes: {
    id: "manage_classes",
    title: "Керування класами / групами",
    group: "Навчання",
  },

  manage_subjects: {
    id: "manage_subjects",
    title: "Керування предметами",
    group: "Навчання",
  },

  create_lesson: {
    id: "create_lesson",
    title: "Створення уроків",
    group: "Навчання",
  },

  assign_homework: {
    id: "assign_homework",
    title: "Домашні завдання",
    group: "Навчання",
  },

  set_grade: {
    id: "set_grade",
    title: "Виставлення оцінок",
    group: "Навчання",
  },

  view_own_grades: {
    id: "view_own_grades",
    title: "Перегляд власних оцінок",
    group: "Навчання",
  },

  view_child_grades: {
    id: "view_child_grades",
    title: "Оцінки своєї дитини",
    group: "Навчання",
  },

  manage_attendance: {
    id: "manage_attendance",
    title: "Відвідування",
    group: "Навчання",
  },

  view_child_attendance: {
    id: "view_child_attendance",
    title: "Відвідування своєї дитини",
    group: "Навчання",
  },

  manage_schedule: {
    id: "manage_schedule",
    title: "Керування розкладом",
    group: "Навчання",
  },

  /* WORK */

  create_task: {
    id: "create_task",
    title: "Створення задач",
    group: "Робота",
  },

  assign_task: {
    id: "assign_task",
    title: "Призначення задач",
    group: "Робота",
  },

  manage_projects: {
    id: "manage_projects",
    title: "Керування проєктами",
    group: "Робота",
  },

  manage_meetings: {
    id: "manage_meetings",
    title: "Керування зустрічами",
    group: "Робота",
  },

  manage_shifts: {
    id: "manage_shifts",
    title: "Керування графіками",
    group: "Робота",
  },

  /* PUBLIC */

  publish_as_space: {
    id: "publish_as_space",
    title: "Публікація від імені сторінки",
    group: "Публічна сторінка",
  },

  manage_live: {
    id: "manage_live",
    title: "Прямі ефіри",
    group: "Публічна сторінка",
  },

  manage_editorial: {
    id: "manage_editorial",
    title: "Редакційний процес",
    group: "Публічна сторінка",
  },

  schedule_posts: {
    id: "schedule_posts",
    title: "Відкладені публікації",
    group: "Публічна сторінка",
  },

  /* HEALTH */

  manage_appointments: {
    id: "manage_appointments",
    title: "Керування прийомами",
    group: "Медицина",
    sensitive: true,
  },

  view_patient_data: {
    id: "view_patient_data",
    title: "Дані пацієнтів",
    group: "Медицина",
    sensitive: true,
  },

  edit_patient_data: {
    id: "edit_patient_data",
    title: "Редагування даних пацієнтів",
    group: "Медицина",
    sensitive: true,
  },
};

/* =========================================================
   ROLE TITLES
========================================================= */

export const ROLE_TITLES = {
  owner: "Власник",
  admin: "Адміністратор",
  moderator: "Модератор",
  member: "Учасник",

  manager: "Керівник",
  hr: "HR",
  employee: "Працівник",

  director: "Директор",
  class_teacher: "Класний керівник",
  teacher: "Вчитель",
  student: "Учень",
  parent: "Батьки",

  rector: "Ректор",
  dean: "Декан",
  professor: "Викладач",

  representative: "Представник",
  editor: "Редактор",
  editor_in_chief: "Головний редактор",
  content_manager: "Контент-менеджер",
  event_manager: "Менеджер подій",
  analyst: "Аналітик",
  journalist: "Журналіст",

  clinic_admin: "Адміністратор клініки",
  doctor: "Лікар",
  staff: "Працівник",
  patient: "Пацієнт",

  coordinator: "Координатор",
  volunteer: "Волонтер",

  coach: "Тренер",
  athlete: "Спортсмен",

  captain: "Капітан",

  official: "Представник громади",
  resident: "Мешканець",

  artist: "Учасник колективу",

  organizer: "Організатор",
  guide: "Гід",

  lead_researcher: "Керівник дослідження",
  researcher: "Дослідник",
  assistant: "Асистент",
};

/* =========================================================
   BASE ROLES
========================================================= */

const BASE = {
  owner: Object.keys(
    PERMISSIONS
  ),

  admin: [
    "view_space",
    "manage_settings",
    "manage_modules",
    "manage_members",
    "invite_members",

    "create_post",
    "edit_any_post",
    "delete_any_post",
    "comment",

    "moderate_comments",

    "create_event",
    "manage_events",

    "use_chat",
    "manage_chat",
    "start_call",
    "start_conference",

    "upload_documents",
    "manage_documents",

    "view_analytics",
  ],

  moderator: [
    "view_space",
    "comment",
    "moderate_comments",
    "delete_any_post",
    "use_chat",
  ],

  member: [
    "view_space",
    "create_post",
    "comment",
    "use_chat",
    "start_call",
  ],
};

/* =========================================================
   TEMPLATE ROLE PERMISSIONS
========================================================= */

export function buildRolePermissions(
  templateId,
  roles = []
) {
  const result = {};

  roles.forEach(
    (role) => {
      result[role] = [
        ...(BASE[role] ||
          ["view_space"]),
      ];
    }
  );

  /* =======================================================
     OWNER
  ======================================================= */

  if (
    roles.includes(
      "owner"
    )
  ) {
    result.owner =
      Object.keys(
        PERMISSIONS
      );
  }

  /* =======================================================
     EDUCATION
  ======================================================= */

  if (
    [
      "school",
      "kindergarten",
      "university",
      "courses",
    ].includes(
      templateId
    )
  ) {
    if (
      result.director
    ) {
      result.director = [
        "view_space",
        "manage_settings",
        "manage_members",
        "invite_members",

        "manage_classes",
        "manage_subjects",
        "manage_schedule",

        "create_post",
        "delete_any_post",
        "create_event",
        "manage_events",

        "use_chat",
        "manage_chat",
        "start_conference",

        "upload_documents",
        "manage_documents",

        "view_analytics",
      ];
    }

    if (
      result.rector
    ) {
      result.rector = [
        "view_space",
        "manage_settings",
        "manage_members",

        "manage_classes",
        "manage_subjects",
        "manage_schedule",

        "create_post",
        "create_event",
        "manage_events",

        "use_chat",
        "manage_chat",
        "start_conference",

        "upload_documents",
        "manage_documents",

        "view_analytics",
      ];
    }

    if (
      result.dean
    ) {
      result.dean = [
        "view_space",
        "manage_members",
        "manage_classes",
        "manage_subjects",
        "manage_schedule",

        "create_post",
        "create_event",

        "use_chat",
        "start_conference",

        "upload_documents",

        "view_analytics",
      ];
    }

    if (
      result.teacher
    ) {
      result.teacher = [
        "view_space",

        "create_post",
        "comment",

        "create_lesson",
        "assign_homework",
        "set_grade",
        "manage_attendance",

        "create_event",

        "use_chat",
        "start_call",
        "start_conference",

        "upload_documents",
      ];
    }

    if (
      result.class_teacher
    ) {
      result.class_teacher = [
        "view_space",

        "create_post",
        "comment",

        "create_lesson",
        "assign_homework",
        "set_grade",
        "manage_attendance",
        "manage_schedule",

        "create_event",

        "use_chat",
        "start_call",
        "start_conference",

        "upload_documents",
      ];
    }

    if (
      result.student
    ) {
      result.student = [
        "view_space",
        "comment",

        "view_own_grades",

        "use_chat",
      ];
    }

    if (
      result.parent
    ) {
      result.parent = [
        "view_space",

        "comment",

        "view_child_grades",
        "view_child_attendance",

        "use_chat",
      ];
    }
  }

  /* =======================================================
     WORK
  ======================================================= */

  if (
    templateId ===
    "work"
  ) {
    result.manager = [
      "view_space",

      "create_post",
      "comment",

      "create_task",
      "assign_task",

      "manage_projects",
      "manage_meetings",
      "manage_shifts",

      "create_event",

      "use_chat",
      "start_call",
      "start_conference",

      "upload_documents",
    ];

    result.hr = [
      "view_space",

      "manage_members",
      "invite_members",

      "create_post",
      "comment",

      "manage_meetings",
      "manage_shifts",

      "create_event",

      "use_chat",
      "start_call",

      "upload_documents",
    ];

    result.employee = [
      "view_space",

      "create_post",
      "comment",

      "create_task",

      "use_chat",
      "start_call",
      "start_conference",

      "upload_documents",
    ];
  }

  /* =======================================================
     PUBLIC PAGE
  ======================================================= */

  if (
    templateId ===
      "public_page" ||
    templateId ===
      "channel"
  ) {
    if (
      result.representative
    ) {
      result.representative = [
        "view_space",
        "manage_settings",
        "manage_members",

        "create_post",
        "publish_as_space",
        "schedule_posts",

        "create_event",
        "manage_events",

        "manage_live",

        "use_chat",

        "view_analytics",
      ];
    }

    if (
      result.editor
    ) {
      result.editor = [
        "view_space",
        "create_post",
        "publish_as_space",
        "schedule_posts",
        "manage_editorial",
        "upload_documents",
      ];
    }

    if (
      result.content_manager
    ) {
      result.content_manager = [
        "view_space",
        "create_post",
        "publish_as_space",
        "schedule_posts",
        "manage_live",
      ];
    }

    if (
      result.event_manager
    ) {
      result.event_manager = [
        "view_space",
        "create_event",
        "manage_events",
      ];
    }

    if (
      result.analyst
    ) {
      result.analyst = [
        "view_space",
        "view_analytics",
      ];
    }
  }

  /* =======================================================
     HEALTHCARE
  ======================================================= */

  if (
    templateId ===
    "healthcare"
  ) {
    result.clinic_admin = [
      "view_space",

      "manage_members",
      "manage_appointments",

      "view_patient_data",

      "create_post",
      "create_event",

      "use_chat",

      "upload_documents",
      "manage_documents",
    ];

    result.doctor = [
      "view_space",

      "manage_appointments",

      "view_patient_data",
      "edit_patient_data",

      "view_sensitive_data",
      "manage_sensitive_data",

      "use_chat",

      "upload_documents",
      "manage_documents",
    ];

    result.staff = [
      "view_space",
      "manage_appointments",
      "use_chat",
    ];

    result.patient = [
      "view_space",
      "use_chat",
    ];
  }

  return result;
}

/* =========================================================
   CHECK PERMISSION
========================================================= */

export function hasPermission(
  space,
  role,
  permission
) {
  if (
    role === "owner"
  ) {
    return true;
  }

  const permissions =
    space?.rolePermissions?.[
      role
    ] || [];

  return permissions.includes(
    permission
  );
}