"use client";

import "swiper/css";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaGithub } from "react-icons/fa";
import { FiArrowUp, FiZoomIn } from "react-icons/fi";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { projects } from "@/src/features/portfolio/data/projects";
import { Project } from "@/src/features/portfolio/types/project";

import Lightbox from "./Lightbox";

export default function Work() {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [allProjects] = useState<Project[]>(projects);
  const [currentProject, setCurrentProject] = useState<Project>(allProjects[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleSwiperInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
  };

  const handlePrev = () => {
    setCurrentProject((prev) => {
      const currentIndex = allProjects.indexOf(prev);
      if (currentIndex === 0) return prev;
      const newIndex =
        (currentIndex - 1 + allProjects.length) % allProjects.length;
      return allProjects[newIndex];
    });
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    setCurrentProject((prev) => {
      const currentIndex = allProjects.indexOf(prev);
      if (currentIndex === allProjects.length - 1) return prev;
      const newIndex = (currentIndex + 1) % allProjects.length;
      return allProjects[newIndex];
    });
    swiperRef.current?.slideNext();
  };

  const openLink = (url?: string) => {
    const sanitizedUrl = url?.trim();
    if (!sanitizedUrl) return;
    window.open(sanitizedUrl, "_blank", "noopener,noreferrer");
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const prevLightbox = () => {
    setLightboxIndex((prev) => {
      const newIndex = (prev - 1 + allProjects.length) % allProjects.length;
      setCurrentProject(allProjects[newIndex]);
      swiperRef.current?.slideTo(newIndex);
      return newIndex;
    });
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => {
      const newIndex = (prev + 1) % allProjects.length;
      setCurrentProject(allProjects[newIndex]);
      swiperRef.current?.slideTo(newIndex);
      return newIndex;
    });
  };

  const hasLiveUrl = Boolean(currentProject.liveUrl.trim());
  const hasGithubUrl = Boolean(currentProject.githubUrl.trim());

  const buttonBaseClasses =
    "w-14 h-14 lg:w-16 lg:h-16 rounded-full border border-slate-300 bg-slate-50 text-slate-700 shadow-xl backdrop-blur flex justify-center items-center group transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white";
  const enabledButtonExtras =
    "cursor-pointer hover:-translate-y-0.5 hover:scale-105 hover:shadow-2xl";
  const disabledButtonExtras = "cursor-not-allowed opacity-60";

  return (
    <section className="container mt-12 lg:mt-24" id="work">
      <div className="relative">
        <h2 className="section-title">Work</h2>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-[30px] mt-12">
        <div className="w-full lg:w-1/2 flex flex-col lg:justify-between order-2 lg:order-none mt-24 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProject.title}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              <h2 className="text-3xl lg:text-[42px] font-bold leading-none text-slate-900 dark:text-white group-hover:text-accent transition-all duration-500">
                {currentProject.title}
              </h2>

              <p className="text-slate-800 dark:text-white/80">
                {currentProject.description}
              </p>

              <ul className="flex flex-wrap gap-3">
                {currentProject.stack.map((tech) => (
                  <li
                    key={tech}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-800 hover:text-slate-900 hover:bg-slate-200 transition dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:hover:text-white dark:hover:bg-white/10"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              <div className="border border-slate-200 dark:border-white/20" />

              <div className="flex items-center gap-4">
                <button
                  aria-label="View live project"
                  className={`${buttonBaseClasses} ${
                    hasLiveUrl ? enabledButtonExtras : disabledButtonExtras
                  }`}
                  onClick={() => openLink(currentProject.liveUrl)}
                  disabled={!hasLiveUrl}
                >
                  <FiArrowUp
                    className={`text-2xl lg:text-3xl ${
                      hasLiveUrl ? "group-hover:text-accent" : ""
                    }`}
                  />
                </button>
                <button
                  aria-label="View GitHub repository"
                  className={`${buttonBaseClasses} ${
                    hasGithubUrl ? enabledButtonExtras : disabledButtonExtras
                  }`}
                  onClick={() => openLink(currentProject.githubUrl)}
                  disabled={!hasGithubUrl}
                >
                  <FaGithub
                    className={`text-2xl lg:text-3xl ${
                      hasGithubUrl ? "group-hover:text-accent" : ""
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2"
        >
          <div className="relative">
            <Swiper
              onSwiper={handleSwiperInit}
              onSlideChange={(swiper) => {
                setCurrentProject(allProjects[swiper.realIndex]);
              }}
              modules={[Navigation]}
              navigation={true}
              spaceBetween={30}
              slidesPerView={1}
              className="lg:h-[450px] -mb-16 lg:mb-12"
            >
              {allProjects.map((project, index) => (
                <SwiperSlide key={project.title} className="w-full">
                  <div className="h-[450px] sm:h-[500px] lg:h-[450px] relative group flex justify-center items-center rounded-lg">
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={800}
                        height={600}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-contain lg:object-cover rounded-xl w-full h-full cursor-zoom-in select-none"
                        onClick={() => openLightbox(index)}
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/0 transition group-hover:bg-black/15" />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100">
                          <div className="rounded-full bg-white/80 p-3 text-slate-900 shadow-lg backdrop-blur dark:bg-white/20 dark:text-white">
                            <FiZoomIn aria-hidden className="text-2xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation buttons - centered vertically on mobile, bottom positioned on desktop */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 lg:hidden">
              <button
                aria-label="Previous project"
                className="w-14 h-14 rounded-full border border-slate-300 bg-slate-50 shadow-xl backdrop-blur flex justify-center items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5"
                onClick={handlePrev}
              >
                <FaChevronLeft className="text-accent group-hover:text-accent font-bold" />
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 lg:hidden">
              <button
                aria-label="Next project"
                className="w-14 h-14 rounded-full border border-slate-300 bg-slate-50 shadow-xl backdrop-blur flex justify-center items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5"
                onClick={handleNext}
              >
                <FaChevronRight className="text-accent group-hover:text-accent font-bold" />
              </button>
            </div>

            {/* Desktop navigation buttons */}
            <div className="hidden lg:flex gap-3 absolute -bottom-18 right-0 z-20">
              <button
                aria-label="Previous project"
                className="w-14 h-14 rounded-full border border-slate-300 bg-slate-50 shadow-xl backdrop-blur flex justify-center items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5"
                onClick={handlePrev}
              >
                <FaChevronLeft className="text-slate-700 dark:text-white group-hover:text-accent font-bold" />
              </button>
              <button
                aria-label="Next project"
                className="w-14 h-14 rounded-full border border-slate-300 bg-slate-50 shadow-xl backdrop-blur flex justify-center items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5"
                onClick={handleNext}
              >
                <FaChevronRight className="text-slate-700 dark:text-white group-hover:text-accent font-bold" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <Lightbox
        projects={allProjects}
        index={lightboxIndex}
        open={isLightboxOpen}
        onClose={closeLightbox}
        onPrev={prevLightbox}
        onNext={nextLightbox}
      />
    </section>
  );
}
