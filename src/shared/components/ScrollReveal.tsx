"use client";

import { ReactNode, useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  animation?:
    | "fade-up"
    | "fade-in"
    | "scale-in"
    | "slide-in-right"
    | "slide-in-left"
    | "scale";
  delay?: number;
  duration?: number;
}

export const ScrollReveal = ({
  children,
  width = "fit-content",
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 0.5,
}: ScrollRevealProps) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-reveal");
            entry.target.classList.remove(
              "opacity-0",
              "translate-y-8",
              "scale-95",
              "translate-x-8",
              "-translate-x-8",
            );
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const getInitialClass = () => {
    switch (animation) {
      case "fade-up":
        return "opacity-0 translate-y-8";
      case "fade-in":
        return "opacity-0";
      case "scale-in":
        return "opacity-0 scale-95";
      case "slide-in-right":
        return "opacity-0 translate-x-8";
      case "slide-in-left":
        return "opacity-0 -translate-x-8";
      default:
        return "opacity-0 translate-y-8";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${getInitialClass()} ${className}`}
      style={{
        width,
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export const StaggerContainer = ({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const StaggerItem = ({
  children,
  animation = "fade-up",
  className = "",
  ...props
}: {
  children: ReactNode;
  animation?:
    | "fade-up"
    | "fade-in"
    | "scale-in"
    | "slide-in-right"
    | "slide-in-left"
    | "scale";
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) => {
  return (
    <ScrollReveal animation={animation} className={className} {...props}>
      {children}
    </ScrollReveal>
  );
};

export default ScrollReveal;
