import {
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import {
  resolve,
} from "node:path";

const chatsPath =
  resolve(
    process.cwd(),
    "src/components/Chats.jsx"
  );

const backupPath =
  resolve(
    process.cwd(),
    "src/components/Chats.before-social-cards.bak.jsx"
  );

if (
  !existsSync(
    chatsPath
  )
) {
  throw new Error(
    `Не знайдено файл: ${chatsPath}`
  );
}

let source =
  readFileSync(
    chatsPath,
    "utf8"
  );

/* =========================================================
   BACKUP
========================================================= */

if (
  !existsSync(
    backupPath
  )
) {
  copyFileSync(
    chatsPath,
    backupPath
  );

  console.log(
    "✅ Backup створено:",
    backupPath
  );
}

/* =========================================================
   CSS IMPORT
========================================================= */

const databaseImportEnd =
  `} from "../storage/database";`;

const cssImport =
  `import "../styles/chat-social-cards.css";`;

if (
  !source.includes(
    cssImport
  )
) {
  if (
    !source.includes(
      databaseImportEnd
    )
  ) {
    throw new Error(
      "Не знайдено import database у Chats.jsx"
    );
  }

  source =
    source.replace(
      databaseImportEnd,
      `${databaseImportEnd}

${cssImport}`
    );
}

/* =========================================================
   SOCIAL COMPONENT
========================================================= */

const messageMarker =
`/* =========================================================
   MESSAGE
========================================================= */

function MessageBubble({`;

const socialComponent =
`/* =========================================================
   SOCIAL MESSAGE CARDS
========================================================= */

function storyReplyBody(
  message
) {
  const text =
    String(
      message?.text ||
      ""
    );

  if (
    !message?.storyReply
  ) {
    return text;
  }

  return text
    .replace(
      /^↩\\s*Відповідь на історію\\s*/i,
      ""
    )
    .trim();
}

function openSocialMessageSource(
  message
) {
  try {
    if (
      message?.sharedPost
        ?.postId
    ) {
      const postId =
        message
          .sharedPost
          .postId;

      sessionStorage.setItem(
        "yatut-open-route-payload",
        JSON.stringify({
          postId,
          source:
            "chat-shared-post",
        })
      );

      window.location.hash =
        \`post=\${encodeURIComponent(
          postId
        )}\`;

      window.location.reload();

      return;
    }

    const storyId =
      message?.storyReply
        ?.storyId ||
      message?.storyReaction
        ?.storyId;

    if (
      storyId
    ) {
      sessionStorage.setItem(
        "yatut-open-route-payload",
        JSON.stringify({
          storyId,
          source:
            "chat-story",
        })
      );

      window.location.hash =
        \`story=\${encodeURIComponent(
          storyId
        )}\`;

      window.location.reload();
    }
  } catch (
    error
  ) {
    console.warn(
      "SOCIAL MESSAGE OPEN ERROR:",
      error
    );
  }
}

function SocialMessageCard({
  message,
}) {
  /* =======================================================
     SHARED POST
  ======================================================= */

  if (
    message?.sharedPost
  ) {
    const shared =
      message.sharedPost;

    const image =
      Array.isArray(
        shared.images
      )
        ? shared.images[0]
        : null;

    return (
      <button
        type="button"
        className="chat-social-card chat-shared-post-card"
        onClick={() =>
          openSocialMessageSource(
            message
          )
        }
      >
        <div className="chat-social-card-kicker">
          <span>
            Я
          </span>

          <strong>
            ПУБЛІКАЦІЯ ЯТУТ
          </strong>
        </div>

        {image && (
          <img
            className="chat-social-card-media"
            src={
              image
            }
            alt=""
          />
        )}

        <div className="chat-social-card-body">
          <strong>
            {shared.authorName ||
              "ЯТУТ"}
          </strong>

          <p>
            {shared.text ||
              "Відкрити публікацію"}
          </p>

          <span>
            Відкрити допис →
          </span>
        </div>
      </button>
    );
  }

  /* =======================================================
     STORY REPLY
  ======================================================= */

  if (
    message?.storyReply
  ) {
    const story =
      message.storyReply;

    const replyText =
      storyReplyBody(
        message
      );

    return (
      <div className="chat-story-message-wrap">
        <button
          type="button"
          className="chat-social-card chat-story-card"
          onClick={() =>
            openSocialMessageSource(
              message
            )
          }
        >
          {story.media ? (
            <img
              className="chat-story-card-media"
              src={
                story.media
              }
              alt=""
            />
          ) : (
            <div className="chat-story-card-placeholder">
              Я
            </div>
          )}

          <div className="chat-story-card-overlay" />

          <div className="chat-story-card-copy">
            <span>
              ІСТОРІЯ
            </span>

            <strong>
              {story.authorName ||
                "Користувач"}
            </strong>

            <small>
              {story.storyText ||
                story.preview ||
                "Відкрити історію"}
            </small>
          </div>
        </button>

        {replyText && (
          <div className="chat-story-reply-text">
            <span>
              Ваша відповідь
            </span>

            <p>
              {
                replyText
              }
            </p>
          </div>
        )}
      </div>
    );
  }

  /* =======================================================
     STORY REACTION
  ======================================================= */

  if (
    message?.storyReaction
  ) {
    const story =
      message.storyReaction;

    return (
      <button
        type="button"
        className="chat-social-card chat-story-reaction-card"
        onClick={() =>
          openSocialMessageSource(
            message
          )
        }
      >
        <div className="chat-story-reaction-preview">
          {story.media ? (
            <img
              src={
                story.media
              }
              alt=""
            />
          ) : (
            <span className="chat-story-reaction-placeholder">
              Я
            </span>
          )}

          <i>
            {story.emoji ||
              "💜"}
          </i>
        </div>

        <div className="chat-story-reaction-copy">
          <span>
            РЕАКЦІЯ НА ІСТОРІЮ
          </span>

          <strong>
            {story.authorName ||
              "Користувач"}
          </strong>

          <small>
            {story.storyText ||
              story.preview ||
              "Відкрити історію"}
          </small>
        </div>
      </button>
    );
  }

  return null;
}

/* =========================================================
   MESSAGE
========================================================= */

function MessageBubble({`;

if (
  !source.includes(
    "function SocialMessageCard("
  )
) {
  if (
    !source.includes(
      messageMarker
    )
  ) {
    throw new Error(
      "Не знайдено блок MessageBubble у Chats.jsx"
    );
  }

  source =
    source.replace(
      messageMarker,
      socialComponent
    );
}

/* =========================================================
   REPLACE RAW MESSAGE TEXT RENDER
========================================================= */

const oldTextBlock =
`          {message.text && (
            <p>
              {search ? (
                <>
                  {message.text}
                </>
              ) : (
                message.text
              )}
            </p>
          )}`;

const newTextBlock =
`          {(message.sharedPost ||
            message.storyReply ||
            message.storyReaction) && (
            <SocialMessageCard
              message={
                message
              }
            />
          )}

          {message.text &&
            !message.sharedPost &&
            !message.storyReply &&
            !message.storyReaction && (
              <p>
                {search ? (
                  <>
                    {
                      message.text
                    }
                  </>
                ) : (
                  message.text
                )}
              </p>
            )}`;

if (
  !source.includes(
    newTextBlock
  )
) {
  if (
    !source.includes(
      oldTextBlock
    )
  ) {
    throw new Error(
      [
        "Не знайдено старий блок message.text.",
        "Chats.jsx відрізняється від версії, яку ми робили.",
        "Файл НЕ змінено.",
      ].join(
        "\n"
      )
    );
  }

  source =
    source.replace(
      oldTextBlock,
      newTextBlock
    );
}

/* =========================================================
   SAVE
========================================================= */

writeFileSync(
  chatsPath,
  source,
  "utf8"
);

console.log("");
console.log(
  "✅ Chats.jsx оновлено."
);
console.log(
  "✅ Story Reply Card додано."
);
console.log(
  "✅ Story Reaction Card додано."
);
console.log(
  "✅ Shared Post Card додано."
);
console.log("");
console.log(
  "Backup:"
);
console.log(
  backupPath
);