'use client';

import { useHeaderService } from '@/src/hooks/useHeader';
import { useEffect, useRef } from 'react';

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const navMenuRef = useRef<HTMLElement>(null);

  const { navLinks, setActiveLink } = useHeaderService();

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > headerRef.current.offsetTop) {
          headerRef.current.classList.add('navbar-fixed');
        } else {
          headerRef.current.classList.remove('navbar-fixed');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hamburger = hamburgerRef.current;
    const navMenu = navMenuRef.current;

    if (hamburger && navMenu) {
      const toggleMenu = () => {
        hamburger.classList.toggle('hamburger-active');
        navMenu.classList.toggle('hidden');
      };

      hamburger.addEventListener('click', toggleMenu);

      return () => {
        hamburger.removeEventListener('click', toggleMenu);
      };
    }
  }, []);

  return (
    <header
      ref={headerRef}
      className="bg-transparent absolute top-0 left-0 w-full flex items-center z-10"
    >
      <div className="container">
        <div className="flex items-center justify-between relative">
          <a
            href="#home"
            className="text-3xl lg:text-4xl font-medium block py-6"
            onClick={(e) => {
              e.preventDefault();
              setActiveLink('#home');
            }}
          >
            Ihsan
          </a>

          <div className="flex items-center">
            <button
              ref={hamburgerRef}
              type="button"
              className="block absolute right-4 lg:hidden cursor-pointer"
            >
              <span className="hamburger-line transition duration-300 ease-in-out origin-top-left"></span>
              <span className="hamburger-line transition duration-300 ease-in-out"></span>
              <span className="hamburger-line transition duration-300 ease-in-out origin-bottom-left"></span>
            </button>

            <nav
              ref={navMenuRef}
              className="hidden absolute py-5 bg-primary shadow-lg rounded-lg max-w-[250px] w-full right-4 top-full lg:block lg:static lg:bg-transparent lg:max-w-full lg:shadow-none lg:rounded-none"
            >
              <ul className="block px-8 lg:px-0 lg:flex lg:gap-12">
                {navLinks.map((link, index) => (
                  <li key={index} className="group relative">
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveLink(link.href);
                      }}
                      className={`relative inline-block text-base py-2 transition-colors duration-300 ${
                        link.isActive ? 'text-accent' : 'text-white'
                      }`}
                    >
                      {link.name}
                      <span
                        className={`absolute left-0 -bottom-0.5 h-[2px] bg-accent transition-all duration-300
                          ${link.isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                        `}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
