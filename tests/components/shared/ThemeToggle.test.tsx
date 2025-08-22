import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import ThemeToggle from "../../../src/components/shared/ThemeToggle";

// Mock next-themes to control theme state and capture setTheme calls
let mockTheme: "light" | "dark" | "system" = "light";
const mockSetTheme = mock((next: string) => {
  mockTheme = next as typeof mockTheme;
});

mock.module("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    resolvedTheme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockTheme = "light";
    mockSetTheme.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a button with accessible attributes", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button");
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("shows Dark when current theme is light and toggles to dark on click", () => {
    mockTheme = "light";
    render(<ThemeToggle />);

    // After mount, should suggest switching to dark
    expect(screen.getByText("Dark")).toBeTruthy();
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-label")).toBe("Switch to dark mode");
    expect(btn.getAttribute("title")).toBe("Switch to dark mode");

    fireEvent.click(btn);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("shows Light when current theme is dark and toggles to light on click", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);

    // After mount, should suggest switching to light
    expect(screen.getByText("Light")).toBeTruthy();
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-label")).toBe("Switch to light mode");
    expect(btn.getAttribute("title")).toBe("Switch to light mode");

    fireEvent.click(btn);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});

