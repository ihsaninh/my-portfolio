"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type AnimationType =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "blur";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  staggerChildren?: number;
}

const getVariants = (animation: AnimationType): Variants => {
  const baseTransition = {
    type: "spring" as const,
    damping: 20,
    stiffness: 100,
  };

  switch (animation) {
    case "fade":
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: baseTransition },
      };
    case "slide-up":
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
    case "slide-down":
      return {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
    case "slide-left":
      return {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    case "slide-right":
      return {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    case "scale":
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: baseTransition },
      };
    case "blur":
      return {
        hidden: { opacity: 0, filter: "blur(10px)" },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: baseTransition,
        },
      };
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: baseTransition },
      };
  }
};

export default function ScrollReveal({
  children,
  className = "",
  animation = "slide-up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.2,
  staggerChildren,
}: ScrollRevealProps) {
  const variants = getVariants(animation);

  const containerVariants: Variants = staggerChildren
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren: delay,
          },
        },
      }
    : variants;

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ delay, duration }}
    >
      {children}
    </motion.div>
  );
}

/* Stagger container for child animations */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  delayChildren = 0,
  once = true,
  amount = 0.2,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* Stagger item to use inside StaggerContainer */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
}

export function StaggerItem({
  children,
  className = "",
  animation = "slide-up",
}: StaggerItemProps) {
  const variants = getVariants(animation);

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
