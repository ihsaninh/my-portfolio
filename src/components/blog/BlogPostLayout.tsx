import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import { formatDateUTC } from "@/src/utils/date";

interface Props {
  title: string;
  date?: string;
  tags?: string[];
  cover?: string;
  readingTime?: string;
  children: React.ReactNode;
}

export default function BlogPostLayout({
  title,
  date,
  tags,
  cover,
  readingTime,
  children,
}: Readonly<Props>) {
  return (
    <section className="container">
      <div className="mb-6 bp-fade-up-050">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to Blog</span>
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight leading-snug text-slate-900 dark:text-white bp-fade-up-100">
          {title}
        </h1>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 text-sm text-slate-600 dark:text-white/70 bp-fade-up-150">
          <p className="flex items-center gap-2">
            {date ? <time dateTime={date}>{formatDateUTC(date)}</time> : null}
            {readingTime ? (
              <>
                {date ? <span aria-hidden>•</span> : null}
                <span>{readingTime}</span>
              </>
            ) : null}
          </p>
          {tags?.length ? (
            <ul className="flex flex-wrap gap-2 mt-1 md:mt-0">
              {tags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white/85"
                >
                  {t}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      {cover ? (
        <div className="relative mt-6 w-full h-80 md:h-96 lg:h-[35rem] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 bp-scale-in-200">
          <Image
            src={cover}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <article className="mdx-content mt-8 bp-fade-up-250">{children}</article>
    </section>
  );
}
