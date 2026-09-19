import {
  useMemo,
  useState,
} from "react";

import {
  Crown,
  FileText,
  Image,
  Mic,
  Search,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Users,
  Video,
  X,
} from "lucide-react";

import "../../styles/chat-management.css";

const PEOPLE = {
  me: {
    id: "me",
    name: "Вадим",
    username: "vadim",
    initials: "В",
    online: true,
  },

  maria: {
    id: "maria",
    name: "Марія Коваль",
    username: "maria.koval",
    initials: "М",
    online: true,
  },

  oleksandr: {
    id: "oleksandr",
    name: "Олександр Бондар",
    username: "bondar",
    initials: "О",
    online: true,
  },

  anastasia: {
    id: "anastasia",
    name: "Анастасія Мельник",
    username: "nastia",
    initials: "А",
    online: false,
  },

  max: {
    id: "max",
    name: "Максим Шевченко",
    username: "max.sh",
    initials: "М",
    online: false,
  },

  sofia: {
    id: "sofia",
    name: "Софія Романенко",
    username: "sofia.r",
    initials: "С",
    online: true,
  },

  vlad: {
    id: "vlad",
    name: "Владислав Мороз",
    username: "vlad.moroz",
    initials: "В",
    online: false,
  },

  yulia: {
    id: "yulia",
    name: "Юлія Савченко",
    username: "yulia.s",
    initials: "Ю",
    online: true,
  },
};

function personName(
  id
) {
  if (id === "me") {
    return "Ви";
  }

  return (
    PEOPLE[id]?.name ||
    "Користувач"
  );
}

function personInitials(
  id
) {
  return (
    PEOPLE[id]?.initials ||
    "?"
  );
}

/* =========================================================
   GROUP MANAGEMENT
========================================================= */

export function GroupManagementModal({
  chat,
  onClose,
  onSave,
}) {
  const [
    title,
    setTitle,
  ] = useState(
    chat?.title || ""
  );

  const [
    members,
    setMembers,
  ] = useState(
    Array.isArray(
      chat?.members
    )
      ? chat.members
      : ["me"]
  );

  const [
    admins,
    setAdmins,
  ] = useState(
    Array.isArray(
      chat?.admins
    )
      ? chat.admins
      : ["me"]
  );

  const [
    query,
    setQuery,
  ] = useState("");

  if (!chat) {
    return null;
  }

  const availablePeople =
    Object.values(
      PEOPLE
    )
      .filter(
        (person) =>
          person.id !==
          "me"
      )
      .filter(
        (person) =>
          person.name
            .toLowerCase()
            .includes(
              query
                .trim()
                .toLowerCase()
            ) ||
          person.username
            .toLowerCase()
            .includes(
              query
                .trim()
                .toLowerCase()
            )
      );

  function toggleMember(
    id
  ) {
    if (id === "me") {
      return;
    }

    setMembers(
      (previous) => {
        const exists =
          previous.includes(
            id
          );

        if (exists) {
          setAdmins(
            (oldAdmins) =>
              oldAdmins.filter(
                (adminId) =>
                  adminId !==
                  id
              )
          );

          return previous.filter(
            (memberId) =>
              memberId !==
              id
          );
        }

        return [
          ...previous,
          id,
        ];
      }
    );
  }

  function toggleAdmin(
    id
  ) {
    if (
      id === "me" ||
      !members.includes(
        id
      )
    ) {
      return;
    }

    setAdmins(
      (previous) =>
        previous.includes(
          id
        )
          ? previous.filter(
              (adminId) =>
                adminId !==
                id
            )
          : [
              ...previous,
              id,
            ]
    );
  }

  function save() {
    const cleanTitle =
      title.trim();

    if (
      !cleanTitle ||
      members.length <
        2
    ) {
      return;
    }

    onSave?.({
      ...chat,

      title:
        cleanTitle,

      initials:
        cleanTitle[0]
          ?.toUpperCase() ||
        "Г",

      members,

      admins:
        admins.includes(
          "me"
        )
          ? admins
          : [
              "me",
              ...admins,
            ],

      updatedAt:
        Date.now(),
    });
  }

  return (
    <div
      className="yatut-chat-modal-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="yatut-group-manage-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="yatut-chat-manage-header">
          <div>
            <span>
              ЯТУТ
            </span>

            <h2>
              Налаштування групи
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            <X
              size={19}
            />
          </button>
        </header>

        <div className="yatut-group-manage-body">
          <label className="yatut-group-title-field">
            <span>
              Назва групи
            </span>

            <input
              value={
                title
              }
              onChange={(
                event
              ) =>
                setTitle(
                  event.target
                    .value
                )
              }
              placeholder="Назва групи"
            />
          </label>

          <section className="yatut-group-members-current">
            <div className="yatut-manage-section-title">
              <Users
                size={16}
              />

              <strong>
                Учасники
              </strong>

              <span>
                {
                  members.length
                }
              </span>
            </div>

            <div className="yatut-group-member-list">
              {members.map(
                (id) => {
                  const isAdmin =
                    admins.includes(
                      id
                    );

                  return (
                    <div
                      key={
                        id
                      }
                      className="yatut-group-member"
                    >
                      <div className="yatut-group-member-avatar">
                        {
                          personInitials(
                            id
                          )
                        }

                        {PEOPLE[id]
                          ?.online && (
                          <i />
                        )}
                      </div>

                      <div className="yatut-group-member-copy">
                        <strong>
                          {
                            personName(
                              id
                            )
                          }
                        </strong>

                        <span>
                          {isAdmin
                            ? "Адміністратор"
                            : "Учасник"}
                        </span>
                      </div>

                      {isAdmin && (
                        <Crown
                          size={15}
                          className="yatut-admin-crown"
                        />
                      )}

                      {id !==
                        "me" && (
                        <div className="yatut-group-member-actions">
                          <button
                            type="button"
                            className={
                              isAdmin
                                ? "is-admin"
                                : ""
                            }
                            onClick={() =>
                              toggleAdmin(
                                id
                              )
                            }
                            title={
                              isAdmin
                                ? "Зняти адміністратора"
                                : "Зробити адміністратором"
                            }
                          >
                            <ShieldCheck
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="is-remove"
                            onClick={() =>
                              toggleMember(
                                id
                              )
                            }
                            title="Видалити з групи"
                          >
                            <UserMinus
                              size={15}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <section className="yatut-group-add-people">
            <div className="yatut-manage-section-title">
              <UserPlus
                size={16}
              />

              <strong>
                Додати людей
              </strong>
            </div>

            <label className="yatut-manage-search">
              <Search
                size={15}
              />

              <input
                value={
                  query
                }
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Пошук друзів"
              />
            </label>

            <div className="yatut-group-add-list">
              {availablePeople.map(
                (person) => {
                  const active =
                    members.includes(
                      person.id
                    );

                  return (
                    <button
                      key={
                        person.id
                      }
                      type="button"
                      className={
                        active
                          ? "is-added"
                          : ""
                      }
                      onClick={() =>
                        toggleMember(
                          person.id
                        )
                      }
                    >
                      <span className="yatut-group-add-avatar">
                        {
                          person.initials
                        }

                        {person.online && (
                          <i />
                        )}
                      </span>

                      <div>
                        <strong>
                          {
                            person.name
                          }
                        </strong>

                        <small>
                          @
                          {
                            person.username
                          }
                        </small>
                      </div>

                      <b>
                        {active
                          ? "✓"
                          : "+"}
                      </b>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        </div>

        <footer className="yatut-group-manage-footer">
          <span>
            {
              members.length
            }{" "}
            учасників ·{" "}
            {
              admins.length
            }{" "}
            адміністраторів
          </span>

          <div>
            <button
              type="button"
              className="is-secondary"
              onClick={
                onClose
              }
            >
              Скасувати
            </button>

            <button
              type="button"
              className="is-primary"
              disabled={
                !title.trim() ||
                members.length <
                  2
              }
              onClick={
                save
              }
            >
              Зберегти
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

/* =========================================================
   MEDIA + FILES
========================================================= */

const MEDIA_TABS = [
  {
    id: "all",
    label: "Усе",
  },

  {
    id: "image",
    label: "Фото",
    Icon: Image,
  },

  {
    id: "video",
    label: "Відео",
    Icon: Video,
  },

  {
    id: "file",
    label: "Файли",
    Icon: FileText,
  },

  {
    id: "voice",
    label: "Голосові",
    Icon: Mic,
  },
];

export function ChatMediaModal({
  chat,
  messages = [],
  onClose,
}) {
  const [
    tab,
    setTab,
  ] = useState(
    "all"
  );

  const mediaMessages =
    useMemo(
      () =>
        messages
          .filter(
            (message) =>
              [
                "image",
                "video",
                "file",
                "voice",
              ].includes(
                message.type
              )
          )
          .sort(
            (a, b) =>
              (b.createdAt ||
                0) -
              (a.createdAt ||
                0)
          ),
      [messages]
    );

  const filtered =
    tab === "all"
      ? mediaMessages
      : mediaMessages.filter(
          (message) =>
            message.type ===
            tab
        );

  const counts =
    useMemo(
      () => ({
        all:
          mediaMessages.length,

        image:
          mediaMessages.filter(
            (item) =>
              item.type ===
              "image"
          ).length,

        video:
          mediaMessages.filter(
            (item) =>
              item.type ===
              "video"
          ).length,

        file:
          mediaMessages.filter(
            (item) =>
              item.type ===
              "file"
          ).length,

        voice:
          mediaMessages.filter(
            (item) =>
              item.type ===
              "voice"
          ).length,
      }),
      [mediaMessages]
    );

  return (
    <div
      className="yatut-chat-modal-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="yatut-chat-media-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="yatut-chat-manage-header">
          <div>
            <span>
              ЯТУТ
            </span>

            <h2>
              Медіа та файли
            </h2>

            <small>
              {chat?.title ||
                "Чат"}
            </small>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            <X
              size={19}
            />
          </button>
        </header>

        <nav className="yatut-chat-media-tabs">
          {MEDIA_TABS.map(
            ({
              id,
              label,
              Icon,
            }) => (
              <button
                key={
                  id
                }
                type="button"
                className={
                  tab === id
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setTab(
                    id
                  )
                }
              >
                {Icon && (
                  <Icon
                    size={14}
                  />
                )}

                {
                  label
                }

                <span>
                  {
                    counts[id]
                  }
                </span>
              </button>
            )
          )}
        </nav>

        <div className="yatut-chat-media-body">
          {!filtered.length ? (
            <div className="yatut-chat-media-empty">
              <span>
                ◌
              </span>

              <strong>
                Тут поки порожньо
              </strong>

              <small>
                Надіслані фото, відео, файли та голосові з'являться тут.
              </small>
            </div>
          ) : (
            <div className="yatut-chat-media-grid">
              {filtered.map(
                (
                  message
                ) => (
                  <article
                    key={
                      message.id
                    }
                    className={`yatut-chat-media-item type-${message.type}`}
                  >
                    {message.type ===
                      "image" &&
                      message.fileUrl && (
                        <a
                          href={
                            message.fileUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={
                              message.fileUrl
                            }
                            alt=""
                          />
                        </a>
                      )}

                    {message.type ===
                      "video" &&
                      message.fileUrl && (
                        <video
                          src={
                            message.fileUrl
                          }
                          controls
                          playsInline
                        />
                      )}

                    {message.type ===
                      "file" && (
                        <a
                          className="yatut-chat-file-card"
                          href={
                            message.fileUrl ||
                            "#"
                          }
                          download={
                            message.fileName
                          }
                        >
                          <FileText
                            size={23}
                          />

                          <div>
                            <strong>
                              {message.fileName ||
                                "Файл"}
                            </strong>

                            <span>
                              Завантажити
                            </span>
                          </div>
                        </a>
                      )}

                    {message.type ===
                      "voice" && (
                        <div className="yatut-chat-voice-card">
                          <Mic
                            size={18}
                          />

                          <audio
                            src={
                              message.fileUrl
                            }
                            controls
                          />
                        </div>
                      )}

                    <footer>
                      <span>
                        {message.senderId ===
                        "me"
                          ? "Ви"
                          : personName(
                              message.senderId
                            )}
                      </span>

                      <small>
                        {new Date(
                          message.createdAt
                        ).toLocaleDateString(
                          "uk-UA",
                          {
                            day:
                              "2-digit",
                            month:
                              "2-digit",
                            year:
                              "2-digit",
                          }
                        )}
                      </small>
                    </footer>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}