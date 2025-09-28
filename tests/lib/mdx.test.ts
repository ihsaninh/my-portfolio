import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import fs from "fs";
import path from "path";

import {
  getAllPostSlugs,
  getAllPostsMeta,
  getPostBySlug,
} from "../../src/shared/lib/mdx";

const BLOGS_DIR = path.join(process.cwd(), "src", "blogs");
const SLUG_A = "__test_mdx_post_a";
const SLUG_B = "__test_mdx_post_b";

const mdxA = `---
title: Test Post A
date: 2025-01-01
description: First test post
---

${"word ".repeat(50)}
`;

const mdxB = `---
title: Test Post B
date: 2024-01-01
description: Second test post
---

${"word ".repeat(250)}
`;

beforeAll(() => {
  if (!fs.existsSync(BLOGS_DIR)) fs.mkdirSync(BLOGS_DIR, { recursive: true });
  fs.writeFileSync(path.join(BLOGS_DIR, `${SLUG_A}.mdx`), mdxA, "utf8");
  fs.writeFileSync(path.join(BLOGS_DIR, `${SLUG_B}.mdx`), mdxB, "utf8");
});

afterAll(() => {
  for (const s of [SLUG_A, SLUG_B]) {
    const p = path.join(BLOGS_DIR, `${s}.mdx`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
});

describe("mdx utils", () => {
  it("lists all post slugs including test fixtures", () => {
    const slugs = getAllPostSlugs();
    expect(slugs).toContain(SLUG_A);
    expect(slugs).toContain(SLUG_B);
  });

  it("reads a post by slug and computes reading time", () => {
    const postA = getPostBySlug(SLUG_A);
    const postB = getPostBySlug(SLUG_B);
    expect(postA?.meta.slug).toBe(SLUG_A);
    expect(postB?.meta.slug).toBe(SLUG_B);
    expect(postA?.meta.readingTime).toMatch(/min read$/);
    expect(postB?.meta.readingTime).toMatch(/min read$/);
  });

  it("sorts all posts meta by date desc", () => {
    const all = getAllPostsMeta();
    const ours = all.filter((m) => m.slug === SLUG_A || m.slug === SLUG_B);
    expect(ours.map((m) => m.slug)).toEqual([SLUG_A, SLUG_B]);
  });
});
