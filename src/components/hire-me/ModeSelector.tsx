import { Mode } from "@/src/types/hire-me";

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export function ModeSelector({
  mode,
  onModeChange,
}: Readonly<ModeSelectorProps>) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 p-1 text-sm dark:border-white/10 dark:bg-white/5">
      <button
        onClick={() => onModeChange("HR")}
        aria-pressed={mode === "HR"}
        className={`cursor-pointer rounded-full px-4 py-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          mode === "HR"
            ? "bg-accent text-primary shadow-sm"
            : "text-slate-800 hover:bg-white dark:text-white/85 dark:hover:bg-white/10"
        }`}
      >
        HR
      </button>
      <button
        onClick={() => onModeChange("TECH")}
        aria-pressed={mode === "TECH"}
        className={`cursor-pointer rounded-full px-4 py-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          mode === "TECH"
            ? "bg-accent text-primary shadow-sm"
            : "text-slate-800 hover:bg-white dark:text-white/85 dark:hover:bg-white/10"
        }`}
      >
        Tech
      </button>
    </div>
  );
}
