"use client";

import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: "1x1" | "2x1" | "1x2" | "2x2";
  delay?: number;
}

export const BentoCard = ({
  children,
  className = "",
  size = "1x1",
  delay = 0,
}: BentoCardProps) => {
  const getSizeClass = () => {
    switch (size) {
      case "1x1":
        return "bento-1x1";
      case "2x1":
        return "bento-2x1";
      case "1x2":
        return "bento-1x2";
      case "2x2":
        return "bento-2x2";
      default:
        return "bento-1x1";
    }
  };

  return (
    <div
      className={`glass rounded-3xl p-6 relative overflow-hidden card-hover group ${getSizeClass()} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
