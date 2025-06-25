import { useState, useCallback } from 'react';
import { NavLinks } from '../data/navLinks';
import { NavLink } from '../types/navLink';

export const useHeaderService = () => {
  const [links, setLinks] = useState<NavLink[]>(NavLinks);

  const setActiveLink = useCallback((href: string) => {
    const updatedLinks = links.map((link: NavLink) => ({
      ...link,
      isActive: link.href === href,
    }));
    setLinks(updatedLinks);
    scrollToSection(href);
  }, [links]);

  const setActiveLinkByScroll = useCallback((href: string) => {
    setLinks(prevLinks => {
      const currentActiveLink = prevLinks.find(link => link.isActive);
      if (currentActiveLink?.href === href) {
        return prevLinks;
      }

      return prevLinks.map((link: NavLink) => ({
        ...link,
        isActive: link.href === href,
      }));
    });
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    navLinks: links,
    setActiveLink,
    setActiveLinkByScroll,
  };
};