import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";

import Header from "../../../src/components/shared/Header";

// Mock the useHeaderService hook
const mockSetActiveLink = mock(() => {});
const mockSetActiveLinkByScroll = mock(() => {});

const mockNavLinks = [
  { name: "Home", href: "#home", isActive: true },
  { name: "Resume", href: "#resume", isActive: false },
  { name: "Work", href: "#work", isActive: false },
  { name: "Contact", href: "#contact", isActive: false },
];

mock.module("../../../src/hooks/useHeader", () => ({
  useHeaderService: () => ({
    navLinks: mockNavLinks,
    setActiveLink: mockSetActiveLink,
    setActiveLinkByScroll: mockSetActiveLinkByScroll,
  }),
}));

// Mock next/navigation usePathname to simulate home route
mock.module("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock framer-motion to disable animations and render semantic tags directly
mock.module("framer-motion", () => {
  const AnimatePresence = ({
    children,
  }: {
    children?: import("react").ReactNode;
  }) => <>{children}</>;
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
  const motion = {
    nav: (
      props: import("react").ComponentPropsWithoutRef<"nav"> &
        FMAnimProps &
        Record<string, unknown>
    ) => {
      const { children, ...rest } = props;
      return <nav {...strip(rest)}>{children}</nav>;
    },
  };
  return { AnimatePresence, motion };
});

// Mock DOM methods and requestAnimationFrame globally
const mockRequestAnimationFrame = mock((cb) => {
  setTimeout(cb, 0);
  return 1;
});

Object.defineProperty(window, "scrollTo", {
  value: mock(() => {}),
  writable: true,
});

Object.defineProperty(window, "requestAnimationFrame", {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(global, "requestAnimationFrame", {
  value: mockRequestAnimationFrame,
  writable: true,
});

describe("Header Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSetActiveLink.mockClear();
    mockSetActiveLinkByScroll.mockClear();
    mockRequestAnimationFrame.mockClear();

    // Mock document.querySelector
    global.document.querySelector = mock((selector) => {
      if (selector.startsWith("#")) {
        return {
          getBoundingClientRect: () => ({
            top: 100,
            bottom: 200,
          }),
          scrollIntoView: mock(() => {}),
        };
      }
      return null;
    });
  });

  afterEach(() => {
    cleanup();
    // Reset window scroll position
    Object.defineProperty(window, "scrollY", {
      value: 0,
      writable: true,
    });
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(<Header />);
      const header = screen.getByRole("banner");
      expect(header).toBeTruthy();
    });

    it("renders brand logo/name", () => {
      render(<Header />);
      const brandLink = screen.getByLabelText("Go to home");
      expect(brandLink).toBeTruthy();
      expect(brandLink.getAttribute("href")?.endsWith("#home")).toBe(true);
      expect(screen.getByText("Ihsan Nurul Habib")).toBeTruthy();
    });

    it("renders all navigation links", () => {
      render(<Header />);

      expect(screen.getByText("Home")).toBeTruthy();
      expect(screen.getByText("Resume")).toBeTruthy();
      expect(screen.getByText("Work")).toBeTruthy();
      expect(screen.getByText("Contact")).toBeTruthy();
    });

    it("renders mobile hamburger menu button", () => {
      render(<Header />);
      const menuButton = screen.getByLabelText("Toggle navigation menu");
      expect(menuButton).toBeTruthy();
      expect(menuButton.getAttribute("aria-controls")).toBe("mobile-nav");
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("renders desktop navigation with proper structure", () => {
      render(<Header />);
      const nav = screen.getByRole("navigation", { name: "Main navigation" });
      expect(nav).toBeTruthy();

      const navList = screen.getByRole("list");
      expect(navList).toBeTruthy();

      // Includes 4 nav links + Download CV + ThemeToggle
      const navItems = screen.getAllByRole("listitem");
      expect(navItems.length).toBe(6);
    });
  });

  describe("Navigation Interactions", () => {
    it("calls setActiveLink when brand logo is clicked", () => {
      render(<Header />);
      const brandLink = screen.getByLabelText("Go to home");

      fireEvent.click(brandLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith("#home");
    });

    it("calls setActiveLink when navigation links are clicked", () => {
      render(<Header />);

      const homeLink = screen.getByText("Home");
      const resumeLink = screen.getByText("Resume");
      const workLink = screen.getByText("Work");
      const contactLink = screen.getByText("Contact");

      fireEvent.click(homeLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith("#home");

      fireEvent.click(resumeLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith("#resume");

      fireEvent.click(workLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith("#work");

      fireEvent.click(contactLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith("#contact");
    });

    it("shows active state for current navigation link", () => {
      render(<Header />);
      const homeLink = screen.getByText("Home");

      // Home should be active (based on mock data)
      expect(homeLink.classList.contains("text-accent")).toBe(true);
    });

    it("shows inactive state for non-current navigation links", () => {
      render(<Header />);
      const resumeLink = screen.getByText("Resume");
      const workLink = screen.getByText("Work");
      const contactLink = screen.getByText("Contact");

      // These should be inactive (based on mock data)
      expect(resumeLink.className).toMatch(/text-slate-800|dark:text-white/);
      expect(workLink.className).toMatch(/text-slate-800|dark:text-white/);
      expect(contactLink.className).toMatch(/text-slate-800|dark:text-white/);
    });
  });

  describe("Mobile Menu Functionality", () => {
    it("toggles mobile menu when hamburger button is clicked", async () => {
      render(<Header />);
      const menuButton = screen.getByLabelText("Toggle navigation menu");

      // Initially mobile nav should not be in the DOM
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" })
      ).toBeNull();
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");

      // Click to open menu
      fireEvent.click(menuButton);

      // Mobile nav should appear and aria-expanded should update
      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeTruthy();
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      // Click again to close menu
      fireEvent.click(menuButton);

      // Wait for exit animation to complete and element to be removed
      await waitFor(() => {
        expect(
          screen.queryByRole("navigation", { name: "Mobile navigation" })
        ).toBeNull();
      });
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("has proper hamburger menu structure (3 lines)", () => {
      render(<Header />);
      const menuButton = screen.getByLabelText("Toggle navigation menu");

      const wrapper = menuButton.querySelector(
        ".relative.block.h-4.w-5"
      ) as HTMLElement | null;
      expect(wrapper).toBeTruthy();
      const hamburgerLines = wrapper?.querySelectorAll("span") ?? [];
      expect(hamburgerLines.length).toBe(3);
    });
  });

  describe("Scroll Event Handling", () => {
    it("applies scrolled styles when scrolled down", async () => {
      // Set initial scrollY before render so initial onScroll captures it
      Object.defineProperty(window, "scrollY", { value: 100, writable: true });

      const { container } = render(<Header />);
      const header = container.querySelector("header");

      await waitFor(() => {
        expect(header?.classList.contains("backdrop-blur")).toBe(true);
      });
    });

    it("uses transparent styles at top of page", async () => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });

      const { container } = render(<Header />);
      const header = container.querySelector("header");

      await waitFor(() => {
        expect(header?.classList.contains("bg-transparent")).toBe(true);
      });
    });
  });

  describe("Scroll Spy Functionality", () => {
    it("sets up scroll event listener for scroll spy functionality", () => {
      const addEventListenerSpy = spyOn(window, "addEventListener");

      render(<Header />);

      // Verify that scroll event listener is added (with passive options)
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        expect.objectContaining({ passive: true })
      );
    });

    it("uses throttled scroll spy with requestAnimationFrame", async () => {
      render(<Header />);

      // Trigger multiple scroll events quickly
      fireEvent.scroll(window);
      fireEvent.scroll(window);
      fireEvent.scroll(window);

      // Should use requestAnimationFrame for throttling
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes for mobile menu", () => {
      render(<Header />);
      const menuButton = screen.getByLabelText("Toggle navigation menu");

      expect(menuButton.getAttribute("aria-label")).toBe(
        "Toggle navigation menu"
      );
      expect(menuButton.getAttribute("aria-controls")).toBe("mobile-nav");
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
      expect(menuButton.getAttribute("type")).toBe("button");
    });

    it("updates aria-expanded when menu is toggled", () => {
      render(<Header />);
      const menuButton = screen.getByLabelText("Toggle navigation menu");

      expect(menuButton.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("true");

      fireEvent.click(menuButton);
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("has proper navigation structure with semantic HTML", () => {
      render(<Header />);

      const header = screen.getByRole("banner");
      const nav = screen.getByRole("navigation", { name: "Main navigation" });
      const navList = screen.getByRole("list");
      const navItems = screen.getAllByRole("listitem");

      expect(header).toBeTruthy();
      expect(nav).toBeTruthy();
      expect(navList).toBeTruthy();
      expect(navItems.length).toBe(6); // 4 links + Download CV + ThemeToggle
    });
  });

  describe("Event Cleanup", () => {
    it("cleans up scroll event listeners on unmount", () => {
      const removeEventListenerSpy = spyOn(window, "removeEventListener");

      const { unmount } = render(<Header />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function)
      );
    });

    it("cleans up document click listener on unmount when menu was opened", () => {
      const removeEventListenerSpy = spyOn(document, "removeEventListener");

      render(<Header />);
      const menuButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(menuButton); // open menu which attaches document click listener

      // Unmount
      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });
  });
});
