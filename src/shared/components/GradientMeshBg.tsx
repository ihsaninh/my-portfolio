"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GradientMeshBgProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export default function GradientMeshBg({
  className = "",
  intensity = "medium",
}: GradientMeshBgProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const opacityMap = {
    low: { primary: 0.08, secondary: 0.05, tertiary: 0.03 },
    medium: { primary: 0.15, secondary: 0.1, tertiary: 0.06 },
    high: { primary: 0.25, secondary: 0.15, tertiary: 0.1 },
  };

  const opacity = opacityMap[intensity];

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden ${className}`}
    >
      {/* Primary gradient orb - follows mouse slightly */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px]"
        style={{
          background: `radial-gradient(circle, rgb(var(--accent) / ${opacity.primary}) 0%, transparent 70%)`,
          left: `${mousePosition.x * 0.3 + 10}%`,
          top: `${mousePosition.y * 0.3 - 20}%`,
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary gradient orb */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[80px]"
        style={{
          background: `radial-gradient(circle, rgb(var(--accent-secondary) / ${opacity.secondary}) 0%, transparent 70%)`,
          right: `${100 - mousePosition.x * 0.2}%`,
          bottom: "10%",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary gradient orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[60px]"
        style={{
          background: `radial-gradient(circle, rgb(var(--accent-tertiary) / ${opacity.tertiary}) 0%, transparent 70%)`,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
