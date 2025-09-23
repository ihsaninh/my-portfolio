"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  ChatInput,
  ChatMessage,
  ModeSelector,
  PresetButtons,
  TypingIndicator,
} from "@/src/components/hire-me";
import { HR_PRESETS, PLACEHOLDERS, TECH_PRESETS } from "@/src/constants";
import {
  useBodyOverflowLock,
  useScrollToBottom,
  useTextareaAutoResize,
} from "@/src/hooks/useHireMe";
import { Mode } from "@/src/types/hire-me";

// Loading Screen Component
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // 2.5 seconds loading

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent/10" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 text-center space-y-8">
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-2xl"
        >
          <motion.svg
            className="w-12 h-12 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 4v-8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
            <path d="M17 11V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v6" />
          </motion.svg>
        </motion.div>

        {/* App Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-white">Hire Me Simulator</h1>
          <p className="text-lg text-slate-300">
            Interactive Interview Experience
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="space-y-4"
        >
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-accent rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <motion.p
            className="text-sm text-slate-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Initializing interview environment...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function HireMePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("HR");
  const [input, setInput] = useState("");
  const lastRequestTime = useRef<number>(0);

  const { messages, sendMessage, status } = useChat({
    id: `hire-${mode}`,
    transport: new DefaultChatTransport({
      api: `/api/ask?mode=${mode}`,
    }),
  });

  useBodyOverflowLock();
  const bottomRef = useScrollToBottom(messages, status);
  const textareaRef = useTextareaAutoResize(input);

  const disabled = status !== "ready";
  const presets = mode === "HR" ? HR_PRESETS : TECH_PRESETS;
  const placeholder = PLACEHOLDERS[mode];

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const handlePresetClick = (preset: string) => {
    // Throttle preset clicks - minimum 2 seconds between clicks
    const now = Date.now();
    if (now - lastRequestTime.current < 2000) {
      return; // Too soon, ignore
    }

    lastRequestTime.current = now;
    sendMessage({ text: preset });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Throttle requests - minimum 1 second between requests
    const now = Date.now();
    if (now - lastRequestTime.current < 1000) {
      return; // Too soon, ignore
    }

    lastRequestTime.current = now;
    sendMessage({ text: input });
    setInput("");
  };

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && (
          <motion.div
            key="main-app"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 overflow-hidden z-40"
          >
            {/* Background with animated gradient - matching loading screen */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent/10" />
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 40% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="container h-full relative z-10 py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-full flex flex-col gap-6"
              >
                {/* Compact Header */}
                <header className="flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4"
                  >
                    {/* Title Section - More Attractive */}
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                        {/* Animated briefcase icon */}
                        <motion.div
                          initial={{ rotate: -10, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.4,
                            type: "spring",
                          }}
                          className="relative"
                        >
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
                            <svg
                              className="h-6 w-6 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                width="20"
                                height="14"
                                x="2"
                                y="7"
                                rx="2"
                                ry="2"
                              />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                          </div>
                        </motion.div>

                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            Hire Me Simulator
                          </span>
                        </h1>
                      </div>
                    </div>

                    {/* Mode Selector */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex justify-center md:justify-end flex-shrink-0"
                    >
                      <ModeSelector
                        mode={mode}
                        onModeChange={handleModeChange}
                      />
                    </motion.div>
                  </motion.div>
                </header>

                {/* Compact Presets Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex-shrink-0"
                >
                  <PresetButtons
                    presets={presets}
                    onPresetClick={handlePresetClick}
                    disabled={disabled}
                  />
                </motion.div>

                {/* Enhanced Chat Interface */}
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex-1 min-h-0 relative"
                >
                  {/* Glassmorphism card with enhanced styling */}
                  <div className="h-full rounded-2xl border border-white/20 bg-white/40 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:border-white/10 dark:bg-white/[0.02] dark:shadow-slate-800/20 flex flex-col overflow-hidden">
                    {/* Compact Chat header */}
                    <div className="px-4 py-3 border-b border-white/10 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Interview Session • {mode} Mode
                        </div>
                      </div>
                    </div>

                    {/* Chat messages area */}
                    <div className="flex-1 min-h-0 p-3 md:p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-500">
                      <AnimatePresence mode="popLayout">
                        {messages.length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center text-center h-full"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="flex flex-col items-center space-y-4"
                            >
                              {/* Enhanced empty state icon */}
                              <div className="relative">
                                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-lg">
                                  <svg
                                    className="h-12 w-12 text-accent"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 4v-8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                                    <path d="M17 11V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v6" />
                                    <path d="M8 9h4" />
                                    <path d="M8 5h2" />
                                  </svg>
                                </div>
                                <motion.div
                                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-400 flex items-center justify-center shadow-lg"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5, type: "spring" }}
                                >
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                </motion.div>
                              </div>

                              {/* Text content */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center space-y-2"
                              >
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                  Ready for the Interview?
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                                  Start by selecting a quick question above or
                                  type your own question below.
                                </p>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        )}

                        {messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <ChatMessage
                              message={message}
                              isUser={message.role === "user"}
                            />
                          </motion.div>
                        ))}

                        {status !== "ready" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <TypingIndicator />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div ref={bottomRef} />
                    </div>

                    {/* Enhanced chat input */}
                    <div className="border-t border-white/10 dark:border-white/5 p-3 md:p-4 flex-shrink-0">
                      <ChatInput
                        input={input}
                        onInputChange={handleInputChange}
                        onSubmit={handleSubmit}
                        disabled={disabled}
                        placeholder={placeholder}
                        textareaRef={textareaRef}
                      />
                    </div>
                  </div>
                </motion.section>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
