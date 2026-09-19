import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  deleteCommunity,
  getChat,
  getCommunities,
  saveChat,
  saveCommunity,
  saveMessage,
} from "../storage/database";

/* =========================================================
   PEOPLE
========================================================= */

const PEOPLE = {
  me: {
    id: "me",
    name: "Вадим",
    initials: "В",
    username: "vadim",
  },

  maria: {
    id: "maria",
    name: "Марія Коваль",
    initials: "М",
    username: "maria.koval",
  },

  oleksandr: {
    id: "oleksandr",
    name: "Олександр Бондар",
    initials: "О",
    username: "bondar",
  },

  anastasia: {
    id: "anastasia",
    name: "Анастасія Мельник",
    initials: "А",
    username: "nastia",
  },

  max: {
    id: "max",
    name: "Максим Шевченко",
    initials: "М",
    username: "max.sh",
  },

  sofia: {
    id: "sofia",
    name: "Софія Романенко",
    initials: "С",
    username: "sofia.r",
  },

  yulia: {
    id: "yulia",
    name: "Юлія Савченко",
    initials: "Ю",
    username: "yulia.s",
  },
};

/* =========================================================
   DEMO
========================================================= */

const DEMO_COMMUNITIES = [
  {
    id: "community-kyiv",

    title:
      "Київ — свої люди",

    username:
      "kyiv.people",

    description:
      "Міська спільнота для знайомств, подій, рекомендацій та життя у Києві.",

    category:
      "Місто",

    city:
      "Київ",

    privacy:
      "public",

    avatarEmoji:
      "🏙️",

    avatarBlob:
      null,

    coverBlob:
      null,

    cover:
      "linear-gradient(135deg,#635BFF,#918BFF)",

    members: [
      "maria",
      "oleksandr",
      "sofia",
      "max",
      "yulia",
    ],

    memberCount:
      18420,

    joined:
      true,

    requestPending:
      false,

    myRole:
      "member",

    chatId:
      "community-chat-kyiv",

    rules: [
      "Поважайте інших учасників.",
      "Без спаму та навʼязливої реклами.",
      "Публікації мають стосуватися життя міста.",
    ],

    posts: [
      {
        id:
          "community-post-kyiv-1",

        authorId:
          "maria",

        text:
          "Хто знає затишні місця на Подолі для роботи з ноутбуком? ☕",

        createdAt:
          Date.now() -
          3600000,

        likes: 42,

        likedByMe:
          false,

        mediaBlob:
          null,
      },
    ],

    createdAt:
      Date.now() -
      900000,

    updatedAt:
      Date.now() -
      900000,
  },

  {
    id:
      "community-design",

    title:
      "Дизайн України",

    username:
      "design.ua",

    description:
      "UI/UX, графічний дизайн, брендинг, творчість та українські дизайнери.",

    category:
      "Дизайн",

    city:
      "Україна",

    privacy:
      "public",

    avatarEmoji:
      "🎨",

    avatarBlob:
      null,

    coverBlob:
      null,

    cover:
      "linear-gradient(135deg,#FF4F8B,#FF9676)",

    members: [
      "maria",
      "anastasia",
      "yulia",
    ],

    memberCount:
      31280,

    joined:
      false,

    requestPending:
      false,

    myRole:
      null,

    chatId:
      "community-chat-design",

    rules: [
      "Конструктивна критика.",
      "Вказуйте авторство робіт.",
      "Не публікуйте чужі роботи без дозволу.",
    ],

    posts: [],

    createdAt:
      Date.now() -
      800000,

    updatedAt:
      Date.now() -
      800000,
  },

  {
    id:
      "community-running",

    title:
      "Бігаємо разом",

    username:
      "run.together",

    description:
      "Спільні тренування, забіги, маршрути та підтримка.",

    category:
      "Спорт",

    city:
      "Україна",

    privacy:
      "public",

    avatarEmoji:
      "🏃",

    avatarBlob:
      null,

    coverBlob:
      null,

    cover:
      "linear-gradient(135deg,#16A66B,#44CF92)",

    members: [
      "max",
      "oleksandr",
      "maria",
    ],

    memberCount:
      12740,

    joined:
      false,

    requestPending:
      false,

    myRole:
      null,

    chatId:
      "community-chat-running",

    rules: [
      "Підтримуємо одне одного.",
      "Без токсичності.",
    ],

    posts: [],

    createdAt:
      Date.now() -
      700000,

    updatedAt:
      Date.now() -
      700000,
  },

  {
    id:
      "community-startups",

    title:
      "Стартапи та бізнес",

    username:
      "startups.ua",

    description:
      "Засновники, підприємці, команди, ідеї та нові проєкти.",

    category:
      "Бізнес",

    city:
      "Україна",

    privacy:
      "private",

    avatarEmoji:
      "🚀",

    avatarBlob:
      null,

    coverBlob:
      null,

    cover:
      "linear-gradient(135deg,#171827,#4A516A)",

    members: [
      "oleksandr",
      "yulia",
    ],

    memberCount:
      8420,

    joined:
      false,

    requestPending:
      false,

    myRole:
      null,

    chatId:
      "community-chat-startups",

    rules: [
      "Вхід після схвалення адміністрації.",
      "Без масової реклами.",
      "Не публікуйте конфіденційну інформацію.",
    ],

    posts: [],

    createdAt:
      Date.now() -
      600000,

    updatedAt:
      Date.now() -
      600000,
  },
];

const CATEGORIES = [
  "Місто",
  "Дизайн",
  "Спорт",
  "Технології",
  "Бізнес",
  "Музика",
  "Фото",
  "Навчання",
  "Інше",
];

const TABS = [
  {
    id: "for-you",
    label: "Для вас",
  },

  {
    id: "mine",
    label: "Ваші",
  },

  {
    id: "popular",
    label: "Популярні",
  },

  {
    id: "new",
    label: "Нові",
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

function cleanCommunity(
  community
) {
  const {
    avatarUrl,
    coverUrl,
    ...rest
  } = community;

  return {
    ...rest,

    posts:
      (rest.posts || []).map(
        (post) => {
          const {
            mediaUrl,
            ...cleanPost
          } = post;

          return cleanPost;
        }
      ),
  };
}

function hydrateCommunity(
  community
) {
  return {
    ...community,

    avatarUrl:
      community.avatarBlob
        ? URL.createObjectURL(
            community.avatarBlob
          )
        : null,

    coverUrl:
      community.coverBlob
        ? URL.createObjectURL(
            community.coverBlob
          )
        : null,

    posts:
      (community.posts || []).map(
        (post) => ({
          ...post,

          mediaUrl:
            post.mediaBlob
              ? URL.createObjectURL(
                  post.mediaBlob
                )
              : null,
        })
      ),
  };
}

function roleLabel(role) {
  if (role === "owner") {
    return "Власник";
  }

  if (role === "admin") {
    return "Адміністратор";
  }

  if (role === "moderator") {
    return "Модератор";
  }

  return "Учасник";
}

/* =========================================================
   CREATE MODAL
========================================================= */

function CreateCommunityModal({
  onClose,
  onCreate,
}) {
  const avatarRef =
    useRef(null);

  const coverRef =
    useRef(null);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("Місто");

  const [
    city,
    setCity,
  ] = useState("Київ");

  const [
    privacy,
    setPrivacy,
  ] = useState("public");

  const [
    rules,
    setRules,
  ] = useState(
    "Поважайте інших учасників.\nБез спаму."
  );

  const [
    avatar,
    setAvatar,
  ] = useState(null);

  const [
    cover,
    setCover,
  ] = useState(null);

  const selectImage = (
    file,
    setter,
    previous
  ) => {
    if (!file) {
      return;
    }

    if (previous?.url) {
      URL.revokeObjectURL(
        previous.url
      );
    }

    setter({
      file,
      url:
        URL.createObjectURL(
          file
        ),
    });
  };

  const cleanUsername =
    username
      .toLowerCase()
      .replace(
        /[^a-z0-9._]/g,
        ""
      );

  const canCreate =
    title.trim() &&
    cleanUsername;

  return (
    <div
      className="community-modal-backdrop"
      onClick={
        onClose
      }
    >
      <section
        className="community-create-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="community-create-header">

          <div>
            <span>
              ЯТУТ
            </span>

            <h2>
              Нова спільнота
            </h2>
          </div>

          <button
            onClick={
              onClose
            }
          >
            ×
          </button>

        </header>

        <div className="community-create-body">

          {/* COVER */}

          <div className="community-create-cover">

            <input
              ref={coverRef}
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                selectImage(
                  event.target
                    .files?.[0],
                  setCover,
                  cover
                )
              }
            />

            {cover ? (
              <img
                src={cover.url}
                alt=""
              />
            ) : (
              <div>
                🖼️
              </div>
            )}

            <button
              onClick={() =>
                coverRef.current?.click()
              }
            >
              {cover
                ? "Замінити обкладинку"
                : "+ Додати обкладинку"}
            </button>

          </div>

          {/* AVATAR */}

          <div className="community-create-avatar-row">

            <input
              ref={avatarRef}
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                selectImage(
                  event.target
                    .files?.[0],
                  setAvatar,
                  avatar
                )
              }
            />

            <button
              className="community-create-avatar"
              onClick={() =>
                avatarRef.current?.click()
              }
            >
              {avatar ? (
                <img
                  src={avatar.url}
                  alt=""
                />
              ) : (
                <span>
                  {title
                    .trim()
                    ? title
                        .trim()[0]
                        .toUpperCase()
                    : "Я"}
                </span>
              )}

              <b>
                +
              </b>
            </button>

            <div>
              <strong>
                Аватар спільноти
              </strong>

              <span>
                Натисніть, щоб додати фото
              </span>
            </div>

          </div>

          <label className="community-field">

            <span>
              Назва
            </span>

            <input
              autoFocus
              maxLength={70}
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target
                    .value
                )
              }
              placeholder="Наприклад: Київські креатори"
            />

          </label>

          <label className="community-field">

            <span>
              Адреса спільноти
            </span>

            <div className="community-username-field">

              <b>
                yatut.com/
              </b>

              <input
                value={
                  cleanUsername
                }
                onChange={(event) =>
                  setUsername(
                    event.target
                      .value
                  )
                }
                placeholder="kyiv.creators"
              />

            </div>

          </label>

          <div className="community-field-row">

            <label className="community-field">

              <span>
                Категорія
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target
                      .value
                  )
                }
              >
                {CATEGORIES.map(
                  (item) => (
                    <option
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

            </label>

            <label className="community-field">

              <span>
                Місто
              </span>

              <input
                value={city}
                onChange={(event) =>
                  setCity(
                    event.target
                      .value
                  )
                }
                placeholder="Київ"
              />

            </label>

          </div>

          <label className="community-field">

            <span>
              Опис
            </span>

            <textarea
              value={description}
              maxLength={500}
              onChange={(event) =>
                setDescription(
                  event.target
                    .value
                )
              }
              placeholder="Про що ця спільнота?"
            />

          </label>

          {/* PRIVACY */}

          <div className="community-field">

            <span>
              Тип спільноти
            </span>

            <div className="community-privacy-grid">

              <button
                className={
                  privacy ===
                  "public"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPrivacy(
                    "public"
                  )
                }
              >
                <b>
                  🌐
                </b>

                <div>
                  <strong>
                    Відкрита
                  </strong>

                  <small>
                    Будь-хто може вступити
                  </small>
                </div>
              </button>

              <button
                className={
                  privacy ===
                  "private"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPrivacy(
                    "private"
                  )
                }
              >
                <b>
                  🔒
                </b>

                <div>
                  <strong>
                    Закрита
                  </strong>

                  <small>
                    Вступ після схвалення
                  </small>
                </div>
              </button>

            </div>

          </div>

          <label className="community-field">

            <span>
              Правила
            </span>

            <textarea
              value={rules}
              onChange={(event) =>
                setRules(
                  event.target
                    .value
                )
              }
              placeholder="Кожне правило з нового рядка"
            />

          </label>

        </div>

        <footer className="community-create-footer">

          <button
            className="community-create-cancel"
            onClick={onClose}
          >
            Скасувати
          </button>

          <button
            className="community-create-submit"
            disabled={
              !canCreate
            }
            onClick={() =>
              onCreate({
                title:
                  title.trim(),

                username:
                  cleanUsername,

                description:
                  description.trim(),

                category,

                city:
                  city.trim() ||
                  "Україна",

                privacy,

                avatarBlob:
                  avatar?.file ||
                  null,

                coverBlob:
                  cover?.file ||
                  null,

                rules:
                  rules
                    .split("\n")
                    .map(
                      (item) =>
                        item.trim()
                    )
                    .filter(Boolean),
              })
            }
          >
            Створити
          </button>

        </footer>

      </section>
    </div>
  );
}

/* =========================================================
   COMMUNITY DETAIL
========================================================= */

function CommunityDetail({
  community,
  onBack,
  onSave,
  onJoin,
  onOpenChat,
  onDelete,
}) {
  const imageRef =
    useRef(null);

  const [
    tab,
    setTab,
  ] = useState("overview");

  const [
    draft,
    setDraft,
  ] = useState("");

  const [
    attachment,
    setAttachment,
  ] = useState(null);

  const members =
    [
      "me",
      ...(community.members ||
        []),
    ]
      .filter(
        (id, index, list) =>
          list.indexOf(id) ===
          index
      )
      .map(
        (id) =>
          PEOPLE[id]
      )
      .filter(Boolean);

  const publish =
    async () => {
      if (
        !draft.trim() &&
        !attachment
      ) {
        return;
      }

      const post = {
        id:
          createId(
            "community-post"
          ),

        authorId: "me",

        text:
          draft.trim(),

        createdAt:
          Date.now(),

        likes: 0,

        likedByMe:
          false,

        mediaBlob:
          attachment?.file ||
          null,

        mediaUrl:
          attachment?.file
            ? URL.createObjectURL(
                attachment.file
              )
            : null,
      };

      const updated = {
        ...community,

        posts: [
          post,
          ...(community.posts ||
            []),
        ],

        updatedAt:
          Date.now(),
      };

      await onSave(updated);

      setDraft("");

      if (
        attachment?.url
      ) {
        URL.revokeObjectURL(
          attachment.url
        );
      }

      setAttachment(null);
    };

  const toggleLike =
    async (
      postId
    ) => {
      const updated = {
        ...community,

        posts:
          community.posts.map(
            (post) =>
              post.id ===
              postId
                ? {
                    ...post,

                    likedByMe:
                      !post.likedByMe,

                    likes:
                      (post.likes ||
                        0) +
                      (post.likedByMe
                        ? -1
                        : 1),
                  }
                : post
          ),

        updatedAt:
          Date.now(),
      };

      await onSave(updated);
    };

  const selectImage = (
    file
  ) => {
    if (!file) {
      return;
    }

    if (
      attachment?.url
    ) {
      URL.revokeObjectURL(
        attachment.url
      );
    }

    setAttachment({
      file,
      url:
        URL.createObjectURL(
          file
        ),
    });
  };

  const media =
    (community.posts || [])
      .filter(
        (post) =>
          post.mediaUrl
      );

  const canPost =
    community.joined;

  return (
    <section className="community-detail-page">

      <button
        className="community-back"
        onClick={onBack}
      >
        ‹ Назад до спільнот
      </button>

      {/* COVER */}

      <div
        className={`community-detail-cover ${
          community.coverUrl
            ? "has-photo"
            : ""
        }`}
        style={
          community.coverUrl
            ? {
                backgroundImage: `url("${community.coverUrl}")`,
              }
            : {
                background:
                  community.cover,
              }
        }
      >
        <div className="community-cover-overlay" />
      </div>

      {/* HEADER */}

      <section className="community-detail-header">

        <div className="community-detail-avatar">

          {community.avatarUrl ? (
            <img
              src={
                community.avatarUrl
              }
              alt=""
            />
          ) : (
            <span>
              {community.avatarEmoji ||
                community.title[0]}
            </span>
          )}

        </div>

        <div className="community-detail-info">

          <div className="community-detail-title-row">

            <div>

              <h1>
                {community.title}
              </h1>

              <span>
                @{community.username}
              </span>

            </div>

            <div className="community-detail-actions">

              {community.myRole ===
              "owner" ? (
                <span className="community-owner-badge">
                  👑 Власник
                </span>
              ) : (
                <button
                  className={`community-join-main ${
                    community.joined
                      ? "joined"
                      : ""
                  }`}
                  onClick={onJoin}
                >
                  {community.joined
                    ? "✓ Ви учасник"
                    : community.requestPending
                    ? "Запит надіслано"
                    : community.privacy ===
                      "private"
                    ? "Подати запит"
                    : "+ Приєднатися"}
                </button>
              )}

              {community.joined && (
                <button
                  className="community-chat-main"
                  onClick={
                    onOpenChat
                  }
                >
                  💬 Чат
                </button>
              )}

              <button className="community-share-main">
                ↗
              </button>

            </div>

          </div>

          <p>
            {community.description}
          </p>

          <div className="community-detail-meta">

            <span>
              {community.privacy ===
              "private"
                ? "🔒 Закрита"
                : "🌐 Відкрита"}
            </span>

            <span>
              📍 {community.city}
            </span>

            <span>
              👥{" "}
              {community.memberCount.toLocaleString(
                "uk-UA"
              )}{" "}
              учасників
            </span>

            <span>
              #{community.category}
            </span>

          </div>

        </div>

      </section>

      {/* TABS */}

      <nav className="community-detail-tabs">

        {[
          [
            "overview",
            "Огляд",
          ],
          [
            "posts",
            "Дописи",
          ],
          [
            "members",
            "Учасники",
          ],
          [
            "media",
            "Медіа",
          ],
          [
            "rules",
            "Правила",
          ],
        ].map(
          ([id, label]) => (
            <button
              key={id}
              className={
                tab === id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab(id)
              }
            >
              {label}
            </button>
          )
        )}

      </nav>

      <div className="community-detail-layout">

        <main className="community-detail-main">

          {/* OVERVIEW */}

          {tab === "overview" && (
            <>
              <section className="community-info-card">

                <h2>
                  Про спільноту
                </h2>

                <p>
                  {
                    community.description
                  }
                </p>

                <div className="community-overview-data">

                  <div>
                    <span>
                      Категорія
                    </span>

                    <strong>
                      {
                        community.category
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Місто
                    </span>

                    <strong>
                      {
                        community.city
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Доступ
                    </span>

                    <strong>
                      {community.privacy ===
                      "private"
                        ? "Закритий"
                        : "Відкритий"}
                    </strong>
                  </div>

                </div>

              </section>

              <section className="community-info-card">

                <div className="community-section-title">

                  <div>
                    <span>
                      ОСТАННІ
                    </span>

                    <h2>
                      Дописи
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      setTab(
                        "posts"
                      )
                    }
                  >
                    Усі
                  </button>

                </div>

                {(community.posts ||
                  [])
                  .slice(0, 2)
                  .map(
                    (post) => (
                      <CommunityPost
                        key={
                          post.id
                        }
                        post={
                          post
                        }
                        onLike={() =>
                          toggleLike(
                            post.id
                          )
                        }
                      />
                    )
                  )}

                {(community.posts ||
                  []).length ===
                  0 && (
                  <div className="community-empty-mini">
                    Поки немає дописів
                  </div>
                )}

              </section>
            </>
          )}

          {/* POSTS */}

          {tab === "posts" && (
            <>
              {canPost && (
                <section className="community-post-composer">

                  <div className="community-post-composer-main">

                    <div>
                      В
                    </div>

                    <textarea
                      value={draft}
                      onChange={(event) =>
                        setDraft(
                          event.target
                            .value
                        )
                      }
                      placeholder="Напишіть щось у спільноті..."
                    />

                  </div>

                  {attachment && (
                    <div className="community-post-preview">

                      <img
                        src={
                          attachment.url
                        }
                        alt=""
                      />

                      <button
                        onClick={() => {
                          URL.revokeObjectURL(
                            attachment.url
                          );

                          setAttachment(
                            null
                          );
                        }}
                      >
                        ×
                      </button>

                    </div>
                  )}

                  <footer>

                    <input
                      ref={
                        imageRef
                      }
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        selectImage(
                          event.target
                            .files?.[0]
                        )
                      }
                    />

                    <button
                      onClick={() =>
                        imageRef.current?.click()
                      }
                    >
                      🖼 Фото
                    </button>

                    <button
                      className="community-publish-post"
                      onClick={
                        publish
                      }
                    >
                      Опублікувати
                    </button>

                  </footer>

                </section>
              )}

              {(community.posts ||
                []).map(
                  (post) => (
                    <CommunityPost
                      key={
                        post.id
                      }
                      post={
                        post
                      }
                      onLike={() =>
                        toggleLike(
                          post.id
                        )
                      }
                    />
                  )
                )}

              {(community.posts ||
                []).length ===
                0 && (
                <div className="community-empty-state">
                  <span>
                    ✍️
                  </span>

                  <h3>
                    Дописів ще немає
                  </h3>

                  <p>
                    Станьте першим, хто щось опублікує.
                  </p>
                </div>
              )}
            </>
          )}

          {/* MEMBERS */}

          {tab === "members" && (
            <section className="community-info-card">

              <div className="community-section-title">

                <div>
                  <span>
                    ЛЮДИ
                  </span>

                  <h2>
                    Учасники
                  </h2>
                </div>

                <strong>
                  {
                    community.memberCount
                  }
                </strong>

              </div>

              <div className="community-members-grid">

                {members.map(
                  (person) => (
                    <article
                      key={
                        person.id
                      }
                    >

                      <div>
                        {
                          person.initials
                        }
                      </div>

                      <strong>
                        {
                          person.name
                        }
                      </strong>

                      <span>
                        {person.id ===
                        "me"
                          ? roleLabel(
                              community.myRole
                            )
                          : "Учасник"}
                      </span>

                      {person.id !==
                        "me" && (
                        <button>
                          Профіль
                        </button>
                      )}

                    </article>
                  )
                )}

              </div>

            </section>
          )}

          {/* MEDIA */}

          {tab === "media" && (
            <section className="community-info-card">

              <h2>
                Фото та медіа
              </h2>

              {media.length >
              0 ? (
                <div className="community-media-grid">

                  {media.map(
                    (post) => (
                      <img
                        key={
                          post.id
                        }
                        src={
                          post.mediaUrl
                        }
                        alt=""
                      />
                    )
                  )}

                </div>
              ) : (
                <div className="community-empty-state">
                  <span>
                    🖼️
                  </span>

                  <h3>
                    Медіа ще немає
                  </h3>
                </div>
              )}

            </section>
          )}

          {/* RULES */}

          {tab === "rules" && (
            <section className="community-info-card">

              <h2>
                Правила спільноти
              </h2>

              <div className="community-rules-list">

                {(community.rules ||
                  []).map(
                    (
                      rule,
                      index
                    ) => (
                      <div
                        key={
                          `${rule}-${index}`
                        }
                      >

                        <span>
                          {index + 1}
                        </span>

                        <p>
                          {rule}
                        </p>

                      </div>
                    )
                  )}

              </div>

            </section>
          )}

        </main>

        {/* RIGHT */}

        <aside className="community-detail-side">

          <section className="community-side-card">

            <span className="community-side-label">
              СПІЛЬНОТА
            </span>

            <div className="community-side-stats">

              <div>
                <strong>
                  {community.memberCount.toLocaleString(
                    "uk-UA"
                  )}
                </strong>

                <span>
                  учасників
                </span>
              </div>

              <div>
                <strong>
                  {
                    community.posts
                      ?.length ||
                    0
                  }
                </strong>

                <span>
                  дописів
                </span>
              </div>

            </div>

          </section>

          {community.joined && (
            <section className="community-chat-card">

              <span>
                💬
              </span>

              <strong>
                Чат спільноти
              </strong>

              <p>
                Спілкуйтесь з учасниками в реальному часі.
              </p>

              <button
                onClick={
                  onOpenChat
                }
              >
                Відкрити чат
              </button>

            </section>
          )}

          <section className="community-side-card">

            <span className="community-side-label">
              ПРАВИЛА
            </span>

            {(community.rules ||
              [])
              .slice(0, 3)
              .map(
                (
                  rule,
                  index
                ) => (
                  <div
                    className="community-rule-preview"
                    key={
                      index
                    }
                  >
                    <b>
                      {index + 1}
                    </b>

                    <span>
                      {rule}
                    </span>
                  </div>
                )
              )}

            <button
              className="community-show-rules"
              onClick={() =>
                setTab(
                  "rules"
                )
              }
            >
              Усі правила
            </button>

          </section>

          {community.myRole ===
            "owner" && (
            <section className="community-owner-panel">

              <span>
                👑
              </span>

              <strong>
                Керування
              </strong>

              <button>
                Редагувати
              </button>

              <button>
                Керувати учасниками
              </button>

              <button
                className="danger"
                onClick={
                  onDelete
                }
              >
                Видалити спільноту
              </button>

            </section>
          )}

        </aside>

      </div>

    </section>
  );
}

/* =========================================================
   POST
========================================================= */

function CommunityPost({
  post,
  onLike,
}) {
  const person =
    PEOPLE[
      post.authorId
    ] || PEOPLE.me;

  return (
    <article className="community-post">

      <header>

        <div className="community-post-avatar">
          {
            person.initials
          }
        </div>

        <div>

          <strong>
            {
              person.name
            }
          </strong>

          <span>
            {new Date(
              post.createdAt
            ).toLocaleTimeString(
              "uk-UA",
              {
                hour:
                  "2-digit",
                minute:
                  "2-digit",
              }
            )}
          </span>

        </div>

      </header>

      {post.text && (
        <p>
          {post.text}
        </p>
      )}

      {post.mediaUrl && (
        <img
          className="community-post-image"
          src={post.mediaUrl}
          alt=""
        />
      )}

      <footer>

        <button
          className={
            post.likedByMe
              ? "active"
              : ""
          }
          onClick={onLike}
        >
          ❤️ {post.likes || 0}
        </button>

        <button>
          💬 Коментувати
        </button>

        <button>
          ↗ Поділитися
        </button>

      </footer>

    </article>
  );
}

/* =========================================================
   COMMUNITIES
========================================================= */

function Communities({
  onNavigate,
}) {
  const [
    communities,
    setCommunities,
  ] = useState([]);

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "for-you"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    openedId,
    setOpenedId,
  ] = useState(null);

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] = useState("");

  const opened =
    communities.find(
      (community) =>
        community.id ===
        openedId
    );

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    const load =
      async () => {
        let stored =
          await getCommunities();

        if (
          stored.length ===
          0
        ) {
          for (
            const community of
            DEMO_COMMUNITIES
          ) {
            await saveCommunity(
              community
            );
          }

          stored = [
            ...DEMO_COMMUNITIES,
          ];
        }

        const hydrated =
          stored.map(
            hydrateCommunity
          );

        setCommunities(
          hydrated
        );

        /* ENSURE CHATS */

        for (
          const community of
          stored
        ) {
          if (
            !community.joined
          ) {
            continue;
          }

          await ensureCommunityChat(
            community
          );
        }
      };

    load();
  }, []);

  /* =======================================================
     CHAT
  ======================================================= */

  const ensureCommunityChat =
    async (
      community
    ) => {
      const existing =
        await getChat(
          community.chatId
        );

      if (existing) {
        return existing;
      }

      const chat = {
        id:
          community.chatId,

        type:
          "group",

        communityId:
          community.id,

        title:
          community.title,

        initials:
          community.title[0]
            ?.toUpperCase() ||
          "С",

        members: [
          "me",
          ...(community.members ||
            []).slice(0, 6),
        ].filter(
          (
            id,
            index,
            list
          ) =>
            list.indexOf(id) ===
            index
        ),

        admins:
          community.myRole ===
          "owner"
            ? ["me"]
            : [],

        updatedAt:
          Date.now(),

        unread: 0,

        lastMessage:
          "Чат спільноти",
      };

      await saveChat(chat);

      await saveMessage({
        id:
          createId(
            "community-chat-message"
          ),

        chatId:
          chat.id,

        senderId: "me",

        type: "text",

        text:
          `Ласкаво просимо до чату «${community.title}» 👋`,

        createdAt:
          Date.now(),

        system: true,

        pinned: false,
      });

      return chat;
    };

  const openChat =
    async (
      community
    ) => {
      if (
        !community.joined
      ) {
        showToast(
          "Спочатку приєднайтесь до спільноти"
        );

        return;
      }

      await ensureCommunityChat(
        community
      );

      sessionStorage.setItem(
        "yatut-open-chat-id",
        community.chatId
      );

      onNavigate?.(
        "chats"
      );
    };

  /* =======================================================
     SAVE
  ======================================================= */

  const updateCommunity =
    async (
      updated
    ) => {
      await saveCommunity(
        cleanCommunity(
          updated
        )
      );

      setCommunities(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      );
    };

  /* =======================================================
     JOIN
  ======================================================= */

  const joinCommunity =
    async (
      community
    ) => {
      if (
        community.requestPending
      ) {
        const updated = {
          ...community,

          requestPending:
            false,
        };

        await updateCommunity(
          updated
        );

        showToast(
          "Запит скасовано"
        );

        return;
      }

      if (
        community.joined
      ) {
        if (
          community.myRole ===
          "owner"
        ) {
          return;
        }

        const updated = {
          ...community,

          joined: false,

          myRole: null,

          memberCount:
            Math.max(
              0,
              community.memberCount -
                1
            ),
        };

        await updateCommunity(
          updated
        );

        showToast(
          "Ви вийшли зі спільноти"
        );

        return;
      }

      if (
        community.privacy ===
        "private"
      ) {
        const updated = {
          ...community,

          requestPending:
            true,
        };

        await updateCommunity(
          updated
        );

        showToast(
          "Запит на вступ надіслано 🔒"
        );

        return;
      }

      const updated = {
        ...community,

        joined: true,

        myRole:
          "member",

        memberCount:
          community.memberCount +
          1,

        members: [
          "me",
          ...(community.members ||
            []),
        ],
      };

      await updateCommunity(
        updated
      );

      await ensureCommunityChat(
        cleanCommunity(
          updated
        )
      );

      showToast(
        "Ви приєдналися 🎉"
      );
    };

  /* =======================================================
     CREATE
  ======================================================= */

  const createCommunity =
    async (
      data
    ) => {
      const id =
        createId(
          "community"
        );

      const community = {
        id,

        title:
          data.title,

        username:
          data.username,

        description:
          data.description,

        category:
          data.category,

        city:
          data.city,

        privacy:
          data.privacy,

        avatarEmoji:
          data.title[0]
            ?.toUpperCase() ||
          "Я",

        avatarBlob:
          data.avatarBlob,

        coverBlob:
          data.coverBlob,

        cover:
          "linear-gradient(135deg,#635BFF,#FF4F8B)",

        members: [
          "me",
        ],

        memberCount: 1,

        joined: true,

        requestPending:
          false,

        myRole:
          "owner",

        chatId:
          `community-chat-${id}`,

        rules:
          data.rules,

        posts: [],

        createdAt:
          Date.now(),

        updatedAt:
          Date.now(),
      };

      await saveCommunity(
        community
      );

      await ensureCommunityChat(
        community
      );

      const hydrated =
        hydrateCommunity(
          community
        );

      setCommunities(
        (previous) => [
          hydrated,
          ...previous,
        ]
      );

      setCreateOpen(
        false
      );

      setOpenedId(id);

      showToast(
        "Спільноту створено ✨"
      );
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const removeCommunity =
    async (
      community
    ) => {
      if (
        community.myRole !==
        "owner"
      ) {
        return;
      }

      await deleteCommunity(
        community.id
      );

      setCommunities(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              community.id
          )
      );

      setOpenedId(null);

      showToast(
        "Спільноту видалено"
      );
    };

  /* =======================================================
     FILTER
  ======================================================= */

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result = [
        ...communities,
      ];

      if (
        activeTab ===
        "mine"
      ) {
        result =
          result.filter(
            (community) =>
              community.joined
          );
      }

      if (
        activeTab ===
        "popular"
      ) {
        result.sort(
          (a, b) =>
            b.memberCount -
            a.memberCount
        );
      }

      if (
        activeTab ===
        "new"
      ) {
        result.sort(
          (a, b) =>
            (b.createdAt ||
              0) -
            (a.createdAt ||
              0)
        );
      }

      if (query) {
        result =
          result.filter(
            (community) =>
              [
                community.title,
                community.username,
                community.description,
                community.category,
                community.city,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(
                  query
                )
          );
      }

      return result;
    }, [
      communities,
      activeTab,
      search,
    ]);

  const showToast = (
    text
  ) => {
    setToast(text);

    setTimeout(
      () =>
        setToast(""),
      1800
    );
  };

  /* =======================================================
     DETAIL
  ======================================================= */

  if (opened) {
    return (
      <>
        <CommunityDetail
          community={
            opened
          }
          onBack={() =>
            setOpenedId(
              null
            )
          }
          onSave={
            updateCommunity
          }
          onJoin={() =>
            joinCommunity(
              opened
            )
          }
          onOpenChat={() =>
            openChat(
              opened
            )
          }
          onDelete={() =>
            removeCommunity(
              opened
            )
          }
        />

        {toast && (
          <div className="yatut-toast">
            {toast}
          </div>
        )}
      </>
    );
  }

  /* =======================================================
     LIST
  ======================================================= */

  return (
    <section className="communities-page">

      {/* HERO */}

      <section className="communities-hero">

        <div>

          <span>
            ЯТУТ СПІЛЬНОТИ
          </span>

          <h1>
            Знайдіть своє коло
          </h1>

          <p>
            Міста, інтереси, професії, хобі та люди, з якими вам є про що говорити.
          </p>

          <button
            onClick={() =>
              setCreateOpen(
                true
              )
            }
          >
            + Створити спільноту
          </button>

        </div>

        <div className="communities-hero-art">

          <div>
            Я
          </div>

          <span>
            👥
          </span>

          <b>
            💬
          </b>

        </div>

      </section>

      {/* CONTROLS */}

      <section className="communities-controls">

        <label>

          <span>
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Знайти спільноту"
          />

        </label>

        <div>

          {TABS.map(
            (tab) => (
              <button
                key={
                  tab.id
                }
                className={
                  activeTab ===
                  tab.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
              >
                {tab.label}
              </button>
            )
          )}

        </div>

      </section>

      <div className="communities-layout">

        <main className="communities-main">

          <div className="communities-title">

            <div>
              <span>
                ЗНАЙДИ СВОЇХ
              </span>

              <h2>
                Рекомендовані спільноти
              </h2>
            </div>

            <strong>
              {filtered.length}
            </strong>

          </div>

          <div className="communities-grid">

            {filtered.map(
              (community) => (
                <article
                  className="community-card"
                  key={
                    community.id
                  }
                >

                  <button
                    className="community-card-cover"
                    onClick={() =>
                      setOpenedId(
                        community.id
                      )
                    }
                    style={
                      community.coverUrl
                        ? {
                            backgroundImage: `url("${community.coverUrl}")`,
                          }
                        : {
                            background:
                              community.cover,
                          }
                    }
                  >
                    <span className="community-card-privacy">
                      {community.privacy ===
                      "private"
                        ? "🔒"
                        : "🌐"}
                    </span>
                  </button>

                  <div className="community-card-body">

                    <button
                      className="community-card-avatar"
                      onClick={() =>
                        setOpenedId(
                          community.id
                        )
                      }
                    >
                      {community.avatarUrl ? (
                        <img
                          src={
                            community.avatarUrl
                          }
                          alt=""
                        />
                      ) : (
                        <span>
                          {community.avatarEmoji ||
                            community.title[0]}
                        </span>
                      )}
                    </button>

                    <button
                      className="community-card-name"
                      onClick={() =>
                        setOpenedId(
                          community.id
                        )
                      }
                    >
                      {
                        community.title
                      }
                    </button>

                    <span className="community-card-username">
                      @
                      {
                        community.username
                      }
                    </span>

                    <p>
                      {
                        community.description
                      }
                    </p>

                    <div className="community-card-meta">

                      <span>
                        👥{" "}
                        {community.memberCount.toLocaleString(
                          "uk-UA"
                        )}
                      </span>

                      <span>
                        📍{" "}
                        {
                          community.city
                        }
                      </span>

                    </div>

                    <div className="community-card-friends">

                      <div>

                        {(community.members ||
                          [])
                          .slice(0, 4)
                          .map(
                            (id) => (
                              <span
                                key={
                                  id
                                }
                              >
                                {PEOPLE[
                                  id
                                ]
                                  ?.initials ||
                                  "?"}
                              </span>
                            )
                          )}

                      </div>

                      <small>
                        {community.members
                          ?.length ||
                          0}{" "}
                        ваших знайомих
                      </small>

                    </div>

                    <footer>

                      <button
                        className={`community-card-join ${
                          community.joined
                            ? "joined"
                            : ""
                        }`}
                        onClick={() =>
                          joinCommunity(
                            community
                          )
                        }
                      >
                        {community.myRole ===
                        "owner"
                          ? "👑 Ваша"
                          : community.joined
                          ? "✓ Учасник"
                          : community.requestPending
                          ? "Запит надіслано"
                          : community.privacy ===
                            "private"
                          ? "Подати запит"
                          : "+ Приєднатися"}
                      </button>

                      <button
                        onClick={() =>
                          setOpenedId(
                            community.id
                          )
                        }
                      >
                        Відкрити
                      </button>

                    </footer>

                  </div>

                </article>
              )
            )}

          </div>

          {filtered.length ===
            0 && (
            <div className="community-empty-state">

              <span>
                🔎
              </span>

              <h3>
                Нічого не знайдено
              </h3>

              <p>
                Спробуйте іншу назву, місто або категорію.
              </p>

            </div>
          )}

        </main>

        {/* RIGHT */}

        <aside className="communities-side">

          <section className="communities-side-card">

            <span>
              КАТЕГОРІЇ
            </span>

            {[
              [
                "🏙️",
                "Місто",
              ],
              [
                "🎨",
                "Дизайн",
              ],
              [
                "🏃",
                "Спорт",
              ],
              [
                "💻",
                "Технології",
              ],
              [
                "🚀",
                "Бізнес",
              ],
            ].map(
              ([
                emoji,
                name,
              ]) => (
                <button
                  key={
                    name
                  }
                  onClick={() =>
                    setSearch(
                      name
                    )
                  }
                >
                  <b>
                    {
                      emoji
                    }
                  </b>

                  <span>
                    {
                      name
                    }
                  </span>

                  <i>
                    ›
                  </i>
                </button>
              )
            )}

          </section>

          <section className="communities-own-card">

            <div>
              Я
            </div>

            <span>
              СТВОРИ СВОЄ
            </span>

            <strong>
              Ваша спільнота. Ваші люди.
            </strong>

            <p>
              Створіть місце для друзів, команди, міста або спільного інтересу.
            </p>

            <button
              onClick={() =>
                setCreateOpen(
                  true
                )
              }
            >
              Створити
            </button>

          </section>

        </aside>

      </div>

      {createOpen && (
        <CreateCommunityModal
          onClose={() =>
            setCreateOpen(
              false
            )
          }
          onCreate={
            createCommunity
          }
        />
      )}

      {toast && (
        <div className="yatut-toast">
          {toast}
        </div>
      )}

    </section>
  );
}

export default Communities;