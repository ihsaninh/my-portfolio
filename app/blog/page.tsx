import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import BlogListAnimated from "@/src/components/blog/BlogListAnimated";
import Pagination from "@/src/components/blog/Pagination";
import ScrollToTop from "@/src/components/shared/ScrollToTop";
import { BLOG_PAGE_SIZE } from "@/src/lib/constants";
import { getAllPostsMeta } from "@/src/lib/mdx";
import { getBlogPageMetadata } from "@/src/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const all = getAllPostsMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / BLOG_PAGE_SIZE));
  return getBlogPageMetadata({ page: 1, totalPages });
}

export default function BlogPage() {
  const all = getAllPostsMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / BLOG_PAGE_SIZE));
  const posts = all.slice(0, BLOG_PAGE_SIZE);
  return (
    <section className="container">
      <ScrollToTop />
      <div className="mb-6 bp-fade-up-050">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>
      </div>
      <h1 className="section-title">Blog Posts</h1>
      <BlogListAnimated posts={posts} />
      <Pagination current={1} totalPages={totalPages} basePath="/blog" />
    </section>
  );
}
