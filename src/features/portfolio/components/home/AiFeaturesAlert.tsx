"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiCpu, FiZap } from "react-icons/fi";

export default function AiFeaturesAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 w-full max-w-3xl mx-auto"
    >
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 to-blue-500/10 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="block">
            <div className="flex items-center gap-2">
              <FiCpu className="text-accent h-5 w-5" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                AI-Powered Portfolio
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-700 dark:text-white/80">
              Explore my AI-powered applications: Interactive Quiz, Hiring
              Simulator, and Real-time Battle
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <Link
              href="/ai-features"
              className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-xl bg-gradient-to-r from-accent to-blue-500 px-4 py-2 text-sm font-medium text-primary shadow-md hover:shadow-lg hover:shadow-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 transition-all duration-300 whitespace-nowrap w-full sm:w-auto"
            >
              <span>Explore AI Features</span>
              <FiArrowRight className="text-lg" />
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
            <FiZap className="h-3 w-3" />
            AI Tools
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
            <FiZap className="h-3 w-3" />
            Supabase
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
            <FiZap className="h-3 w-3" />
            Real-time
          </span>
        </div>
      </div>
    </motion.div>
  );
}
