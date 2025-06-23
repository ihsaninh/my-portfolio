import { useState } from 'react';
import { NavLinks } from '../data/navLinks';
import { NavLink } from '../types/navLink';

export const useHeaderService = () => {
  const [links, setLinks] = useState<NavLink[]>(NavLinks);

  const setActiveLink = (href: string) => {
    const updatedLinks = links.map((link: NavLink) => ({
      ...link,
      isActive: link.href === href,
    }));
    setLinks(updatedLinks);
    scrollToSection(href);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    navLinks: links,
    setActiveLink,
  };
};
