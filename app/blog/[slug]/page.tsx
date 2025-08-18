import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/mdx-components";
import BlogPostLayout from "@/src/components/blog/BlogPostLayout";
import { getAllPostSlugs, getPostBySlug } from "@/src/lib/mdx";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const { meta } = post;
  return {
    title: meta.title,
    description: meta.description || meta.excerpt,
    openGraph: {
      title: meta.title,
      description: meta.description || meta.excerpt,
      images: meta.cover ? [{ url: meta.cover }] : undefined,
    },
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
