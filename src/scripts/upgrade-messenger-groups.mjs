import {
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import {
  resolve,
} from "node:path";

const path =
  resolve(
    process.cwd(),
    "src/components/Chats.jsx"
  );

const backup =
  resolve(
    process.cwd(),
    "src/components/Chats.before-group-management.bak.jsx"
  );

if (
  !existsSync(
    path
  )
) {
  throw new Error(
    "Не знайдено src/components/Chats.jsx"
  );
}

let source =
  readFileSync(
    path,
    "utf8"
  );

if (
  !existsSync(
    backup
  )
) {
  copyFileSync(
    path,
    backup
  );
}

/* =========================================================
   IMPORTS
========================================================= */

const databaseImport =
`} from "../storage/database";`;

const extraImports =
`} from "../storage/database";

import {
  ChatMediaModal,
  GroupManagementModal,
} from "./chat/ChatManagementModals";

import "../styles/chat-management.css";`;

if (
  !source.includes(
    "GroupManagementModal"
  )
) {
  if (
    !source.includes(
      databaseImport
    )
  ) {
    throw new Error(
      "Не знайдено database import"
    );
  }

  source =
    source.replace(
      databaseImport,
      extraImports
    );
}

/* =========================================================
   STATES
========================================================= */

const stateAnchor =
`  const [
    infoOpen,
    setInfoOpen,
  ] = useState(false);`;

const stateReplacement =
`  const [
    infoOpen,
    setInfoOpen,
  ] = useState(false);

  const [
    groupManageOpen,
    setGroupManageOpen,
  ] = useState(false);

  const [
    mediaFilesOpen,
    setMediaFilesOpen,
  ] = useState(false);`;

if (
  !source.includes(
    "groupManageOpen"
  )
) {
  if (
    !source.includes(
      stateAnchor
    )
  ) {
    throw new Error(
      "Не знайдено infoOpen state"
    );
  }

  source =
    source.replace(
      stateAnchor,
      stateReplacement
    );
}

/* =========================================================
   CHAT SETTINGS FUNCTIONS
========================================================= */

const pinnedAnchor =
`  const pinned =
    messages.find(
      (message) =>
        message.pinned
    );`;

const functions =
`  /* =======================================================
     CHAT SETTINGS
  ======================================================= */

  const updateActiveChatSettings =
    async (
      patch
    ) => {
      if (!activeChat) {
        return;
      }

      const updated = {
        ...activeChat,
        ...patch,
        updatedAt:
          Date.now(),
      };

      await saveChat(
        updated
      );

      setChats(
        (previous) =>
          previous.map(
            (chat) =>
              chat.id ===
              updated.id
                ? updated
                : chat
          )
      );
    };

  const toggleChatMute =
    async () => {
      await updateActiveChatSettings({
        muted:
          !Boolean(
            activeChat?.muted
          ),
      });
    };

  const toggleChatBlock =
    async () => {
      await updateActiveChatSettings({
        blocked:
          !Boolean(
            activeChat?.blocked
          ),
      });
    };

  const saveGroupSettings =
    async (
      updated
    ) => {
      await saveChat(
        updated
      );

      setChats(
        (previous) =>
          previous.map(
            (chat) =>
              chat.id ===
              updated.id
                ? updated
                : chat
          )
      );

      setGroupManageOpen(
        false
      );
    };

  const pinned =
    messages.find(
      (message) =>
        message.pinned
    );`;

if (
  !source.includes(
    "updateActiveChatSettings"
  )
) {
  if (
    !source.includes(
      pinnedAnchor
    )
  ) {
    throw new Error(
      "Не знайдено pinned marker"
    );
  }

  source =
    source.replace(
      pinnedAnchor,
      functions
    );
}

/* =========================================================
   COMMUNITY BUTTONS
========================================================= */

source =
  source.replace(
`                <button className="chat-info-row-button">
                  🔕 Сповіщення
                </button>

                <button className="chat-info-row-button">
                  🖼️ Медіа та файли
                </button>`,
`                <button
                  className="chat-info-row-button"
                  onClick={
                    toggleChatMute
                  }
                >
                  {activeChat.muted
                    ? "🔔 Увімкнути сповіщення"
                    : "🔕 Вимкнути сповіщення"}
                </button>

                <button
                  className="chat-info-row-button"
                  onClick={() =>
                    setMediaFilesOpen(
                      true
                    )
                  }
                >
                  🖼️ Медіа та файли
                </button>`
  );

/* =========================================================
   GROUP INFO
========================================================= */

const groupConference =
`                  <button
                    className="chat-info-primary-action"
                    onClick={
                      startConference
                    }
                  >
                    📹 Почати конференцію
                  </button>`;

const enhancedGroupConference =
`                  <button
                    className="chat-info-primary-action"
                    onClick={() =>
                      setGroupManageOpen(
                        true
                      )
                    }
                  >
                    ⚙️ Керування групою
                  </button>

                  <button
                    className="chat-info-row-button"
                    onClick={
                      toggleChatMute
                    }
                  >
                    {activeChat.muted
                      ? "🔔 Увімкнути сповіщення"
                      : "🔕 Вимкнути сповіщення"}
                  </button>

                  <button
                    className="chat-info-row-button"
                    onClick={() =>
                      setMediaFilesOpen(
                        true
                      )
                    }
                  >
                    🖼️ Медіа та файли
                  </button>

                  <button
                    className="chat-info-primary-action"
                    onClick={
                      startConference
                    }
                  >
                    📹 Почати конференцію
                  </button>`;

const groupSectionStart =
  source.indexOf(
    `activeChat.type ===
                "group"`
  );

if (
  groupSectionStart !==
  -1
) {
  const groupSectionEnd =
    source.indexOf(
      `{activeChat.type !==`,
      groupSectionStart
    );

  if (
    groupSectionEnd !==
    -1
  ) {
    const before =
      source.slice(
        0,
        groupSectionStart
      );

    let section =
      source.slice(
        groupSectionStart,
        groupSectionEnd
      );

    const after =
      source.slice(
        groupSectionEnd
      );

    if (
      !section.includes(
        "setGroupManageOpen"
      )
    ) {
      section =
        section.replace(
          groupConference,
          enhancedGroupConference
        );
    }

    source =
      before +
      section +
      after;
  }
}

/* =========================================================
   DIRECT CHAT SETTINGS
========================================================= */

source =
  source.replace(
`                  <button className="chat-info-row-button">
                    🔕 Вимкнути сповіщення
                  </button>

                  <button className="chat-info-row-button">
                    🖼️ Медіа та файли
                  </button>

                  <button className="chat-info-row-button danger">
                    🚫 Заблокувати
                  </button>`,
`                  <button
                    className="chat-info-row-button"
                    onClick={
                      toggleChatMute
                    }
                  >
                    {activeChat.muted
                      ? "🔔 Увімкнути сповіщення"
                      : "🔕 Вимкнути сповіщення"}
                  </button>

                  <button
                    className="chat-info-row-button"
                    onClick={() =>
                      setMediaFilesOpen(
                        true
                      )
                    }
                  >
                    🖼️ Медіа та файли
                  </button>

                  <button
                    className="chat-info-row-button danger"
                    onClick={
                      toggleChatBlock
                    }
                  >
                    {activeChat.blocked
                      ? "✅ Розблокувати"
                      : "🚫 Заблокувати"}
                  </button>`
  );

/* =========================================================
   ADMIN BADGES IN MEMBER LIST
========================================================= */

source =
  source.replace(
`                        <div className="chat-member-name">

                          <strong>
                            {id ===
                            "me"
                              ? "Ви"
                              : PEOPLE[
                                  id
                                ]?.name ||
                                "Учасник"}
                          </strong>

                        </div>`,
`                        <div className="chat-member-name">

                          <strong>
                            {id ===
                            "me"
                              ? "Ви"
                              : PEOPLE[
                                  id
                                ]?.name ||
                                "Учасник"}
                          </strong>

                          {(activeChat.admins ||
                            []).includes(
                              id
                            ) && (
                            <small>
                              Адміністратор
                            </small>
                          )}

                        </div>`
  );

/* =========================================================
   MODALS
========================================================= */

const modalAnchor =
`      {groupOpen && (
        <GroupModal`;

const modalInsert =
`      {groupManageOpen &&
        activeChat?.type ===
          "group" && (
          <GroupManagementModal
            chat={
              activeChat
            }
            onClose={() =>
              setGroupManageOpen(
                false
              )
            }
            onSave={
              saveGroupSettings
            }
          />
        )}

      {mediaFilesOpen &&
        activeChat && (
          <ChatMediaModal
            chat={{
              ...activeChat,

              title:
                chatTitle(
                  activeChat
                ),
            }}
            messages={
              messages
            }
            onClose={() =>
              setMediaFilesOpen(
                false
              )
            }
          />
        )}

      {groupOpen && (
        <GroupModal`;

if (
  !source.includes(
    "<GroupManagementModal"
  )
) {
  if (
    !source.includes(
      modalAnchor
    )
  ) {
    throw new Error(
      "Не знайдено GroupModal render"
    );
  }

  source =
    source.replace(
      modalAnchor,
      modalInsert
    );
}

/* =========================================================
   WRITE
========================================================= */

writeFileSync(
  path,
  source,
  "utf8"
);

console.log("");
console.log(
  "✅ Messenger оновлено"
);
console.log(
  "✅ Керування групою"
);
console.log(
  "✅ Адміністратори"
);
console.log(
  "✅ Додавання/видалення учасників"
);
console.log(
  "✅ Перейменування групи"
);
console.log(
  "✅ Медіа та файли"
);
console.log(
  "✅ Mute / Unmute"
);
console.log(
  "✅ Block / Unblock"
);
console.log("");
console.log(
  "Backup:"
);
console.log(
  backup
);