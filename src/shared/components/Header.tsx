"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
        "sticky top-0 z-50 transition duration-300 isolate transform-gpu will-change-transform",
        scrolled
          ? "backdrop-blur bg-white/70 supports-[backdrop-filter]:bg-white/70 dark:bg-primary/50 dark:supports-[backdrop-filter]:bg-primary/50 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]"
          : "bg-transparent shadow-none",
      ].join(" ")}
      aria-label="Primary header"
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href={isHome ? "#home" : "/#home"}
            onClick={isHome ? handleNavClick("#home") : undefined}
            className="group inline-flex items-center gap-2"
            aria-label="Go to home"
          >
            <BrandLogo size="sm" />
            <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 dark:text-white/70 dark:group-hover:text-white">
              Ihsan Nurul Habib
            </span>
          </Link>

          <nav className="hidden lg:block" aria-label="Main navigation">
            <ul className="flex items-center gap-8">
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
                  <li key={link.href} className="relative group">
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
                        "text-sm transition-colors",
                        active
                          ? "text-accent"
                          : "text-slate-800 hover:text-slate-900 dark:text-white/80 dark:hover:text-white",
                      ].join(" ")}
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter" && isHome && !isBlogLink)
                          handleNavClick(link.href)(e);
                      }}
                    >
                      {link.name}
                      <span
                        className={[
                          "absolute left-0 -bottom-1 h-[2px] bg-accent transition-all duration-300",
                          active ? "w-full" : "w-0 group-hover:w-full",
                        ].join(" ")}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}

              <li>
                <ThemeToggle />
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-100 p-2 text-slate-800 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              aria-label="Toggle navigation menu"
              aria-controls="mobile-nav"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={[
                    "absolute left-0 top-0 block h-0.5 w-5 bg-slate-900 dark:bg-white transition-transform",
                    open ? "translate-y-2 rotate-45" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 top-2 block h-0.5 w-5 bg-slate-900 dark:bg-white transition-opacity",
                    open ? "opacity-0" : "opacity-100",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 top-4 block h-0.5 w-5 bg-slate-900 dark:bg-white transition-transform",
                    open ? "-translate-y-2 -rotate-45" : "",
                  ].join(" ")}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            ref={navRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="container">
              <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50 backdrop-blur shadow-xl dark:border-white/10 dark:bg-white/5">
                <ul className="flex flex-col divide-y divide-slate-200 dark:divide-white/10">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={handleNavClick(link.href)}
                        className={[
                          "block px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-md",
                          link.isActive
                            ? "text-accent"
                            : "text-slate-800 hover:text-slate-900 dark:text-white/90 dark:hover:text-white",
                        ].join(" ")}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                  <li className="p-2">
                    <a
                      href="/document/CV-Ihsan-Nurul-Habib.pdf"
                      className="block rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-800 hover:bg-slate-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
                    >
                      Download CV
                    </a>
                  </li>
                  <li className="p-2">
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
