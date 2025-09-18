import React from "react";

import { MessageSegment } from "@/src/types/hire-me";

// Markdown Rendering Utilities
export class MarkdownRenderer {
  static renderInline(text: string): React.ReactNode[] {
    // Split inline code first
    const codeParts = text.split(/`/g);
    return codeParts.map((seg, i) =>
      i % 2 === 1 ? (
        <code
          key={`code-${seg}`}
          className="rounded px-1 py-0.5 text-[13px] bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white/90"
        >
          {seg}
        </code>
      ) : (
        <span key={`txt-${seg}`}>{MarkdownRenderer.renderEmphasis(seg)}</span>
      )
    );
  }

  static renderEmphasis(text: string): React.ReactNode[] {
    // Enhanced tokenizer for bold and italic with both * and _ support
    const out: React.ReactNode[] = [];
    // Simplified regex patterns to reduce complexity
    const boldPattern = /(\*\*[^*]+?\*\*|__[^_]+?__)/g;
    const italicPattern = /(_[^_\s][^_]*[^_\s]_|\*[^*\s][^*]*[^*\s]\*)/g;

    // First pass: handle bold formatting
    let boldCounter = 0;
    const processedText = text.replace(boldPattern, () => {
      return `__BOLD_${boldCounter++}__`;
    });

    // Store bold matches
    const boldMatches: string[] = [];
    let boldMatch;
    boldPattern.lastIndex = 0;
    while ((boldMatch = boldPattern.exec(text)) !== null) {
      boldMatches.push(boldMatch[0]);
    }

    // Second pass: handle italic formatting on remaining text
    const segments: MessageSegment[] = [];
    const parts = processedText.split(/(__BOLD_\d+__)/g);

    parts.forEach((part) => {
      const boldMarker = part.match(/__BOLD_(\d+)__/);
      if (boldMarker) {
        segments.push({
          type: "bold",
          content: boldMatches[parseInt(boldMarker[1])],
        });
      } else {
        // Process italic in non-bold text
        let lastIdx = 0;
        let italicMatch;
        italicPattern.lastIndex = 0;
        while ((italicMatch = italicPattern.exec(part)) !== null) {
          if (italicMatch.index > lastIdx) {
            segments.push({
              type: "text",
              content: part.slice(lastIdx, italicMatch.index),
            });
          }
          segments.push({ type: "italic", content: italicMatch[0] });
          lastIdx = italicMatch.index + italicMatch[0].length;
        }
        if (lastIdx < part.length) {
          segments.push({ type: "text", content: part.slice(lastIdx) });
        }
      }
    });

    // Render segments
    segments.forEach((segment, index) => {
      if (segment.type === "bold") {
        const content = segment.content.slice(2, -2);
        out.push(<strong key={`b-${index}`}>{content}</strong>);
      } else if (segment.type === "italic") {
        const content = segment.content.slice(1, -1);
        out.push(<em key={`i-${index}`}>{content}</em>);
      } else if (segment.content) {
        out.push(segment.content);
      }
    });

    return out;
  }

  static renderListItemWithLabel(txt: string): React.ReactNode {
    const m = txt.match(/^(\S[\w\s+()./#-]{1,60}?):\s*(.*)$/);
    if (m) {
      const [, label, rest] = m;
      return (
        <span>
          <strong>{label}:</strong>{" "}
          {rest ? MarkdownRenderer.renderInline(rest) : null}
        </span>
      );
    }
    return <>{MarkdownRenderer.renderInline(txt)}</>;
  }

  static renderTextBlock(text: string): React.ReactNode {
    // Normalize inline bullets that AI sometimes emits without newlines
    const normalized = text
      .replace(/\s\*\s+/g, "\n* ")
      .replace(/\s-\s+/g, "\n- ")
      .replace(/\s•\s+/g, "\n• ")
      .replace(/\s(\d+)\.\s+/g, "\n$1. ");

    const lines = normalized.split(/\n/);
    const out: React.ReactNode[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }

      // Unordered list
      if (/^[-*•]\s+/.test(line)) {
        const items: string[] = [];
        let j = i;
        while (j < lines.length && /^\s*[-*•]\s+/.test(lines[j])) {
          items.push(lines[j].replace(/^\s*[-*•]\s+/, "").trim());
          j++;
        }
        const headingMatch = items[0]?.match(
          /^([A-Z][\w\s+()./\-]{1,60}):\s*$/
        );
        if (headingMatch) {
          const title = headingMatch[1];
          out.push(
            <p
              key={`ul-h-${i}`}
              className="font-semibold text-slate-900 dark:text-white"
            >
              {title}
            </p>
          );
          const rest = items.slice(1);
          if (rest.length) {
            out.push(
              <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1">
                {rest.map((it, idx) => (
                  <li key={`${i}-${idx}`}>
                    {MarkdownRenderer.renderListItemWithLabel(it)}
                  </li>
                ))}
              </ul>
            );
          }
        } else {
          out.push(
            <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1">
              {items.map((it, idx) => (
                <li key={`${i}-${idx}`}>
                  {MarkdownRenderer.renderListItemWithLabel(it)}
                </li>
              ))}
            </ul>
          );
        }
        i = j;
        continue;
      }

      // Ordered list
      if (/^\d+[.)]\s+/.test(line)) {
        const items: string[] = [];
        let j = i;
        while (j < lines.length && /^\s*\d+[.)]\s+/.test(lines[j])) {
          items.push(lines[j].replace(/^\s*\d+[.)]\s+/, "").trim());
          j++;
        }
        out.push(
          <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-1">
            {items.map((it, idx) => (
              <li key={`${i}-${idx}`}>
                {MarkdownRenderer.renderListItemWithLabel(it)}
              </li>
            ))}
          </ol>
        );
        i = j;
        continue;
      }

      // Paragraph (collect until blank line or next list)
      const paras: string[] = [line];
      let j = i + 1;
      while (
        j < lines.length &&
        lines[j].trim() &&
        !/^\s*[-*•]\s+/.test(lines[j]) &&
        !/^\s*\d+[.)]\s+/.test(lines[j])
      ) {
        paras.push(lines[j].trim());
        j++;
      }
      out.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {MarkdownRenderer.renderInline(paras.join(" "))}
        </p>
      );
      i = j;
    }

    return <div className="space-y-2">{out}</div>;
  }

  static renderBlocks(raw: string): React.ReactNode {
    const blocks: React.ReactNode[] = [];

    // Extract fenced code blocks ```lang\ncode\n```
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockIndex = 0;

    while ((match = regex.exec(raw)) !== null) {
      const [full, lang = "", code] = match;
      const prev = raw.slice(lastIndex, match.index);
      if (prev.trim()) {
        blocks.push(
          <div key={`text-${blockIndex}`}>
            {MarkdownRenderer.renderTextBlock(prev)}
          </div>
        );
        blockIndex++;
      }
      blocks.push(
        <div key={`${match.index}-code`} className="code-block group">
          <button
            type="button"
            data-copy-code
            className="code-copy-btn"
            aria-label="Copy code"
          >
            <span className="state-default">Copy</span>
            <span className="state-copied">Copied</span>
          </button>
          <pre className={`language-${lang}`}>
            <code className={`language-${lang}`}>{code.trim()}</code>
          </pre>
        </div>
      );
      lastIndex = match.index + full.length;
    }

    const tail = raw.slice(lastIndex);
    if (tail.trim()) {
      blocks.push(
        <div key={`text-${blockIndex}`}>
          {MarkdownRenderer.renderTextBlock(tail)}
        </div>
      );
    }

    return <div className="space-y-3 mdx-content">{blocks}</div>;
  }
}
