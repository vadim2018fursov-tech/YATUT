/* =========================================================
   YATUT ICON SYSTEM V1
   Unified SVG icons for ЯТУТ

   Usage:

   <YatutIcon name="home" />
   <YatutIcon name="friends" size={20} />
   <YatutIcon name="bell" strokeWidth={1.9} />
========================================================= */

const ICONS = {
  /* =======================================================
     MAIN NAVIGATION
  ======================================================= */

  home: (
    <>
      <path d="M3 10.7 12 3l9 7.7" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.2 21v-6.5h5.6V21" />
    </>
  ),

  now: (
    <>
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="m4.93 4.93 2.12 2.12" />
      <path d="m16.95 16.95 2.12 2.12" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="m4.93 19.07 2.12-2.12" />
      <path d="m16.95 7.05 2.12-2.12" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),

  pulse: (
    <>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </>
  ),

  friends: (
    <>
      <path d="M16 21v-2.1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V21" />
      <circle cx="9.5" cy="7.3" r="3.3" />
      <path d="M16.4 4.2a3.2 3.2 0 0 1 0 6.2" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.7" />
    </>
  ),

  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),

  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.5 15.5 4.7 4.7" />
    </>
  ),

  chats: (
    <>
      <path d="M20.5 15.4a3 3 0 0 1-3 3H9l-5.5 3v-3.8a3 3 0 0 1-1.8-2.8V7a3 3 0 0 1 3-3h12.8a3 3 0 0 1 3 3Z" />
      <path d="M7 10.8h.01" />
      <path d="M11.2 10.8h.01" />
      <path d="M15.4 10.8h.01" />
    </>
  ),

  community: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="7" r="2.4" />
      <path d="M2.8 19.5v-1.3A4.2 4.2 0 0 1 7 14h2a4.2 4.2 0 0 1 4.2 4.2v1.3" />
      <path d="M14.4 13.8h1.8a4 4 0 0 1 4 4v1.7" />
    </>
  ),

  events: (
    <>
      <rect x="3" y="5.5" width="18" height="15" rx="3" />
      <path d="M7.5 3v5" />
      <path d="M16.5 3v5" />
      <path d="M3 10h18" />
      <path d="m9.5 15 1.7 1.7 3.6-3.8" />
    </>
  ),

  nearby: (
    <>
      <path d="M20 10.2c0 5.4-8 11-8 11s-8-5.6-8-11a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),

  business: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8.5 7V4.7A1.7 1.7 0 0 1 10.2 3h3.6a1.7 1.7 0 0 1 1.7 1.7V7" />
      <path d="M3 12.5c5 2.2 13 2.2 18 0" />
      <path d="M10 13.6h4" />
    </>
  ),

  saved: (
    <>
      <path d="M6 4.8A2.8 2.8 0 0 1 8.8 2h6.4A2.8 2.8 0 0 1 18 4.8V22l-6-3.8L6 22Z" />
    </>
  ),

  menuGrid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),

  archive: (
    <>
      <rect x="3" y="5" width="18" height="4" rx="1.5" />
      <path d="M5 9v10h14V9" />
      <path d="M9 13h6" />
    </>
  ),

  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
      <path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c5.2 0 9 4 10 8a13 13 0 0 1-2.1 4.2" />
      <path d="M6.2 6.2A12.2 12.2 0 0 0 2 12c1 4 4.8 8 10 8a10.7 10.7 0 0 0 3.1-.5" />
    </>
  ),

  volumeOff: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="m16 9 5 6" />
      <path d="m21 9-5 6" />
    </>
  ),

  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06-2.76 2.76-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V21H10v-.09A1.8 1.8 0 0 0 8.9 19.3a1.8 1.8 0 0 0-2 .36l-.06.06-2.76-2.76.06-.06a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 2.85 13.8H2V10h.85A1.8 1.8 0 0 0 4.5 8.9a1.8 1.8 0 0 0-.36-2l-.06-.06 2.76-2.76.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 10 2.85V2h4v.85a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.06-.06 2.76 2.76-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.65 1.1H22v4h-.85A1.8 1.8 0 0 0 19.4 15Z" />
    </>
  ),

  /* =======================================================
     TOP BAR
  ======================================================= */

  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),

  message: (
    <>
      <path d="M4 5.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-5 3v-14a2 2 0 0 1 2-2Z" />
      <path d="m6.8 9 5.2 4 5.2-4" />
    </>
  ),

  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),

  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),

  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),

  chevronDown: (
    <>
      <path d="m7 10 5 5 5-5" />
    </>
  ),

  chevronRight: (
    <>
      <path d="m9 6 6 6-6 6" />
    </>
  ),

  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </>
  ),

  /* =======================================================
     COMMON UI
  ======================================================= */

  heart: (
    <>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </>
  ),

  share: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.5-4.4" />
      <path d="m8.2 13.2 7.5 4.4" />
    </>
  ),

  reply: (
    <>
      <path d="m9 8-5 4 5 4" />
      <path d="M5 12h8c4 0 6 2 6 6" />
    </>
  ),

  forward: (
    <>
      <path d="m15 8 5 4-5 4" />
      <path d="M19 12h-8c-4 0-6 2-6 6" />
    </>
  ),

  send: (
    <>
      <path d="m3 11 18-8-8 18-2-7-8-3Z" />
      <path d="m11 14 4-4" />
    </>
  ),

  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),

  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m6 7 1 13h10l1-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </>
  ),

  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9" r="1.8" />
      <path d="m21 15-4.5-4.5L7 20" />
    </>
  ),

  video: (
    <>
      <rect x="3" y="5" width="13" height="14" rx="2.5" />
      <path d="m16 10 5-3v10l-5-3Z" />
    </>
  ),

  microphone: (
    <>
      <rect x="8" y="3" width="8" height="12" rx="4" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M9 21h6" />
    </>
  ),

  smile: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M8.5 14c.9 1.4 2.1 2 3.5 2s2.6-.6 3.5-2" />
    </>
  ),

  poll: (
    <>
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </>
  ),

  pin: (
    <>
      <path d="M20 10c0 5.3-8 11-8 11S4 15.3 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),

  /* =======================================================
     SCHOOL / SPACE
  ======================================================= */

  school: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-5h6v5" />
      <path d="M8 11h2" />
      <path d="M14 11h2" />
    </>
  ),

  teacher: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3.5 20v-2.4A4.6 4.6 0 0 1 8.1 13h1.8a4.6 4.6 0 0 1 4.6 4.6V20" />
      <path d="M15 5h6v8h-4" />
      <path d="m17 9 1.2 1.2L20 8.4" />
    </>
  ),

  student: (
    <>
      <path d="m2 9 10-5 10 5-10 5Z" />
      <path d="M6 11.5V16c3.6 2.5 8.4 2.5 12 0v-4.5" />
      <path d="M22 9v6" />
    </>
  ),

  parent: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M2.5 20v-1.7A4.3 4.3 0 0 1 6.8 14h2.4a4.3 4.3 0 0 1 4.3 4.3V20" />
      <path d="M14.5 15a4 4 0 0 1 7 2.7V20" />
    </>
  ),

  book: (
    <>
      <path d="M4 4.5h6a3 3 0 0 1 3 3V21a3 3 0 0 0-3-3H4Z" />
      <path d="M20 4.5h-4a3 3 0 0 0-3 3V21a3 3 0 0 1 3-3h4Z" />
    </>
  ),

  schedule: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v4" />
      <path d="M17 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h3" />
      <path d="M14 14h2" />
      <path d="M8 17h2" />
    </>
  ),

  homework: (
    <>
      <path d="M6 3h9l4 4v14H6Z" />
      <path d="M15 3v5h5" />
      <path d="M9 12h6" />
      <path d="M9 16h5" />
    </>
  ),

  grades: (
    <>
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
    </>
  ),

  attendance: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.6 2.6L16.5 9" />
    </>
  ),

  announcement: (
    <>
      <path d="M4 13V8l12-4v13L4 13Z" />
      <path d="M16 8h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-3" />
      <path d="m6 14 1 6h4l-1-5" />
    </>
  ),

  notification: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),

  test: (
    <>
      <path d="M7 3h10v4H7Z" />
      <path d="M5 5h14v16H5Z" />
      <path d="m8 12 1.5 1.5L12 11" />
      <path d="M14 12h2" />
      <path d="m8 17 1.5 1.5L12 16" />
      <path d="M14 17h2" />
    </>
  ),

  members: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="8" r="3" />
      <path d="M2 20a6 6 0 0 1 12 0" />
      <path d="M12 20a6 6 0 0 1 10 0" />
    </>
  ),

  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),

  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),

  analytics: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
};

/* =========================================================
   COMPONENT
========================================================= */

export default function YatutIcon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = "",
  title,
}) {
  const content = ICONS[name];

  if (!content) {
    console.warn(
      `[YatutIcon] Unknown icon: ${name}`
    );

    return null;
  }

  return (
    <svg
      className={`yatut-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}

      {content}
    </svg>
  );
}