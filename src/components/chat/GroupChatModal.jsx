import {
  useMemo,
  useState,
} from "react";

function GroupChatModal({
  people,
  onClose,
  onCreate,
}) {
  const [
    title,
    setTitle,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selected,
    setSelected,
  ] = useState([]);

  const peopleList =
    useMemo(
      () =>
        Object.values(
          people
        ).filter(
          (
            person
          ) =>
            person.id !==
            "me"
        ),
      [
        people,
      ]
    );

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return peopleList.filter(
        (
          person
        ) =>
          !query ||
          person.name
            .toLowerCase()
            .includes(
              query
            ) ||
          person.username
            ?.toLowerCase()
            .includes(
              query
            )
      );
    }, [
      peopleList,
      search,
    ]);

  const togglePerson = (
    id
  ) => {
    setSelected(
      (
        previous
      ) =>
        previous.includes(
          id
        )
          ? previous.filter(
              (
                item
              ) =>
                item !== id
            )
          : [
              ...previous,
              id,
            ]
    );
  };

  const create =
    () => {
      if (
        !title.trim() ||
        selected.length <
          2
      ) {
        return;
      }

      onCreate?.({
        title:
          title.trim(),

        members: [
          "me",
          ...selected,
        ],
      });
    };

  return (
    <div
      className="chat-modal-backdrop"
      onClick={
        onClose
      }
    >
      <div
        className="group-modal"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="chat-modal-header">
          <div>
            <span>
              ЯТУТ
            </span>

            <strong>
              Нова група
            </strong>
          </div>

          <button
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <div className="group-modal-body">
          <label className="group-name-field">
            <span>
              Назва групи
            </span>

            <input
              autoFocus
              maxLength={
                60
              }
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
              placeholder="Наприклад: Наша команда"
            />
          </label>

          <div className="group-selected-summary">
            <div className="group-icon-preview">
              {title
                .trim()?.[
                  0
                ]
                ?.toUpperCase() ||
                "Г"}
            </div>

            <div>
              <strong>
                {title.trim() ||
                  "Нова група"}
              </strong>

              <span>
                {selected.length +
                  1}{" "}
                учасників
              </span>
            </div>
          </div>

          <label className="group-people-search">
            🔎

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
              placeholder="Знайти друзів"
            />
          </label>

          <div className="group-members-select">
            {filtered.map(
              (
                person
              ) => {
                const checked =
                  selected.includes(
                    person.id
                  );

                return (
                  <button
                    key={
                      person.id
                    }
                    className={
                      checked
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      togglePerson(
                        person.id
                      )
                    }
                  >
                    <div className="group-person-avatar">
                      {
                        person.initials
                      }

                      {person.online && (
                        <span />
                      )}
                    </div>

                    <div>
                      <strong>
                        {
                          person.name
                        }
                      </strong>

                      <small>
                        @
                        {
                          person.username
                        }
                      </small>
                    </div>

                    <div className="group-check">
                      {checked
                        ? "✓"
                        : ""}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        <footer className="group-modal-footer">
          <span>
            Мінімум 2 людини + ви
          </span>

          <button
            disabled={
              !title.trim() ||
              selected.length <
                2
            }
            onClick={
              create
            }
          >
            Створити групу
          </button>
        </footer>
      </div>
    </div>
  );
}

export default GroupChatModal;