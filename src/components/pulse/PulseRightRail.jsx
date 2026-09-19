import {
  Activity,
  MapPin,
  Radio,
  Users,
} from "lucide-react";

import {
  pulseNearby,
  pulseSummary,
  pulseTrending,
} from "../../data/pulseMockData";

function formatViews(
  value
) {
  const number =
    Number(
      value || 0
    );

  if (
    number >=
    1000000
  ) {
    return `${(
      number /
      1000000
    ).toFixed(1)}M`;
  }

  if (
    number >=
    1000
  ) {
    return `${Math.round(
      number /
        1000
    )}K`;
  }

  return String(
    number
  );
}

export default function PulseRightRail({
  onNavigate,
}) {
  return (
    <aside className="pulse-right-rail">
      {/* ===============================================
          TRENDING
      =============================================== */}

      <section className="pulse-side-card">
        <div className="pulse-side-card__header">
          <div>
            <Activity
              size={18}
            />

            <strong>
              Тренди тижня
            </strong>
          </div>

          <button
            type="button"
          >
            Дивитися всі
          </button>
        </div>

        <div className="pulse-trending-list">
          {pulseTrending.map(
            (item) => (
              <button
                type="button"
                className="pulse-trending-item"
                key={item.id}
              >
                <span className="pulse-trending-item__rank">
                  {item.rank}
                </span>

                <img
                  src={
                    item.thumbnail
                  }
                  alt=""
                  loading="lazy"
                />

                <div>
                  <strong>
                    {
                      item.title
                    }
                  </strong>

                  <small>
                    {formatViews(
                      item.views
                    )}{" "}
                    переглядів
                  </small>
                </div>
              </button>
            )
          )}
        </div>
      </section>

      {/* ===============================================
          LIVE
      =============================================== */}

      <section className="pulse-side-card">
        <div className="pulse-side-card__header">
          <div>
            <Radio
              size={18}
            />

            <strong>
              LIVE зараз
            </strong>
          </div>

          <button
            type="button"
          >
            Дивитися всі
          </button>
        </div>

        <div className="pulse-live-list">
          {pulseSummary.live
            .slice(
              0,
              3
            )
            .map(
              (video) => (
                <button
                  type="button"
                  className="pulse-live-item"
                  key={
                    video.id
                  }
                >
                  <div className="pulse-live-item__media">
                    <img
                      src={
                        video.thumbnail
                      }
                      alt=""
                      loading="lazy"
                    />

                    <span>
                      LIVE
                    </span>
                  </div>

                  <div className="pulse-live-item__body">
                    <strong>
                      {
                        video.title
                      }
                    </strong>

                    <small>
                      @
                      {
                        video.author
                          .username
                      }
                    </small>

                    <b>
                      ●{" "}
                      {
                        video.peopleHere
                      }{" "}
                      зараз
                    </b>
                  </div>
                </button>
              )
            )}
        </div>
      </section>

      {/* ===============================================
          NEARBY
      =============================================== */}

      <section className="pulse-side-card pulse-nearby-card">
        <div className="pulse-side-card__header">
          <div>
            <MapPin
              size={18}
            />

            <strong>
              Пульс поруч
            </strong>
          </div>
        </div>

        <div className="pulse-nearby-avatars">
          {pulseNearby.friends.map(
            (
              person,
              index
            ) => (
              <span
                key={
                  person.id
                }
                style={{
                  zIndex:
                    10 -
                    index,
                }}
              >
                {
                  person.initials
                }
              </span>
            )
          )}

          <b>
            +12
          </b>
        </div>

        <div className="pulse-nearby-meta">
          <div>
            <Users
              size={17}
            />

            <span>
              {
                pulseNearby.peopleNow
              }{" "}
              людей поруч
            </span>
          </div>

          <div>
            <MapPin
              size={17}
            />

            <span>
              {
                pulseNearby.location
              }{" "}
              ·{" "}
              {
                pulseNearby.distance
              }{" "}
              м
            </span>
          </div>
        </div>

        <button
          type="button"
          className="pulse-nearby-button"
          onClick={() =>
            onNavigate?.(
              "nearby"
            )
          }
        >
          Дивитися на карті
        </button>
      </section>
    </aside>
  );
}