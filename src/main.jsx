import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App.jsx";
import "./styles/ui-consistency-v4.css";
import "./styles/motion-system.css";
import "./styles/visual-foundation-v5.css";
import "./styles/home-polish-v1.css";
import "./styles/profile-mobile-fix-v1.css";
import "./styles/profile-polish-v2.css";
import "./styles/friends-polish-v1.css";
import "./styles/friend-cards-glass-v2.css";
import "./styles/chat-polish-v2.css";
import "./styles/chat-composer-fix-v3.css";
import "./styles/chat-composer-match-v4.css";
import "./styles/chat-message-actions-v1.css";
import "./styles/chat-message-position-v2.css";
import "./styles/chat-search-forward-v1.css";
import "./styles/chat-list-polish-v2.css";
import "./styles/mobile-shell-profile-fix-v3.css";
import "./styles/chat-stability-v1.css";
import "./styles/yatut-premium-ui-v11.css";
import "./styles/friend-cards-reference-v12.css";
import "./styles/friend-card-fade-avatar-v14.css";
import "./styles/three-depth-v1.css";
import "./styles/wet-glass-nav-v17.css";
import "./styles/profile-unified-v19.css";
import "./styles/yatut-experience-layer-v26.css";
import "./styles/yatut-reference-design-v27.css";
import "./styles/profile-reference-v28.css";
import "./styles/profile-smart-contrast-v29.css";
import "./styles/glass-ui-v30.css";
import "./styles/optical-glass-v31.css";
import "./styles/optical-glass-v32.css";
import "./styles/optical-glass-v33.css";
import "./styles/mobile-bugfix-v34.css";
import "./styles/mobile-fix-v35.css";
import {
  initNativePlatform,
} from "./services/nativePlatformService.js";
import {
  initNativeRuntime,
} from "./services/nativeRuntimeService.js";

const {
  native:
    nativePlatform,
} =
  initNativePlatform();

const standalone =
  nativePlatform ||
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

const userAgent =
  window.navigator.userAgent ||
  "";

const isWebIOS =
  /iPhone|iPad|iPod/i.test(
    userAgent
  ) ||
  (
    /Macintosh/i.test(
      userAgent
    ) &&
    Number(
      window.navigator
        .maxTouchPoints ||
      0
    ) >
      1
  );

const isWebAndroid =
  /Android/i.test(
    userAgent
  );

document.documentElement.classList.toggle(
  "yatut-platform-ios",
  nativePlatform
    ? document.documentElement.classList.contains(
        "yatut-native-ios"
      )
    : isWebIOS
);

document.documentElement.classList.toggle(
  "yatut-platform-android",
  nativePlatform
    ? document.documentElement.classList.contains(
        "yatut-native-android"
      )
    : isWebAndroid
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

  const width =
    viewport?.width ||
    window.innerWidth;

  const offsetTop =
    viewport?.offsetTop ||
    0;

  const offsetLeft =
    viewport?.offsetLeft ||
    0;

  const keyboardHeight =
    Math.max(
      0,
      window.innerHeight -
        height -
        offsetTop
    );

  const chatInputFocused =
    document.documentElement.classList.contains(
      "yatut-chat-input-focused"
    );

  const chatViewportGap =
    chatInputFocused &&
    keyboardHeight >
      0 &&
    keyboardHeight <
      110
      ? keyboardHeight
      : 0;

  document.documentElement.style.setProperty(
    "--yatut-visual-viewport-height",
    `${Math.round(
      height
    )}px`
  );

  document.documentElement.style.setProperty(
    "--yatut-visual-viewport-width",
    `${Math.round(
      width
    )}px`
  );

  document.documentElement.style.setProperty(
    "--yatut-visual-viewport-top",
    `${Math.round(
      offsetTop
    )}px`
  );

  document.documentElement.style.setProperty(
    "--yatut-visual-viewport-left",
    `${Math.round(
      offsetLeft
    )}px`
  );

  document.documentElement.style.setProperty(
    "--yatut-keyboard-height",
    `${Math.round(
      keyboardHeight
    )}px`
  );

  document.documentElement.style.setProperty(
    "--yatut-chat-viewport-gap",
    `${Math.round(
      chatViewportGap
    )}px`
  );

  document.documentElement.classList.toggle(
    "yatut-keyboard-open",
    keyboardHeight >
      120
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
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: 0.22,
        ease: [
          0.22,
          0.8,
          0.26,
          1,
        ],
      }}
    >
      <App />
    </MotionConfig>
  </StrictMode>
);

if (
  nativePlatform
) {
  initNativeRuntime()
    .catch(
      (
        error
      ) => {
        console.warn(
          "YATUT NATIVE RUNTIME:",
          error
        );
      }
    );
}

if (
  !nativePlatform &&
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
