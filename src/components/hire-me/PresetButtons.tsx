import { motion } from "framer-motion";

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
    <div className="flex flex-nowrap md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-1">
      {presets.map((preset, index) => (
        <motion.button
          key={preset}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => onPresetClick(preset)}
          disabled={disabled}
          className="group relative shrink-0 snap-start overflow-hidden rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm px-3 py-2 text-xs md:text-sm font-medium text-slate-700 shadow-lg transition-all duration-200 hover:border-accent/30 hover:bg-white/80 hover:text-slate-900 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-60 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          {/* Content */}
          <span className="relative whitespace-nowrap">{preset}</span>

          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
