import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";
import type React from "react";

import Resume from "../../../src/features/portfolio/components/resume";

// Mock framer-motion to remove animation-only props and wrappers
mock.module("framer-motion", () => {
  type FMProps = Record<string, unknown>;
  const strip = (p: FMProps) => {
    const c: FMProps = { ...p };
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
      delete c[k];
    return c;
  };
  return {
    __esModule: true,
    motion: {
      div: ({ children, ...p }: React.ComponentPropsWithoutRef<"div">) => (
        <div {...strip(p)}>{children}</div>
      ),
      ul: ({ children, ...p }: React.ComponentPropsWithoutRef<"ul">) => (
        <ul {...strip(p)}>{children}</ul>
      ),
      li: ({ children, ...p }: React.ComponentPropsWithoutRef<"li">) => (
        <li {...strip(p)}>{children}</li>
      ),
      span: ({ children, ...p }: React.ComponentPropsWithoutRef<"span">) => (
        <span {...strip(p)}>{children}</span>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

afterEach(() => cleanup());

describe("Resume (index)", () => {
  it("renders section title and menu buttons", () => {
    render(<Resume />);
    expect(screen.getByRole("heading", { name: "Resume" })).toBeTruthy();

    // Menu buttons from data
    expect(screen.getByRole("button", { name: "Experiences" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Educations" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Certifications" })).toBeTruthy();
  });

  it("shows Experiences by default and switches content on click", () => {
    render(<Resume />);

    // Default is experiences
    expect(
      screen.getByRole("heading", { name: "My Experiences" })
    ).toBeTruthy();
    // company from example data set
    expect(screen.getByText(/PT XLSMART Telecom Sejahtera Tbk/)).toBeTruthy();

    // Switch to Educations
    fireEvent.click(screen.getByRole("button", { name: "Educations" }));
    expect(screen.getByRole("heading", { name: "My Educations" })).toBeTruthy();
    expect(screen.getByText(/SMK Negeri 2 Bogor/)).toBeTruthy();

    // Switch to Certifications
    fireEvent.click(screen.getByRole("button", { name: "Certifications" }));
    expect(
      screen.getByRole("heading", { name: "My Certifications" })
    ).toBeTruthy();
    // At least one credential link exists from data
    expect(
      screen.getAllByRole("link", { name: /View credential/i }).length
    ).toBeGreaterThanOrEqual(1);
  });
});
