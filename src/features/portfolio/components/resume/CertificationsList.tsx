"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiAward, FiExternalLink } from "react-icons/fi";

import { Certification } from "@/src/features/portfolio/types/resume";

interface Props {
  items: Certification[];
  className?: string;
  initialVisible?: number;
}

export default function CertificationsList({
  items,
  className,
  initialVisible = 6,
}: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false);
  const canToggle = items.length > initialVisible;

  return (
    <div className={className ?? ""}>
      <motion.ul
        layout
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        transition={{ layout: { duration: 0.3, ease: "easeOut" } }}
      >
        <AnimatePresence initial={false}>
          {items.map((cert, idx) => {
            const isExtra = idx >= initialVisible;
            if (isExtra && !expanded) return null;

            return (
              <motion.li
                layout
                key={`${cert.title}-${idx}`}
                initial={isExtra ? { opacity: 0, scale: 0.95 } : undefined}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group"
              >
                <div className="h-full glass holo-border rounded-2xl p-5 flex flex-col gap-4 transition-shadow duration-300 group-hover:shadow-lg">
                  {/* Header with icon and date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Certificate icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--accent)/0.2)] to-[rgb(var(--accent-secondary)/0.1)] flex items-center justify-center">
                        <FiAward className="text-lg text-[rgb(var(--accent))]" />
                      </div>
                      <h4 className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-[rgb(var(--accent))] transition-colors duration-300">
                        {cert.title}
                      </h4>
                    </div>
                  </div>

                  {/* Company & Date */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-600 dark:text-white/70">
                      {cert.company}
                    </p>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-[rgb(var(--accent)/0.15)] to-[rgb(var(--accent-secondary)/0.1)] text-[rgb(var(--accent))]">
                      {cert.issuedDate}
                    </span>
                  </div>

                  {/* View credential link */}
                  {cert.credentialUrl && (
                    <div className="mt-auto pt-2 border-t border-slate-200/50 dark:border-white/5">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        title={
                          cert.credentialId
                            ? `ID: ${cert.credentialId}`
                            : undefined
                        }
                        aria-label={
                          cert.credentialId
                            ? `View credential. ID: ${cert.credentialId}`
                            : "View credential"
                        }
                        className="inline-flex items-center gap-2 text-sm text-[rgb(var(--accent))] hover:underline underline-offset-2 transition-all duration-300 group-hover:gap-3"
                      >
                        <span>View credential</span>
                        <FiExternalLink
                          aria-hidden
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      {/* Show more/less button */}
      {canToggle && (
        <div className="flex justify-center mt-6">
          <motion.button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="px-6 py-2.5 text-sm font-medium rounded-xl glass holo-border text-slate-700 dark:text-white/90 hover:text-[rgb(var(--accent))] transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {expanded ? "Show less" : `Show all (${items.length})`}
          </motion.button>
        </div>
      )}
    </div>
  );
}
