"use client";

import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { Certification } from "@/src/types/resume";

interface Props {
  items: Certification[];
  className?: string;
  initialVisible?: number;
}

export default function CertificationsList({
  items,
  className,
  initialVisible = 6,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialVisible);
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
                initial={isExtra ? { opacity: 0, y: 8 } : undefined}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-2xl border border-slate-300 bg-slate-50 p-5 shadow-xl backdrop-blur flex flex-col gap-3 dark:border-white/5 dark:bg-white/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-lg lg:text-xl text-slate-900 dark:text-white">
                    {cert.title}
                  </h4>
                  <span className="text-accent text-xs sm:text-sm whitespace-nowrap">
                    {cert.issuedDate}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-white/70">{cert.company}</p>

                <div className="flex items-center justify-end">
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={
                        cert.credentialId ? `ID: ${cert.credentialId}` : undefined
                      }
                      aria-label={
                        cert.credentialId
                          ? `View credential. ID: ${cert.credentialId}`
                          : "View credential"
                      }
                      className="inline-flex items-center gap-2 text-xs sm:text-sm text-accent hover:underline"
                    >
                      View credential
                      <FiExternalLink aria-hidden />
                    </a>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      {canToggle && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/90"
          >
            {expanded ? "Show less" : `Show all (${items.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
