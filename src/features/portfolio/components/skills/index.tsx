"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  FiAward,
  FiBook,
  FiBriefcase,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import {
  certifications,
  educationData,
  experienceData,
  skills,
} from "@/src/features/portfolio/data/resume";
import { BentoCard } from "@/src/shared/components/BentoCard";
import ScrollReveal from "@/src/shared/components/ScrollReveal";

export default function Skills() {
  const [showAllCerts, setShowAllCerts] = useState(false);
  const displayedCerts = showAllCerts
    ? certifications
    : certifications.slice(0, 4);
  return (
    <section className="container mt-24 lg:mt-32" id="skills">
      <ScrollReveal animation="fade-up">
        <h2 className="section-title mb-12">About</h2>
      </ScrollReveal>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Column 1: Skills & Education */}
        <div className="space-y-6 lg:col-span-1">
          {/* Skills Card */}
          <BentoCard className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[rgb(var(--accent))]">✦</span> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-[rgb(var(--accent)/0.5)] transition-colors cursor-default"
                >
                  <skill.icon className="text-sm" />
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Education Card */}
          <BentoCard className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FiBook className="text-[rgb(var(--accent))]" /> Education
            </h3>
            <div className="space-y-6 relative">
              {/* Line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />

              {educationData.map((edu, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/20 border-2 border-white dark:border-slate-900" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {edu.company}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {edu.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </p>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>

        {/* Column 2: Experience (Wide timeline) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Experience Card */}
          <BentoCard className="p-6">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
              <FiBriefcase className="text-[rgb(var(--accent))]" /> Experience
            </h3>

            <div className="space-y-10 relative">
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-[rgb(var(--accent))] to-transparent opacity-30" />

              {experienceData.map((exp, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="relative pl-10"
                >
                  <span className="absolute left-[3px] top-1.5 h-3.5 w-3.5 rounded-full bg-[rgb(var(--accent))] ring-4 ring-white dark:ring-slate-900" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {exp.company}
                    </h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))] w-fit mt-1 sm:mt-0">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-white/80 mb-3">
                    {exp.title}
                  </p>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed marker:text-[rgb(var(--accent))]">
                    {exp.descriptions?.map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          {/* Certifications (Grid within grid) */}
          <BentoCard className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FiAward className="text-[rgb(var(--accent))]" /> Certifications
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {displayedCerts.map((cert, idx) => (
                  <motion.a
                    key={cert.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.2,
                      delay: idx > 3 ? (idx - 4) * 0.05 : 0,
                    }}
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-[rgb(var(--accent)/0.3)] transition-all"
                  >
                    <h5 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[rgb(var(--accent))] transition-colors line-clamp-1">
                      {cert.title}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      {cert.company} • {cert.issuedDate}
                    </p>
                  </motion.a>
                ))}
              </AnimatePresence>
            </div>
            {certifications.length > 4 && (
              <button
                onClick={() => setShowAllCerts(!showAllCerts)}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-xs font-medium text-slate-500 hover:text-[rgb(var(--accent))] hover:border-[rgb(var(--accent)/0.5)] transition-all"
              >
                {showAllCerts ? (
                  <>
                    Show less <FiChevronUp className="text-sm" />
                  </>
                ) : (
                  <>
                    View all {certifications.length} certifications{" "}
                    <FiChevronDown className="text-sm" />
                  </>
                )}
              </button>
            )}
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
