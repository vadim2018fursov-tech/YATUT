import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./ProfileV2.css";
import YatutIcon from "./YatutIcon";

const PROFILE_STORAGE_KEY = "yatut-profile-v2";

const DEFAULT_PROFILE = {
  name: "Вадим",
  username: "vadim",
  bio: "Створюю ЯТУТ — українську соціальну мережу про людей, зв’язки, міста та реальне життя.",
  city: "Київ",
  country: "Україна",
  work: "Засновник ЯТУТ",
  education: "Київ",
  website: "",
  instagram: "",
  telegram: "",
  birthday: "",
  cover: "",
  avatar: "",
  status: "Я тут",
  statusText: "Зараз у Києві",
  followers: 1284,
  following: 386,
  friends: 214,
  posts: 37,
  verified: true,
  founder: true,
  earlyUser: true,
  online: true,

  interests: [
    "Технології",
    "Дизайн",
    "Україна",
    "Стартапи",
    "Мистецтво",
    "Подорожі",
  ],
};

const ACHIEVEMENTS = [
  {
    id: "founder",
    title: "Засновник ЯТУТ",
    subtitle: "Створює майбутнє мережі",
    tone: "violet",
    symbol: "Я",
  },

  {
    id: "verified",
    title: "ЯТУТ Перевірено",
    subtitle: "Підтверджений профіль",
    tone: "indigo",
    symbol: "✓",
  },

  {
    id: "early",
    title: "Перші тут",
    subtitle: "Ранній користувач",
    tone: "silver",
    symbol: "1",
  },

  {
    id: "community",
    title: "Серце спільноти",
    subtitle: "Допомагає іншим",
    tone: "coral",
    symbol: "♥",
  },

  {
    id: "organizer",
    title: "Організатор",
    subtitle: "Створює події та зустрічі",
    tone: "amber",
    symbol: "✦",
  },

  {
    id: "trusted",
    title: "Надійний друг",
    subtitle: "Висока довіра",
    tone: "green",
    symbol: "✓",
  },
];

const DEMO_POSTS = [
  {
    id: "profile-post-1",

    text:
      "Сьогодні ще один великий крок у розвитку ЯТУТ. Хочу, щоб це була мережа не лише про контент, а про людей, які реально можуть знайти одне одного.",

    meta: "2 год",

    likes: 84,

    comments: 17,
  },

  {
    id: "profile-post-2",

    text:
      "Київ дуже надихає на новий дизайн. Думаю над тим, як зробити «Поруч» по-справжньому живим.",

    meta: "Вчора",

    likes: 126,

    comments: 21,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function safeLoadProfile() {
  try {
    const raw =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      );

    if (!raw) {
      return DEFAULT_PROFILE;
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...DEFAULT_PROFILE,
      ...(parsed || {}),

      interests:
        Array.isArray(
          parsed?.interests
        )
          ? parsed.interests
          : DEFAULT_PROFILE.interests,
    };
  } catch (error) {
    console.warn(
      "PROFILE LOAD ERROR:",
      error
    );

    return DEFAULT_PROFILE;
  }
}

function fileToDataUrl(
  file
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        () =>
          reject(
            reader.error
          );

      reader.readAsDataURL(
        file
      );
    }
  );
}

/* =========================================================
   PROFILE
========================================================= */

export default function Profile({
  onNavigate,
  onOpenChat,
}) {
  const [
    profile,
    setProfile,
  ] =
    useState(
      safeLoadProfile
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "posts"
    );

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] =
    useState(false);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,

        JSON.stringify(
          profile
        )
      );
    } catch (error) {
      console.warn(
        "PROFILE SAVE ERROR:",
        error
      );
    }
  }, [profile]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(
      () => [
        {
          label: "Друзів",
          value:
            profile.friends,
        },

        {
          label:
            "Підписників",
          value:
            profile.followers,
        },

        {
          label:
            "Підписок",
          value:
            profile.following,
        },

        {
          label:
            "Дописів",
          value:
            profile.posts,
        },
      ],
      [profile]
    );

  const reputation = [
    {
      label:
        "Надійність",

      value: 96,

      text:
        "Високий рівень довіри",
    },

    {
      label:
        "Активність",

      value: 88,

      text:
        "Регулярно у ЯТУТ",
    },

    {
      label:
        "Вклад",

      value: 92,

      text:
        "Розвиває спільноту",
    },
  ];

  /* =======================================================
     STATUS
  ======================================================= */

  function updateStatus(
    status,
    statusText
  ) {
    setProfile(
      (
        previous
      ) => ({
        ...previous,

        status,

        statusText,
      })
    );

    setStatusOpen(
      false
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="profile-v2-page">
      <div className="profile-v2-wallpaper" />

      <section className="profile-v2-shell">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="profile-v2-hero">

          {/* COVER */}

          <div
            className="profile-v2-cover"
            style={
              profile.cover
                ? {
                    backgroundImage:
                      `linear-gradient(
                        180deg,
                        rgba(13,15,24,.06),
                        rgba(13,15,24,.48)
                      ),
                      url("${profile.cover}")`,
                  }
                : undefined
            }
          >
            <div className="profile-v2-cover-glow" />

            <div className="profile-v2-cover-copy">

              <span>
                ЯТУТ • КИЇВ
              </span>

              <h2>
                Люди. Місця.
                Можливості.
              </h2>

              <p>
                Тут починаються
                справжні зв’язки.
              </p>

            </div>
          </div>

          {/* =================================================
              PROFILE HEAD
          ================================================= */}

          <div className="profile-v2-head">

            {/* AVATAR */}

            <div className="profile-v2-avatar-wrap">

              <div className="profile-v2-avatar-pulse">

                <div className="profile-v2-avatar">

                  {profile.avatar ? (
                    <img
                      src={
                        profile.avatar
                      }
                      alt={
                        profile.name
                      }
                    />
                  ) : (
                    <span>
                      {profile.name
                        ?.[0]
                        ?.toUpperCase() ||
                        "В"}
                    </span>
                  )}

                </div>

              </div>

              {profile.online && (
                <span className="profile-v2-online-dot" />
              )}

            </div>

            {/* IDENTITY */}

            <div className="profile-v2-identity">

              <div className="profile-v2-name-row">

                <h1>
                  {
                    profile.name
                  }
                </h1>

                {profile.verified && (
                  <span
                    className="profile-v2-name-badge verified"
                    title="ЯТУТ Перевірено"
                  >
                    Я
                  </span>
                )}

                {profile.founder && (
                  <span
                    className="profile-v2-name-badge founder"
                    title="Засновник ЯТУТ"
                  >
                    ✦
                  </span>
                )}

              </div>

              <div className="profile-v2-username">
                @
                {
                  profile.username
                }
              </div>

              <p className="profile-v2-bio">
                {
                  profile.bio
                }
              </p>

              {/* META */}

              <div className="profile-v2-meta">

                <span>
                  <YatutIcon
                    name="pin"
                    size={15}
                  />

                  {
                    profile.city
                  }
                  ,{" "}
                  {
                    profile.country
                  }
                </span>

                <span>
                  <YatutIcon
                    name="business"
                    size={15}
                  />

                  {
                    profile.work
                  }
                </span>

              </div>

              {/* STATUS */}

              <div className="profile-v2-status-wrap">

                <button
                  className="profile-v2-status"
                  type="button"
                  onClick={() =>
                    setStatusOpen(
                      (
                        value
                      ) =>
                        !value
                    )
                  }
                >
                  <span className="profile-v2-status-dot" />

                  <strong>
                    {
                      profile.status
                    }
                  </strong>

                  <small>
                    {
                      profile.statusText
                    }
                  </small>

                  <YatutIcon
                    name="chevronDown"
                    size={15}
                  />
                </button>

                {statusOpen && (
                  <div className="profile-v2-status-menu">

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          "Я тут",
                          "Зараз у Києві"
                        )
                      }
                    >
                      <span className="status-tone violet" />

                      <div>
                        <strong>
                          Я тут
                        </strong>

                        <small>
                          Показати
                          присутність
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          "У дорозі",
                          "Відповім пізніше"
                        )
                      }
                    >
                      <span className="status-tone blue" />

                      <div>
                        <strong>
                          У дорозі
                        </strong>

                        <small>
                          Тимчасовий
                          статус
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          "Не турбувати",
                          "Потрібен фокус"
                        )
                      }
                    >
                      <span className="status-tone coral" />

                      <div>
                        <strong>
                          Не турбувати
                        </strong>

                        <small>
                          Приховати
                          активність
                        </small>
                      </div>
                    </button>

                  </div>
                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="profile-v2-actions">

              <button
                className="profile-v2-primary"
                type="button"
                onClick={() =>
                  setEditing(
                    true
                  )
                }
              >
                Редагувати профіль
              </button>

              <button
                className="profile-v2-icon-button"
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "settings"
                  )
                }
                aria-label="Налаштування"
              >
                <YatutIcon
                  name="settings"
                  size={18}
                />
              </button>

              <button
                className="profile-v2-icon-button"
                type="button"
                aria-label="Ще"
              >
                <YatutIcon
                  name="more"
                  size={18}
                />
              </button>

            </div>

          </div>

          {/* =================================================
              PROFILE STATS
          ================================================= */}

          <div className="profile-v2-stats">

            {stats.map(
              (
                item
              ) => (
                <button
                  key={
                    item.label
                  }
                  type="button"
                >
                  <strong>
                    {
                      item.value
                    }
                  </strong>

                  <span>
                    {
                      item.label
                    }
                  </span>
                </button>
              )
            )}

          </div>

        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="profile-v2-grid">

          {/* =================================================
              MAIN
          ================================================= */}

          <main className="profile-v2-main">

            {/* TABS */}

            <nav className="profile-v2-tabs">

              {[
                [
                  "posts",
                  "Дописи",
                ],

                [
                  "about",
                  "Про мене",
                ],

                [
                  "achievements",
                  "Досягнення",
                ],
              ].map(
                (
                  [
                    id,
                    label,
                  ]
                ) => (
                  <button
                    key={
                      id
                    }
                    className={
                      activeTab ===
                      id
                        ? "active"
                        : ""
                    }
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        id
                      )
                    }
                  >
                    {
                      label
                    }
                  </button>
                )
              )}

            </nav>

            {/* =================================================
                POSTS
            ================================================= */}

            {activeTab ===
              "posts" && (
              <div className="profile-v2-post-list">

                {DEMO_POSTS.map(
                  (
                    post
                  ) => (
                    <article
                      key={
                        post.id
                      }
                      className="profile-v2-post-card"
                    >

                      <header>

                        <div className="profile-v2-post-avatar">

                          {profile.avatar ? (
                            <img
                              src={
                                profile.avatar
                              }
                              alt=""
                            />
                          ) : (
                            profile.name
                              ?.[0] ||
                            "В"
                          )}

                        </div>

                        <div>

                          <strong>
                            {
                              profile.name
                            }
                          </strong>

                          <span>
                            @
                            {
                              profile.username
                            }
                            {" "}
                            ·{" "}
                            {
                              post.meta
                            }
                          </span>

                        </div>

                        <button
                          type="button"
                          aria-label="Меню"
                        >
                          <YatutIcon
                            name="more"
                            size={17}
                          />
                        </button>

                      </header>

                      <p>
                        {
                          post.text
                        }
                      </p>

                      <footer>

                        <button
                          type="button"
                        >
                          <YatutIcon
                            name="heart"
                            size={16}
                          />

                          {
                            post.likes
                          }
                        </button>

                        <button
                          type="button"
                        >
                          <YatutIcon
                            name="chats"
                            size={16}
                          />

                          {
                            post.comments
                          }
                        </button>

                        <button
                          type="button"
                        >
                          <YatutIcon
                            name="share"
                            size={16}
                          />

                          Поділитися
                        </button>

                        <button
                          type="button"
                          aria-label="Зберегти"
                        >
                          <YatutIcon
                            name="saved"
                            size={16}
                          />
                        </button>

                      </footer>

                    </article>
                  )
                )}

              </div>
            )}

            {/* =================================================
                ABOUT
            ================================================= */}

            {activeTab ===
              "about" && (
              <section className="profile-v2-card profile-v2-about-card">

                <div className="profile-v2-card-head">

                  <div>
                    <span>
                      ПРО МЕНЕ
                    </span>

                    <h3>
                      Більше про{" "}
                      {
                        profile.name
                      }
                    </h3>
                  </div>

                </div>

                <div className="profile-v2-about-grid">

                  <AboutRow
                    icon="pin"
                    label="Місто"
                    value={`${profile.city}, ${profile.country}`}
                  />

                  <AboutRow
                    icon="business"
                    label="Робота"
                    value={
                      profile.work
                    }
                  />

                  <AboutRow
                    icon="community"
                    label="Освіта"
                    value={
                      profile.education
                    }
                  />

                  <AboutRow
                    icon="friends"
                    label="Статус"
                    value={
                      profile.statusText
                    }
                  />

                </div>

                <div className="profile-v2-interests">

                  <span>
                    ІНТЕРЕСИ
                  </span>

                  <div>

                    {profile.interests.map(
                      (
                        interest
                      ) => (
                        <button
                          key={
                            interest
                          }
                          type="button"
                        >
                          {
                            interest
                          }
                        </button>
                      )
                    )}

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                ACHIEVEMENTS
            ================================================= */}

            {activeTab ===
              "achievements" && (
              <section className="profile-v2-card">

                <div className="profile-v2-card-head">

                  <div>
                    <span>
                      ЯТУТ
                    </span>

                    <h3>
                      Досягнення та
                      нагороди
                    </h3>
                  </div>

                  <strong className="profile-v2-achievement-count">
                    {
                      ACHIEVEMENTS.length
                    }
                  </strong>

                </div>

                <div className="profile-v2-achievements-grid">

                  {ACHIEVEMENTS.map(
                    (
                      item
                    ) => (
                      <Achievement
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                      />
                    )
                  )}

                </div>

              </section>
            )}

          </main>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="profile-v2-side">

            {/* PULSE */}

            <section className="profile-v2-card profile-v2-pulse-card">

              <div className="profile-v2-card-head">

                <div>
                  <span>
                    ПУЛЬС ЯТУТ
                  </span>

                  <h3>
                    Ваш профіль зараз
                  </h3>
                </div>

                <span className="profile-v2-live-chip">
                  LIVE
                </span>

              </div>

              <div className="profile-v2-pulse-list">

                <PulseItem
                  label="Переглядів профілю"
                  value="+128"
                  detail="за 7 днів"
                />

                <PulseItem
                  label="Нових зв’язків"
                  value="+14"
                  detail="цього тижня"
                />

                <PulseItem
                  label="Людей поруч"
                  value="7"
                  detail="у вашому колі"
                />

              </div>

            </section>

            {/* REPUTATION */}

            <section className="profile-v2-card">

              <div className="profile-v2-card-head">

                <div>
                  <span>
                    РЕПУТАЦІЯ
                  </span>

                  <h3>
                    Довіра у ЯТУТ
                  </h3>
                </div>

              </div>

              <div className="profile-v2-reputation">

                {reputation.map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item.label
                      }
                    >

                      <header>

                        <strong>
                          {
                            item.label
                          }
                        </strong>

                        <span>
                          {
                            item.value
                          }
                          %
                        </span>

                      </header>

                      <div className="profile-v2-progress">

                        <i
                          style={{
                            width:
                              `${item.value}%`,
                          }}
                        />

                      </div>

                      <small>
                        {
                          item.text
                        }
                      </small>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* BADGES */}

            <section className="profile-v2-card">

              <div className="profile-v2-card-head">

                <div>
                  <span>
                    ВАШІ ЗНАЧКИ
                  </span>

                  <h3>
                    Головні відзнаки
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      "achievements"
                    )
                  }
                >
                  Усі
                </button>

              </div>

              <div className="profile-v2-badge-row">

                {ACHIEVEMENTS
                  .slice(
                    0,
                    4
                  )
                  .map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className={`profile-v2-mini-badge ${item.tone}`}
                        title={
                          item.title
                        }
                      >
                        {
                          item.symbol
                        }
                      </div>
                    )
                  )}

              </div>

            </section>

            {/* CONNECTION MAP */}

            <section className="profile-v2-card profile-v2-connection-card">

              <div className="profile-v2-connection-icon">
                <YatutIcon
                  name="friends"
                  size={23}
                />
              </div>

              <div>

                <span>
                  ЧОМУ МИ ЗНАЙОМІ?
                </span>

                <h3>
                  Карта ваших
                  зв’язків
                </h3>

                <p>
                  Дізнайтесь,
                  через кого,
                  місця та події
                  ви пов’язані
                  з іншими людьми.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "search"
                  )
                }
              >
                Відкрити

                <YatutIcon
                  name="arrowRight"
                  size={15}
                />
              </button>

            </section>

          </aside>

        </div>

      </section>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (
        <EditProfileModal
          profile={
            profile
          }
          onClose={() =>
            setEditing(
              false
            )
          }
          onSave={(
            nextProfile
          ) => {
            setProfile(
              nextProfile
            );

            setEditing(
              false
            );
          }}
        />
      )}

    </section>
  );
}

/* =========================================================
   ABOUT ROW
========================================================= */

function AboutRow({
  icon,
  label,
  value,
}) {
  return (
    <article className="profile-v2-about-row">

      <div>
        <YatutIcon
          name={icon}
          size={17}
        />
      </div>

      <section>

        <span>
          {label}
        </span>

        <strong>
          {value ||
            "Не вказано"}
        </strong>

      </section>

    </article>
  );
}

/* =========================================================
   ACHIEVEMENT
========================================================= */

function Achievement({
  item,
}) {
  return (
    <article
      className={`profile-v2-achievement ${item.tone}`}
    >

      <div>
        {
          item.symbol
        }
      </div>

      <section>

        <strong>
          {
            item.title
          }
        </strong>

        <span>
          {
            item.subtitle
          }
        </span>

      </section>

    </article>
  );
}

/* =========================================================
   PULSE ITEM
========================================================= */

function PulseItem({
  label,
  value,
  detail,
}) {
  return (
    <article className="profile-v2-pulse-item">

      <div>

        <strong>
          {
            label
          }
        </strong>

        <span>
          {
            detail
          }
        </span>

      </div>

      <b>
        {
          value
        }
      </b>

    </article>
  );
}

/* =========================================================
   EDIT PROFILE MODAL
========================================================= */

function EditProfileModal({
  profile,
  onClose,
  onSave,
}) {
  const [
    draft,
    setDraft,
  ] =
    useState(
      profile
    );

  const avatarInputRef =
    useRef(null);

  const coverInputRef =
    useRef(null);

  /* =======================================================
     IMAGE
  ======================================================= */

  async function chooseImage(
    file,
    field
  ) {
    if (!file) {
      return;
    }

    try {
      const dataUrl =
        await fileToDataUrl(
          file
        );

      setDraft(
        (
          previous
        ) => ({
          ...previous,

          [field]:
            dataUrl,
        })
      );
    } catch (error) {
      console.error(
        "PROFILE IMAGE ERROR:",
        error
      );
    }
  }

  /* =======================================================
     FIELD
  ======================================================= */

  function setField(
    field,
    value
  ) {
    setDraft(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          value,
      })
    );
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  function submit(
    event
  ) {
    event.preventDefault();

    onSave({
      ...profile,
      ...draft,

      name:
        draft.name
          ?.trim() ||
        profile.name,

      username:
        draft.username
          ?.trim()
          .replace(
            /^@/,
            ""
          ) ||
        profile.username,

      interests:
        Array.isArray(
          draft.interests
        )
          ? draft.interests
          : [],
    });
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="profile-v2-edit-backdrop"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <form
        className="profile-v2-edit-modal"
        onSubmit={
          submit
        }
      >

        {/* HEADER */}

        <header>

          <div>

            <span>
              ЯТУТ PROFILE
            </span>

            <h2>
              Редагувати профіль
            </h2>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Закрити"
          >
            <YatutIcon
              name="close"
              size={18}
            />
          </button>

        </header>

        {/* COVER */}

        <div
          className="profile-v2-edit-cover"
          style={
            draft.cover
              ? {
                  backgroundImage:
                    `linear-gradient(
                      180deg,
                      rgba(14,16,26,.08),
                      rgba(14,16,26,.38)
                    ),
                    url("${draft.cover}")`,
                }
              : undefined
          }
        >

          <button
            type="button"
            onClick={() =>
              coverInputRef
                .current
                ?.click()
            }
          >
            Змінити обкладинку
          </button>

        </div>

        {/* AVATAR */}

        <div className="profile-v2-edit-avatar-row">

          <div className="profile-v2-edit-avatar">

            {draft.avatar ? (
              <img
                src={
                  draft.avatar
                }
                alt=""
              />
            ) : (
              draft.name?.[0] ||
              "В"
            )}

          </div>

          <div>

            <strong>
              Фото профілю
            </strong>

            <span>
              JPG, PNG або WEBP
            </span>

            <button
              type="button"
              onClick={() =>
                avatarInputRef
                  .current
                  ?.click()
              }
            >
              Змінити фото
            </button>

          </div>

        </div>

        {/* BODY */}

        <div className="profile-v2-edit-body">

          {/* BASIC */}

          <section>

            <h3>
              Основне
            </h3>

            <div className="profile-v2-form-grid">

              <label>

                <span>
                  Ім’я
                </span>

                <input
                  value={
                    draft.name
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "name",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Username
                </span>

                <input
                  value={
                    draft.username
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "username",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

            </div>

            <label>

              <span>
                Про себе
              </span>

              <textarea
                value={
                  draft.bio
                }
                onChange={(
                  event
                ) =>
                  setField(
                    "bio",
                    event
                      .target
                      .value
                  )
                }
                maxLength={
                  500
                }
              />

            </label>

          </section>

          {/* INFO */}

          <section>

            <h3>
              Інформація
            </h3>

            <div className="profile-v2-form-grid">

              <label>

                <span>
                  Місто
                </span>

                <input
                  value={
                    draft.city
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "city",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Країна
                </span>

                <input
                  value={
                    draft.country
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "country",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Робота
                </span>

                <input
                  value={
                    draft.work
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "work",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

              <label>

                <span>
                  Освіта
                </span>

                <input
                  value={
                    draft.education
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "education",
                      event
                        .target
                        .value
                    )
                  }
                />

              </label>

            </div>

          </section>

          {/* INTERESTS */}

          <section>

            <h3>
              Інтереси
            </h3>

            <label>

              <span>
                Через кому
              </span>

              <input
                value={
                  draft.interests.join(
                    ", "
                  )
                }
                onChange={(
                  event
                ) =>
                  setField(
                    "interests",

                    event
                      .target
                      .value
                      .split(
                        ","
                      )
                      .map(
                        (
                          item
                        ) =>
                          item.trim()
                      )
                      .filter(
                        Boolean
                      )
                  )
                }
              />

            </label>

          </section>

        </div>

        {/* FOOTER */}

        <footer>

          <button
            className="profile-v2-edit-cancel"
            type="button"
            onClick={
              onClose
            }
          >
            Скасувати
          </button>

          <button
            className="profile-v2-edit-save"
            type="submit"
          >
            Зберегти
          </button>

        </footer>

        {/* FILE INPUTS */}

        <input
          ref={
            avatarInputRef
          }
          type="file"
          accept="image/*"
          hidden
          onChange={(
            event
          ) =>
            chooseImage(
              event
                .target
                .files?.[0],

              "avatar"
            )
          }
        />

        <input
          ref={
            coverInputRef
          }
          type="file"
          accept="image/*"
          hidden
          onChange={(
            event
          ) =>
            chooseImage(
              event
                .target
                .files?.[0],

              "cover"
            )
          }
        />

      </form>

    </div>
  );
}