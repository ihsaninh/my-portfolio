import { describe, expect, it } from "bun:test";

import {
  buildPostOpenGraph,
  buildTwitterCard,
  ensureAbsoluteUrl,
} from "../../../src/shared/lib/seo/meta";

describe("seo/meta ensureAbsoluteUrl", () => {
  it("passes through absolute URLs", () => {
    expect(
      ensureAbsoluteUrl("https://x.com/img.png", "https://site.test")
    ).toBe("https://x.com/img.png");
  });

  it("prefixes relative paths with origin", () => {
    expect(ensureAbsoluteUrl("/img.png", "https://site.test")).toBe(
      "https://site.test/img.png"
    );
    expect(ensureAbsoluteUrl("img.png", "https://site.test")).toBe(
      "https://site.test/img.png"
    );
  });
});

describe("seo/meta builders", () => {
  it("builds OpenGraph for a post with cover", () => {
    const og = buildPostOpenGraph({
      title: "Post Title",
      description: "Desc",
      url: "/blog/post",
      cover: "/cover.png",
      origin: "https://site.test",
      authorName: "Author",
      published: "2024-07-01",
      modified: "2024-07-02",
    });
    expect(og.title).toBe("Post Title");
    expect(og.type).toBe("article");
    expect(og.url).toBe("/blog/post");
    expect(og.images?.[0]?.url).toBe("https://site.test/cover.png");
    expect(og.authors).toEqual(["Author"]);
    expect(og.publishedTime).toBe("2024-07-01");
    expect(og.modifiedTime).toBe("2024-07-02");
  });

  it("builds Twitter card with optional image", () => {
    const tw = buildTwitterCard({
      title: "Post Title",
      description: "Desc",
      cover: "/cover.png",
      origin: "https://site.test",
    }) as unknown as {
      card?: string;
      title?: string;
      description?: string;
      images?: string[];
    };
    expect(tw.card).toBe("summary_large_image");
    expect(tw.title).toBe("Post Title");
    expect(tw.description).toBe("Desc");
    expect(tw.images?.[0]).toBe("https://site.test/cover.png");
  });
});
