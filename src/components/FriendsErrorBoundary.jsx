import {
  Component,
} from "react";

import "./FriendsErrorBoundary.css";

import YatutIcon from "./YatutIcon";

const FALLBACK_PEOPLE = [
  {
    id: "maria",
    name: "Марія Коваль",
    initial: "М",
    subtitle: "18 спільних друзів",
  },
  {
    id: "oleksandr",
    name: "Олександр Бондар",
    initial: "О",
    subtitle: "12 спільних друзів",
  },
  {
    id: "sofia",
    name: "Софія Романенко",
    initial: "С",
    subtitle: "21 спільний друг",
  },
  {
    id: "yulia",
    name: "Юлія Савченко",
    initial: "Ю",
    subtitle: "14 спільних друзів",
  },
];

export default class FriendsErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error(
      "FRIENDS PAGE ERROR:",
      error,
      info
    );
  }

  retry = () => {
    this.setState({
      hasError: false,
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const {
      onNavigate,
      onOpenChat,
    } = this.props;

    return (
      <section className="friends-safe-page">
        <header className="friends-safe-hero">
          <span>
            ЯТУТ • ДРУЗІ
          </span>

          <h1>
            Твої люди
          </h1>

          <p>
            Друзі, знайомі та люди,
            з якими можна бути на
            зв’язку просто зараз.
          </p>
        </header>

        <div className="friends-safe-actions">
          <button
            type="button"
            className="primary"
            onClick={() =>
              onNavigate?.(
                "search"
              )
            }
          >
            <YatutIcon
              name="search"
              size={18}
            />

            Знайти людей
          </button>

          <button
            type="button"
            onClick={
              this.retry
            }
          >
            Оновити
          </button>
        </div>

        <div className="friends-safe-list">
          {FALLBACK_PEOPLE.map(
            (person) => (
              <article
                key={
                  person.id
                }
              >
                <span className="friends-safe-avatar">
                  {
                    person.initial
                  }
                </span>

                <div>
                  <strong>
                    {
                      person.name
                    }
                  </strong>

                  <small>
                    {
                      person.subtitle
                    }
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenChat?.(
                      person.id
                    )
                  }
                  aria-label={`Написати ${person.name}`}
                >
                  <YatutIcon
                    name="message"
                    size={18}
                  />
                </button>
              </article>
            )
          )}
        </div>
      </section>
    );
  }
}
