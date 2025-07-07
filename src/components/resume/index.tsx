'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeContent from './ResumeContent';
import ContentCard from './ContentCard';
import { educationData, experienceData, resumeMenus, skills } from '@/src/data/resume';

export default function Resume() {
  const [activeMenu, setActiveMenu] = useState<number>(0);

  return (
    <section className="container mt-12 lg:mt-24" id="resume">
      <h2 className="text-3xl lg:text-4xl font-bold relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-3 after:w-1/2 after:h-1 after:bg-accent after:rounded-lg">
        Resume
      </h2>

      <div className="flex flex-col lg:flex-row gap-12 mt-6">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="lg:w-1/3"
        >
          <p className="pt-6">
            Here are my experience, education, and skills. Feel free to check them out.
          </p>

          <div className="flex flex-row lg:flex-col gap-4 mt-8 overflow-x-auto">
            {resumeMenus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`py-2 rounded-lg cursor-pointer px-6 lg:px-0 ${
                  activeMenu === menu.id
                    ? 'bg-accent text-primary'
                    : 'text-white bg-secondary'
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
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
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
                  title="My Experience"
                  description="Here is an overview of the roles and responsibilities I've held."
                >
                  <div className="grid lg:grid-cols-2 gap-6 mt-6 max-h-[500px] lg:max-h-96 overflow-y-scroll">
                    {experienceData.map((item, index) => (
                      <ContentCard key={index} data={item} />
                    ))}
                  </div>
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
                  title="My Education"
                  description="Here is an overview of my academic background."
                >
                  <div className="grid lg:grid-cols-2 gap-6 mt-6 max-h-[500px] lg:max-h-96 overflow-y-scroll">
                    {educationData.map((item, index) => (
                      <ContentCard key={index} data={item} />
                    ))}
                  </div>
                </ResumeContent>
              </motion.div>
            )}

            {activeMenu === 2 && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="min-h-[500px]">
                  <h3 className="text-2xl lg:text-3xl">My Skills</h3>
                  <p className="pt-4">These are the tools and technologies I&apos;m proficient in.</p>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6 mt-6">
                    {skills.map((skill, index) => (
                      <li key={index} className="flex items-center gap-2 group flex-col text-center cursor-pointer">
                        <div className="w-full h-36 bg-secondary rounded-lg flex justify-center items-center flex-col gap-4 transition-all duration-300">
                          <skill.icon className="text-6xl group-hover:text-accent transition-all duration-300" />
                          <p className="text-sm transition-all duration-300 group-hover:text-accent tracking-wider">
                            {skill.name}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
