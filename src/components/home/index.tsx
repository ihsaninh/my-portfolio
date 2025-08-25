"use client";

import type { Variants } from "framer-motion";
import { domAnimation, easeOut, LazyMotion, m, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  FiDownload,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMessageSquare,
} from "react-icons/fi";

import { useHeaderService } from "@/src/hooks/useHeader";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

export default function Home() {
  const { setActiveLink } = useHeaderService();

  const MotionLink = motion(Link);

  const handleConnectClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveLink("#contact");
  };

  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="container relative"
    >
      <LazyMotion features={domAnimation}>
        <div className="flex flex-col items-center lg:py-12">
          <div className="will-change-auto">
            <Image
              src="/images/profile.webp"
              alt="Portrait of Ihsan Nurul Habib"
              width={240}
              height={240}
              sizes="(min-width: 1024px) 240px, 160px"
              priority
              fetchPriority="high"
              className="w-40 h-40 lg:w-60 lg:h-60 rounded-full object-cover ring-2 ring-slate-200 dark:ring-white/10 shadow-xl"
            />
          </div>

          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs text-accent"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />{" "}
            Available for select projects
          </m.div>

          <div className="text-center mt-6">
            <h1 id="home-title" className="h1 leading-snug">
              <span className="text-slate-900 dark:text-white/90">
                Hello, I&apos;m{" "}
              </span>
              <span className="text-accent">Ihsan Nurul Habib</span>
              <br />
              <span className="text-slate-900 dark:text-white/90">
                Software Engineer — Frontend & Mobile
              </span>
            </h1>

            <m.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="mt-4 text-slate-800 dark:text-white/75 leading-8 max-w-3xl mx-auto text-sm lg:text-lg"
            >
              I build fast, accessible apps with Next.js, React, Angular, and
              React Native. 5+ years crafting delightful UIs for telco &
              enterprise (PT XLSMART Telecom Sejahtera Tbk, Axiata Digital Labs,
              Meteor Inovasi Digital).
            </m.p>
          </div>

          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <a
              href="#contact"
              onClick={handleConnectClick}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm lg:text-base text-primary shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/60 whitespace-nowrap"
            >
              Connect with me
            </a>

            <MotionLink
              href="/hire-me"
              className="relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-accent/50 bg-accent/10 px-6 text-sm lg:text-base text-accent transition-all duration-300 hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 whitespace-nowrap"
              aria-label="Hire Me Simulator with Ihsan"
              initial={{ y: 0 }}
              animate={{ y: [0, -4, 0, 0, 0] }}
              transition={{
                duration: 1.1,
                ease: easeOut,
                repeat: Infinity,
                repeatDelay: 6,
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="pointer-events-none absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </span>
              <FiMessageSquare className="text-lg" />
              <span>Hire Me Simulator</span>
            </MotionLink>

            <a
              href="/document/CV-Ihsan-Nurul-Habib.pdf"
              download
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-6 text-sm lg:text-base text-slate-800 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 group whitespace-nowrap"
              aria-label="Download CV as PDF"
            >
              <span>Download CV</span>
              <FiDownload className="text-lg transition-transform duration-300 group-hover:-rotate-12" />
            </a>
          </m.div>

          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-5 flex items-center gap-4 text-slate-700 dark:text-white/70"
          >
            <a
              href="https://github.com/ihsaninh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 dark:hover:bg白/5 dark:hover:text-white transition transform-gpu will-change-transform"
            >
              <FiGithub className="text-xl" />
            </a>
            <a
              href="https://www.linkedin.com/in/ihsaninh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white transition transform-gpu will-change-transform"
            >
              <FiLinkedin className="text-xl" />
            </a>
            <a
              href="mailto:ihsan.inh@gmail.com"
              aria-label="Email"
              className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white transition transform-gpu will-change-transform"
            >
              <FiMail className="text-xl" />
            </a>
          </m.div>

          <m.ul
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 grid grid-cols-3 gap-4 text-center text-slate-800 dark:text-white/80"
          >
            <li className="rounded-2xl border border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-white/5 px-5 py-3">
              <p className="text-2xl font-semibold">5+</p>
              <p className="text-xs opacity-80">Years Experience</p>
            </li>
            <li className="rounded-2xl border border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-white/5 px-5 py-3">
              <p className="text-2xl font-semibold">10+</p>
              <p className="text-xs opacity-80">Projects shipped</p>
            </li>
            <li className="rounded-2xl border border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-white/5 px-5 py-3">
              <p className="text-2xl font-semibold">3</p>
              <p className="text-xs opacity-80">Enterprise clients</p>{" "}
            </li>
          </m.ul>

          <m.ul
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-2 text-xs"
            aria-label="Core technologies"
          >
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Angular",
              "React Native",
              "Tailwind CSS",
              "Redux",
              "Flutter",
            ].map((t) => (
              <li
                key={t}
                className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-slate-800 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:text-white"
              >
                {t}
              </li>
            ))}
          </m.ul>
        </div>
      </LazyMotion>
    </section>
  );
}
