"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useHeaderService } from "@/src/hooks/useHeader";

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
  const [toolsOpen, setToolsOpen] = useState(false);

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
    if (!open && !toolsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) {
        setOpen(false);
        setToolsOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open, toolsOpen]);

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
              {/* AI Tools dropdown */}
              <li
                className="relative"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button
                  type="button"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-blue-500 px-4 py-2 text-sm font-medium text-primary shadow-lg hover:shadow-xl hover:shadow-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 transition-all duration-300 transform hover:-translate-y-0.5"
                  aria-haspopup="menu"
                  aria-expanded={toolsOpen}
                  onClick={() => setToolsOpen((v) => !v)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AI Features
                  <span
                    className={[
                      "inline-block transition-transform duration-300",
                      toolsOpen ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                <AnimatePresence>
                  {toolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-300 bg-white/90 backdrop-blur-lg shadow-2xl dark:border-white/10 dark:bg-gray-800/90 overflow-hidden"
                      role="menu"
                    >
                      <div className="p-1">
                        <ul className="space-y-1">
                          <li>
                            <Link
                              href="/hire-me"
                              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-800 hover:bg-accent/20 focus:bg-accent/20 focus:outline-none dark:text-white/90 dark:hover:bg-white/10 transition-colors duration-200"
                              role="menuitem"
                              onClick={() => setToolsOpen(false)}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">
                                  Hire Me Simulator
                                </div>
                                <div className="text-xs text-slate-600 dark:text-white/60">
                                  Experience my hiring process
                                </div>
                              </div>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/quiz"
                              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-800 hover:bg-accent/20 focus:bg-accent/20 focus:outline-none dark:text-white/90 dark:hover:bg-white/10 transition-colors duration-200"
                              role="menuitem"
                              onClick={() => setToolsOpen(false)}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">AI Quiz</div>
                                <div className="text-xs text-slate-600 dark:text-white/60">
                                  Test your knowledge with AI
                                </div>
                              </div>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/battle"
                              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-800 hover:bg-accent/20 focus:bg-accent/20 focus:outline-none dark:text-white/90 dark:hover:bg-white/10 transition-colors duration-200"
                              role="menuitem"
                              onClick={() => setToolsOpen(false)}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">Battle Arena</div>
                                <div className="text-xs text-slate-600 dark:text-white/60">
                                  Compete in real-time quiz battles
                                </div>
                              </div>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
              <li>
                <ThemeToggle />
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile AI Tools Button - Always visible on mobile */}
            <button
              type="button"
              className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-accent to-blue-500 px-2.5 py-1.5 text-xs font-medium text-primary shadow-md hover:shadow-lg hover:shadow-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 transition-all duration-300 transform hover:-translate-y-0.5"
              aria-label="AI Features"
              onClick={() => setToolsOpen((v) => !v)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>AI Features</span>
            </button>

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
      {/* Mobile AI Tools Dropdown - Shown when mobile AI button is clicked */}
      <AnimatePresence>
        {toolsOpen && !open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden absolute top-16 left-0 right-0 z-50 mx-4 rounded-2xl border border-slate-300 bg-white/90 backdrop-blur-lg shadow-2xl dark:border-white/10 dark:bg-gray-800/90 overflow-hidden"
            role="menu"
          >
            <div className="p-1">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/hire-me"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-800 hover:bg-accent/20 focus:bg-accent/20 focus:outline-none dark:text-white/90 dark:hover:bg-white/10 transition-colors duration-200"
                    role="menuitem"
                    onClick={() => setToolsOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Hire Me Simulator</div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        Experience my hiring process
                      </div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/quiz"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-800 hover:bg-accent/20 focus:bg-accent/20 focus:outline-none dark:text-white/90 dark:hover:bg-white/10 transition-colors duration-200"
                    role="menuitem"
                    onClick={() => setToolsOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">AI Quiz</div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        Test your knowledge with AI
                      </div>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/battle"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-800 hover:bg-accent/20 focus:bg-accent/20 focus:outline-none dark:text-white/90 dark:hover:bg-white/10 transition-colors duration-200"
                    role="menuitem"
                    onClick={() => setToolsOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Battle Arena</div>
                      <div className="text-xs text-slate-600 dark:text-white/60">
                        Compete in real-time quiz battles
                      </div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
