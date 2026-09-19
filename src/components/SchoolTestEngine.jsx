import { useMemo, useState } from "react";

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* =========================================================
   QUESTION EDITOR
========================================================= */

function QuestionEditor({
  question,
  index,
  onChange,
  onDelete,
}) {
  const update = (patch) => {
    onChange({
      ...question,
      ...patch,
    });
  };

  const updateOption = (optionId, text) => {
    update({
      options: question.options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              text,
            }
          : option
      ),
    });
  };

  const addOption = () => {
    update({
      options: [
        ...question.options,
        {
          id: createId("option"),
          text: "",
        },
      ],
    });
  };

  const deleteOption = (optionId) => {
    update({
      options: question.options.filter(
        (option) => option.id !== optionId
      ),

      correctOptionId:
        question.correctOptionId === optionId
          ? null
          : question.correctOptionId,
    });
  };

  return (
    <article className="school-test-question-editor">
      <header>
        <div>
          <span>ПИТАННЯ {index + 1}</span>

          <select
            value={question.type}
            onChange={(event) =>
              update({
                type: event.target.value,
                correctOptionId: null,
              })
            }
          >
            <option value="single">
              Один правильний варіант
            </option>

            <option value="text">
              Текстова відповідь
            </option>
          </select>
        </div>

        <button
          type="button"
          onClick={onDelete}
        >
          🗑
        </button>
      </header>

      <label>
        <span>Текст питання</span>

        <textarea
          value={question.title}
          onChange={(event) =>
            update({
              title: event.target.value,
            })
          }
          placeholder="Напишіть питання..."
        />
      </label>

      <div className="school-test-question-meta">
        <label>
          <span>Балів</span>

          <input
            type="number"
            min="1"
            value={question.points}
            onChange={(event) =>
              update({
                points: Number(event.target.value) || 1,
              })
            }
          />
        </label>
      </div>

      {question.type === "single" && (
        <div className="school-test-options-editor">
          <span className="school-test-editor-label">
            Варіанти відповідей
          </span>

          {question.options.map((option, optionIndex) => (
            <div
              key={option.id}
              className="school-test-option-editor"
            >
              <button
                type="button"
                className={
                  question.correctOptionId === option.id
                    ? "correct"
                    : ""
                }
                onClick={() =>
                  update({
                    correctOptionId: option.id,
                  })
                }
                title="Позначити правильну відповідь"
              >
                {question.correctOptionId === option.id
                  ? "✓"
                  : optionIndex + 1}
              </button>

              <input
                value={option.text}
                onChange={(event) =>
                  updateOption(
                    option.id,
                    event.target.value
                  )
                }
                placeholder={`Варіант ${optionIndex + 1}`}
              />

              {question.options.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    deleteOption(option.id)
                  }
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            className="school-test-add-option"
            type="button"
            onClick={addOption}
          >
            + Додати варіант
          </button>
        </div>
      )}

      {question.type === "text" && (
        <div className="school-test-text-hint">
          ✍️ Учень вводить відповідь текстом. Учитель перевіряє її
          вручну.
        </div>
      )}
    </article>
  );
}

/* =========================================================
   TEST BUILDER
========================================================= */

export function SchoolTestBuilder({
  school,
  initialClassId = "",
  initialSubjectId = "",
  onClose,
  onCreate,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [classId, setClassId] = useState(initialClassId);
  const [subjectId, setSubjectId] = useState(initialSubjectId);

  const [dueDate, setDueDate] = useState(todayISO());
  const [timeLimit, setTimeLimit] = useState(20);
  const [attempts, setAttempts] = useState(1);

  const [questions, setQuestions] = useState([
    {
      id: createId("question"),
      type: "single",
      title: "",
      points: 1,
      correctOptionId: null,

      options: [
        {
          id: createId("option"),
          text: "",
        },
        {
          id: createId("option"),
          text: "",
        },
      ],
    },
  ]);

  const totalPoints = questions.reduce(
    (sum, question) => sum + Number(question.points || 0),
    0
  );

  const addQuestion = (type = "single") => {
    setQuestions((previous) => [
      ...previous,
      {
        id: createId("question"),
        type,
        title: "",
        points: 1,
        correctOptionId: null,

        options:
          type === "single"
            ? [
                {
                  id: createId("option"),
                  text: "",
                },
                {
                  id: createId("option"),
                  text: "",
                },
              ]
            : [],
      },
    ]);
  };

  const updateQuestion = (index, nextQuestion) => {
    setQuestions((previous) =>
      previous.map((question, questionIndex) =>
        questionIndex === index
          ? nextQuestion
          : question
      )
    );
  };

  const deleteQuestion = (index) => {
    setQuestions((previous) =>
      previous.filter((_, questionIndex) => questionIndex !== index)
    );
  };

  const canPublish =
    title.trim() &&
    classId &&
    subjectId &&
    questions.length &&
    questions.every((question) => {
      if (!question.title.trim()) {
        return false;
      }

      if (
        question.type === "single" &&
        (!question.correctOptionId ||
          question.options.some(
            (option) => !option.text.trim()
          ))
      ) {
        return false;
      }

      return true;
    });

  const publish = () => {
    if (!canPublish) {
      return;
    }

    onCreate({
      id: createId("test"),

      title: title.trim(),
      description: description.trim(),

      classId,
      subjectId,

      dueDate,

      timeLimit: Number(timeLimit),
      attemptsAllowed: Number(attempts),

      questions,

      totalPoints,

      published: true,

      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div
      className="school-test-builder-backdrop"
      onClick={onClose}
    >
      <section
        className="school-test-builder"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="school-test-builder-header">
          <div>
            <span>TEST BUILDER</span>

            <h2>Конструктор тесту</h2>

            <p>
              Створіть повноцінний тест для учнів.
            </p>
          </div>

          <button
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="school-test-builder-layout">
          <main>
            <section className="school-test-builder-settings">
              <label>
                <span>Назва тесту</span>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Контрольна робота №1"
                />
              </label>

              <label>
                <span>Опис</span>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Інструкція для учнів..."
                />
              </label>

              <div>
                <label>
                  <span>Клас</span>

                  <select
                    value={classId}
                    onChange={(event) =>
                      setClassId(event.target.value)
                    }
                  >
                    <option value="">
                      Виберіть
                    </option>

                    {school.classes.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Предмет</span>

                  <select
                    value={subjectId}
                    onChange={(event) =>
                      setSubjectId(event.target.value)
                    }
                  >
                    <option value="">
                      Виберіть
                    </option>

                    {school.subjects.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <div className="school-test-builder-questions-heading">
              <div>
                <span>ПИТАННЯ</span>

                <strong>
                  {questions.length}
                </strong>
              </div>

              <div>
                <button
                  onClick={() =>
                    addQuestion("single")
                  }
                >
                  + Варіанти
                </button>

                <button
                  onClick={() =>
                    addQuestion("text")
                  }
                >
                  + Текстове
                </button>
              </div>
            </div>

            <div className="school-test-builder-questions">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onChange={(nextQuestion) =>
                    updateQuestion(index, nextQuestion)
                  }
                  onDelete={() =>
                    deleteQuestion(index)
                  }
                />
              ))}
            </div>
          </main>

          <aside>
            <section className="school-test-builder-side-card">
              <span>НАЛАШТУВАННЯ</span>

              <label>
                <small>Дедлайн</small>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                />
              </label>

              <label>
                <small>
                  Час на проходження
                </small>

                <div>
                  <input
                    type="number"
                    min="1"
                    value={timeLimit}
                    onChange={(event) =>
                      setTimeLimit(event.target.value)
                    }
                  />

                  <span>хв</span>
                </div>
              </label>

              <label>
                <small>
                  Кількість спроб
                </small>

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={attempts}
                  onChange={(event) =>
                    setAttempts(event.target.value)
                  }
                />
              </label>
            </section>

            <section className="school-test-builder-side-card">
              <span>ТЕСТ</span>

              <div className="school-test-builder-stat">
                <strong>
                  {questions.length}
                </strong>

                <small>
                  питань
                </small>
              </div>

              <div className="school-test-builder-stat">
                <strong>
                  {totalPoints}
                </strong>

                <small>
                  балів
                </small>
              </div>
            </section>
          </aside>
        </div>

        <footer className="school-test-builder-footer">
          <button
            onClick={onClose}
          >
            Скасувати
          </button>

          <button
            className="primary"
            disabled={!canPublish}
            onClick={publish}
          >
            Опублікувати тест
          </button>
        </footer>
      </section>
    </div>
  );
}

/* =========================================================
   TEST PLAYER
========================================================= */

export function SchoolTestPlayer({
  test,
  school,
  student,
  onClose,
  onSubmit,
}) {
  const [answers, setAnswers] = useState({});

  const questions =
    test.questions || [];

  const answeredCount =
    questions.filter(
      (question) =>
        answers[question.id] !== undefined &&
        answers[question.id] !== ""
    ).length;

  const submit = () => {
    let autoPoints = 0;
    let manualReviewRequired = false;

    const answerRows =
      questions.map((question) => {
        const answer =
          answers[question.id];

        let correct = null;
        let points = 0;

        if (
          question.type === "single"
        ) {
          correct =
            answer ===
            question.correctOptionId;

          if (correct) {
            points =
              Number(
                question.points
              ) || 0;

            autoPoints +=
              points;
          }
        } else {
          manualReviewRequired =
            true;
        }

        return {
          questionId:
            question.id,

          answer,

          correct,

          points,
        };
      });

    onSubmit({
      id: createId(
        "test-attempt"
      ),

      testId:
        test.id,

      studentId:
        student.id,

      answers:
        answerRows,

      autoPoints,

      totalPoints:
        test.totalPoints ||
        0,

      manualReviewRequired,

      status:
        manualReviewRequired
          ? "review"
          : "completed",

      startedAt:
        Date.now(),

      submittedAt:
        Date.now(),
    });
  };

  return (
    <div
      className="school-test-player-backdrop"
      onClick={onClose}
    >
      <section
        className="school-test-player"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header>
          <div>
            <span>
              {school.subjects.find(
                (subject) =>
                  subject.id ===
                  test.subjectId
              )?.title || "Тест"}
            </span>

            <h2>
              {test.title}
            </h2>

            <p>
              {student
                ? `${student.name} ${student.surname || ""}`
                : ""}
            </p>
          </div>

          <button
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="school-test-player-progress">
          <span
            style={{
              width: `${
                questions.length
                  ? (answeredCount /
                      questions.length) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>

        <main>
          {questions.map((question, index) => (
            <article
              key={question.id}
              className="school-test-player-question"
            >
              <header>
                <span>
                  {index + 1}
                </span>

                <div>
                  <strong>
                    {question.title}
                  </strong>

                  <small>
                    {question.points} бал.
                  </small>
                </div>
              </header>

              {question.type ===
                "single" && (
                <div className="school-test-player-options">
                  {question.options.map(
                    (option) => (
                      <button
                        key={option.id}
                        className={
                          answers[
                            question.id
                          ] === option.id
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setAnswers(
                            (previous) => ({
                              ...previous,

                              [question.id]:
                                option.id,
                            })
                          )
                        }
                      >
                        <b>
                          {answers[
                            question.id
                          ] === option.id
                            ? "✓"
                            : ""}
                        </b>

                        {option.text}
                      </button>
                    )
                  )}
                </div>
              )}

              {question.type ===
                "text" && (
                <textarea
                  className="school-test-player-text"
                  value={
                    answers[
                      question.id
                    ] || ""
                  }
                  onChange={(event) =>
                    setAnswers(
                      (previous) => ({
                        ...previous,

                        [question.id]:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Ваша відповідь..."
                />
              )}
            </article>
          ))}
        </main>

        <footer>
          <div>
            <strong>
              {answeredCount}/
              {questions.length}
            </strong>

            <span>
              відповідей
            </span>
          </div>

          <button
            disabled={
              !answeredCount
            }
            onClick={submit}
          >
            Завершити тест
          </button>
        </footer>
      </section>
    </div>
  );
}