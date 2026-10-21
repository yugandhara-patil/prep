import React from "react";
import { Link } from "react-router-dom";

export function PrepLogoIcon({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Prep Logo"
    >
      <defs>
        {/* Deep indigo and muted slate-blue background gradient */}
        <linearGradient id="prep-logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3730A3" />   {/* Deep Indigo */}
          <stop offset="55%" stopColor="#1E1B4B" />  {/* Midnight Indigo */}
          <stop offset="100%" stopColor="#0F172A" /> {/* Muted Slate Navy */}
        </linearGradient>
      </defs>

      {/* Rounded squircle background */}
      <rect width="40" height="40" rx="11" fill="url(#prep-logo-bg)" />

      {/* Subtle crisp highlight border for high contrast on dark & light backgrounds */}
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="10.25"
        stroke="#818CF8"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      {/* Modern White Symbol: 'P' Interview Monogram with AI Spark */}
      {/* P Stem */}
      <rect x="10.5" y="9" width="4.5" height="22" rx="2.25" fill="white" />

      {/* P Speech Loop */}
      <path
        d="M12.5 9.5H21C24.866 9.5 28 12.634 28 16.5C28 20.366 24.866 23.5 21 23.5H12.5"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* AI Intelligence Spark inside bowl */}
      <path
        d="M20.25 13C20.25 15 19 16.25 17 16.25C19 16.25 20.25 17.5 20.25 19.5C20.25 17.5 21.5 16.25 23.5 16.25C21.5 16.25 20.25 15 20.25 13Z"
        fill="white"
      />
    </svg>
  );
}

export default function PrepLogo({
  size = "md",
  theme = "dark-text", // "dark-text" for light backgrounds, "light-text" for dark backgrounds
  showWordmark = true,
  to = "/home",
  className = "",
}) {
  const sizeMap = {
    sm: { icon: 30, text: "text-lg", gap: "gap-2" },
    md: { icon: 36, text: "text-xl", gap: "gap-2.5" },
    lg: { icon: 42, text: "text-2xl", gap: "gap-3" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDarkText = theme === "dark-text";

  const content = (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      <div className="transition-transform duration-150 ease-out group-hover:scale-105 drop-shadow-xs">
        <PrepLogoIcon size={currentSize.icon} />
      </div>
      {showWordmark && (
        <span
          className={`font-black tracking-tight ${currentSize.text} transition-colors ${
            isDarkText
              ? "text-slate-900 group-hover:text-indigo-600"
              : "text-white group-hover:text-indigo-200"
          }`}
        >
          Prep
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
