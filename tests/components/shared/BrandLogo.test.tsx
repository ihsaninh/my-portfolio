import { render } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import BrandLogo from "../../../src/shared/components/BrandLogo";

describe("BrandLogo", () => {
  it("renders with default props (sm, INH)", () => {
    const { container } = render(<BrandLogo />);
    const root = container.querySelector("span");
    expect(root).toBeTruthy();
    expect(root?.className).toMatch(/h-8\s+w-8/);
    expect(root?.className).toMatch(/text-\[11px\]/);
    expect(container.textContent).toContain("INH");
  });

  it("applies size variants correctly", () => {
    const { container: c1 } = render(<BrandLogo size="md" />);
    const root1 = c1.querySelector("span");
    expect(root1?.className).toMatch(/h-10\s+w-10/);
    expect(root1?.className).toMatch(/text-\[12px\]/);

    const { container: c2 } = render(<BrandLogo size="lg" />);
    const root2 = c2.querySelector("span");
    expect(root2?.className).toMatch(/h-12\s+w-12/);
    expect(root2?.className).toMatch(/text-\[13px\]/);
  });

  it("renders custom abbr and styles first letter", () => {
    const { container } = render(<BrandLogo abbr="AB" />);
    // Outer text should show full abbr
    expect(container.textContent).toContain("AB");
    // First letter wrapped with accent class
    const firstAccent = container.querySelector("span .text-accent");
    expect(firstAccent).toBeTruthy();
    expect(firstAccent?.textContent).toBe("A");
  });

  it("merges custom className", () => {
    const { container } = render(<BrandLogo className="custom-x" />);
    const root = container.querySelector("span");
    expect(root?.className).toMatch(/custom-x/);
  });
});
