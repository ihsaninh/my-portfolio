"use client";

import { useEffect } from "react";

export default function CopyCodeClient() {
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const btn = t?.closest<HTMLButtonElement>("[data-copy-code]");
      if (!btn) return;
      const container = btn.closest(".code-block");
      const codeEl = container?.querySelector("pre code");
      const text = codeEl?.textContent || "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        btn.setAttribute("data-copied", "true");
        window.setTimeout(() => btn.removeAttribute("data-copied"), 1500);
      } catch {}
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

