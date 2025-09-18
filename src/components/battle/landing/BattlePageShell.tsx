"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { BattleNotifications } from "../BattleNotifications";

interface BattlePageShellProps {
  children: ReactNode;
}

export function BattlePageShell({ children }: BattlePageShellProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, [mounted]);

  const orbPositions = useMemo(() => {
    if (!mounted) return [] as Array<{ left: string; top: string }>;
    const orbCount = isMobile ? 3 : 8;
    return Array.from({ length: orbCount }, () => ({
      left: `${Math.round(Math.random() * 10000) / 100}%`,
      top: `${Math.round(Math.random() * 10000) / 100}%`,
    }));
  }, [mounted, isMobile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-900 relative overflow-hidden">
      <BattleNotifications />

      <div className="absolute inset-0 pointer-events-none">
        {orbPositions.map((pos, i) => (
          <motion.div
            key={`${pos.left}-${pos.top}-${i}`}
            className={`absolute w-32 h-32 rounded-full opacity-20 blur-xl ${
              i % 3 === 0
                ? "bg-gradient-to-br from-purple-400 to-pink-400"
                : i % 3 === 1
                ? "bg-gradient-to-br from-blue-400 to-cyan-400"
                : "bg-gradient-to-br from-emerald-400 to-teal-400"
            }`}
            style={{
              left: pos.left,
              top: pos.top,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000_70%,transparent_120%)]" />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
          <div className="md:rounded-3xl md:border md:border-white/10 md:bg-white/5 md:p-10 md:backdrop-blur-2xl md:shadow-2xl md:shadow-purple-500/10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
