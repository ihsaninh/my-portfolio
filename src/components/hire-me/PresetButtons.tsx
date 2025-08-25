interface PresetButtonsProps {
  presets: readonly string[];
  onPresetClick: (preset: string) => void;
  disabled: boolean;
}

export function PresetButtons({
  presets,
  onPresetClick,
  disabled,
}: Readonly<PresetButtonsProps>) {
  return (
    <div className="flex flex-nowrap md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory">
      {presets.map((q) => (
        <button
          key={q}
          onClick={() => onPresetClick(q)}
          className="cursor-pointer shrink-0 snap-start whitespace-nowrap rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:hover:bg-white/10"
          disabled={disabled}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
