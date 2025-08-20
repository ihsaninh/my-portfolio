import fs from "fs";
import matter from "gray-matter";
import path from "path";

export type BlogFrontmatter = {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  cover?: string;
  description?: string;
  readingTime?: string;
};

const BLOGS_DIR = path.join(process.cwd(), "src", "blogs");

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOGS_DIR)) return [];
  const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(
  slug: string
): { meta: BlogFrontmatter & { slug: string }; content: string } | null {
  const filePath = path.join(BLOGS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const readingTime = `${minutes} min read`;
  const meta = {
    ...(data as BlogFrontmatter),
    readingTime,
    slug,
  };
  return { meta, content };
}

export function getAllPostsMeta(): (BlogFrontmatter & { slug: string })[] {
  const toTime = (d: string | number | Date | null | undefined): number => {
    if (d == null) return 0;
    const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    const t =
      typeof (dt as Date).getTime === "function" ? (dt as Date).getTime() : NaN;
    return Number.isNaN(t) ? 0 : t;
  };

  return getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter(
      (p): p is { meta: BlogFrontmatter & { slug: string }; content: string } =>
        Boolean(p)
    )
    .map((p) => p.meta)
    .sort((a, b) => toTime(b.date) - toTime(a.date));
}
