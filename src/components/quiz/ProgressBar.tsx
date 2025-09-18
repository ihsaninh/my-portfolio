import { HTMLAttributes } from "react";

import { cn } from "@/src/utils";

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  progress,
  size = "md",
  color = "primary",
  showLabel = false,
  animated = true,
  className,
  ...props
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const colors = {
    primary: "bg-gradient-to-r from-accent to-accent/90",
    success: "bg-gradient-to-r from-green-500 to-green-600",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
    danger: "bg-gradient-to-r from-red-500 to-red-600",
  };

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}

      <div
        className={cn(
          "w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colors[color],
            animated && "animate-pulse"
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
