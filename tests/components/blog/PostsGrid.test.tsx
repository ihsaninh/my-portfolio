import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";

import PostsGrid from "../../../src/components/blog/PostsGrid";

// Mock framer-motion to strip animation props
mock.module("framer-motion", () => {
  const strip = (p: Record<string, unknown>) => {
    const c = { ...p } as Record<string, unknown>;
    for (const k of [
      "initial",
      "animate",
      "exit",
      "transition",
      "variants",
      "whileInView",
      "viewport",
      "layout",
      "whileHover",
    ])
      delete c[k as keyof typeof c];
    return c;
  };
  return {
    __esModule: true,
    motion: {
      div: ({
        children,
        ...p
      }: { children?: React.ReactNode } & Record<string, unknown>) => (
        <div {...strip(p)}>{children}</div>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

afterEach(() => cleanup());

describe("PostsGrid", () => {
  const posts = [
    {
      slug: "internal",
      title: "Internal Post",
      date: "2024-01-01",
      description: "Internal desc",
      tags: ["tag1", "tag2", "tag3", "tag4"],
      cover: "/cover.jpg",
      readingTime: "5 min read",
    },
    {
      slug: "external",
      title: "External Post",
      date: "2024-02-01",
      excerpt: "External excerpt",
      externalUrl: "https://example.com/post",
    },
  ];

  it("renders posts with titles and descriptions", () => {
    render(<PostsGrid posts={posts} />);
    expect(screen.getByText("Internal Post")).toBeTruthy();
    expect(screen.getByText("Internal desc")).toBeTruthy();
    expect(screen.getByText("External Post")).toBeTruthy();
    expect(screen.getByText("External excerpt")).toBeTruthy();
  });

  it("uses internal and external links appropriately", () => {
    render(<PostsGrid posts={posts} />);
    // Internal link: find heading then ascend to link
    const internalHeading = screen.getByRole("heading", {
      name: "Internal Post",
      level: 3,
    });
    const internalLink = internalHeading.closest("a");
    expect(internalLink?.getAttribute("href")).toBe("/blog/internal");

    // External link
    const externalHeading = screen.getByRole("heading", {
      name: "External Post",
      level: 3,
    });
    const externalLink = externalHeading.closest("a");
    expect(externalLink?.getAttribute("href")).toBe("https://example.com/post");
    expect(externalLink?.getAttribute("target")).toBe("_blank");
    expect(externalLink?.getAttribute("rel")).toContain("noopener");
  });

  it("shows at most three tags", () => {
    render(<PostsGrid posts={posts} />);
    // tag4 should not appear
    expect(screen.getByText("tag1")).toBeTruthy();
    expect(screen.getByText("tag2")).toBeTruthy();
    expect(screen.getByText("tag3")).toBeTruthy();
    expect(screen.queryByText("tag4")).toBeNull();
  });
});
