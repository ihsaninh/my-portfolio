import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'bun:test';

import Footer from '../../../src/components/shared/Footer';
import { socials } from '../../../src/data/socials';

describe('Footer Component', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders the footer landmark', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeTruthy();
    });

    it('shows © current year and author', () => {
      render(<Footer />);
      const year = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`©\\s*${year}`))).toBeTruthy();
      expect(screen.getAllByText(/Ihsan Nurul Habib/).length).toBeGreaterThan(0);
    });

    it('has container and card structure', () => {
      const { container } = render(<Footer />);
      const wrapper = container.querySelector('footer');
      expect(wrapper?.classList.contains('mt-12')).toBe(true);
      expect(wrapper?.classList.contains('lg:mt-24')).toBe(true);

      const cont = container.querySelector('.container');
      expect(cont).toBeTruthy();

      const card = container.querySelector('.rounded-2xl');
      expect(card).toBeTruthy();
      expect(card?.classList.contains('border')).toBe(true);
    });

    it('renders horizontal separator', () => {
      const { container } = render(<Footer />);
      const separator = container.querySelector('.h-px');
      expect(separator).toBeTruthy();
      expect(separator?.classList.contains('bg-slate-200')).toBe(true);
    });
  });

  describe('Navigation and Links', () => {
    it('renders footer navigation with expected links', () => {
      render(<Footer />);
      const nav = screen.getByRole('navigation', { name: 'Footer' });
      expect(nav).toBeTruthy();

      expect(screen.getByRole('link', { name: 'Work' }).getAttribute('href')).toBe('#work');
      expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('#about');
      expect(screen.getByRole('link', { name: 'Blog' }).getAttribute('href')).toBe('#blog');
      expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('#contact');
    });

    it('renders social links', () => {
      render(<Footer />);
      expect(screen.getByRole('link', { name: 'GitHub' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Email' })).toBeTruthy();
    });

    it('renders the correct number of social links', () => {
      render(<Footer />);
      const links = [
        screen.getByRole('link', { name: 'GitHub' }),
        screen.getByRole('link', { name: 'LinkedIn' }),
        screen.getByRole('link', { name: 'Email' }),
      ];
      expect(links.length).toBe(socials.length);
    });

    it('social links open in new tab with safe rel', () => {
      render(<Footer />);
      for (const label of ['GitHub', 'LinkedIn', 'Email']) {
        const link = screen.getByRole('link', { name: label });
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
        expect(link.getAttribute('rel')).toContain('noreferrer');
      }
    });

    it('renders back to top link', () => {
      render(<Footer />);
      const backToTop = screen.getByRole('link', { name: 'Back to top' });
      expect(backToTop).toBeTruthy();
      expect(backToTop.getAttribute('href')).toBe('#home');
    });
  });

  describe('Accessibility', () => {
    it('contains readable text and structure', () => {
      render(<Footer />);
      const year = new Date().getFullYear();
      const copyright = screen.getByText(new RegExp(`©\\s*${year}`));
      expect(copyright).toBeTruthy();
      expect(copyright.textContent).toMatch(/Ihsan Nurul Habib/);
    });
  });

  describe('Content Details', () => {
    it('shows job title under the brand name', () => {
      render(<Footer />);
      expect(
        screen.getByText('Software Engineer — Frontend & Mobile')
      ).toBeTruthy();
    });

    it('shows technology stack and location', () => {
      render(<Footer />);
      expect(screen.getByText(/Built with Next\.js & Tailwind/)).toBeTruthy();
      expect(screen.getByText(/Based\s+in\s+Bogor,\s*ID/)).toBeTruthy();
    });
  });
});
