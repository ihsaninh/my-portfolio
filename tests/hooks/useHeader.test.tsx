import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "bun:test";
import React from "react";

import { useHeaderService } from "../../src/hooks/useHeader";

function HookHarness() {
  const { navLinks, setActiveLink, setActiveLinkByScroll } = useHeaderService();

  return (
    <div>
      {/* sections to allow scrollToSection to find targets */}
      <section id="home" />
      <section id="resume" />
      <section id="skills" />
      <section id="work" />
      <section id="blog" />
      <section id="contact" />

      <ul>
        {navLinks.map((l) => (
          <li
            key={l.href}
            data-testid={l.href}
            data-active={String(l.isActive)}
          >
            {l.name}:{String(l.isActive)}
          </li>
        ))}
      </ul>

      {/* controls to invoke hook actions */}
      {navLinks.map((l) => (
        <div key={`controls-${l.href}`}>
          <button onClick={() => setActiveLink(l.href)}>
            activate-{l.href}
          </button>
          <button onClick={() => setActiveLinkByScroll(l.href)}>
            scroll-{l.href}
          </button>
        </div>
      ))}
    </div>
  );
}

describe("useHeaderService", () => {
  afterEach(() => cleanup());

  it("initializes with Home active", () => {
    render(<HookHarness />);
    expect(screen.getByTestId("#home").getAttribute("data-active")).toBe(
      "true"
    );
    expect(screen.getByTestId("#skills").getAttribute("data-active")).toBe(
      "false"
    );
  });

  it("setActiveLink sets the correct active link and clears others", () => {
    render(<HookHarness />);
    fireEvent.click(screen.getByText("activate-#skills"));
    expect(screen.getByTestId("#skills").getAttribute("data-active")).toBe(
      "true"
    );
    expect(screen.getByTestId("#home").getAttribute("data-active")).toBe(
      "false"
    );
  });

  it("setActiveLinkByScroll updates active link only when changed", () => {
    render(<HookHarness />);

    // Initially home is active
    expect(screen.getByTestId("#home").getAttribute("data-active")).toBe(
      "true"
    );

    // Calling with same href keeps state
    fireEvent.click(screen.getByText("scroll-#home"));
    expect(screen.getByTestId("#home").getAttribute("data-active")).toBe(
      "true"
    );

    // Changing to work
    fireEvent.click(screen.getByText("scroll-#work"));
    expect(screen.getByTestId("#work").getAttribute("data-active")).toBe(
      "true"
    );
    expect(screen.getByTestId("#home").getAttribute("data-active")).toBe(
      "false"
    );
  });
});
