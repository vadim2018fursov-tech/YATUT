import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Plus,
  Users,
} from "lucide-react";

import {
  getCommunityEvents,
  subscribeEvents,
} from "../../storage/eventService";

import {
  openCommunityEventCreator,
} from "../../storage/communityEventBridge";

import "../../styles/community-events.css";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  date
) {
  if (!date) {
    return "Дата уточнюється";
  }

  try {
    return new Date(
      `${date}T12:00:00`
    ).toLocaleDateString(
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

function getEventGradient(
  category
) {
  const gradients = {
    sport:
      "linear-gradient(145deg,#635bff,#8b5cf6)",

    technology:
      "linear-gradient(145deg,#232533,#59617a)",

    creative:
      "linear-gradient(145deg,#ff4f8b,#7c3aed)",

    music:
      "linear-gradient(145deg,#ff4f8b,#ff8a64)",

    business:
      "linear-gradient(145deg,#343746,#6366f1)",

    education:
      "linear-gradient(145deg,#0ea5e9,#6366f1)",

    food:
      "linear-gradient(145deg,#f59e0b,#ef4444)",

    other:
      "linear-gradient(145deg,#8b5cf6,#ff4f8b)",
  };

  return (
    gradients[
      category
    ] ||
    gradients.other
  );
}

/* =========================================================
   CARD
========================================================= */

function CommunityEventCard({
  event,
  onOpen,
  onOpenDiscussion,
}) {
  const attendees =
    Array.isArray(
      event.attendees
    )
      ? event.attendees
      : [];

  return (
    <article className="community-event-card">
      <button
        type="button"
        className="community-event-cover"
        style={
          event.cover
            ? {
                backgroundImage:
                  `linear-gradient(
                    180deg,
                    rgba(10,12,18,.04),
                    rgba(10,12,18,.72)
                  ),
                  url("${event.cover}")`,
              }
            : {
                background:
                  getEventGradient(
                    event.category
                  ),
              }
        }
        onClick={() =>
          onOpen?.(
            event
          )
        }
      >
        <div className="community-event-cover-top">
          <span>
            {event.emoji ||
              "🎉"}
          </span>

          <b>
            {event.categoryLabel ||
              "Подія"}
          </b>
        </div>

        <div className="community-event-cover-bottom">
          <strong>
            {formatDate(
              event.date
            )}
          </strong>

          {event.time && (
            <small>
              {
                event.time
              }
            </small>
          )}
        </div>
      </button>

      <div className="community-event-content">
        <button
          type="button"
          className="community-event-title"
          onClick={() =>
            onOpen?.(
              event
            )
          }
        >
          {
            event.title
          }
        </button>

        <div className="community-event-meta">
          <span>
            <CalendarDays
              size={12}
            />

            {formatDate(
              event.date
            )}
          </span>

          {event.time && (
            <span>
              <Clock3
                size={12}
              />

              {
                event.time
              }
            </span>
          )}

          <span>
            <MapPin
              size={12}
            />

            {event.place ||
              event.city ||
              "Київ"}
          </span>
        </div>

        {event.description && (
          <p>
            {
              event.description
            }
          </p>
        )}

        <footer>
          <div className="community-event-members">
            <div>
              {attendees
                .slice(
                  0,
                  3
                )
                .map(
                  (
                    member,
                    index
                  ) => (
                    <span
                      key={`${member}-${index}`}
                    >
                      {member ===
                      "me"
                        ? "В"
                        : String(
                            member
                          )
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                    </span>
                  )
                )}
            </div>

            <small>
              {
                attendees.length
              }{" "}
              учасників
            </small>
          </div>

          <button
            type="button"
            className="community-event-discussion"
            onClick={() =>
              onOpenDiscussion?.(
                event
              )
            }
          >
            <MessageCircle
              size={14}
            />

            Обговорення
          </button>
        </footer>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function CommunityEventsEmpty({
  community,
  onNavigate,
}) {
  return (
    <div className="community-events-empty">
      <div className="community-events-empty-icon">
        🎉
      </div>

      <span>
        ПОДІЇ СПІЛЬНОТИ
      </span>

      <h3>
        Тут ще немає подій
      </h3>

      <p>
        Створіть першу зустріч для учасників спільноти. Вона автоматично з’явиться і в загальному розділі «Події».
      </p>

      <button
        type="button"
        onClick={() =>
          openCommunityEventCreator({
            community,
            onNavigate,
          })
        }
      >
        <Plus
          size={15}
        />

        Створити першу подію
      </button>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

function CommunityEventsSection({
  community,
  onNavigate,
  onOpenEvent,
  onOpenDiscussion,
}) {
  const [
    version,
    setVersion,
  ] = useState(0);

  useEffect(() => {
    return subscribeEvents(
      () => {
        setVersion(
          (value) =>
            value + 1
        );
      }
    );
  }, []);

  const events =
    useMemo(
      () =>
        getCommunityEvents(
          community?.id
        ),
      [
        community?.id,
        version,
      ]
    );

  function createEvent() {
    openCommunityEventCreator({
      community,
      onNavigate,
    });
  }

  function openAllEvents() {
    onNavigate?.(
      "events"
    );
  }

  function openEvent(
    event
  ) {
    /*
      Записываем конкретную
      подію, чтобы Events мог
      открыть её после перехода.
    */

    sessionStorage.setItem(
      "yatut-open-event-id",
      event.id
    );

    if (
      onOpenEvent
    ) {
      onOpenEvent(
        event
      );

      return;
    }

    onNavigate?.(
      "events",
      {
        eventId:
          event.id,
      }
    );
  }

  function openDiscussion(
    event
  ) {
    if (
      onOpenDiscussion
    ) {
      onOpenDiscussion(
        event
      );

      return;
    }

    sessionStorage.setItem(
      "yatut-open-event-id",
      event.id
    );

    sessionStorage.setItem(
      "yatut-open-event-discussion",
      "1"
    );

    onNavigate?.(
      "events",
      {
        eventId:
          event.id,

        discussion:
          true,
      }
    );
  }

  if (
    !community?.id
  ) {
    return null;
  }

  return (
    <section className="community-events-section">
      <header className="community-events-heading">
        <div>
          <span>
            ПОДІЇ
          </span>

          <h2>
            Події спільноти
          </h2>

          <p>
            Зустрічі, активності та події для учасників.
          </p>
        </div>

        <div className="community-events-heading-actions">
          <button
            type="button"
            className="community-events-all"
            onClick={
              openAllEvents
            }
          >
            Усі події

            <ChevronRight
              size={14}
            />
          </button>

          <button
            type="button"
            className="community-events-create"
            onClick={
              createEvent
            }
          >
            <Plus
              size={15}
            />

            Створити подію
          </button>
        </div>
      </header>

      {events.length ===
      0 ? (
        <CommunityEventsEmpty
          community={
            community
          }
          onNavigate={
            onNavigate
          }
        />
      ) : (
        <>
          <div className="community-events-grid">
            {events.map(
              (
                event
              ) => (
                <CommunityEventCard
                  key={
                    event.id
                  }
                  event={
                    event
                  }
                  onOpen={
                    openEvent
                  }
                  onOpenDiscussion={
                    openDiscussion
                  }
                />
              )
            )}
          </div>

          <div className="community-events-summary">
            <div>
              <CalendarDays
                size={16}
              />

              <span>
                <strong>
                  {
                    events.length
                  }
                </strong>

                подій
              </span>
            </div>

            <div>
              <Users
                size={16}
              />

              <span>
                <strong>
                  {events.reduce(
                    (
                      total,
                      event
                    ) =>
                      total +
                      (
                        event.attendees
                          ?.length ||
                        0
                      ),
                    0
                  )}
                </strong>

                участей
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default CommunityEventsSection;