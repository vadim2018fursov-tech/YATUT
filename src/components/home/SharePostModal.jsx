import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Copy,
  ExternalLink,
  Search,
  Send,
  Users,
  UserRound,
  X,
} from "lucide-react";

import {
  getChats,
  saveChat,
  saveMessage,
} from "../../storage/database";

import "../../styles/share-post.css";

const FRIENDS = [
  {
    id: "maria",
    name: "Марія Коваль",
    username: "maria.koval",
    initials: "М",
    online: true,
  },
  {
    id: "oleksandr",
    name: "Олександр Бондар",
    username: "bondar",
    initials: "О",
    online: true,
  },
  {
    id: "anastasia",
    name: "Анастасія Мельник",
    username: "nastia",
    initials: "А",
    online: false,
  },
  {
    id: "max",
    name: "Максим Шевченко",
    username: "max.sh",
    initials: "М",
    online: false,
  },
  {
    id: "sofia",
    name: "Софія Романенко",
    username: "sofia.r",
    initials: "С",
    online: true,
  },
  {
    id: "vlad",
    name: "Владислав Мороз",
    username: "vlad.moroz",
    initials: "В",
    online: false,
  },
  {
    id: "yulia",
    name: "Юлія Савченко",
    username: "yulia.s",
    initials: "Ю",
    online: true,
  },
];

const COMMUNITIES = [
  {
    id: "kyiv-community",
    name: "Київ · ЯТУТ",
    subtitle: "Міська спільнота",
    initials: "К",
    members: "24,8 тис.",
  },
  {
    id: "creative-community",
    name: "Творчі люди України",
    subtitle: "Творчість",
    initials: "Т",
    members: "18,2 тис.",
  },
  {
    id: "business-community",
    name: "Бізнес Києва",
    subtitle: "Бізнес",
    initials: "Б",
    members: "9,6 тис.",
  },
];

function createId(
  prefix = "share"
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function postPreviewText(
  post
) {
  const text =
    String(
      post?.text || ""
    ).trim();

  if (text) {
    return text.length > 110
      ? `${text.slice(0, 110)}…`
      : text;
  }

  if (
    Array.isArray(
      post?.images
    ) &&
    post.images.length
  ) {
    return "Фото у ЯТУТ";
  }

  return "Публікація у ЯТУТ";
}

function PersonAvatar({
  person,
  square = false,
}) {
  return (
    <div
      className={`yatut-share-avatar ${
        square
          ? "is-square"
          : ""
      }`}
    >
      {person.initials ||
        person.name?.[0] ||
        "Я"}

      {person.online && (
        <span className="yatut-share-online" />
      )}
    </div>
  );
}

function SendButton({
  sent,
  loading,
  onClick,
  label = "Надіслати",
}) {
  return (
    <button
      type="button"
      className={`yatut-share-send ${
        sent
          ? "is-sent"
          : ""
      }`}
      disabled={
        sent ||
        loading
      }
      onClick={
        onClick
      }
    >
      {sent ? (
        <>
          <Check
            size={15}
          />

          Надіслано
        </>
      ) : (
        <>
          <Send
            size={15}
          />

          {loading
            ? "..."
            : label}
        </>
      )}
    </button>
  );
}

function SharePostModal({
  post,
  onClose,
  onShared,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "friends"
  );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    groups,
    setGroups,
  ] = useState([]);

  const [
    groupsLoading,
    setGroupsLoading,
  ] = useState(true);

  const [
    sendingId,
    setSendingId,
  ] = useState(null);

  const [
    sentIds,
    setSentIds,
  ] = useState([]);

  const [
    copied,
    setCopied,
  ] = useState(false);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        const chats =
          await getChats();

        if (
          cancelled
        ) {
          return;
        }

        setGroups(
          chats.filter(
            (chat) =>
              chat.type ===
              "group"
          )
        );
      } catch (
        error
      ) {
        console.warn(
          "SHARE GROUP LOAD ERROR:",
          error
        );
      } finally {
        if (
          !cancelled
        ) {
          setGroupsLoading(
            false
          );
        }
      }
    }

    load();

    return () => {
      cancelled =
        true;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose?.();
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );

      document.body.style.overflow =
        previous;
    };
  }, [onClose]);

  const shareUrl =
    `${window.location.origin}${window.location.pathname}#post=${encodeURIComponent(
      post.id
    )}`;

  const preview =
    postPreviewText(
      post
    );

  const filteredFriends =
    useMemo(() => {
      const value =
        query
          .trim()
          .toLowerCase();

      if (!value) {
        return FRIENDS;
      }

      return FRIENDS.filter(
        (person) =>
          person.name
            .toLowerCase()
            .includes(
              value
            ) ||
          person.username
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [query]);

  const filteredGroups =
    useMemo(() => {
      const value =
        query
          .trim()
          .toLowerCase();

      if (!value) {
        return groups;
      }

      return groups.filter(
        (group) =>
          String(
            group.title ||
              ""
          )
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [
      groups,
      query,
    ]);

  const filteredCommunities =
    useMemo(() => {
      const value =
        query
          .trim()
          .toLowerCase();

      if (!value) {
        return COMMUNITIES;
      }

      return COMMUNITIES.filter(
        (community) =>
          community.name
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [query]);

  async function sendToFriend(
    person
  ) {
    if (
      sendingId ||
      sentIds.includes(
        person.id
      )
    ) {
      return;
    }

    setSendingId(
      person.id
    );

    try {
      const chats =
        await getChats();

      let chat =
        chats.find(
          (item) =>
            item.type !==
              "group" &&
            item.personId ===
              person.id
        );

      if (!chat) {
        chat = {
          id:
            `chat-${person.id}`,

          type:
            "direct",

          personId:
            person.id,

          updatedAt:
            Date.now(),

          unread: 0,

          lastMessage:
            "Публікація з ЯТУТ",
        };

        await saveChat(
          chat
        );
      }

      const message = {
        id:
          createId(
            "shared-post"
          ),

        chatId:
          chat.id,

        senderId:
          "me",

        type:
          "text",

        text:
          `↗ ${preview}\n${shareUrl}`,

        createdAt:
          Date.now(),

        pinned:
          false,

        myReaction:
          null,

        replyTo:
          null,

        sharedPost: {
          postId:
            post.id,

          authorName:
            post.authorName ||
            "ЯТУТ",

          text:
            post.text ||
            "",

          images:
            Array.isArray(
              post.images
            )
              ? post.images
              : [],

          url:
            shareUrl,
        },
      };

      await saveMessage(
        message
      );

      await saveChat({
        ...chat,

        updatedAt:
          Date.now(),

        unread: 0,

        lastMessage:
          `↗ ${preview}`,
      });

      setSentIds(
        (previous) => [
          ...new Set([
            ...previous,
            person.id,
          ]),
        ]
      );

      onShared?.();
    } catch (
      error
    ) {
      console.error(
        "SHARE TO FRIEND ERROR:",
        error
      );
    } finally {
      setSendingId(
        null
      );
    }
  }

  async function sendToGroup(
    group
  ) {
    if (
      sendingId ||
      sentIds.includes(
        group.id
      )
    ) {
      return;
    }

    setSendingId(
      group.id
    );

    try {
      const message = {
        id:
          createId(
            "shared-post"
          ),

        chatId:
          group.id,

        senderId:
          "me",

        type:
          "text",

        text:
          `↗ ${preview}\n${shareUrl}`,

        createdAt:
          Date.now(),

        pinned:
          false,

        myReaction:
          null,

        replyTo:
          null,

        sharedPost: {
          postId:
            post.id,

          authorName:
            post.authorName ||
            "ЯТУТ",

          text:
            post.text ||
            "",

          images:
            Array.isArray(
              post.images
            )
              ? post.images
              : [],

          url:
            shareUrl,
        },
      };

      await saveMessage(
        message
      );

      await saveChat({
        ...group,

        updatedAt:
          Date.now(),

        unread: 0,

        lastMessage:
          `↗ ${preview}`,
      });

      setSentIds(
        (previous) => [
          ...new Set([
            ...previous,
            group.id,
          ]),
        ]
      );

      onShared?.();
    } catch (
      error
    ) {
      console.error(
        "SHARE TO GROUP ERROR:",
        error
      );
    } finally {
      setSendingId(
        null
      );
    }
  }

  function shareToCommunity(
    community
  ) {
    try {
      sessionStorage.setItem(
        "yatut-share-to-community",
        JSON.stringify({
          postId:
            post.id,

          communityId:
            community.id,

          communityName:
            community.name,

          text:
            post.text ||
            "",

          images:
            post.images ||
            [],

          url:
            shareUrl,
        })
      );

      setSentIds(
        (previous) => [
          ...new Set([
            ...previous,
            community.id,
          ]),
        ]
      );

      onShared?.();
    } catch (
      error
    ) {
      console.warn(
        "SHARE COMMUNITY ERROR:",
        error
      );
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(
        true
      );

      setTimeout(
        () =>
          setCopied(
            false
          ),
        1500
      );
    } catch {
      window.prompt(
        "Скопіюйте посилання:",
        shareUrl
      );
    }
  }

  async function otherApps() {
    try {
      if (
        typeof navigator.share ===
        "function"
      ) {
        await navigator.share({
          title:
            "ЯТУТ",

          text:
            preview,

          url:
            shareUrl,
        });

        onShared?.();
      } else {
        await copyLink();
      }
    } catch (
      error
    ) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.warn(
          "SYSTEM SHARE ERROR:",
          error
        );
      }
    }
  }

  const quickFriends =
    FRIENDS.slice(
      0,
      5
    );

  return (
    <div
      className="yatut-share-overlay"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <section
        className="yatut-share-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Поширити публікацію"
      >
        <header className="yatut-share-sheet-header">
          <div>
            <span className="yatut-share-kicker">
              ЯТУТ
            </span>

            <h2>
              Поширити
            </h2>
          </div>

          <button
            type="button"
            className="yatut-share-close"
            onClick={
              onClose
            }
            aria-label="Закрити"
          >
            <X
              size={20}
            />
          </button>
        </header>

        <div className="yatut-share-post-preview">
          <div className="yatut-share-brand">
            Я
          </div>

          <div className="yatut-share-post-copy">
            <strong>
              {post.authorName ||
                "ЯТУТ"}
            </strong>

            <p>
              {preview}
            </p>
          </div>

          {post.images?.[0] && (
            <img
              className="yatut-share-post-image"
              src={
                post.images[0]
              }
              alt=""
            />
          )}
        </div>

        <div className="yatut-share-quick">
          <div className="yatut-share-section-head">
            <strong>
              Швидко надіслати
            </strong>

            <span>
              Друзі онлайн
            </span>
          </div>

          <div className="yatut-share-quick-list">
            {quickFriends.map(
              (person) => {
                const sent =
                  sentIds.includes(
                    person.id
                  );

                return (
                  <button
                    key={
                      person.id
                    }
                    type="button"
                    className={`yatut-share-quick-person ${
                      sent
                        ? "is-sent"
                        : ""
                    }`}
                    onClick={() =>
                      sendToFriend(
                        person
                      )
                    }
                    disabled={
                      sendingId ===
                        person.id ||
                      sent
                    }
                  >
                    <PersonAvatar
                      person={
                        person
                      }
                    />

                    <span>
                      {
                        person.name.split(
                          " "
                        )[0]
                      }
                    </span>

                    {sent && (
                      <i className="yatut-share-quick-check">
                        <Check
                          size={11}
                        />
                      </i>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        <div className="yatut-share-tabs">
          <button
            type="button"
            className={
              activeTab ===
              "friends"
                ? "is-active"
                : ""
            }
            onClick={() => {
              setActiveTab(
                "friends"
              );
              setQuery("");
            }}
          >
            <UserRound
              size={16}
            />
            Друзі
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "groups"
                ? "is-active"
                : ""
            }
            onClick={() => {
              setActiveTab(
                "groups"
              );
              setQuery("");
            }}
          >
            <Users
              size={16}
            />
            Групи
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "communities"
                ? "is-active"
                : ""
            }
            onClick={() => {
              setActiveTab(
                "communities"
              );
              setQuery("");
            }}
          >
            <span className="yatut-share-community-icon">
              Я
            </span>

            Спільноти
          </button>
        </div>

        <label className="yatut-share-search">
          <Search
            size={17}
          />

          <input
            type="text"
            value={
              query
            }
            onChange={(
              event
            ) =>
              setQuery(
                event.target
                  .value
              )
            }
            placeholder={
              activeTab ===
              "friends"
                ? "Знайти друга"
                : activeTab ===
                    "groups"
                  ? "Знайти групу"
                  : "Знайти спільноту"
            }
          />
        </label>

        <div className="yatut-share-recipients">
          {activeTab ===
            "friends" &&
            filteredFriends.map(
              (person) => (
                <div
                  className="yatut-share-recipient"
                  key={
                    person.id
                  }
                >
                  <PersonAvatar
                    person={
                      person
                    }
                  />

                  <div className="yatut-share-recipient-copy">
                    <strong>
                      {
                        person.name
                      }
                    </strong>

                    <span>
                      {person.online
                        ? "Онлайн"
                        : `@${person.username}`}
                    </span>
                  </div>

                  <SendButton
                    sent={
                      sentIds.includes(
                        person.id
                      )
                    }
                    loading={
                      sendingId ===
                      person.id
                    }
                    onClick={() =>
                      sendToFriend(
                        person
                      )
                    }
                  />
                </div>
              )
            )}

          {activeTab ===
            "groups" &&
            (groupsLoading ? (
              <div className="yatut-share-empty">
                Завантажуємо групи…
              </div>
            ) : filteredGroups.length ? (
              filteredGroups.map(
                (group) => (
                  <div
                    className="yatut-share-recipient"
                    key={
                      group.id
                    }
                  >
                    <PersonAvatar
                      square
                      person={{
                        initials:
                          group.initials ||
                          group.title?.[0] ||
                          "Г",
                      }}
                    />

                    <div className="yatut-share-recipient-copy">
                      <strong>
                        {group.title ||
                          "Група"}
                      </strong>

                      <span>
                        Груповий чат
                      </span>
                    </div>

                    <SendButton
                      sent={
                        sentIds.includes(
                          group.id
                        )
                      }
                      loading={
                        sendingId ===
                        group.id
                      }
                      onClick={() =>
                        sendToGroup(
                          group
                        )
                      }
                    />
                  </div>
                )
              )
            ) : (
              <div className="yatut-share-empty">
                <Users
                  size={28}
                />

                <strong>
                  Груп поки немає
                </strong>

                <span>
                  Створи груповий чат у Повідомленнях.
                </span>
              </div>
            ))}

          {activeTab ===
            "communities" &&
            filteredCommunities.map(
              (
                community
              ) => (
                <div
                  className="yatut-share-recipient"
                  key={
                    community.id
                  }
                >
                  <PersonAvatar
                    square
                    person={
                      community
                    }
                  />

                  <div className="yatut-share-recipient-copy">
                    <strong>
                      {
                        community.name
                      }
                    </strong>

                    <span>
                      {
                        community.members
                      }{" "}
                      учасників
                    </span>
                  </div>

                  <SendButton
                    label="Поширити"
                    sent={
                      sentIds.includes(
                        community.id
                      )
                    }
                    loading={
                      false
                    }
                    onClick={() =>
                      shareToCommunity(
                        community
                      )
                    }
                  />
                </div>
              )
            )}
        </div>

        <footer className="yatut-share-actions">
          <button
            type="button"
            onClick={
              copyLink
            }
          >
            <span>
              {copied ? (
                <Check
                  size={18}
                />
              ) : (
                <Copy
                  size={18}
                />
              )}
            </span>

            <div>
              <strong>
                {copied
                  ? "Скопійовано"
                  : "Копіювати посилання"}
              </strong>

              <small>
                Посилання на публікацію
              </small>
            </div>
          </button>

          <button
            type="button"
            onClick={
              otherApps
            }
          >
            <span>
              <ExternalLink
                size={18}
              />
            </span>

            <div>
              <strong>
                Інші застосунки
              </strong>

              <small>
                Telegram, Viber та інші
              </small>
            </div>
          </button>
        </footer>
      </section>
    </div>
  );
}

export default SharePostModal;