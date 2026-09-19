import {
  ArrowRight,
  MapPin,
  Radio,
} from "lucide-react";

import {
  currentCity,
  nearbyPeople,
  nearbyPlaces,
  suggestions,
  upcomingEvents,
} from "../../data/homeMockData";

function NearbyMap() {
  return (
    <section className="premium-right-card premium-nearby-card">
      <header className="premium-right-header">
        <div>
          <Radio size={18} />

          <strong>
            Зараз у твоєму районі
          </strong>
        </div>

        <button type="button">
          Дивитись на карті
          <ArrowRight size={13} />
        </button>
      </header>

      <div className="premium-nearby-map">
        <div className="premium-map-grid" />

        <div className="premium-map-radius radius-one" />
        <div className="premium-map-radius radius-two" />

        <span className="premium-map-me">
          В
        </span>

        {nearbyPeople.map((person) => (
          <span
            className="premium-map-person"
            key={person.id}
            style={{
              left: `${person.x}%`,
              top: `${person.y}%`,
            }}
            title={person.name}
          >
            {person.initials}
          </span>
        ))}

        <span className="premium-map-count">
          12 людей поруч
        </span>

        <button
          className="premium-map-distance"
          type="button"
        >
          <MapPin size={13} />
          Київ · 800 м
        </button>

        <button
          className="premium-map-here"
          type="button"
        >
          <MapPin size={14} />
          Я тут
        </button>
      </div>
    </section>
  );
}

function PlacesCard() {
  return (
    <section className="premium-right-card">
      <header className="premium-right-header">
        <strong>
          Популярні місця поруч
        </strong>

        <button type="button">
          Дивитись усі
          <ArrowRight size={13} />
        </button>
      </header>

      <div className="premium-right-list">
        {nearbyPlaces.map((place) => (
          <button
            className="premium-place-row"
            type="button"
            key={place.id}
          >
            <img
              src={place.image}
              alt={place.title}
              loading="lazy"
            />

            <span>
              <strong>
                {place.title}
              </strong>

              <small>
                {place.subtitle}
              </small>
            </span>

            <b>
              {place.distance}
            </b>
          </button>
        ))}
      </div>
    </section>
  );
}

function SuggestionsCard() {
  return (
    <section className="premium-right-card">
      <header className="premium-right-header">
        <strong>
          Люди, яких ти можеш знати
        </strong>

        <button type="button">
          Дивитись усі
          <ArrowRight size={13} />
        </button>
      </header>

      <div className="premium-suggestions-row">
        {suggestions.map((person) => (
          <article
            key={person.id}
            className="premium-suggestion"
          >
            <span className="premium-suggestion-avatar">
              {person.initials}
              <i />
            </span>

            <strong>
              {person.name}
            </strong>

            <small>
              {person.mutual} спільних друзів
            </small>

            <button type="button">
              Додати
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventsCard() {
  return (
    <section className="premium-right-card">
      <header className="premium-right-header">
        <strong>
          Найближчі події
        </strong>

        <button type="button">
          Дивитись усі
          <ArrowRight size={13} />
        </button>
      </header>

      <div className="premium-event-list">
        {upcomingEvents.map((event) => (
          <article
            key={event.id}
            className="premium-event-row"
          >
            <img
              src={event.image}
              alt={event.title}
              loading="lazy"
            />

            <div>
              <strong>
                {event.title}
              </strong>

              <small>
                {event.meta}
              </small>
            </div>

            <button type="button">
              {event.action}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeRightRail() {
  return (
    <aside className="premium-home-right">
      <NearbyMap />

      <PlacesCard />

      <SuggestionsCard />

      <EventsCard />

      <button
        type="button"
        className="premium-right-banner"
        aria-label="Я тут, де важливі люди"
        style={{
          backgroundImage: `url("${currentCity.miniBanner}")`,
        }}
      />
    </aside>
  );
}

export default HomeRightRail;