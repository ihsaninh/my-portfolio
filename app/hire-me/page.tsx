"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

import {
  ChatInput,
  ChatMessage,
  ModeSelector,
  PresetButtons,
  RateLimitInfo,
  TypingIndicator,
} from "@/src/components/hire-me";
import { HR_PRESETS, PLACEHOLDERS, TECH_PRESETS } from "@/src/constants";
import {
  useBodyOverflowLock,
  useScrollToBottom,
  useTextareaAutoResize,
} from "@/src/hooks/useHireMe";
import { Mode } from "@/src/types/hire-me";

export default function HireMePage() {
  const [mode, setMode] = useState<Mode>("HR");
  const [input, setInput] = useState("");
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number;
    resetTime: number;
    resetInSeconds: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitRefreshTrigger, setRateLimitRefreshTrigger] = useState(0);

  const { messages, sendMessage, status } = useChat({
    id: `hire-${mode}`,
    transport: new DefaultChatTransport({
      api: `/api/chat?mode=${mode}`,
    }),
    onError: (error) => {
      if (error.message.includes("Rate limit")) {
        setErrorMessage(
          "Rate limit exceeded. Please wait before sending another message."
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      // Clear error after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    },
    onFinish: () => {
      // Refresh rate limit status after message is sent
      setRateLimitRefreshTrigger((prev) => prev + 1);
    },
  });

  useBodyOverflowLock();
  const bottomRef = useScrollToBottom(messages, status);
  const textareaRef = useTextareaAutoResize(input);

  const disabled = status !== "ready" || rateLimitStatus?.remaining === 0;
  const presets = mode === "HR" ? HR_PRESETS : TECH_PRESETS;
  const placeholder = PLACEHOLDERS[mode];

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const handlePresetClick = (preset: string) => {
    sendMessage({ text: preset });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  return (
    <div className="fixed inset-0 pt-20 pb-4 md:pb-6 md:pt-24 overflow-hidden z-40">
      <div className="container h-full">
        <div className="h-full flex flex-col gap-4 md:gap-6">
          {/* Header / Intro */}
          <header className="space-y-3 md:space-y-4">
            <div>
              <h1 className="text-3xl lg:text-[42px] font-bold leading-tight text-slate-900 dark:text-white">
                Hire Me Simulator with{" "}
                <span className="text-accent">Ihsan</span>
              </h1>
              <p className="mt-2 text-sm lg:text-base text-slate-700 dark:text-white/70">
                Simulate an interview with me. Choose HR to role‑play a
                recruiter screening Ihsan, or Tech to run a technical deep‑dive.
                Use presets or ask custom questions to evaluate answers and
                explore experience.
              </p>
            </div>

            <ModeSelector mode={mode} onModeChange={handleModeChange} />
          </header>

          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <PresetButtons
              presets={presets}
              onPresetClick={handlePresetClick}
              disabled={disabled}
            />
          </div>

          {/* Rate limit info */}
          <RateLimitInfo
            onRateLimitChange={setRateLimitStatus}
            refreshTrigger={rateLimitRefreshTrigger}
          />

          {/* Error message */}
          {errorMessage && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Chat card */}
          <section className="flex-1 rounded-2xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-white/[0.04] flex flex-col min-h-0">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-8 text-sm text-slate-600 dark:text-white/60">
                  <svg
                    className="h-30 w-30 mb-3 text-slate-300 dark:text-white/30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 4v-8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                    <path d="M17 11V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v6" />
                    <path d="M8 9h4" />
                    <path d="M8 5h2" />
                  </svg>
                  <p>Start by choosing a preset above or type your question.</p>
                </div>
              )}

              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isUser={isUser}
                  />
                );
              })}

              {status !== "ready" && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            <ChatInput
              input={input}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              disabled={disabled}
              placeholder={placeholder}
              textareaRef={textareaRef}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
