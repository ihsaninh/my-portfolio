"use client";

import clsx from "clsx";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  abbr?: string;
  className?: string;
};

export default function BrandLogo({ size = "sm", abbr = "INH", className }: BrandLogoProps) {
  const sizeClass =
    size === "lg"
      ? "h-12 w-12 text-[13px]"
      : size === "md"
      ? "h-10 w-10 text-[12px]"
      : "h-8 w-8 text-[11px]";

  return (
    <span
      aria-hidden
      className={clsx(
        "relative inline-grid place-content-center select-none",
        "rounded-xl font-extrabold tracking-tight",
        "text-slate-900 dark:text-white",
        // light: soft card-like chip, dark: subtle translucency
        "bg-white dark:bg-white/10",
        // ring for crisp edges across themes
        "ring-1 ring-slate-200 dark:ring-white/10",
        // subtle elevation
        "shadow-[0_2px_8px_rgba(2,6,23,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]",
        sizeClass,
        className
      )}
      style={{
        backgroundImage:
          "radial-gradient(120% 100% at 0% 0%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(100% 100% at 100% 100%, rgba(59,130,246,0.05), transparent 60%)",
      }}
    >
      {/* Accented first letter for a simple brand touch */}
      <span>
        <span className="text-accent">{abbr.slice(0, 1)}</span>
        {abbr.slice(1)}
      </span>
    </span>
  );
}

