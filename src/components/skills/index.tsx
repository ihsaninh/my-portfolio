"use client";

import { motion } from "framer-motion";
import { skills } from "@/src/data/resume";

export default function Skills() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  } as const;

  return (
    <section className="container mt-12 lg:mt-24" id="skills">
      <h2 className="section-title">Skills</h2>
      <p className="pt-6 text-slate-700 dark:text-white/80 max-w-3xl">
        Tools and technologies I use to ship fast, accessible apps.
      </p>

      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6"
      >
        {skills.map((skill, index) => (
          <motion.li
            variants={item}
            key={index}
            className="group cursor-default"
            title={skill.name}
          >
            <div
              className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-lg md:shadow-xl dark:border-white/10 dark:bg-white/5 transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:shadow-2xl"
            >
              {/* Accent top border */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent))]/70 to-transparent opacity-70" />

              <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/80 text-slate-900 ring-1 ring-slate-200/70 shadow-sm dark:bg-white/10 dark:text-white dark:ring-white/10">
                  <skill.icon className="text-3xl md:text-4xl transition-colors duration-300 group-hover:text-[rgb(var(--accent))]" />
                </div>
                <p className="text-sm font-medium tracking-wide text-slate-800 transition-colors duration-300 group-hover:text-[rgb(var(--accent))] dark:text-white/85">
                  {skill.name}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
