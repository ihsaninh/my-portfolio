"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiDownload, FiMenu, FiX } from "react-icons/fi";

import { useHeaderService } from "@/src/features/portfolio/hooks/useHeader";
import { MagneticButton } from "@/src/shared/components/MagneticButton";

import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { navLinks, setActiveLink, setActiveLinkByScroll } = useHeaderService();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isBlog = pathname.startsWith("/blog");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    let ticking = false;
    const spy = () => {
      let active: string | null = null;
      for (const link of navLinks) {
        const el = document.querySelector(link.href);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (
          rect.top <= window.innerHeight * 0.35 &&
          rect.bottom >= window.innerHeight * 0.35
        ) {
          active = link.href;
          break;
        }
      }
      if (active) setActiveLinkByScroll(active);
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          spy();
          ticking = false;
        });
        ticking = true;
      }
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navLinks, setActiveLinkByScroll, isHome]);

  useEffect(() => {
    if (isBlog) {
      setActiveLinkByScroll("#blog");
    }
  }, [isBlog, setActiveLinkByScroll]);

  useEffect(() => {
    if (!isHome) return;
    const hash = window.location.hash;
    if (hash) setActiveLinkByScroll(hash);
  }, [isHome, setActiveLinkByScroll]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const handleNavClick = (href: string) => (e: React.SyntheticEvent) => {
    if (!isHome) return;
    e.preventDefault();
    setActiveLink(href);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-4 inset-x-0 z-[100] transition-all duration-300 isolate ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="container mx-auto max-w-5xl px-4">
          <motion.nav
            layout
            className={`mx-auto flex items-center justify-between rounded-full border p-2 transition-all duration-300 ${
              scrolled
                ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-white/10 shadow-lg shadow-black/5"
                : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-transparent shadow-none"
            }`}
          >
            {/* Logo */}
            <Link
              href={isHome ? "#home" : "/#home"}
              onClick={isHome ? handleNavClick("#home") : undefined}
              className="group pl-2 inline-flex items-center gap-2"
              aria-label="Go to home"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] text-white shadow-lg">
                <BrandLogo size="xs" />
              </div>
              <span
                className={`text-sm font-semibold tracking-tight transition-all duration-300 ${scrolled ? "opacity-100 max-w-[100px]" : "opacity-0 max-w-0 overflow-hidden"}`}
              >
                Ihsan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-1 mx-2">
              {navLinks.map((link) => {
                const isBlogLink = link.name.toLowerCase() === "blog";
                const hrefFinal = isBlogLink
                  ? isHome
                    ? "#blog"
                    : "/blog"
                  : isHome
                    ? link.href
                    : `/${link.href}`;
                const active = isBlogLink
                  ? isBlog || (isHome && link.isActive)
                  : link.isActive;

                return (
                  <li key={link.href}>
                    <Link
                      href={hrefFinal}
                      onClick={
                        isHome
                          ? isBlogLink
                            ? handleNavClick("#blog")
                            : handleNavClick(link.href)
                          : undefined
                      }
                      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        active
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="activeNavPill"
                          className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white -z-10"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <span
                        className={
                          active ? "text-white dark:text-slate-900" : ""
                        }
                      >
                        {link.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2 pr-1">
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
              <MagneticButton
                variant="primary"
                className="hidden md:flex text-sm px-5 py-2.5 h-10 w-auto"
                onClick={() =>
                  window.open("/document/CV-Ihsan-Nurul-Habib.pdf", "_blank")
                }
              >
                <span className="text-xs">CV</span>
                <FiDownload className="text-sm" />
              </MagneticButton>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {open ? (
                  <FiX className="text-xl" />
                ) : (
                  <FiMenu className="text-xl" />
                )}
              </button>
            </div>
          </motion.nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 z-[90] md:hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden p-4"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isBlogLink = link.name.toLowerCase() === "blog";
                const hrefFinal = isBlogLink
                  ? isHome
                    ? "#blog"
                    : "/blog"
                  : isHome
                    ? link.href
                    : `/${link.href}`;
                const active = isBlogLink
                  ? isBlog || (isHome && link.isActive)
                  : link.isActive;

                return (
                  <li key={link.href}>
                    <Link
                      href={hrefFinal}
                      onClick={(e) => {
                        if (isHome) {
                          if (isBlogLink) {
                            handleNavClick("#blog")(e);
                          } else {
                            handleNavClick(link.href)(e);
                          }
                        }
                        setOpen(false);
                      }}
                      className={`block px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                        active
                          ? "bg-slate-100 dark:bg-white/10 text-[rgb(var(--accent))]"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
              <hr className="my-2 border-slate-200 dark:border-white/10" />
              <li className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-slate-500">Theme</span>
                <ThemeToggle />
              </li>
              <li>
                <a
                  href="/document/CV-Ihsan-Nurul-Habib.pdf"
                  target="_blank"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 font-semibold transition-transform active:scale-95"
                >
                  Download CV <FiDownload />
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/20 dark:bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
