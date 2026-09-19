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
} from "lucide-react";

const FRIENDS = [
  {
    id: "maria",
    name: "Марія",
    action:
      "зараз у центрі Києва",
    ago: "2 хв",
  },
  {
    id: "oleksandr",
    name: "Олександр",
    action:
      "дивиться LIVE",
    ago: "4 хв",
  },
  {
    id: "sofia",
    name: "Софія",
    action:
      "додала PULSE момент",
    ago: "7 хв",
  },
];

function NowSection({
  icon: Icon,
  title,
  subtitle,
  action,
  onAction,
  children,
}) {
  return (
    <section className="now-page-card">
      <header>
        <div>
          <span>
            <Icon
              size={18}
            />
          </span>

          <div>
            <strong>
              {title}
            </strong>

            <small>
              {subtitle}
            </small>
          </div>
        </div>

        {action && (
          <button
            type="button"
            onClick={
              onAction
            }
          >
            {action}

            <ArrowRight
              size={15}
            />
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
  return (
    <div className="now-page">
      <section className="now-page-hero">
        <div>
          <span className="now-page-hero__badge">
            <Activity
              size={15}
            />

            ЯТУТ ЗАРАЗ
          </span>

          <h1>
            Що відбувається
            прямо зараз
          </h1>

          <p>
            Люди, друзі,
            події, місця,
            LIVE та активність
            за останні хвилини.
          </p>

          <div className="now-page-hero__chips">
            <span>
              <Users
                size={14}
              />

              32 друзів онлайн
            </span>

            <span>
              <Radio
                size={14}
              />

              6 LIVE
            </span>

            <span>
              <MapPin
                size={14}
              />

              Київ активний
            </span>
          </div>
        </div>

        <div className="now-page-hero__pulse">
          <span>
            <i />
          </span>

          <strong>
            ЗАРАЗ
          </strong>

          <small>
            оновлюється
            у реальному часі
          </small>
        </div>
      </section>

      <section className="now-page-summary">
        <article>
          <Users
            size={20}
          />

          <strong>
            32
          </strong>

          <span>
            друзів онлайн
          </span>
        </article>

        <article>
          <Flame
            size={20}
          />

          <strong>
            18
          </strong>

          <span>
            активних тем
          </span>
        </article>

        <article>
          <Radio
            size={20}
          />

          <strong>
            6
          </strong>

          <span>
            LIVE зараз
          </span>
        </article>

        <article>
          <CalendarDays
            size={20}
          />

          <strong>
            24
          </strong>

          <span>
            події сьогодні
          </span>
        </article>
      </section>

      <div className="now-page-layout">
        <main className="now-page-main">
          <NowSection
            icon={Users}
            title="Друзі зараз"
            subtitle="Що роблять твої люди"
            action="Усі друзі"
            onAction={() =>
              onNavigate?.(
                "friends"
              )
            }
          >
            <div className="now-friends">
              {FRIENDS.map(
                (
                  friend,
                  index
                ) => (
                  <article
                    key={
                      friend.id
                    }
                  >
                    <button
                      type="button"
                      className="now-friend-avatar"
                      onClick={() =>
                        onOpenChat?.(
                          friend.id
                        )
                      }
                    >
                      {
                        friend.name[
                          0
                        ]
                      }

                      <i />
                    </button>

                    <div>
                      <strong>
                        {
                          friend.name
                        }
                      </strong>

                      <p>
                        {
                          friend.action
                        }
                      </p>

                      <small>
                        {
                          friend.ago
                        }
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenChat?.(
                          friend.id
                        )
                      }
                    >
                      <MessageCircle
                        size={16}
                      />
                    </button>
                  </article>
                )
              )}
            </div>
          </NowSection>

          <NowSection
            icon={Flame}
            title="Набирає активність"
            subtitle="За останні 15 хвилин"
            action="PULSE"
            onAction={() =>
              onNavigate?.(
                "pulse"
              )
            }
          >
            <div className="now-trending">
              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "pulse"
                  )
                }
              >
                <span>
                  <TrendingUp
                    size={18}
                  />
                </span>

                <div>
                  <strong>
                    Київ зараз
                  </strong>

                  <p>
                    +2,4K взаємодій
                    за 15 хвилин
                  </p>
                </div>

                <ArrowRight
                  size={17}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "clips"
                  )
                }
              >
                <span>
                  <Video
                    size={18}
                  />
                </span>

                <div>
                  <strong>
                    Вечірній Поділ
                  </strong>

                  <p>
                    Clip швидко
                    набирає перегляди
                  </p>
                </div>

                <ArrowRight
                  size={17}
                />
              </button>
            </div>
          </NowSection>

          <NowSection
            icon={MapPin}
            title="Поруч із тобою"
            subtitle="Люди та місця навколо"
            action="Поруч"
            onAction={() =>
              onNavigate?.(
                "nearby"
              )
            }
          >
            <div className="now-nearby">
              <div>
                <span>
                  <Users
                    size={17}
                  />
                </span>

                <strong>
                  428 людей
                </strong>

                <small>
                  зараз поруч
                </small>
              </div>

              <div>
                <span>
                  <Sparkles
                    size={17}
                  />
                </span>

                <strong>
                  12 друзів
                </strong>

                <small>
                  у цьому районі
                </small>
              </div>

              <div>
                <span>
                  <Activity
                    size={17}
                  />
                </span>

                <strong>
                  8 відео
                </strong>

                <small>
                  за останню годину
                </small>
              </div>
            </div>
          </NowSection>

          <NowSection
            icon={Radio}
            title="LIVE зараз"
            subtitle="Подивись, що відбувається"
            action="Усі LIVE"
            onAction={() =>
              onNavigate?.(
                "live"
              )
            }
          >
            <div className="now-live-grid">
              {[
                {
                  title:
                    "Хрещатик зараз",
                  viewers:
                    "1,2K",
                },
                {
                  title:
                    "Поділ ввечері",
                  viewers:
                    "846",
                },
              ].map(
                (item) => (
                  <button
                    key={
                      item.title
                    }
                    type="button"
                    onClick={() =>
                      onNavigate?.(
                        "live"
                      )
                    }
                  >
                    <div>
                      <span>
                        LIVE
                      </span>

                      <i>
                        {
                          item.viewers
                        }
                      </i>

                      <Radio
                        size={28}
                      />
                    </div>

                    <strong>
                      {
                        item.title
                      }
                    </strong>

                    <small>
                      Київ
                    </small>
                  </button>
                )
              )}
            </div>
          </NowSection>
        </main>

        <aside className="now-page-sidebar">
          <NowSection
            icon={CalendarDays}
            title="Починається скоро"
            subtitle="Події сьогодні"
            action="Події"
            onAction={() =>
              onNavigate?.(
                "events"
              )
            }
          >
            <div className="now-events">
              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "events"
                  )
                }
              >
                <span>
                  19:30
                </span>

                <div>
                  <strong>
                    Вечірній Київ
                  </strong>

                  <small>
                    Хрещатик
                  </small>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "events"
                  )
                }
              >
                <span>
                  20:00
                </span>

                <div>
                  <strong>
                    Поділ просто неба
                  </strong>

                  <small>
                    Контрактова площа
                  </small>
                </div>
              </button>
            </div>
          </NowSection>

          <NowSection
            icon={MessageCircle}
            title="Активні чати"
            subtitle="Нові повідомлення"
            action="Чати"
            onAction={() =>
              onNavigate?.(
                "chats"
              )
            }
          >
            <div className="now-chats">
              <button
                type="button"
                onClick={() =>
                  onOpenChat?.(
                    "maria"
                  )
                }
              >
                <span>
                  М
                </span>

                <div>
                  <strong>
                    Марія
                  </strong>

                  <small>
                    Ти сьогодні в центрі?
                  </small>
                </div>

                <b>
                  2
                </b>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate?.(
                    "communities"
                  )
                }
              >
                <span>
                  Я
                </span>

                <div>
                  <strong>
                    ЯТУТ Київ
                  </strong>

                  <small>
                    +14 нових повідомлень
                  </small>
                </div>

                <b>
                  14
                </b>
              </button>
            </div>
          </NowSection>

          <section className="now-city-card">
            <MapPin
              size={20}
            />

            <small>
              ТВОЄ МІСТО
            </small>

            <strong>
              Київ живе
              прямо зараз
            </strong>

            <p>
              12,4K людей
              активні у PULSE.
            </p>

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

              <ArrowRight
                size={15}
              />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}