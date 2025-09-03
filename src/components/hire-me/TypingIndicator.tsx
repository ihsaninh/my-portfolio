import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3 max-w-[85%]">
        {/* AI Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 flex items-center justify-center shadow-lg"
        >
          <span className="text-xs font-bold text-white dark:text-slate-800">
            AI
          </span>
        </motion.div>

        {/* Typing bubble */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-1"
        >
          {/* Name label */}
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Ihsan (AI)
          </div>

          {/* Enhanced typing bubble */}
          <div className="relative rounded-2xl border border-white/20 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Typing animation */}
            <div
              className="relative flex items-center gap-1.5"
              aria-label="AI is thinking"
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="h-2 w-2 rounded-full bg-gradient-to-r from-accent/60 to-accent/40"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Subtle pulsing text */}
              <motion.span
                className="ml-2 text-xs text-slate-500 dark:text-slate-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                thinking...
              </motion.span>
            </div>

            {/* Message tail */}
            <div className="absolute -left-1 top-3 h-3 w-3 rotate-45 border-l border-b border-white/20 bg-white/80 dark:border-white/10 dark:bg-white/10" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
