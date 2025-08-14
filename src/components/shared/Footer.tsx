"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import Social from "../contact/Social";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-12 lg:mt-24">
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="rounded-2xl border border-slate-300 bg-slate-50 backdrop-blur px-6 py-8 md:px-8 md:py-10 dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-8 md:grid-cols-3 md:items-center">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Ihsan Nurul Habib
                </p>
                <p className="text-sm text-slate-700 dark:text-white/70">
                  Software Engineer — Frontend & Mobile
                </p>
              </div>
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap justify-start md:justify-center gap-x-6 gap-y-2 text-sm text-slate-700 dark:text-white/80"
            >
              <Link
                href="#work"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Work
              </Link>
              <Link
                href="#about"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                About
              </Link>
              <Link
                href="#blog"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Blog
              </Link>
              <Link
                href="#contact"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Contact
              </Link>
            </nav>

            <div className="flex flex-col items-start md:items-end gap-3">
              <Social variant="icon" containerClass="flex gap-3" />
            </div>
          </div>

          <div className="my-6 h-px bg-slate-200 dark:bg-white/10" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-700 dark:text-white/70">
            <p>
              © {year} Ihsan Nurul Habib • Built with Next.js & Tailwind • Based
              in Bogor, ID
            </p>

            <div className="flex items-center gap-4">
              <a
                href="#home"
                className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                aria-label="Back to top"
              >
                ↑ Back to top
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
