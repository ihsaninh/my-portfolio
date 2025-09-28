import { describe, expect, it } from "bun:test";

import {
  BLOG_DESC_BASE,
  BLOG_TITLE_BASE,
  getBlogPageMetadata,
} from "../../../src/shared/lib/seo/blog";

describe("seo/blog getBlogPageMetadata", () => {
  it("returns base metadata for first page", () => {
    const m = getBlogPageMetadata({ page: 1, totalPages: 5 });
    expect(m.title).toBe(BLOG_TITLE_BASE);
    expect(m.description).toBe(BLOG_DESC_BASE);
    expect(m.alternates?.canonical).toBe("/blog");
    expect(m.openGraph?.url).toBe("/blog");
  });

  it("returns paginated metadata for subsequent pages", () => {
    const m = getBlogPageMetadata({ page: 3, totalPages: 7 });
    expect(m.title).toBe(`${BLOG_TITLE_BASE} – Page 3`);
    expect(m.description).toBe(`Page 3 of 7 – ${BLOG_DESC_BASE}`);
    expect(m.alternates?.canonical).toBe("/blog/page/3");
  });
});
