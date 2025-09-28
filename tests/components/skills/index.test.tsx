import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, mock } from "bun:test";

import Skills from "../../../src/features/portfolio/components/skills";
import { skills } from "../../../src/features/portfolio/data/resume";

const mockFramerMotion = () => {
  const stripAnimProps = <T extends Record<string, unknown>>(props: T): T => {
    const clone: T = { ...props };
    for (const k of [
      "initial",
      "animate",
      "exit",
      "transition",
      "variants",
      "whileInView",
      "whileinview",
      "viewport",
      "layout",
    ])
      delete (clone as Record<string, unknown>)[k];
    return clone;
  };
  return {
    motion: {
      ul: ({ children, className, ...props }: React.ComponentProps<"ul">) => (
        <ul className={className} {...stripAnimProps(props)}>
          {children}
        </ul>
      ),
      li: ({ children, className, ...props }: React.ComponentProps<"li">) => (
        <li className={className} {...stripAnimProps(props)}>
          {children}
        </li>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
};

mock.module("framer-motion", mockFramerMotion);

describe("Skills Component", () => {
  afterEach(() => cleanup());

  it("renders section with title and id", () => {
    render(<Skills />);
    const section = document.querySelector("#skills");
    expect(section).not.toBeNull();
    expect(screen.getByText("Skills")).toBeTruthy();
  });

  it("renders one card per skill with icon and name", () => {
    render(<Skills />);
    const items = document.querySelectorAll("#skills ul li");
    expect(items.length).toBe(skills.length);
    for (const s of skills) {
      expect(screen.getByText(s.name)).toBeTruthy();
      const li = screen.getByTitle(s.name);
      expect(li).toBeTruthy();
      const svg = li.querySelector("svg");
      expect(svg).toBeTruthy();
    }
  });

  it("applies grid layout classes on the list", () => {
    const { container } = render(<Skills />);
    const list = container.querySelector("#skills ul");
    expect(list).not.toBeNull();
    expect(list?.classList.contains("grid")).toBe(true);
    expect(list?.classList.contains("grid-cols-2")).toBe(true);
  });
});
