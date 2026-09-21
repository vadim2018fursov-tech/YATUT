import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  Pencil,
  ChevronLeft,
  Clock3,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Search,
  Share2,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import {
  createEvent,
  ensureEventChat,
  loadEvents,
  saveEvents,
  subscribeEvents,
} from "../storage/eventService";

import {
  consumeCommunityEventContext,
} from "../storage/communityEventBridge";

import {
  shareYatutItem,
} from "../utils/shareYatutItem";

import {
  cancelBackendEvent,
  createBackendEvent,
  deleteBackendEvent,
  inviteBackendEventFriends,
  loadBackendEventParticipants,
  loadBackendEvents,
  loadEventInviteCandidates,
  removeBackendEventParticipant,
  setBackendEventParticipation,
  toggleBackendEventLike,
  updateBackendEvent,
} from "../services/eventBackendService";

import {
  subscribeEventsRealtime,
} from "../services/realtimeService";

import {
  openBackendEventChat,
} from "../services/chatBackendService";

/* =========================================================
   PEOPLE
========================================================= */

const PEOPLE = {
  me: {
    id: "me",
    name: "Вадим",
    initials: "В",
  },

  maria: {
    id: "maria",
    name: "Марія Коваль",
    initials: "М",
  },

  oleksandr: {
    id: "oleksandr",
    name: "Олександр Бондар",
    initials: "О",
  },

  sofia: {
    id: "sofia",
    name: "Софія Романенко",
    initials: "С",
  },

  yulia: {
    id: "yulia",
    name: "Юлія Савченко",
    initials: "Ю",
  },

  max: {
    id: "max",
    name: "Максим Шевченко",
    initials: "М",
  },

  vlad: {
    id: "vlad",
    name: "Владислав Мороз",
    initials: "В",
  },
};

/* =========================================================
   CATEGORIES
========================================================= */

const CATEGORIES = [
  {
    id: "sport",
    label: "Спорт",
    emoji: "🏃",
  },

  {
    id: "technology",
    label: "Технології",
    emoji: "🚀",
  },

  {
    id: "creative",
    label: "Творчість",
    emoji: "🎨",
  },

  {
    id: "music",
    label: "Музика",
    emoji: "🎵",
  },

  {
    id: "business",
    label: "Бізнес",
    emoji: "💼",
  },

  {
    id: "education",
    label: "Навчання",
    emoji: "🎓",
  },

  {
    id: "food",
    label: "Їжа",
    emoji: "🍕",
  },

  {
    id: "other",
    label: "Інше",
    emoji: "✨",
  },
];

const FILTER_TABS = [
  {
    id: "for-you",
    label: "Для вас",
  },

  {
    id: "nearby",
    label: "Поруч",
  },

  {
    id: "popular",
    label: "Популярні",
  },

  {
    id: "friends",
    label: "Друзі",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  date
) {
  if (!date) {
    return "Дата не вказана";
  }

  try {
    const parsed =
      new Date(
        `${date}T12:00:00`
      );

    return parsed.toLocaleDateString(
      "uk-UA",
      {
        day: "numeric",
        month: "long",
      }
    );
  } catch {
    return date;
  }
}

function eventSearchText(
  event
) {
  return [
    event.title,
    event.description,
    event.city,
    event.place,
    event.categoryLabel,
    event.communityName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function eventCoverStyle(
  event
) {
  if (event.cover) {
    return {
      backgroundImage:
        `url("${event.cover}")`,
    };
  }

  const gradients = {
    sport:
      "linear-gradient(145deg,#6d5dfc,#826cff)",

    technology:
      "linear-gradient(145deg,#252633,#555b7a)",

    creative:
      "linear-gradient(145deg,#ff6f91,#7c3aed)",

    music:
      "linear-gradient(145deg,#ff4f8b,#ff8b6a)",

    business:
      "linear-gradient(145deg,#343746,#6366f1)",

    education:
      "linear-gradient(145deg,#0ea5e9,#6366f1)",

    food:
      "linear-gradient(145deg,#f59e0b,#ef4444)",

    other:
      "linear-gradient(145deg,#8b5cf6,#ff4f8b)",
  };

  return {
    background:
      gradients[
        event.category
      ] ||
      gradients.other,
  };
}

/* =========================================================
   EVENT CARD
========================================================= */

function EventCard({
  event,
  onOpen,
  onToggleLike,
  onToggleGoing,
  onShare,
}) {
  const going =
    event.attendees?.includes(
      "me"
    );

  const friendIds =
    (event.attendees || [])
      .filter(
        (id) =>
          id !== "me"
      )
      .slice(
        0,
        3
      );

  return (
    <article className="event-card">
      <button
        type="button"
        className="event-card-cover-button"
        onClick={() =>
          onOpen(
            event.id
          )
        }
      >
        <div
          className={`event-card-cover ${
            event.cover
              ? "has-event-photo"
              : ""
          }`}
          style={
            eventCoverStyle(
              event
            )
          }
        >
          {event.cover && (
            <div className="event-cover-shade" />
          )}

          <div className="event-cover-content">
            <span className="event-card-emoji">
              {
                event.emoji
              }
            </span>

            <div className="event-card-cover-info">
              <b>
                {
                  event.categoryLabel
                }
              </b>

              <strong>
                {formatDate(
                  event.date
                )}
              </strong>
            </div>
          </div>
        </div>
      </button>

      <div className="event-card-content">
        {event.communityName && (
          <div className="event-community-chip">
            <Users
              size={12}
            />

            {
              event.communityName
            }
          </div>
        )}

        <button
          type="button"
          className="event-card-title"
          onClick={() =>
            onOpen(
              event.id
            )
          }
        >
          {
            event.title
          }
        </button>

        <div className="event-card-meta">
          <span>
            <Clock3
              size={12}
            />

            {event.time ||
              "Час не вказано"}
          </span>

          <span>
            <MapPin
              size={12}
            />

            {event.place ||
              event.city ||
              "Київ"}
          </span>
        </div>

        <div className="event-friends-going">
          <div className="event-mini-avatars">
            {friendIds.map(
              (id) => (
                <span
                  key={
                    id
                  }
                  title={
                    PEOPLE[id]
                      ?.name
                  }
                >
                  {PEOPLE[id]
                    ?.initials ||
                    "Я"}
                </span>
              )
            )}
          </div>

          <span>
            {event.backend
              ? event.goingCount > 0
                ? event.goingCount + " учасників вже йдуть"
                : "Будьте серед перших"
              : friendIds.length > 0
              ? friendIds.length + " знайомих вже йдуть"
              : "Будьте серед перших"}
          </span>
        </div>

        <footer className="event-card-footer">
          <div>
            <button
              type="button"
              className={
                event.liked
                  ? "active"
                  : ""
              }
              onClick={() =>
                onToggleLike(
                  event.id
                )
              }
            >
              <Heart
                size={14}
                fill={
                  event.liked
                    ? "currentColor"
                    : "none"
                }
              />

              {
                event.likes
              }
            </button>

            <button
              type="button"
              className={
                going
                  ? "going"
                  : ""
              }
              onClick={() =>
                onToggleGoing(
                  event.id
                )
              }
            >
              <Check
                size={14}
              />

              {going
                ? "Йду"
                : "Піду"}
            </button>

            <button
              type="button"
              onClick={() =>
                onShare(
                  event
                )
              }
            >
              <Share2
                size={14}
              />

              Поширити
            </button>
          </div>

          <button
            type="button"
            className="event-open-button"
            onClick={() =>
              onOpen(
                event.id
              )
            }
          >
            Відкрити
          </button>
        </footer>
      </div>
    </article>
  );
}

/* =========================================================
   COMMUNITY CONTEXT
========================================================= */

function CommunityContextBanner({
  community,
}) {
  if (!community) {
    return null;
  }

  return (
    <div className="event-community-context">
      <div className="event-community-context-avatar">
        {community.communityAvatar ? (
          <img
            src={
              community.communityAvatar
            }
            alt=""
          />
        ) : (
          <span>
            {community.communityName?.[
              0
            ] || "С"}
          </span>
        )}
      </div>

      <div>
        <span>
          ПОДІЯ СПІЛЬНОТИ
        </span>

        <strong>
          {
            community.communityName
          }
        </strong>

        <small>
          Подія автоматично з’явиться у цій спільноті.
        </small>
      </div>
    </div>
  );
}

/* =========================================================
   CREATE MODAL
========================================================= */

function CreateEventModal({
  onClose,
  onCreate,
  communityContext = null,
  backendMode = false,
}) {
  const imageInputRef =
    useRef(null);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState(
    "other"
  );

  const [
    date,
    setDate,
  ] = useState("");

  const [
    time,
    setTime,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState(
    "Київ"
  );

  const [
    place,
    setPlace,
  ] = useState("");

  const [
    cover,
    setCover,
  ] = useState(
    communityContext
      ?.communityCover ||
      null
  );

  const [
    coverFile,
    setCoverFile,
  ] = useState(null);

  const [
    publishToFeed,
    setPublishToFeed,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const selectedCategory =
    CATEGORIES.find(
      (item) =>
        item.id ===
        category
    ) ||
    CATEGORIES[
      CATEGORIES.length -
        1
    ];

  useEffect(() => {
    const old =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        old;
    };
  }, []);

  function chooseCover(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return;
    }

    if (
      backendMode
    ) {
      setCoverFile(
        file
      );
    }

    const reader =
      new FileReader();

    reader.onload =
      () => {
        setCover(
          reader.result
        );
      };

    reader.readAsDataURL(
      file
    );
  }

  async function submit() {
    if (
      !title.trim() ||
      !date
    ) {
      return;
    }

    if (
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(
        true
      );

      const newEvent =
        createEvent({
          title,

          description,

          category:
            selectedCategory.id,

          categoryLabel:
            selectedCategory.label,

          emoji:
            selectedCategory.emoji,

          city,

          place,

          date,

          time,

          cover,

          visibility:
            "public",

          communityId:
            communityContext
              ?.communityId ||
            null,

          communityName:
            communityContext
              ?.communityName ||
            null,

          communityAvatar:
            communityContext
              ?.communityAvatar ||
            null,
        });

      await onCreate?.(
        newEvent,
        {
          publishToFeed:
            communityContext
              ? false
              : publishToFeed,

          communityContext,

          coverFile:
            backendMode
              ? coverFile
              : null,
        }
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  return (
    <div
      className="event-modal-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="event-create-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="event-create-header">
          <div>
            <span>
              ЯТУТ ПОДІЇ
            </span>

            <h2>
              Створити подію
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            <X
              size={20}
            />
          </button>
        </header>

        <div className="event-create-body">
          <CommunityContextBanner
            community={
              communityContext
            }
          />

          <div className="event-photo-field">
            <div className="event-photo-label">
              <div>
                <strong>
                  Обкладинка
                </strong>

                <span>
                  Додайте атмосферу події
                </span>
              </div>

              <small>
                JPG / PNG
              </small>
            </div>

            {!cover ? (
              <button
                type="button"
                className="event-photo-upload"
                onClick={() =>
                  imageInputRef.current?.click()
                }
              >
                <div>
                  <ImagePlus
                    size={30}
                  />
                </div>

                <strong>
                  Додати фото
                </strong>

                <span>
                  Натисніть, щоб вибрати
                </span>
              </button>
            ) : (
              <div className="event-photo-preview">
                <img
                  src={
                    cover
                  }
                  alt=""
                />

                <div className="event-photo-preview-actions">
                  <button
                    type="button"
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                  >
                    Змінити
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCover(
                        null
                      );
                      setCoverFile(
                        null
                      );
                    }}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            )}

            <input
              ref={
                imageInputRef
              }
              type="file"
              accept="image/*"
              hidden
              onChange={
                chooseCover
              }
            />
          </div>

          <label className="event-field">
            <span>
              Назва події *
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
              placeholder="Наприклад: Зустріч спільноти у Києві"
            />
          </label>

          <label className="event-field">
            <span>
              Опис
            </span>

            <textarea
              value={
                description
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event.target
                    .value
                )
              }
              placeholder="Розкажіть, що буде відбуватися..."
            />
          </label>

          <div className="event-field-row">
            <label className="event-field">
              <span>
                Категорія
              </span>

              <select
                value={
                  category
                }
                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value
                  )
                }
              >
                {CATEGORIES.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.emoji
                      }{" "}
                      {
                        item.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="event-field">
              <span>
                Місто
              </span>

              <input
                value={
                  city
                }
                onChange={(
                  event
                ) =>
                  setCity(
                    event.target
                      .value
                  )
                }
              />
            </label>
          </div>

          <div className="event-field-row">
            <label className="event-field">
              <span>
                Дата *
              </span>

              <input
                type="date"
                value={
                  date
                }
                onChange={(
                  event
                ) =>
                  setDate(
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label className="event-field">
              <span>
                Час
              </span>

              <input
                type="time"
                value={
                  time
                }
                onChange={(
                  event
                ) =>
                  setTime(
                    event.target
                      .value
                  )
                }
              />
            </label>
          </div>

          <label className="event-field">
            <span>
              Місце
            </span>

            <input
              value={
                place
              }
              onChange={(
                event
              ) =>
                setPlace(
                  event.target
                    .value
                )
              }
              placeholder="Парк, заклад, адреса..."
            />
          </label>

          {communityContext ? (
            <div className="event-backend-note">
              <Sparkles
                size={20}
              />

              <div>
                <strong>
                  Подія спільноти
                </strong>

                <span>
                  Вона залишиться всередині спільноти й не потрапить у загальну стрічку.
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={`event-feed-toggle ${
                publishToFeed
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setPublishToFeed(
                  !publishToFeed
                )
              }
            >
              <span>
                {publishToFeed
                  ? "✓"
                  : ""}
              </span>

              <div>
                <strong>
                  Опублікувати у стрічці
                </strong>

                <small>
                  Створити повʼязаний допис про подію
                </small>
              </div>
            </button>
          )}
        </div>

        <footer className="event-create-footer">
          <button
            type="button"
            className="event-create-cancel"
            onClick={
              onClose
            }
          >
            Скасувати
          </button>

          <button
            type="button"
            className="event-create-submit"
            disabled={
              !title.trim() ||
              !date ||
              submitting
            }
            onClick={
              submit
            }
          >
            {submitting
              ? "Створюємо..."
              : "Створити подію"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function EditEventModal({
  event,
  onClose,
  onSave,
}) {
  const [
    title,
    setTitle,
  ] = useState(
    event.title ||
    ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    event.description ||
    ""
  );

  const [
    category,
    setCategory,
  ] = useState(
    event.category ||
    "other"
  );

  const [
    city,
    setCity,
  ] = useState(
    event.city ||
    ""
  );

  const [
    place,
    setPlace,
  ] = useState(
    event.place ||
    ""
  );

  const [
    date,
    setDate,
  ] = useState(
    event.date ||
    ""
  );

  const [
    time,
    setTime,
  ] = useState(
    event.time ||
    ""
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  async function submit() {
    if (
      !title.trim() ||
      !date ||
      saving
    ) {
      return;
    }

    try {
      setSaving(
        true
      );

      await onSave?.({
        title:
          title.trim(),
        description,
        category,
        city,
        place,
        date,
        time,
      });
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <div
      className="event-modal-backdrop"
      onMouseDown={
        onClose
      }
    >
      <section
        className="event-create-modal"
        onMouseDown={(
          click
        ) =>
          click.stopPropagation()
        }
      >
        <header className="event-create-header">
          <div>
            <span>
              КЕРУВАННЯ ПОДІЄЮ
            </span>

            <h2>
              Редагувати подію
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            <X size={20} />
          </button>
        </header>

        <div className="event-create-body">
          <label className="event-field">
            <span>
              Назва *
            </span>

            <input
              value={title}
              onChange={(
                input
              ) =>
                setTitle(
                  input.target.value
                )
              }
            />
          </label>

          <label className="event-field">
            <span>
              Опис
            </span>

            <textarea
              value={description}
              onChange={(
                input
              ) =>
                setDescription(
                  input.target.value
                )
              }
            />
          </label>

          <div className="event-field-row">
            <label className="event-field">
              <span>
                Категорія
              </span>

              <select
                value={category}
                onChange={(
                  input
                ) =>
                  setCategory(
                    input.target.value
                  )
                }
              >
                {CATEGORIES.map(
                  (
                    item
                  ) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.emoji} {item.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="event-field">
              <span>
                Місто
              </span>

              <input
                value={city}
                onChange={(
                  input
                ) =>
                  setCity(
                    input.target.value
                  )
                }
              />
            </label>
          </div>

          <label className="event-field">
            <span>
              Місце
            </span>

            <input
              value={place}
              onChange={(
                input
              ) =>
                setPlace(
                  input.target.value
                )
              }
            />
          </label>

          <div className="event-field-row">
            <label className="event-field">
              <span>
                Дата *
              </span>

              <input
                type="date"
                value={date}
                onChange={(
                  input
                ) =>
                  setDate(
                    input.target.value
                  )
                }
              />
            </label>

            <label className="event-field">
              <span>
                Час
              </span>

              <input
                type="time"
                value={time}
                onChange={(
                  input
                ) =>
                  setTime(
                    input.target.value
                  )
                }
              />
            </label>
          </div>

          <div className="event-backend-note">
            <CalendarDays
              size={20}
            />

            <div>
              <strong>
                Учасники отримають сповіщення
              </strong>

              <span>
                Якщо зміниться назва, дата, час або місце, ЯТУТ автоматично повідомить учасників.
              </span>
            </div>
          </div>
        </div>

        <footer className="event-create-footer">
          <button
            type="button"
            className="event-create-cancel"
            onClick={onClose}
          >
            Скасувати
          </button>

          <button
            type="button"
            className="event-create-submit"
            disabled={
              !title.trim() ||
              !date ||
              saving
            }
            onClick={submit}
          >
            {saving
              ? "Зберігаємо..."
              : "Зберегти зміни"}
          </button>
        </footer>
      </section>
    </div>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function EventDetail({
  event,
  onBack,
  onToggleGoing,
  onToggleInterested,
  onToggleLike,
  onOpenDiscussion,
  onDelete,
  onShare,
  onInviteFriends,
  backendMode = false,
  backendInviteCandidates = [],
}) {
  const going =
    event.attendees?.includes(
      "me"
    );

  const interested =
    event.interested?.includes(
      "me"
    );

  const attendees =
    event.attendees || [];

  const [
    inviteOpen,
    setInviteOpen,
  ] = useState(false);

  const [
    selectedInvites,
    setSelectedInvites,
  ] = useState([]);

  const invitedIds =
    backendMode
      ? backendInviteCandidates
          .filter(
            (
              person
            ) =>
              [
                "pending",
                "accepted",
              ].includes(
                person.inviteStatus
              )
          )
          .map(
            (
              person
            ) =>
              person.id
          )
      : Array.isArray(
          event.invited
        )
      ? event.invited
      : [];

  const inviteCandidates =
    backendMode
      ? backendInviteCandidates
      : Object.values(
          PEOPLE
        ).filter(
          (
            person
          ) =>
            person.id !==
              "me" &&
            !event.attendees
              ?.includes(
                person.id
              )
        );

  function toggleInvite(
    personId
  ) {
    setSelectedInvites(
      (
        current
      ) =>
        current.includes(
          personId
        )
          ? current.filter(
              (
                id
              ) =>
                id !==
                personId
            )
          : [
              ...current,
              personId,
            ]
    );
  }

  function sendInvites() {
    if (
      !selectedInvites.length
    ) {
      return;
    }

    onInviteFriends?.(
      event.id,
      selectedInvites
    );

    setSelectedInvites(
      []
    );

    setInviteOpen(
      false
    );
  }

  return (
    <section className="event-detail-page">
      <button
        type="button"
        className="event-back-button"
        onClick={
          onBack
        }
      >
        <ChevronLeft
          size={15}
        />

        Назад до подій
      </button>

      <div
        className={`event-detail-cover ${
          event.cover
            ? "has-event-photo"
            : ""
        }`}
        style={
          eventCoverStyle(
            event
          )
        }
      >
        <div className="event-cover-content">
          <span className="event-detail-emoji">
            {
              event.emoji
            }
          </span>

          <div className="event-detail-cover-info">
            <small>
              {
                event.categoryLabel
              }
            </small>

            <h1>
              {
                event.title
              }
            </h1>
          </div>
        </div>
      </div>

      <div className="event-detail-layout">
        <main className="event-detail-main">
          <article className="event-detail-card">
            {event.communityName && (
              <div className="event-detail-community">
                <Users
                  size={17}
                />

                <div>
                  <span>
                    ПОДІЯ СПІЛЬНОТИ
                  </span>

                  <strong>
                    {
                      event.communityName
                    }
                  </strong>
                </div>
              </div>
            )}

            <div className="event-detail-date">
              <div>
                <CalendarDays
                  size={20}
                />
              </div>

              <div>
                <strong>
                  {formatDate(
                    event.date
                  )}
                </strong>

                <span>
                  {event.time ||
                    "Час не вказано"}
                </span>
              </div>
            </div>

            <div className="event-detail-date">
              <div>
                <MapPin
                  size={20}
                />
              </div>

              <div>
                <strong>
                  {event.place ||
                    "Місце уточнюється"}
                </strong>

                <span>
                  {event.city ||
                    "Київ"}
                </span>
              </div>
            </div>

            {event.description && (
              <p className="event-description">
                {
                  event.description
                }
              </p>
            )}
          </article>

          <article className="event-detail-card">
            <div className="event-section-title">
              <div>
                <span>
                  УЧАСНИКИ
                </span>

                <h2>
                  Хто йде
                </h2>
              </div>

              <strong>
                {
                  event.backend
                    ? event.goingCount || 0
                    : attendees.length
                }
              </strong>
            </div>

            <div className="event-attendees">
                  {attendees.map(
                    (id) => {
                      const person =
                        PEOPLE[id] || {
                          name:
                            "Користувач",
                          initials:
                            "?",
                        };

                      return (
                        <div
                          key={
                            id
                          }
                          className="event-attendee"
                        >
                          <span>
                            {person.avatar ? (
                              <img
                                src={
                                  person.avatar
                                }
                                alt=""
                              />
                            ) : (
                              person.initials
                            )}
                          </span>

                          <strong>
                            {id ===
                            "me"
                              ? "Ви"
                              : person.name}
                          </strong>
                        </div>
                      );
                    }
                  )}
                </div>

                <button
                  type="button"
                  className="event-invite-button"
                  onClick={() =>
                    setInviteOpen(
                      (
                        value
                      ) =>
                        !value
                    )
                  }
                >
                  <Users
                    size={15}
                  />

                  {inviteOpen
                    ? "Закрити"
                    : invitedIds.length
                    ? "Запрошено " + invitedIds.length
                    : "Запросити друзів"}
                </button>

            {inviteOpen && (
              <div className="event-invite-panel">
                <div className="event-invite-panel__head">
                  <div>
                    <span>
                      ЗАПРОШЕННЯ
                    </span>

                    <strong>
                      Оберіть друзів
                    </strong>
                  </div>

                  <small>
                    {
                      selectedInvites.length
                    }{" "}
                    вибрано
                  </small>
                </div>

                <div className="event-invite-people">
                  {inviteCandidates.map(
                    (
                      person
                    ) => {
                      const selected =
                        selectedInvites.includes(
                          person.id
                        );

                      const alreadyInvited =
                        invitedIds.includes(
                          person.id
                        );

                      return (
                        <button
                          key={
                            person.id
                          }
                          type="button"
                          className={
                            selected
                              ? "active"
                              : ""
                          }
                          disabled={
                            alreadyInvited
                          }
                          onClick={() =>
                            toggleInvite(
                              person.id
                            )
                          }
                        >
                          <span>
                            {
                              person.initials
                            }
                          </span>

                          <div>
                            <strong>
                              {
                                person.name
                              }
                            </strong>

                            <small>
                              {alreadyInvited
                                ? "Вже запрошено"
                                : selected
                                ? "Обрано"
                                : "Запросити"}
                            </small>
                          </div>

                          <b>
                            {alreadyInvited
                              ? "✓"
                              : selected
                              ? "✓"
                              : "+"}
                          </b>
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  type="button"
                  className="event-invite-send"
                  disabled={
                    !selectedInvites.length
                  }
                  onClick={
                    sendInvites
                  }
                >
                  Надіслати запрошення
                </button>
              </div>
            )}
          </article>
        </main>

        <aside className="event-detail-side">
          <article className="event-detail-card">
            <div className="event-action-stats">
              <div>
                <strong>
                  {
                    event.backend
                      ? event.goingCount || 0
                      : event.attendees
                          ?.length || 0
                  }
                </strong>

                <span>
                  підуть
                </span>
              </div>

              <div>
                <strong>
                  {
                    event.backend
                      ? event.interestedCount || 0
                      : event.interested
                          ?.length || 0
                  }
                </strong>

                <span>
                  цікавляться
                </span>
              </div>
            </div>

            <button
              type="button"
              className={`event-status-main ${
                going
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onToggleGoing(
                  event.id
                )
              }
            >
              <Check
                size={16}
              />

              {going
                ? "Ви йдете"
                : "Я піду"}
            </button>

            <button
              type="button"
              className={`event-status-secondary ${
                interested
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onToggleInterested(
                  event.id
                )
              }
            >
              <Sparkles
                size={15}
              />

              {interested
                ? "Цікавить"
                : "Можливо"}
            </button>

            <button
              type="button"
              className="event-discussion-button"
              onClick={() =>
                onOpenDiscussion(
                  event
                )
              }
            >
              <MessageCircle
                size={15}
              />

              Обговорення
            </button>

            <button
              type="button"
              className={`event-status-secondary ${
                event.liked
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onToggleLike(
                  event.id
                )
              }
            >
              <Heart
                size={15}
                fill={
                  event.liked
                    ? "currentColor"
                    : "none"
                }
              />

              Подобається ·{" "}
              {
                event.likes
              }
            </button>

            <button
              type="button"
              className="event-status-secondary"
              onClick={() =>
                onShare(
                  event
                )
              }
            >
              <Share2
                size={15}
              />

              Поширити
            </button>
          </article>

          <article className="event-detail-card">
            <span className="event-side-label">
              ОРГАНІЗАТОР
            </span>

            <div className="event-organizer">
              <div>
                {PEOPLE[
                  event.organizerId
                ]?.initials ||
                  event.organizerName?.[0] ||
                  "Я"}
              </div>

              <div>
                <strong>
                  {
                    event.organizerName
                  }
                </strong>

                <span>
                  Організатор події
                </span>
              </div>
            </div>
          </article>

          {event.organizerId ===
            "me" && (
            <button
              type="button"
              className="event-delete-button"
              onClick={() =>
                onDelete(
                  event.id
                )
              }
            >
              Видалити подію
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

function Events({
  onNavigate,
  createRequestKey = 0,
  authSession = null,
}) {
  const [
    events,
    setEvents,
  ] = useState(
    () =>
      authSession?.user?.id
        ? []
        : loadEvents()
  );

  const [
    activeEventId,
    setActiveEventId,
  ] = useState(null);

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    communityContext,
    setCommunityContext,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    backendInviteCandidates,
    setBackendInviteCandidates,
  ] = useState([]);

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "for-you"
  );

  /* =======================================================
     COMMUNITY → EVENTS BRIDGE
  ======================================================= */

  useEffect(() => {
    const context =
      consumeCommunityEventContext();

    if (!context) {
      return;
    }

    setCommunityContext(
      context
    );

    setCreateOpen(
      true
    );
  }, []);

  /* =======================================================
     NOTIFICATION → EVENT
  ======================================================= */

  useEffect(() => {
    function openFromPayload(
      payload
    ) {
      const requestedId =
        payload?.eventId ||
        payload?.event?.id;

      if (!requestedId) {
        return;
      }

      const resolvedId =
        requestedId ===
        "evening-kyiv"
          ? "event-tech-meetup"
          : requestedId;

      setActiveEventId(
        resolvedId
      );

      try {
        sessionStorage.removeItem(
          "yatut-open-route-payload"
        );
      } catch {
        // No-op.
      }
    }

    try {
      const raw =
        sessionStorage.getItem(
          "yatut-open-route-payload"
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        if (
          parsed?.route ===
          "events"
        ) {
          openFromPayload(
            parsed.payload ||
            {}
          );
        }
      }
    } catch (error) {
      console.warn(
        "EVENT ROUTE PAYLOAD ERROR:",
        error
      );
    }

    function handleRoute(
      event
    ) {
      if (
        event?.detail?.route !==
        "events"
      ) {
        return;
      }

      openFromPayload(
        event.detail.payload ||
        {}
      );
    }

    window.addEventListener(
      "yatut:route-payload",
      handleRoute
    );

    return () => {
      window.removeEventListener(
        "yatut:route-payload",
        handleRoute
      );
    };
  }, []);

  /* =======================================================
     EVENT STORAGE SUBSCRIPTION
  ======================================================= */

  useEffect(() => {
    if (
      authSession?.user?.id
    ) {
      return undefined;
    }

    return subscribeEvents(
      setEvents
    );
  }, [
    authSession?.user?.id,
  ]);

  useEffect(() => {
    if (
      !authSession?.user?.id
    ) {
      return undefined;
    }

    let active =
      true;

    let refreshTimer =
      null;

    async function refresh() {
      try {
        const next =
          await loadBackendEvents(
            authSession
          );

        if (active) {
          setEvents(
            next
          );
        }
      } catch (
        error
      ) {
        console.warn(
          "EVENTS BACKEND LOAD ERROR:",
          error
        );
      }
    }

    refresh();

    const channel =
      subscribeEventsRealtime({
        session:
          authSession,
        onChange:
          () => {
            if (
              refreshTimer
            ) {
              window.clearTimeout(
                refreshTimer
              );
            }

            refreshTimer =
              window.setTimeout(
                refresh,
                100
              );
          },
        onStatus:
          (
            status
          ) => {
            if (
              status ===
              "error"
            ) {
              console.warn(
                "EVENTS REALTIME DEGRADED"
              );
            }
          },
      });

    return () => {
      active =
        false;

      if (
        refreshTimer
      ) {
        window.clearTimeout(
          refreshTimer
        );
      }

      channel.close();
    };
  }, [
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  /* =======================================================
     HUB → EVENT CREATOR
  ======================================================= */

  useEffect(() => {
    if (
      !createRequestKey
    ) {
      return;
    }

    setCommunityContext(
      null
    );

    setActiveEventId(
      null
    );

    setCreateOpen(
      true
    );
  }, [
    createRequestKey,
  ]);

  const activeEvent =
    events.find(
      (event) =>
        event.id ===
        activeEventId
    ) ||
    null;

  useEffect(() => {
    if (
      !authSession?.user?.id ||
      !activeEventId
    ) {
      setBackendInviteCandidates(
        []
      );

      return;
    }

    refreshInviteCandidates(
      activeEventId
    ).catch(
      (
        error
      ) => {
        console.warn(
          "EVENT INVITE CANDIDATES ERROR:",
          error
        );
      }
    );
  }, [
    activeEventId,
    authSession?.user?.id,
    authSession?.access_token,
  ]);

  const filteredEvents =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        [...events];

      if (query) {
        result =
          result.filter(
            (event) =>
              eventSearchText(
                event
              ).includes(
                query
              )
          );
      }

      if (
        activeTab ===
        "popular"
      ) {
        result.sort(
          (a, b) =>
            (b.likes || 0) -
            (a.likes || 0)
        );
      }

      if (
        activeTab ===
        "friends"
      ) {
        result =
          result.filter(
            (event) =>
              (
                event.attendees ||
                []
              ).some(
                (id) =>
                  id !== "me"
              )
          );
      }

      if (
        activeTab ===
        "nearby"
      ) {
        result =
          result.filter(
            (event) =>
              !event.city ||
              event.city ===
                "Київ"
          );
      }

      return result;
    }, [
      events,
      search,
      activeTab,
    ]);

  async function refreshBackendEvents() {
    if (
      !authSession?.user?.id
    ) {
      return [];
    }

    const next =
      await loadBackendEvents(
        authSession
      );

    setEvents(
      next
    );

    return next;
  }

  function updateEvents(
    updater
  ) {
    setEvents(
      (previous) => {
        const next =
          typeof updater ===
          "function"
            ? updater(
                previous
              )
            : updater;

        saveEvents(
          next
        );

        return next;
      }
    );
  }

  async function toggleLike(
    eventId
  ) {
    if (
      authSession?.user?.id
    ) {
      try {
        await toggleBackendEventLike(
          authSession,
          eventId
        );

        await refreshBackendEvents();
      } catch (
        error
      ) {
        console.warn(
          "EVENT LIKE ERROR:",
          error
        );
      }

      return;
    }

    updateEvents(
      (previous) =>
        previous.map(
          (event) => {
            if (
              event.id !==
              eventId
            ) {
              return event;
            }

            const liked =
              !event.liked;

            return {
              ...event,

              liked,

              likes:
                Math.max(
                  0,
                  Number(
                    event.likes ||
                      0
                  ) +
                    (liked
                      ? 1
                      : -1)
                ),
            };
          }
        )
    );
  }

  async function toggleGoing(
    eventId
  ) {
    if (
      authSession?.user?.id
    ) {
      const target =
        events.find(
          (event) =>
            event.id ===
            eventId
        );

      const current =
        target?.attendees
          ?.includes(
            "me"
          );

      try {
        await setBackendEventParticipation(
          authSession,
          eventId,
          current
            ? null
            : "going"
        );

        await refreshBackendEvents();
      } catch (
        error
      ) {
        console.warn(
          "EVENT GOING ERROR:",
          error
        );
      }

      return;
    }

    updateEvents(
      (previous) =>
        previous.map(
          (event) => {
            if (
              event.id !==
              eventId
            ) {
              return event;
            }

            const attendees =
              Array.isArray(
                event.attendees
              )
                ? event.attendees
                : [];

            const exists =
              attendees.includes(
                "me"
              );

            return {
              ...event,

              attendees:
                exists
                  ? attendees.filter(
                      (id) =>
                        id !==
                        "me"
                    )
                  : [
                      ...attendees,
                      "me",
                    ],
            };
          }
        )
    );
  }

  async function toggleInterested(
    eventId
  ) {
    if (
      authSession?.user?.id
    ) {
      const target =
        events.find(
          (event) =>
            event.id ===
            eventId
        );

      const current =
        target?.interested
          ?.includes(
            "me"
          );

      try {
        await setBackendEventParticipation(
          authSession,
          eventId,
          current
            ? null
            : "interested"
        );

        await refreshBackendEvents();
      } catch (
        error
      ) {
        console.warn(
          "EVENT INTEREST ERROR:",
          error
        );
      }

      return;
    }

    updateEvents(
      (previous) =>
        previous.map(
          (event) => {
            if (
              event.id !==
              eventId
            ) {
              return event;
            }

            const interested =
              Array.isArray(
                event.interested
              )
                ? event.interested
                : [];

            const exists =
              interested.includes(
                "me"
              );

            return {
              ...event,

              interested:
                exists
                  ? interested.filter(
                      (id) =>
                        id !==
                        "me"
                    )
                  : [
                      ...interested,
                      "me",
                    ],
            };
          }
        )
    );
  }

  async function refreshInviteCandidates(
    eventId
  ) {
    if (
      !authSession?.user?.id ||
      !eventId
    ) {
      setBackendInviteCandidates(
        []
      );

      return [];
    }

    const next =
      await loadEventInviteCandidates(
        authSession,
        eventId
      );

    setBackendInviteCandidates(
      next
    );

    return next;
  }

  async function createNewEvent(
    newEvent,
    options = {}
  ) {
    if (
      authSession?.user?.id
    ) {
      try {
        const created =
          await createBackendEvent(
            authSession,
            newEvent,
            options
          );

        const next =
          await refreshBackendEvents();

        setCreateOpen(
          false
        );

        setCommunityContext(
          null
        );

        setActiveEventId(
          created?.id ||
          next[0]?.id ||
          null
        );
      } catch (
        error
      ) {
        console.warn(
          "EVENT CREATE ERROR:",
          error
        );

        window.alert(
          error?.message ||
          "Не вдалося створити подію."
        );
      }

      return;
    }

    updateEvents(
      (previous) => [
        newEvent,
        ...previous,
      ]
    );

    await ensureEventChat(
      newEvent
    );

    setCreateOpen(
      false
    );

    setCommunityContext(
      null
    );

    setActiveEventId(
      newEvent.id
    );
  }

  async function openDiscussion(
    event
  ) {
    if (
      authSession?.user?.id
    ) {
      try {
        const chat =
          await openBackendEventChat(
            authSession,
            event.id
          );

        if (!chat?.id) {
          return;
        }

        sessionStorage.setItem(
          "yatut-open-chat-id",
          chat.id
        );

        onNavigate?.(
          "chats"
        );
      } catch (
        error
      ) {
        console.warn(
          "EVENT DISCUSSION ERROR:",
          error
        );

        window.alert(
          error?.message ||
          "Не вдалося відкрити обговорення."
        );
      }

      return;
    }

    const latestEvent =
      events.find(
        (item) =>
          item.id ===
          event.id
      ) ||
      event;

    const chat =
      await ensureEventChat(
        latestEvent
      );

    if (!chat?.id) {
      return;
    }

    sessionStorage.setItem(
      "yatut-open-chat-id",
      chat.id
    );

    onNavigate?.(
      "chats"
    );
  }

  async function deleteEvent(
    eventId
  ) {
    const target =
      events.find(
        (event) =>
          event.id ===
          eventId
      );

    if (!target) {
      return;
    }

    const confirmed =
      window.confirm(
        `Видалити подію «${target.title}»?`
      );

    if (!confirmed) {
      return;
    }

    if (
      authSession?.user?.id
    ) {
      try {
        await deleteBackendEvent(
          authSession,
          eventId
        );

        await refreshBackendEvents();

        setActiveEventId(
          null
        );
      } catch (
        error
      ) {
        console.warn(
          "EVENT DELETE ERROR:",
          error
        );

        window.alert(
          error?.message ||
          "Не вдалося видалити подію."
        );
      }

      return;
    }

    updateEvents(
      (previous) =>
        previous.filter(
          (event) =>
            event.id !==
            eventId
        )
    );

    setActiveEventId(
      null
    );
  }

  async function inviteFriends(
    eventId,
    personIds
  ) {
    if (
      authSession?.user?.id
    ) {
      try {
        await inviteBackendEventFriends(
          authSession,
          eventId,
          personIds
        );

        await refreshInviteCandidates(
          eventId
        );
      } catch (
        error
      ) {
        console.warn(
          "EVENT INVITE ERROR:",
          error
        );

        window.alert(
          error?.message ||
          "Не вдалося надіслати запрошення."
        );
      }

      return;
    }

    updateEvents(
      (
        previous
      ) =>
        previous.map(
          (
            event
          ) => {
            if (
              event.id !==
              eventId
            ) {
              return event;
            }

            return {
              ...event,

              invited: [
                ...new Set([
                  ...(
                    event.invited ||
                    []
                  ),

                  ...personIds,
                ]),
              ],
            };
          }
        )
    );
  }

  async function shareEvent(
    event
  ) {
    await shareYatutItem({
      title:
        event.title ||
        "Подія у ЯТУТ",

      text:
        event.description ||
        "Подія у ЯТУТ",

      path:
        `/events/${encodeURIComponent(event.id)}`,
    });
  }

  function openNormalCreator() {
    setCommunityContext(
      null
    );

    setCreateOpen(
      true
    );
  }

  function closeCreator() {
    setCreateOpen(
      false
    );

    setCommunityContext(
      null
    );
  }

  if (
    activeEvent
  ) {
    return (
      <EventDetail
        event={
          activeEvent
        }
        onBack={() =>
          setActiveEventId(
            null
          )
        }
        onToggleGoing={
          toggleGoing
        }
        onToggleInterested={
          toggleInterested
        }
        onToggleLike={
          toggleLike
        }
        onOpenDiscussion={
          openDiscussion
        }
        onDelete={
          deleteEvent
        }
        onShare={
          shareEvent
        }
        onInviteFriends={
          inviteFriends
        }
        backendMode={
          Boolean(
            authSession?.user?.id
          )
        }
        backendInviteCandidates={
          backendInviteCandidates
        }
      />
    );
  }

  return (
    <>
      <section className="events-page">
        <section className="events-hero">
          <div>
            <span className="events-eyebrow">
              ЯТУТ ПОДІЇ
            </span>

            <h1>
              Зустрічайтесь у реальному житті
            </h1>

            <p>
              Знаходьте людей, події та нові місця поруч із вами. Створюйте власні зустрічі та збирайте своїх.
            </p>

            <button
              type="button"
              onClick={
                openNormalCreator
              }
            >
              + Створити подію
            </button>
          </div>

          <div className="events-hero-art">
            <span>
              Я
            </span>

            <i>
              📍
            </i>

            <b>
              🎉
            </b>
          </div>
        </section>

        <section className="events-controls">
          <label className="events-search">
            <Search
              size={18}
            />

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Знайти подію"
            />
          </label>

          <nav className="events-tabs">
            {(authSession?.user?.id
              ? FILTER_TABS.filter(
                  (
                    tab
                  ) =>
                    tab.id !==
                    "friends"
                )
              : FILTER_TABS
            ).map(
              (tab) => (
                <button
                  key={
                    tab.id
                  }
                  type="button"
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
                  {
                    tab.label
                  }
                </button>
              )
            )}
          </nav>
        </section>

        <div className="events-layout">
          <main className="events-list">
            <div className="events-section-title">
              <div>
                <span>
                  ДЛЯ ВАС
                </span>

                <h2>
                  Події, які можуть сподобатись
                </h2>
              </div>

              <strong>
                {
                  filteredEvents.length
                }
              </strong>
            </div>

            {filteredEvents.length >
            0 ? (
              filteredEvents.map(
                (event) => (
                  <EventCard
                    key={
                      event.id
                    }
                    event={
                      event
                    }
                    onOpen={
                      setActiveEventId
                    }
                    onToggleLike={
                      toggleLike
                    }
                    onToggleGoing={
                      toggleGoing
                    }
                    onShare={
                      shareEvent
                    }
                  />
                )
              )
            ) : (
              <div className="events-empty">
                <span>
                  🎉
                </span>

                <h3>
                  Подій не знайдено
                </h3>

                <p>
                  Спробуйте інший пошук або створіть власну подію.
                </p>
              </div>
            )}
          </main>

          <aside className="events-side">
            <article className="events-side-card">
              <span>
                ВАШЕ МІСТО
              </span>

              <h3>
                Київ
              </h3>

              <p>
                Події та активності, які відбуваються у вашому місті.
              </p>

              <div className="events-city-stat">
                <div>
                  <strong>
                    {
                      events.length
                    }
                  </strong>

                  <span>
                    подій
                  </span>
                </div>

                <div>
                  <strong>
                    {events.reduce(
                      (
                        sum,
                        event
                      ) =>
                        sum +
                        (
                          event.backend
                            ? event.goingCount ||
                              0
                            : event.attendees
                                ?.length ||
                              0
                        ),
                      0
                    )}
                  </strong>

                  <span>
                    учасників
                  </span>
                </div>
              </div>
            </article>

            <article className="events-side-card">
              <span>
                КАТЕГОРІЇ
              </span>

              <div className="events-category-list">
                {CATEGORIES.slice(
                  0,
                  6
                ).map(
                  (
                    category
                  ) => (
                    <button
                      key={
                        category.id
                      }
                      type="button"
                      onClick={() =>
                        setSearch(
                          category.label
                        )
                      }
                    >
                      <span>
                        {
                          category.emoji
                        }
                      </span>

                      <strong>
                        {
                          category.label
                        }
                      </strong>

                      <b>
                        ›
                      </b>
                    </button>
                  )
                )}
              </div>
            </article>

            <article className="events-create-side-card">
              <span>
                ✨
              </span>

              <strong>
                Збери своїх
              </strong>

              <p>
                {authSession?.user?.id
                  ? "Створи подію, збери учасників і продовжуйте спілкування у серверному чаті ЯТУТ."
                  : "Створи подію, запроси друзів і продовжуйте спілкування у чаті ЯТУТ."}
              </p>

              <button
                type="button"
                onClick={
                  openNormalCreator
                }
              >
                Створити подію
              </button>
            </article>
          </aside>
        </div>
      </section>

      {createOpen && (
        <CreateEventModal
          communityContext={
            communityContext
          }
          onClose={
            closeCreator
          }
          onCreate={
            createNewEvent
          }
          backendMode={
            Boolean(
              authSession?.user?.id
            )
          }
        />
      )}
    </>
  );
}

export default Events;