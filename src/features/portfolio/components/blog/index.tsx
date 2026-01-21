import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import ScrollReveal from "@/src/shared/components/ScrollReveal";

import { getAllPostsMeta } from "@/src/shared/lib/mdx";

import PostsGrid from "./PostsGrid";

export default function BlogSection() {
  const posts = getAllPostsMeta().slice(0, 3);

  return (
    <section className="container mt-12 lg:mt-24" id="blog">
      <ScrollReveal animation="slide-up">
        <div className="flex items-end justify-between">
          <h2 className="section-title">Blog</h2>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 glass holo-border rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-white/80 hover:text-[rgb(var(--accent))] transition-all duration-300"
            aria-label="See all blog posts"
          >
            <span>See all posts</span>
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </ScrollReveal>

      <PostsGrid posts={posts} />
    </section>
  );
}
