import React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import useTheme from "../hooks/useTheme";

function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const Icon = isLight ? MoonStar : SunMedium;
  const label = isLight ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`theme-pill flex h-11 w-11 items-center justify-center rounded-full transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] ${className}`.trim()}
    >
      <Icon size={18} className="text-[var(--text-primary)]" />
    </button>
  );
}

export default ThemeToggle;
