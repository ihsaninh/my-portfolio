import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { FiArrowLeft } from "react-icons/fi";

import BlogListAnimated from "@/src/components/blog/BlogListAnimated";
import Pagination from "@/src/components/blog/Pagination";
import ScrollToTop from "@/src/components/shared/ScrollToTop";
import { BLOG_PAGE_SIZE } from "@/src/lib/constants";
import { getAllPostsMeta } from "@/src/lib/mdx";
import { breadcrumbJsonLd, getBlogPageMetadata } from "@/src/lib/seo";

type SearchProps = { searchParams?: Promise<{ page?: string }> };

export async function generateMetadata({
  searchParams,
}: SearchProps): Promise<Metadata> {
  const sp = await searchParams;
  const p = Math.max(1, Number(sp?.page ?? "1"));
  const totalPages = Math.max(
    1,
    Math.ceil(getAllPostsMeta().length / BLOG_PAGE_SIZE)
  );
  return getBlogPageMetadata({ page: p, totalPages });
}

export default async function BlogPage({
  searchParams,
}: Readonly<SearchProps>) {
  const sp = await searchParams;
  const all = getAllPostsMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / BLOG_PAGE_SIZE));
  const current = Math.max(1, Number(sp?.page ?? "1"));
  const start = (current - 1) * BLOG_PAGE_SIZE;
  const posts = all.slice(start, start + BLOG_PAGE_SIZE);
  return (
    <section className="container">
      <Script
        id="ld-breadcrumb-blog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "https://ihsaninh.com/" },
              { name: "Blog", item: "https://ihsaninh.com/blog" },
            ])
          ),
        }}
      />
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
      <Pagination
        current={current}
        totalPages={totalPages}
        basePath="/blog"
        queryParam="page"
      />
    </section>
  );
}
