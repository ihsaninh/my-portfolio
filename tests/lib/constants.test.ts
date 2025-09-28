import { describe, expect, it } from "bun:test";

import { BLOG_PAGE_SIZE } from "../../src/shared/lib/constants";

describe("constants", () => {
  it("BLOG_PAGE_SIZE matches expected value", () => {
    expect(BLOG_PAGE_SIZE).toBe(9);
  });
});
