import type { Metadata } from "next";
import Link from "next/link";

import BlogListAnimated from "@/src/components/blog/BlogListAnimated";
import ScrollToTop from "@/src/components/shared/ScrollToTop";
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
      <ScrollToTop />
      <div className="mb-6 bp-fade-up-050">
        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="section-title">Blog Posts</h1>
      <BlogListAnimated posts={posts} />
    </section>
  );
}
