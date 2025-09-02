import { useCallback, useEffect, useMemo, useState } from "react";

interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  resetInSeconds: number;
}

interface RateLimitInfoProps {
  onRateLimitChange?: (status: RateLimitStatus) => void;
  refreshTrigger?: number;
}

export function RateLimitInfo({
  onRateLimitChange,
  refreshTrigger,
}: RateLimitInfoProps) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchRateLimitStatus = useCallback(async () => {
    try {
      // Add cache-busting parameter and no-cache headers to prevent browser caching
      const cacheBuster = Date.now();
      const response = await fetch(`/api/chat?_=${cacheBuster}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (response.ok) {
        const data: RateLimitStatus = await response.json();
        setStatus(data);
        setIsInitialLoad(false);
        onRateLimitChange?.(data);
      }
    } catch (error) {
      console.error("Failed to fetch rate limit status:", error);
    }
  }, [onRateLimitChange]);

  useEffect(() => {
    fetchRateLimitStatus();
    // Refresh every 10 seconds for more responsive updates
    const interval = setInterval(fetchRateLimitStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchRateLimitStatus]);

  // Refresh when refreshTrigger changes (after sending a message)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      // Small delay to allow rate limiter to update
      setTimeout(() => {
        fetchRateLimitStatus();
      }, 100);
    }
  }, [refreshTrigger, fetchRateLimitStatus]);

  // Also refresh when component becomes visible (user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchRateLimitStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchRateLimitStatus]);

  // Real-time countdown for reset timer
  useEffect(() => {
    if (status?.remaining === 0) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status?.remaining]);

  // Calculate derived state for memoization
  const isLow = status ? status.remaining <= 5 : false;
  const isExhausted = status ? status.remaining === 0 : false;
  const shouldShow = status ? status.remaining < 15 : false;

  // Calculate real-time remaining seconds
  const realTimeResetInSeconds =
    isExhausted && status
      ? Math.max(0, Math.ceil((status.resetTime - currentTime) / 1000))
      : 0;

  const resetMinutes = Math.floor(realTimeResetInSeconds / 60);
  const resetSeconds = realTimeResetInSeconds % 60;

  // Memoize classes to prevent unnecessary re-animations when only countdown changes
  const containerClasses = useMemo(() => {
    const visibilityClasses = shouldShow
      ? "opacity-100 max-h-20 mb-0"
      : "opacity-0 max-h-0 mb-0 py-0 px-0 border-transparent";

    const colorClasses = isExhausted
      ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
      : isLow
      ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
      : "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300";

    return `text-xs px-3 py-2 rounded-lg border transition-all duration-200 overflow-hidden ${visibilityClasses} ${colorClasses}`;
  }, [shouldShow, isExhausted, isLow]);

  if (isInitialLoad || !status) {
    // Reserve space to prevent layout shift, only show loading on initial load
    return <div className="h-0 transition-all duration-200" />;
  }

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between gap-2">
        <span>
          {isExhausted
            ? "Rate limit reached"
            : `${status.remaining} request${
                status.remaining === 1 ? "" : "s"
              } remaining`}
        </span>
        {isExhausted && realTimeResetInSeconds > 0 && (
          <span className="opacity-70 flex items-center">
            Resets in {resetMinutes}m {resetSeconds}s
          </span>
        )}
      </div>
      {isExhausted && (
        <p className="mt-1 opacity-80">
          Please wait before sending another message.
        </p>
      )}
    </div>
  );
}
