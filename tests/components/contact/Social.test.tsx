import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";
import type React from "react";

import Social from "../../../src/features/portfolio/components/contact/Social";
import { socials } from "../../../src/features/portfolio/data/socials";

// Mock Next.js Link component to prevent conflicts
mock.module("next/link", () => ({
  default: ({
    children,
    href,
    target,
    rel,
    className,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} target={target} rel={rel} className={className} {...rest}>
      {children}
    </a>
  ),
}));

describe("Social Component", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders all social media links by label", () => {
    render(<Social />);
    for (const s of socials) {
      expect(screen.getByRole("link", { name: s.label })).toBeTruthy();
    }
  });

  it("renders correct number of social links", () => {
    render(<Social />);
    const socialLinks = screen.getAllByRole("link");
    expect(socialLinks).toHaveLength(socials.length);
  });

  it("has correct href attributes for each social link", () => {
    render(<Social />);
    const socialLinks = screen.getAllByRole("link");
    expect(socialLinks).toHaveLength(socials.length);
    socialLinks.forEach((link, i) => {
      expect(link.getAttribute("href")).toBe(socials[i].link);
    });
  });

  it("has proper accessibility attributes", () => {
    render(<Social />);
    const socialLinks = screen.getAllByRole("link");
    socialLinks.forEach((link, i) => {
      expect(link.hasAttribute("aria-label")).toBe(true);
      expect(link.getAttribute("aria-label")).toBe(socials[i].label);
    });
  });

  it("renders icons inside each link", () => {
    render(<Social />);
    const socialLinks = screen.getAllByRole("link");
    expect(socialLinks.length).toBe(socials.length);
    socialLinks.forEach((link) => {
      expect(link.querySelector("svg")).toBeTruthy();
    });
  });

  it("applies custom container class when provided", () => {
    const customClass = "custom-container-class";
    const { container } = render(<Social containerClass={customClass} />);

    // Check that the container div has the custom class
    const socialContainer = container.querySelector("div");
    expect(socialContainer?.classList.contains(customClass)).toBe(true);
  });

  it("applies custom iconClass to icons when provided", () => {
    const customIconClass = "custom-icon-class";
    render(<Social iconClass={customIconClass} />);
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      expect(svg.classList.contains(customIconClass)).toBe(true);
    });
  });

  it("renders with default empty classes when no props provided", () => {
    const { container } = render(<Social />);

    // Should render a div container (the parent div)
    const socialContainer = container.firstChild as HTMLElement;
    expect(socialContainer).not.toBeNull();
    expect(socialContainer.className).toBe(""); // Empty class by default
  });

  it("renders social links in correct order", () => {
    render(<Social />);
    const socialLinks = screen.getAllByRole("link");
    socialLinks.forEach((link, i) => {
      expect(link.getAttribute("aria-label")).toBe(socials[i].label);
    });
  });

  it("uses Next.js Link component for navigation", () => {
    render(<Social />);
    const socialLinks = screen.getAllByRole("link");
    // All links should render as anchors in test env
    socialLinks.forEach((link) => expect(link.tagName).toBe("A"));
  });
});
