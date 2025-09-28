import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";
import React from "react";

import CopyCodeClient from "@/src/features/portfolio/components/blog/CopyCodeClient";

afterEach(() => cleanup());

describe("CopyCodeClient", () => {
  it("copies code text on copy button click and sets data attribute", async () => {
    const writeText = mock(() => Promise.resolve());
    Object.defineProperty(global.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <div>
        <CopyCodeClient />
        <div className="code-block">
          <button data-copy-code type="button">
            Copy
          </button>
          <pre>
            <code>console.log(&apos;hello&apos;)</code>
          </pre>
        </div>
      </div>
    );

    const btn = screen.getByText("Copy");
    fireEvent.click(btn);

    expect(writeText).toHaveBeenCalledWith("console.log('hello')");
    await waitFor(() => {
      expect(btn.getAttribute("data-copied")).toBe("true");
    });
  });
});
