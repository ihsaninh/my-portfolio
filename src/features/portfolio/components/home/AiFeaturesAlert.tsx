"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiCpu, FiZap } from "react-icons/fi";

export default function AiFeaturesAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 lg:p-6 backdrop-blur-sm hover:bg-blue-500/10 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
          {/* Left side - Icon and content */}
          <div className="flex items-start gap-4 flex-1">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-500 flex-shrink-0">
              <FiCpu className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI-Powered Portfolio
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/10">
                    <FiZap className="h-2.5 w-2.5" />
                    AI Tools
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10">
                    <FiZap className="h-2.5 w-2.5" />
                    Real-time
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Explore my AI-powered applications: Interactive Quiz, Hiring
                Simulator, and Real-time Battle.
              </p>
            </div>
          </div>

          {/* Right side - Button */}
          <Link
            href="/ai-features"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-semibold text-white dark:text-slate-900 shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 sm:w-auto w-full"
          >
            <span>Explore AI Features</span>
            <FiArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
