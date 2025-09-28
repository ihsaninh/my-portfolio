import { render } from "@testing-library/react";
import { describe, expect, it, mock } from "bun:test";

import ScrollToTop from "../../../src/shared/components/ScrollToTop";

describe("ScrollToTop", () => {
  it("scrolls to top on mount", () => {
    const original = window.scrollTo;
    const scrollMock = mock(() => {});
    // Ensure writable
    Object.defineProperty(window, "scrollTo", {
      value: scrollMock,
      writable: true,
    });

    render(<ScrollToTop />);

    expect(scrollMock).toHaveBeenCalledWith({ top: 0, behavior: "auto" });

    // restore
    Object.defineProperty(window, "scrollTo", {
      value: original,
      writable: true,
    });
  });
});
