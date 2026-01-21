"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { socials } from "@/src/features/portfolio/data/socials";

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
}: Readonly<Props>) {
  return (
    <div className={containerClass}>
      {socials.map((s) => {
        const Icon = s.icon;

        const baseIcon =
          "shrink-0 transition-transform duration-300 group-hover:scale-110 " +
          (iconClass || (variant === "icon" ? "text-lg" : "text-base"));

        const baseItem =
          itemClass ||
          (variant === "icon"
            ? "group w-10 h-10 rounded-full glass holo-border flex items-center justify-center text-slate-700 dark:text-white/80 hover:text-[rgb(var(--accent))] transition-colors duration-300"
            : "group inline-flex items-center gap-2 rounded-full glass holo-border px-4 py-2 text-sm text-slate-700 dark:text-white/80 hover:text-[rgb(var(--accent))] transition-colors duration-300");

        return (
          <motion.div
            key={s.link}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
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
          </motion.div>
        );
      })}
    </div>
  );
}
