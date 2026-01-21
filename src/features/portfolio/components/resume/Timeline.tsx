"use client";

import { motion } from "framer-motion";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

import { ResumeData } from "@/src/features/portfolio/types/resume";

interface Props {
  items: ResumeData[];
  className?: string;
  offsetPx?: number;
}

export default function Timeline({
  items,
  className,
  offsetPx = 24,
}: Readonly<Props>) {
  return (
    <div
      className={`relative overflow-visible ${className ?? ""}`}
      aria-label="Experience timeline"
    >
      {/* Gradient timeline line */}
      <span
        className="pointer-events-none absolute top-0 bottom-0 w-px"
        style={{
          left: offsetPx,
          background:
            "linear-gradient(to bottom, rgb(var(--accent)), rgb(var(--accent-secondary)), rgb(var(--accent-tertiary)))",
        }}
      />

      <ul className="relative flex flex-col gap-6">
        {items.map((item, index) => (
          <motion.li
            key={`${item.title}-${item.company}-${item.startDate}`}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Timeline dot with glow */}
            <span
              className="absolute -translate-x-1/2 top-6 h-4 w-4 rounded-full border-2 border-[rgb(var(--accent))] bg-white dark:bg-primary z-10"
              style={{
                left: offsetPx,
                boxShadow: "0 0 10px rgb(var(--accent) / 0.5)",
              }}
            />

            {/* Card */}
            <motion.div
              className="glass holo-border rounded-2xl p-5 flex flex-col gap-4"
              style={{ marginLeft: offsetPx + 20 }}
              whileHover={{ scale: 1.01, x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                </div>
                <span className="text-xs sm:text-sm whitespace-nowrap font-medium px-3 py-1 rounded-full bg-gradient-to-r from-[rgb(var(--accent)/0.15)] to-[rgb(var(--accent-secondary)/0.15)] text-[rgb(var(--accent))]">
                  {item.startDate} {item.endDate ? ` - ${item.endDate}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-white/70">
                <HiOutlineBuildingOffice2 className="text-[rgb(var(--accent))] text-lg shrink-0" />
                <p className="text-sm font-medium">{item.company}</p>
              </div>

              {item.descriptions && item.descriptions.length > 0 && (
                <ul className="list-none pl-0 space-y-2 text-sm text-slate-600 dark:text-white/60">
                  {item.descriptions.map((desc, i) => (
                    <li
                      key={`${desc.substring(0, 50)}-${i}`}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] shrink-0" />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
