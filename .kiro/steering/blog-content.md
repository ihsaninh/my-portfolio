---
inclusion: fileMatch
fileMatchPattern: "src/blogs/**,**/blog/**"
---

# Blog Content Guidelines

## Blog Post Structure

Blog posts are MDX files stored in `src/blogs/<slug>.mdx`.

### Frontmatter

Each blog post must include frontmatter with gray-matter:

```mdx
---
title: "Your Blog Title"
description: "A brief description for SEO and cards"
date: "2024-01-15"
tags: ["react", "nextjs", "typescript"]
image: "/images/blog/your-image.svg"
---
```

### Content

- Write in MDX format (Markdown + JSX)
- Code blocks are syntax-highlighted via rehype-prism-plus
- Use standard markdown headings (`##`, `###`)
- Blog images go in `public/images/blog/`

## MDX Components

Custom components are defined in `mdx-components.tsx`:

- `<pre>` is wrapped with a copy-code button

## SEO

- Blog SEO metadata generated via `src/shared/lib/seo/blog.ts`
- JSON-LD structured data auto-generated for articles
- Each blog page at `/blog/[slug]` with proper meta tags

## Adding a New Blog Post

1. Create `src/blogs/<slug>.mdx` with proper frontmatter
2. Add cover image to `public/images/blog/<slug>.svg`
3. The post will auto-appear on `/blog` page (no manual registration needed)
