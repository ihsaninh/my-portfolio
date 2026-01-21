"use client";

import { motion } from "framer-motion";

import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "@/src/shared/components/ScrollReveal";

import { skills } from "@/src/features/portfolio/data/resume";

export default function Skills() {
  return (
    <section className="container mt-12 lg:mt-24" id="skills">
      <ScrollReveal animation="slide-up">
        <h2 className="section-title">Skills</h2>
        <p className="pt-6 text-slate-700 dark:text-white/70 max-w-3xl">
          Tools and technologies I use to ship fast, accessible apps.
          Specializing in AI-powered applications with Supabase and modern AI
          tools.
        </p>
      </ScrollReveal>

      <StaggerContainer
        staggerDelay={0.06}
        className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5"
      >
        {skills.map((skill, index) => (
          <StaggerItem key={skill.name} animation="scale">
            <motion.div
              className="group cursor-default"
              title={skill.name}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="relative h-32 lg:h-36 rounded-2xl overflow-hidden glass holo-border">
                {/* Gradient accent top border */}
                <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)/0.1)] via-transparent to-[rgb(var(--accent-secondary)/0.1)]" />
                </div>

                <div className="flex h-full flex-col items-center justify-center gap-3 p-4 relative z-10">
                  {/* Icon container with glass effect */}
                  <div className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl bg-white/80 dark:bg-white/5 ring-1 ring-slate-200/50 dark:ring-white/10 shadow-sm group-hover:ring-[rgb(var(--accent)/0.3)] transition-all duration-300">
                    <skill.icon className="text-2xl lg:text-3xl text-slate-700 dark:text-white/80 transition-colors duration-300 group-hover:text-[rgb(var(--accent))]" />
                  </div>

                  {/* Skill name */}
                  <p className="text-xs lg:text-sm font-medium tracking-wide text-slate-700 dark:text-white/80 group-hover:text-[rgb(var(--accent))] transition-colors duration-300 text-center">
                    {skill.name}
                  </p>
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
