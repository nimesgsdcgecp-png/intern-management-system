"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * ThemeSwitch — A brand-new, standalone dark/light mode toggle.
 * This is independent from ModernThemeToggle and serves as the
 * primary dark mode control for the dark-mode-system.
 *
 * Features:
 *  - Pill-shaped slider with sun/moon icons
 *  - Smooth CSS transitions (no Framer dependency)
 *  - Hydration-safe mounting
 *  - Accessible (button role, aria-label, keyboard support)
 */
export function ThemeSwitch() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch — render placeholder with matching dimensions
  if (!mounted) {
    return (
      <div
        className="w-[72px] h-9 rounded-full"
        style={{ background: "var(--dm-input-bg)", border: "1px solid var(--dm-input-border)" }}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="theme-switch-btn"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {/* Track */}
      <span
        className="theme-switch-track"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #1e293b, #334155)"
            : "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
          borderColor: isDark
            ? "rgba(129, 140, 248, 0.3)"
            : "rgba(99, 102, 241, 0.2)",
        }}
      >
        {/* Sun icon (left side, visible in light mode) */}
        <span
          className="theme-switch-icon"
          style={{
            opacity: isDark ? 0.3 : 1,
            left: "8px",
            color: isDark ? "#94a3b8" : "#f59e0b",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </span>

        {/* Moon icon (right side, visible in dark mode) */}
        <span
          className="theme-switch-icon"
          style={{
            opacity: isDark ? 1 : 0.3,
            right: "8px",
            color: isDark ? "#818cf8" : "#94a3b8",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </span>

        {/* Sliding thumb */}
        <span
          className="theme-switch-thumb"
          style={{
            transform: isDark ? "translateX(34px)" : "translateX(0px)",
            background: isDark
              ? "linear-gradient(135deg, #312e81, #4338ca)"
              : "linear-gradient(135deg, #ffffff, #f8fafc)",
            boxShadow: isDark
              ? "0 2px 8px rgba(99, 102, 241, 0.4), 0 0 12px rgba(99, 102, 241, 0.2)"
              : "0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Thumb indicator dot */}
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isDark ? "#818cf8" : "#f59e0b",
              transition: "background 0.3s ease",
            }}
          />
        </span>
      </span>

      {/* Label text */}
      <span
        className="theme-switch-label"
        style={{ color: "var(--dm-text-muted)" }}
      >
        {isDark ? "Dark" : "Light"}
      </span>

      <style jsx>{`
        .theme-switch-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 9999px;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .theme-switch-btn:focus-visible {
          outline: 2px solid var(--dm-border-focus);
          outline-offset: 2px;
        }

        .theme-switch-track {
          position: relative;
          display: flex;
          align-items: center;
          width: 72px;
          height: 36px;
          border-radius: 9999px;
          border: 1.5px solid;
          transition: background 0.4s ease, border-color 0.4s ease;
          flex-shrink: 0;
        }

        .theme-switch-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.4s ease, color 0.4s ease;
          z-index: 1;
          pointer-events: none;
        }

        .theme-switch-thumb {
          position: absolute;
          left: 3px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s cubic-bezier(0.68, -0.15, 0.27, 1.15),
                      background 0.4s ease,
                      box-shadow 0.4s ease;
          z-index: 2;
        }

        .theme-switch-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          user-select: none;
          transition: color 0.3s ease;
          min-width: 36px;
        }
      `}</style>
    </button>
  );
}
