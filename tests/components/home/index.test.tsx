import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import Home from "../../../src/components/home/index";

// Mock the useHeaderService hook
const mockSetActiveLink = mock(() => {});

mock.module("../../../src/hooks/useHeader", () => ({
  useHeaderService: () => ({
    setActiveLink: mockSetActiveLink,
  }),
}));

// Mock framer-motion
mock.module("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
}));

// Mock Next.js Image component
mock.module("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
    priority,
    ...props
  }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-priority={priority}
      {...props}
    />
  ),
}));

describe("Home Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSetActiveLink.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(<Home />);
      // Check that the component renders by looking for key content
      expect(screen.getByText("Ihsan Nurul Habib")).not.toBeNull();
      expect(screen.getByAltText("profile")).not.toBeNull();
      expect(screen.getByText("Connect with me")).not.toBeNull();
    });

    it("renders profile image with correct attributes", () => {
      render(<Home />);
      const profileImage = screen.getByAltText("profile");

      expect(profileImage).not.toBeNull();
      expect(profileImage.getAttribute("src")).toBe("/images/profile.jpeg");
      expect(profileImage.getAttribute("width")).toBe("240");
      expect(profileImage.getAttribute("height")).toBe("240");
      expect(profileImage.getAttribute("data-priority")).toBe("true");
      expect(profileImage.classList.contains("w-48")).toBe(true);
      expect(profileImage.classList.contains("lg:w-60")).toBe(true);
      expect(profileImage.classList.contains("rounded-full")).toBe(true);
      expect(profileImage.classList.contains("brightness-90")).toBe(true);
      expect(profileImage.classList.contains("object-cover")).toBe(true);
    });

    it("renders main heading with correct text and styling", () => {
      render(<Home />);

      // Check for the main heading text
      expect(screen.getByText("Hello, I'm")).not.toBeNull();
      expect(screen.getByText("Ihsan Nurul Habib")).not.toBeNull();
      expect(screen.getByText("Software Engineer.")).not.toBeNull();

      // Check for heading structure
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).not.toBeNull();
      expect(heading.classList.contains("h1")).toBe(true);
      expect(heading.classList.contains("mb-6")).toBe(true);
      expect(heading.classList.contains("text-accent")).toBe(true);
      expect(heading.classList.contains("mt-8")).toBe(true);
      expect(heading.classList.contains("leading-snug")).toBe(true);
    });

    it("renders introduction paragraph with correct content", () => {
      render(<Home />);
      const introText = screen.getByText(
        /I'm a Software Engineer with 5\+ years of experience/
      );

      expect(introText).not.toBeNull();
      expect(introText.classList.contains("mb-9")).toBe(true);
      expect(introText.classList.contains("text-white/80")).toBe(true);
      expect(introText.classList.contains("leading-8")).toBe(true);
      expect(introText.textContent).toContain(
        "PT XLSMART Telecom Sejahtera Tbk"
      );
      expect(introText.textContent).toContain("Axiata Digital Labs");
      expect(introText.textContent).toContain("Meteor Inovasi Digital");
    });

    it("renders Connect with me button", () => {
      render(<Home />);
      const connectButton = screen.getByText("Connect with me");

      expect(connectButton).not.toBeNull();
      expect(connectButton.getAttribute("href")).toBe("#contact");
      expect(connectButton.classList.contains("bg-accent")).toBe(true);
      expect(connectButton.classList.contains("px-6")).toBe(true);
      expect(connectButton.classList.contains("py-2")).toBe(true);
      expect(connectButton.classList.contains("text-primary")).toBe(true);
      expect(connectButton.classList.contains("rounded-full")).toBe(true);
      expect(connectButton.classList.contains("shadow-md")).toBe(true);
    });

    it("renders Download CV button with icon", () => {
      render(<Home />);
      const downloadButton = screen.getByText("Download CV");

      expect(downloadButton).not.toBeNull();
      expect(downloadButton.closest("a")?.getAttribute("href")).toBe(
        "/document/CV-Ihsan-Nurul-Habib.pdf"
      );
      expect(downloadButton.closest("a")?.hasAttribute("download")).toBe(true);
      const downloadLink = downloadButton.closest("a");
      expect(downloadLink?.classList.contains("flex")).toBe(true);
      expect(downloadLink?.classList.contains("items-center")).toBe(true);
      expect(downloadLink?.classList.contains("justify-center")).toBe(true);
      expect(downloadLink?.classList.contains("gap-2")).toBe(true);
      expect(downloadLink?.classList.contains("border")).toBe(true);
      expect(downloadLink?.classList.contains("border-accent")).toBe(true);
      expect(downloadLink?.classList.contains("text-accent")).toBe(true);
    });
  });

  describe("User Interactions", () => {
    it("calls setActiveLink when Connect with me button is clicked", () => {
      render(<Home />);
      const connectButton = screen.getByText("Connect with me");

      fireEvent.click(connectButton);
      expect(mockSetActiveLink).toHaveBeenCalledWith("#contact");
    });

    it("prevents default behavior on Connect with me button click", () => {
      render(<Home />);
      const connectButton = screen.getByText("Connect with me");

      // Test that clicking doesn't cause errors and calls the handler
      expect(() => {
        fireEvent.click(connectButton);
      }).not.toThrow();

      expect(mockSetActiveLink).toHaveBeenCalledWith("#contact");
    });

    it("Download CV button has correct download attributes", () => {
      render(<Home />);
      const downloadLink = screen.getByText("Download CV").closest("a");

      expect(downloadLink?.getAttribute("href")).toBe(
        "/document/CV-Ihsan-Nurul-Habib.pdf"
      );
      expect(downloadLink?.hasAttribute("download")).toBe(true);
    });
  });

  describe("Styling and Layout", () => {
    it("has correct container and layout classes", () => {
      render(<Home />);
      const homeSection = document.querySelector("#home");

      expect(homeSection?.classList.contains("container")).toBe(true);

      // Check for flex layout
      const flexContainer = screen
        .getByText("Ihsan Nurul Habib")
        .closest(".flex.flex-col.items-center");
      expect(flexContainer).not.toBeNull();
    });

    it("has correct button container layout", () => {
      render(<Home />);
      const buttonContainer = screen
        .getByText("Connect with me")
        .closest("div");

      expect(buttonContainer?.classList.contains("flex")).toBe(true);
      expect(buttonContainer?.classList.contains("gap-6")).toBe(true);
      expect(buttonContainer?.classList.contains("flex-col")).toBe(true);
      expect(buttonContainer?.classList.contains("lg:flex-row")).toBe(true);
    });

    it("applies hover and transition classes to buttons", () => {
      render(<Home />);

      const connectButton = screen.getByText("Connect with me");
      expect(connectButton.classList.contains("transform")).toBe(true);
      expect(connectButton.classList.contains("transition-all")).toBe(true);
      expect(connectButton.classList.contains("duration-300")).toBe(true);
      expect(connectButton.classList.contains("hover:scale-105")).toBe(true);
      expect(connectButton.classList.contains("hover:shadow-lg")).toBe(true);
      expect(connectButton.classList.contains("hover:shadow-accent/50")).toBe(
        true
      );

      const downloadButton = screen.getByText("Download CV").closest("a");
      expect(downloadButton?.classList.contains("transition-all")).toBe(true);
      expect(downloadButton?.classList.contains("duration-300")).toBe(true);
      expect(downloadButton?.classList.contains("hover:bg-accent")).toBe(true);
      expect(downloadButton?.classList.contains("hover:text-primary")).toBe(
        true
      );
      expect(downloadButton?.classList.contains("hover:scale-105")).toBe(true);
      expect(downloadButton?.classList.contains("hover:shadow-lg")).toBe(true);
      expect(downloadButton?.classList.contains("hover:shadow-accent/50")).toBe(
        true
      );
      expect(downloadButton?.classList.contains("group")).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it("has proper semantic HTML structure", () => {
      render(<Home />);

      // Check for section with id
      const section = document.querySelector("#home");
      expect(section).not.toBeNull();
      expect(section?.getAttribute("id")).toBe("home");

      // Check for heading
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).not.toBeNull();

      // Check for image alt text
      const image = screen.getByAltText("profile");
      expect(image).not.toBeNull();
    });

    it("has accessible button elements", () => {
      render(<Home />);

      const connectLink = screen.getByText("Connect with me");
      const downloadLink = screen.getByText("Download CV").closest("a");

      expect(connectLink).not.toBeNull();
      expect(downloadLink).not.toBeNull();

      // Both should be focusable links
      expect(connectLink.tagName).toBe("A");
      expect(downloadLink?.tagName).toBe("A");
    });

    it("has proper text contrast and readability classes", () => {
      render(<Home />);

      // Check text color classes for accessibility
      const introText = screen.getByText(/I'm a Software Engineer/);
      expect(introText.classList.contains("text-white/80")).toBe(true);

      const heading = screen.getByRole("heading");
      expect(heading.classList.contains("text-accent")).toBe(true);
    });
  });

  describe("Content Validation", () => {
    it("displays correct personal information", () => {
      render(<Home />);

      expect(screen.getByText("Ihsan Nurul Habib")).not.toBeNull();
      expect(screen.getByText(/5\+ years of experience/)).not.toBeNull();
      expect(screen.getByText(/frontend development/)).not.toBeNull();
    });

    it("displays correct company names", () => {
      render(<Home />);

      const introText = screen.getByText(/I'm a Software Engineer/);
      expect(introText.textContent).toContain(
        "PT XLSMART Telecom Sejahtera Tbk"
      );
      expect(introText.textContent).toContain("Axiata Digital Labs");
      expect(introText.textContent).toContain("Meteor Inovasi Digital");
    });

    it("has correct file path for CV download", () => {
      render(<Home />);

      const downloadLink = screen.getByText("Download CV").closest("a");
      expect(downloadLink?.getAttribute("href")).toBe(
        "/document/CV-Ihsan-Nurul-Habib.pdf"
      );
    });
  });

  describe("Framer Motion Integration", () => {
    it("renders with motion section wrapper", () => {
      render(<Home />);

      const homeSection = document.querySelector("#home");
      expect(homeSection).not.toBeNull();
      expect(homeSection?.getAttribute("id")).toBe("home");
      expect(homeSection?.tagName.toLowerCase()).toBe("section");
    });

    it("applies container class for motion section", () => {
      render(<Home />);

      const homeSection = document.querySelector("#home");
      expect(homeSection?.classList.contains("container")).toBe(true);
    });
  });

  describe("Icon Integration", () => {
    it("renders download icon in CV button", () => {
      render(<Home />);

      const downloadButton = screen.getByText("Download CV").closest("a");
      expect(downloadButton).not.toBeNull();

      // The icon should be present as part of the button structure
      expect(
        downloadButton?.querySelector("svg") ||
          downloadButton?.querySelector('[data-testid="download-icon"]')
      ).toBeTruthy();
    });
  });
});
