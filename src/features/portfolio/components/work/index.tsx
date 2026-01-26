"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FiArrowUpRight, FiZoomIn } from "react-icons/fi";

import { projects } from "@/src/features/portfolio/data/projects";
import { BentoCard } from "@/src/shared/components/BentoCard";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "@/src/shared/components/ScrollReveal";

import Lightbox from "./Lightbox";

export default function Work() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % projects.length);
  };

  return (
    <section className="container mt-24 lg:mt-32" id="work">
      <ScrollReveal animation="fade-up">
        <div className="mb-12">
          <h2 className="section-title mb-4">Work</h2>
          <p className="max-w-2xl text-slate-600 dark:text-white/60">
            A collection of projects exploring modern web technologies, from
            enterprise dashboards to experimental interfaces.
          </p>
        </div>
      </ScrollReveal>

      <StaggerContainer
        staggerDelay={0.15}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {projects.map((project, index) => {
          // Create a visually interesting grid pattern
          // Pattern: 2 cols wide for 1st, 1 col for 2nd and 3rd... cyclic?
          // For simplicity in a responsive grid, let's stick to consistent sizes
          // but maybe make the first one featured if we had a "featured" flag.
          // Or just standard grid cards.
          // Let's us BentoCard standard stylings.

          return (
            <StaggerItem
              key={project.title}
              animation="scale-in"
              className="h-full"
            >
              <BentoCard className="h-full flex flex-col !p-0 overflow-hidden group border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
                {/* Image Area */}
                <div
                  className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-100 dark:bg-white/5 cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30"
                      aria-label="Zoom image"
                    >
                      <FiZoomIn size={20} />
                    </motion.button>
                    {project.liveUrl && (
                      <motion.a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="View live URL"
                      >
                        <FiArrowUpRight size={20} />
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[rgb(var(--accent))] transition-colors">
                      {project.title}
                    </h3>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        aria-label="GitHub Repo"
                      >
                        <FaGithub size={20} />
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.stack.length > 4 && (
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 opacity-60">
                        +{project.stack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </BentoCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      <Lightbox
        projects={projects}
        index={lightboxIndex}
        open={isLightboxOpen}
        onClose={closeLightbox}
        onPrev={prevLightbox}
        onNext={nextLightbox}
      />
    </section>
  );
}
