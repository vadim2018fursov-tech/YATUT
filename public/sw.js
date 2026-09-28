const CACHE_NAME =
  "yatut-shell-v23";

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/yatut-icon.svg",
  "/favicon.svg",
  "/notifications",
  "/chats",
  "/pulse",
];

self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      caches
        .open(
          CACHE_NAME
        )
        .then(
          (cache) =>
            cache.addAll(
              APP_SHELL
            )
        )
        .then(
          () =>
            self.skipWaiting()
        )
    );
  }
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      caches
        .keys()
        .then(
          (keys) =>
            Promise.all(
              keys
                .filter(
                  (key) =>
                    key !==
                    CACHE_NAME
                )
                .map(
                  (key) =>
                    caches.delete(
                      key
                    )
                )
            )
        )
        .then(
          () =>
            self.clients.claim()
        )
    );
  }
);

self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    if (
      request.method !==
        "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url
      );

    if (
      url.origin !==
        self.location.origin
    ) {
      return;
    }

    if (
      request.mode ===
        "navigate"
    ) {
      event.respondWith(
        fetch(
          request
        )
          .then(
            (response) => {
              const copy =
                response.clone();

              caches
                .open(
                  CACHE_NAME
                )
                .then(
                  (cache) =>
                    cache.put(
                      "/",
                      copy
                    )
                );

              return response;
            }
          )
          .catch(
            () =>
              caches.match(
                "/"
              )
          )
      );

      return;
    }

    event.respondWith(
      fetch(
        request
      )
        .then(
          (response) => {
            if (
              response.ok
            ) {
              const copy =
                response.clone();

              caches
                .open(
                  CACHE_NAME
                )
                .then(
                  (cache) =>
                    cache.put(
                      request,
                      copy
                    )
                );
            }

            return response;
          }
        )
        .catch(
          () =>
            caches.match(
              request
            )
        )
    );
  }
);


/* =========================================================
   WEB PUSH
========================================================= */

self.addEventListener(
  "push",
  (event) => {
    let payload = {};

    try {
      payload =
        event.data
          ? event.data.json()
          : {};
    } catch {
      payload = {
        title: "ЯТУТ",
        body:
          event.data?.text?.() ||
          "У вас нове сповіщення",
      };
    }

    const title =
      payload.title ||
      "ЯТУТ";

    const options = {
      body:
        payload.body ||
        "У вас нове сповіщення",
      icon:
        payload.icon ||
        "/yatut-icon.svg",
      badge:
        payload.badge ||
        "/yatut-icon.svg",
      tag:
        payload.id
          ? `yatut-${payload.id}`
          : undefined,
      renotify: true,
      data: {
        url:
          payload.url ||
          "/notifications",
        route:
          payload.route ||
          "notifications",
        payload:
          payload.data ||
          {},
        notificationId:
          payload.id ||
          null,
      },
    };

    event.waitUntil(
      self.registration
        .showNotification(
          title,
          options
        )
    );
  }
);

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      new URL(
        event.notification
          ?.data?.url ||
          "/notifications",
        self.location.origin
      ).href;

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(
          async (
            clientList
          ) => {
            for (
              const client of
                clientList
            ) {
              try {
                const clientUrl =
                  new URL(
                    client.url
                  );

                if (
                  clientUrl.origin ===
                  self.location.origin
                ) {
                  await client.navigate(
                    targetUrl
                  );

                  await client.focus();

                  return;
                }
              } catch {
                // Continue to the next window.
              }
            }

            if (
              self.clients
                .openWindow
            ) {
              await self.clients
                .openWindow(
                  targetUrl
                );
            }
          }
        )
    );
  }
);
