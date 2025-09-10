"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Explore AI-Powered Features
            </h3>
            <p className="mt-1 text-sm text-slate-700 dark:text-white/80">
              Experience cutting-edge AI tools designed to showcase my skills
              and expertise
            </p>
          </div>
          <Link
            href="/ai-features"
            className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-xl bg-gradient-to-r from-accent to-blue-500 px-4 py-2 text-sm font-medium text-primary shadow-md hover:shadow-lg hover:shadow-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 transition-all duration-300 whitespace-nowrap w-full sm:w-auto"
          >
            <span>View All AI Features</span>
            <FiArrowRight className="text-lg" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
