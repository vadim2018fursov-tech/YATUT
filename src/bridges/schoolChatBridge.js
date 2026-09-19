import {
  getChat,
  getMessages,
  saveChat,
  saveMessage,
} from "../storage/database";

/* =========================================================
   HELPERS
========================================================= */

function initials(
  name = ""
) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase() ||
          ""
      )
      .join("") ||
    "?"
  );
}

function personName(
  person
) {
  if (!person) {
    return "Учасник";
  }

  return (
    `${person.name || ""} ${
      person.surname || ""
    }`.trim() ||
    "Учасник"
  );
}

function profileFromPerson(
  person,
  role
) {
  const name =
    personName(
      person
    );

  return {
    id:
      person.id,

    name,

    username:
      person.username ||
      person.email ||
      "",

    initials:
      initials(
        name
      ),

    role,

    online:
      false,
  };
}

function unique(
  values
) {
  return Array.from(
    new Set(
      values.filter(
        Boolean
      )
    )
  );
}

/* =========================================================
   SCHOOL PROFILES
========================================================= */

function schoolProfiles(
  school
) {
  const profiles = {
    me: {
      id: "me",

      name:
        "Вадим",

      username:
        "vadim",

      initials:
        "В",

      role:
        "admin",

      online:
        true,
    },
  };

  (
    school.teachers ||
    []
  ).forEach(
    (
      person
    ) => {
      profiles[
        person.id
      ] =
        profileFromPerson(
          person,
          "teacher"
        );
    }
  );

  (
    school.students ||
    []
  ).forEach(
    (
      person
    ) => {
      profiles[
        person.id
      ] =
        profileFromPerson(
          person,
          "student"
        );
    }
  );

  (
    school.parents ||
    []
  ).forEach(
    (
      person
    ) => {
      profiles[
        person.id
      ] =
        profileFromPerson(
          person,
          "parent"
        );
    }
  );

  return profiles;
}

/* =========================================================
   SCHOOL MEMBERS
========================================================= */

function classStudents(
  school,
  classId
) {
  return (
    school.students ||
    []
  ).filter(
    (
      student
    ) =>
      student.classId ===
      classId
  );
}

function classTeachers(
  school,
  classId,
  subjectId = null
) {
  return (
    school.teachers ||
    []
  ).filter(
    (
      teacher
    ) => {
      const classMatch =
        teacher.classIds?.includes(
          classId
        );

      const subjectMatch =
        subjectId
          ? teacher.subjectIds?.includes(
              subjectId
            )
          : true;

      return (
        classMatch &&
        subjectMatch
      );
    }
  );
}

function classParents(
  school,
  classId
) {
  const studentIds =
    new Set(
      classStudents(
        school,
        classId
      ).map(
        (
          student
        ) =>
          student.id
      )
    );

  return (
    school.parents ||
    []
  ).filter(
    (
      parent
    ) =>
      (
        parent.childIds ||
        []
      ).some(
        (
          childId
        ) =>
          studentIds.has(
            childId
          )
      )
  );
}

/* =========================================================
   BUILD SCHOOL CHAT
========================================================= */

export function buildSchoolChat({
  space,
  school,
  type,
  classId = null,
  subjectId = null,
}) {
  const classItem =
    (
      school.classes ||
      []
    ).find(
      (
        item
      ) =>
        item.id ===
        classId
    );

  const subject =
    (
      school.subjects ||
      []
    ).find(
      (
        item
      ) =>
        item.id ===
        subjectId
    );

  const schoolTitle =
    space.title ||
    "Школа";

  const profiles =
    schoolProfiles(
      school
    );

  let id;

  let title;

  let members = [
    "me",
  ];

  /* =======================================================
     SCHOOL MAIN CHAT
  ======================================================= */

  if (
    type ===
    "school"
  ) {
    id =
      `school-${space.id}-main`;

    title =
      `🏫 ${schoolTitle}`;

    members =
      unique([
        "me",

        ...(
          school.teachers ||
          []
        ).map(
          (
            item
          ) =>
            item.id
        ),

        ...(
          school.students ||
          []
        ).map(
          (
            item
          ) =>
            item.id
        ),

        ...(
          school.parents ||
          []
        ).map(
          (
            item
          ) =>
            item.id
        ),
      ]);
  }

  /* =======================================================
     CLASS CHAT
  ======================================================= */

  else if (
    type ===
    "class"
  ) {
    id =
      `school-${space.id}-class-${classId}`;

    title =
      `🎓 ${
        classItem?.title ||
        "Клас"
      }`;

    members =
      unique([
        "me",

        ...classStudents(
          school,
          classId
        ).map(
          (
            item
          ) =>
            item.id
        ),

        ...classTeachers(
          school,
          classId
        ).map(
          (
            item
          ) =>
            item.id
        ),
      ]);
  }

  /* =======================================================
     PARENTS CHAT
  ======================================================= */

  else if (
    type ===
    "parents"
  ) {
    id =
      `school-${space.id}-parents-${classId}`;

    title =
      `👨‍👩‍👧 Батьки ${
        classItem?.title ||
        "класу"
      }`;

    members =
      unique([
        "me",

        ...classParents(
          school,
          classId
        ).map(
          (
            item
          ) =>
            item.id
        ),

        ...classTeachers(
          school,
          classId
        ).map(
          (
            item
          ) =>
            item.id
        ),
      ]);
  }

  /* =======================================================
     SUBJECT CHAT
  ======================================================= */

  else if (
    type ===
    "subject"
  ) {
    id =
      `school-${space.id}-subject-${classId}-${subjectId}`;

    title =
      `📚 ${
        subject?.title ||
        "Предмет"
      } • ${
        classItem?.title ||
        "Клас"
      }`;

    members =
      unique([
        "me",

        ...classStudents(
          school,
          classId
        ).map(
          (
            item
          ) =>
            item.id
        ),

        ...classTeachers(
          school,
          classId,
          subjectId
        ).map(
          (
            item
          ) =>
            item.id
        ),
      ]);
  }

  else {
    throw new Error(
      `Unknown school chat type: ${type}`
    );
  }

  return {
    id,

    type:
      "group",

    title,

    initials:
      type ===
      "school"
        ? "🏫"
        : type ===
          "parents"
        ? "Б"
        : type ===
          "subject"
        ? subject?.icon ||
          "📚"
        : classItem
            ?.title
            ?.slice(
              0,
              2
            )
            ?.toUpperCase() ||
          "К",

    members,

    memberProfiles:
      profiles,

    admins: [
      "me",
    ],

    educationSpaceId:
      space.id,

    schoolId:
      space.id,

    schoolTitle,

    schoolChatType:
      type,

    classId:
      classId ||
      null,

    classTitle:
      classItem?.title ||
      null,

    subjectId:
      subjectId ||
      null,

    subjectTitle:
      subject?.title ||
      null,

    unread:
      0,

    lastMessage:
      "Чат навчального простору",

    updatedAt:
      Date.now(),

    createdAt:
      Date.now(),
  };
}

/* =========================================================
   ENSURE SCHOOL CHAT
========================================================= */

export async function ensureSchoolChat(
  options
) {
  const payload =
    buildSchoolChat(
      options
    );

  const existing =
    await getChat(
      payload.id
    );

  const chat =
    existing
      ? {
          ...existing,

          ...payload,

          createdAt:
            existing.createdAt ||
            payload.createdAt,

          lastMessage:
            existing.lastMessage ||
            payload.lastMessage,

          updatedAt:
            existing.updatedAt ||
            payload.updatedAt,
        }
      : payload;

  await saveChat(
    chat
  );

  const messages =
    await getMessages(
      chat.id
    );

  if (
    !messages.length
  ) {
    await saveMessage({
      id:
        `school-welcome-${chat.id}`,

      chatId:
        chat.id,

      senderId:
        "me",

      type:
        "text",

      text:
        chat.schoolChatType ===
        "school"
          ? `Ласкаво просимо до чату «${chat.schoolTitle}» 👋`
          : chat.schoolChatType ===
            "class"
          ? `Чат класу ${chat.classTitle} створено 👋`
          : chat.schoolChatType ===
            "parents"
          ? `Батьківський чат ${chat.classTitle} створено 👋`
          : `Чат предмету ${chat.subjectTitle} • ${chat.classTitle} створено 👋`,

      createdAt:
        Date.now(),

      system:
        true,

      pinned:
        false,
    });
  }

  return chat;
}

/* =========================================================
   OPEN SCHOOL CHAT
========================================================= */

export async function openSchoolChat({
  space,
  school,
  type,
  classId = null,
  subjectId = null,
  onNavigate,
}) {
  const chat =
    await ensureSchoolChat({
      space,
      school,
      type,
      classId,
      subjectId,
    });

  sessionStorage.setItem(
    "yatut-open-chat-id",
    chat.id
  );

  sessionStorage.setItem(
    "yatut-open-chat-payload",
    JSON.stringify(
      chat
    )
  );

  if (
    typeof onNavigate ===
    "function"
  ) {
    onNavigate(
      "chats"
    );
  }

  return chat;
}