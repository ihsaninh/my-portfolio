import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({
  current,
  totalPages,
  basePath = "/blog",
  queryParam,
}: {
  current: number;
  totalPages: number;
  basePath?: string;
  queryParam?: string; // if provided, build links as basePath?queryParam=n
}) {
  const pageHref = (n: number) =>
    queryParam
      ? n <= 1
        ? basePath
        : `${basePath}?${queryParam}=${n}`
      : n <= 1
        ? basePath
        : `${basePath}/page/${n}`;

  const prevHref = pageHref(current - 1);
  const nextHref = pageHref(current + 1);
  const isFirst = current === 1;
  const isLast = current === totalPages;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-8 flex justify-center" aria-label="Pagination">
      <div className="inline-flex items-center gap-1.5">
        <Link
          href={isFirst ? "#" : prevHref}
          aria-disabled={isFirst}
          className={
            isFirst
              ? "pointer-events-none inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm text-slate-400 border border-slate-200 dark:text-white/30 dark:border-white/10"
              : "inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm text-slate-700 hover:bg-slate-100 border border-slate-200 dark:text-white/85 dark:border-white/10 dark:hover:bg-white/10"
          }
        >
          <FiChevronLeft />
          <span>Prev</span>
        </Link>

        <ul className="flex items-center gap-1.5">
          {pages.map((n) => (
            <li key={n}>
              <Link
                href={pageHref(n)}
                aria-current={n === current ? "page" : undefined}
                className={
                  n === current
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm bg-accent/10 text-accent border border-accent/40"
                    : "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm text-slate-700 hover:bg-slate-100 border border-slate-200 dark:text-white/85 dark:border-white/10 dark:hover:bg-white/10"
                }
              >
                {n}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={isLast ? "#" : nextHref}
          aria-disabled={isLast}
          className={
            isLast
              ? "pointer-events-none inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm text-slate-400 border border-slate-200 dark:text-white/30 dark:border-white/10"
              : "inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm text-slate-700 hover:bg-slate-100 border border-slate-200 dark:text-white/85 dark:border-white/10 dark:hover:bg-white/10"
          }
        >
          <span>Next</span>
          <FiChevronRight />
        </Link>
      </div>
    </nav>
  );
}
