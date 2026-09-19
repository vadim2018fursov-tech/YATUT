import {
  createRoot,
} from "react-dom/client";

import "./styles/foundation.css";
import "./styles/premium-home-preview.css";
import "./styles/premium-home-shell-fixes.css";
import "./styles/premium-logo-fix.css";
import "./styles/premium-pages.css";

import "./styles/left-sidebar.css";
import "./styles/premium-sidebar-layout.css";
import "./styles/premium-sidebar-correction.css";

import "./styles/chat-premium.css";
import "./styles/chat-message-polish.css";

import "./styles/spaces-premium.css";
import "./styles/community-events.css";

import "./styles/events-premium.css";
import "./styles/events-community-link.css";

import "./styles/home-left-cleanup.css";

import "./styles/global-create.css";

/* PULSE */

import "./styles/pulse-tokens.css";
import "./styles/pulse-page.css";
import "./styles/pulse-map.css";
import "./styles/pulse-video.css";
import "./styles/pulse-wave.css";
import "./styles/pulse-mobile.css";
import "./styles/pulse-clips.css";
import "./styles/pulse-city.css";
import "./styles/pulse-watch.css";
import "./styles/pulse-player.css";
import "./styles/pulse-live-page.css";
import "./styles/pulse-creator.css";
import "./styles/pulse-studio.css";
import "./styles/pulse-author-links.css";

import "./styles/unified-profile.css";

import "./styles/nearby-pulse.css";
import "./styles/events-pulse.css";

/* PROFILE + NOW */

import "./styles/profile-now-v2.css";\nimport "./styles/now-page-v2.css";

/* POLISH */

import "./styles/pulse-motion.css";
import "./styles/pulse-responsive.css";
import "./styles/pulse-clips-layout-fix.css";

import PremiumHomePreview from "./pages/PremiumHomePreview";

const rootElement =
  document.getElementById(
    "premium-home-root"
  );

if (!rootElement) {
  throw new Error(
    "Не знайдено #premium-home-root"
  );
}

createRoot(
  rootElement
).render(
  <PremiumHomePreview />
);