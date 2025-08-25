export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/85">
        <span className="block text-[11px] mb-1 text-slate-500 dark:text-white/60">
          Ihsan (AI)
        </span>
        <div
          className="flex items-center gap-1 py-0.5"
          aria-label="AI is typing"
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-slate-400/80 dark:bg-white/70 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-slate-400/80 dark:bg-white/70 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-slate-400/80 dark:bg-white/70 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
