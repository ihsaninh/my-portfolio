import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';

import Header from '../../../src/components/shared/Header';

// Mock the useHeaderService hook
const mockSetActiveLink = mock(() => {});
const mockSetActiveLinkByScroll = mock(() => {});

const mockNavLinks = [
  { name: 'Home', href: '#home', isActive: true },
  { name: 'Resume', href: '#resume', isActive: false },
  { name: 'Work', href: '#work', isActive: false },
  { name: 'Contact', href: '#contact', isActive: false },
];

mock.module('../../../src/hooks/useHeader', () => ({
  useHeaderService: () => ({
    navLinks: mockNavLinks,
    setActiveLink: mockSetActiveLink,
    setActiveLinkByScroll: mockSetActiveLinkByScroll,
  }),
}));

// Mock DOM methods and requestAnimationFrame globally
const mockRequestAnimationFrame = mock((cb) => {
  setTimeout(cb, 0);
  return 1;
});

Object.defineProperty(window, 'scrollTo', {
  value: mock(() => {}),
  writable: true,
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

describe('Header Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSetActiveLink.mockClear();
    mockSetActiveLinkByScroll.mockClear();
    mockRequestAnimationFrame.mockClear();
    
    // Mock document.querySelector
    global.document.querySelector = mock((selector) => {
      if (selector.startsWith('#')) {
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
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toBeTruthy();
    });

    it('renders brand logo/name', () => {
      render(<Header />);
      const brandLink = screen.getByText('Ihsan');
      expect(brandLink).toBeTruthy();
      expect(brandLink.getAttribute('href')).toBe('#home');
    });

    it('renders all navigation links', () => {
      render(<Header />);
      
      expect(screen.getByText('Home')).toBeTruthy();
      expect(screen.getByText('Resume')).toBeTruthy();
      expect(screen.getByText('Work')).toBeTruthy();
      expect(screen.getByText('Contact')).toBeTruthy();
    });

    it('renders mobile hamburger menu button', () => {
      render(<Header />);
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      expect(menuButton).toBeTruthy();
      expect(menuButton.getAttribute('aria-controls')).toBe('main-nav');
      expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    });

    it('renders navigation with proper structure', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeTruthy();
      expect(nav.getAttribute('id')).toBe('main-nav');
      
      const navList = screen.getByRole('list');
      expect(navList).toBeTruthy();
    });
  });

  describe('Navigation Interactions', () => {
    it('calls setActiveLink when brand logo is clicked', () => {
      render(<Header />);
      const brandLink = screen.getByText('Ihsan');
      
      fireEvent.click(brandLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith('#home');
    });

    it('calls setActiveLink when navigation links are clicked', () => {
      render(<Header />);
      
      const homeLink = screen.getByText('Home');
      const resumeLink = screen.getByText('Resume');
      const workLink = screen.getByText('Work');
      const contactLink = screen.getByText('Contact');
      
      fireEvent.click(homeLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith('#home');
      
      fireEvent.click(resumeLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith('#resume');
      
      fireEvent.click(workLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith('#work');
      
      fireEvent.click(contactLink);
      expect(mockSetActiveLink).toHaveBeenCalledWith('#contact');
    });

    it('shows active state for current navigation link', () => {
      render(<Header />);
      const homeLink = screen.getByText('Home');
      
      // Home should be active (based on mock data)
      expect(homeLink.classList.contains('text-accent')).toBe(true);
    });

    it('shows inactive state for non-current navigation links', () => {
      render(<Header />);
      const resumeLink = screen.getByText('Resume');
      const workLink = screen.getByText('Work');
      const contactLink = screen.getByText('Contact');
      
      // These should be inactive (based on mock data)
      expect(resumeLink.classList.contains('text-white')).toBe(true);
      expect(workLink.classList.contains('text-white')).toBe(true);
      expect(contactLink.classList.contains('text-white')).toBe(true);
    });
  });

  describe('Mobile Menu Functionality', () => {
    it('toggles mobile menu when hamburger button is clicked', () => {
      const { container } = render(<Header />);
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      const nav = screen.getByRole('navigation');
      
      // Initially menu should be hidden
      expect(nav.classList.contains('hidden')).toBe(true);
      expect(menuButton.getAttribute('aria-expanded')).toBe('false');
      
      // Click to open menu
      fireEvent.click(menuButton);
      
      // Check if classes are toggled (hamburger-active and hidden removal)
      expect(menuButton.classList.contains('hamburger-active')).toBe(true);
      expect(nav.classList.contains('hidden')).toBe(false);
      expect(menuButton.getAttribute('aria-expanded')).toBe('true');
      
      // Click again to close menu
      fireEvent.click(menuButton);
      
      expect(menuButton.classList.contains('hamburger-active')).toBe(false);
      expect(nav.classList.contains('hidden')).toBe(true);
      expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    });

    it('has proper hamburger menu structure', () => {
      render(<Header />);
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      
      // Check for hamburger lines
      const hamburgerLines = menuButton.querySelectorAll('.hamburger-line');
      expect(hamburgerLines.length).toBe(3);
    });
  });

  describe('Scroll Event Handling', () => {
    it('adds navbar-fixed class when scrolled down', async () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');
      
      // Mock header offsetTop
      Object.defineProperty(header, 'offsetTop', {
        value: 50,
        writable: true,
      });
      
      // Mock window.scrollY
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });
      
      // Trigger scroll event
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(header?.classList.contains('navbar-fixed')).toBe(true);
      });
    });

    it('removes navbar-fixed class when scrolled back to top', async () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');
      
      // Mock header offsetTop
      Object.defineProperty(header, 'offsetTop', {
        value: 50,
        writable: true,
      });
      
      // First scroll down
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(header?.classList.contains('navbar-fixed')).toBe(true);
      });
      
      // Then scroll back up
      Object.defineProperty(window, 'scrollY', {
        value: 0,
        writable: true,
      });
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(header?.classList.contains('navbar-fixed')).toBe(false);
      });
    });
  });

  describe('Scroll Spy Functionality', () => {
    it('sets up scroll event listener for scroll spy functionality', () => {
      const addEventListenerSpy = spyOn(window, 'addEventListener');
      
      render(<Header />);
      
      // Verify that scroll event listener is added
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('uses throttled scroll spy with requestAnimationFrame', async () => {
      render(<Header />);
      
      // Trigger multiple scroll events quickly
      fireEvent.scroll(window);
      fireEvent.scroll(window);
      fireEvent.scroll(window);
      
      // Should use requestAnimationFrame for throttling
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for mobile menu', () => {
      render(<Header />);
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      
      expect(menuButton.getAttribute('aria-label')).toBe('Toggle navigation menu');
      expect(menuButton.getAttribute('aria-controls')).toBe('main-nav');
      expect(menuButton.getAttribute('aria-expanded')).toBe('false');
      expect(menuButton.getAttribute('type')).toBe('button');
    });

    it('updates aria-expanded when menu is toggled', () => {
      render(<Header />);
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      
      expect(menuButton.getAttribute('aria-expanded')).toBe('false');
      
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute('aria-expanded')).toBe('true');
      
      fireEvent.click(menuButton);
      expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    });

    it('has proper navigation structure with semantic HTML', () => {
      render(<Header />);
      
      const header = screen.getByRole('banner');
      const nav = screen.getByRole('navigation');
      const navList = screen.getByRole('list');
      const navItems = screen.getAllByRole('listitem');
      
      expect(header).toBeTruthy();
      expect(nav).toBeTruthy();
      expect(navList).toBeTruthy();
      expect(navItems.length).toBe(4); // Home, Resume, Work, Contact
    });
  });

  describe('Event Cleanup', () => {
    it('cleans up scroll event listeners on unmount', () => {
      const removeEventListenerSpy = spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<Header />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('cleans up hamburger menu event listener on unmount', () => {
      const { unmount } = render(<Header />);
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      
      const removeEventListenerSpy = spyOn(menuButton, 'removeEventListener');
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });
});