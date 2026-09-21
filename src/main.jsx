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

const coarsePointer =
  window.matchMedia?.(
    "(hover: none) and (pointer: coarse)"
  );

function syncDeviceClasses() {
  document.documentElement.classList.toggle(
    "yatut-coarse-pointer",
    Boolean(
      coarsePointer?.matches
    )
  );

  document.documentElement.classList.toggle(
    "yatut-landscape",
    window.innerWidth >
      window.innerHeight
  );
}

syncDeviceClasses();

coarsePointer?.addEventListener?.(
  "change",
  syncDeviceClasses
);

window.addEventListener(
  "orientationchange",
  syncDeviceClasses
);

window.addEventListener(
  "resize",
  syncDeviceClasses
);

function syncVisualViewportRoot() {
  const viewport =
    window.visualViewport;

  const height =
    viewport?.height ||
    window.innerHeight;

  document.documentElement.style.setProperty(
    "--yatut-visual-viewport-height",
    `${Math.round(
      height
    )}px`
  );
}

syncVisualViewportRoot();

window.visualViewport?.addEventListener(
  "resize",
  syncVisualViewportRoot
);

window.visualViewport?.addEventListener(
  "scroll",
  syncVisualViewportRoot
);

window.addEventListener(
  "resize",
  syncVisualViewportRoot
);

window.addEventListener(
  "orientationchange",
  syncVisualViewportRoot
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
