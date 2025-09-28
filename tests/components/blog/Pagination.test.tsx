import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "bun:test";

import Pagination from "../../../src/features/portfolio/components/blog/Pagination";

afterEach(() => cleanup());

describe("Pagination", () => {
  it("renders pages and disables prev/next at boundaries (path style)", () => {
    render(<Pagination current={1} totalPages={5} basePath="/blog" />);

    // Prev disabled on first
    const prev = screen.getByRole("link", { name: /Prev/i });
    expect(prev.getAttribute("aria-disabled")).toBe("true");
    expect(prev.getAttribute("href")).toBe("#");

    // Page links
    expect(screen.getByRole("link", { name: "1" }).getAttribute("href")).toBe(
      "/blog"
    );
    expect(screen.getByRole("link", { name: "2" }).getAttribute("href")).toBe(
      "/blog/page/2"
    );

    // Next enabled
    const next = screen.getByRole("link", { name: /Next/i });
    expect(next.getAttribute("aria-disabled")).toBe("false");
    expect(next.getAttribute("href")).toBe("/blog/page/2");
  });

  it("disables next on last page and builds query param URLs", () => {
    render(
      <Pagination
        current={3}
        totalPages={3}
        basePath="/articles"
        queryParam="page"
      />
    );

    // Prev enabled
    const prev = screen.getByRole("link", { name: /Prev/i });
    expect(prev.getAttribute("aria-disabled")).toBe("false");
    expect(prev.getAttribute("href")).toBe("/articles?page=2");

    // Page 1 link without query param
    expect(screen.getByRole("link", { name: "1" }).getAttribute("href")).toBe(
      "/articles"
    );
    expect(screen.getByRole("link", { name: "2" }).getAttribute("href")).toBe(
      "/articles?page=2"
    );

    // Next disabled
    const next = screen.getByRole("link", { name: /Next/i });
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(next.getAttribute("href")).toBe("#");
  });
});
