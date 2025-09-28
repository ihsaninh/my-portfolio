import { describe, expect, it } from "bun:test";

import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "../../../src/shared/lib/seo/jsonld";

describe("seo/jsonld", () => {
  it("builds person JSON-LD with optional fields", () => {
    const p = personJsonLd({
      name: "Jane Doe",
      url: "https://example.com",
      jobTitle: "Engineer",
      sameAs: ["https://x.com/jane"],
    });
    expect(p["@type"]).toBe("Person");
    expect(p.name).toBe("Jane Doe");
    expect(p.url).toBe("https://example.com");
    expect(p.jobTitle).toBe("Engineer");
    expect(p.sameAs).toEqual(["https://x.com/jane"]);
  });

  it("builds website JSON-LD with optional publisher", () => {
    const w = websiteJsonLd({
      name: "Site",
      url: "https://example.com",
      publisherName: "Jane Doe",
    });
    expect(w["@type"]).toBe("WebSite");
    expect(w.publisher?.name).toBe("Jane Doe");
  });

  it("builds breadcrumb JSON-LD with correct positions", () => {
    const b = breadcrumbJsonLd([
      { name: "Home", item: "/" },
      { name: "Blog", item: "/blog" },
    ]);
    expect(b["@type"]).toBe("BreadcrumbList");
    expect(b.itemListElement[0].position).toBe(1);
    expect(b.itemListElement[1].position).toBe(2);
  });

  it("builds blog posting JSON-LD with fallbacks", () => {
    const bp = blogPostingJsonLd({
      title: "Hello",
      excerpt: "Short",
      datePublished: "2024-01-01",
      authorName: "Jane",
      pageUrl: "/blog/hello",
    });
    expect(bp["@type"]).toBe("BlogPosting");
    expect(bp.headline).toBe("Hello");
    expect(bp.description).toBe("Short");
    expect(bp.dateModified).toBe("2024-01-01");
    expect(bp.author?.name).toBe("Jane");
  });
});
