"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiDownload } from "react-icons/fi";

import { useHeaderService } from "@/src/features/portfolio/hooks/useHeader";

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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300 isolate transform-gpu will-change-transform",
        scrolled
          ? "backdrop-blur-xl bg-white/70 dark:bg-primary/70 border-b border-slate-200/50 dark:border-white/5"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
      aria-label="Primary header"
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href={isHome ? "#home" : "/#home"}
            onClick={isHome ? handleNavClick("#home") : undefined}
            className="group inline-flex items-center gap-2"
            aria-label="Go to home"
          >
            <BrandLogo size="sm" />
            <span className="text-sm font-medium text-slate-700 group-hover:text-[rgb(var(--accent))] dark:text-white/80 dark:group-hover:text-[rgb(var(--accent))] transition-colors duration-300">
              Ihsan Nurul Habib
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isBlogLink = link.name.toLowerCase() === "blog";

                let hrefFinal: string;
                if (isBlogLink) {
                  hrefFinal = isHome ? "#blog" : "/blog";
                } else {
                  hrefFinal = isHome ? link.href : `/${link.href}`;
                }

                const active = isBlogLink
                  ? isBlog || (isHome && link.isActive)
                  : link.isActive;

                return (
                  <li key={link.href}>
                    <Link
                      href={hrefFinal}
                      onClick={
                        isHome
                          ? (() => {
                              if (isBlogLink) {
                                return handleNavClick("#blog");
                              }
                              return handleNavClick(link.href);
                            })()
                          : undefined
                      }
                      className={[
                        "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                        active
                          ? "text-white"
                          : "text-slate-700 hover:text-[rgb(var(--accent))] dark:text-white/80 dark:hover:text-[rgb(var(--accent))]",
                      ].join(" ")}
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" && isHome && !isBlogLink)
                          handleNavClick(link.href)(e);
                      }}
                    >
                      {/* Active background pill with glow */}
                      {active && (
                        <motion.span
                          layoutId="activeNavPill"
                          className="absolute inset-0 rounded-full -z-10"
                          style={{
                            background:
                              "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-secondary)))",
                            boxShadow:
                              "0 0 20px rgb(var(--accent) / 0.4), 0 0 40px rgb(var(--accent) / 0.2)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      {/* Hover underline for inactive items */}
                      {!active && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] rounded-full transition-all duration-300 group-hover:w-4" />
                      )}
                      {link.name}
                    </Link>
                  </li>
                );
              })}

              <li className="ml-2">
                <ThemeToggle />
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <motion.button
              type="button"
              className="inline-flex items-center justify-center rounded-xl glass p-2.5"
              aria-label="Toggle navigation menu"
              aria-controls="mobile-nav"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={[
                    "absolute left-0 top-0 block h-0.5 w-5 bg-slate-800 dark:bg-white transition-all duration-300",
                    open ? "translate-y-2 rotate-45" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 top-2 block h-0.5 w-5 bg-slate-800 dark:bg-white transition-all duration-300",
                    open ? "opacity-0 scale-0" : "opacity-100",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 top-4 block h-0.5 w-5 bg-slate-800 dark:bg-white transition-all duration-300",
                    open ? "-translate-y-2 -rotate-45" : "",
                  ].join(" ")}
                />
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            ref={navRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="container pb-4">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-primary shadow-xl overflow-hidden">
                <ul className="flex flex-col">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={handleNavClick(link.href)}
                        className={[
                          "block px-5 py-3.5 text-sm font-medium transition-all duration-300 border-b border-slate-100 dark:border-white/5 last:border-b-0",
                          link.isActive
                            ? "text-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.05)]"
                            : "text-slate-700 hover:text-[rgb(var(--accent))] dark:text-white/90",
                        ].join(" ")}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                  <li className="p-3 border-t border-slate-100 dark:border-white/5">
                    <a
                      href="/document/CV-Ihsan-Nurul-Habib.pdf"
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] px-4 py-2.5 text-sm font-medium text-white shadow-lg"
                    >
                      <FiDownload className="text-lg" />
                      Download CV
                    </a>
                  </li>
                  <li className="p-3 flex justify-center">
                    <ThemeToggle />
                  </li>
                </ul>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
