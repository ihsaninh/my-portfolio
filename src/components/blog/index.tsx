import Link from "next/link";

import { getAllPostsMeta } from "@/src/lib/mdx";

import PostsGrid from "./posts-grid";

export default function BlogSection() {
  const posts = getAllPostsMeta().slice(0, 3);
  return (
    <section className="container mt-12 lg:mt-24" id="blog">
      <div className="flex items-end justify-between">
        <h2 className="section-title">Blog</h2>
        <Link
          href="/blog"
          className="text-sm text-accent hover:underline"
          aria-label="See all blog posts"
        >
          See all
        </Link>
      </div>

      <PostsGrid posts={posts} />
    </section>
  );
}
