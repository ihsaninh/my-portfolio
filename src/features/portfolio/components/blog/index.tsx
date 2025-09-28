import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { getAllPostsMeta } from "@/src/shared/lib/mdx";

import PostsGrid from "./PostsGrid";

export default function BlogSection() {
  const posts = getAllPostsMeta().slice(0, 3);
  return (
    <section className="container mt-12 lg:mt-24" id="blog">
      <div className="flex items-end justify-between">
        <h2 className="section-title">Blog</h2>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
          aria-label="See all blog posts"
        >
          <span>See all posts</span>
          <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <PostsGrid posts={posts} />
    </section>
  );
}
