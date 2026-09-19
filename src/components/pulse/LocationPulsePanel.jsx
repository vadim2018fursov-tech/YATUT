import {
  CalendarDays,
  Map,
  MapPin,
  Users,
  Video,
  X,
} from "lucide-react";

const tabs = [
  "Відео",
  "Люди",
  "Місця",
  "Події",
];

export default function LocationPulsePanel({
  location = "Поділ, Київ",
  peopleNow = 428,
  friendsNearby = 12,
  videosLastHour = 8,
  eventsToday = 6,
  onClose,
  onOpenMap,
}) {
  return (
    <div
      className="pulse-location-panel-backdrop"
      onClick={onClose}
    >
      <section
        className="pulse-location-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="pulse-location-panel__header">
          <div>
            <span>
              <MapPin
                size={17}
              />
            </span>

            <div>
              <small>
                ТУТ ЗАРАЗ
              </small>

              <strong>
                {location}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="pulse-location-panel__close"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X
              size={19}
            />
          </button>
        </header>

        <div className="pulse-location-panel__stats">
          <article>
            <Users
              size={18}
            />

            <strong>
              {peopleNow}
            </strong>

            <span>
              людей
            </span>
          </article>

          <article>
            <Users
              size={18}
            />

            <strong>
              {friendsNearby}
            </strong>

            <span>
              друзів поруч
            </span>
          </article>

          <article>
            <Video
              size={18}
            />

            <strong>
              {videosLastHour}
            </strong>

            <span>
              відео за годину
            </span>
          </article>

          <article>
            <CalendarDays
              size={18}
            />

            <strong>
              {eventsToday}
            </strong>

            <span>
              подій сьогодні
            </span>
          </article>
        </div>

        <nav className="pulse-location-panel__tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={
                index === 0
                  ? "is-active"
                  : ""
              }
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="pulse-location-panel__preview">
          <strong>
            Що відбувається тут
          </strong>

          <p>
            Нові відео, люди, місця та події з цієї локації.
          </p>
        </div>

        <button
          type="button"
          className="pulse-location-panel__map"
          onClick={onOpenMap}
        >
          <Map
            size={17}
          />

          Відкрити на карті
        </button>
      </section>
    </div>
  );
}