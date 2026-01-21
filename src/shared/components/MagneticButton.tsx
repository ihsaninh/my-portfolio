"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ReactNode, useRef } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  magnetStrength?: number;
  ariaLabel?: string;
}

export default function MagneticButton({
  children,
  className = "",
  onClick,
  href,
  download,
  target,
  rel,
  type = "button",
  disabled = false,
  magnetStrength = 0.3,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 400 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * magnetStrength;
    const deltaY = (e.clientY - centerY) * magnetStrength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseClassName = `
    relative overflow-hidden
    inline-flex items-center justify-center gap-2
    rounded-xl px-6 py-3
    font-medium text-sm
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  const MotionComponent = href ? motion.a : motion.button;
  const componentProps = href
    ? { href, download, target, rel }
    : { type, onClick, disabled };

  return (
    <MotionComponent
      ref={ref as React.RefObject<HTMLButtonElement & HTMLAnchorElement>}
      className={baseClassName}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      aria-label={ariaLabel}
      {...componentProps}
    >
      {/* Glow background effect */}
      <motion.div
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at center, rgb(var(--accent) / 0.3) 0%, transparent 70%)",
        }}
        whileHover={{ opacity: 1 }}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700"
          style={{ transform: "skewX(-15deg)" }}
        />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </MotionComponent>
  );
}

/* Preset variants */
export function PrimaryMagneticButton({
  children,
  className = "",
  ...props
}: MagneticButtonProps) {
  return (
    <MagneticButton
      className={`
        bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-secondary))]
        text-white shadow-lg
        hover:shadow-xl hover:shadow-[rgb(var(--accent))/30]
        ${className}
      `}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}

export function SecondaryMagneticButton({
  children,
  className = "",
  ...props
}: MagneticButtonProps) {
  return (
    <MagneticButton
      className={`
        border border-slate-300 bg-slate-100/80
        text-slate-800
        hover:bg-slate-200
        dark:border-white/10 dark:bg-white/5 dark:text-white
        dark:hover:bg-white/10
        ${className}
      `}
      {...props}
    >
      {children}
    </MagneticButton>
  );
}
