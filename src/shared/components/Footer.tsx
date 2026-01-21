"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import Social from "@/src/features/portfolio/components/contact/Social";

import BrandLogo from "./BrandLogo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-12 lg:mt-24 pb-8">
      <div className="container">
        <div className="glass holo-border rounded-2xl px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-8 md:grid-cols-3 md:items-center">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Ihsan Nurul Habib
                </p>
                <p className="text-sm text-slate-600 dark:text-white/70">
                  Software Engineer — Frontend & Mobile
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav
              aria-label="Footer"
              className="flex flex-wrap justify-start md:justify-center gap-x-6 gap-y-2 text-sm"
            >
              {[
                { href: "#work", label: "Work" },
                { href: "#skills", label: "Skills" },
                { href: "#blog", label: "Blog" },
                { href: "#contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 hover:text-[rgb(var(--accent))] dark:text-white/70 dark:hover:text-[rgb(var(--accent))] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <Social variant="icon" containerClass="flex gap-3" />
            </div>
          </div>

          {/* Gradient Divider */}
          <div className="my-6 h-px bg-gradient-to-r from-transparent via-[rgb(var(--accent)/0.3)] to-transparent" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-600 dark:text-white/60">
            <p>
              © {year} Ihsan Nurul Habib • Built with{" "}
              <span className="gradient-text font-medium">Next.js</span> &{" "}
              <span className="gradient-text font-medium">Tailwind</span> •
              Based in Bogor, ID
            </p>

            <motion.a
              href="#home"
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-slate-700 dark:text-white/80 hover:text-[rgb(var(--accent))] transition-colors duration-300"
              aria-label="Back to top"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>↑</span>
              <span>Back to top</span>
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
