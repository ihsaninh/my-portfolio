import type { Metadata } from "next";

import BlogListAnimated from "@/src/components/blog/BlogListAnimated";
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
      <h1 className="section-title">All Blog</h1>
      <BlogListAnimated posts={posts} />
    </section>
  );
}
