import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  SPACE_MODULES,
  SPACE_SCALES,
  SPACE_TEMPLATES,
  buildDefaultNavigation,
  buildModules,
  mergeNavigationWithModules,
} from "../config/spaceTemplates";

import {
  buildRolePermissions,
} from "../config/spacePermissions";

import "./SpaceAdmin.css";

/* =========================================================
   HELPERS
========================================================= */

function cloneNavigation(
  value = []
) {
  return value.map(
    (section) => ({
      ...section,

      modules: [
        ...(section.modules ||
          []),
      ],
    })
  );
}

function normalizeUsername(
  value
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9._]/g,
      ""
    );
}

/* =========================================================
   SPACE ADMIN
========================================================= */

function SpaceAdmin({
  space,
  onSave,
  onExit,
}) {
  const coverRef =
    useRef(null);

  const avatarRef =
    useRef(null);

  const [
    section,
    setSection,
  ] = useState("general");

  const [
    draft,
    setDraft,
  ] = useState(() => ({
    ...space,

    enabledModules: [
      ...(space.enabledModules ||
        []),
    ],

    navigationLayout:
      cloneNavigation(
        space.navigationLayout ||
          []
      ),
  }));

  const [
    moduleSearch,
    setModuleSearch,
  ] = useState("");

  const [
    moduleFilter,
    setModuleFilter,
  ] = useState("active");

  const [
    saved,
    setSaved,
  ] = useState(true);

  const currentTemplate =
    SPACE_TEMPLATES.find(
      (template) =>
        template.id ===
        draft.templateId
    );

  const markChanged = (
    updater
  ) => {
    setDraft(
      (previous) => {
        const next =
          typeof updater ===
          "function"
            ? updater(
                previous
              )
            : {
                ...previous,
                ...updater,
              };

        return next;
      }
    );

    setSaved(false);
  };

  /* =======================================================
     IMAGE
  ======================================================= */

  const selectImage = (
    file,
    type
  ) => {
    if (!file) {
      return;
    }

    const field =
      type === "avatar"
        ? "avatar"
        : "cover";

    const blobField =
      `${field}Blob`;

    const urlField =
      `${field}Url`;

    if (
      draft[urlField]
    ) {
      URL.revokeObjectURL(
        draft[urlField]
      );
    }

    markChanged({
      [blobField]: file,

      [urlField]:
        URL.createObjectURL(
          file
        ),
    });
  };

  /* =======================================================
     TEMPLATE CHANGE
  ======================================================= */

  const changeTemplate = (
    templateId
  ) => {
    const template =
      SPACE_TEMPLATES.find(
        (item) =>
          item.id ===
          templateId
      );

    if (!template) {
      return;
    }

    markChanged(
      (previous) => {
        const recommended =
          buildModules(
            template,
            previous.scale
          );

        const mergedModules =
          Array.from(
            new Set([
              ...(previous.enabledModules ||
                []),

              ...recommended,
            ])
          );

        const templateNavigation =
          buildDefaultNavigation(
            template
          );

        const navigation =
          mergeNavigationWithModules(
            templateNavigation,
            mergedModules
          );

        const newRoles =
          Array.from(
            new Set([
              ...(previous.roles ||
                []),

              ...(template.roles ||
                []),
            ])
          );

        const defaults =
          buildRolePermissions(
            template.id,
            newRoles
          );

        return {
          ...previous,

          templateId:
            template.id,

          templateTitle:
            template.title,

          icon:
            template.icon,

          type:
            template.type ||
            template.id,

          subtype:
            template.subtype ||
            null,

          sensitive:
            Boolean(
              template.sensitive
            ),

          enabledModules:
            mergedModules,

          roles:
            newRoles,

          rolePermissions: {
            ...defaults,

            ...(previous.rolePermissions ||
              {}),
          },

          navigationLayout:
            navigation,
        };
      }
    );
  };

  /* =======================================================
     SCALE
  ======================================================= */

  const changeScale = (
    scale
  ) => {
    markChanged(
      (previous) => {
        const recommended =
          buildModules(
            currentTemplate,
            scale
          );

        const modules =
          Array.from(
            new Set([
              ...(previous.enabledModules ||
                []),
              ...recommended,
            ])
          );

        return {
          ...previous,
          scale,

          enabledModules:
            modules,

          navigationLayout:
            mergeNavigationWithModules(
              previous.navigationLayout ||
                buildDefaultNavigation(
                  currentTemplate
                ),
              modules
            ),
        };
      }
    );
  };

  /* =======================================================
     MODULES
  ======================================================= */

  const toggleModule = (
    moduleId
  ) => {
    markChanged(
      (previous) => {
        const active =
          previous.enabledModules.includes(
            moduleId
          );

        const enabledModules =
          active
            ? previous.enabledModules.filter(
                (id) =>
                  id !==
                  moduleId
              )
            : [
                ...previous.enabledModules,
                moduleId,
              ];

        return {
          ...previous,

          enabledModules,

          navigationLayout:
            mergeNavigationWithModules(
              previous.navigationLayout ||
                [],
              enabledModules
            ),
        };
      }
    );
  };

  const modules =
    useMemo(() => {
      const query =
        moduleSearch
          .trim()
          .toLowerCase();

      return Object.values(
        SPACE_MODULES
      ).filter(
        (module) => {
          const active =
            draft.enabledModules.includes(
              module.id
            );

          if (
            moduleFilter ===
              "active" &&
            !active
          ) {
            return false;
          }

          if (
            moduleFilter ===
              "available" &&
            active
          ) {
            return false;
          }

          if (
            moduleFilter ===
              "recommended" &&
            !currentTemplate?.modules?.includes(
              module.id
            )
          ) {
            return false;
          }

          return (
            !query ||
            `${module.title} ${module.description}`
              .toLowerCase()
              .includes(
                query
              )
          );
        }
      );
    }, [
      draft.enabledModules,
      moduleSearch,
      moduleFilter,
      currentTemplate,
    ]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const moveModule = (
    moduleId,
    sectionId,
    direction
  ) => {
    markChanged(
      (previous) => {
        const navigation =
          cloneNavigation(
            previous.navigationLayout ||
              []
          );

        const target =
          navigation.find(
            (item) =>
              item.id ===
              sectionId
          );

        if (!target) {
          return previous;
        }

        const index =
          target.modules.indexOf(
            moduleId
          );

        const nextIndex =
          index + direction;

        if (
          nextIndex < 0 ||
          nextIndex >=
            target.modules.length
        ) {
          return previous;
        }

        const copy = [
          ...target.modules,
        ];

        [
          copy[index],
          copy[nextIndex],
        ] = [
          copy[nextIndex],
          copy[index],
        ];

        target.modules =
          copy;

        return {
          ...previous,

          navigationLayout:
            navigation,
        };
      }
    );
  };

  const createSection =
    () => {
      const name =
        window.prompt(
          "Назва нового розділу"
        );

      if (
        !name?.trim()
      ) {
        return;
      }

      markChanged(
        (previous) => ({
          ...previous,

          navigationLayout: [
            ...(previous.navigationLayout ||
              []),

            {
              id:
                `section-${Date.now()}`,

              title:
                name.trim(),

              icon: "🧩",

              modules: [],
            },
          ],
        })
      );
    };

  const renameSection = (
    sectionId
  ) => {
    const section =
      draft.navigationLayout.find(
        (item) =>
          item.id ===
          sectionId
      );

    if (!section) {
      return;
    }

    const value =
      window.prompt(
        "Нова назва",
        section.title
      );

    if (
      !value?.trim()
    ) {
      return;
    }

    markChanged(
      (previous) => ({
        ...previous,

        navigationLayout:
          previous.navigationLayout.map(
            (item) =>
              item.id ===
              sectionId
                ? {
                    ...item,
                    title:
                      value.trim(),
                  }
                : item
          ),
      })
    );
  };

  const moveToSection = (
    moduleId,
    nextSectionId
  ) => {
    markChanged(
      (previous) => {
        const navigation =
          cloneNavigation(
            previous.navigationLayout
          );

        navigation.forEach(
          (section) => {
            section.modules =
              section.modules.filter(
                (id) =>
                  id !==
                  moduleId
              );
          }
        );

        const target =
          navigation.find(
            (section) =>
              section.id ===
              nextSectionId
          );

        if (target) {
          target.modules.push(
            moduleId
          );
        }

        return {
          ...previous,
          navigationLayout:
            navigation,
        };
      }
    );
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const save = async () => {
    const normalized = {
      ...draft,

      username:
        normalizeUsername(
          draft.username ||
            ""
        ),

      updatedAt:
        Date.now(),
    };

    await onSave(
      normalized
    );

    setDraft(
      normalized
    );

    setSaved(true);
  };

  /* =======================================================
     UI
  ======================================================= */

  const menu = [
    [
      "general",
      "Основне",
      "⚙️",
    ],

    [
      "appearance",
      "Оформлення",
      "🎨",
    ],

    [
      "type",
      "Тип і масштаб",
      "🧩",
    ],

    [
      "modules",
      "Модулі",
      "◫",
    ],

    [
      "navigation",
      "Навігація",
      "🗂️",
    ],

    [
      "privacy",
      "Приватність",
      "🔐",
    ],
  ];

  return (
    <div className="space-admin-studio">

      {/* HEADER */}

      <header className="space-admin-top">

        <div>

          <span>
            SPACE ADMIN STUDIO
          </span>

          <h2>
            Керування простором
          </h2>

        </div>

        <div className="space-admin-top-actions">

          {!saved && (
            <span className="space-admin-unsaved">
              ● Є незбережені зміни
            </span>
          )}

          <button
            className="space-admin-preview"
            onClick={
              onExit
            }
          >
            👁 Перегляд
          </button>

          <button
            className="space-admin-save"
            onClick={
              save
            }
            disabled={
              saved
            }
          >
            Зберегти
          </button>

        </div>

      </header>

      <div className="space-admin-layout">

        {/* SIDEBAR */}

        <aside className="space-admin-sidebar">

          <div className="space-admin-space-mini">

            <div>
              {draft.avatarUrl ? (
                <img
                  src={
                    draft.avatarUrl
                  }
                  alt=""
                />
              ) : (
                draft.icon
              )}
            </div>

            <section>

              <strong>
                {
                  draft.title
                }
              </strong>

              <span>
                @
                {
                  draft.username
                }
              </span>

            </section>

          </div>

          <span className="space-admin-sidebar-label">
            НАЛАШТУВАННЯ
          </span>

          {menu.map(
            ([
              id,
              title,
              icon,
            ]) => (
              <button
                key={id}
                className={
                  section === id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSection(
                    id
                  )
                }
              >

                <span>
                  {icon}
                </span>

                {title}

              </button>
            )
          )}

        </aside>

        {/* CONTENT */}

        <main className="space-admin-content">

          {/* =================================================
              GENERAL
          ================================================= */}

          {section ===
            "general" && (
            <>
              <AdminHeading
                eyebrow="ОСНОВНА ІНФОРМАЦІЯ"
                title="Основне"
                text="Змініть назву, адресу та опис простору."
              />

              <div className="space-admin-card">

                <AdminField
                  title="Назва простору"
                >
                  <input
                    value={
                      draft.title ||
                      ""
                    }
                    onChange={(event) =>
                      markChanged({
                        title:
                          event.target
                            .value,
                      })
                    }
                  />
                </AdminField>

                <AdminField
                  title="Адреса ЯТУТ"
                  hint="Латиниця, цифри, крапка та _"
                >
                  <div className="space-admin-username">

                    <span>
                      yatut.com/
                    </span>

                    <input
                      value={
                        draft.username ||
                        ""
                      }
                      onChange={(event) =>
                        markChanged({
                          username:
                            normalizeUsername(
                              event
                                .target
                                .value
                            ),
                        })
                      }
                    />

                  </div>
                </AdminField>

                <AdminField
                  title="Опис"
                >
                  <textarea
                    value={
                      draft.description ||
                      ""
                    }
                    onChange={(event) =>
                      markChanged({
                        description:
                          event.target
                            .value,
                      })
                    }
                  />
                </AdminField>

                <AdminField
                  title="Місто / країна"
                >
                  <input
                    value={
                      draft.city ||
                      ""
                    }
                    onChange={(event) =>
                      markChanged({
                        city:
                          event.target
                            .value,
                      })
                    }
                  />
                </AdminField>

              </div>
            </>
          )}

          {/* =================================================
              APPEARANCE
          ================================================= */}

          {section ===
            "appearance" && (
            <>
              <AdminHeading
                eyebrow="ВІЗУАЛЬНИЙ СТИЛЬ"
                title="Оформлення"
                text="Аватар та обкладинка вашого простору."
              />

              <input
                ref={
                  coverRef
                }
                hidden
                type="file"
                accept="image/*"
                onChange={(event) =>
                  selectImage(
                    event.target
                      .files?.[0],
                    "cover"
                  )
                }
              />

              <input
                ref={
                  avatarRef
                }
                hidden
                type="file"
                accept="image/*"
                onChange={(event) =>
                  selectImage(
                    event.target
                      .files?.[0],
                    "avatar"
                  )
                }
              />

              <div className="space-admin-card">

                <div className="space-admin-cover-editor">

                  {draft.coverUrl ? (
                    <img
                      src={
                        draft.coverUrl
                      }
                      alt=""
                    />
                  ) : (
                    <div className="space-admin-cover-placeholder">
                      {
                        draft.icon
                      }
                    </div>
                  )}

                  <button
                    onClick={() =>
                      coverRef.current?.click()
                    }
                  >
                    🖼 Змінити обкладинку
                  </button>

                </div>

                <div className="space-admin-avatar-editor">

                  <div>

                    {draft.avatarUrl ? (
                      <img
                        src={
                          draft.avatarUrl
                        }
                        alt=""
                      />
                    ) : (
                      <span>
                        {
                          draft.icon
                        }
                      </span>
                    )}

                  </div>

                  <section>

                    <strong>
                      Аватар простору
                    </strong>

                    <p>
                      Рекомендовано квадратне зображення.
                    </p>

                    <button
                      onClick={() =>
                        avatarRef.current?.click()
                      }
                    >
                      Змінити фото
                    </button>

                  </section>

                </div>

              </div>
            </>
          )}

          {/* =================================================
              TYPE
          ================================================= */}

          {section ===
            "type" && (
            <>
              <AdminHeading
                eyebrow="SPACE ENGINE"
                title="Тип і масштаб"
                text="Простір можна перетворити на інший тип без видалення старих даних."
              />

              <div className="space-admin-card">

                <AdminField
                  title="Тип простору"
                >
                  <select
                    value={
                      draft.templateId
                    }
                    onChange={(event) =>
                      changeTemplate(
                        event.target
                          .value
                      )
                    }
                  >

                    {SPACE_TEMPLATES.map(
                      (
                        template
                      ) => (
                        <option
                          key={
                            template.id
                          }
                          value={
                            template.id
                          }
                        >
                          {
                            template.icon
                          }{" "}
                          {
                            template.title
                          }
                        </option>
                      )
                    )}

                  </select>
                </AdminField>

                <div className="space-admin-template-info">

                  <span>
                    {
                      currentTemplate?.icon
                    }
                  </span>

                  <div>

                    <strong>
                      {
                        currentTemplate?.title
                      }
                    </strong>

                    <p>
                      {
                        currentTemplate?.description
                      }
                    </p>

                  </div>

                </div>

                <div className="space-admin-safe-migration">

                  <span>
                    ✓
                  </span>

                  <div>

                    <strong>
                      Безпечна зміна типу
                    </strong>

                    <p>
                      Поточні модулі та дані не видаляються. ЯТУТ лише додає рекомендовані можливості нового типу.
                    </p>

                  </div>

                </div>

                <div className="space-admin-scale-grid">

                  {SPACE_SCALES.map(
                    (item) => (
                      <button
                        key={
                          item.id
                        }
                        className={
                          draft.scale ===
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

              </div>
            </>
          )}

          {/* =================================================
              MODULES
          ================================================= */}

          {section ===
            "modules" && (
            <>
              <AdminHeading
                eyebrow="ФУНКЦІЇ ПРОСТОРУ"
                title="Модулі"
                text="Вмикайте лише ті функції, які потрібні вашій спільноті."
              />

              <div className="space-admin-modules-toolbar">

                <label>
                  🔎

                  <input
                    value={
                      moduleSearch
                    }
                    onChange={(event) =>
                      setModuleSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Знайти модуль"
                  />
                </label>

                <div>

                  {[
                    [
                      "active",
                      "Активні",
                    ],

                    [
                      "recommended",
                      "Рекомендовані",
                    ],

                    [
                      "available",
                      "Доступні",
                    ],

                    [
                      "all",
                      "Усі",
                    ],
                  ].map(
                    ([
                      id,
                      title,
                    ]) => (
                      <button
                        key={id}
                        className={
                          moduleFilter ===
                          id
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setModuleFilter(
                            id
                          )
                        }
                      >
                        {title}
                      </button>
                    )
                  )}

                </div>

              </div>

              <div className="space-admin-module-grid">

                {modules.map(
                  (module) => {
                    const active =
                      draft.enabledModules.includes(
                        module.id
                      );

                    return (
                      <button
                        key={
                          module.id
                        }
                        className={`space-admin-module-card ${
                          active
                            ? "active"
                            : ""
                        } ${
                          module.protected
                            ? "protected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleModule(
                            module.id
                          )
                        }
                      >

                        <div className="space-admin-module-icon">
                          {
                            module.icon
                          }
                        </div>

                        <section>

                          <strong>
                            {
                              module.title
                            }
                          </strong>

                          <p>
                            {
                              module.description
                            }
                          </p>

                        </section>

                        <span className="space-admin-module-check">
                          {active
                            ? "✓"
                            : "+"}
                        </span>

                        {module.protected && (
                          <small>
                            🔐 Захищено
                          </small>
                        )}

                      </button>
                    );
                  }
                )}

              </div>
            </>
          )}

          {/* =================================================
              NAVIGATION
          ================================================= */}

          {section ===
            "navigation" && (
            <>
              <AdminHeading
                eyebrow="СТРУКТУРА"
                title="Навігація"
                text="Розподіліть активні функції по зрозумілих розділах."
              />

              <div className="space-admin-navigation-actions">

                <p>
                  Так це меню будуть бачити користувачі простору.
                </p>

                <button
                  onClick={
                    createSection
                  }
                >
                  + Додати розділ
                </button>

              </div>

              <div className="space-admin-navigation">

                {(draft.navigationLayout ||
                  []).map(
                  (
                    navSection
                  ) => (
                    <section
                      className="space-admin-nav-section"
                      key={
                        navSection.id
                      }
                    >

                      <header>

                        <div>

                          <span>
                            {
                              navSection.icon
                            }
                          </span>

                          <strong>
                            {
                              navSection.title
                            }
                          </strong>

                        </div>

                        <button
                          onClick={() =>
                            renameSection(
                              navSection.id
                            )
                          }
                        >
                          ✏️
                        </button>

                      </header>

                      <div>

                        {navSection.modules.map(
                          (
                            moduleId,
                            index
                          ) => {
                            const module =
                              SPACE_MODULES[
                                moduleId
                              ];

                            if (
                              !module ||
                              !draft.enabledModules.includes(
                                moduleId
                              )
                            ) {
                              return null;
                            }

                            return (
                              <article
                                key={
                                  moduleId
                                }
                              >

                                <div className="space-admin-nav-module">

                                  <span>
                                    {
                                      module.icon
                                    }
                                  </span>

                                  <section>

                                    <strong>
                                      {
                                        module.title
                                      }
                                    </strong>

                                    <small>
                                      {
                                        module.description
                                      }
                                    </small>

                                  </section>

                                </div>

                                <div className="space-admin-nav-controls">

                                  <button
                                    disabled={
                                      index ===
                                      0
                                    }
                                    onClick={() =>
                                      moveModule(
                                        moduleId,
                                        navSection.id,
                                        -1
                                      )
                                    }
                                  >
                                    ↑
                                  </button>

                                  <button
                                    disabled={
                                      index ===
                                      navSection
                                        .modules
                                        .length -
                                        1
                                    }
                                    onClick={() =>
                                      moveModule(
                                        moduleId,
                                        navSection.id,
                                        1
                                      )
                                    }
                                  >
                                    ↓
                                  </button>

                                  <select
                                    value={
                                      navSection.id
                                    }
                                    onChange={(event) =>
                                      moveToSection(
                                        moduleId,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  >

                                    {draft.navigationLayout.map(
                                      (
                                        target
                                      ) => (
                                        <option
                                          key={
                                            target.id
                                          }
                                          value={
                                            target.id
                                          }
                                        >
                                          {
                                            target.title
                                          }
                                        </option>
                                      )
                                    )}

                                  </select>

                                </div>

                              </article>
                            );
                          }
                        )}

                        {!navSection
                          .modules
                          .length && (
                          <div className="space-admin-nav-empty">
                            Перенесіть сюди потрібні модулі
                          </div>
                        )}

                      </div>

                    </section>
                  )
                )}

              </div>
            </>
          )}

          {/* =================================================
              PRIVACY
          ================================================= */}

          {section ===
            "privacy" && (
            <>
              <AdminHeading
                eyebrow="ДОСТУП"
                title="Приватність"
                text="Визначте, хто може знайти та переглядати простір."
              />

              <div className="space-admin-card">

                {[
                  {
                    id: "public",
                    icon: "🌍",
                    title:
                      "Відкритий",
                    text:
                      "Простір бачать усі користувачі ЯТУТ.",
                  },

                  {
                    id: "private",
                    icon: "🔒",
                    title:
                      "Закритий",
                    text:
                      "Вступ після схвалення адміністратора.",
                  },

                  {
                    id: "hidden",
                    icon: "👁️",
                    title:
                      "Прихований",
                    text:
                      "Простір доступний лише за запрошенням.",
                  },
                ].map(
                  (item) => (
                    <button
                      key={
                        item.id
                      }
                      className={`space-admin-privacy-option ${
                        draft.visibility ===
                        item.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        markChanged({
                          visibility:
                            item.id,
                        })
                      }
                    >

                      <span>
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
                            item.text
                          }
                        </p>

                      </div>

                      <b>
                        {draft.visibility ===
                        item.id
                          ? "✓"
                          : ""}
                      </b>

                    </button>
                  )
                )}

                {draft.sensitive && (
                  <div className="space-admin-protected-notice">

                    <span>
                      🔐
                    </span>

                    <div>

                      <strong>
                        Захищені дані
                      </strong>

                      <p>
                        Чутливі дані мають окремі права доступу незалежно від загальної приватності простору.
                      </p>

                    </div>

                  </div>
                )}

              </div>
            </>
          )}

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function AdminHeading({
  eyebrow,
  title,
  text,
}) {
  return (
    <div className="space-admin-heading">

      <span>
        {eyebrow}
      </span>

      <h1>
        {title}
      </h1>

      <p>
        {text}
      </p>

    </div>
  );
}

function AdminField({
  title,
  hint,
  children,
}) {
  return (
    <label className="space-admin-field">

      <div>

        <strong>
          {title}
        </strong>

        {hint && (
          <span>
            {hint}
          </span>
        )}

      </div>

      {children}

    </label>
  );
}

export default SpaceAdmin;