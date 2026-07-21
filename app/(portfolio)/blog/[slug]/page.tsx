import { notFound } from "next/navigation";
import Script from "next/script";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/mdx-components";
import BlogPostLayout from "@/src/features/portfolio/components/blog/BlogPostLayout";
import { SITE_AUTHOR, SITE_URL } from "@/src/shared/lib/constants";
import { getAllPostSlugs, getPostBySlug } from "@/src/shared/lib/mdx";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  buildPostOpenGraph,
  buildTwitterCard,
} from "@/src/shared/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const { meta } = post;
  const url = `${SITE_URL}/blog/${slug}`;
  const og = buildPostOpenGraph({
    title: meta.title,
    description: meta.description || meta.excerpt,
    url,
    cover: meta.cover,
    origin: SITE_URL,
    published: meta.date,
  });
  const twitter = buildTwitterCard({
    title: meta.title,
    description: meta.description || meta.excerpt,
    cover: meta.cover,
    origin: SITE_URL,
  });
  return {
    title: meta.title,
    description: meta.description || meta.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: og,
    twitter,
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();
  const { meta, content } = post;
  const components = mdxComponents;
  return (
    <BlogPostLayout
      title={meta.title}
      date={meta.date}
      tags={meta.tags}
      cover={meta.cover}
      readingTime={meta.readingTime}
    >
      <Script
        id="ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            blogPostingJsonLd({
              title: meta.title,
              description: meta.description,
              excerpt: meta.excerpt,
              image: meta.cover,
              datePublished: meta.date,
              authorName: SITE_AUTHOR,
              pageUrl: `${SITE_URL}/blog/${slug}`,
            }),
          ),
        }}
      />
      <Script
        id="ld-breadcrumb-post"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: `${SITE_URL}/` },
              { name: "Blog", item: `${SITE_URL}/blog` },
              { name: meta.title, item: `${SITE_URL}/blog/${slug}` },
            ]),
          ),
        }}
      />
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypePrism],
          },
        }}
        components={components}
      />
    </BlogPostLayout>
  );
}
