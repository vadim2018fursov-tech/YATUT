import { useMemo, useState } from "react";

import "./SchoolEngine.css";

import {
  SchoolTestBuilder,
  SchoolTestPlayer,
} from "./SchoolTestEngine";

import {
  StudentHomeworkSubmission,
  TeacherHomeworkReview,
  HomeworkReviewModal,
} from "./SchoolHomeworkFlow";

import SchoolNotifications from "./SchoolNotifications";

/* =========================================================
   НОВОЕ — ПОДКЛЮЧЕННЫЕ ЧАТЫ
========================================================= */

import SchoolChatsConnected from "./SchoolChatsConnected";

/* =========================================================
   YATUT SCHOOL ENGINE V5
========================================================= */

const DAYS = [
  { id: 1, short: "ПН", title: "Понеділок" },
  { id: 2, short: "ВТ", title: "Вівторок" },
  { id: 3, short: "СР", title: "Середа" },
  { id: 4, short: "ЧТ", title: "Четвер" },
  { id: 5, short: "ПТ", title: "Пʼятниця" },
  { id: 6, short: "СБ", title: "Субота" },
];

const VIEW_ROLES = [
  {
    id: "director",
    icon: "👑",
    title: "Директор",
  },
  {
    id: "teacher",
    icon: "🧑‍🏫",
    title: "Вчитель",
  },
  {
    id: "student",
    icon: "🎓",
    title: "Учень",
  },
  {
    id: "parent",
    icon: "👨‍👩‍👧",
    title: "Батьки",
  },
];

const GRADE_TYPES = [
  {
    id: "regular",
    title: "Звичайна",
    icon: "⭐",
  },
  {
    id: "homework",
    title: "Домашня",
    icon: "📝",
  },
  {
    id: "test",
    title: "Тест",
    icon: "🧠",
  },
  {
    id: "independent",
    title: "Самостійна",
    icon: "📄",
  },
  {
    id: "control",
    title: "Контрольна",
    icon: "📕",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function personName(person) {
  if (!person) {
    return "—";
  }

  return `${person.name || ""} ${person.surname || ""}`.trim();
}

function average(values) {
  if (!values.length) {
    return null;
  }

  return (
    values.reduce((sum, value) => sum + Number(value), 0) /
    values.length
  );
}

function gradeTone(value) {
  const number = Number(value);

  if (number >= 10) {
    return "excellent";
  }

  if (number >= 7) {
    return "good";
  }

  if (number >= 4) {
    return "medium";
  }

  return "bad";
}

function attendanceLabel(status) {
  if (status === "present") {
    return "Присутній";
  }

  if (status === "late") {
    return "Запізнення";
  }

  return "Відсутній";
}

function formatShortDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
  });
}

/* =========================================================
   DATA
========================================================= */

function emptySchoolData() {
  return {
    classes: [],
    teachers: [],
    students: [],
    parents: [],
    subjects: [],

    schedule: [],
    lessons: [],

    homework: [],
    homeworkSubmissions: [],

    grades: [],
    attendance: [],

    tests: [],
    testAttempts: [],

    materials: [],
    announcements: [],

    chatRooms: [],

    notifications: [],
  };
}

function hydrateSchoolData(value) {
  return {
    ...emptySchoolData(),
    ...(value || {}),

    classes: value?.classes || [],
    teachers: value?.teachers || [],
    students: value?.students || [],
    parents: value?.parents || [],
    subjects: value?.subjects || [],

    schedule: value?.schedule || [],
    lessons: value?.lessons || [],

    homework: value?.homework || [],
    homeworkSubmissions: value?.homeworkSubmissions || [],

    grades: value?.grades || [],
    attendance: value?.attendance || [],

    tests: value?.tests || [],
    testAttempts: value?.testAttempts || [],

    materials: value?.materials || [],
    announcements: value?.announcements || [],

    chatRooms: value?.chatRooms || [],

    notifications: value?.notifications || [],
  };
}

/* =========================================================
   GENERIC COMPONENTS
========================================================= */

function SchoolModal({
  title,
  children,
  onClose,
  footer,
}) {
  return (
    <div
      className="school-modal-backdrop"
      onClick={onClose}
    >
      <section
        className="school-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>ЯТУТ SCHOOL</span>

            <h3>{title}</h3>
          </div>

          <button onClick={onClose}>
            ×
          </button>
        </header>

        <div className="school-modal-body">
          {children}
        </div>

        {footer && <footer>{footer}</footer>}
      </section>
    </div>
  );
}

function EmptyBlock({
  icon,
  title,
  text,
  action,
}) {
  return (
    <div className="school-empty">
      <span>{icon}</span>

      <strong>{title}</strong>

      <p>{text}</p>

      {action}
    </div>
  );
}

function Field({
  title,
  children,
}) {
  return (
    <label className="school-modal-field">
      <span>{title}</span>

      {children}
    </label>
  );
}

function ContentHeading({
  eyebrow,
  title,
  text,
  search,
  setSearch,
  button,
  onCreate,
}) {
  return (
    <div className="school-content-heading">
      <div>
        <span>{eyebrow}</span>

        <h1>{title}</h1>

        <p>{text}</p>
      </div>

      <div className="school-content-heading-actions">
        {setSearch && (
          <label>
            🔎

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Пошук"
            />
          </label>
        )}

        {button && (
          <button onClick={onCreate}>
            {button}
          </button>
        )}
      </div>
    </div>
  );
}

function RolePreview({
  role,
  setRole,
}) {
  const [open, setOpen] = useState(false);

  const selected =
    VIEW_ROLES.find(
      (item) => item.id === role
    );

  return (
    <div className="school-role-preview">
      <button
        className="school-role-preview-trigger"
        onClick={() => setOpen(!open)}
      >
        <span>👁</span>

        <div>
          <small>Переглянути як</small>

          <strong>{selected?.title}</strong>
        </div>

        <b>▾</b>
      </button>

      {open && (
        <div className="school-role-preview-menu">
          {VIEW_ROLES.map((item) => (
            <button
              key={item.id}
              className={
                role === item.id
                  ? "active"
                  : ""
              }
              onClick={() => {
                setRole(item.id);
                setOpen(false);
              }}
            >
              <span>{item.icon}</span>

              <strong>{item.title}</strong>

              {role === item.id && <b>✓</b>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SCHOOL ENGINE
========================================================= */

export default function SchoolEngine({
  space,
  onSave,
  onNavigate,
}) {
  const [tab, setTab] = useState("dashboard");

  const [modal, setModal] = useState(null);

  const [search, setSearch] = useState("");

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState(null);

  const [
    selectedSubjectId,
    setSelectedSubjectId,
  ] = useState(null);

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState(null);

  const [
    viewRole,
    setViewRole,
  ] = useState("director");

  const [
    openedTest,
    setOpenedTest,
  ] = useState(null);

  const [
    openedHomework,
    setOpenedHomework,
  ] = useState(null);

  const [
    reviewSubmission,
    setReviewSubmission,
  ] = useState(null);

  const school = hydrateSchoolData(
    space.schoolData
  );

  const previewStudent =
    school.students.find(
      (student) =>
        student.id === selectedStudentId
    ) ||
    school.students[0] ||
    null;

  const previewParent =
    school.parents.find((parent) =>
      parent.childIds?.includes(
        previewStudent?.id
      )
    ) ||
    school.parents[0] ||
    null;

  const isAdmin =
    viewRole === "director";

  const isTeacher =
    viewRole === "teacher" || isAdmin;

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveSchool(nextData) {
    await onSave({
      ...space,

      schoolData:
        hydrateSchoolData(nextData),

      updatedAt: Date.now(),
    });
  }

  async function updateCollection(
    key,
    updater
  ) {
    const current =
      hydrateSchoolData(
        space.schoolData
      );

    const nextValue =
      typeof updater === "function"
        ? updater(current[key] || [])
        : updater;

    await saveSchool({
      ...current,

      [key]: nextValue,
    });
  }

  async function updateSchool(updater) {
    const current =
      hydrateSchoolData(
        space.schoolData
      );

    const next =
      updater({
        ...current,
      });

    await saveSchool(
      hydrateSchoolData(next)
    );
  }

  function createNotification({
    type,
    title,
    text,
    studentId = null,
    classId = null,
  }) {
    return {
      id: createId("notification"),

      type,
      title,
      text,

      studentId,
      classId,

      read: false,

      createdAt: Date.now(),
    };
  }

  /* =======================================================
     NAV
  ======================================================= */

  const ALL_NAV = [
    ["dashboard", "Огляд", "🏠"],
    ["classes", "Класи", "🏫"],
    ["teachers", "Вчителі", "🧑‍🏫"],
    ["students", "Учні", "🎓"],
    ["parents", "Батьки", "👨‍👩‍👧"],
    ["subjects", "Предмети", "📚"],
    ["schedule", "Розклад", "📅"],
    ["lessons", "Уроки", "🧑‍🏫"],
    ["homework", "Домашні", "📝"],
    ["review", "Перевірка робіт", "📨"],
    ["tests", "Тести", "🧠"],
    ["journal", "Журнал", "📖"],
    ["grades", "Оцінки", "⭐"],
    ["attendance", "Відвідування", "✅"],
    ["announcements", "Оголошення", "📢"],
    ["notifications", "Сповіщення", "🔔"],
    ["chats", "Чати", "💬"],
    ["parent-cabinet", "Кабінет батьків", "❤️"],
  ];

  const nav = ALL_NAV.filter(([id]) => {
    if (isAdmin) {
      return id !== "parent-cabinet";
    }

    if (viewRole === "teacher") {
      return ![
        "parents",
        "parent-cabinet",
      ].includes(id);
    }

    if (viewRole === "student") {
      return [
        "dashboard",
        "schedule",
        "lessons",
        "homework",
        "tests",
        "grades",
        "attendance",
        "announcements",
        "notifications",
        "chats",
      ].includes(id);
    }

    if (viewRole === "parent") {
      return [
        "dashboard",
        "schedule",
        "homework",
        "grades",
        "attendance",
        "announcements",
        "notifications",
        "chats",
        "parent-cabinet",
      ].includes(id);
    }

    return true;
  });

  const currentTab =
    nav.some(([id]) => id === tab)
      ? tab
      : "dashboard";

  /* =======================================================
     CLASS / SUBJECT DETAIL
  ======================================================= */

  const selectedClass =
    school.classes.find(
      (item) =>
        item.id === selectedClassId
    );

  const selectedSubject =
    school.subjects.find(
      (item) =>
        item.id === selectedSubjectId
    );

  if (selectedSubject) {
    return (
      <>
        <SubjectDetail
          school={school}
          subject={selectedSubject}
          classId={selectedClassId}
          viewRole={viewRole}
          onBack={() =>
            setSelectedSubjectId(null)
          }
          onCreateLesson={() =>
            setModal("lesson")
          }
          onCreateHomework={() =>
            setModal("homework")
          }
          onCreateMaterial={() =>
            setModal("material")
          }
          onCreateTest={() =>
            setModal("test-builder")
          }
        />

        <RolePreview
          role={viewRole}
          setRole={setViewRole}
        />

        {modal === "lesson" && (
          <CreateLesson
            school={school}
            initialClassId={
              selectedClassId || ""
            }
            initialSubjectId={
              selectedSubject.id
            }
            onClose={() =>
              setModal(null)
            }
            onCreate={async (item) => {
              await updateCollection(
                "lessons",
                (previous) => [
                  item,
                  ...previous,
                ]
              );

              setModal(null);
            }}
          />
        )}

        {modal === "homework" && (
          <CreateHomework
            school={school}
            initialClassId={
              selectedClassId || ""
            }
            initialSubjectId={
              selectedSubject.id
            }
            onClose={() =>
              setModal(null)
            }
            onCreate={async (item) => {
              await updateSchool(
                (current) => ({
                  ...current,

                  homework: [
                    item,
                    ...current.homework,
                  ],

                  notifications: [
                    createNotification({
                      type: "homework",

                      title:
                        "Нове домашнє завдання",

                      text: item.title,

                      classId:
                        item.classId,
                    }),

                    ...current.notifications,
                  ],
                })
              );

              setModal(null);
            }}
          />
        )}

        {modal === "material" && (
          <CreateMaterial
            school={school}
            initialClassId={
              selectedClassId || ""
            }
            initialSubjectId={
              selectedSubject.id
            }
            onClose={() =>
              setModal(null)
            }
            onCreate={async (item) => {
              await updateCollection(
                "materials",
                (previous) => [
                  item,
                  ...previous,
                ]
              );

              setModal(null);
            }}
          />
        )}

        {modal === "test-builder" && (
          <SchoolTestBuilder
            school={school}
            initialClassId={
              selectedClassId || ""
            }
            initialSubjectId={
              selectedSubject.id
            }
            onClose={() =>
              setModal(null)
            }
            onCreate={async (test) => {
              await updateSchool(
                (current) => ({
                  ...current,

                  tests: [
                    test,
                    ...current.tests,
                  ],

                  notifications: [
                    createNotification({
                      type: "test",

                      title:
                        "Новий тест",

                      text: test.title,

                      classId:
                        test.classId,
                    }),

                    ...current.notifications,
                  ],
                })
              );

              setModal(null);
            }}
          />
        )}
      </>
    );
  }

  if (selectedClass) {
    return (
      <>
        <ClassDetail
          school={school}
          classItem={selectedClass}
          onBack={() =>
            setSelectedClassId(null)
          }
          onOpenSubject={(
            subjectId
          ) =>
            setSelectedSubjectId(
              subjectId
            )
          }
          onOpenJournal={() => {
            setSelectedClassId(null);
            setTab("journal");
          }}
          onOpenHomework={() => {
            setSelectedClassId(null);
            setTab("homework");
          }}
          onOpenAttendance={() => {
            setSelectedClassId(null);
            setTab("attendance");
          }}
        />

        <RolePreview
          role={viewRole}
          setRole={setViewRole}
        />
      </>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <section className="school-engine">
      <header className="school-engine-header">
        <div>
          <span>
            SCHOOL ENGINE V5
          </span>

          <h2>{space.title}</h2>

          <p>
            Школа → Клас → Предмет → Урок
          </p>
        </div>

        <div className="school-engine-header-stats">
          <div>
            <strong>
              {school.students.length}
            </strong>

            <span>учнів</span>
          </div>

          <div>
            <strong>
              {school.teachers.length}
            </strong>

            <span>вчителів</span>
          </div>

          <div>
            <strong>
              {school.classes.length}
            </strong>

            <span>класів</span>
          </div>
        </div>
      </header>

      <div
        className={`school-role-banner ${viewRole}`}
      >
        <div>
          <span>
            {
              VIEW_ROLES.find(
                (role) =>
                  role.id === viewRole
              )?.icon
            }
          </span>

          <div>
            <small>
              Режим перегляду
            </small>

            <strong>
              {
                VIEW_ROLES.find(
                  (role) =>
                    role.id === viewRole
                )?.title
              }
            </strong>
          </div>
        </div>

        {(viewRole === "student" ||
          viewRole === "parent") &&
          school.students.length > 0 && (
            <select
              value={
                previewStudent?.id || ""
              }
              onChange={(event) =>
                setSelectedStudentId(
                  event.target.value
                )
              }
            >
              {school.students.map(
                (student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {personName(student)}
                  </option>
                )
              )}
            </select>
          )}
      </div>

      <div className="school-engine-layout">
        <aside className="school-engine-sidebar">
          <span className="school-sidebar-label">
            ШКОЛА
          </span>

          {nav.map(
            ([id, title, icon]) => (
              <button
                key={id}
                className={
                  currentTab === id
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setTab(id);
                  setSearch("");
                }}
              >
                <span>{icon}</span>

                <strong>{title}</strong>
              </button>
            )
          )}
        </aside>

        <main className="school-engine-content">
          {currentTab === "dashboard" && (
            <Dashboard
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              setTab={setTab}
              onOpenClass={
                setSelectedClassId
              }
            />
          )}

          {currentTab === "classes" && (
            <ClassesView
              school={school}
              search={search}
              setSearch={setSearch}
              onCreate={
                isAdmin
                  ? () => setModal("class")
                  : null
              }
              onOpen={
                setSelectedClassId
              }
            />
          )}

          {currentTab === "teachers" && (
            <PeopleView
              title="Вчителі"
              eyebrow="ПЕДАГОГІЧНИЙ СКЛАД"
              icon="🧑‍🏫"
              people={school.teachers}
              school={school}
              type="teacher"
              search={search}
              setSearch={setSearch}
              onCreate={
                isAdmin
                  ? () =>
                      setModal("teacher")
                  : null
              }
            />
          )}

          {currentTab === "students" && (
            <PeopleView
              title="Учні"
              eyebrow="УЧНІ ШКОЛИ"
              icon="🎓"
              people={school.students}
              school={school}
              type="student"
              search={search}
              setSearch={setSearch}
              onCreate={
                isAdmin
                  ? () =>
                      setModal("student")
                  : null
              }
            />
          )}

          {currentTab === "parents" && (
            <PeopleView
              title="Батьки"
              eyebrow="БАТЬКІВСЬКИЙ ДОСТУП"
              icon="👨‍👩‍👧"
              people={school.parents}
              school={school}
              type="parent"
              search={search}
              setSearch={setSearch}
              onCreate={
                isAdmin
                  ? () =>
                      setModal("parent")
                  : null
              }
            />
          )}

          {currentTab === "subjects" && (
            <SubjectsView
              school={school}
              onCreate={
                isAdmin
                  ? () =>
                      setModal("subject")
                  : null
              }
              onOpen={(subjectId) => {
                setSelectedClassId(null);

                setSelectedSubjectId(
                  subjectId
                );
              }}
            />
          )}

          {currentTab === "schedule" && (
            <ScheduleView
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              onCreate={
                isTeacher
                  ? () =>
                      setModal("schedule")
                  : null
              }
            />
          )}

          {currentTab === "lessons" && (
            <LessonsView
              school={school}
              onCreate={
                isTeacher
                  ? () =>
                      setModal("lesson")
                  : null
              }
            />
          )}

          {currentTab === "homework" && (
            <HomeworkView
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              onCreate={
                isTeacher
                  ? () =>
                      setModal("homework")
                  : null
              }
              onOpenHomework={
                setOpenedHomework
              }
            />
          )}

          {currentTab === "review" &&
            isTeacher && (
              <TeacherHomeworkReview
                school={school}
                submissions={
                  school.homeworkSubmissions
                }
                onReview={
                  setReviewSubmission
                }
              />
            )}

          {currentTab === "tests" && (
            <TestsView
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              onCreate={
                isTeacher
                  ? () =>
                      setModal(
                        "test-builder"
                      )
                  : null
              }
              onOpenTest={
                setOpenedTest
              }
            />
          )}

          {currentTab === "journal" && (
            <JournalView
              school={school}
              onCreate={
                isTeacher
                  ? () =>
                      setModal("grade")
                  : null
              }
            />
          )}

          {currentTab === "grades" && (
            <GradesView
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              onCreate={
                isTeacher
                  ? () =>
                      setModal("grade")
                  : null
              }
            />
          )}

          {currentTab === "attendance" && (
            <AttendanceView
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              onCreate={
                isTeacher
                  ? () =>
                      setModal(
                        "attendance"
                      )
                  : null
              }
            />
          )}

          {currentTab === "announcements" && (
            <AnnouncementsView
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              onCreate={
                isTeacher
                  ? () =>
                      setModal(
                        "announcement"
                      )
                  : null
              }
            />
          )}

          {currentTab === "notifications" && (
            <SchoolNotifications
              notifications={
                school.notifications
              }
              currentRole={viewRole}
              studentId={
                previewStudent?.id
              }
              parent={previewParent}
              onRead={async (
                notificationId
              ) => {
                await updateCollection(
                  "notifications",
                  (previous) =>
                    previous.map((item) =>
                      item.id ===
                      notificationId
                        ? {
                            ...item,
                            read: true,
                          }
                        : item
                    )
                );
              }}
            />
          )}

          {/* ===============================================
              НОВАЯ ИНТЕГРАЦИЯ С MESSENGER
          =============================================== */}

          {currentTab === "chats" && (
            <SchoolChatsConnected
              space={space}
              school={school}
              viewRole={viewRole}
              student={previewStudent}
              onNavigate={onNavigate}
            />
          )}

          {currentTab ===
            "parent-cabinet" && (
            <ParentCabinet
              school={school}
              parent={previewParent}
              student={previewStudent}
              setStudentId={
                setSelectedStudentId
              }
            />
          )}
        </main>
      </div>

      <RolePreview
        role={viewRole}
        setRole={(role) => {
          setViewRole(role);
          setTab("dashboard");
        }}
      />

      {/* ===================================================
          TEST PLAYER
      =================================================== */}

      {openedTest &&
        viewRole === "student" &&
        previewStudent && (
          <SchoolTestPlayer
            test={openedTest}
            school={school}
            student={previewStudent}
            onClose={() =>
              setOpenedTest(null)
            }
            onSubmit={async (attempt) => {
              await updateSchool(
                (current) => ({
                  ...current,

                  testAttempts: [
                    attempt,
                    ...current.testAttempts,
                  ],

                  notifications: [
                    createNotification({
                      type: "test_result",

                      studentId:
                        previewStudent.id,

                      title:
                        "Тест завершено",

                      text:
                        `${openedTest.title}: ${attempt.autoPoints}/${attempt.totalPoints}`,
                    }),

                    ...current.notifications,
                  ],
                })
              );

              setOpenedTest(null);
            }}
          />
        )}

      {/* ===================================================
          HOMEWORK SUBMISSION
      =================================================== */}

      {openedHomework &&
        viewRole === "student" &&
        previewStudent && (
          <StudentHomeworkSubmission
            homework={openedHomework}
            school={school}
            student={previewStudent}
            existingSubmission={
              school.homeworkSubmissions.find(
                (item) =>
                  item.homeworkId ===
                    openedHomework.id &&
                  item.studentId ===
                    previewStudent.id
              )
            }
            onClose={() =>
              setOpenedHomework(null)
            }
            onSubmit={async (
              submission
            ) => {
              await updateSchool(
                (current) => {
                  const exists =
                    current.homeworkSubmissions.some(
                      (item) =>
                        item.id ===
                        submission.id
                    );

                  return {
                    ...current,

                    homeworkSubmissions:
                      exists
                        ? current.homeworkSubmissions.map(
                            (item) =>
                              item.id ===
                              submission.id
                                ? submission
                                : item
                          )
                        : [
                            submission,
                            ...current.homeworkSubmissions,
                          ],

                    notifications: [
                      createNotification({
                        type:
                          "homework_submission",

                        studentId:
                          submission.studentId,

                        title:
                          "Домашню роботу здано",

                        text:
                          openedHomework.title,
                      }),

                      ...current.notifications,
                    ],
                  };
                }
              );

              setOpenedHomework(null);
            }}
          />
        )}

      {/* ===================================================
          HOMEWORK REVIEW
      =================================================== */}

      {reviewSubmission && (
        <HomeworkReviewModal
          submission={reviewSubmission}
          school={school}
          onClose={() =>
            setReviewSubmission(null)
          }
          onSave={async (updated) => {
            await updateSchool(
              (current) => {
                const homework =
                  current.homework.find(
                    (item) =>
                      item.id ===
                      updated.homeworkId
                  );

                let grades = current.grades;

                if (
                  updated.grade &&
                  homework
                ) {
                  const existingGrade =
                    current.grades.find(
                      (grade) =>
                        grade.homeworkSubmissionId ===
                        updated.id
                    );

                  const grade = {
                    id:
                      existingGrade?.id ||
                      createId("grade"),

                    homeworkSubmissionId:
                      updated.id,

                    studentId:
                      updated.studentId,

                    subjectId:
                      homework.subjectId,

                    value:
                      Number(
                        updated.grade
                      ),

                    type: "homework",

                    comment:
                      updated.teacherComment,

                    date: todayISO(),

                    createdAt:
                      existingGrade?.createdAt ||
                      Date.now(),

                    updatedAt:
                      Date.now(),
                  };

                  grades = existingGrade
                    ? current.grades.map(
                        (item) =>
                          item.id ===
                          existingGrade.id
                            ? grade
                            : item
                      )
                    : [
                        grade,
                        ...current.grades,
                      ];
                }

                return {
                  ...current,

                  homeworkSubmissions:
                    current.homeworkSubmissions.map(
                      (item) =>
                        item.id ===
                        updated.id
                          ? updated
                          : item
                    ),

                  grades,

                  notifications: [
                    createNotification({
                      type:
                        "homework_review",

                      studentId:
                        updated.studentId,

                      title:
                        updated.status ===
                        "accepted"
                          ? "Роботу прийнято"
                          : updated.status ===
                            "returned"
                          ? "Роботу повернуто"
                          : "Роботу перевірено",

                      text:
                        updated.teacherComment ||
                        "Учитель перевірив роботу.",
                    }),

                    ...current.notifications,
                  ],
                };
              }
            );

            setReviewSubmission(null);
          }}
        />
      )}

      {/* ===================================================
          CREATE MODALS
      =================================================== */}

      {modal === "class" && (
        <CreateClass
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "classes",
              (previous) => [
                ...previous,
                item,
              ]
            );

            setModal(null);
          }}
        />
      )}

      {modal === "teacher" && (
        <CreateTeacher
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "teachers",
              (previous) => [
                ...previous,
                item,
              ]
            );

            setModal(null);
          }}
        />
      )}

      {modal === "student" && (
        <CreateStudent
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "students",
              (previous) => [
                ...previous,
                item,
              ]
            );

            setModal(null);
          }}
        />
      )}

      {modal === "parent" && (
        <CreateParent
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "parents",
              (previous) => [
                ...previous,
                item,
              ]
            );

            setModal(null);
          }}
        />
      )}

      {modal === "subject" && (
        <CreateSubject
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "subjects",
              (previous) => [
                ...previous,
                item,
              ]
            );

            setModal(null);
          }}
        />
      )}

      {modal === "schedule" && (
        <CreateSchedule
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "schedule",
              (previous) => [
                ...previous,
                item,
              ]
            );

            setModal(null);
          }}
        />
      )}

      {modal === "lesson" && (
        <CreateLesson
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "lessons",
              (previous) => [
                item,
                ...previous,
              ]
            );

            setModal(null);
          }}
        />
      )}

      {modal === "homework" && (
        <CreateHomework
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateSchool(
              (current) => ({
                ...current,

                homework: [
                  item,
                  ...current.homework,
                ],

                notifications: [
                  createNotification({
                    type: "homework",

                    title:
                      "Нове домашнє завдання",

                    text: item.title,

                    classId:
                      item.classId,
                  }),

                  ...current.notifications,
                ],
              })
            );

            setModal(null);
          }}
        />
      )}

      {modal === "test-builder" && (
        <SchoolTestBuilder
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (test) => {
            await updateSchool(
              (current) => ({
                ...current,

                tests: [
                  test,
                  ...current.tests,
                ],

                notifications: [
                  createNotification({
                    type: "test",

                    title:
                      "Новий тест",

                    text: test.title,

                    classId:
                      test.classId,
                  }),

                  ...current.notifications,
                ],
              })
            );

            setModal(null);
          }}
        />
      )}

      {modal === "grade" && (
        <CreateGrade
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (grade) => {
            await updateSchool(
              (current) => ({
                ...current,

                grades: [
                  grade,
                  ...current.grades,
                ],

                notifications: [
                  createNotification({
                    type: "grade",

                    studentId:
                      grade.studentId,

                    title:
                      "Нова оцінка",

                    text:
                      `${
                        current.subjects.find(
                          (subject) =>
                            subject.id ===
                            grade.subjectId
                        )?.title ||
                        "Предмет"
                      }: ${grade.value}`,
                  }),

                  ...current.notifications,
                ],
              })
            );

            setModal(null);
          }}
        />
      )}

      {modal === "attendance" && (
        <CreateAttendance
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateSchool(
              (current) => ({
                ...current,

                attendance: [
                  item,
                  ...current.attendance,
                ],

                notifications:
                  item.status === "present"
                    ? current.notifications
                    : [
                        createNotification({
                          type:
                            "attendance",

                          studentId:
                            item.studentId,

                          title:
                            item.status ===
                            "late"
                              ? "Запізнення"
                              : "Пропуск уроку",

                          text:
                            current.subjects.find(
                              (subject) =>
                                subject.id ===
                                item.subjectId
                            )?.title ||
                            "Урок",
                        }),

                        ...current.notifications,
                      ],
              })
            );

            setModal(null);
          }}
        />
      )}

      {modal === "announcement" && (
        <CreateAnnouncement
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateSchool(
              (current) => ({
                ...current,

                announcements: [
                  item,
                  ...current.announcements,
                ],

                notifications: [
                  createNotification({
                    type:
                      "announcement",

                    title: item.title,

                    text: item.text,

                    classId:
                      item.classId,
                  }),

                  ...current.notifications,
                ],
              })
            );

            setModal(null);
          }}
        />
      )}

      {modal === "material" && (
        <CreateMaterial
          school={school}
          onClose={() => setModal(null)}
          onCreate={async (item) => {
            await updateCollection(
              "materials",
              (previous) => [
                item,
                ...previous,
              ]
            );

            setModal(null);
          }}
        />
      )}
    </section>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  school,
  viewRole,
  student,
  setTab,
  onOpenClass,
}) {
  if (
    viewRole === "student" ||
    viewRole === "parent"
  ) {
    const grades = student
      ? school.grades.filter(
          (grade) =>
            grade.studentId ===
            student.id
        )
      : [];

    const avg = average(
      grades.map(
        (grade) => grade.value
      )
    );

    return (
      <>
        <ContentHeading
          eyebrow={
            viewRole === "parent"
              ? "МОЯ ДИТИНА"
              : "МІЙ ПРОСТІР"
          }
          title={
            student
              ? personName(student)
              : "Учня не вибрано"
          }
          text={
            school.classes.find(
              (item) =>
                item.id ===
                student?.classId
            )?.title ||
            "Клас не призначено"
          }
        />

        <div className="school-student-overview">
          <article>
            <span>⭐</span>

            <strong>
              {avg
                ? avg.toFixed(1)
                : "—"}
            </strong>

            <small>
              середній бал
            </small>
          </article>

          <article>
            <span>📝</span>

            <strong>
              {
                school.homework.filter(
                  (item) =>
                    item.classId ===
                    student?.classId
                ).length
              }
            </strong>

            <small>
              домашніх
            </small>
          </article>

          <article>
            <span>🧠</span>

            <strong>
              {
                school.tests.filter(
                  (item) =>
                    item.classId ===
                    student?.classId
                ).length
              }
            </strong>

            <small>тестів</small>
          </article>

          <article>
            <span>🔔</span>

            <strong>
              {
                school.notifications.filter(
                  (item) =>
                    !item.read &&
                    (!item.studentId ||
                      item.studentId ===
                        student?.id)
                ).length
              }
            </strong>

            <small>нових</small>
          </article>
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeading
        eyebrow="СЬОГОДНІ"
        title="Огляд школи"
        text="Вся структура школи в одному місці."
      />

      <div className="school-stat-grid">
        <button
          onClick={() =>
            setTab("students")
          }
        >
          <span>🎓</span>

          <strong>
            {school.students.length}
          </strong>

          <small>Учнів</small>
        </button>

        <button
          onClick={() =>
            setTab("teachers")
          }
        >
          <span>🧑‍🏫</span>

          <strong>
            {school.teachers.length}
          </strong>

          <small>Вчителів</small>
        </button>

        <button
          onClick={() =>
            setTab("classes")
          }
        >
          <span>🏫</span>

          <strong>
            {school.classes.length}
          </strong>

          <small>Класів</small>
        </button>

        <button
          onClick={() =>
            setTab("review")
          }
        >
          <span>📨</span>

          <strong>
            {
              school.homeworkSubmissions.filter(
                (item) =>
                  item.status === "review"
              ).length
            }
          </strong>

          <small>
            На перевірці
          </small>
        </button>
      </div>

      <div className="school-dashboard-grid">
        <section className="school-panel">
          <header>
            <div>
              <span>🏫</span>

              <strong>
                Простори класів
              </strong>
            </div>

            <button
              onClick={() =>
                setTab("classes")
              }
            >
              Усі →
            </button>
          </header>

          <div className="school-dashboard-class-list">
            {school.classes
              .slice(0, 6)
              .map((item) => (
                <button
                  key={item.id}
                  className="school-dashboard-class-button"
                  onClick={() =>
                    onOpenClass(item.id)
                  }
                >
                  <div>{item.title}</div>

                  <section>
                    <strong>
                      {
                        school.students.filter(
                          (student) =>
                            student.classId ===
                            item.id
                        ).length
                      }{" "}
                      учнів
                    </strong>

                    <span>{item.year}</span>
                  </section>

                  <b>→</b>
                </button>
              ))}
          </div>
        </section>

        <section className="school-panel">
          <header>
            <div>
              <span>📢</span>

              <strong>
                Оголошення
              </strong>
            </div>

            <button
              onClick={() =>
                setTab(
                  "announcements"
                )
              }
            >
              Усі →
            </button>
          </header>

          <div className="school-dashboard-announcements">
            {school.announcements
              .slice(0, 5)
              .map((item) => (
                <article key={item.id}>
                  <span>
                    {item.priority ===
                    "important"
                      ? "🔴"
                      : "📢"}
                  </span>

                  <div>
                    <strong>
                      {item.title}
                    </strong>

                    <small>
                      {item.date}
                    </small>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}

/* =========================================================
   CLASSES
========================================================= */

function ClassesView({
  school,
  search,
  setSearch,
  onCreate,
  onOpen,
}) {
  const filtered =
    school.classes.filter((item) =>
      item.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <>
      <ContentHeading
        eyebrow="ПІДПРОСТОРИ"
        title="Класи"
        text={`${school.classes.length} класів`}
        search={search}
        setSearch={setSearch}
        button={
          onCreate
            ? "+ Додати клас"
            : null
        }
        onCreate={onCreate}
      />

      {filtered.length ? (
        <div className="school-class-grid">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="school-class-card"
            >
              <header>
                <div>🏫</div>

                <span>{item.year}</span>
              </header>

              <h3>{item.title}</h3>

              <p>
                {
                  personName(
                    school.teachers.find(
                      (teacher) =>
                        teacher.id ===
                        item.classTeacherId
                    )
                  )
                }
              </p>

              <div className="school-class-stats">
                <div>
                  <strong>
                    {
                      school.students.filter(
                        (student) =>
                          student.classId ===
                          item.id
                      ).length
                    }
                  </strong>

                  <span>учнів</span>
                </div>

                <div>
                  <strong>
                    {
                      school.schedule.filter(
                        (lesson) =>
                          lesson.classId ===
                          item.id
                      ).length
                    }
                  </strong>

                  <span>уроків</span>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpen(item.id)
                }
              >
                Відкрити клас →
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyBlock
          icon="🏫"
          title="Класів ще немає"
          text="Створіть перший клас."
        />
      )}
    </>
  );
}

function ClassDetail({
  school,
  classItem,
  onBack,
  onOpenSubject,
  onOpenJournal,
  onOpenHomework,
  onOpenAttendance,
}) {
  const students =
    school.students.filter(
      (student) =>
        student.classId ===
        classItem.id
    );

  const subjectIds =
    new Set();

  school.schedule.forEach((item) => {
    if (
      item.classId === classItem.id
    ) {
      subjectIds.add(
        item.subjectId
      );
    }
  });

  school.teachers.forEach(
    (teacher) => {
      if (
        teacher.classIds?.includes(
          classItem.id
        )
      ) {
        teacher.subjectIds?.forEach(
          (id) =>
            subjectIds.add(id)
        );
      }
    }
  );

  const subjects =
    school.subjects.filter(
      (subject) =>
        subjectIds.has(subject.id)
    );

  return (
    <section className="school-class-detail">
      <div className="school-class-detail-top">
        <button onClick={onBack}>
          ‹ Всі класи
        </button>

        <span>Простір класу</span>
      </div>

      <header className="school-class-detail-header">
        <div className="school-class-detail-icon">
          {classItem.title}
        </div>

        <div>
          <span>КЛАС</span>

          <h1>{classItem.title}</h1>

          <p>
            {classItem.year}
          </p>
        </div>

        <div className="school-class-detail-teacher">
          <small>
            Класний керівник
          </small>

          <strong>
            {personName(
              school.teachers.find(
                (teacher) =>
                  teacher.id ===
                  classItem.classTeacherId
              )
            )}
          </strong>
        </div>
      </header>

      <div className="school-class-detail-stats">
        <article>
          <span>🎓</span>
          <strong>{students.length}</strong>
          <small>учнів</small>
        </article>

        <article>
          <span>📚</span>
          <strong>{subjects.length}</strong>
          <small>предметів</small>
        </article>

        <article>
          <span>📝</span>
          <strong>
            {
              school.homework.filter(
                (item) =>
                  item.classId ===
                  classItem.id
              ).length
            }
          </strong>
          <small>домашніх</small>
        </article>

        <article>
          <span>🧠</span>
          <strong>
            {
              school.tests.filter(
                (item) =>
                  item.classId ===
                  classItem.id
              ).length
            }
          </strong>
          <small>тестів</small>
        </article>
      </div>

      <div className="school-class-detail-layout">
        <main>
          <section className="school-panel">
            <header>
              <div>
                <span>📚</span>
                <strong>
                  Предмети
                </strong>
              </div>
            </header>

            <div className="school-class-subject-grid">
              {subjects.map(
                (subject) => (
                  <button
                    key={subject.id}
                    onClick={() =>
                      onOpenSubject(
                        subject.id
                      )
                    }
                  >
                    <span>
                      {subject.icon ||
                        "📚"}
                    </span>

                    <div>
                      <strong>
                        {subject.title}
                      </strong>

                      <small>
                        Відкрити предмет
                      </small>
                    </div>

                    <b>→</b>
                  </button>
                )
              )}
            </div>
          </section>

          <section className="school-panel">
            <header>
              <div>
                <span>🎓</span>

                <strong>Учні</strong>
              </div>
            </header>

            <div className="school-class-student-list">
              {students.map((student) => (
                <article key={student.id}>
                  <div className="school-person-avatar">
                    {student.name?.[0] ||
                      "У"}
                  </div>

                  <section>
                    <strong>
                      {personName(student)}
                    </strong>

                    <span>
                      {student.email ||
                        "Учень"}
                    </span>
                  </section>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside>
          <section className="school-class-action-card">
            <span>НАВЧАННЯ</span>

            <button
              onClick={onOpenJournal}
            >
              📖 Журнал
            </button>

            <button
              onClick={onOpenHomework}
            >
              📝 Домашні
            </button>

            <button
              onClick={
                onOpenAttendance
              }
            >
              ✅ Відвідування
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}

/* =========================================================
   SUBJECTS
========================================================= */

function SubjectsView({
  school,
  onCreate,
  onOpen,
}) {
  return (
    <>
      <ContentHeading
        eyebrow="НАВЧАННЯ"
        title="Предмети"
        text={`${school.subjects.length} предметів`}
        button={
          onCreate
            ? "+ Додати предмет"
            : null
        }
        onCreate={onCreate}
      />

      {school.subjects.length ? (
        <div className="school-subject-grid">
          {school.subjects.map(
            (subject) => (
              <button
                key={subject.id}
                className="school-subject-card"
                onClick={() =>
                  onOpen(subject.id)
                }
              >
                <div>
                  {subject.icon ||
                    "📚"}
                </div>

                <section>
                  <strong>
                    {subject.title}
                  </strong>

                  <span>
                    Відкрити простір предмету
                  </span>
                </section>

                <b>→</b>
              </button>
            )
          )}
        </div>
      ) : (
        <EmptyBlock
          icon="📚"
          title="Предметів немає"
          text="Додайте перший предмет."
        />
      )}
    </>
  );
}

function SubjectDetail({
  school,
  subject,
  classId,
  viewRole,
  onBack,
  onCreateLesson,
  onCreateHomework,
  onCreateMaterial,
  onCreateTest,
}) {
  const canEdit =
    viewRole === "director" ||
    viewRole === "teacher";

  const lessons =
    school.lessons.filter(
      (item) =>
        item.subjectId ===
          subject.id &&
        (!classId ||
          item.classId === classId)
    );

  const homework =
    school.homework.filter(
      (item) =>
        item.subjectId ===
          subject.id &&
        (!classId ||
          item.classId === classId)
    );

  const tests =
    school.tests.filter(
      (item) =>
        item.subjectId ===
          subject.id &&
        (!classId ||
          item.classId === classId)
    );

  const materials =
    school.materials.filter(
      (item) =>
        item.subjectId ===
          subject.id &&
        (!classId ||
          item.classId === classId)
    );

  return (
    <section className="school-subject-detail">
      <div className="school-class-detail-top">
        <button onClick={onBack}>
          ‹ Назад
        </button>

        <span>
          Простір предмету
        </span>
      </div>

      <header className="school-subject-hero">
        <div className="school-subject-hero-icon">
          {subject.icon || "📚"}
        </div>

        <div>
          <span>ПРЕДМЕТ</span>

          <h1>{subject.title}</h1>

          <p>
            Навчальний простір
          </p>
        </div>
      </header>

      <div className="school-subject-stat-grid">
        <article>
          <span>🧑‍🏫</span>
          <strong>{lessons.length}</strong>
          <small>уроків</small>
        </article>

        <article>
          <span>📝</span>
          <strong>{homework.length}</strong>
          <small>домашніх</small>
        </article>

        <article>
          <span>📁</span>
          <strong>{materials.length}</strong>
          <small>матеріалів</small>
        </article>

        <article>
          <span>🧠</span>
          <strong>{tests.length}</strong>
          <small>тестів</small>
        </article>
      </div>

      {canEdit && (
        <div className="school-subject-actions">
          <button onClick={onCreateLesson}>
            + Урок
          </button>

          <button
            onClick={onCreateHomework}
          >
            + Домашнє
          </button>

          <button
            onClick={onCreateMaterial}
          >
            + Матеріал
          </button>

          <button onClick={onCreateTest}>
            + Тест
          </button>
        </div>
      )}

      <div className="school-subject-layout">
        <main>
          <section className="school-panel">
            <header>
              <div>
                <span>🧑‍🏫</span>

                <strong>Уроки</strong>
              </div>
            </header>

            <div className="school-subject-lessons">
              {lessons.map((item) => (
                <article key={item.id}>
                  <div>
                    <span>
                      {formatShortDate(
                        item.date
                      )}
                    </span>

                    <strong>
                      {item.title}
                    </strong>

                    <small>
                      {item.topic}
                    </small>
                  </div>

                  <b>{item.time}</b>
                </article>
              ))}
            </div>
          </section>

          <section className="school-panel">
            <header>
              <div>
                <span>📁</span>

                <strong>
                  Матеріали
                </strong>
              </div>
            </header>

            <div className="school-material-list">
              {materials.map((item) => (
                <article key={item.id}>
                  <span>
                    {item.type === "video"
                      ? "🎬"
                      : item.type ===
                        "link"
                      ? "🔗"
                      : "📄"}
                  </span>

                  <div>
                    <strong>
                      {item.title}
                    </strong>

                    <small>
                      {item.description}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}

/* =========================================================
   PEOPLE
========================================================= */

function PeopleView({
  eyebrow,
  title,
  icon,
  people,
  school,
  type,
  search,
  setSearch,
  onCreate,
}) {
  const filtered =
    people.filter((person) =>
      personName(person)
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <>
      <ContentHeading
        eyebrow={eyebrow}
        title={title}
        text={`Усього: ${people.length}`}
        search={search}
        setSearch={setSearch}
        button={
          onCreate
            ? "+ Додати"
            : null
        }
        onCreate={onCreate}
      />

      {filtered.length ? (
        <div className="school-people-list">
          {filtered.map((person) => (
            <article key={person.id}>
              <div className="school-person-avatar">
                {person.name?.[0] ||
                  icon}
              </div>

              <section>
                <strong>
                  {personName(person)}
                </strong>

                {type === "student" && (
                  <span>
                    {
                      school.classes.find(
                        (item) =>
                          item.id ===
                          person.classId
                      )?.title ||
                      "Без класу"
                    }
                  </span>
                )}

                {type === "teacher" && (
                  <span>
                    {person.subjectIds
                      ?.map(
                        (id) =>
                          school.subjects.find(
                            (subject) =>
                              subject.id ===
                              id
                          )?.title
                      )
                      .filter(Boolean)
                      .join(", ") ||
                      "Предмет не призначено"}
                  </span>
                )}

                {type === "parent" && (
                  <span>
                    {person.childIds
                      ?.map(
                        (id) =>
                          personName(
                            school.students.find(
                              (student) =>
                                student.id ===
                                id
                            )
                          )
                      )
                      .filter(Boolean)
                      .join(", ") ||
                      "Дитину не привʼязано"}
                  </span>
                )}

                <small>
                  {person.email ||
                    "Email не вказано"}
                </small>
              </section>
            </article>
          ))}
        </div>
      ) : (
        <EmptyBlock
          icon={icon}
          title="Поки порожньо"
          text="Додайте перший запис."
        />
      )}
    </>
  );
}

/* =========================================================
   SCHEDULE
========================================================= */

function ScheduleView({
  school,
  viewRole,
  student,
  onCreate,
}) {
  const [
    classFilter,
    setClassFilter,
  ] = useState(
    student?.classId || "all"
  );

  const items =
    school.schedule.filter(
      (item) =>
        classFilter === "all" ||
        item.classId === classFilter
    );

  return (
    <>
      <ContentHeading
        eyebrow="ТИЖДЕНЬ"
        title="Розклад"
        text="Розклад уроків."
        button={
          onCreate
            ? "+ Додати урок"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-week-toolbar">
        <div>
          <span>Клас</span>

          <select
            value={classFilter}
            disabled={
              viewRole === "student" ||
              viewRole === "parent"
            }
            onChange={(event) =>
              setClassFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              Вся школа
            </option>

            {school.classes.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="school-week-calendar">
        {DAYS.map((day) => (
          <section key={day.id}>
            <header>
              <span>{day.short}</span>

              <strong>
                {day.title}
              </strong>
            </header>

            <div>
              {items
                .filter(
                  (item) =>
                    item.day === day.id
                )
                .sort((a, b) =>
                  a.time.localeCompare(
                    b.time
                  )
                )
                .map((item) => (
                  <article key={item.id}>
                    <time>{item.time}</time>

                    <div>
                      <strong>
                        {
                          school.subjects.find(
                            (subject) =>
                              subject.id ===
                              item.subjectId
                          )?.title
                        }
                      </strong>

                      <span>
                        {
                          school.classes.find(
                            (classItem) =>
                              classItem.id ===
                              item.classId
                          )?.title
                        }
                      </span>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   LESSONS
========================================================= */

function LessonsView({
  school,
  onCreate,
}) {
  return (
    <>
      <ContentHeading
        eyebrow="НАВЧАЛЬНИЙ ПРОЦЕС"
        title="Уроки"
        text={`${school.lessons.length} уроків`}
        button={
          onCreate
            ? "+ Створити урок"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-lesson-list">
        {school.lessons.map((item) => (
          <article key={item.id}>
            <div className="school-lesson-date">
              <strong>
                {formatShortDate(
                  item.date
                )}
              </strong>

              <span>{item.time}</span>
            </div>

            <section>
              <span>
                {
                  school.subjects.find(
                    (subject) =>
                      subject.id ===
                      item.subjectId
                  )?.title ||
                  "Предмет"
                }
              </span>

              <strong>
                {item.title}
              </strong>

              <p>{item.topic}</p>
            </section>
          </article>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   HOMEWORK
========================================================= */

function HomeworkView({
  school,
  viewRole,
  student,
  onCreate,
  onOpenHomework,
}) {
  const visible =
    viewRole === "student" ||
    viewRole === "parent"
      ? school.homework.filter(
          (item) =>
            item.classId ===
            student?.classId
        )
      : school.homework;

  return (
    <>
      <ContentHeading
        eyebrow="НАВЧАННЯ"
        title="Домашні завдання"
        text={`${visible.length} завдань`}
        button={
          onCreate
            ? "+ Створити завдання"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-homework-list">
        {visible.map((item) => {
          const submission =
            student
              ? school.homeworkSubmissions.find(
                  (row) =>
                    row.homeworkId ===
                      item.id &&
                    row.studentId ===
                      student.id
                )
              : null;

          return (
            <article key={item.id}>
              <div className="school-homework-subject">
                📝
              </div>

              <section>
                <span>
                  {
                    school.subjects.find(
                      (subject) =>
                        subject.id ===
                        item.subjectId
                    )?.title
                  }
                </span>

                <strong>
                  {item.title}
                </strong>

                <p>
                  {item.description}
                </p>

                {submission && (
                  <small>
                    {submission.status ===
                    "accepted"
                      ? "✅ Прийнято"
                      : submission.status ===
                        "returned"
                      ? "↩️ Повернуто"
                      : "⏳ На перевірці"}
                  </small>
                )}
              </section>

              <div className="school-homework-date">
                <small>
                  Здати до
                </small>

                <strong>
                  {item.dueDate}
                </strong>

                {viewRole ===
                  "student" && (
                  <button
                    onClick={() =>
                      onOpenHomework(item)
                    }
                  >
                    {submission
                      ? "Відкрити"
                      : "Здати роботу"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* =========================================================
   TESTS
========================================================= */

function TestsView({
  school,
  viewRole,
  student,
  onCreate,
  onOpenTest,
}) {
  const visible =
    viewRole === "student" ||
    viewRole === "parent"
      ? school.tests.filter(
          (item) =>
            item.classId ===
            student?.classId
        )
      : school.tests;

  return (
    <>
      <ContentHeading
        eyebrow="ПЕРЕВІРКА ЗНАНЬ"
        title="Тести"
        text={`${visible.length} тестів`}
        button={
          onCreate
            ? "+ Створити тест"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-test-grid">
        {visible.map((test) => {
          const attempt =
            student
              ? school.testAttempts.find(
                  (item) =>
                    item.testId ===
                      test.id &&
                    item.studentId ===
                      student.id
                )
              : null;

          return (
            <article key={test.id}>
              <header>
                <span>🧠</span>

                <small>
                  {test.totalPoints ||
                    test.points ||
                    0}{" "}
                  балів
                </small>
              </header>

              <span>
                {
                  school.subjects.find(
                    (subject) =>
                      subject.id ===
                      test.subjectId
                  )?.title ||
                  "Предмет"
                }
              </span>

              <h3>{test.title}</h3>

              <p>
                {
                  school.classes.find(
                    (item) =>
                      item.id ===
                      test.classId
                  )?.title
                }
              </p>

              {attempt && (
                <strong>
                  {attempt.autoPoints}/
                  {attempt.totalPoints}
                </strong>
              )}

              <footer>
                <small>
                  до {test.dueDate}
                </small>

                <button
                  onClick={() =>
                    onOpenTest(test)
                  }
                >
                  {viewRole ===
                  "student"
                    ? attempt
                      ? "Результат →"
                      : "Пройти →"
                    : "Відкрити →"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* =========================================================
   JOURNAL
========================================================= */

function JournalView({
  school,
  onCreate,
}) {
  const [
    classId,
    setClassId,
  ] = useState(
    school.classes[0]?.id || ""
  );

  const [
    subjectId,
    setSubjectId,
  ] = useState(
    school.subjects[0]?.id || ""
  );

  const students =
    school.students.filter(
      (student) =>
        student.classId === classId
    );

  const dates =
    Array.from(
      new Set(
        school.grades
          .filter(
            (grade) =>
              grade.subjectId ===
                subjectId &&
              students.some(
                (student) =>
                  student.id ===
                  grade.studentId
              )
          )
          .map((grade) => grade.date)
          .filter(Boolean)
      )
    ).sort();

  return (
    <>
      <ContentHeading
        eyebrow="ЕЛЕКТРОННИЙ ЖУРНАЛ"
        title="Журнал"
        text="Оцінки по датах."
        button={
          onCreate
            ? "+ Виставити оцінку"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-journal-toolbar school-journal-toolbar-v3">
        <label>
          <span>Клас</span>

          <select
            value={classId}
            onChange={(event) =>
              setClassId(
                event.target.value
              )
            }
          >
            {school.classes.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          <span>Предмет</span>

          <select
            value={subjectId}
            onChange={(event) =>
              setSubjectId(
                event.target.value
              )
            }
          >
            {school.subjects.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      <div className="school-journal-scroll">
        <table className="school-journal-table school-date-journal">
          <thead>
            <tr>
              <th className="student-column">
                Учень
              </th>

              {dates.map((date) => (
                <th key={date}>
                  {formatShortDate(date)}
                </th>
              ))}

              <th>Сер.</th>
            </tr>
          </thead>

          <tbody>
            {students.map(
              (student) => {
                const grades =
                  school.grades.filter(
                    (grade) =>
                      grade.studentId ===
                        student.id &&
                      grade.subjectId ===
                        subjectId
                  );

                const avg = average(
                  grades.map(
                    (grade) =>
                      grade.value
                  )
                );

                return (
                  <tr key={student.id}>
                    <td className="student-column">
                      {personName(student)}
                    </td>

                    {dates.map((date) => (
                      <td key={date}>
                        <div className="school-date-grade-cell">
                          {grades
                            .filter(
                              (grade) =>
                                grade.date ===
                                date
                            )
                            .map((grade) => (
                              <span
                                key={grade.id}
                                className={
                                  gradeTone(
                                    grade.value
                                  )
                                }
                              >
                                {grade.value}
                              </span>
                            ))}
                        </div>
                      </td>
                    ))}

                    <td>
                      {avg
                        ? avg.toFixed(1)
                        : "—"}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* =========================================================
   GRADES / ATTENDANCE / ANNOUNCEMENTS
========================================================= */

function GradesView({
  school,
  viewRole,
  student,
  onCreate,
}) {
  const grades =
    viewRole === "student" ||
    viewRole === "parent"
      ? school.grades.filter(
          (item) =>
            item.studentId ===
            student?.id
        )
      : school.grades;

  return (
    <>
      <ContentHeading
        eyebrow="УСПІШНІСТЬ"
        title="Оцінки"
        text={`${grades.length} записів`}
        button={
          onCreate
            ? "+ Виставити оцінку"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-grade-list">
        {grades.map((grade) => (
          <article key={grade.id}>
            <div
              className={`school-grade-value ${gradeTone(
                grade.value
              )}`}
            >
              {grade.value}
            </div>

            <section>
              <strong>
                {personName(
                  school.students.find(
                    (student) =>
                      student.id ===
                      grade.studentId
                  )
                )}
              </strong>

              <span>
                {
                  school.subjects.find(
                    (subject) =>
                      subject.id ===
                      grade.subjectId
                  )?.title
                }
              </span>

              <small>
                {
                  GRADE_TYPES.find(
                    (type) =>
                      type.id ===
                      grade.type
                  )?.title
                }
              </small>
            </section>

            <time>{grade.date}</time>
          </article>
        ))}
      </div>
    </>
  );
}

function AttendanceView({
  school,
  viewRole,
  student,
  onCreate,
}) {
  const rows =
    viewRole === "student" ||
    viewRole === "parent"
      ? school.attendance.filter(
          (item) =>
            item.studentId ===
            student?.id
        )
      : school.attendance;

  return (
    <>
      <ContentHeading
        eyebrow="КОНТРОЛЬ"
        title="Відвідування"
        text={`${rows.length} записів`}
        button={
          onCreate
            ? "+ Відмітити"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-attendance-list">
        {rows.map((item) => (
          <article key={item.id}>
            <span
              className={`school-attendance-status ${item.status}`}
            >
              {item.status ===
              "present"
                ? "✓"
                : item.status === "late"
                ? "!"
                : "×"}
            </span>

            <section>
              <strong>
                {personName(
                  school.students.find(
                    (student) =>
                      student.id ===
                      item.studentId
                  )
                )}
              </strong>

              <span>
                {
                  school.subjects.find(
                    (subject) =>
                      subject.id ===
                      item.subjectId
                  )?.title
                }
              </span>
            </section>

            <div>
              <strong>
                {attendanceLabel(
                  item.status
                )}
              </strong>

              <small>{item.date}</small>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function AnnouncementsView({
  school,
  viewRole,
  student,
  onCreate,
}) {
  const rows =
    viewRole === "student" ||
    viewRole === "parent"
      ? school.announcements.filter(
          (item) =>
            item.scope === "school" ||
            item.classId ===
              student?.classId
        )
      : school.announcements;

  return (
    <>
      <ContentHeading
        eyebrow="ІНФОРМАЦІЯ"
        title="Оголошення"
        text={`${rows.length} оголошень`}
        button={
          onCreate
            ? "+ Оголошення"
            : null
        }
        onCreate={onCreate}
      />

      <div className="school-announcement-list">
        {rows.map((item) => (
          <article
            key={item.id}
            className={
              item.priority ===
              "important"
                ? "important"
                : ""
            }
          >
            <div>
              {item.priority ===
              "important"
                ? "🔴"
                : "📢"}
            </div>

            <section>
              <span>
                {item.scope === "school"
                  ? "ВСЯ ШКОЛА"
                  : "КЛАС"}
              </span>

              <strong>
                {item.title}
              </strong>

              <p>{item.text}</p>
            </section>

            <time>{item.date}</time>
          </article>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   PARENT CABINET
========================================================= */

function ParentCabinet({
  school,
  parent,
  student,
  setStudentId,
}) {
  if (!parent) {
    return (
      <EmptyBlock
        icon="👨‍👩‍👧"
        title="Батьків ще немає"
        text="Додайте батьків."
      />
    );
  }

  const children =
    school.students.filter(
      (item) =>
        parent.childIds?.includes(
          item.id
        )
    );

  const active =
    children.find(
      (item) =>
        item.id === student?.id
    ) ||
    children[0] ||
    null;

  return (
    <>
      <ContentHeading
        eyebrow="КАБІНЕТ БАТЬКІВ"
        title={personName(parent)}
        text="Доступ до інформації про дитину."
      />

      <div className="school-children-switcher">
        {children.map((child) => (
          <button
            key={child.id}
            className={
              child.id === active?.id
                ? "active"
                : ""
            }
            onClick={() =>
              setStudentId(child.id)
            }
          >
            <span>
              {child.name?.[0]}
            </span>

            <div>
              <strong>
                {personName(child)}
              </strong>

              <small>
                {
                  school.classes.find(
                    (item) =>
                      item.id ===
                      child.classId
                  )?.title
                }
              </small>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   CREATE FORMS
========================================================= */

function CreateClass({
  school,
  onClose,
  onCreate,
}) {
  const [title, setTitle] =
    useState("");

  const [year, setYear] =
    useState("2026/2027");

  const [
    classTeacherId,
    setClassTeacherId,
  ] = useState("");

  return (
    <SchoolModal
      title="Новий клас"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={!title.trim()}
            onClick={() =>
              onCreate({
                id: createId("class"),

                title:
                  title.trim(),

                year,

                classTeacherId:
                  classTeacherId ||
                  null,

                createdAt:
                  Date.now(),
              })
            }
          >
            Створити
          </button>
        </>
      }
    >
      <Field title="Назва">
        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="9-Б"
        />
      </Field>

      <Field title="Навчальний рік">
        <input
          value={year}
          onChange={(event) =>
            setYear(
              event.target.value
            )
          }
        />
      </Field>

      <Field title="Класний керівник">
        <select
          value={classTeacherId}
          onChange={(event) =>
            setClassTeacherId(
              event.target.value
            )
          }
        >
          <option value="">
            Не призначено
          </option>

          {school.teachers.map(
            (teacher) => (
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {personName(teacher)}
              </option>
            )
          )}
        </select>
      </Field>
    </SchoolModal>
  );
}

function CreateTeacher({
  school,
  onClose,
  onCreate,
}) {
  const [name, setName] =
    useState("");

  const [surname, setSurname] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [
    subjectIds,
    setSubjectIds,
  ] = useState([]);

  const [
    classIds,
    setClassIds,
  ] = useState([]);

  function toggle(
    id,
    list,
    setter
  ) {
    setter(
      list.includes(id)
        ? list.filter(
            (item) => item !== id
          )
        : [...list, id]
    );
  }

  return (
    <SchoolModal
      title="Новий вчитель"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={!name.trim()}
            onClick={() =>
              onCreate({
                id:
                  createId("teacher"),

                name:
                  name.trim(),

                surname:
                  surname.trim(),

                email:
                  email.trim(),

                subjectIds,
                classIds,

                createdAt:
                  Date.now(),
              })
            }
          >
            Додати
          </button>
        </>
      }
    >
      <div className="school-modal-row">
        <Field title="Імʼя">
          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
          />
        </Field>

        <Field title="Прізвище">
          <input
            value={surname}
            onChange={(event) =>
              setSurname(
                event.target.value
              )
            }
          />
        </Field>
      </div>

      <Field title="Email">
        <input
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
        />
      </Field>

      <div className="school-check-group">
        <span>Предмети</span>

        <div>
          {school.subjects.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className={
                  subjectIds.includes(
                    item.id
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  toggle(
                    item.id,
                    subjectIds,
                    setSubjectIds
                  )
                }
              >
                {subjectIds.includes(
                  item.id
                )
                  ? "✓ "
                  : ""}
                {item.title}
              </button>
            )
          )}
        </div>
      </div>

      <div className="school-check-group">
        <span>Класи</span>

        <div>
          {school.classes.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className={
                  classIds.includes(
                    item.id
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  toggle(
                    item.id,
                    classIds,
                    setClassIds
                  )
                }
              >
                {classIds.includes(
                  item.id
                )
                  ? "✓ "
                  : ""}
                {item.title}
              </button>
            )
          )}
        </div>
      </div>
    </SchoolModal>
  );
}

function CreateStudent({
  school,
  onClose,
  onCreate,
}) {
  const [name, setName] =
    useState("");

  const [surname, setSurname] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [classId, setClassId] =
    useState("");

  return (
    <SchoolModal
      title="Новий учень"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={!name.trim()}
            onClick={() =>
              onCreate({
                id:
                  createId("student"),

                name:
                  name.trim(),

                surname:
                  surname.trim(),

                email:
                  email.trim(),

                classId:
                  classId || null,

                createdAt:
                  Date.now(),
              })
            }
          >
            Додати
          </button>
        </>
      }
    >
      <div className="school-modal-row">
        <Field title="Імʼя">
          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
          />
        </Field>

        <Field title="Прізвище">
          <input
            value={surname}
            onChange={(event) =>
              setSurname(
                event.target.value
              )
            }
          />
        </Field>
      </div>

      <Field title="Клас">
        <select
          value={classId}
          onChange={(event) =>
            setClassId(
              event.target.value
            )
          }
        >
          <option value="">
            Не вибрано
          </option>

          {school.classes.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title}
              </option>
            )
          )}
        </select>
      </Field>

      <Field title="Email">
        <input
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
        />
      </Field>
    </SchoolModal>
  );
}

function CreateParent({
  school,
  onClose,
  onCreate,
}) {
  const [name, setName] =
    useState("");

  const [surname, setSurname] =
    useState("");

  const [
    childIds,
    setChildIds,
  ] = useState([]);

  return (
    <SchoolModal
      title="Додати батьків"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={!name.trim()}
            onClick={() =>
              onCreate({
                id:
                  createId("parent"),

                name:
                  name.trim(),

                surname:
                  surname.trim(),

                childIds,

                createdAt:
                  Date.now(),
              })
            }
          >
            Додати
          </button>
        </>
      }
    >
      <div className="school-modal-row">
        <Field title="Імʼя">
          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
          />
        </Field>

        <Field title="Прізвище">
          <input
            value={surname}
            onChange={(event) =>
              setSurname(
                event.target.value
              )
            }
          />
        </Field>
      </div>

      <div className="school-check-group">
        <span>Діти</span>

        <div>
          {school.students.map(
            (student) => (
              <button
                key={student.id}
                type="button"
                className={
                  childIds.includes(
                    student.id
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setChildIds(
                    (previous) =>
                      previous.includes(
                        student.id
                      )
                        ? previous.filter(
                            (id) =>
                              id !==
                              student.id
                          )
                        : [
                            ...previous,
                            student.id,
                          ]
                  )
                }
              >
                {personName(student)}
              </button>
            )
          )}
        </div>
      </div>
    </SchoolModal>
  );
}

function CreateSubject({
  onClose,
  onCreate,
}) {
  const [title, setTitle] =
    useState("");

  const [icon, setIcon] =
    useState("📚");

  return (
    <SchoolModal
      title="Новий предмет"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={!title.trim()}
            onClick={() =>
              onCreate({
                id:
                  createId("subject"),

                title:
                  title.trim(),

                icon,

                createdAt:
                  Date.now(),
              })
            }
          >
            Додати
          </button>
        </>
      }
    >
      <Field title="Назва">
        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          placeholder="Математика"
        />
      </Field>

      <Field title="Іконка">
        <input
          value={icon}
          onChange={(event) =>
            setIcon(
              event.target.value
            )
          }
        />
      </Field>
    </SchoolModal>
  );
}

function CreateSchedule({
  school,
  onClose,
  onCreate,
}) {
  const [day, setDay] =
    useState(1);

  const [time, setTime] =
    useState("08:30");

  const [classId, setClassId] =
    useState("");

  const [
    subjectId,
    setSubjectId,
  ] = useState("");

  return (
    <SchoolModal
      title="Урок у розклад"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={
              !classId ||
              !subjectId
            }
            onClick={() =>
              onCreate({
                id:
                  createId("schedule"),

                day: Number(day),
                time,
                classId,
                subjectId,

                createdAt:
                  Date.now(),
              })
            }
          >
            Додати
          </button>
        </>
      }
    >
      <div className="school-modal-row">
        <Field title="День">
          <select
            value={day}
            onChange={(event) =>
              setDay(
                Number(
                  event.target.value
                )
              )
            }
          >
            {DAYS.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title}
              </option>
            ))}
          </select>
        </Field>

        <Field title="Час">
          <input
            type="time"
            value={time}
            onChange={(event) =>
              setTime(
                event.target.value
              )
            }
          />
        </Field>
      </div>

      <Field title="Клас">
        <select
          value={classId}
          onChange={(event) =>
            setClassId(
              event.target.value
            )
          }
        >
          <option value="">
            Виберіть
          </option>

          {school.classes.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title}
              </option>
            )
          )}
        </select>
      </Field>

      <Field title="Предмет">
        <select
          value={subjectId}
          onChange={(event) =>
            setSubjectId(
              event.target.value
            )
          }
        >
          <option value="">
            Виберіть
          </option>

          {school.subjects.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title}
              </option>
            )
          )}
        </select>
      </Field>
    </SchoolModal>
  );
}

function CreateLesson({
  school,
  initialClassId = "",
  initialSubjectId = "",
  onClose,
  onCreate,
}) {
  const [title, setTitle] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [classId, setClassId] =
    useState(initialClassId);

  const [
    subjectId,
    setSubjectId,
  ] = useState(initialSubjectId);

  const [date, setDate] =
    useState(todayISO());

  const [time, setTime] =
    useState("08:30");

  return (
    <SchoolModal
      title="Новий урок"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={
              !title ||
              !classId ||
              !subjectId
            }
            onClick={() =>
              onCreate({
                id:
                  createId("lesson"),

                title,
                topic,
                classId,
                subjectId,
                date,
                time,

                createdAt:
                  Date.now(),
              })
            }
          >
            Створити
          </button>
        </>
      }
    >
      <Field title="Назва">
        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
        />
      </Field>

      <Field title="Тема">
        <textarea
          value={topic}
          onChange={(event) =>
            setTopic(
              event.target.value
            )
          }
        />
      </Field>

      <div className="school-modal-row">
        <Field title="Клас">
          <select
            value={classId}
            onChange={(event) =>
              setClassId(
                event.target.value
              )
            }
          >
            <option value="">
              Виберіть
            </option>

            {school.classes.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>

        <Field title="Предмет">
          <select
            value={subjectId}
            onChange={(event) =>
              setSubjectId(
                event.target.value
              )
            }
          >
            <option value="">
              Виберіть
            </option>

            {school.subjects.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>
      </div>

      <div className="school-modal-row">
        <Field title="Дата">
          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value
              )
            }
          />
        </Field>

        <Field title="Час">
          <input
            type="time"
            value={time}
            onChange={(event) =>
              setTime(
                event.target.value
              )
            }
          />
        </Field>
      </div>
    </SchoolModal>
  );
}

function CreateHomework({
  school,
  initialClassId = "",
  initialSubjectId = "",
  onClose,
  onCreate,
}) {
  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [classId, setClassId] =
    useState(initialClassId);

  const [
    subjectId,
    setSubjectId,
  ] = useState(initialSubjectId);

  const [dueDate, setDueDate] =
    useState(todayISO());

  return (
    <SchoolModal
      title="Домашнє завдання"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={
              !title ||
              !classId ||
              !subjectId
            }
            onClick={() =>
              onCreate({
                id:
                  createId("homework"),

                title,
                description,
                classId,
                subjectId,
                dueDate,

                createdAt:
                  Date.now(),
              })
            }
          >
            Опублікувати
          </button>
        </>
      }
    >
      <Field title="Назва">
        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
        />
      </Field>

      <div className="school-modal-row">
        <Field title="Клас">
          <select
            value={classId}
            onChange={(event) =>
              setClassId(
                event.target.value
              )
            }
          >
            <option value="">
              Виберіть
            </option>

            {school.classes.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>

        <Field title="Предмет">
          <select
            value={subjectId}
            onChange={(event) =>
              setSubjectId(
                event.target.value
              )
            }
          >
            <option value="">
              Виберіть
            </option>

            {school.subjects.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>
      </div>

      <Field title="Опис">
        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
        />
      </Field>

      <Field title="Здати до">
        <input
          type="date"
          value={dueDate}
          onChange={(event) =>
            setDueDate(
              event.target.value
            )
          }
        />
      </Field>
    </SchoolModal>
  );
}

function CreateMaterial({
  school,
  initialClassId = "",
  initialSubjectId = "",
  onClose,
  onCreate,
}) {
  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [type, setType] =
    useState("document");

  const [classId, setClassId] =
    useState(initialClassId);

  const [
    subjectId,
    setSubjectId,
  ] = useState(initialSubjectId);

  return (
    <SchoolModal
      title="Новий матеріал"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={
              !title ||
              !subjectId
            }
            onClick={() =>
              onCreate({
                id:
                  createId("material"),

                title,
                description,
                type,
                classId,
                subjectId,

                createdAt:
                  Date.now(),
              })
            }
          >
            Додати
          </button>
        </>
      }
    >
      <Field title="Назва">
        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
        />
      </Field>

      <Field title="Тип">
        <select
          value={type}
          onChange={(event) =>
            setType(
              event.target.value
            )
          }
        >
          <option value="document">
            📄 Документ
          </option>

          <option value="video">
            🎬 Відео
          </option>

          <option value="link">
            🔗 Посилання
          </option>
        </select>
      </Field>

      <div className="school-modal-row">
        <Field title="Клас">
          <select
            value={classId}
            onChange={(event) =>
              setClassId(
                event.target.value
              )
            }
          >
            <option value="">
              Вся школа
            </option>

            {school.classes.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>

        <Field title="Предмет">
          <select
            value={subjectId}
            onChange={(event) =>
              setSubjectId(
                event.target.value
              )
            }
          >
            <option value="">
              Виберіть
            </option>

            {school.subjects.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>
      </div>

      <Field title="Опис">
        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
        />
      </Field>
    </SchoolModal>
  );
}

function CreateGrade({
  school,
  onClose,
  onCreate,
}) {
  const [
    studentId,
    setStudentId,
  ] = useState("");

  const [
    subjectId,
    setSubjectId,
  ] = useState("");

  const [value, setValue] =
    useState("12");

  const [type, setType] =
    useState("regular");

  const [date, setDate] =
    useState(todayISO());

  const [comment, setComment] =
    useState("");

  return (
    <SchoolModal
      title="Виставити оцінку"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={
              !studentId ||
              !subjectId
            }
            onClick={() =>
              onCreate({
                id:
                  createId("grade"),

                studentId,
                subjectId,

                value:
                  Number(value),

                type,
                date,
                comment,

                createdAt:
                  Date.now(),
              })
            }
          >
            Зберегти
          </button>
        </>
      }
    >
      <Field title="Учень">
        <select
          value={studentId}
          onChange={(event) =>
            setStudentId(
              event.target.value
            )
          }
        >
          <option value="">
            Виберіть
          </option>

          {school.students.map(
            (student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {personName(student)}
              </option>
            )
          )}
        </select>
      </Field>

      <Field title="Предмет">
        <select
          value={subjectId}
          onChange={(event) =>
            setSubjectId(
              event.target.value
            )
          }
        >
          <option value="">
            Виберіть
          </option>

          {school.subjects.map(
            (subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.title}
              </option>
            )
          )}
        </select>
      </Field>

      <div className="school-modal-row">
        <Field title="Оцінка">
          <select
            value={value}
            onChange={(event) =>
              setValue(
                event.target.value
              )
            }
          >
            {Array.from({
              length: 12,
            }).map((_, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                {index + 1}
              </option>
            ))}
          </select>
        </Field>

        <Field title="Тип">
          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target.value
              )
            }
          >
            {GRADE_TYPES.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.icon}{" "}
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>
      </div>

      <Field title="Дата">
        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(
              event.target.value
            )
          }
        />
      </Field>

      <Field title="Коментар">
        <textarea
          value={comment}
          onChange={(event) =>
            setComment(
              event.target.value
            )
          }
        />
      </Field>
    </SchoolModal>
  );
}

function CreateAttendance({
  school,
  onClose,
  onCreate,
}) {
  const [
    studentId,
    setStudentId,
  ] = useState("");

  const [
    subjectId,
    setSubjectId,
  ] = useState("");

  const [status, setStatus] =
    useState("present");

  const [date, setDate] =
    useState(todayISO());

  return (
    <SchoolModal
      title="Відвідування"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={
              !studentId ||
              !subjectId
            }
            onClick={() =>
              onCreate({
                id:
                  createId(
                    "attendance"
                  ),

                studentId,
                subjectId,
                status,
                date,

                createdAt:
                  Date.now(),
              })
            }
          >
            Зберегти
          </button>
        </>
      }
    >
      <Field title="Учень">
        <select
          value={studentId}
          onChange={(event) =>
            setStudentId(
              event.target.value
            )
          }
        >
          <option value="">
            Виберіть
          </option>

          {school.students.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {personName(item)}
              </option>
            )
          )}
        </select>
      </Field>

      <Field title="Предмет">
        <select
          value={subjectId}
          onChange={(event) =>
            setSubjectId(
              event.target.value
            )
          }
        >
          <option value="">
            Виберіть
          </option>

          {school.subjects.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.title}
              </option>
            )
          )}
        </select>
      </Field>

      <Field title="Статус">
        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="present">
            Присутній
          </option>

          <option value="late">
            Запізнення
          </option>

          <option value="absent">
            Відсутній
          </option>
        </select>
      </Field>

      <Field title="Дата">
        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(
              event.target.value
            )
          }
        />
      </Field>
    </SchoolModal>
  );
}

function CreateAnnouncement({
  school,
  onClose,
  onCreate,
}) {
  const [title, setTitle] =
    useState("");

  const [text, setText] =
    useState("");

  const [scope, setScope] =
    useState("school");

  const [classId, setClassId] =
    useState("");

  const [priority, setPriority] =
    useState("normal");

  return (
    <SchoolModal
      title="Нове оголошення"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose}>
            Скасувати
          </button>

          <button
            className="primary"
            disabled={
              !title.trim() ||
              !text.trim()
            }
            onClick={() =>
              onCreate({
                id:
                  createId(
                    "announcement"
                  ),

                title:
                  title.trim(),

                text:
                  text.trim(),

                scope,

                classId:
                  scope === "class"
                    ? classId
                    : null,

                priority,

                date: todayISO(),

                createdAt:
                  Date.now(),
              })
            }
          >
            Опублікувати
          </button>
        </>
      }
    >
      <Field title="Заголовок">
        <input
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
        />
      </Field>

      <Field title="Текст">
        <textarea
          value={text}
          onChange={(event) =>
            setText(
              event.target.value
            )
          }
        />
      </Field>

      <Field title="Для кого">
        <select
          value={scope}
          onChange={(event) =>
            setScope(
              event.target.value
            )
          }
        >
          <option value="school">
            Вся школа
          </option>

          <option value="class">
            Окремий клас
          </option>
        </select>
      </Field>

      {scope === "class" && (
        <Field title="Клас">
          <select
            value={classId}
            onChange={(event) =>
              setClassId(
                event.target.value
              )
            }
          >
            <option value="">
              Виберіть
            </option>

            {school.classes.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>
              )
            )}
          </select>
        </Field>
      )}

      <Field title="Пріоритет">
        <select
          value={priority}
          onChange={(event) =>
            setPriority(
              event.target.value
            )
          }
        >
          <option value="normal">
            Звичайне
          </option>

          <option value="important">
            🔴 Важливе
          </option>
        </select>
      </Field>
    </SchoolModal>
  );
}