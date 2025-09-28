import type { MetadataRoute } from "next";

import { getAllPostsMeta } from "@/src/shared/lib/mdx";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ihsaninh.com";

  const posts = getAllPostsMeta();
  const toDate = (d?: string) => (d ? new Date(d) : new Date());
  const latestPost = posts[0];
  const latestModified = latestPost ? toDate(latestPost.date) : new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date("2025-07-01"),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...routes, ...postEntries];
}
