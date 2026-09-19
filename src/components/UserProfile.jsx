import {
  useState,
} from "react";

function UserProfile({
  person,
  relation,
  onBack,
  onFriendAction,
  onFollow,
  onBlock,
  onOpenChat,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    notice,
    setNotice,
  ] = useState("");

  if (!person) {
    return null;
  }

  const blocked =
    Boolean(
      relation?.blocked
    );

  const friendStatus =
    relation?.friendStatus ||
    "none";

  const following =
    Boolean(
      relation?.following
    );

  const showNotice = (
    text
  ) => {
    setNotice(
      text
    );

    setTimeout(
      () =>
        setNotice(""),
      2200
    );
  };

  const renderFriendButton =
    () => {
      if (
        friendStatus ===
        "friends"
      ) {
        return (
          <button
            className="user-main-action secondary"
            onClick={() =>
              onFriendAction(
                person.id,
                "remove"
              )
            }
          >
            ✓ Друзі
          </button>
        );
      }

      if (
        friendStatus ===
        "outgoing"
      ) {
        return (
          <button
            className="user-main-action secondary"
            onClick={() =>
              onFriendAction(
                person.id,
                "cancel"
              )
            }
          >
            Запит надіслано
          </button>
        );
      }

      if (
        friendStatus ===
        "incoming"
      ) {
        return (
          <>
            <button
              className="user-main-action"
              onClick={() =>
                onFriendAction(
                  person.id,
                  "accept"
                )
              }
            >
              Прийняти
            </button>

            <button
              className="user-main-action secondary"
              onClick={() =>
                onFriendAction(
                  person.id,
                  "reject"
                )
              }
            >
              Відхилити
            </button>
          </>
        );
      }

      return (
        <button
          className="user-main-action"
          onClick={() =>
            onFriendAction(
              person.id,
              "send"
            )
          }
        >
          + Додати в друзі
        </button>
      );
    };

  if (
    blocked
  ) {
    return (
      <section className="other-profile-page">
        <button
          className="friends-back"
          onClick={
            onBack
          }
        >
          ← Назад
        </button>

        <div className="blocked-profile-card">
          <div className="blocked-profile-icon">
            🚫
          </div>

          <h2>
            {
              person.name
            }
          </h2>

          <p>
            Ви заблокували цього користувача.
          </p>

          <button
            onClick={() =>
              onBlock(
                person.id,
                false
              )
            }
          >
            Розблокувати
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="other-profile-page">
      <button
        className="friends-back"
        onClick={
          onBack
        }
      >
        ← Друзі
      </button>

      <div className="other-profile-cover">
        <div className="other-profile-cover-glow" />
      </div>

      <div className="other-profile-main">
        <div className="other-profile-avatar-wrap">
          <div
            className={`other-profile-avatar ${
              person.hasStory &&
              !person.storyViewed
                ? "has-story"
                : ""
            }`}
          >
            <div>
              {
                person.initials
              }
            </div>
          </div>

          {person.online && (
            <span className="other-profile-online" />
          )}
        </div>

        <div className="other-profile-actions">
          {renderFriendButton()}

          <button
            className={`user-main-action ${
              following
                ? "secondary"
                : ""
            }`}
            onClick={() =>
              onFollow(
                person.id
              )
            }
          >
            {following
              ? "✓ Підписка"
              : "Підписатися"}
          </button>

          <button
            className="user-main-action secondary"
            onClick={() =>
              onOpenChat?.(
                person.id
              )
            }
          >
            💬 Написати
          </button>

          <div className="profile-more-wrap">
            <button
              className="profile-more-button"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
            >
              •••
            </button>

            {menuOpen && (
              <div className="profile-more-menu">
                <button
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(
                        `@${person.username}`
                      );

                    showNotice(
                      "Посилання скопійовано"
                    );

                    setMenuOpen(
                      false
                    );
                  }}
                >
                  Копіювати профіль
                </button>

                <button
                  onClick={() => {
                    showNotice(
                      "Користувача приховано з рекомендацій"
                    );

                    setMenuOpen(
                      false
                    );
                  }}
                >
                  Не показувати
                </button>

                <button
                  onClick={() => {
                    showNotice(
                      "Скаргу створено"
                    );

                    setMenuOpen(
                      false
                    );
                  }}
                >
                  Поскаржитися
                </button>

                <button
                  className="danger"
                  onClick={() => {
                    onBlock(
                      person.id,
                      true
                    );

                    setMenuOpen(
                      false
                    );
                  }}
                >
                  Заблокувати
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="other-profile-info">
        <div className="other-profile-name-row">
          <h1>
            {
              person.name
            }
          </h1>

          {person.verified && (
            <span className="verified-badge">
              ✓
            </span>
          )}
        </div>

        <div className="other-profile-username">
          @{person.username}
        </div>

        {person.bio && (
          <p className="other-profile-bio">
            {
              person.bio
            }
          </p>
        )}

        <div className="other-profile-meta">
          <span>
            📍{" "}
            {
              person.city
            }
          </span>

          {person.mutual >
            0 && (
            <span>
              🤝{" "}
              {
                person.mutual
              }{" "}
              спільних друзів
            </span>
          )}

          {person.online && (
            <span className="profile-online-chip">
              🟢 Онлайн
            </span>
          )}
        </div>
      </div>

      <div className="other-profile-grid">
        <div className="other-profile-column">
          <div className="other-profile-card">
            <h3>
              Про людину
            </h3>

            {person.school && (
              <div className="profile-data-line">
                <span>
                  🏫
                </span>

                <div>
                  <small>
                    Школа
                  </small>

                  <strong>
                    {
                      person.school
                    }
                  </strong>
                </div>
              </div>
            )}

            {person.university && (
              <div className="profile-data-line">
                <span>
                  🎓
                </span>

                <div>
                  <small>
                    Університет
                  </small>

                  <strong>
                    {
                      person.university
                    }
                  </strong>
                </div>
              </div>
            )}

            {person.work && (
              <div className="profile-data-line">
                <span>
                  💼
                </span>

                <div>
                  <small>
                    Робота
                  </small>

                  <strong>
                    {
                      person.work
                    }
                  </strong>
                </div>
              </div>
            )}

            {person.hometown && (
              <div className="profile-data-line">
                <span>
                  🏠
                </span>

                <div>
                  <small>
                    Рідне місто
                  </small>

                  <strong>
                    {
                      person.hometown
                    }
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="other-profile-card">
            <h3>
              Інтереси
            </h3>

            <div className="other-interest-list">
              {person.interests.map(
                (
                  interest
                ) => (
                  <span
                    key={
                      interest
                    }
                  >
                    {
                      interest
                    }
                  </span>
                )
              )}
            </div>
          </div>

          <div className="other-profile-card">
            <h3>
              Дописи
            </h3>

            <div className="other-profile-placeholder-post">
              <div className="other-profile-placeholder-head">
                <div>
                  {
                    person.initials
                  }
                </div>

                <strong>
                  {
                    person.name
                  }
                </strong>
              </div>

              <p>
                Тут зʼявляться дописи користувача після підключення загальної бази контенту ЯТУТ.
              </p>
            </div>
          </div>
        </div>

        <aside className="other-profile-column">
          <div className="other-profile-card connection-card">
            <h3>
              Чому ви можете бути знайомі
            </h3>

            <div className="connection-reason">
              <span>
                ✨
              </span>

              <p>
                {
                  person.reason
                }
              </p>
            </div>
          </div>

          <div className="other-profile-card">
            <h3>
              Звʼязки
            </h3>

            <div className="other-profile-stats">
              <div>
                <strong>
                  {
                    person.friendsCount
                  }
                </strong>

                <span>
                  друзів
                </span>
              </div>

              <div>
                <strong>
                  {
                    person.followersCount
                  }
                </strong>

                <span>
                  підписників
                </span>
              </div>

              <div>
                <strong>
                  {
                    person.mutual
                  }
                </strong>

                <span>
                  спільних
                </span>
              </div>
            </div>
          </div>

          <div className="other-profile-card">
            <h3>
              Спільне з вами
            </h3>

            <div className="shared-profile-items">
              {person.mutual >
                0 && (
                <div>
                  <span>
                    🤝
                  </span>

                  <p>
                    <strong>
                      {
                        person.mutual
                      }{" "}
                      спільних друзів
                    </strong>

                    <small>
                      Люди, яких ви обоє знаєте
                    </small>
                  </p>
                </div>
              )}

              {person.city ===
                "Київ" && (
                <div>
                  <span>
                    📍
                  </span>

                  <p>
                    <strong>
                      Київ
                    </strong>

                    <small>
                      Ви знаходитесь в одному місті
                    </small>
                  </p>
                </div>
              )}

              {person.interests?.[0] && (
                <div>
                  <span>
                    ❤️
                  </span>

                  <p>
                    <strong>
                      {
                        person.interests[
                          0
                        ]
                      }
                    </strong>

                    <small>
                      Спільний інтерес
                    </small>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="other-profile-card profile-safety-card">
            <h3>
              Безпека
            </h3>

            <button
              onClick={() =>
                showNotice(
                  "Профіль приховано з рекомендацій"
                )
              }
            >
              🙈 Не показувати в рекомендаціях
            </button>

            <button
              onClick={() =>
                showNotice(
                  "Скаргу створено"
                )
              }
            >
              ⚠️ Поскаржитися
            </button>

            <button
              className="danger"
              onClick={() =>
                onBlock(
                  person.id,
                  true
                )
              }
            >
              🚫 Заблокувати
            </button>
          </div>
        </aside>
      </div>

      {notice && (
        <div className="yatut-toast">
          {notice}
        </div>
      )}
    </section>
  );
}

export default UserProfile;