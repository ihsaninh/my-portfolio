"use client";

import type { Variants } from "framer-motion";
import { easeOut, motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { FiDownload, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

import { useHeaderService } from "@/src/hooks/useHeader";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

export default function Home() {
  const { setActiveLink } = useHeaderService();

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
      <motion.div
        className="flex flex-col items-center lg:py-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <Image
            src="/images/profile.jpeg"
            alt="Portrait of Ihsan Nurul Habib"
            width={240}
            height={240}
            className="w-40 h-40 lg:w-60 lg:h-60 rounded-full object-cover ring-2 ring-slate-200 dark:ring-white/10 shadow-xl"
            priority
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs text-accent"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
          Available for select projects
        </motion.div>

        <div className="text-center mt-6">
          <motion.h1
            id="home-title"
            variants={fadeUp}
            className="h1 leading-snug"
          >
            <span className="text-slate-900 dark:text-white/90">
              Hello, I&apos;m{" "}
            </span>
            <span className="text-accent">Ihsan Nurul Habib</span>
            <br />
            <span className="text-slate-900 dark:text-white/90">
              Software Engineer — Frontend & Mobile
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-slate-800 dark:text-white/75 leading-8 max-w-3xl mx-auto text-sm lg:text-lg"
          >
            I build fast, accessible apps with Next.js, React, Angular, and
            React Native. 5+ years crafting delightful UIs for telco &
            enterprise (PT. XL Axiata, Axiata Digital Labs, Meteor Inovasi
            Digital).
          </motion.p>
        </div>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#contact"
            onClick={handleConnectClick}
            className="bg-accent text-primary px-6 py-2 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/60"
          >
            Connect with me
          </a>

          <a
            href="/document/CV-Ihsan-Nurul-Habib.pdf"
            download
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-6 py-2 text-slate-800 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 group"
            aria-label="Download CV as PDF"
          >
            <span className="text-sm lg:text-base">Download CV</span>
            <FiDownload className="text-lg transition-transform duration-300 group-hover:-rotate-12" />
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-5 flex items-center gap-4 text-slate-700 dark:text-white/70"
        >
          <a
            href="https://github.com/ihsaninh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white transition"
          >
            <FiGithub className="text-xl" />
          </a>
          <a
            href="https://www.linkedin.com/in/ihsaninh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white transition"
          >
            <FiLinkedin className="text-xl" />
          </a>
          <a
            href="mailto:ihsan.inh@gmail.com"
            aria-label="Email"
            className="p-2 rounded-full hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white transition"
          >
            <FiMail className="text-xl" />
          </a>
        </motion.div>

        <motion.ul
          variants={fadeUp}
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
            <p className="text-xs opacity-80">Enterprise clients</p>
          </li>
        </motion.ul>

        <motion.ul
          variants={fadeUp}
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
        </motion.ul>
      </motion.div>
    </section>
  );
}
