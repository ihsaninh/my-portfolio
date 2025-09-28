import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";

import BlogListAnimated from "@/src/features/portfolio/components/blog/BlogListAnimated";

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
      delete c[k];
    return c;
  };
  return {
    __esModule: true,
    motion: {
      // Type children as ReactNode without importing React explicitly
      div: ({
        children,
        ...p
      }: { children?: import("react").ReactNode } & Record<
        string,
        unknown
      >) => <div {...strip(p)}>{children}</div>,
    },
  };
});

afterEach(() => cleanup());

// Minimal post type matching the component expectations
type TestPost = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  description?: string;
  readingTime?: string;
  tags?: string[];
  cover?: string;
};

describe("BlogListAnimated", () => {
  it("renders a list of posts with title and optional excerpt", () => {
    const posts: TestPost[] = [
      {
        slug: "one",
        title: "Post One",
        date: "2024-01-01",
        excerpt: "first excerpt",
        tags: ["a", "b"],
      },
      {
        slug: "two",
        title: "Post Two",
        date: "2024-02-01",
        description: "desc two",
      },
    ];
    render(<BlogListAnimated posts={posts} />);
    expect(screen.getByText("Post One")).toBeTruthy();
    expect(screen.getByText("first excerpt")).toBeTruthy();
    expect(screen.getByText("Post Two")).toBeTruthy();
    expect(screen.getByText("desc two")).toBeTruthy();
  });
});
