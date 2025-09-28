import type { Metadata } from "next";

export const BLOG_TITLE_BASE =
  "Blog – Next.js, Tooling, and Engineering Guides";
export const BLOG_DESC_BASE =
  "Practical articles on modern web development: Next.js/React, performance, testing, tooling, cloud, UX, accessibility, architecture, and more.";

export function getBlogPageMetadata({
  page = 1,
  totalPages,
}: {
  page?: number;
  totalPages?: number;
} = {}): Metadata {
  const isFirst = page <= 1;
  const title = isFirst ? BLOG_TITLE_BASE : `${BLOG_TITLE_BASE} – Page ${page}`;
  const descBase = BLOG_DESC_BASE;
  const description =
    !isFirst && totalPages
      ? `Page ${page} of ${totalPages} – ${descBase}`
      : descBase;

  const canonical = isFirst ? "/blog" : `/blog/page/${page}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}
