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
        <linearGradient id="prep-brand-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Rounded squircle emblem */}
      <rect width="40" height="40" rx="10" fill="url(#prep-brand-grad)" />

      {/* Subtle top specular highlight */}
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="white" strokeOpacity="0.2" />

      {/* P Stem */}
      <rect x="9.5" y="8.5" width="4.5" height="23" rx="2.25" fill="white" />

      {/* P Outer Bowl */}
      <path
        d="M12.5 10.75H21C24.7279 10.75 27.75 13.7721 27.75 17.5C27.75 21.2279 24.7279 24.25 21 24.25H12.5"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dynamic Voice & Intelligence Soundwaves inside bowl */}
      <line x1="17.5" y1="15.25" x2="17.5" y2="19.75" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
      <line x1="20.75" y1="13.75" x2="20.75" y2="21.25" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
      <line x1="24" y1="15.75" x2="24" y2="19.25" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
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
