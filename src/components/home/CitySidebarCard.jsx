import {
  CalendarDays,
  MapPin,
  Users,
  UserRound,
} from "lucide-react";

import {
  currentCity,
} from "../../data/homeMockData";

const rows = [
  {
    icon: Users,

    value:
      currentCity.peopleNow.toLocaleString(
        "uk-UA"
      ),

    text:
      "людей зараз у Києві",

    kind:
      "blue",
  },

  {
    icon:
      CalendarDays,

    value:
      currentCity.eventsToday,

    text:
      "подій сьогодні",

    kind:
      "coral",
  },

  {
    icon:
      MapPin,

    value:
      currentCity.newPlaces,

    text:
      "нових місць",

    kind:
      "purple",
  },

  {
    icon:
      UserRound,

    value:
      currentCity.friendsNearby,

    text:
      "друзів поруч",

    kind:
      "green",
  },
];

function CitySidebarCard({
  onNavigate,
}) {
  return (
    <section className="premium-city-card">
      {/* =================================================
          PHOTO
      ================================================= */}

      <div
        className="premium-city-card-photo"
        style={{
          backgroundImage:
            `url("${currentCity.cityCard}")`,
        }}
      >
        <div>
          <span>
            Київ
          </span>

          <strong>
            Я тут ♡
          </strong>
        </div>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="premium-city-stats">
        {rows.map((row) => {
          const Icon =
            row.icon;

          return (
            <div
              className={`premium-city-stat ${row.kind}`}
              key={row.text}
            >
              <span>
                <Icon
                  size={17}
                />
              </span>

              <div>
                <strong>
                  {row.value}
                </strong>

                <small>
                  {row.text}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================
          MAP BUTTON
      ================================================= */}

      <button
        type="button"
        className="premium-city-map-button"
        onClick={() =>
          onNavigate?.(
            "nearby"
          )
        }
      >
        <MapPin
          size={15}
        />

        Відкрити карту
      </button>
    </section>
  );
}

export default CitySidebarCard;