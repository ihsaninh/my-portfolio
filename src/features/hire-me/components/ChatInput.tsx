import { motion } from "framer-motion";
import React from "react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  placeholder: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  disabled,
  placeholder,
  textareaRef,
}: Readonly<ChatInputProps>) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && input.trim()) {
        onSubmit(e);
      }
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative space-y-3"
    >
      {/* Input container */}
      <div className="relative">
        <div className="flex items-end gap-3 rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl p-1 shadow-lg transition-all duration-200 focus-within:border-accent/40 focus-within:shadow-xl dark:border-white/10 dark:bg-white/5">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={placeholder}
              className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-slate-500 disabled:opacity-60 dark:placeholder:text-slate-400 resize-none leading-relaxed min-h-[44px] max-h-32 transition-all duration-200"
              aria-label="Type your interview question"
            />

            {/* Subtle border highlight */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 pointer-events-none" />
          </div>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={disabled || !hasContent}
            whileHover={{ scale: disabled || !hasContent ? 1 : 1.05 }}
            whileTap={{ scale: disabled || !hasContent ? 1 : 0.95 }}
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              hasContent && !disabled
                ? "bg-gradient-to-r from-accent to-accent/90 text-white shadow-accent/30 hover:shadow-xl"
                : "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500"
            }`}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: hasContent && !disabled ? 0 : -45,
                scale: hasContent && !disabled ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            </motion.div>

            {/* Pulse effect when ready to send */}
            {hasContent && !disabled && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-accent/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Helper text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
      >
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-accent/60" />
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>Mode switches apply instantly</span>
        </div>
      </motion.div>
    </motion.form>
  );
}
