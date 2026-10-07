export function DashboardIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="dashOrb" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#7be5ff" />
          <stop offset="55%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <linearGradient id="dashRing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="dashGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="url(#dashOrb)"
        stroke="url(#dashRing)"
        strokeWidth="1.5"
      />
      <path
        d="M6 14.5A7 7 0 1 1 18 14.5"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="1.5 3"
        opacity="0.9"
      />
      <line
        x1="12"
        y1="12"
        x2="16.5"
        y2="7.5"
        stroke="#ffedd5"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="12"
        x2="16.5"
        y2="7.5"
        stroke="#f97316"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.4" fill="#ffffff" />
      <circle cx="12" cy="12" r="1.3" fill="#0369a1" />
      <path
        d="M4 10C4.8 6 8.1 3 12 3C15.9 3 19.2 6 20 10C17.5 7.5 14.5 6.5 12 6.5C9.5 6.5 6.5 7.5 4 10Z"
        fill="url(#dashGloss)"
      />
    </svg>
  );
}

export function ApplicationsIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="appCase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="appHandle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="appGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="appGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M8.5 7C8.5 5.2 9.8 4 12 4C14.2 4 15.5 5.2 15.5 7"
        stroke="url(#appHandle)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="2.5"
        y="7"
        width="19"
        height="13.5"
        rx="3"
        fill="url(#appCase)"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <path
        d="M2.5 11C6.5 14 17.5 14 21.5 11"
        stroke="#bae6fd"
        strokeWidth="1.2"
        opacity="0.6"
      />
      <path
        d="M3 8C6 7.5 18 7.5 21 8C20.5 10.5 17 11.5 12 11.5C7 11.5 3.5 10.5 3 8Z"
        fill="url(#appGloss)"
      />
      <rect
        x="10.2"
        y="10.5"
        width="3.6"
        height="4"
        rx="1"
        fill="url(#appGold)"
        stroke="#ffffff"
        strokeWidth="0.8"
      />
      <circle cx="12" cy="12.5" r="0.8" fill="#713f12" />
    </svg>
  );
}

export function PipelineIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="pipe1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="pipe2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="pipe3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="pipeGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect
        x="2.5"
        y="4"
        width="5.2"
        height="16"
        rx="2"
        fill="url(#pipe1)"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <path
        d="M3 5C4 4.5 6.2 4.5 7.2 5C7 8 3.5 8 3 5Z"
        fill="url(#pipeGloss)"
      />
      <rect
        x="9.4"
        y="6"
        width="5.2"
        height="14"
        rx="2"
        fill="url(#pipe2)"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <path
        d="M10 7C11 6.5 13.2 6.5 14.2 7C14 10 10.5 10 10 7Z"
        fill="url(#pipeGloss)"
      />
      <rect
        x="16.3"
        y="3"
        width="5.2"
        height="17"
        rx="2"
        fill="url(#pipe3)"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <path
        d="M17 4C18 3.5 20.2 3.5 21.2 4C21 7.5 17.5 7.5 17 4Z"
        fill="url(#pipeGloss)"
      />
    </svg>
  );
}

export function AnalyticsIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bar1Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="bar2Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="bar3Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="13"
        width="4.5"
        height="8"
        rx="1.5"
        fill="url(#bar1Grad)"
        stroke="#ffffff"
        strokeWidth="0.8"
      />
      <ellipse
        cx="5.25"
        cy="14"
        rx="1.8"
        ry="0.8"
        fill="#ffffff"
        opacity="0.8"
      />
      <rect
        x="9.5"
        y="8"
        width="4.5"
        height="13"
        rx="1.5"
        fill="url(#bar2Grad)"
        stroke="#ffffff"
        strokeWidth="0.8"
      />
      <ellipse
        cx="11.75"
        cy="9"
        rx="1.8"
        ry="0.8"
        fill="#ffffff"
        opacity="0.8"
      />
      <rect
        x="16"
        y="4"
        width="4.5"
        height="17"
        rx="1.5"
        fill="url(#bar3Grad)"
        stroke="#ffffff"
        strokeWidth="0.8"
      />
      <ellipse
        cx="18.25"
        cy="5"
        rx="1.8"
        ry="0.8"
        fill="#ffffff"
        opacity="0.8"
      />
      <path
        d="M4 11.5Q10.5 8 18.5 2.5"
        stroke="url(#trendLine)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle
        cx="18.5"
        cy="2.5"
        r="1.8"
        fill="#ffffff"
        stroke="#f59e0b"
        strokeWidth="1"
      />
    </svg>
  );
}

export function CalendarIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="calHeader" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="calPage" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
        <linearGradient id="calRing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="3.5"
        fill="url(#calPage)"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <path
        d="M3 8.5C3 6.6 4.6 5 6.5 5H17.5C19.4 5 21 6.6 21 8.5V10H3V8.5Z"
        fill="url(#calHeader)"
      />
      <line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        stroke="#ffffff"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <rect
        x="6.5"
        y="3"
        width="2"
        height="4"
        rx="1"
        fill="url(#calRing)"
        stroke="#ffffff"
        strokeWidth="0.5"
      />
      <rect
        x="15.5"
        y="3"
        width="2"
        height="4"
        rx="1"
        fill="url(#calRing)"
        stroke="#ffffff"
        strokeWidth="0.5"
      />
      <circle cx="7.5" cy="13.5" r="1.3" fill="#38bdf8" />
      <circle cx="12" cy="13.5" r="1.3" fill="#94a3b8" />
      <circle cx="16.5" cy="13.5" r="1.3" fill="#94a3b8" />
      <circle cx="7.5" cy="17.5" r="1.3" fill="#94a3b8" />
      <circle cx="12" cy="17.5" r="1.5" fill="#f59e0b" />
      <circle cx="16.5" cy="17.5" r="1.3" fill="#10b981" />
      <path d="M3 10L14 10L3 21V10Z" fill="#ffffff" opacity="0.12" />
    </svg>
  );
}

export function DocumentsIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="docBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="docBanner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="docFold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <path
        d="M4 4.5C4 3.4 4.9 2.5 6 2.5H14L20 8.5V20.5C20 21.6 19.1 22.5 18 22.5H6C4.9 22.5 4 21.6 4 20.5V4.5Z"
        fill="url(#docBody)"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <path
        d="M14 2.5V7C14 7.8 14.7 8.5 15.5 8.5H20L14 2.5Z"
        fill="url(#docFold)"
        stroke="#ffffff"
        strokeWidth="0.8"
      />
      <rect
        x="6.5"
        y="6"
        width="6"
        height="2.2"
        rx="1"
        fill="url(#docBanner)"
      />
      <rect
        x="6.5"
        y="11"
        width="11"
        height="1.6"
        rx="0.8"
        fill="#38bdf8"
        opacity="0.8"
      />
      <rect
        x="6.5"
        y="14.5"
        width="11"
        height="1.6"
        rx="0.8"
        fill="#0284c7"
        opacity="0.6"
      />
      <rect
        x="6.5"
        y="18"
        width="7"
        height="1.6"
        rx="0.8"
        fill="#0284c7"
        opacity="0.4"
      />
      <path d="M4 14L16 4H8L4 8V14Z" fill="#ffffff" opacity="0.45" />
    </svg>
  );
}

export function SettingsIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="gearOrb" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#67e8f9" />
          <stop offset="85%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#155e75" />
        </radialGradient>
        <radialGradient id="hubOrb" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>
      <path
        d="M12 1.5L13.8 3.3L16.2 2.8L17.5 4.9L19.9 5.3L20.2 7.8L22.2 9.1L21.4 11.5L22.7 13.5L21.1 15.5L21.5 18L19.1 19.2L18.4 21.6L16 21.9L14.4 23.6L12 22.8L9.6 23.6L8 21.9L5.6 21.6L4.9 19.2L2.5 18L2.9 15.5L1.3 13.5L2.6 11.5L1.8 9.1L3.8 7.8L4.1 5.3L6.5 4.9L7.8 2.8L10.2 3.3L12 1.5Z"
        fill="url(#gearOrb)"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="5.5"
        fill="#0e7490"
        stroke="#ffffff"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <circle
        cx="12"
        cy="12"
        r="3.2"
        fill="url(#hubOrb)"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <circle cx="10.8" cy="10.8" r="0.9" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

export function SignOutIcon({ size = 22, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="exitOrb" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="60%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
        <linearGradient id="exitGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="url(#exitOrb)"
        stroke="#ffffff"
        strokeWidth="1.3"
      />
      <path
        d="M4 10C5 6.5 8.2 4 12 4C15.8 4 19 6.5 20 10C17.5 7.8 14.5 7 12 7C9.5 7 6.5 7.8 4 10Z"
        fill="url(#exitGloss)"
      />
      <path
        d="M12 7.5H8C7.2 7.5 6.5 8.2 6.5 9V15C6.5 15.8 7.2 16.5 8 16.5H12"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11 12H17.5M17.5 12L15 9.5M17.5 12L15 14.5"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CameraIcon({ size = 18, className = "aero-nav-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="camBody" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <radialGradient id="camLens" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0c4a6e" />
          <stop offset="100%" stopColor="#082f49" />
        </radialGradient>
        <linearGradient id="camGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect
        x="2.5"
        y="6.5"
        width="19"
        height="14"
        rx="3"
        fill="url(#camBody)"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <path
        d="M8.5 6.5L10 4.5H14L15.5 6.5"
        fill="#0284c7"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <circle
        cx="12"
        cy="13.5"
        r="4.8"
        fill="url(#camLens)"
        stroke="#ffffff"
        strokeWidth="1"
      />
      <circle cx="12" cy="13.5" r="2.2" fill="#075985" />
      <circle cx="13.5" cy="12" r="1.1" fill="#ffffff" opacity="0.9" />
      <circle
        cx="18"
        cy="9.5"
        r="1.2"
        fill="#fef08a"
        stroke="#ffffff"
        strokeWidth="0.6"
      />
      <path
        d="M3 7.5C6 7 18 7 21 7.5C20 9.5 16 10.5 12 10.5C8 10.5 4 9.5 3 7.5Z"
        fill="url(#camGloss)"
      />
    </svg>
  );
}

export function LightModeIcon({ size = 32, className = "aero-theme-icon" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="sunSphere" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="35%" stopColor="#fde047" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <linearGradient id="sunGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="sunRay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Corona Rays */}
      <line x1="16" y1="2" x2="16" y2="6" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="16" y1="26" x2="16" y2="30" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="2" y1="16" x2="6" y2="16" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="16" x2="30" y2="16" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6.1" y1="6.1" x2="8.9" y2="8.9" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="23.1" y1="23.1" x2="25.9" y2="25.9" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6.1" y1="25.9" x2="8.9" y2="23.1" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="23.1" y1="8.9" x2="25.9" y2="6.1" stroke="url(#sunRay)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Sun Body */}
      <circle cx="16" cy="16" r="8" fill="url(#sunSphere)" stroke="#ffffff" strokeWidth="1.2" />

      {/* Specular Highlight */}
      <path
        d="M10 13C10.8 9.5 13.5 8 16 8C18.5 8 21.2 9.5 22 13C20 11.5 18 10.8 16 10.8C14 10.8 12 11.5 10 13Z"
        fill="url(#sunGloss)"
      />
      <circle cx="13" cy="12" r="1.5" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

export function DarkModeIcon({ size = 32, className = "aero-theme-icon" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="moonSphere" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="moonGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Soft Glow */}
      <circle cx="16" cy="16" r="14" fill="url(#moonGlow)" />

      {/* Stars */}
      <path d="M7 8L7.6 9.4L9 10L7.6 10.6L7 12L6.4 10.6L5 10L6.4 9.4Z" fill="#bae6fd" opacity="0.9" />
      <path d="M25 7L25.4 7.8L26.2 8.2L25.4 8.6L25 9.4L24.6 8.6L23.8 8.2L24.6 7.8Z" fill="#38bdf8" opacity="0.85" />
      <path d="M9 22L9.5 23L10.5 23.5L9.5 24L9 25L8.5 24L7.5 23.5L8.5 23Z" fill="#ffffff" opacity="0.8" />

      {/* Crescent Moon */}
      <path
        d="M22.5 18C21.8 22.5 17.5 25.5 13 25C9.5 24.6 6.5 22 5.5 18.5C5 16.5 5.2 14.5 6 12.8C5.2 14.8 5.4 17.2 6.8 19C8.8 21.6 12.6 22.2 15.3 20.2C17.2 18.8 18.2 16.5 18 14.2C17.8 12.5 17 11 15.8 9.8C19.5 10.5 22.2 13.8 22.5 18Z"
        fill="url(#moonSphere)"
        stroke="#ffffff"
        strokeWidth="1.2"
      />

      {/* Moon specular highlight */}
      <path
        d="M17 12C18.5 13.5 19.5 15.5 19.8 18C18.5 16.5 17.5 14.5 17 12Z"
        fill="url(#moonGloss)"
      />
    </svg>
  );
}

export function SearchGlassIcon({ size = 18, className = "aero-search-svg" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="searchGlassLens" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#7dd3fc" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <linearGradient id="searchGlassRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="searchGlassHandle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>
        <linearGradient id="searchGlassGloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* 3D Handle */}
      <path
        d="M15.5 15.5L21 21"
        stroke="url(#searchGlassHandle)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M16 16L20.2 20.2"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Crystal Lens & Metallic Rim */}
      <circle
        cx="10.5"
        cy="10.5"
        r="7.5"
        fill="url(#searchGlassLens)"
        stroke="url(#searchGlassRim)"
        strokeWidth="1.6"
      />

      {/* Center Crystal Sparkle */}
      <path
        d="M10.5 7.5L11.2 9.8L13.5 10.5L11.2 11.2L10.5 13.5L9.8 11.2L7.5 10.5L9.8 9.8Z"
        fill="#ffffff"
        opacity="0.85"
      />

      {/* Top Glass Specular Arc */}
      <path
        d="M5.2 8.5C6 5.8 8.2 4.2 10.5 4.2C12.8 4.2 15 5.8 15.8 8.5C13.8 6.8 12 6.2 10.5 6.2C9 6.2 7.2 6.8 5.2 8.5Z"
        fill="url(#searchGlassGloss)"
      />
    </svg>
  );
}



