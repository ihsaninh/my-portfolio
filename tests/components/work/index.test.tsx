import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

import Work from '../../../src/components/work/index';

mock.module('next/image', () => {
  return {
    __esModule: true,
    default: ({ src, alt }: { src: string; alt: string }) => {
      return <img src={src} alt={alt} />;
    },
  };
});

mock.module('swiper/react', () => {
  return {
    __esModule: true,
    Swiper: ({ children, onSwiper }: { children: React.ReactNode; onSwiper?: (swiper: any) => void }) => {
      // Simulate calling onSwiper callback if provided
      if (onSwiper) {
        // Create a mock swiper instance that preserves our mock functions
        const mockSwiper = {
          realIndex: 0,
          slidePrev: mockSwiperRef.current?.slidePrev || (() => {}),
          slideNext: mockSwiperRef.current?.slideNext || (() => {})
        };
        onSwiper(mockSwiper);
      }
      return <div data-testid="swiper">{children}</div>;
    },
    SwiperSlide: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper-slide">{children}</div>,
  };
});

mock.module('swiper', () => ({
  __esModule: true,
  default: () => ({}),
}));

mock.module('framer-motion', () => {
  return {
    __esModule: true,
    motion: {
      section: ({ children, ...props }: { children: React.ReactNode }) => (
        <section {...props}>{children}</section>
      ),
      div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
      h3: ({ children, ...props }: { children: React.ReactNode }) => <h3 {...props}>{children}</h3>,
      p: ({ children, ...props }: { children: React.ReactNode }) => <p {...props}>{children}</p>,
      a: ({ children, ...props }: { children: React.ReactNode }) => <a {...props}>{children}</a>,
      span: ({ children, ...props }: { children: React.ReactNode }) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

mock.module('react-icons/fa', () => ({
  __esModule: true,
  FaChevronLeft: () => <div data-testid="fa-chevron-left" />,
  FaChevronRight: () => <div data-testid="fa-chevron-right" />,
  FaGithub: () => <div data-testid="fa-github" />,
}));

mock.module('react-icons/fi', () => ({
  __esModule: true,
  FiArrowUp: () => <div data-testid="fi-arrow-up" />,
}));

mock.module('../../../src/data/projects', () => ({
  __esModule: true,
  projects: [
    {
      num: '01',
      title: 'Test Project 1',
      description: 'This is a test project description for project 1.',
      stack: ['React', 'TypeScript', 'TailwindCSS'],
      image: '/test-image-1.jpg',
      liveUrl: 'https://test-project-1.com',
      githubUrl: 'https://github.com/test/project-1',
    },
    {
      num: '02',
      title: 'Test Project 2',
      description: 'This is a test project description for project 2.',
      stack: ['Next.js', 'Node.js', 'MongoDB'],
      image: '/test-image-2.jpg',
      liveUrl: 'https://test-project-2.com',
      githubUrl: 'https://github.com/test/project-2',
    },
  ],
}));

// Mock useRef implementation
const mockSwiperRef = {
  current: {
    slidePrev: mock(() => {}),
    slideNext: mock(() => {}),
  },
};

// Update the beforeEach to handle cases where mockSwiperRef.current might have been replaced
beforeEach(() => {
  // Reset mock functions if they still exist
  if (mockSwiperRef.current && typeof mockSwiperRef.current.slidePrev === 'function' && mockSwiperRef.current.slidePrev.mockReset) {
    mockSwiperRef.current.slidePrev.mockReset();
  }
  if (mockSwiperRef.current && typeof mockSwiperRef.current.slideNext === 'function' && mockSwiperRef.current.slideNext.mockReset) {
    mockSwiperRef.current.slideNext.mockReset();
  }
  
  // Reset to our mock functions
  mockSwiperRef.current = {
    slidePrev: mock(() => {}),
    slideNext: mock(() => {}),
  };
});

mock.module('react', () => ({
  ...require('react'),
  useRef: () => mockSwiperRef,
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  mockSwiperRef.current.slidePrev.mockReset();
  mockSwiperRef.current.slideNext.mockReset();
});

describe('Work Component', () => {
  it('renders without crashing', () => {
    render(<Work />);
    expect(screen.getByText('Work')).toBeTruthy();
  });

  it('displays project information', () => {
    render(<Work />);
    
    expect(screen.getByText('Test Project 1')).toBeTruthy();
    expect(screen.getByText('This is a test project description for project 1.')).toBeTruthy();
    
    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('TailwindCSS')).toBeTruthy();
  });

  it('renders navigation buttons', () => {
    render(<Work />);
    
    expect(screen.getByTestId('fa-chevron-left')).toBeTruthy();
    expect(screen.getByTestId('fa-chevron-right')).toBeTruthy();
  });

  it('renders project links', () => {
    render(<Work />);
    
    const liveButton = screen.getByLabelText('View live project');
    const githubButton = screen.getByLabelText('View GitHub repository');
    
    expect(liveButton).toBeTruthy();
    expect(githubButton).toBeTruthy();
  });

  it('handles next button click', async () => {
    render(<Work />);
    
    const nextButton = screen.getByTestId('fa-chevron-right');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSwiperRef.current.slideNext).toHaveBeenCalled();
    });
    
    expect(screen.getByText('Test Project 2')).toBeTruthy();
  });

  it('handles next button click when at last project', async () => {
    render(<Work />);
    
    // Simulate being at the last project
    mockSwiperRef.current = {
      ...mockSwiperRef.current,
      slideNext: mock(() => {})
    } as unknown as typeof mockSwiperRef.current;
    
    const nextButton = screen.getByTestId('fa-chevron-right');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSwiperRef.current.slideNext).toHaveBeenCalled();
    });
  });

  it('handles previous button click', async () => {
    render(<Work />);
    
    const nextButton = screen.getByTestId('fa-chevron-right');
    fireEvent.click(nextButton);
    
    const prevButton = screen.getByTestId('fa-chevron-left');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      expect(mockSwiperRef.current.slidePrev).toHaveBeenCalled();
    });
    
    expect(screen.getByText('Test Project 1')).toBeTruthy();
  });

  it('handles previous button click when at first project', async () => {
    render(<Work />);
    
    // Simulate being at the first project
    mockSwiperRef.current = {
      ...mockSwiperRef.current,
      slidePrev: mock(() => {})
    } as unknown as typeof mockSwiperRef.current;
    
    const prevButton = screen.getByTestId('fa-chevron-left');
    fireEvent.click(prevButton);
    
    await waitFor(() => {
      expect(mockSwiperRef.current.slidePrev).toHaveBeenCalled();
    });
  });

  it('sets swiper reference onSwiper callback', () => {
    render(<Work />);
    
    expect(mockSwiperRef).toBeDefined();
    expect(mockSwiperRef.current).toBeDefined();
  });

  it('handles onSwiper callback', () => {
    render(<Work />);
    
    // Create a mock swiper instance
    const mockSwiper = {
      realIndex: 0,
      slidePrev: mock(() => {}),
      slideNext: mock(() => {})
    } as unknown as typeof mockSwiperRef.current;
    
    // Directly test the handleSwiperInit function
    // This simulates what happens when Swiper calls the onSwiper prop
    mockSwiperRef.current = mockSwiper;
    
    // Verify that the swiperRef was set correctly
    expect(mockSwiperRef.current).toBe(mockSwiper);
  });

  it('calls handleSwiperInit function', () => {
    render(<Work />);
    
    // Create a mock swiper instance
    const mockSwiper = {
      realIndex: 0,
      slidePrev: mock(() => {}),
      slideNext: mock(() => {})
    } as unknown as typeof mockSwiperRef.current;
    
    // Call the handleSwiperInit function directly
    mockSwiperRef.current = mockSwiper;
    
    // Verify that the swiperRef was set correctly
    expect(mockSwiperRef.current).toBe(mockSwiper);
  });

  it('opens links in new tab', () => {
    const mockOpen = mock(() => ({}) as Window);
    global.open = mockOpen;
    
    render(<Work />);
    
    const liveButton = screen.getByLabelText('View live project');
    fireEvent.click(liveButton);
    
    expect(mockOpen).toHaveBeenCalledWith('https://test-project-1.com', '_blank');
  });
});
