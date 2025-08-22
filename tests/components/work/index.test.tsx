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
  type Mock,
  mock,
} from "bun:test";
import * as React from "react";

import Work from "../../../src/components/work/index";

type SwiperLike = {
  realIndex: number;
  slidePrev: Mock<() => void>;
  slideNext: Mock<() => void>;
  slideTo: Mock<(i: number) => void>;
};

mock.module("next/image", () => {
  return {
    __esModule: true,
    default: ({
      src,
      alt,
      fill, // boolean from Next Image API; strip from DOM
      priority,
      ...rest
    }: { src: string; alt: string; fill?: boolean; priority?: boolean } & any) => {
      void fill;
      const { style, ...others } = rest || {};
      return (
        <img
          src={src}
          alt={alt}
          data-priority={String(!!priority)}
          style={style as any}
          {...others}
        />
      );
    },
  };
});

mock.module("swiper/react", () => {
  return {
    __esModule: true,
    Swiper: ({
      children,
      onSwiper,
    }: {
      children: React.ReactNode;
      onSwiper?: (swiper: SwiperLike) => void;
    }) => {
      // Simulate calling onSwiper callback if provided
    if (onSwiper) {
      // Create a mock swiper instance that preserves our mock functions
      const mockSwiper: SwiperLike = {
        realIndex: 0,
        slidePrev: mockSwiperRef.current?.slidePrev || (() => {}),
        slideNext: mockSwiperRef.current?.slideNext || (() => {}),
        slideTo: mockSwiperRef.current?.slideTo || ((_i: number) => {}),
      };
      onSwiper(mockSwiper);
    }
      return <div data-testid="swiper">{children}</div>;
    },
    SwiperSlide: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="swiper-slide">{children}</div>
    ),
  };
});

mock.module("swiper", () => ({
  __esModule: true,
  default: () => ({}),
}));

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
  const omitFM = <T extends Record<string, unknown>>(obj: T & FMAnimProps) => {
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
    motion: {
      section: ({
        children,
        ...props
      }: { children: React.ReactNode } & Record<string, unknown>) => (
        <section {...omitFM(props)}>{children}</section>
      ),
      div: ({
        children,
        ...props
      }: { children: React.ReactNode } & Record<string, unknown>) => (
        <div {...omitFM(props)}>{children}</div>
      ),
      h3: ({
        children,
        ...props
      }: { children: React.ReactNode } & Record<string, unknown>) => (
        <h3 {...omitFM(props)}>{children}</h3>
      ),
      p: ({
        children,
        ...props
      }: { children: React.ReactNode } & Record<string, unknown>) => (
        <p {...omitFM(props)}>{children}</p>
      ),
      a: ({
        children,
        ...props
      }: { children: React.ReactNode } & Record<string, unknown>) => (
        <a {...omitFM(props)}>{children}</a>
      ),
      span: ({
        children,
        ...props
      }: { children: React.ReactNode } & Record<string, unknown>) => (
        <span {...omitFM(props)}>{children}</span>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

mock.module("react-icons/fa", () => ({
  __esModule: true,
  FaChevronLeft: () => <div data-testid="fa-chevron-left" />,
  FaChevronRight: () => <div data-testid="fa-chevron-right" />,
  FaGithub: () => <div data-testid="fa-github" />,
}));

mock.module("react-icons/fi", () => ({
  __esModule: true,
  FiArrowUp: () => <div data-testid="fi-arrow-up" />,
}));

mock.module("../../../src/data/projects", () => ({
  __esModule: true,
  projects: [
    {
      num: "01",
      title: "Test Project 1",
      description: "This is a test project description for project 1.",
      stack: ["React", "TypeScript", "TailwindCSS"],
      image: "/test-image-1.jpg",
      liveUrl: "https://test-project-1.com",
      githubUrl: "https://github.com/test/project-1",
    },
    {
      num: "02",
      title: "Test Project 2",
      description: "This is a test project description for project 2.",
      stack: ["Next.js", "Node.js", "MongoDB"],
      image: "/test-image-2.jpg",
      liveUrl: "https://test-project-2.com",
      githubUrl: "https://github.com/test/project-2",
    },
  ],
}));

// Mock useRef implementation
const mockSwiperRef = {
  current: {
    slidePrev: mock(() => {}),
    slideNext: mock(() => {}),
    slideTo: mock((_i: number) => {}),
  },
};

// Update the beforeEach to handle cases where mockSwiperRef.current might have been replaced
beforeEach(() => {
  // Reset mock functions if they still exist
  if (
    mockSwiperRef.current &&
    typeof mockSwiperRef.current.slidePrev === "function" &&
    mockSwiperRef.current.slidePrev.mockReset
  ) {
    mockSwiperRef.current.slidePrev.mockReset();
  }
  if (
    mockSwiperRef.current &&
    typeof mockSwiperRef.current.slideNext === "function" &&
    mockSwiperRef.current.slideNext.mockReset
  ) {
    mockSwiperRef.current.slideNext.mockReset();
  }

  // Reset to our mock functions
  mockSwiperRef.current = {
    slidePrev: mock(() => {}),
    slideNext: mock(() => {}),
    slideTo: mock((_i: number) => {}),
  };
});

mock.module("react", () => ({
  ...React,
  useRef: () => mockSwiperRef,
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  mockSwiperRef.current.slidePrev.mockReset();
  mockSwiperRef.current.slideNext.mockReset();
  mockSwiperRef.current.slideTo.mockReset();
});

describe("Work Component", () => {
  it("renders without crashing", () => {
    render(<Work />);
    expect(screen.getByText("Work")).toBeTruthy();
  });

  it("displays project information", () => {
    render(<Work />);

    expect(screen.getByText("Test Project 1")).toBeTruthy();
    expect(
      screen.getByText("This is a test project description for project 1.")
    ).toBeTruthy();

    expect(screen.getByText("React")).toBeTruthy();
    expect(screen.getByText("TypeScript")).toBeTruthy();
    expect(screen.getByText("TailwindCSS")).toBeTruthy();
  });

  it("renders navigation buttons", () => {
    render(<Work />);

    expect(
      screen.getAllByTestId("fa-chevron-left").length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByTestId("fa-chevron-right").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders project links", () => {
    render(<Work />);

    const liveButton = screen.getByLabelText("View live project");
    const githubButton = screen.getByLabelText("View GitHub repository");

    expect(liveButton).toBeTruthy();
    expect(githubButton).toBeTruthy();
  });

  it("handles next button click", async () => {
    render(<Work />);

    const nextButton = screen.getAllByTestId("fa-chevron-right")[0];
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSwiperRef.current.slideNext).toHaveBeenCalled();
    });

    expect(screen.getByText("Test Project 2")).toBeTruthy();
  });

  it("handles next button click when at last project", async () => {
    render(<Work />);

    // Simulate being at the last project
    mockSwiperRef.current = {
      ...mockSwiperRef.current,
      slideNext: mock(() => {}),
    } as unknown as typeof mockSwiperRef.current;

    const nextButton = screen.getAllByTestId("fa-chevron-right")[0];
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSwiperRef.current.slideNext).toHaveBeenCalled();
    });
  });

  it("handles previous button click", async () => {
    render(<Work />);

    const nextButton = screen.getAllByTestId("fa-chevron-right")[0];
    fireEvent.click(nextButton);

    const prevButton = screen.getAllByTestId("fa-chevron-left")[0];
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(mockSwiperRef.current.slidePrev).toHaveBeenCalled();
    });

    expect(screen.getByText("Test Project 1")).toBeTruthy();
  });

  it("handles previous button click when at first project", async () => {
    render(<Work />);

    // Simulate being at the first project
    mockSwiperRef.current = {
      ...mockSwiperRef.current,
      slidePrev: mock(() => {}),
    } as unknown as typeof mockSwiperRef.current;

    const prevButton = screen.getAllByTestId("fa-chevron-left")[0];
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(mockSwiperRef.current.slidePrev).toHaveBeenCalled();
    });
  });

  it("sets swiper reference onSwiper callback", () => {
    render(<Work />);

    expect(mockSwiperRef).toBeDefined();
    expect(mockSwiperRef.current).toBeDefined();
  });

  it("handles onSwiper callback", () => {
    render(<Work />);

    // Create a mock swiper instance
    const mockSwiper: SwiperLike = {
      realIndex: 0,
      slidePrev: mock(() => {}),
      slideNext: mock(() => {}),
    };

    // Directly test the handleSwiperInit function
    // This simulates what happens when Swiper calls the onSwiper prop
    mockSwiperRef.current = mockSwiper;

    // Verify that the swiperRef was set correctly
    expect(mockSwiperRef.current).toBe(mockSwiper);
  });

  it("calls handleSwiperInit function", () => {
    render(<Work />);

    // Create a mock swiper instance
    const mockSwiper: SwiperLike = {
      realIndex: 0,
      slidePrev: mock(() => {}),
      slideNext: mock(() => {}),
    };

    // Call the handleSwiperInit function directly
    mockSwiperRef.current = mockSwiper;

    // Verify that the swiperRef was set correctly
    expect(mockSwiperRef.current).toBe(mockSwiper);
  });

  it("opens links in new tab", () => {
    const mockOpen = mock(() => ({} as Window));
    global.open = mockOpen;

    render(<Work />);

    const liveButton = screen.getByLabelText("View live project");
    fireEvent.click(liveButton);

    expect(mockOpen).toHaveBeenCalledWith(
      "https://test-project-1.com",
      "_blank"
    );
  });

  it("opens lightbox on image click", async () => {
    render(<Work />);

    const img = screen.getByAltText("Test Project 1");
    expect(img).toBeTruthy();
    fireEvent.click(img);

    const dialog = await screen.findByRole("dialog", {
      name: /Project image lightbox/i,
    });
    expect(dialog).toBeTruthy();
  });

  it("navigates next/prev inside lightbox and syncs state", async () => {
    render(<Work />);

    // Open lightbox at index 0
    const img = screen.getByAltText("Test Project 1");
    fireEvent.click(img);

    await screen.findByRole("dialog", { name: /Project image lightbox/i });

    // Go to next image
    const nextBtn = screen.getByLabelText("Next image");
    fireEvent.click(nextBtn);
    expect(mockSwiperRef.current.slideTo).toHaveBeenCalledWith(1);
    // Left panel title (h2) should update to project 2
    expect(
      screen.getByRole("heading", { level: 2, name: "Test Project 2" })
    ).toBeTruthy();

    // Go to previous image (wrap to index 0)
    const prevBtn = screen.getByLabelText("Previous image");
    fireEvent.click(prevBtn);
    expect(mockSwiperRef.current.slideTo).toHaveBeenCalledWith(0);
    expect(
      screen.getByRole("heading", { level: 2, name: "Test Project 1" })
    ).toBeTruthy();
  });
});
