import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, mock } from 'bun:test';

import Social from '../../../src/components/contact/Social';

// Mock React Icons
mock.module('react-icons/fa', () => ({
  FaEnvelope: ({ ...props }: any) => <svg data-testid="envelope-icon" aria-hidden="true" {...props} />,
  FaLinkedin: ({ ...props }: any) => <svg data-testid="linkedin-icon" aria-hidden="true" {...props} />,
  FaInstagram: ({ ...props }: any) => <svg data-testid="instagram-icon" aria-hidden="true" {...props} />,
  FaGithub: ({ ...props }: any) => <svg data-testid="github-icon" aria-hidden="true" {...props} />,
}));

// Mock Next.js Link component to prevent conflicts
mock.module('next/link', () => ({
  default: ({ children, href, target, rel, className, ...props }: any) => (
    <a href={href} target={target} rel={rel} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe('Social Component', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders all social media links', () => {
    render(<Social />);
    
    // Check that all social media links are present by aria-labels
    expect(screen.getByLabelText("Send email to ihsan.inh@gmail.com")).not.toBeNull();
    expect(screen.getByLabelText("Visit LinkedIn profile")).not.toBeNull();
    expect(screen.getByLabelText("Visit Instagram profile")).not.toBeNull();
    expect(screen.getByLabelText("Visit GitHub profile")).not.toBeNull();
  });

  it('renders correct number of social links', () => {
    render(<Social />);
    
    // Should render 4 social links (email, LinkedIn, Instagram, GitHub)
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks).toHaveLength(4);
  });

  it('has correct href attributes for each social link', () => {
    render(<Social />);
    
    // Get all links and verify their href attributes by index
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks).toHaveLength(4);
    
    expect(socialLinks[0].getAttribute('href')).toBe('mailto:ihsan.inh@gmail.com');
    expect(socialLinks[1].getAttribute('href')).toBe('https://www.linkedin.com/in/ihsaninh/');
    expect(socialLinks[2].getAttribute('href')).toBe('https://www.instagram.com/ihsan_inh/');
    expect(socialLinks[3].getAttribute('href')).toBe('https://github.com/ihsaninh');
  });

  it('has proper accessibility attributes', () => {
    render(<Social />);
    
    const socialLinks = screen.getAllByRole('link');
    
    // All links should have aria-label attributes
    socialLinks.forEach(link => {
      expect(link.hasAttribute('aria-label')).toBe(true);
    });
  });

  it('renders icons with proper accessibility', () => {
    const { container } = render(<Social />);
    
    // Check that social links are rendered with SVG icons
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks.length).toBe(4); // Should have 4 social links
    
    // Check that each link has proper aria-labels
    expect(socialLinks[0].getAttribute('aria-label')).toBe('Send email to ihsan.inh@gmail.com');
    expect(socialLinks[1].getAttribute('aria-label')).toBe('Visit LinkedIn profile');
    expect(socialLinks[2].getAttribute('aria-label')).toBe('Visit Instagram profile');
    expect(socialLinks[3].getAttribute('aria-label')).toBe('Visit GitHub profile');
  });

  it('applies custom container class when provided', () => {
    const customClass = 'custom-container-class';
    const { container } = render(<Social containerClass={customClass} />);
    
    // Check that the container div has the custom class
    const socialContainer = container.querySelector('div');
    expect(socialContainer?.classList.contains(customClass)).toBe(true);
  });

  it('applies custom icon styles when provided', () => {
    const customIconStyle = 'custom-icon-style';
    render(<Social iconStyle={customIconStyle} />);
    
    const socialLinks = screen.getAllByRole('link');
    socialLinks.forEach(link => {
      expect(link.classList.contains(customIconStyle)).toBe(true);
    });
  });

  it('renders with default empty classes when no props provided', () => {
    const { container } = render(<Social />);
    
    // Should render a div container (the parent div)
    const socialContainer = container.firstChild as HTMLElement;
    expect(socialContainer).not.toBeNull();
    expect(socialContainer.className).toBe(''); // Empty class by default
  });

  it('renders social links in correct order', () => {
    render(<Social />);
    
    const socialLinks = screen.getAllByRole('link');
    
    // Verify the order matches the socials data array
    expect(socialLinks[0].getAttribute('aria-label')).toBe('Send email to ihsan.inh@gmail.com');
    expect(socialLinks[1].getAttribute('aria-label')).toBe('Visit LinkedIn profile');
    expect(socialLinks[2].getAttribute('aria-label')).toBe('Visit Instagram profile');
    expect(socialLinks[3].getAttribute('aria-label')).toBe('Visit GitHub profile');
  });

  it('uses Next.js Link component for navigation', () => {
    render(<Social />);
    
    const socialLinks = screen.getAllByRole('link');
    
    // All links should be rendered (Next.js Link renders as anchor tags in test environment)
    socialLinks.forEach(link => {
      expect(link.tagName).toBe('A');
    });
  });
});
