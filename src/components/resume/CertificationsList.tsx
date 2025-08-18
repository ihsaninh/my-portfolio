import { FiExternalLink } from "react-icons/fi";

import { Certification } from "@/src/types/resume";

interface Props {
  items: Certification[];
  className?: string;
}

export default function CertificationsList({ items, className }: Props) {
  return (
    <ul className={`grid grid-cols-1 gap-4 ${className ?? ""}`}>
      {items.map((cert, idx) => (
        <li
          key={`${cert.title}-${idx}`}
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

          <div className="flex items-center justify-between gap-4">
            {cert.credentialId ? (
              <p className="text-xs text-slate-500 dark:text-white/60">
                ID: {cert.credentialId}
              </p>
            ) : (
              <span />
            )}

            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-accent hover:underline"
              >
                View credential
                <FiExternalLink aria-hidden />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
