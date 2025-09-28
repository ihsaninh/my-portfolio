import { motion } from "framer-motion";

import { ChatMessage as ChatMessageType } from "@/src/features/hire-me/types/hire-me";
import { MarkdownRenderer } from "@/src/shared/lib/mdx/markdown-renderer";

interface ChatMessageProps {
  message: ChatMessageType;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: Readonly<ChatMessageProps>) {
  return (
    <motion.div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } bp-fade-up-100`}
      initial={{ opacity: 0, x: isUser ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <div
        className={`flex items-start gap-3 max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className={`flex-shrink-0 ${isUser ? "" : ""}`}
        >
          {isUser ? (
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-300 dark:to-slate-400 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white dark:text-slate-800">
                AI
              </span>
            </div>
          )}
        </motion.div>

        {/* Message bubble */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1"
        >
          {/* Name label */}
          <div
            className={`text-xs font-medium ${
              isUser ? "text-right" : "text-left"
            } ${isUser ? "text-accent" : "text-slate-600 dark:text-slate-400"}`}
          >
            {isUser ? "You" : "Ihsan (AI)"}
          </div>

          {/* Message content */}
          <div
            className={`relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
              isUser
                ? "border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 text-slate-800 dark:border-accent/30 dark:from-accent/20 dark:to-accent/10 dark:text-white"
                : "border border-white/20 bg-white/80 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white"
            }`}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <div className="relative leading-relaxed">
              {MarkdownRenderer.renderBlocks(
                message.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("")
                  .trim()
              )}
            </div>

            {/* Message tail */}
            <div
              className={`absolute top-3 h-3 w-3 rotate-45 ${
                isUser
                  ? "-right-1 border-r border-b border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 dark:border-accent/30 dark:from-accent/20 dark:to-accent/10"
                  : "-left-1 border-l border-b border-white/20 bg-white/80 dark:border-white/10 dark:bg-white/10"
              }`}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
