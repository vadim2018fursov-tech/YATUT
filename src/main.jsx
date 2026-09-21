import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const standalone =
  window.matchMedia?.(
    "(display-mode: standalone)"
  )?.matches ||
  window.navigator
    .standalone ===
    true;

document.documentElement.classList.toggle(
  "yatut-standalone",
  Boolean(
    standalone
  )
);

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (
  "serviceWorker" in
    navigator &&
  import.meta.env.PROD
) {
  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker
        .register(
          "/sw.js"
        )
        .catch(
          (error) => {
            console.warn(
              "YATUT SERVICE WORKER:",
              error
            );
          }
        );
    }
  );
}
