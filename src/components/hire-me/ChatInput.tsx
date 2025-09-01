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

  return (
    <form
      onSubmit={onSubmit}
      className="group relative mt-2 border-t border-slate-200/60 pt-3 dark:border-white/10"
    >
      <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-white px-2 py-1.5 shadow-sm transition focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/30 dark:border-white/10 dark:bg-white/5">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400 disabled:opacity-60 dark:placeholder:text-white/40 resize-none leading-relaxed min-h-10 max-h-40 transition-[height] duration-200 ease-out"
          style={{ transitionProperty: "height" }}
          aria-label="Ketik pertanyaan interview"
        />
        <button
          type="submit"
          disabled={disabled}
          className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-primary shadow-sm transition hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Kirim
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-white/60">
        Tip: Switch modes anytime. The next answer adapts automatically.
      </p>
    </form>
  );
}
