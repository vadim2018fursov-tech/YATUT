import {
  Activity,
  BarChart3,
  Briefcase,
  Camera,
  ChevronRight,
  Edit3,
  ExternalLink,
  Film,
  GraduationCap,
  Link2,
  MapPin,
  MoreHorizontal,
  Play,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

const DEFAULT_PROFILE = {
  name: "Вадим",
  username: "vadym",
  location: "Київ",
  bio: "Будую ЯТУТ — соціальну мережу, де люди знаходять своїх.",
  work: "ЯТУТ",
  education: "Київ",
  website: "yatut.vercel.app",
};

const POSTS = [
  {
    id: "post-1",
    text:
      "Працюємо над ЯТУТ. Хочу, щоб тут можна було не просто дивитися контент, а реально знаходити своїх людей.",
    time: "18 хв тому",
    likes: 128,
    comments: 24,
  },
  {
    id: "post-2",
    text:
      "Київ сьогодні неймовірний. Хто зараз у центрі?",
    time: "2 год тому",
    likes: 74,
    comments: 11,
  },
];

const COVER_STATS = [
  {
    id: "friends",
    value: "248",
    label: "Друзі",
  },
  {
    id: "followers",
    value: "12,8K",
    label: "Підписники",
  },
  {
    id: "posts",
    value: "184",
    label: "Дописи",
  },
  {
    id: "pulse",
    value: "38,4K",
    label: "PULSE",
  },
];

function loadProfile() {
  try {
    const saved =
      localStorage.getItem(
        "yatut-profile-v2"
      );

    if (!saved) {
      return DEFAULT_PROFILE;
    }

    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function ProfilePage({
  onNavigate,
  onOpenChat,
}) {
  const [
    profile,
    setProfile,
  ] = useState(loadProfile);

  const [
    draft,
    setDraft,
  ] = useState(profile);

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    activeTab,
    setActiveTab,
  ] = useState("posts");

  const tabs =
    useMemo(
      () => [
        {
          id: "posts",
          label: "Дописи",
        },
        {
          id: "videos",
          label: "Відео",
        },
        {
          id: "clips",
          label: "Clips",
        },
        {
          id: "pulse",
          label: "PULSE",
        },
      ],
      []
    );

  function saveProfile() {
    setProfile(draft);

    localStorage.setItem(
      "yatut-profile-v2",
      JSON.stringify(draft)
    );

    setEditing(false);
  }

  function closeEditor() {
    setDraft(profile);
    setEditing(false);
  }

  function handleStatClick(
    statId
  ) {
    if (
      statId ===
      "friends"
    ) {
      onNavigate?.(
        "friends"
      );

      return;
    }

    if (
      statId ===
      "posts"
    ) {
      setActiveTab(
        "posts"
      );

      return;
    }

    if (
      statId ===
      "pulse"
    ) {
      setActiveTab(
        "pulse"
      );
    }
  }

  return (
    <div className="profile-v2-page">
      {/* =================================================
          COVER
      ================================================= */}

      <section className="profile-v2-cover">
        <div className="profile-v2-cover__glow" />

        <button
          type="button"
          className="profile-v2-cover__change"
        >
          <Camera size={15} />

          Змінити обкладинку
        </button>

        <div className="profile-v2-cover__city">
          <MapPin size={14} />

          {profile.location}
        </div>

        {/* BIG AVATAR */}

        <div className="profile-v2-cover-avatar">
          <div className="profile-v2-cover-avatar__frame">
            <span>
              {profile.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "В"}
            </span>

            <i />
          </div>

          <button
            type="button"
            className="profile-v2-cover-avatar__camera"
            aria-label="Змінити фото профілю"
          >
            <Camera size={17} />
          </button>
        </div>

        {/* COVER STATS */}

        <div className="profile-v2-cover-stats">
          {COVER_STATS.map(
            (stat) => (
              <button
                type="button"
                key={stat.id}
                onClick={() =>
                  handleStatClick(
                    stat.id
                  )
                }
              >
                <strong>
                  {stat.value}
                </strong>

                <span>
                  {stat.label}
                </span>
              </button>
            )
          )}
        </div>
      </section>

      {/* =================================================
          PROFILE INFO
      ================================================= */}

      <section className="profile-v2-identity">
        <div className="profile-v2-identity__main">
          <div className="profile-v2-name-row">
            <div>
              <div className="profile-v2-name-line">
                <h1>
                  {profile.name}
                </h1>

                <span className="profile-v2-name-check">
                  <ShieldCheck
                    size={18}
                  />
                </span>
              </div>

              <span className="profile-v2-username-text">
                @{profile.username}
              </span>
            </div>

            <span className="profile-v2-verified">
              <ShieldCheck
                size={15}
              />

              Підтверджено
            </span>
          </div>

          <p>
            {profile.bio}
          </p>

          <div className="profile-v2-meta">
            <span>
              <MapPin
                size={14}
              />

              {profile.location}
            </span>

            <span>
              <Briefcase
                size={14}
              />

              {profile.work}
            </span>

            <span>
              <Link2
                size={14}
              />

              {profile.website}
            </span>
          </div>
        </div>

        <div className="profile-v2-actions">
          <button
            type="button"
            className="is-primary"
            onClick={() =>
              setEditing(true)
            }
          >
            <Edit3
              size={16}
            />

            Редагувати профіль
          </button>

          <button
            type="button"
            aria-label="Налаштування"
            onClick={() =>
              onNavigate?.(
                "settings"
              )
            }
          >
            <Settings
              size={17}
            />
          </button>

          <button
            type="button"
            aria-label="Більше"
          >
            <MoreHorizontal
              size={18}
            />
          </button>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="profile-v2-layout">
        <main className="profile-v2-main">
          <nav className="profile-v2-tabs">
            {tabs.map(
              (tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={
                    activeTab ===
                    tab.id
                      ? "is-active"
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
          </nav>

          {/* POSTS */}

          {activeTab ===
            "posts" && (
            <section className="profile-v2-feed">
              <button
                type="button"
                className="profile-v2-create-post"
                onClick={() =>
                  onNavigate?.(
                    "home"
                  )
                }
              >
                <span>
                  {profile.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "В"}
                </span>

                <div>
                  Що у тебе нового?
                </div>

                <Sparkles
                  size={18}
                />
              </button>

              {POSTS.map(
                (post) => (
                  <article
                    className="profile-v2-post"
                    key={post.id}
                  >
                    <header>
                      <span>
                        {profile.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "В"}
                      </span>

                      <div>
                        <strong>
                          {profile.name}
                        </strong>

                        <small>
                          {post.time}
                        </small>
                      </div>

                      <button
                        type="button"
                        aria-label="Більше"
                      >
                        <MoreHorizontal
                          size={17}
                        />
                      </button>
                    </header>

                    <p>
                      {post.text}
                    </p>

                    <footer>
                      <span>
                        ❤️{" "}
                        {post.likes}
                      </span>

                      <span>
                        💬{" "}
                        {post.comments}
                      </span>
                    </footer>
                  </article>
                )
              )}
            </section>
          )}

          {/* VIDEOS */}

          {activeTab ===
            "videos" && (
            <section className="profile-v2-media-grid">
              {[
                "48 годин у Львові",
                "Мій Київ",
                "Як народжується ЯТУТ",
              ].map(
                (
                  title,
                  index
                ) => (
                  <button
                    type="button"
                    key={title}
                    className="profile-v2-video-card"
                    onClick={() =>
                      onNavigate?.(
                        "watch"
                      )
                    }
                  >
                    <div>
                      <Play
                        size={24}
                        fill="currentColor"
                      />
                    </div>

                    <strong>
                      {title}
                    </strong>

                    <span>
                      {12 +
                        index *
                          7}
                      K переглядів
                    </span>
                  </button>
                )
              )}
            </section>
          )}

          {/* CLIPS */}

          {activeTab ===
            "clips" && (
            <section className="profile-v2-clips">
              {[
                "Київ зараз",
                "Поділ ввечері",
                "Момент дня",
                "ЯТУТ PULSE",
              ].map(
                (title) => (
                  <button
                    type="button"
                    key={title}
                    onClick={() =>
                      onNavigate?.(
                        "clips"
                      )
                    }
                  >
                    <Film
                      size={26}
                    />

                    <strong>
                      {title}
                    </strong>

                    <small>
                      Clip
                    </small>
                  </button>
                )
              )}
            </section>
          )}

          {/* PULSE */}

          {activeTab ===
            "pulse" && (
            <section className="profile-v2-pulse">
              <div className="profile-v2-pulse__hero">
                <Activity
                  size={28}
                />

                <div>
                  <small>
                    ТВІЙ PULSE
                  </small>

                  <h2>
                    Ти зараз
                    у Києві
                  </h2>

                  <p>
                    Місця,
                    відео,
                    люди та
                    події,
                    з якими ти
                    повʼязаний.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onNavigate?.(
                      "cityPulse",
                      {
                        cityId:
                          "kyiv",
                      }
                    )
                  }
                >
                  Відкрити Київ

                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>

              <div className="profile-v2-pulse__cards">
                <article>
                  <strong>
                    17
                  </strong>

                  <span>
                    місць
                  </span>
                </article>

                <article>
                  <strong>
                    18
                  </strong>

                  <span>
                    хвиль
                  </span>
                </article>

                <article>
                  <strong>
                    4
                  </strong>

                  <span>
                    LIVE
                  </span>
                </article>

                <article>
                  <strong>
                    38,4K
                  </strong>

                  <span>
                    охоплення
                  </span>
                </article>
              </div>

              <button
                type="button"
                className="profile-v2-studio"
                onClick={() =>
                  onNavigate?.(
                    "creatorStudio"
                  )
                }
              >
                <BarChart3
                  size={18}
                />

                <div>
                  <strong>
                    Creator Studio
                  </strong>

                  <span>
                    Аналітика твоїх
                    відео та PULSE
                  </span>
                </div>

                <ChevronRight
                  size={18}
                />
              </button>
            </section>
          )}
        </main>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="profile-v2-sidebar">
          <section className="profile-v2-card">
            <header>
              <UserRound
                size={17}
              />

              <strong>
                Про мене
              </strong>
            </header>

            <p>
              {profile.bio}
            </p>

            <div className="profile-v2-info-row">
              <Briefcase
                size={15}
              />

              <div>
                <small>
                  Робота
                </small>

                <strong>
                  {profile.work}
                </strong>
              </div>
            </div>

            <div className="profile-v2-info-row">
              <GraduationCap
                size={15}
              />

              <div>
                <small>
                  Навчання
                </small>

                <strong>
                  {profile.education}
                </strong>
              </div>
            </div>

            <div className="profile-v2-info-row">
              <MapPin
                size={15}
              />

              <div>
                <small>
                  Місто
                </small>

                <strong>
                  {profile.location}
                </strong>
              </div>
            </div>

            <div className="profile-v2-info-row">
              <ExternalLink
                size={15}
              />

              <div>
                <small>
                  Сайт
                </small>

                <strong>
                  {profile.website}
                </strong>
              </div>
            </div>
          </section>

          <section className="profile-v2-card">
            <header>
              <Users
                size={17}
              />

              <strong>
                Друзі
              </strong>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "friends"
                  )
                }
              >
                Усі
              </button>
            </header>

            <div className="profile-v2-friends-grid">
              {[
                "М",
                "О",
                "С",
                "А",
                "Д",
                "І",
              ].map(
                (
                  name,
                  index
                ) => (
                  <button
                    type="button"
                    key={`${name}-${index}`}
                    onClick={() =>
                      index === 0
                        ? onOpenChat?.(
                            "maria"
                          )
                        : onNavigate?.(
                            "friends"
                          )
                    }
                  >
                    <span>
                      {name}
                    </span>

                    <small>
                      {
                        [
                          "Марія",
                          "Олександр",
                          "Софія",
                          "Анна",
                          "Данило",
                          "Ірина",
                        ][index]
                      }
                    </small>
                  </button>
                )
              )}
            </div>
          </section>

          <section className="profile-v2-card profile-v2-achievement">
            <header>
              <Sparkles
                size={17}
              />

              <strong>
                Досягнення
              </strong>
            </header>

            <div>
              <span>
                Я
              </span>

              <section>
                <small>
                  ЯТУТ
                </small>

                <strong>
                  Засновник
                </strong>

                <p>
                  Профіль творця
                  мережі ЯТУТ
                </p>
              </section>
            </div>
          </section>
        </aside>
      </div>

      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      {editing && (
        <div className="profile-v2-modal-backdrop">
          <section className="profile-v2-modal">
            <header>
              <div>
                <Edit3
                  size={18}
                />

                <strong>
                  Редагувати профіль
                </strong>
              </div>

              <button
                type="button"
                aria-label="Закрити"
                onClick={
                  closeEditor
                }
              >
                <X
                  size={19}
                />
              </button>
            </header>

            <div className="profile-v2-form">
              <label>
                Імʼя

                <input
                  value={
                    draft.name
                  }
                  onChange={(
                    event
                  ) =>
                    setDraft(
                      (
                        current
                      ) => ({
                        ...current,
                        name:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <label>
                Username

                <div className="profile-v2-username">
                  <span>
                    @
                  </span>

                  <input
                    value={
                      draft.username
                    }
                    onChange={(
                      event
                    ) =>
                      setDraft(
                        (
                          current
                        ) => ({
                          ...current,
                          username:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </div>
              </label>

              <label>
                Про себе

                <textarea
                  value={
                    draft.bio
                  }
                  onChange={(
                    event
                  ) =>
                    setDraft(
                      (
                        current
                      ) => ({
                        ...current,
                        bio:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <div className="profile-v2-form-grid">
                <label>
                  Місто

                  <input
                    value={
                      draft.location
                    }
                    onChange={(
                      event
                    ) =>
                      setDraft(
                        (
                          current
                        ) => ({
                          ...current,
                          location:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Робота

                  <input
                    value={
                      draft.work
                    }
                    onChange={(
                      event
                    ) =>
                      setDraft(
                        (
                          current
                        ) => ({
                          ...current,
                          work:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Навчання

                  <input
                    value={
                      draft.education
                    }
                    onChange={(
                      event
                    ) =>
                      setDraft(
                        (
                          current
                        ) => ({
                          ...current,
                          education:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Сайт

                  <input
                    value={
                      draft.website
                    }
                    onChange={(
                      event
                    ) =>
                      setDraft(
                        (
                          current
                        ) => ({
                          ...current,
                          website:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <footer>
              <button
                type="button"
                onClick={
                  closeEditor
                }
              >
                Скасувати
              </button>

              <button
                type="button"
                className="is-primary"
                onClick={
                  saveProfile
                }
              >
                <Save
                  size={16}
                />

                Зберегти
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}