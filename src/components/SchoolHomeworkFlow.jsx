import { useMemo, useState } from "react";

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function personName(person) {
  if (!person) {
    return "—";
  }

  return `${person.name || ""} ${
    person.surname || ""
  }`.trim();
}

/* =========================================================
   STUDENT HOMEWORK
========================================================= */

export function StudentHomeworkSubmission({
  homework,
  school,
  student,
  existingSubmission,
  onClose,
  onSubmit,
}) {
  const [answer, setAnswer] = useState(
    existingSubmission?.answer || ""
  );

  const submit = () => {
    if (!answer.trim()) {
      return;
    }

    onSubmit({
      id:
        existingSubmission?.id ||
        createId(
          "homework-submission"
        ),

      homeworkId:
        homework.id,

      studentId:
        student.id,

      answer:
        answer.trim(),

      status:
        "review",

      teacherComment:
        existingSubmission
          ?.teacherComment ||
        "",

      grade:
        existingSubmission
          ?.grade ||
        null,

      submittedAt:
        Date.now(),

      updatedAt:
        Date.now(),
    });
  };

  return (
    <div
      className="school-homework-submit-backdrop"
      onClick={onClose}
    >
      <section
        className="school-homework-submit-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header>
          <div>
            <span>
              ДОМАШНЯ РОБОТА
            </span>

            <h2>
              {homework.title}
            </h2>

            <p>
              {school.subjects.find(
                (subject) =>
                  subject.id ===
                  homework.subjectId
              )?.title || "Предмет"}
            </p>
          </div>

          <button
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="school-homework-submit-task">
          <strong>
            Завдання
          </strong>

          <p>
            {homework.description ||
              "Опис відсутній."}
          </p>

          <span>
            Здати до{" "}
            {homework.dueDate}
          </span>
        </div>

        <label className="school-homework-answer-field">
          <span>
            Ваша відповідь
          </span>

          <textarea
            value={answer}
            onChange={(event) =>
              setAnswer(
                event.target.value
              )
            }
            placeholder="Напишіть відповідь або опис виконаної роботи..."
          />
        </label>

        <div className="school-homework-future-upload">
          <button>
            📎 Додати файл
          </button>

          <button>
            🖼 Фото
          </button>

          <small>
            Файли підключимо на наступному етапі.
          </small>
        </div>

        {existingSubmission
          ?.teacherComment && (
          <div className="school-homework-teacher-comment">
            <span>
              🧑‍🏫 Коментар учителя
            </span>

            <p>
              {
                existingSubmission.teacherComment
              }
            </p>
          </div>
        )}

        <footer>
          <button
            onClick={onClose}
          >
            Скасувати
          </button>

          <button
            className="primary"
            disabled={!answer.trim()}
            onClick={submit}
          >
            {existingSubmission
              ? "Надіслати повторно"
              : "Здати роботу"}
          </button>
        </footer>
      </section>
    </div>
  );
}

/* =========================================================
   TEACHER REVIEW LIST
========================================================= */

export function TeacherHomeworkReview({
  school,
  submissions,
  onReview,
}) {
  const [status, setStatus] = useState("all");
  const [homeworkId, setHomeworkId] = useState("all");

  const visible = useMemo(() => {
    return submissions.filter(
      (submission) => {
        const statusMatch =
          status === "all" ||
          submission.status ===
            status;

        const homeworkMatch =
          homeworkId === "all" ||
          submission.homeworkId ===
            homeworkId;

        return (
          statusMatch &&
          homeworkMatch
        );
      }
    );
  }, [
    submissions,
    status,
    homeworkId,
  ]);

  return (
    <section className="school-homework-review">
      <div className="school-content-heading">
        <div>
          <span>
            ПЕРЕВІРКА РОБІТ
          </span>

          <h1>
            Роботи учнів
          </h1>

          <p>
            {submissions.length} здач
          </p>
        </div>
      </div>

      <div className="school-homework-review-filters">
        <select
          value={homeworkId}
          onChange={(event) =>
            setHomeworkId(
              event.target.value
            )
          }
        >
          <option value="all">
            Усі завдання
          </option>

          {school.homework.map(
            (homework) => (
              <option
                key={homework.id}
                value={homework.id}
              >
                {homework.title}
              </option>
            )
          )}
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="all">
            Усі статуси
          </option>

          <option value="review">
            На перевірці
          </option>

          <option value="accepted">
            Прийнято
          </option>

          <option value="returned">
            Повернуто
          </option>
        </select>
      </div>

      {visible.length ? (
        <div className="school-homework-review-list">
          {visible.map(
            (submission) => {
              const student =
                school.students.find(
                  (item) =>
                    item.id ===
                    submission.studentId
                );

              const homework =
                school.homework.find(
                  (item) =>
                    item.id ===
                    submission.homeworkId
                );

              return (
                <article
                  key={
                    submission.id
                  }
                >
                  <div className="school-homework-review-avatar">
                    {student?.name?.[0] ||
                      "У"}
                  </div>

                  <section>
                    <span>
                      {homework?.title ||
                        "Домашня робота"}
                    </span>

                    <strong>
                      {personName(
                        student
                      )}
                    </strong>

                    <p>
                      {
                        submission.answer
                      }
                    </p>
                  </section>

                  <div className="school-homework-review-right">
                    <span
                      className={`status ${submission.status}`}
                    >
                      {submission.status ===
                      "review"
                        ? "На перевірці"
                        : submission.status ===
                          "accepted"
                        ? "Прийнято"
                        : "Повернуто"}
                    </span>

                    {submission.grade && (
                      <strong>
                        ⭐{" "}
                        {
                          submission.grade
                        }
                      </strong>
                    )}

                    <button
                      onClick={() =>
                        onReview(
                          submission
                        )
                      }
                    >
                      Перевірити
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      ) : (
        <div className="school-empty">
          <span>
            📭
          </span>

          <strong>
            Робіт немає
          </strong>

          <p>
            Нові здачі учнів зʼявляться тут.
          </p>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   TEACHER REVIEW MODAL
========================================================= */

export function HomeworkReviewModal({
  submission,
  school,
  onClose,
  onSave,
}) {
  const [status, setStatus] = useState(
    submission.status ||
      "review"
  );

  const [grade, setGrade] = useState(
    submission.grade || ""
  );

  const [comment, setComment] = useState(
    submission.teacherComment ||
      ""
  );

  const student =
    school.students.find(
      (item) =>
        item.id ===
        submission.studentId
    );

  const homework =
    school.homework.find(
      (item) =>
        item.id ===
        submission.homeworkId
    );

  return (
    <div
      className="school-homework-review-backdrop"
      onClick={onClose}
    >
      <section
        className="school-homework-review-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header>
          <div>
            <span>
              ПЕРЕВІРКА РОБОТИ
            </span>

            <h2>
              {personName(
                student
              )}
            </h2>

            <p>
              {homework?.title}
            </p>
          </div>

          <button
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <section className="school-homework-review-answer">
          <span>
            ВІДПОВІДЬ УЧНЯ
          </span>

          <p>
            {
              submission.answer
            }
          </p>
        </section>

        <div className="school-homework-review-form">
          <label>
            <span>
              Статус
            </span>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
            >
              <option value="review">
                На перевірці
              </option>

              <option value="accepted">
                Прийняти
              </option>

              <option value="returned">
                Повернути на доопрацювання
              </option>
            </select>
          </label>

          <label>
            <span>
              Оцінка
            </span>

            <select
              value={grade}
              onChange={(event) =>
                setGrade(
                  event.target.value
                )
              }
            >
              <option value="">
                Без оцінки
              </option>

              {Array.from({
                length: 12,
              }).map(
                (_, index) => (
                  <option
                    key={index + 1}
                    value={index + 1}
                  >
                    {index + 1}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="comment">
            <span>
              Коментар
            </span>

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              placeholder="Коментар для учня..."
            />
          </label>
        </div>

        <footer>
          <button
            onClick={onClose}
          >
            Скасувати
          </button>

          <button
            className="primary"
            onClick={() =>
              onSave({
                ...submission,

                status,

                grade:
                  grade
                    ? Number(grade)
                    : null,

                teacherComment:
                  comment.trim(),

                reviewedAt:
                  Date.now(),

                updatedAt:
                  Date.now(),
              })
            }
          >
            Зберегти
          </button>
        </footer>
      </section>
    </div>
  );
}