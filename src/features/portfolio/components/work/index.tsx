"use client";

import "swiper/css";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaGithub } from "react-icons/fa";
import { FiArrowUp, FiZoomIn } from "react-icons/fi";
import type { Swiper as SwiperClass } from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import ScrollReveal from "@/src/shared/components/ScrollReveal";

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
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
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
    "w-14 h-14 lg:w-16 lg:h-16 rounded-full glass holo-border flex justify-center items-center group transition-all duration-300";
  const enabledButtonExtras =
    "cursor-pointer hover:-translate-y-1 hover:scale-105";
  const disabledButtonExtras = "cursor-not-allowed opacity-40";

  const navButtonClasses =
    "w-12 h-12 lg:w-14 lg:h-14 rounded-full glass holo-border flex justify-center items-center group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-105";

  return (
    <section className="container mt-12 lg:mt-24" id="work">
      <ScrollReveal animation="slide-up">
        <h2 className="section-title">Work</h2>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row lg:gap-[30px] mt-12">
        {/* Left - Project Info */}
        <div className="w-full lg:w-1/2 flex flex-col lg:justify-between order-2 lg:order-none mt-24 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProject.title}
              initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6"
            >
              {/* Project Title */}
              <h3 className="text-3xl lg:text-[42px] font-bold leading-tight">
                <span className="gradient-text">{currentProject.title}</span>
              </h3>

              {/* Description */}
              <p className="text-slate-700 dark:text-white/70 leading-relaxed">
                {currentProject.description}
              </p>

              {/* Tech Stack */}
              <ul className="flex flex-wrap gap-2">
                {currentProject.stack.map((tech) => (
                  <motion.li
                    key={tech}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="glass px-4 py-2 rounded-full text-sm text-slate-700 dark:text-white/80 hover:text-[rgb(var(--accent))] transition-colors duration-300 cursor-default"
                  >
                    {tech}
                  </motion.li>
                ))}
              </ul>

              {/* Divider with gradient */}
              <div className="h-px bg-gradient-to-r from-[rgb(var(--accent)/0.5)] via-[rgb(var(--accent-secondary)/0.3)] to-transparent" />

              {/* Action buttons */}
              <div className="flex items-center gap-4">
                <motion.button
                  aria-label="View live project"
                  className={`${buttonBaseClasses} ${
                    hasLiveUrl ? enabledButtonExtras : disabledButtonExtras
                  }`}
                  onClick={() => openLink(currentProject.liveUrl)}
                  disabled={!hasLiveUrl}
                  whileHover={hasLiveUrl ? { rotate: 45 } : undefined}
                  whileTap={hasLiveUrl ? { scale: 0.95 } : undefined}
                >
                  <FiArrowUp
                    className={`text-2xl lg:text-3xl transition-colors duration-300 ${
                      hasLiveUrl ? "group-hover:text-[rgb(var(--accent))]" : ""
                    }`}
                  />
                </motion.button>
                <motion.button
                  aria-label="View GitHub repository"
                  className={`${buttonBaseClasses} ${
                    hasGithubUrl ? enabledButtonExtras : disabledButtonExtras
                  }`}
                  onClick={() => openLink(currentProject.githubUrl)}
                  disabled={!hasGithubUrl}
                  whileHover={hasGithubUrl ? { scale: 1.1 } : undefined}
                  whileTap={hasGithubUrl ? { scale: 0.95 } : undefined}
                >
                  <FaGithub
                    className={`text-2xl lg:text-3xl transition-colors duration-300 ${
                      hasGithubUrl
                        ? "group-hover:text-[rgb(var(--accent))]"
                        : ""
                    }`}
                  />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right - Image Slider */}
        <ScrollReveal
          animation="slide-left"
          delay={0.2}
          className="w-full lg:w-1/2"
        >
          <div className="relative">
            <Swiper
              onSwiper={handleSwiperInit}
              onSlideChange={(swiper) => {
                setCurrentProject(allProjects[swiper.realIndex]);
              }}
              modules={[Navigation, Autoplay]}
              navigation={true}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              spaceBetween={30}
              slidesPerView={1}
              className="lg:h-[450px] -mb-16 lg:mb-12"
            >
              {allProjects.map((project, index) => (
                <SwiperSlide key={project.title} className="w-full">
                  <div className="h-[450px] sm:h-[500px] lg:h-[450px] relative group flex justify-center items-center">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden glass holo-border">
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={800}
                        height={600}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-contain lg:object-cover w-full h-full cursor-zoom-in select-none"
                        onClick={() => openLightbox(index)}
                      />
                      {/* Hover overlay */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Zoom icon */}
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                          <div className="rounded-full glass p-4 text-white shadow-lg">
                            <FiZoomIn aria-hidden className="text-2xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Mobile Navigation */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 lg:hidden">
              <motion.button
                aria-label="Previous project"
                className={navButtonClasses}
                onClick={handlePrev}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronLeft className="text-[rgb(var(--accent))] font-bold" />
              </motion.button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 lg:hidden">
              <motion.button
                aria-label="Next project"
                className={navButtonClasses}
                onClick={handleNext}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronRight className="text-[rgb(var(--accent))] font-bold" />
              </motion.button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-3 absolute -bottom-18 right-0 z-20">
              <motion.button
                aria-label="Previous project"
                className={navButtonClasses}
                onClick={handlePrev}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronLeft className="text-slate-700 dark:text-white group-hover:text-[rgb(var(--accent))] transition-colors duration-300 font-bold" />
              </motion.button>
              <motion.button
                aria-label="Next project"
                className={navButtonClasses}
                onClick={handleNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronRight className="text-slate-700 dark:text-white group-hover:text-[rgb(var(--accent))] transition-colors duration-300 font-bold" />
              </motion.button>
            </div>
          </div>
        </ScrollReveal>
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
