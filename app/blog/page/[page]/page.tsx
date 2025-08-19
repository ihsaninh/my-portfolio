import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

import BlogListAnimated from "@/src/components/blog/BlogListAnimated";
import Pagination from "@/src/components/blog/Pagination";
import ScrollToTop from "@/src/components/shared/ScrollToTop";
import { BLOG_PAGE_SIZE } from "@/src/lib/constants";
import { getAllPostsMeta } from "@/src/lib/mdx";
import { getBlogPageMetadata } from "@/src/lib/seo";

type Params = { params: Promise<{ page: string }> };

export async function generateStaticParams() {
  const totalPages = Math.max(
    1,
    Math.ceil(getAllPostsMeta().length / BLOG_PAGE_SIZE)
  );
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { page } = await params;
  const p = Number(page);
  const totalPages = Math.max(
    1,
    Math.ceil(getAllPostsMeta().length / BLOG_PAGE_SIZE)
  );
  if (!Number.isFinite(p) || p < 2 || p > totalPages) return {};
  return getBlogPageMetadata({ page: p, totalPages });
}

export default async function BlogPagedPage({ params }: Params) {
  const { page } = await params;
  const p = Number(page);
  const all = getAllPostsMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / BLOG_PAGE_SIZE));
  if (!Number.isFinite(p) || p < 2 || p > totalPages) return notFound();
  const start = (p - 1) * BLOG_PAGE_SIZE;
  const posts = all.slice(start, start + BLOG_PAGE_SIZE);

  return (
    <section className="container">
      <ScrollToTop />
      <div className="mb-6 bp-fade-up-050">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to Blog</span>
        </Link>
      </div>
      <h1 className="section-title">Blog Posts</h1>
      <BlogListAnimated posts={posts} />
      <Pagination current={p} totalPages={totalPages} basePath="/blog" />
    </section>
  );
}
