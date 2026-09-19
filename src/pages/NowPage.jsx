import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  Flame,
  MapPin,
  MessageCircle,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

const FRIEND_ACTIVITY = [
  {
    id: "maria",
    name: "Марія",
    action: "зараз у центрі Києва",
    detail: "Хрещатик · 1,2 км",
    ago: "2 хв",
    tone: "violet",
  },
  {
    id: "oleksandr",
    name: "Олександр",
    action: "дивиться LIVE",
    detail: "Поділ просто неба",
    ago: "4 хв",
    tone: "blue",
  },
  {
    id: "sofia",
    name: "Софія",
    action: "додала PULSE момент",
    detail: "Контрактова площа",
    ago: "7 хв",
    tone: "pink",
  },
  {
    id: "anna",
    name: "Анна",
    action: "приєдналась до події",
    detail: "Вечірній Київ",
    ago: "11 хв",
    tone: "orange",
  },
];

const LIVE_ITEMS = [
  {
    id: "live-khreshchatyk",
    title: "Хрещатик зараз",
    place: "Центр · Київ",
    viewers: "1,2K",
    people: "428 поруч",
  },
  {
    id: "live-podil",
    title: "Поділ ввечері",
    place: "Контрактова площа",
    viewers: "846",
    people: "214 поруч",
  },
];

const QUICK_EVENTS = [
  {
    time: "19:30",
    title: "Вечірній Київ",
    place: "Хрещатик",
    people: "1,2K",
  },
  {
    time: "20:00",
    title: "Поділ просто неба",
    place: "Контрактова площа",
    people: "428",
  },
  {
    time: "21:00",
    title: "Нічний PULSE",
    place: "Центр",
    people: "684",
  },
];

const WINDOWS = [
  {
    id: "15m",
    label: "15 хв",
  },
  {
    id: "1h",
    label: "1 год",
  },
  {
    id: "today",
    label: "Сьогодні",
  },
];

function NowSection({
  icon: Icon,
  title,
  subtitle,
  action,
  onAction,
  children,
  className = "",
}) {
  return (
    <section
      className={`now-v2-card ${className}`}
    >
      <header className="now-v2-card__header">
        <div className="now-v2-card__heading">
          <span className="now-v2-card__icon">
            <Icon size={18} />
          </span>

          <div>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </div>
        </div>

        {action && (
          <button
            type="button"
            className="now-v2-card__action"
            onClick={onAction}
          >
            {action}
            <ArrowRight size={15} />
          </button>
        )}
      </header>

      {children}
    </section>
  );
}

export default function NowPage({
  onNavigate,
  onOpenChat,
}) {
  const [
    activeWindow,
    setActiveWindow,
  ] = useState("15m");

  const activityLabel =
    useMemo(
      () => {
        if (activeWindow === "1h") {
          return "За останню годину";
        }

        if (activeWindow === "today") {
          return "Сьогодні";
        }

        return "За останні 15 хвилин";
      },
      [activeWindow]
    );

  return (
    <div className="now-page now-v2-page">
      <section className="now-v2-hero">
        <div className="now-v2-hero__glow now-v2-hero__glow--one" />
        <div className="now-v2-hero__glow now-v2-hero__glow--two" />

        <div className="now-v2-hero__copy">
          <span className="now-v2-hero__badge">
            <Zap size={15} />
            ЯТУТ ЗАРАЗ
          </span>

          <h1>
            Твій світ
            <br />
            прямо зараз
          </h1>

          <p>
            Не стрічка минулого. Тут тільки те,
            що відбувається зараз: люди, друзі,
            місця, LIVE, події та активність міста.
          </p>

          <div className="now-v2-window">
            {WINDOWS.map(
              (item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    activeWindow === item.id
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveWindow(item.id)
                  }
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>

        <button
          type="button"
          className="now-v2-live-orbit"
          onClick={() =>
            onNavigate?.("pulse")
          }
        >
          <span className="now-v2-live-orbit__ring now-v2-live-orbit__ring--outer" />
          <span className="now-v2-live-orbit__ring now-v2-live-orbit__ring--middle" />
          <span className="now-v2-live-orbit__core">
            <i />
          </span>

          <strong>12,4K</strong>
          <small>людей активні</small>

          <div>
            <Activity size={13} />
            PULSE Києва
          </div>
        </button>
      </section>

      <section className="now-v2-summary">
        <button
          type="button"
          onClick={() =>
            onNavigate?.("friends")
          }
        >
          <span>
            <Users size={19} />
          </span>
          <div>
            <strong>32</strong>
            <small>друзів онлайн</small>
          </div>
          <b>+5</b>
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate?.("pulse")
          }
        >
          <span>
            <Flame size={19} />
          </span>
          <div>
            <strong>18</strong>
            <small>тем ростуть</small>
          </div>
          <b>+8</b>
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate?.("live")
          }
        >
          <span>
            <Radio size={19} />
          </span>
          <div>
            <strong>6</strong>
            <small>LIVE зараз</small>
          </div>
          <b>LIVE</b>
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate?.("events")
          }
        >
          <span>
            <CalendarDays size={19} />
          </span>
          <div>
            <strong>24</strong>
            <small>події сьогодні</small>
          </div>
          <b>3 скоро</b>
        </button>
      </section>

      <section className="now-v2-changed">
        <header>
          <div>
            <span>
              <Clock3 size={18} />
            </span>

            <div>
              <strong>
                Що змінилось
              </strong>
              <small>
                {activityLabel}
              </small>
            </div>
          </div>

          <span className="now-v2-changed__status">
            <i />
            оновлено щойно
          </span>
        </header>

        <div className="now-v2-changed__grid">
          <button
            type="button"
            onClick={() =>
              onNavigate?.(
                "cityPulse",
                {
                  cityId: "kyiv",
                }
              )
            }
          >
            <span className="is-purple">
              <TrendingUp size={20} />
            </span>

            <div>
              <small>КИЇВ</small>
              <strong>
                Центр став активнішим
              </strong>
              <p>
                +2,4K взаємодій за обраний період
              </p>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.("nearby")
            }
          >
            <span className="is-blue">
              <MapPin size={20} />
            </span>

            <div>
              <small>ПОРУЧ</small>
              <strong>
                12 друзів у твоєму районі
              </strong>
              <p>
                3 з них активні просто зараз
              </p>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              onNavigate?.("clips")
            }
          >
            <span className="is-pink">
              <Video size={20} />
            </span>

            <div>
              <small>CLIPS</small>
              <strong>
                Вечірній Поділ набирає хвилю
              </strong>
              <p>
                +840 переглядів за кілька хвилин
              </p>
            </div>

            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <div className="now-v2-layout">
        <main className="now-v2-main">
          <NowSection
            icon={Users}
            title="Друзі зараз"
            subtitle="Що роблять твої люди"
            action="Усі друзі"
            onAction={() =>
              onNavigate?.("friends")
            }
          >
            <div className="now-v2-friends">
              {FRIEND_ACTIVITY.map(
                (friend) => (
                  <article
                    key={friend.id}
                  >
                    <button
                      type="button"
                      className={`now-v2-avatar now-v2-avatar--${friend.tone}`}
                      onClick={() =>
                        onOpenChat?.(
                          friend.id
                        )
                      }
                    >
                      {friend.name[0]}
                      <i />
                    </button>

                    <div className="now-v2-friend-copy">
                      <div>
                        <strong>
                          {friend.name}
                        </strong>
                        <small>
                          {friend.ago}
                        </small>
                      </div>

                      <p>
                        {friend.action}
                      </p>

                      <span>
                        <MapPin size={11} />
                        {friend.detail}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="now-v2-message"
                      aria-label={`Написати ${friend.name}`}
                      onClick={() =>
                        onOpenChat?.(
                          friend.id
                        )
                      }
                    >
                      <MessageCircle size={16} />
                    </button>
                  </article>
                )
              )}
            </div>
          </NowSection>

          <NowSection
            icon={Radio}
            title="LIVE зараз"
            subtitle="Побач місце до того, як приїдеш"
            action="Усі LIVE"
            onAction={() =>
              onNavigate?.("live")
            }
          >
            <div className="now-v2-live-grid">
              {LIVE_ITEMS.map(
                (item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      onNavigate?.(
                        "live",
                        {
                          videoId: item.id,
                        }
                      )
                    }
                  >
                    <div className="now-v2-live-preview">
                      <span className="now-v2-live-badge">
                        <i />
                        LIVE
                      </span>

                      <span className="now-v2-live-viewers">
                        <Users size={11} />
                        {item.viewers}
                      </span>

                      <div className="now-v2-live-play">
                        <Radio size={27} />
                      </div>
                    </div>

                    <div className="now-v2-live-copy">
                      <strong>
                        {item.title}
                      </strong>
                      <span>
                        <MapPin size={11} />
                        {item.place}
                      </span>
                      <small>
                        {item.people}
                      </small>
                    </div>
                  </button>
                )
              )}
            </div>
          </NowSection>

          <NowSection
            icon={MapPin}
            title="Поруч із тобою"
            subtitle="Твій район просто зараз"
            action="Відкрити Поруч"
            onAction={() =>
              onNavigate?.("nearby")
            }
          >
            <div className="now-v2-nearby">
              <button
                type="button"
                onClick={() =>
                  onNavigate?.("nearby")
                }
              >
                <span>
                  <Users size={18} />
                </span>
                <strong>428 людей</strong>
                <small>активні поруч</small>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.("nearby")
                }
              >
                <span>
                  <Sparkles size={18} />
                </span>
                <strong>12 друзів</strong>
                <small>у цьому районі</small>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.("pulse")
                }
              >
                <span>
                  <Activity size={18} />
                </span>
                <strong>8 моментів</strong>
                <small>за останню годину</small>
              </button>
            </div>
          </NowSection>
        </main>

        <aside className="now-v2-sidebar">
          <NowSection
            icon={CalendarDays}
            title="Починається скоро"
            subtitle="Події сьогодні"
            action="Усі"
            onAction={() =>
              onNavigate?.("events")
            }
            className="now-v2-card--events"
          >
            <div className="now-v2-events">
              {QUICK_EVENTS.map(
                (event) => (
                  <button
                    type="button"
                    key={`${event.time}-${event.title}`}
                    onClick={() =>
                      onNavigate?.("events")
                    }
                  >
                    <span className="now-v2-event-time">
                      {event.time}
                    </span>

                    <div>
                      <strong>
                        {event.title}
                      </strong>

                      <small>
                        <MapPin size={10} />
                        {event.place}
                      </small>
                    </div>

                    <b>
                      {event.people}
                    </b>
                  </button>
                )
              )}
            </div>
          </NowSection>

          <NowSection
            icon={Bell}
            title="Потребує уваги"
            subtitle="Твої нові сигнали"
            action="Сповіщення"
            onAction={() =>
              onNavigate?.(
                "notifications"
              )
            }
          >
            <div className="now-v2-alerts">
              <button
                type="button"
                onClick={() =>
                  onOpenChat?.("maria")
                }
              >
                <span className="is-message">
                  <MessageCircle size={15} />
                </span>
                <div>
                  <strong>
                    Марія написала тобі
                  </strong>
                  <small>
                    2 нові повідомлення
                  </small>
                </div>
                <b>2</b>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "communities"
                  )
                }
              >
                <span className="is-community">
                  <Users size={15} />
                </span>
                <div>
                  <strong>
                    ЯТУТ Київ активний
                  </strong>
                  <small>
                    +14 нових повідомлень
                  </small>
                </div>
                <b>14</b>
              </button>
            </div>
          </NowSection>

          <section className="now-v2-city">
            <div className="now-v2-city__top">
              <span>
                <MapPin size={20} />
              </span>

              <div>
                <small>
                  ТВОЄ МІСТО
                </small>
                <strong>
                  Київ зараз
                </strong>
              </div>
            </div>

            <div className="now-v2-city__signal">
              <span>
                <i />
              </span>

              <div>
                <strong>12,4K</strong>
                <small>
                  людей у PULSE
                </small>
              </div>
            </div>

            <p>
              Центр, Поділ та Оболонь —
              найактивніші просто зараз.
            </p>

            <button
              type="button"
              onClick={() =>
                onNavigate?.(
                  "cityPulse",
                  {
                    cityId: "kyiv",
                  }
                )
              }
            >
              Відкрити PULSE Києва
              <ArrowRight size={15} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
