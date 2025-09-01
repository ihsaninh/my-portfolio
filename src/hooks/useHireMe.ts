import { useEffect, useRef } from "react";

import { MAX_TEXTAREA_HEIGHT } from "../constants";

// Custom hook to lock body overflow when component is mounted
export function useBodyOverflowLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

// Custom hook to scroll to bottom when dependencies change
export function useScrollToBottom(messages: unknown[], status: unknown) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  return bottomRef;
}

// Custom hook to auto-resize textarea based on content
export function useTextareaAutoResize(input: string) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // Smooth transition between heights
    const prevHeight = el.offsetHeight;
    el.style.height = "auto";
    const target = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);

    // Set back to previous height to create a transition start point
    el.style.height = `${prevHeight}px`;
    // Force reflow to apply the start height before transitioning
    void el.offsetHeight;
    // Animate to target height
    el.style.height = `${target}px`;
    el.style.overflowY =
      el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [input]);

  return textareaRef;
}
