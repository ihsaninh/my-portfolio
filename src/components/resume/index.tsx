"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { certifications, educationData, experienceData, resumeMenus } from "@/src/data/resume";

import CertificationsList from "./CertificationsList";
import ExperienceTimeline from "./ExperienceTimeline";
import ResumeContent from "./ResumeContent";

export default function Resume() {
  const [activeMenu, setActiveMenu] = useState<number>(0);

  return (
    <section className="container mt-12 lg:mt-24" id="resume">
      <h2 className="section-title">Resume</h2>

      <div className="flex flex-col lg:flex-row gap-12 mt-6">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="lg:w-1/3"
        >
          <p className="pt-6">
            Here are my experiences, educations, and skills. Feel free to check
            them out.
          </p>

          <div className="flex flex-row lg:flex-col gap-4 mt-8 overflow-x-auto">
            {resumeMenus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`py-2 rounded-lg cursor-pointer px-6 lg:px-0 border border-slate-300 ${
                  activeMenu === menu.id
                    ? "bg-accent text-primary"
                    : "text-slate-800 bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/90"
                }`}
              >
                <p className="text-center text-sm lg:text-base">{menu.name}</p>
              </button>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="lg:w-2/3 lg:mt-6"
        >
          <AnimatePresence mode="wait">
            {activeMenu === 0 && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ResumeContent
                  title="My Experiences"
                  description="Here is an overview of the roles and responsibilities I've held."
                >
                  <ExperienceTimeline items={experienceData} className="mt-6" />
                </ResumeContent>
              </motion.div>
            )}

            {activeMenu === 1 && (
              <motion.div
                key="education"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ResumeContent
                  title="My Educations"
                  description="Here is an overview of my academic background."
                >
                  <ExperienceTimeline items={educationData} className="mt-6" />
                </ResumeContent>
              </motion.div>
            )}

            {activeMenu === 2 && (
              <motion.div
                key="certifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ResumeContent
                  title="My Certifications"
                  description="Industry-recognized certificates and training I’ve completed."
                >
                  <CertificationsList items={certifications} className="mt-6" />
                </ResumeContent>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
