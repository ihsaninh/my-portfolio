import { useCallback, useEffect, useState } from "react";

interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  resetInSeconds: number;
}

interface RateLimitInfoProps {
  onRateLimitChange?: (status: RateLimitStatus) => void;
}

export function RateLimitInfo({ onRateLimitChange }: RateLimitInfoProps) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRateLimitStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat");
      if (response.ok) {
        const data: RateLimitStatus = await response.json();
        setStatus(data);
        onRateLimitChange?.(data);
      }
    } catch (error) {
      console.error("Failed to fetch rate limit status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onRateLimitChange]);

  useEffect(() => {
    fetchRateLimitStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRateLimitStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchRateLimitStatus]);

  if (isLoading || !status) {
    return null;
  }

  const isLow = status.remaining <= 2;
  const isExhausted = status.remaining === 0;

  if (status.remaining >= 8) {
    // Don't show when plenty of requests are available
    return null;
  }

  return (
    <div
      className={`text-xs px-3 py-2 rounded-lg border ${
        isExhausted
          ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
          : isLow
          ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
          : "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span>
          {isExhausted
            ? "Rate limit reached"
            : `${status.remaining} request${
                status.remaining === 1 ? "" : "s"
              } remaining`}
        </span>
        <span className="opacity-70">
          {isExhausted && `Resets in ${Math.max(0, status.resetInSeconds)}s`}
        </span>
      </div>
      {isExhausted && (
        <p className="mt-1 opacity-80">
          Please wait before sending another message.
        </p>
      )}
    </div>
  );
}
