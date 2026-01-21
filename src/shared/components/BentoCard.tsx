"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type BentoSize = "1x1" | "2x1" | "1x2" | "2x2";

interface BentoCardProps {
  children: ReactNode;
  size?: BentoSize;
  className?: string;
  hoverEffect?: boolean;
  glowOnHover?: boolean;
}

const sizeClasses: Record<BentoSize, string> = {
  "1x1": "col-span-6 md:col-span-3",
  "2x1": "col-span-12 md:col-span-6",
  "1x2": "col-span-6 md:col-span-3 row-span-2",
  "2x2": "col-span-12 md:col-span-6 row-span-2",
};

export default function BentoCard({
  children,
  size = "1x1",
  className = "",
  hoverEffect = true,
  glowOnHover = true,
}: BentoCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl 
        glass holo-border
        ${sizeClasses[size]}
        ${hoverEffect ? "card-hover" : ""}
        ${className}
      `}
      whileHover={hoverEffect ? { scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Glow effect on hover */}
      {glowOnHover && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent)/0.1)] via-transparent to-[rgb(var(--accent-secondary)/0.1)]" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
