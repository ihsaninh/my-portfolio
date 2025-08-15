"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (resolvedTheme ?? theme ?? "system") as
    | "light"
    | "dark"
    | "system";
  const isDark = current === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");
  const ariaLabel = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle color mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={ariaLabel}
      title={ariaLabel}
      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-slate-800 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 cursor-pointer"
    >
      {mounted && isDark ? (
        <span className="flex items-center gap-2 text-sm">
          <FiSun /> Light
        </span>
      ) : (
        <span className="flex items-center gap-2 text-sm">
          <FiMoon /> Dark
        </span>
      )}
    </button>
  );
}
