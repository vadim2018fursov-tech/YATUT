import { useMemo, useState } from "react";

function formatTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date =
    new Date(timestamp);

  return date.toLocaleString(
    "uk-UA",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function notificationIcon(type) {
  return (
    {
      grade: "⭐",
      attendance: "✅",
      homework: "📝",
      homework_submission: "📨",
      homework_review: "🧑‍🏫",
      test: "🧠",
      test_result: "📊",
      announcement: "📢",
    }[type] || "🔔"
  );
}

export default function SchoolNotifications({
  notifications = [],
  currentRole,
  studentId,
  parent,
  onRead,
}) {
  const [filter, setFilter] =
    useState("all");

  const allowedStudentIds =
    parent?.childIds || [];

  const visible =
    useMemo(() => {
      return notifications
        .filter((item) => {
          if (
            currentRole ===
            "student"
          ) {
            return (
              !item.studentId ||
              item.studentId ===
                studentId
            );
          }

          if (
            currentRole ===
            "parent"
          ) {
            return (
              !item.studentId ||
              allowedStudentIds.includes(
                item.studentId
              )
            );
          }

          return true;
        })
        .filter((item) => {
          if (
            filter === "all"
          ) {
            return true;
          }

          if (
            filter === "unread"
          ) {
            return !item.read;
          }

          return (
            item.type === filter
          );
        })
        .sort(
          (a, b) =>
            (b.createdAt || 0) -
            (a.createdAt || 0)
        );
    }, [
      notifications,
      currentRole,
      studentId,
      allowedStudentIds,
      filter,
    ]);

  return (
    <section className="school-notification-center">
      <div className="school-content-heading">
        <div>
          <span>
            ЦЕНТР АКТИВНОСТІ
          </span>

          <h1>
            Сповіщення
          </h1>

          <p>
            Важливі події школи.
          </p>
        </div>
      </div>

      <div className="school-notification-tabs">
        <button
          className={
            filter === "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("all")
          }
        >
          Усі
        </button>

        <button
          className={
            filter === "unread"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("unread")
          }
        >
          Нові
        </button>

        <button
          className={
            filter === "grade"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("grade")
          }
        >
          ⭐ Оцінки
        </button>

        <button
          className={
            filter === "homework"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("homework")
          }
        >
          📝 Домашні
        </button>

        <button
          className={
            filter === "test"
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter("test")
          }
        >
          🧠 Тести
        </button>
      </div>

      {visible.length ? (
        <div className="school-notification-list">
          {visible.map(
            (item) => (
              <button
                key={item.id}
                className={
                  item.read
                    ? ""
                    : "unread"
                }
                onClick={() =>
                  onRead?.(
                    item.id
                  )
                }
              >
                <span className="school-notification-icon">
                  {notificationIcon(
                    item.type
                  )}
                </span>

                <div>
                  <strong>
                    {item.title}
                  </strong>

                  <p>
                    {item.text}
                  </p>

                  <small>
                    {formatTime(
                      item.createdAt
                    )}
                  </small>
                </div>

                {!item.read && (
                  <b />
                )}
              </button>
            )
          )}
        </div>
      ) : (
        <div className="school-empty">
          <span>
            🔔
          </span>

          <strong>
            Немає сповіщень
          </strong>

          <p>
            Нові події зʼявляться тут.
          </p>
        </div>
      )}
    </section>
  );
}