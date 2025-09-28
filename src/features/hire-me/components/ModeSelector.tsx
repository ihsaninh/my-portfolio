import { motion } from "framer-motion";

import { Mode } from "@/src/features/hire-me/types/hire-me";

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function ModeSelector({
  mode,
  onModeChange,
}: Readonly<ModeSelectorProps>) {
  return (
    <div className="relative inline-flex items-center rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl p-1.5 text-sm shadow-lg dark:border-white/10 dark:bg-white/5">
      {/* Background indicator */}
      <motion.div
        className="absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-accent to-accent/90 shadow-lg"
        initial={false}
        animate={{
          x: mode === "HR" ? 4 : "calc(100% + 4px)",
          width: mode === "HR" ? "calc(50% - 8px)" : "calc(50% - 8px)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      <button
        onClick={() => onModeChange("HR")}
        className={`relative z-10 flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          mode === "HR"
            ? "text-white shadow-sm"
            : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: mode === "HR" ? 1 : 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </motion.div>
        HR
      </button>

      <button
        onClick={() => onModeChange("TECH")}
        className={`relative z-10 flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          mode === "TECH"
            ? "text-white shadow-sm"
            : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        }`}
      >
        <motion.div
          initial={false}
          animate={{ scale: mode === "TECH" ? 1 : 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </motion.div>
        Tech
      </button>
    </div>
  );
}
