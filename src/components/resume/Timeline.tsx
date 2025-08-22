import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

import { ResumeData } from "@/src/types/resume";

interface Props {
  items: ResumeData[];
  className?: string;
  offsetPx?: number;
}

export default function Timeline({ items, className, offsetPx = 24 }: Props) {
  return (
    <div
      className={`relative overflow-visible ${className ?? ""}`}
      aria-label="Experience timeline"
    >
      <span
        className="pointer-events-none absolute top-0 bottom-0 w-px bg-slate-300 dark:bg-white/10"
        style={{ left: offsetPx }}
      />
      <ul className="relative flex flex-col gap-8">
        {items.map((item, idx) => (
          <li key={idx} className="relative">
            <span
              className="absolute -translate-x-1/2 top-1.5 h-4 w-4 rounded-full border-2 border-accent bg-white dark:bg-secondary z-10"
              style={{ left: offsetPx }}
            />
            <div
              className="rounded-2xl border border-slate-300 bg-slate-50 p-5 shadow-xl backdrop-blur flex flex-col gap-4 dark:border-white/5 dark:bg-white/5"
              style={{ marginLeft: offsetPx + 16 }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg lg:text-xl text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                </div>
                <span className="text-accent text-xs sm:text-sm whitespace-nowrap">
                  {item.startDate} {item.endDate ? ` - ${item.endDate}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-white/70">
                <HiOutlineBuildingOffice2 className="text-accent text-lg shrink-0" />
                <p className="text-sm">{item.company}</p>
              </div>

              {item.descriptions && item.descriptions.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-500 dark:text-white/60">
                  {item.descriptions.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
