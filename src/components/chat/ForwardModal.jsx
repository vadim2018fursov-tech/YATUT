import {
  useMemo,
  useState,
} from "react";

function getChatName(
  chat,
  people
) {
  if (
    chat.type ===
    "group"
  ) {
    return (
      chat.title ||
      "Груповий чат"
    );
  }

  return (
    people[
      chat.personId
    ]?.name ||
    "Користувач"
  );
}

function getChatInitials(
  chat,
  people
) {
  if (
    chat.type ===
    "group"
  ) {
    return (
      chat.initials ||
      chat.title?.[
        0
      ] ||
      "Г"
    );
  }

  return (
    people[
      chat.personId
    ]?.initials ||
    "?"
  );
}

function ForwardModal({
  chats,
  people,
  currentChatId,
  onClose,
  onForward,
}) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    sendingChatId,
    setSendingChatId,
  ] = useState(null);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return chats.filter(
        (
          chat
        ) => {
          const name =
            getChatName(
              chat,
              people
            );

          return (
            !query ||
            name
              .toLowerCase()
              .includes(
                query
              )
          );
        }
      );
    }, [
      chats,
      people,
      search,
    ]);

  const handleForward =
    async (
      chat
    ) => {
      setSendingChatId(
        chat.id
      );

      try {
        await onForward?.(
          chat
        );
      } finally {
        setSendingChatId(
          null
        );
      }
    };

  return (
    <div
      className="chat-modal-backdrop"
      onClick={
        onClose
      }
    >
      <div
        className="forward-modal"
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
              Переслати
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

        <label className="forward-search">
          <span>
            🔎
          </span>

          <input
            autoFocus
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
            placeholder="Знайти чат"
          />
        </label>

        <div className="forward-chat-list">
          {filtered.map(
            (
              chat
            ) => {
              const current =
                chat.id ===
                currentChatId;

              return (
                <div
                  className="forward-chat-row"
                  key={
                    chat.id
                  }
                >
                  <div className="forward-chat-avatar">
                    {getChatInitials(
                      chat,
                      people
                    )}
                  </div>

                  <div className="forward-chat-info">
                    <strong>
                      {getChatName(
                        chat,
                        people
                      )}
                    </strong>

                    <span>
                      {chat.type ===
                      "group"
                        ? `${
                            chat.members
                              ?.length ||
                            0
                          } учасників`
                        : current
                        ? "Поточний чат"
                        : "Особистий чат"}
                    </span>
                  </div>

                  <button
                    className="forward-send-button"
                    disabled={
                      sendingChatId ===
                      chat.id
                    }
                    onClick={() =>
                      handleForward(
                        chat
                      )
                    }
                  >
                    {sendingChatId ===
                    chat.id
                      ? "..."
                      : "Надіслати"}
                  </button>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;