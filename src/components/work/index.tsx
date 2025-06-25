'use client';

import 'swiper/css';
import type { Swiper as SwiperType } from 'swiper';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FiArrowUp } from 'react-icons/fi'; 
import { FaGithub, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { projects } from '@/src/data/projects';
import { Project } from '@/src/types/project';
import { motion, AnimatePresence } from 'framer-motion';

export default function Work() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [allProjects] = useState<Project[]>(projects);
  const [currentProject, setCurrentProject] = useState<Project>(allProjects[0]);

  const handlePrev = () => {
    setCurrentProject((prev) => {
      const currentIndex = allProjects.indexOf(prev);
      if (currentIndex === 0) return prev;
      const newIndex = (currentIndex - 1 + allProjects.length) % allProjects.length;
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

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <section className="container mt-12 lg:mt-24 mx-auto" id="work">
      <div className="relative">
        <h2 className="text-3xl lg:text-4xl font-bold relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-3 after:w-1/2 after:h-1 after:bg-accent after:rounded-lg">
          Work
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-[30px] mt-12">
        <div className="w-full lg:w-1/2 flex flex-col lg:justify-between order-2 lg:order-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProject.title}
              initial={{ opacity: 0, x: -40 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}  
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              <div className="hidden lg:text-8xl leading-none font-extrabold">
                {currentProject.num}
              </div>

              <h2 className="text-2xl lg:text-[42px] font-bold leading-none text-white group-hover:text-accent transition-all duration-500">
                {currentProject.title}
              </h2>

              <p className="text-white/80">{currentProject.description}</p>

              <ul className="flex gap-4 flex-wrap">
                {currentProject.stack.map((tech, i) => (
                  <li
                    key={i}
                    className="text-accent px-4 py-2 rounded-full text-sm cursor-pointer border-accent border tracking-wider"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              <div className="border border-white/20" />

              <div className="flex items-center gap-4">
                <button
                  aria-label="View live project"
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/5 flex justify-center items-center group cursor-pointer"
                  onClick={() => openLink(currentProject.liveUrl)}
                >
                  <FiArrowUp className="text-white text-2xl lg:text-3xl group-hover:text-accent" />
                </button>
                <button
                  aria-label="View GitHub repository"
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/5 flex justify-center items-center group text-white cursor-pointer"
                  onClick={() => openLink(currentProject.githubUrl)}
                >
                  <FaGithub className="text-white text-2xl lg:text-3xl group-hover:text-accent" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2"
        >
          <div className="relative">
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setCurrentProject(allProjects[swiper.realIndex]);
              }}
              navigation={true}
              spaceBetween={30}
              slidesPerView={1}
              className="lg:h-[520px] -mb-16 lg:mb-12"
            >
              {allProjects.map((project, index) => (
                <SwiperSlide key={index} className="w-full">
                  <div className="h-96 relative group flex justify-center items-center rounded-lg">
                    <div className="relative w-full h-full rounded-lg">
                      <Image
                        src={project.image}
                        alt={project.title}
                        width={800}
                        height={600}
                        className="object-cover rounded-xl overflow-hidden cursor-pointer"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="flex gap-3 absolute right-0 bottom-[calc(50%_-_-20px)] lg:-bottom-6 z-20 w-full justify-between lg:w-max lg:justify-none">
              <button
                aria-label="Previous project"
                className="w-14 h-14 rounded-full bg-white/50 lg:bg-white/5 flex justify-center items-center group cursor-pointer"
                onClick={handlePrev}
              >
                <FaChevronLeft className="text-accent lg:text-white group-hover:text-accent font-bold" />
              </button>
              <button
                aria-label="Next project"
                className="w-14 h-14 rounded-full bg-white/50 lg:bg-white/5 flex justify-center items-center group cursor-pointer"
                onClick={handleNext}
              >
                <FaChevronRight className="text-accent lg:text-white group-hover:text-accent font-bold" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
