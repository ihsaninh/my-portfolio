"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface GlowTextProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
  gradient?: boolean;
  glow?: boolean;
  animate?: boolean;
}

export default function GlowText({
  children,
  className = "",
  as: Component = "span",
  gradient = true,
  glow = true,
  animate = true,
}: GlowTextProps) {
  const MotionComponent = motion[Component];

  const animationProps = animate
    ? {
        animate: {
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        },
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: "linear" as const,
        },
      }
    : {};

  return (
    <MotionComponent
      className={`
        ${gradient ? "gradient-text" : ""}
        ${glow ? "glow-text" : ""}
        ${className}
      `}
      style={
        gradient
          ? {
              backgroundSize: "200% 200%",
            }
          : undefined
      }
      {...animationProps}
    >
      {children}
    </MotionComponent>
  );
}

/* Letter-by-letter reveal animation */
interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
  delay?: number;
  staggerChildren?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { delay: number; stagger: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  },
};

export function AnimatedText({
  text,
  className = "",
  as: Component = "span",
  delay = 0,
  staggerChildren = 0.03,
}: AnimatedTextProps) {
  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      className={`inline-flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={{ delay, stagger: staggerChildren }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className={char === " " ? "w-2" : ""}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
