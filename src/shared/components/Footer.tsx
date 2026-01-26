"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowUp } from "react-icons/fi";

import Social from "@/src/features/portfolio/components/contact/Social";

import BrandLogo from "./BrandLogo";

export default function Footer() {
  const year = new Date().getFullYear();

  const footerLinks = [
    { href: "#work", label: "Work" },
    { href: "#skills", label: "Skills" },
    { href: "#blog", label: "Blog" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <footer className="relative mt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 md:p-12">
          {/* Background Gradient Blob */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[rgb(var(--accent)/0.1)] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[rgb(var(--accent-secondary)/0.1)] blur-3xl" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-12">
            {/* Brand Column */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <Link href="/" className="inline-block">
                  <div className="flex items-center gap-3">
                    <BrandLogo size="md" />
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Ihsan.
                    </span>
                  </div>
                </Link>
                <p className="max-w-md text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Crafting digital experiences with a focus on motion,
                  aesthetics, and performance.
                </p>
              </div>
              <div className="mt-8 lg:mt-0">
                <Social variant="icon" containerClass="flex gap-4" />
              </div>
            </div>

            {/* Links Column */}
            <div className="lg:col-span-7 flex flex-col md:flex-row gap-12 lg:gap-24 lg:justify-end">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-6">
                  Navigation
                </h4>
                <nav className="flex flex-col gap-4">
                  {footerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-[rgb(var(--accent))] dark:hover:text-[rgb(var(--accent))] transition-colors w-fit"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-6">
                  Legal
                </h4>
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/privacy"
                    className="text-slate-600 dark:text-slate-400 hover:text-[rgb(var(--accent))] dark:hover:text-[rgb(var(--accent))] transition-colors w-fit"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-slate-600 dark:text-slate-400 hover:text-[rgb(var(--accent))] dark:hover:text-[rgb(var(--accent))] transition-colors w-fit"
                  >
                    Terms of Service
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-16 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-500 text-center md:text-left">
              © {year} Ihsan Nurul Habib. All rights reserved.
            </p>

            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-lg text-[rgb(var(--accent))] border border-slate-100 dark:border-white/5"
            >
              <FiArrowUp />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
