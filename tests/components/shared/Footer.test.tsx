import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'bun:test';

import Footer from '../../../src/components/shared/Footer';

describe('Footer Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<Footer />);
      const footerContainer = screen.getByText(/Copyright/);
      expect(footerContainer).toBeTruthy();
    });

    it('renders copyright text with current year', () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear();
      const copyrightText = screen.getByText(`Copyright © ${currentYear} Ihsan Nurul Habib`);
      expect(copyrightText).toBeTruthy();
    });

    it('has proper container structure', () => {
      const { container } = render(<Footer />);
      const footerContainer = container.querySelector('.container');
      expect(footerContainer).toBeTruthy();
      expect(footerContainer?.classList.contains('mt-12')).toBe(true);
      expect(footerContainer?.classList.contains('lg:mt-24')).toBe(true);
      expect(footerContainer?.classList.contains('mb-8')).toBe(true);
      expect(footerContainer?.classList.contains('flex')).toBe(true);
      expect(footerContainer?.classList.contains('gap-4')).toBe(true);
      expect(footerContainer?.classList.contains('flex-col')).toBe(true);
    });

    it('renders separator border', () => {
      const { container } = render(<Footer />);
      const separator = container.querySelector('.border');
      expect(separator).toBeTruthy();
      expect(separator?.classList.contains('border-white/20')).toBe(true);
    });
  });

  describe('Text Content', () => {
    it('displays copyright symbol', () => {
      render(<Footer />);
      const copyrightElement = screen.getByText(/©/);
      expect(copyrightElement).toBeTruthy();
    });

    it('displays author name', () => {
      render(<Footer />);
      const authorName = screen.getByText(/Ihsan Nurul Habib/);
      expect(authorName).toBeTruthy();
    });

    it('has proper text styling', () => {
      const { container } = render(<Footer />);
      const copyrightText = container.querySelector('p');
      expect(copyrightText).toBeTruthy();
      expect(copyrightText?.classList.contains('text-white')).toBe(true);
      expect(copyrightText?.classList.contains('text-center')).toBe(true);
      expect(copyrightText?.classList.contains('text-sm')).toBe(true);
      expect(copyrightText?.classList.contains('lg:text-base')).toBe(true);
    });
  });

  describe('Dynamic Year', () => {
    it('updates year dynamically', () => {
      // Mock Date to test different years
      const originalDate = Date;
      const mockDate = class extends Date {
        constructor() {
          super();
          return new originalDate('2025-01-01');
        }
        static getFullYear() {
          return 2025;
        }
        getFullYear() {
          return 2025;
        }
      };
      
      global.Date = mockDate as any;
      
      render(<Footer />);
      const copyrightText = screen.getByText(/Copyright © 2025 Ihsan Nurul Habib/);
      expect(copyrightText).toBeTruthy();
      
      // Restore original Date
      global.Date = originalDate;
    });

    it('handles year change correctly', () => {
      // Test with current year
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      
      const copyrightElement = screen.getByText(new RegExp(`Copyright © ${currentYear}`));
      expect(copyrightElement).toBeTruthy();
      
      // Verify the full text
      expect(copyrightElement.textContent).toBe(`Copyright © ${currentYear} Ihsan Nurul Habib`);
    });
  });

  describe('Accessibility', () => {
    it('has semantic HTML structure', () => {
      const { container } = render(<Footer />);
      
      // Check for proper container structure
      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toBeTruthy();
      
      // Check for paragraph element
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeTruthy();
      
      // Check for border separator
      const border = container.querySelector('.border');
      expect(border).toBeTruthy();
    });

    it('has readable text content', () => {
      render(<Footer />);
      const copyrightText = screen.getByText(/Copyright/);
      
      // Ensure text is not empty and contains expected content
      expect(copyrightText.textContent).toContain('Copyright');
      expect(copyrightText.textContent).toContain('Ihsan Nurul Habib');
      expect(copyrightText.textContent).toContain(new Date().getFullYear().toString());
    });
  });

  describe('Responsive Design', () => {
    it('has responsive margin classes', () => {
      const { container } = render(<Footer />);
      const footerContainer = container.querySelector('.container');
      
      // Check for responsive margin classes
      expect(footerContainer?.classList.contains('mt-12')).toBe(true);
      expect(footerContainer?.classList.contains('lg:mt-24')).toBe(true);
    });

    it('has responsive text size classes', () => {
      const { container } = render(<Footer />);
      const copyrightText = container.querySelector('p');
      
      // Check for responsive text size classes
      expect(copyrightText?.classList.contains('text-sm')).toBe(true);
      expect(copyrightText?.classList.contains('lg:text-base')).toBe(true);
    });
  });
});