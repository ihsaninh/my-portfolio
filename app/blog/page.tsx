import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getAllPostsMeta } from "@/src/lib/mdx";

export const metadata: Metadata = {
  title: "Blog – Next.js, Tooling, and Engineering Guides",
  description:
    "Practical articles on modern web development: Next.js and React, performance, testing, tooling, cloud, UX, accessibility, architecture, and more.",
  alternates: { canonical: "/blog" },
  keywords: [
    "Next.js",
    "React",
    "Husky",
    "Commitlint",
    "AWS Amplify",
    "Face Liveness",
    "Design System",
    "Frontend",
    "Web Development",
  ],
  openGraph: {
    title: "Blog – Next.js, Tooling, and Engineering Guides",
    description:
      "Practical articles on modern web development: Next.js/React, performance, testing, tooling, cloud, UX, accessibility, architecture, and more.",
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog – Next.js, Tooling, and Engineering Guides",
    description:
      "Practical articles on modern web development: Next.js/React, performance, testing, tooling, cloud, UX, accessibility, architecture, and more.",
  },
};

export default function BlogPage() {
  const posts = getAllPostsMeta();
  return (
    <section className="container">
      <h1 className="section-title">All Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-slate-300 bg-slate-50 shadow-xl backdrop-blur overflow-hidden dark:border-white/10 dark:bg-white/5"
          >
            {post.cover && (
              <div className="relative w-full h-48">
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              </div>
            )}
            <div className="p-5 flex flex-col gap-3">
              <p className="text-xs text-slate-500 dark:text-white/60 flex items-center gap-2">
                <span>{new Date(post.date).toLocaleDateString()}</span>
                {post.readingTime && (
                  <>
                    <span aria-hidden>•</span>
                    <span>{post.readingTime}</span>
                  </>
                )}
              </p>
              <h3 className="text-lg lg:text-xl text-slate-900 dark:text-white group-hover:text-accent transition line-clamp-2">
                {post.title}
              </h3>
              {post.description || post.excerpt ? (
                <p className="text-sm text-slate-700 dark:text-white/75 line-clamp-3">
                  {post.description || post.excerpt}
                </p>
              ) : null}
              {post.tags?.length ? (
                <ul className="mt-1 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-slate-300 bg-white/70 px-2 py-0.5 text-[10px] text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/75"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
