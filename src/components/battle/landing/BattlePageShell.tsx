"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { useBattleStore } from "@/src/lib/battle-store";

interface BattlePageShellProps {
  children: ReactNode;
}

export function BattlePageShell({ children }: BattlePageShellProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const notifications = useBattleStore((state) => state.notifications);
  const setNotifications = useBattleStore((state) => state.setNotifications);

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

  useEffect(() => {
    if (!notifications.length) return;

    const timer = setTimeout(() => {
      setNotifications(notifications.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [notifications, setNotifications]);

  const dismissNotification = (index: number) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-900 relative overflow-hidden">
      <AnimatePresence>
        {notifications.map((message, index) => {
          const offset = (isMobile ? 6 : 1) + index * 4;
          const baseClasses =
            "fixed z-50 bg-purple-600/90 backdrop-blur-xl border border-purple-500/30 rounded-xl px-4 py-3 text-white text-sm shadow-lg";
          const positionClasses = isMobile
            ? "left-1/2 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2"
            : "right-4 min-w-[18rem] max-w-sm";

          return (
            <motion.div
              key={`${message}-${index}`}
              initial={{ opacity: 0, x: isMobile ? 0 : 100, y: isMobile ? 20 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 100, y: isMobile ? 20 : 0 }}
              transition={{ duration: 0.2 }}
              className={`${baseClasses} ${positionClasses}`}
              style={{ top: `${offset}rem` }}
            >
              <div className="flex items-start gap-3">
                <span className="flex-1 leading-snug">{message}</span>
                <button
                  type="button"
                  onClick={() => dismissNotification(index)}
                  className="text-purple-200 transition-colors hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

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
