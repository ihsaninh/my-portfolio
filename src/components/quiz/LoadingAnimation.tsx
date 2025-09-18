"use client";

import { motion } from "framer-motion";

import { cn } from "@/src/utils";

interface LoadingAnimationProps {
  type?: "dots" | "spinner" | "pulse" | "thinking";
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

export default function LoadingAnimation({
  type = "thinking",
  size = "md",
  className,
  message = "Loading...",
}: LoadingAnimationProps) {
  const sizes = {
    sm: {
      container: "space-y-2",
      dot: "w-2 h-2",
      spinner: "w-6 h-6",
      text: "text-sm",
    },
    md: {
      container: "space-y-3",
      dot: "w-3 h-3",
      spinner: "w-8 h-8",
      text: "text-base",
    },
    lg: {
      container: "space-y-4",
      dot: "w-4 h-4",
      spinner: "w-12 h-12",
      text: "text-lg",
    },
  };

  const renderLoadingType = () => {
    switch (type) {
      case "dots":
        return (
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn("bg-accent rounded-full", sizes[size].dot)}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        );

      case "spinner":
        return (
          <motion.div
            className={cn(
              "border-4 border-slate-200 dark:border-slate-700 border-t-accent rounded-full",
              sizes[size].spinner
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );

      case "pulse":
        return (
          <motion.div
            className={cn("bg-accent rounded-full", sizes[size].spinner)}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        );

      case "thinking":
        return (
          <div className="flex flex-col items-center space-y-4">
            {/* AI Brain Icon */}
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
                <motion.svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="M4.93 4.93l1.41 1.41" />
                  <path d="M17.66 17.66l1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="M4.93 19.07l1.41-1.41" />
                  <path d="M17.66 6.34l1.41-1.41" />
                  <circle cx="12" cy="12" r="3" />
                </motion.svg>
              </div>

              {/* Thinking particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-accent/60 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                  }}
                  animate={{
                    x: [0, 30 * Math.cos((i * 120 * Math.PI) / 180)],
                    y: [0, 30 * Math.sin((i * 120 * Math.PI) / 180)],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>

            {/* Thinking dots */}
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-accent rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        sizes[size].container,
        className
      )}
    >
      {renderLoadingType()}
      {message && (
        <motion.p
          className={cn(
            "text-slate-600 dark:text-slate-400 font-medium",
            sizes[size].text
          )}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
