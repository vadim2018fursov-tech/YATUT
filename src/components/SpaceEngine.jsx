import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  SPACE_MODULES,
  SPACE_SCALES,
  SPACE_TEMPLATES,
  buildModules,
} from "../config/spaceTemplates";

/* =========================================================
   CREATE SPACE
========================================================= */

export function CreateSpaceModal({
  onClose,
  onCreate,
}) {
  const coverRef =
    useRef(null);

  const avatarRef =
    useRef(null);

  const [
    step,
    setStep,
  ] = useState(1);

  const [
    templateId,
    setTemplateId,
  ] = useState(null);

  const [
    scale,
    setScale,
  ] = useState("small");

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    visibility,
    setVisibility,
  ] = useState("public");

  const [
    modules,
    setModules,
  ] = useState([]);

  const [
    avatar,
    setAvatar,
  ] = useState(null);

  const [
    cover,
    setCover,
  ] = useState(null);

  const template =
    SPACE_TEMPLATES.find(
      (item) =>
        item.id ===
        templateId
    );

  const groups =
    useMemo(() => {
      const result = {};

      SPACE_TEMPLATES.forEach(
        (item) => {
          const group =
            item.group ||
            "Інше";

          if (
            !result[group]
          ) {
            result[group] = [];
          }

          result[group].push(
            item
          );
        }
      );

      return result;
    }, []);

  const chooseTemplate =
    (id) => {
      const selected =
        SPACE_TEMPLATES.find(
          (item) =>
            item.id === id
        );

      if (!selected) {
        return;
      }

      setTemplateId(id);

      const nextScale =
        selected.defaultScale ||
        "small";

      setScale(nextScale);

      setModules(
        buildModules(
          selected,
          nextScale
        )
      );
    };

  const changeScale =
    (nextScale) => {
      setScale(nextScale);

      if (template) {
        setModules(
          buildModules(
            template,
            nextScale
          )
        );
      }
    };

  const toggleModule =
    (moduleId) => {
      setModules(
        (previous) =>
          previous.includes(
            moduleId
          )
            ? previous.filter(
                (id) =>
                  id !==
                  moduleId
              )
            : [
                ...previous,
                moduleId,
              ]
      );
    };

  const selectImage = (
    file,
    current,
    setter
  ) => {
    if (!file) {
      return;
    }

    if (
      current?.url
    ) {
      URL.revokeObjectURL(
        current.url
      );
    }

    setter({
      file,
      url:
        URL.createObjectURL(
          file
        ),
    });
  };

  const normalizedUsername =
    username
      .toLowerCase()
      .replace(
        /[^a-z0-9._]/g,
        ""
      );

  const canFinish =
    title.trim() &&
    normalizedUsername &&
    templateId;

  const finish = () => {
    if (
      !canFinish
    ) {
      return;
    }

    onCreate({
      templateId,

      type:
        template?.type ||
        template?.id,

      subtype:
        template?.subtype ||
        null,

      scale,

      title:
        title.trim(),

      username:
        normalizedUsername,

      description:
        description.trim(),

      city:
        city.trim(),

      visibility,

      enabledModules:
        modules,

      roles:
        template?.roles ||
        [],

      avatarBlob:
        avatar?.file ||
        null,

      coverBlob:
        cover?.file ||
        null,

      sensitive:
        Boolean(
          template?.sensitive
        ),
    });
  };

  return (
    <div
      className="space-engine-backdrop"
      onClick={
        onClose
      }
    >
      <section
        className="space-engine-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <header className="space-engine-header">

          <div>
            <span>
              ЯТУТ SPACE ENGINE
            </span>

            <h2>
              Створити простір
            </h2>
          </div>

          <div className="space-engine-progress">

            {[1, 2, 3, 4].map(
              (number) => (
                <span
                  key={
                    number
                  }
                  className={
                    step >=
                    number
                      ? "active"
                      : ""
                  }
                >
                  {number}
                </span>
              )
            )}

          </div>

          <button
            className="space-engine-close"
            onClick={
              onClose
            }
          >
            ×
          </button>

        </header>

        {/* =================================================
            STEP 1
        ================================================= */}

        {step === 1 && (
          <div className="space-engine-body">

            <div className="space-step-intro">

              <span>
                КРОК 1
              </span>

              <h3>
                Що ви хочете створити?
              </h3>

              <p>
                ЯТУТ автоматично підбере модулі, ролі та структуру.
              </p>

            </div>

            {Object.entries(
              groups
            ).map(
              ([
                group,
                items,
              ]) => (
                <section
                  className="space-template-section"
                  key={group}
                >

                  <h4>
                    {group}
                  </h4>

                  <div className="space-template-grid">

                    {items.map(
                      (item) => (
                        <button
                          key={
                            item.id
                          }
                          className={`space-template-card ${
                            templateId ===
                            item.id
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            chooseTemplate(
                              item.id
                            )
                          }
                        >

                          <span className="space-template-icon">
                            {
                              item.icon
                            }
                          </span>

                          <div>

                            <strong>
                              {
                                item.title
                              }
                            </strong>

                            <p>
                              {
                                item.description
                              }
                            </p>

                          </div>

                          <b>
                            {templateId ===
                            item.id
                              ? "✓"
                              : ""}
                          </b>

                        </button>
                      )
                    )}

                  </div>

                </section>
              )
            )}

          </div>
        )}

        {/* =================================================
            STEP 2
        ================================================= */}

        {step === 2 && (
          <div className="space-engine-body">

            <div className="space-step-intro">

              <span>
                КРОК 2
              </span>

              <h3>
                Масштаб і модулі
              </h3>

              <p>
                Оберіть приблизний масштаб та функції простору.
              </p>

            </div>

            <section className="space-scale-section">

              <h4>
                Масштаб
              </h4>

              <div className="space-scale-grid">

                {SPACE_SCALES.map(
                  (item) => (
                    <button
                      key={
                        item.id
                      }
                      className={
                        scale ===
                        item.id
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        changeScale(
                          item.id
                        )
                      }
                    >

                      <span>
                        {
                          item.icon
                        }
                      </span>

                      <strong>
                        {
                          item.title
                        }
                      </strong>

                      <small>
                        {
                          item.description
                        }
                      </small>

                    </button>
                  )
                )}

              </div>

              {scale ===
                "massive" && (
                <div className="space-massive-notice">

                  🌍 Для аудиторії 1 млн+ ЯТУТ автоматично додає розширену модерацію, аналітику та редакційні інструменти.

                </div>
              )}

            </section>

            <section className="space-modules-section">

              <div className="space-modules-header">

                <div>
                  <h4>
                    Модулі
                  </h4>

                  <p>
                    Можна змінити пізніше.
                  </p>
                </div>

                <strong>
                  {
                    modules.length
                  }
                </strong>

              </div>

              <div className="space-modules-grid">

                {Object.values(
                  SPACE_MODULES
                ).map(
                  (module) => {
                    const active =
                      modules.includes(
                        module.id
                      );

                    return (
                      <button
                        key={
                          module.id
                        }
                        className={
                          active
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          toggleModule(
                            module.id
                          )
                        }
                      >

                        <span>
                          {
                            module.icon
                          }
                        </span>

                        <strong>
                          {
                            module.title
                          }
                        </strong>

                        {module.sensitive && (
                          <small>
                            🔒
                          </small>
                        )}

                        <b>
                          {active
                            ? "✓"
                            : ""}
                        </b>

                      </button>
                    );
                  }
                )}

              </div>

            </section>

          </div>
        )}

        {/* =================================================
            STEP 3
        ================================================= */}

        {step === 3 && (
          <div className="space-engine-body">

            <div className="space-step-intro">

              <span>
                КРОК 3
              </span>

              <h3>
                Оформлення
              </h3>

              <p>
                Назва, адреса, фото та основна інформація.
              </p>

            </div>

            <input
              ref={coverRef}
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                selectImage(
                  event.target
                    .files?.[0],
                  cover,
                  setCover
                )
              }
            />

            <input
              ref={avatarRef}
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                selectImage(
                  event.target
                    .files?.[0],
                  avatar,
                  setAvatar
                )
              }
            />

            <div className="space-create-cover">

              {cover ? (
                <img
                  src={
                    cover.url
                  }
                  alt=""
                />
              ) : (
                <div>
                  🖼️
                </div>
              )}

              <button
                onClick={() =>
                  coverRef.current?.click()
                }
              >
                + Обкладинка
              </button>

            </div>

            <div className="space-avatar-row">

              <button
                className="space-create-avatar"
                onClick={() =>
                  avatarRef.current?.click()
                }
              >
                {avatar ? (
                  <img
                    src={
                      avatar.url
                    }
                    alt=""
                  />
                ) : (
                  <span>
                    {title
                      .trim()
                      ? title
                          .trim()[0]
                          .toUpperCase()
                      : template?.icon ||
                        "Я"}
                  </span>
                )}

                <b>
                  +
                </b>
              </button>

              <div>

                <strong>
                  {
                    template?.title
                  }
                </strong>

                <span>
                  {scale ===
                  "massive"
                    ? "Масовий простір"
                    : "Простір ЯТУТ"}
                </span>

              </div>

            </div>

            <label className="space-field">

              <span>
                Назва
              </span>

              <input
                autoFocus
                value={
                  title
                }
                onChange={(event) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                placeholder="Назва простору"
              />

            </label>

            <label className="space-field">

              <span>
                Адреса
              </span>

              <div className="space-username-input">

                <b>
                  yatut.com/
                </b>

                <input
                  value={
                    normalizedUsername
                  }
                  onChange={(event) =>
                    setUsername(
                      event.target
                        .value
                    )
                  }
                  placeholder="my-space"
                />

              </div>

            </label>

            <label className="space-field">

              <span>
                Опис
              </span>

              <textarea
                value={
                  description
                }
                onChange={(event) =>
                  setDescription(
                    event.target
                      .value
                  )
                }
                placeholder="Розкажіть про простір..."
              />

            </label>

            <div className="space-field-row">

              <label className="space-field">

                <span>
                  Місто / країна
                </span>

                <input
                  value={
                    city
                  }
                  onChange={(event) =>
                    setCity(
                      event.target
                        .value
                    )
                  }
                  placeholder="Київ"
                />

              </label>

              <label className="space-field">

                <span>
                  Доступ
                </span>

                <select
                  value={
                    visibility
                  }
                  onChange={(event) =>
                    setVisibility(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="public">
                    Відкритий
                  </option>

                  <option value="private">
                    Закритий
                  </option>

                  <option value="hidden">
                    Прихований
                  </option>
                </select>

              </label>

            </div>

            {template?.sensitive && (
              <div className="space-sensitive-warning">

                <span>
                  🔐
                </span>

                <div>

                  <strong>
                    Чутливі дані
                  </strong>

                  <p>
                    Медичні та персональні дані будуть відокремлені від звичайної публічної частини простору та матимуть окремі права доступу.
                  </p>

                </div>

              </div>
            )}

          </div>
        )}

        {/* =================================================
            STEP 4
        ================================================= */}

        {step === 4 && (
          <div className="space-engine-body">

            <div className="space-step-intro">

              <span>
                КРОК 4
              </span>

              <h3>
                Все готово
              </h3>

              <p>
                Перевірте структуру перед створенням.
              </p>

            </div>

            <section className="space-summary-card">

              <div className="space-summary-top">

                <div
                  className="space-summary-avatar"
                >
                  {avatar ? (
                    <img
                      src={
                        avatar.url
                      }
                      alt=""
                    />
                  ) : (
                    template?.icon
                  )}
                </div>

                <div>

                  <span>
                    {
                      template?.title
                    }
                  </span>

                  <h3>
                    {title ||
                      "Без назви"}
                  </h3>

                  <p>
                    @
                    {
                      normalizedUsername
                    }
                  </p>

                </div>

              </div>

              <div className="space-summary-stats">

                <div>
                  <strong>
                    {
                      modules.length
                    }
                  </strong>

                  <span>
                    модулів
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      template?.roles
                        ?.length ||
                      0
                    }
                  </strong>

                  <span>
                    ролей
                  </span>
                </div>

                <div>
                  <strong>
                    {
                      SPACE_SCALES.find(
                        (item) =>
                          item.id ===
                          scale
                      )?.title
                    }
                  </strong>

                  <span>
                    масштаб
                  </span>
                </div>

              </div>

              <div className="space-summary-modules">

                {modules.map(
                  (id) => {
                    const module =
                      SPACE_MODULES[
                        id
                      ];

                    if (!module) {
                      return null;
                    }

                    return (
                      <span
                        key={id}
                      >
                        {
                          module.icon
                        }{" "}
                        {
                          module.title
                        }
                      </span>
                    );
                  }
                )}

              </div>

            </section>

          </div>
        )}

        {/* FOOTER */}

        <footer className="space-engine-footer">

          <button
            className="space-engine-back"
            disabled={
              step === 1
            }
            onClick={() =>
              setStep(
                (value) =>
                  Math.max(
                    1,
                    value - 1
                  )
              )
            }
          >
            Назад
          </button>

          {step < 4 ? (
            <button
              className="space-engine-next"
              disabled={
                (step === 1 &&
                  !templateId) ||
                (step === 3 &&
                  (!title.trim() ||
                    !normalizedUsername))
              }
              onClick={() =>
                setStep(
                  (value) =>
                    Math.min(
                      4,
                      value + 1
                    )
                )
              }
            >
              Далі →
            </button>
          ) : (
            <button
              className="space-engine-create"
              disabled={
                !canFinish
              }
              onClick={
                finish
              }
            >
              Створити простір
            </button>
          )}

        </footer>

      </section>
    </div>
  );
}

/* =========================================================
   SPACE CARD
========================================================= */

export function SpaceCard({
  space,
  onOpen,
}) {
  return (
    <article className="space-card">

      <button
        className="space-card-cover"
        onClick={() =>
          onOpen?.(
            space
          )
        }
        style={
          space.coverUrl
            ? {
                backgroundImage: `url("${space.coverUrl}")`,
              }
            : {
                background:
                  space.cover ||
                  "linear-gradient(135deg,#635BFF,#FF4F8B)",
              }
        }
      />

      <div className="space-card-body">

        <div className="space-card-avatar">

          {space.avatarUrl ? (
            <img
              src={
                space.avatarUrl
              }
              alt=""
            />
          ) : (
            <span>
              {space.icon ||
                space.title?.[0] ||
                "Я"}
            </span>
          )}

        </div>

        <span className="space-card-type">
          {
            space.templateTitle
          }
        </span>

        <button
          className="space-card-title"
          onClick={() =>
            onOpen?.(
              space
            )
          }
        >
          {
            space.title
          }
        </button>

        <span className="space-card-handle">
          @
          {
            space.username
          }
        </span>

        <p>
          {
            space.description
          }
        </p>

        <div className="space-card-meta">

          <span>
            👥{" "}
            {
              space.memberCount ||
              1
            }
          </span>

          <span>
            ⚙️{" "}
            {
              space.enabledModules
                ?.length ||
              0
            }{" "}
            модулів
          </span>

          {space.scale ===
            "massive" && (
            <span>
              🌍 1M+
            </span>
          )}

        </div>

      </div>

    </article>
  );
}