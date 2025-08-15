import Image from "next/image";
import Link from "next/link";

import { getAllPostsMeta } from "@/src/lib/mdx";

export const metadata = {
  title: "Blog",
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
              <p className="text-xs text-slate-500 dark:text-white/60">
                {new Date(post.date).toLocaleDateString()}
              </p>
              <h3 className="text-lg lg:text-xl text-slate-900 dark:text-white group-hover:text-accent transition">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="text-sm text-slate-700 dark:text-white/75">
                  {post.excerpt}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
