import type { Metadata } from "next";

export type ArticleOpenGraph = Omit<
  Extract<NonNullable<Metadata["openGraph"]>, { type: "article" }>,
  "images"
> & {
  images?: { url: string }[];
};

export function ensureAbsoluteUrl(input: string, origin: string): string {
  if (!input) return input;
  if (/^https?:\/\//i.test(input)) return input;
  return `${origin}${input.startsWith("/") ? input : `/${input}`}`;
}

export function buildPostOpenGraph(params: {
  title: string;
  description?: string;
  url: string;
  cover?: string;
  origin: string;
  authorName?: string;
  published: string;
  modified?: string;
}): ArticleOpenGraph {
  const {
    title,
    description,
    url,
    cover,
    origin,
    authorName = "Ihsan Nurul Habib",
    published,
    modified,
  } = params;
  const coverAbs = cover ? ensureAbsoluteUrl(cover, origin) : undefined;
  return {
    title,
    description,
    url,
    type: "article" as const,
    publishedTime: published,
    modifiedTime: modified || published,
    authors: [authorName],
    images: coverAbs ? [{ url: coverAbs }] : undefined,
  };
}

export function buildTwitterCard(params: {
  title: string;
  description?: string;
  cover?: string;
  origin: string;
}): NonNullable<Metadata["twitter"]> {
  const { title, description, cover, origin } = params;
  const coverAbs = cover ? ensureAbsoluteUrl(cover, origin) : undefined;
  return {
    card: "summary_large_image",
    title,
    description,
    images: coverAbs ? [coverAbs] : undefined,
  };
}
