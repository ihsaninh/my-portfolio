"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiX } from "react-icons/fi";

import { Project } from "@/src/types/project";

type LightboxProps = {
  projects: Project[];
  index: number;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Lightbox({
  projects,
  index,
  open,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const project = projects[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  // Disable page scroll when lightbox is open
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const prevOverflow = overflow;
    const prevPaddingRight = paddingRight;

    // Prevent layout shift when hiding scrollbar
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lightbox-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-label="Project image lightbox"
          onClick={onClose}
        >
          <motion.div
            key="lightbox-content"
            className="relative mx-4 w-full max-w-6xl"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button positioned relative to content (previous placement) */}
            <button
              aria-label="Close lightbox"
              onClick={onClose}
              className="absolute top-2 right-2 md:-top-12 md:right-0 z-20 rounded-full p-2 text-white bg-black/40 backdrop-blur ring-1 ring-white/20 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              <FiX className="text-2xl" />
            </button>

            <div className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] w-full rounded-xl overflow-hidden bg-transparent md:bg-black/20 md:dark:bg-black/20">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="100vw"
                className="object-contain md:object-cover select-none"
                priority
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent hidden md:block" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent hidden md:block" />

              <div className="absolute bottom-4 left-1/2 z-10 w-[90%] max-w-3xl -translate-x-1/2 text-center">
                <div className="mx-auto inline-flex max-w-full flex-col items-center gap-1 rounded-xl bg-black/50 px-4 py-3 backdrop-blur-sm">
                  <h3 className="truncate text-lg font-semibold text-white">
                    {project.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-sm text-white/85">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="absolute inset-y-0 left-0 flex items-center">
                <button
                  aria-label="Previous image"
                  onClick={onPrev}
                  className="m-2 rounded-full bg-white/10 p-3 text-white backdrop-blur ring-1 ring-white/20 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <FaChevronLeft className="text-2xl" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  aria-label="Next image"
                  onClick={onNext}
                  className="m-2 rounded-full bg-white/10 p-3 text-white backdrop-blur ring-1 ring-white/20 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <FaChevronRight className="text-2xl" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
