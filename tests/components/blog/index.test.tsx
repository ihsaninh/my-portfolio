import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";
import type { ReactNode } from "react";

import BlogSection from "../../../src/features/portfolio/components/blog";

// Mock data provider for posts meta
mock.module("../../../src/shared/lib/mdx", () => ({
  __esModule: true,
  getAllPostsMeta: () => [
    {
      slug: "post-1",
      title: "First Post",
      date: "2024-01-01",
      excerpt: "Hello world",
    },
    {
      slug: "post-2",
      title: "Second Post",
      date: "2024-02-01",
    },
    {
      slug: "post-3",
      title: "Third Post",
      date: "2024-03-01",
    },
    {
      slug: "post-4",
      title: "Fourth Post",
      date: "2024-04-01",
    },
  ],
}));

// Strip framer-motion animation props
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
      div: ({
        children,
        ...p
      }: { children?: ReactNode } & Record<string, unknown>) => (
        <div {...strip(p)}>{children}</div>
      ),
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

afterEach(() => cleanup());

describe("BlogSection", () => {
  it("renders title and See all posts link", () => {
    render(<BlogSection />);
    expect(screen.getByRole("heading", { name: "Blog" })).toBeTruthy();
    const link = screen.getByRole("link", { name: "See all blog posts" });
    expect(link.getAttribute("href")).toBe("/blog");
  });

  it("renders first three posts from meta", () => {
    render(<BlogSection />);
    expect(screen.getByText("First Post")).toBeTruthy();
    expect(screen.getByText("Second Post")).toBeTruthy();
    expect(screen.getByText("Third Post")).toBeTruthy();
    // The 4th should not be shown in the section
    expect(screen.queryByText("Fourth Post")).toBeNull();
  });
});
