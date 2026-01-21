"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import {
  certifications,
  educationData,
  experienceData,
  resumeMenus,
} from "@/src/features/portfolio/data/resume";
import ScrollReveal from "@/src/shared/components/ScrollReveal";

import CertificationsList from "./CertificationsList";
import ResumeContent from "./ResumeContent";
import Timeline from "./Timeline";

export default function Resume() {
  const [activeMenu, setActiveMenu] = useState<number>(0);

  return (
    <section className="container mt-12 lg:mt-24" id="resume">
      <ScrollReveal animation="slide-up">
        <h2 className="section-title">Resume</h2>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6">
        {/* Left sidebar */}
        <ScrollReveal animation="slide-right" className="lg:w-1/3">
          <p className="pt-4 text-slate-700 dark:text-white/70">
            Here are my experiences, educations, and skills. Feel free to check
            them out.
          </p>

          {/* Clean Tab Navigation */}
          <div className="flex flex-row lg:flex-col gap-2 mt-6 overflow-x-auto pb-2 lg:pb-0">
            {resumeMenus.map((menu) => {
              const isActive = activeMenu === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id)}
                  className={`
                    relative py-3 px-5 rounded-xl cursor-pointer text-sm lg:text-base font-medium 
                    transition-all duration-300 whitespace-nowrap border
                    ${
                      isActive
                        ? "text-white shadow-lg border-transparent"
                        : "text-slate-700 dark:text-white/80 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-[rgb(var(--accent)/0.3)]"
                    }
                  `}
                >
                  {/* Background for active state */}
                  <span
                    className={`
                      absolute inset-0 rounded-xl transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))] opacity-100"
                          : "opacity-0"
                      }
                    `}
                  />

                  <span className="relative z-10">{menu.name}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Right content */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            {activeMenu === 0 && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ResumeContent
                  title="My Experiences"
                  description="Here is an overview of the roles and responsibilities I've held."
                >
                  <Timeline items={experienceData} className="mt-6" />
                </ResumeContent>
              </motion.div>
            )}

            {activeMenu === 1 && (
              <motion.div
                key="education"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ResumeContent
                  title="My Educations"
                  description="Here is an overview of my academic background."
                >
                  <Timeline items={educationData} className="mt-6" />
                </ResumeContent>
              </motion.div>
            )}

            {activeMenu === 2 && (
              <motion.div
                key="certifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ResumeContent
                  title="My Certifications"
                  description="Industry-recognized certificates and training I've completed."
                >
                  <CertificationsList items={certifications} className="mt-6" />
                </ResumeContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
