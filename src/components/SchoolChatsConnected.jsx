import {
  useMemo,
  useState,
} from "react";

import "./SchoolChatsConnected.css";

import {
  openClassChat,
  openParentChat,
  openSchoolChat,
  openSubjectChat,
} from "./schoolChatBridge";

/* =========================================================
   YATUT SCHOOL CHATS CONNECTED
========================================================= */

function personName(person) {
  if (!person) {
    return "—";
  }

  return `${person.name || ""} ${
    person.surname || ""
  }`.trim();
}

function ChatCard({
  icon,
  eyebrow,
  title,
  text,
  members,
  privateChat = false,
  onClick,
  loading,
}) {
  return (
    <button
      className="school-connected-chat-card"
      onClick={onClick}
      disabled={loading}
    >
      <div className="school-connected-chat-icon">
        {icon}
      </div>

      <section>
        <span>
          {eyebrow}
        </span>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

        <div>
          <small>
            👥 {members}
          </small>

          {privateChat && (
            <small>
              🔒 Закритий
            </small>
          )}
        </div>
      </section>

      <b>
        {loading
          ? "•••"
          : "→"}
      </b>
    </button>
  );
}

export default function SchoolChatsConnected({
  space,
  school,
  viewRole = "director",
  student = null,
  onNavigate,
}) {
  const [
    loadingId,
    setLoadingId,
  ] = useState(null);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState(
    student?.classId ||
      school.classes[0]?.id ||
      ""
  );

  const selectedClass =
    school.classes.find(
      (item) =>
        item.id ===
        selectedClassId
    );

  const classStudents =
    useMemo(
      () =>
        school.students.filter(
          (item) =>
            item.classId ===
            selectedClassId
        ),
      [
        school.students,
        selectedClassId,
      ]
    );

  const classTeachers =
    useMemo(
      () =>
        school.teachers.filter(
          (teacher) =>
            teacher.classIds?.includes(
              selectedClassId
            )
        ),
      [
        school.teachers,
        selectedClassId,
      ]
    );

  const classParents =
    useMemo(() => {
      const studentIds =
        classStudents.map(
          (item) =>
            item.id
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
    }, [
      school.parents,
      classStudents,
    ]);

  const classSubjects =
    useMemo(() => {
      return school.subjects.filter(
        (subject) =>
          school.schedule.some(
            (lesson) =>
              lesson.classId ===
                selectedClassId &&
              lesson.subjectId ===
                subject.id
          ) ||
          school.teachers.some(
            (teacher) =>
              teacher.classIds?.includes(
                selectedClassId
              ) &&
              teacher.subjectIds?.includes(
                subject.id
              )
          ) ||
          school.homework.some(
            (homework) =>
              homework.classId ===
                selectedClassId &&
              homework.subjectId ===
                subject.id
          )
      );
    }, [
      school.subjects,
      school.schedule,
      school.teachers,
      school.homework,
      selectedClassId,
    ]);

  const schoolMemberCount =
    new Set([
      ...school.students.map(
        (item) =>
          item.userId ||
          item.id
      ),

      ...school.teachers.map(
        (item) =>
          item.userId ||
          item.id
      ),

      ...school.parents.map(
        (item) =>
          item.userId ||
          item.id
      ),
    ]).size;

  async function run(
    id,
    callback
  ) {
    if (loadingId) {
      return;
    }

    try {
      setLoadingId(id);

      await callback();
    } catch (error) {
      console.error(
        "SCHOOL CHAT ERROR:",
        error
      );

      alert(
        "Не вдалося відкрити чат."
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="school-connected-chats">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="school-connected-chats-header">
        <div>
          <span>
            ЯТУТ MESSENGER
          </span>

          <h1>
            Шкільні чати
          </h1>

          <p>
            Усі чати школи працюють у загальному Messenger ЯТУТ.
          </p>
        </div>

        <div className="school-connected-status">
          <span />
          Підключено
        </div>
      </header>

      {/* =================================================
          SCHOOL
      ================================================= */}

      <section className="school-connected-section">
        <div className="school-connected-section-title">
          <div>
            <span>
              ШКОЛА
            </span>

            <strong>
              Загальний простір
            </strong>
          </div>
        </div>

        <ChatCard
          icon="🏫"
          eyebrow="ЗАГАЛЬНИЙ ЧАТ"
          title={
            space.title ||
            "Школа"
          }
          text="Учні, вчителі, батьки та адміністрація."
          members={
            schoolMemberCount
          }
          loading={
            loadingId ===
            "school"
          }
          onClick={() =>
            run(
              "school",
              () =>
                openSchoolChat({
                  space,
                  school,
                  onNavigate,
                })
            )
          }
        />
      </section>

      {/* =================================================
          CLASS SELECTOR
      ================================================= */}

      {!!school.classes.length && (
        <section className="school-connected-section">
          <div className="school-connected-section-title">
            <div>
              <span>
                КЛАС
              </span>

              <strong>
                Простір класу
              </strong>
            </div>

            <select
              value={
                selectedClassId
              }
              disabled={
                viewRole ===
                  "student" ||
                viewRole ===
                  "parent"
              }
              onChange={(event) =>
                setSelectedClassId(
                  event.target
                    .value
                )
              }
            >
              {school.classes.map(
                (classItem) => (
                  <option
                    key={
                      classItem.id
                    }
                    value={
                      classItem.id
                    }
                  >
                    {
                      classItem.title
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {selectedClass && (
            <>
              <div className="school-connected-class-hero">
                <div>
                  <span>
                    🎓
                  </span>

                  <section>
                    <small>
                      КЛАС
                    </small>

                    <h2>
                      {
                        selectedClass.title
                      }
                    </h2>

                    <p>
                      {classStudents.length} учнів •{" "}
                      {classTeachers.length} вчителів
                    </p>
                  </section>
                </div>

                <div>
                  {classStudents
                    .slice(0, 5)
                    .map(
                      (
                        student
                      ) => (
                        <span
                          key={
                            student.id
                          }
                          title={
                            personName(
                              student
                            )
                          }
                        >
                          {student
                            .name?.[0] ||
                            "У"}
                        </span>
                      )
                    )}

                  {classStudents.length >
                    5 && (
                    <span>
                      +
                      {classStudents.length -
                        5}
                    </span>
                  )}
                </div>
              </div>

              <div className="school-connected-grid">
                {/* CLASS CHAT */}

                <ChatCard
                  icon="🎓"
                  eyebrow="ЧАТ КЛАСУ"
                  title={
                    selectedClass.title
                  }
                  text="Учні та вчителі класу."
                  members={
                    classStudents.length +
                    classTeachers.length
                  }
                  loading={
                    loadingId ===
                    "class"
                  }
                  onClick={() =>
                    run(
                      "class",
                      () =>
                        openClassChat({
                          space,
                          school,

                          classId:
                            selectedClass.id,

                          onNavigate,
                        })
                    )
                  }
                />

                {/* PARENTS */}

                {(viewRole ===
                  "director" ||
                  viewRole ===
                    "teacher" ||
                  viewRole ===
                    "parent") && (
                  <ChatCard
                    icon="👨‍👩‍👧"
                    eyebrow="БАТЬКІВСЬКИЙ ЧАТ"
                    title={`Батьки ${selectedClass.title}`}
                    text="Батьки класу та класний керівник."
                    members={
                      classParents.length +
                      1
                    }
                    privateChat
                    loading={
                      loadingId ===
                      "parents"
                    }
                    onClick={() =>
                      run(
                        "parents",
                        () =>
                          openParentChat({
                            space,
                            school,

                            classId:
                              selectedClass.id,

                            onNavigate,
                          })
                      )
                    }
                  />
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* =================================================
          SUBJECT CHATS
      ================================================= */}

      {selectedClass &&
        classSubjects.length >
          0 && (
        <section className="school-connected-section">
          <div className="school-connected-section-title">
            <div>
              <span>
                ПРЕДМЕТИ
              </span>

              <strong>
                Чати предметів
              </strong>
            </div>

            <small>
              {
                classSubjects.length
              }{" "}
              чатів
            </small>
          </div>

          <div className="school-connected-subject-grid">
            {classSubjects.map(
              (subject) => {
                const teachers =
                  school.teachers.filter(
                    (teacher) =>
                      teacher.classIds?.includes(
                        selectedClass.id
                      ) &&
                      teacher.subjectIds?.includes(
                        subject.id
                      )
                  );

                const id =
                  `subject-${subject.id}`;

                return (
                  <ChatCard
                    key={
                      subject.id
                    }
                    icon={
                      subject.icon ||
                      "📚"
                    }
                    eyebrow="ПРЕДМЕТНИЙ ЧАТ"
                    title={`${subject.title} • ${selectedClass.title}`}
                    text={
                      teachers.length
                        ? teachers
                            .map(
                              personName
                            )
                            .join(", ")
                        : "Вчителя не призначено"
                    }
                    members={
                      classStudents.length +
                      teachers.length
                    }
                    loading={
                      loadingId ===
                      id
                    }
                    onClick={() =>
                      run(
                        id,
                        () =>
                          openSubjectChat({
                            space,
                            school,

                            classId:
                              selectedClass.id,

                            subjectId:
                              subject.id,

                            onNavigate,
                          })
                      )
                    }
                  />
                );
              }
            )}
          </div>
        </section>
      )}

      {!school.classes.length && (
        <div className="school-connected-empty">
          <span>
            💬
          </span>

          <strong>
            Спочатку створіть клас
          </strong>

          <p>
            Після створення класу ЯТУТ зможе створити чат класу, батьків та предметів.
          </p>
        </div>
      )}
    </section>
  );
}