/* =========================================================
   YATUT FRIEND SERVICE V1

   Единое локальное состояние дружбы.

   Сейчас:
   - хранится в localStorage
   - синхронизируется между компонентами
   - принимает / отклоняет заявки
   - отправляет заявки
   - удаляет из друзей
   - хранит входящие и исходящие заявки

   Позже этот API можно подключить к backend.
========================================================= */

const STORAGE_KEY =
  "yatut-friends-v1";

const CHANGE_EVENT =
  "yatut:friends-changed";

/* =========================================================
   RELATION STATUSES
========================================================= */

export const FRIEND_STATUSES = {
  NONE: "none",

  FRIEND: "friend",

  INCOMING:
    "incoming",

  OUTGOING:
    "outgoing",
};

/* =========================================================
   DEMO INITIAL STATE
========================================================= */

const DEFAULT_STATE = {
  version: 1,

  friends: [
    "maria",
    "oleksandr",
    "sofia",
    "yulia",
  ],

  incomingRequests: [
    {
      personId:
        "anastasia",

      createdAt:
        Date.now() -
        4 *
          60 *
          1000,
    },
  ],

  outgoingRequests: [],

  updatedAt:
    Date.now(),
};

/* =========================================================
   HELPERS
========================================================= */

function cloneState(
  state
) {
  return {
    version:
      Number(
        state?.version ||
          1
      ),

    friends:
      Array.isArray(
        state?.friends
      )
        ? [
            ...state.friends,
          ]
        : [],

    incomingRequests:
      Array.isArray(
        state?.incomingRequests
      )
        ? state.incomingRequests.map(
            (
              request
            ) => ({
              ...request,
            })
          )
        : [],

    outgoingRequests:
      Array.isArray(
        state?.outgoingRequests
      )
        ? state.outgoingRequests.map(
            (
              request
            ) => ({
              ...request,
            })
          )
        : [],

    updatedAt:
      Number(
        state?.updatedAt ||
          Date.now()
      ),
  };
}

function normalizeIds(
  values
) {
  return [
    ...new Set(
      (
        Array.isArray(
          values
        )
          ? values
          : []
      )
        .map(
          (
            value
          ) =>
            String(
              value ||
                ""
            ).trim()
        )
        .filter(
          Boolean
        )
    ),
  ];
}

function normalizeRequests(
  requests
) {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  const seen =
    new Set();

  return requests
    .map(
      (
        request
      ) => {
        const personId =
          String(
            request?.personId ||
              ""
          ).trim();

        if (
          !personId ||
          seen.has(
            personId
          )
        ) {
          return null;
        }

        seen.add(
          personId
        );

        return {
          personId,

          createdAt:
            Number(
              request?.createdAt ||
                Date.now()
            ),
        };
      }
    )
    .filter(
      Boolean
    );
}

function normalizeState(
  state
) {
  const friends =
    normalizeIds(
      state?.friends
    );

  const friendSet =
    new Set(
      friends
    );

  const incomingRequests =
    normalizeRequests(
      state?.incomingRequests
    ).filter(
      (
        request
      ) =>
        !friendSet.has(
          request.personId
        )
    );

  const incomingSet =
    new Set(
      incomingRequests.map(
        (
          request
        ) =>
          request.personId
      )
    );

  const outgoingRequests =
    normalizeRequests(
      state?.outgoingRequests
    ).filter(
      (
        request
      ) =>
        !friendSet.has(
          request.personId
        ) &&
        !incomingSet.has(
          request.personId
        )
    );

  return {
    version: 1,

    friends,

    incomingRequests,

    outgoingRequests,

    updatedAt:
      Date.now(),
  };
}

/* =========================================================
   EMIT CHANGE
========================================================= */

function emitChange(
  state
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      CHANGE_EVENT,
      {
        detail: {
          state:
            cloneState(
              state
            ),
        },
      }
    )
  );
}

/* =========================================================
   SAVE
========================================================= */

function saveState(
  state
) {
  const normalized =
    normalizeState(
      state
    );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );
  } catch (error) {
    console.warn(
      "FRIEND SERVICE SAVE ERROR:",
      error
    );
  }

  emitChange(
    normalized
  );

  return cloneState(
    normalized
  );
}

/* =========================================================
   GET STATE
========================================================= */

export function getFriendState() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return saveState(
        cloneState(
          DEFAULT_STATE
        )
      );
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return saveState(
        cloneState(
          DEFAULT_STATE
        )
      );
    }

    return cloneState(
      normalizeState(
        parsed
      )
    );
  } catch (error) {
    console.warn(
      "FRIEND SERVICE LOAD ERROR:",
      error
    );

    return saveState(
      cloneState(
        DEFAULT_STATE
      )
    );
  }
}

/* =========================================================
   GET FRIEND IDS
========================================================= */

export function getFriendIds() {
  return [
    ...getFriendState()
      .friends,
  ];
}

/* =========================================================
   GET INCOMING REQUESTS
========================================================= */

export function getIncomingFriendRequests() {
  return getFriendState()
    .incomingRequests
    .map(
      (
        request
      ) => ({
        ...request,
      })
    );
}

/* =========================================================
   GET OUTGOING REQUESTS
========================================================= */

export function getOutgoingFriendRequests() {
  return getFriendState()
    .outgoingRequests
    .map(
      (
        request
      ) => ({
        ...request,
      })
    );
}

/* =========================================================
   IS FRIEND
========================================================= */

export function isFriend(
  personId
) {
  if (!personId) {
    return false;
  }

  return getFriendState()
    .friends
    .includes(
      personId
    );
}

/* =========================================================
   HAS INCOMING REQUEST
========================================================= */

export function hasIncomingFriendRequest(
  personId
) {
  if (!personId) {
    return false;
  }

  return getFriendState()
    .incomingRequests
    .some(
      (
        request
      ) =>
        request.personId ===
        personId
    );
}

/* =========================================================
   HAS OUTGOING REQUEST
========================================================= */

export function hasOutgoingFriendRequest(
  personId
) {
  if (!personId) {
    return false;
  }

  return getFriendState()
    .outgoingRequests
    .some(
      (
        request
      ) =>
        request.personId ===
        personId
    );
}

/* =========================================================
   GET RELATION STATUS
========================================================= */

export function getFriendStatus(
  personId
) {
  if (!personId) {
    return FRIEND_STATUSES.NONE;
  }

  const state =
    getFriendState();

  if (
    state.friends.includes(
      personId
    )
  ) {
    return FRIEND_STATUSES.FRIEND;
  }

  if (
    state.incomingRequests.some(
      (
        request
      ) =>
        request.personId ===
        personId
    )
  ) {
    return FRIEND_STATUSES.INCOMING;
  }

  if (
    state.outgoingRequests.some(
      (
        request
      ) =>
        request.personId ===
        personId
    )
  ) {
    return FRIEND_STATUSES.OUTGOING;
  }

  return FRIEND_STATUSES.NONE;
}

/* =========================================================
   ADD FRIEND DIRECTLY
========================================================= */

export function addFriend(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  const state =
    getFriendState();

  if (
    state.friends.includes(
      personId
    )
  ) {
    return state;
  }

  return saveState({
    ...state,

    friends: [
      ...state.friends,
      personId,
    ],

    incomingRequests:
      state.incomingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),

    outgoingRequests:
      state.outgoingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),
  });
}

/* =========================================================
   REMOVE FRIEND
========================================================= */

export function removeFriend(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  const state =
    getFriendState();

  return saveState({
    ...state,

    friends:
      state.friends.filter(
        (
          id
        ) =>
          id !==
          personId
      ),
  });
}

/* =========================================================
   TOGGLE FRIEND

   Удобно для локальных карточек.
========================================================= */

export function toggleFriend(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  if (
    isFriend(
      personId
    )
  ) {
    return removeFriend(
      personId
    );
  }

  return addFriend(
    personId
  );
}

/* =========================================================
   RECEIVE FRIEND REQUEST
========================================================= */

export function receiveFriendRequest(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  const state =
    getFriendState();

  if (
    state.friends.includes(
      personId
    ) ||
    state.incomingRequests.some(
      (
        request
      ) =>
        request.personId ===
        personId
    )
  ) {
    return state;
  }

  return saveState({
    ...state,

    incomingRequests: [
      {
        personId,

        createdAt:
          Date.now(),
      },

      ...state.incomingRequests,
    ],

    outgoingRequests:
      state.outgoingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),
  });
}

/* =========================================================
   ACCEPT INCOMING REQUEST
========================================================= */

export function acceptIncomingFriendRequest(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  const state =
    getFriendState();

  return saveState({
    ...state,

    friends:
      state.friends.includes(
        personId
      )
        ? state.friends
        : [
            ...state.friends,
            personId,
          ],

    incomingRequests:
      state.incomingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),

    outgoingRequests:
      state.outgoingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),
  });
}

/* =========================================================
   DECLINE INCOMING REQUEST
========================================================= */

export function declineIncomingFriendRequest(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  const state =
    getFriendState();

  return saveState({
    ...state,

    incomingRequests:
      state.incomingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),
  });
}

/* =========================================================
   SEND FRIEND REQUEST
========================================================= */

export function sendFriendRequest(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  const state =
    getFriendState();

  if (
    state.friends.includes(
      personId
    )
  ) {
    return state;
  }

  if (
    state.incomingRequests.some(
      (
        request
      ) =>
        request.personId ===
        personId
    )
  ) {
    return acceptIncomingFriendRequest(
      personId
    );
  }

  if (
    state.outgoingRequests.some(
      (
        request
      ) =>
        request.personId ===
        personId
    )
  ) {
    return state;
  }

  return saveState({
    ...state,

    outgoingRequests: [
      {
        personId,

        createdAt:
          Date.now(),
      },

      ...state.outgoingRequests,
    ],
  });
}

/* =========================================================
   CANCEL OUTGOING REQUEST
========================================================= */

export function cancelFriendRequest(
  personId
) {
  if (!personId) {
    return getFriendState();
  }

  const state =
    getFriendState();

  return saveState({
    ...state,

    outgoingRequests:
      state.outgoingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),
  });
}

/* =========================================================
   SET FRIEND STATUS

   Универсальный метод для будущего backend.
========================================================= */

export function setFriendStatus(
  personId,
  status
) {
  if (!personId) {
    return getFriendState();
  }

  const current =
    getFriendState();

  const clean = {
    ...current,

    friends:
      current.friends.filter(
        (
          id
        ) =>
          id !==
          personId
      ),

    incomingRequests:
      current.incomingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),

    outgoingRequests:
      current.outgoingRequests.filter(
        (
          request
        ) =>
          request.personId !==
          personId
      ),
  };

  switch (
    status
  ) {
    case FRIEND_STATUSES.FRIEND:
      clean.friends = [
        ...clean.friends,
        personId,
      ];

      break;

    case FRIEND_STATUSES.INCOMING:
      clean.incomingRequests = [
        {
          personId,

          createdAt:
            Date.now(),
        },

        ...clean.incomingRequests,
      ];

      break;

    case FRIEND_STATUSES.OUTGOING:
      clean.outgoingRequests = [
        {
          personId,

          createdAt:
            Date.now(),
        },

        ...clean.outgoingRequests,
      ];

      break;

    default:
      break;
  }

  return saveState(
    clean
  );
}

/* =========================================================
   COUNTS
========================================================= */

export function getFriendCount() {
  return getFriendState()
    .friends.length;
}

export function getIncomingRequestCount() {
  return getFriendState()
    .incomingRequests.length;
}

export function getOutgoingRequestCount() {
  return getFriendState()
    .outgoingRequests.length;
}

/* =========================================================
   SUBSCRIBE
========================================================= */

export function subscribeFriends(
  callback
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {};
  }

  function handleChange(
    event
  ) {
    callback(
      event?.detail
        ?.state ||
        getFriendState()
    );
  }

  function handleStorage(
    event
  ) {
    if (
      event.key !==
      STORAGE_KEY
    ) {
      return;
    }

    callback(
      getFriendState()
    );
  }

  window.addEventListener(
    CHANGE_EVENT,
    handleChange
  );

  window.addEventListener(
    "storage",
    handleStorage
  );

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      handleChange
    );

    window.removeEventListener(
      "storage",
      handleStorage
    );
  };
}

/* =========================================================
   RESET
========================================================= */

export function resetFriendState() {
  return saveState(
    cloneState(
      DEFAULT_STATE
    )
  );
}

/* =========================================================
   CLEAR
========================================================= */

export function clearFriendState() {
  return saveState({
    version: 1,

    friends: [],

    incomingRequests: [],

    outgoingRequests: [],

    updatedAt:
      Date.now(),
  });
}

/* =========================================================
   GLOBAL DEV API
========================================================= */

if (
  typeof window !==
  "undefined"
) {
  window.YATUT_FRIENDS = {
    get:
      getFriendState,

    status:
      getFriendStatus,

    isFriend,

    add:
      addFriend,

    remove:
      removeFriend,

    toggle:
      toggleFriend,

    receive:
      receiveFriendRequest,

    accept:
      acceptIncomingFriendRequest,

    decline:
      declineIncomingFriendRequest,

    send:
      sendFriendRequest,

    cancel:
      cancelFriendRequest,

    setStatus:
      setFriendStatus,

    reset:
      resetFriendState,

    clear:
      clearFriendState,
  };
}