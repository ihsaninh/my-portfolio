"use client";

import { motion } from "framer-motion";

interface ErrorDisplayProps {
  log: string;
}

export function ErrorDisplay({ log }: ErrorDisplayProps) {
  if (!log) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="p-4 rounded-xl border text-center bg-red-900/20 border-red-500/30 text-red-300">
        {log}
      </div>
    </motion.div>
  );
}
