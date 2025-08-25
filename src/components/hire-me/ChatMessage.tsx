import { MarkdownRenderer } from "@/src/lib/markdown-renderer";
import { ChatMessage as ChatMessageType } from "@/src/types/hire-me";

interface ChatMessageProps {
  message: ChatMessageType;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: Readonly<ChatMessageProps>) {
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } bp-fade-up-100`}
    >
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl border border-accent/40 bg-accent/10 px-3 py-2 text-slate-800 shadow-sm dark:border-accent/30 dark:bg-accent/10 dark:text-white/85"
            : "max-w-[85%] rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/85"
        }
      >
        <span className="block text-[11px] mb-1 text-slate-500 dark:text-white/60">
          {isUser ? "You" : "Ihsan (AI)"}
        </span>
        <div className="leading-relaxed">
          {MarkdownRenderer.renderBlocks(
            message.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("")
              .trim()
          )}
        </div>
      </div>
    </div>
  );
}
