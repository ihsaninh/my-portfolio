import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "bun:test";

import BlogPostLayout from "../../../src/components/blog/BlogPostLayout";

// Ensure next/image boolean props are safe (global setup already mocks)

afterEach(() => cleanup());

describe("BlogPostLayout", () => {
  it("renders back link, title, meta, tags, cover, and content", () => {
    render(
      <BlogPostLayout
        title="My Post"
        date="2024-06-01"
        tags={["react", "testing"]}
        cover="/cover.jpg"
        readingTime="4 min read"
      >
        <p>Body content</p>
      </BlogPostLayout>
    );

    const back = screen.getByRole("link", { name: /Back to Blog/i });
    expect(back.getAttribute("href")).toBe("/blog");

    const title = screen.getByRole("heading", { name: "My Post" });
    expect(title).toBeTruthy();

    // Ensure a <time> exists with dateTime attr
    const timeEl = screen.getByText(
      (_, el) => el?.tagName.toLowerCase() === "time"
    ) as HTMLElement;
    expect(
      timeEl.getAttribute("datetime") || timeEl.getAttribute("dateTime")
    ).toBe("2024-06-01");

    // Tags
    expect(screen.getByText("react")).toBeTruthy();
    expect(screen.getByText("testing")).toBeTruthy();

    // Cover image rendered (alt = title)
    const img = screen.getByAltText("My Post");
    expect(img).toBeTruthy();

    // Children content
    expect(screen.getByText("Body content")).toBeTruthy();
  });
});
