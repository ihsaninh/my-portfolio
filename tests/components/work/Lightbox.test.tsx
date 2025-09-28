import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import React from "react";

import Lightbox from "../../../src/features/portfolio/components/work/Lightbox";
import { Project } from "../../../src/features/portfolio/types/project";

mock.module("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src as string} alt={alt as string} />
  ),
}));

// Mock framer-motion to strip animation props and render plain elements
mock.module("framer-motion", () => {
  type FMAnimKeys =
    | "initial"
    | "animate"
    | "exit"
    | "transition"
    | "variants"
    | "whileInView"
    | "whileinview"
    | "viewport";
  type FMAnimProps = Partial<Record<FMAnimKeys, unknown>>;
  const strip = <T extends Record<string, unknown>>(obj: T & FMAnimProps) => {
    const sanitized: Record<string, unknown> = { ...obj };
    const keys: FMAnimKeys[] = [
      "initial",
      "animate",
      "exit",
      "transition",
      "variants",
      "whileInView",
      "whileinview",
      "viewport",
    ];
    for (const k of keys) delete sanitized[k];
    return sanitized as Omit<T, FMAnimKeys>;
  };
  return {
    __esModule: true,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      div: (
        props: React.ComponentPropsWithoutRef<"div"> &
          FMAnimProps &
          Record<string, unknown>
      ) => {
        const { children, ...rest } = props;
        return <div {...strip(rest)}>{children}</div>;
      },
    },
  };
});

const projects: Project[] = [
  {
    num: "01",
    title: "Project One",
    description: "Description One",
    stack: ["React"],
    image: "/image-1.jpg",
    liveUrl: "https://one.test",
    githubUrl: "https://github.com/one",
  },
  {
    num: "02",
    title: "Project Two",
    description: "Description Two",
    stack: ["Next"],
    image: "/image-2.jpg",
    liveUrl: "https://two.test",
    githubUrl: "https://github.com/two",
  },
];

describe("Lightbox", () => {
  const onClose = mock(() => {});
  const onPrev = mock(() => {});
  const onNext = mock(() => {});

  beforeEach(() => {
    onClose.mockReset();
    onPrev.mockReset();
    onNext.mockReset();
    // Ensure body styles are clean before each test
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when closed", () => {
    render(
      <Lightbox
        projects={projects}
        index={0}
        open={false}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders dialog with image and metadata when open", () => {
    render(
      <Lightbox
        projects={projects}
        index={0}
        open={true}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    const dialog = screen.getByRole("dialog", { name: /lightbox/i });
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    // Image uses project title as alt
    expect(screen.getByAltText("Project One")).toBeTruthy();
    // Title and description visible
    expect(screen.getByText("Project One")).toBeTruthy();
    expect(screen.getByText("Description One")).toBeTruthy();

    // Dots indicator exists for multiple projects (loosely matched)
    const dotsCount = Array.from(dialog.querySelectorAll("span")).filter(
      (el) =>
        (el as HTMLElement).className.includes("rounded-full") &&
        (el as HTMLElement).className.includes("transition-all")
    ).length;
    expect(dotsCount).toBeGreaterThanOrEqual(1);
  });

  it("invokes onClose when backdrop is clicked", () => {
    render(
      <Lightbox
        projects={projects}
        index={0}
        open={true}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    const dialog = screen.getByRole("dialog", { name: /lightbox/i });
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when clicking inside content", () => {
    const { container } = render(
      <Lightbox
        projects={projects}
        index={0}
        open={true}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    const content = container.querySelector(
      ".relative.mx-4.w-full.max-w-6xl"
    ) as HTMLElement | null;
    expect(content).toBeTruthy();
    if (content) fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("close, prev and next controls work", () => {
    render(
      <Lightbox
        projects={projects}
        index={0}
        open={true}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    fireEvent.click(screen.getByLabelText("Close lightbox"));
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Previous image"));
    expect(onPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Next image"));
    expect(onNext).toHaveBeenCalled();
  });

  it("responds to keyboard events (Escape, ArrowLeft, ArrowRight)", () => {
    render(
      <Lightbox
        projects={projects}
        index={0}
        open={true}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(onClose).toHaveBeenCalled();
    expect(onPrev).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalled();
  });

  it("locks body scroll when open and restores on unmount", () => {
    const { unmount } = render(
      <Lightbox
        projects={projects}
        index={0}
        open={true}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
