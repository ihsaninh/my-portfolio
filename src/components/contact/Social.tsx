"use client";

import Link from "next/link";

import { socials } from "@/src/data/socials";

type Props = {
  containerClass?: string;
  itemClass?: string;
  iconClass?: string;
  labelClass?: string;
  variant?: "icon" | "pill";
};

export default function Social({
  containerClass = "",
  itemClass = "",
  iconClass = "",
  labelClass = "",
  variant = "icon",
}: Props) {
  return (
    <div className={containerClass}>
      {socials.map((s, i) => {
        const Icon = s.icon;
        const baseIcon =
          "shrink-0 " +
          (iconClass || (variant === "icon" ? "text-lg" : "text-base"));
        const baseItem =
          itemClass ||
          (variant === "icon"
            ? "w-10 h-10 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-800 hover:text-slate-900 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10"
            : "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-800 hover:text-slate-900 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:hover:text-white dark:hover:bg-white/10");

        return (
          <Link
            key={i}
            href={s.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className={baseItem}
            title={s.label}
          >
            <Icon aria-hidden="true" className={baseIcon} />
            {variant === "pill" && (
              <span className={labelClass || "whitespace-nowrap"}>
                {s.label}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
