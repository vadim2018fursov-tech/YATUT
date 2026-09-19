import {
  getChat,
  saveChat,
  saveMessage,
} from "../storage/database";

/* =========================================================
   YATUT SCHOOL CHAT BRIDGE V1
   School Engine -> Main Messenger
========================================================= */

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function createMessageId() {
  return `school-message-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function safeSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================
   MEMBER HELPERS
========================================================= */

function getSchoolMembers(school) {
  return unique([
    "me",

    ...school.teachers.map(
      (teacher) =>
        teacher.userId ||
        teacher.id
    ),

    ...school.students.map(
      (student) =>
        student.userId ||
        student.id
    ),

    ...school.parents.map(
      (parent) =>
        parent.userId ||
        parent.id
    ),
  ]);
}

function getClassStudents(
  school,
  classId
) {
  return school.students.filter(
    (student) =>
      student.classId ===
      classId
  );
}

function getClassTeachers(
  school,
  classId
) {
  return school.teachers.filter(
    (teacher) =>
      teacher.classIds?.includes(
        classId
      )
  );
}

function getClassParents(
  school,
  classId
) {
  const studentIds =
    getClassStudents(
      school,
      classId
    ).map(
      (student) =>
        student.id
    );

  return school.parents.filter(
    (parent) =>
      parent.childIds?.some(
        (childId) =>
          studentIds.includes(
            childId
          )
      )
  );
}

function getClassMembers(
  school,
  classId
) {
  return unique([
    "me",

    ...getClassStudents(
      school,
      classId
    ).map(
      (student) =>
        student.userId ||
        student.id
    ),

    ...getClassTeachers(
      school,
      classId
    ).map(
      (teacher) =>
        teacher.userId ||
        teacher.id
    ),
  ]);
}

function getParentChatMembers(
  school,
  classId
) {
  const classItem =
    school.classes.find(
      (item) =>
        item.id ===
        classId
    );

  const classTeacher =
    school.teachers.find(
      (teacher) =>
        teacher.id ===
        classItem?.classTeacherId
    );

  return unique([
    "me",

    classTeacher?.userId ||
      classTeacher?.id,

    ...getClassParents(
      school,
      classId
    ).map(
      (parent) =>
        parent.userId ||
        parent.id
    ),
  ]);
}

function getSubjectMembers(
  school,
  classId,
  subjectId
) {
  const students =
    getClassStudents(
      school,
      classId
    );

  const teachers =
    school.teachers.filter(
      (teacher) =>
        teacher.subjectIds?.includes(
          subjectId
        ) &&
        teacher.classIds?.includes(
          classId
        )
    );

  return unique([
    "me",

    ...students.map(
      (student) =>
        student.userId ||
        student.id
    ),

    ...teachers.map(
      (teacher) =>
        teacher.userId ||
        teacher.id
    ),
  ]);
}

/* =========================================================
   CHAT IDS
========================================================= */

export function getSchoolChatId(
  spaceId
) {
  return `school-chat-${spaceId}`;
}

export function getClassChatId(
  spaceId,
  classId
) {
  return `school-class-chat-${spaceId}-${classId}`;
}

export function getParentChatId(
  spaceId,
  classId
) {
  return `school-parent-chat-${spaceId}-${classId}`;
}

export function getSubjectChatId(
  spaceId,
  classId,
  subjectId
) {
  return `school-subject-chat-${spaceId}-${classId}-${subjectId}`;
}

/* =========================================================
   CREATE / GET CHAT
========================================================= */

async function ensureChat({
  id,

  title,

  initials,

  members,

  admins = ["me"],

  spaceId,

  schoolId,

  schoolChatType,

  classId = null,

  subjectId = null,

  icon = "💬",

  welcomeText,
}) {
  let chat =
    await getChat(id);

  if (chat) {
    /*
      Обновляем участников и название,
      потому что состав класса может меняться.
    */

    chat = {
      ...chat,

      title,

      initials,

      members:
        unique(members),

      admins:
        unique(
          chat.admins?.length
            ? chat.admins
            : admins
        ),

      spaceId,

      schoolId,

      schoolChatType,

      classId,

      subjectId,

      schoolChat: true,

      icon,

      updatedAt:
        chat.updatedAt ||
        Date.now(),
    };

    await saveChat(chat);

    return chat;
  }

  const now =
    Date.now();

  chat = {
    id,

    type: "group",

    title,

    initials:
      initials ||
      title?.[0]?.toUpperCase() ||
      "Ш",

    icon,

    members:
      unique(members),

    admins:
      unique(admins),

    spaceId,

    schoolId,

    schoolChat: true,

    schoolChatType,

    classId,

    subjectId,

    unread: 0,

    lastMessage:
      welcomeText ||
      "Шкільний чат створено",

    createdAt: now,

    updatedAt: now,
  };

  await saveChat(chat);

  await saveMessage({
    id:
      createMessageId(),

    chatId:
      chat.id,

    senderId:
      "me",

    type:
      "text",

    text:
      welcomeText ||
      `Створено чат «${title}» 👋`,

    system: true,

    pinned: false,

    createdAt:
      Date.now(),
  });

  return chat;
}

/* =========================================================
   SCHOOL CHAT
========================================================= */

export async function ensureSchoolChat({
  space,
  school,
}) {
  const schoolName =
    space.title ||
    "Школа";

  return ensureChat({
    id:
      getSchoolChatId(
        space.id
      ),

    title:
      `🏫 ${schoolName}`,

    initials: "Ш",

    members:
      getSchoolMembers(
        school
      ),

    admins: ["me"],

    spaceId:
      space.id,

    schoolId:
      space.id,

    schoolChatType:
      "school",

    icon: "🏫",

    welcomeText:
      `Вітаємо у загальному чаті «${schoolName}» 🏫`,
  });
}

/* =========================================================
   CLASS CHAT
========================================================= */

export async function ensureClassChat({
  space,
  school,
  classId,
}) {
  const classItem =
    school.classes.find(
      (item) =>
        item.id ===
        classId
    );

  if (!classItem) {
    throw new Error(
      "Клас не знайдено"
    );
  }

  const classTeacher =
    school.teachers.find(
      (teacher) =>
        teacher.id ===
        classItem.classTeacherId
    );

  return ensureChat({
    id:
      getClassChatId(
        space.id,
        classId
      ),

    title:
      `🎓 ${classItem.title}`,

    initials:
      classItem.title
        ?.slice(0, 2)
        .toUpperCase(),

    members:
      getClassMembers(
        school,
        classId
      ),

    admins:
      unique([
        "me",

        classTeacher?.userId ||
          classTeacher?.id,
      ]),

    spaceId:
      space.id,

    schoolId:
      space.id,

    schoolChatType:
      "class",

    classId,

    icon: "🎓",

    welcomeText:
      `Створено чат класу ${classItem.title} 🎓`,
  });
}

/* =========================================================
   PARENT CHAT
========================================================= */

export async function ensureParentChat({
  space,
  school,
  classId,
}) {
  const classItem =
    school.classes.find(
      (item) =>
        item.id ===
        classId
    );

  if (!classItem) {
    throw new Error(
      "Клас не знайдено"
    );
  }

  const classTeacher =
    school.teachers.find(
      (teacher) =>
        teacher.id ===
        classItem.classTeacherId
    );

  return ensureChat({
    id:
      getParentChatId(
        space.id,
        classId
      ),

    title:
      `👨‍👩‍👧 Батьки ${classItem.title}`,

    initials: "Б",

    members:
      getParentChatMembers(
        school,
        classId
      ),

    admins:
      unique([
        "me",

        classTeacher?.userId ||
          classTeacher?.id,
      ]),

    spaceId:
      space.id,

    schoolId:
      space.id,

    schoolChatType:
      "parents",

    classId,

    icon:
      "👨‍👩‍👧",

    welcomeText:
      `Створено батьківський чат класу ${classItem.title} 👨‍👩‍👧`,
  });
}

/* =========================================================
   SUBJECT CHAT
========================================================= */

export async function ensureSubjectChat({
  space,
  school,
  classId,
  subjectId,
}) {
  const classItem =
    school.classes.find(
      (item) =>
        item.id ===
        classId
    );

  const subject =
    school.subjects.find(
      (item) =>
        item.id ===
        subjectId
    );

  if (!classItem) {
    throw new Error(
      "Клас не знайдено"
    );
  }

  if (!subject) {
    throw new Error(
      "Предмет не знайдено"
    );
  }

  const subjectTeachers =
    school.teachers.filter(
      (teacher) =>
        teacher.subjectIds?.includes(
          subjectId
        ) &&
        teacher.classIds?.includes(
          classId
        )
    );

  return ensureChat({
    id:
      getSubjectChatId(
        space.id,
        classId,
        subjectId
      ),

    title:
      `${subject.icon || "📚"} ${subject.title} • ${classItem.title}`,

    initials:
      subject.title
        ?.slice(0, 1)
        .toUpperCase(),

    members:
      getSubjectMembers(
        school,
        classId,
        subjectId
      ),

    admins:
      unique([
        "me",

        ...subjectTeachers.map(
          (teacher) =>
            teacher.userId ||
            teacher.id
        ),
      ]),

    spaceId:
      space.id,

    schoolId:
      space.id,

    schoolChatType:
      "subject",

    classId,

    subjectId,

    icon:
      subject.icon ||
      "📚",

    welcomeText:
      `Створено чат предмету «${subject.title}» для ${classItem.title} 📚`,
  });
}

/* =========================================================
   OPEN MAIN MESSENGER
========================================================= */

export function openChatInMessenger({
  chatId,
  onNavigate,
}) {
  if (!chatId) {
    return;
  }

  sessionStorage.setItem(
    "yatut-open-chat-id",
    chatId
  );

  onNavigate?.(
    "chats"
  );
}

/* =========================================================
   CREATE + OPEN
========================================================= */

export async function openSchoolChat({
  space,
  school,
  onNavigate,
}) {
  const chat =
    await ensureSchoolChat({
      space,
      school,
    });

  openChatInMessenger({
    chatId:
      chat.id,

    onNavigate,
  });

  return chat;
}

export async function openClassChat({
  space,
  school,
  classId,
  onNavigate,
}) {
  const chat =
    await ensureClassChat({
      space,
      school,
      classId,
    });

  openChatInMessenger({
    chatId:
      chat.id,

    onNavigate,
  });

  return chat;
}

export async function openParentChat({
  space,
  school,
  classId,
  onNavigate,
}) {
  const chat =
    await ensureParentChat({
      space,
      school,
      classId,
    });

  openChatInMessenger({
    chatId:
      chat.id,

    onNavigate,
  });

  return chat;
}

export async function openSubjectChat({
  space,
  school,
  classId,
  subjectId,
  onNavigate,
}) {
  const chat =
    await ensureSubjectChat({
      space,
      school,
      classId,
      subjectId,
    });

  openChatInMessenger({
    chatId:
      chat.id,

    onNavigate,
  });

  return chat;
}