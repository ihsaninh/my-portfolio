import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";
import type { ComponentProps } from "react";

import CertificationsList from "../../../src/features/portfolio/components/resume/CertificationsList";
import type { Certification } from "../../../src/features/portfolio/types/resume";

// Mock framer-motion to strip animation props
mock.module("framer-motion", () => {
  type FMProps = Record<string, unknown>;
  const omitAnim = (props: FMProps) => {
    const clone: FMProps = { ...props };
    for (const k of [
      "initial",
      "animate",
      "exit",
      "transition",
      "variants",
      "whileInView",
      "viewport",
      "layout",
    ])
      delete clone[k];
    return clone;
  };
  return {
    __esModule: true,
    motion: {
      ul: ({ children, ...p }: ComponentProps<"ul">) => (
        <ul {...omitAnim(p)}>{children}</ul>
      ),
      li: ({ children, ...p }: ComponentProps<"li">) => (
        <li {...omitAnim(p)}>{children}</li>
      ),
      div: ({ children, ...p }: ComponentProps<"div">) => (
        <div {...omitAnim(p)}>{children}</div>
      ),
      span: ({ children, ...p }: ComponentProps<"span">) => (
        <span {...omitAnim(p)}>{children}</span>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

afterEach(() => cleanup());

const certs: Certification[] = [
  {
    title: "React Developer",
    company: "HackerRank",
    issuedDate: "2024",
    credentialId: "ABC123",
    credentialUrl: "https://example.com/cert/abc123",
  },
  {
    title: "TypeScript Basics",
    company: "Udemy",
    issuedDate: "2023",
  },
  {
    title: "Next.js Advanced",
    company: "Some Org",
    issuedDate: "2022",
    credentialUrl: "https://example.com/cert/next",
  },
];

describe("CertificationsList", () => {
  it("renders and limits items by initialVisible", () => {
    render(<CertificationsList items={certs} initialVisible={2} />);

    // First two visible
    expect(screen.getByText("React Developer")).toBeTruthy();
    expect(screen.getByText("TypeScript Basics")).toBeTruthy();
    // Third is hidden until expanded
    expect(screen.queryByText("Next.js Advanced")).toBeNull();

    // Toggle shows all
    const toggle = screen.getByRole("button", { name: /Show all \(3\)/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByText("Next.js Advanced")).toBeTruthy();
    expect(toggle.textContent).toBe("Show less");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders credential link with correct attributes when available", () => {
    render(<CertificationsList items={[certs[0]]} />);

    const link = screen.getByRole("link", { name: /View credential/i });
    expect(link.getAttribute("href")).toBe("https://example.com/cert/abc123");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
    // Includes ID in title/aria when provided
    expect(link.getAttribute("title")).toBe("ID: ABC123");
    expect(link.getAttribute("aria-label")).toMatch(/ID: ABC123/);
  });

  it("omits credential link when URL is missing", () => {
    render(<CertificationsList items={[certs[1]]} />);
    expect(screen.queryByRole("link", { name: /View credential/i })).toBeNull();
  });
});
