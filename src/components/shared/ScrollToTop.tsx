"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);
  return null;
}
