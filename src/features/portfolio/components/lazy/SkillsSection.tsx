"use client";

import dynamic from "next/dynamic";

import LazyOnView from "@/src/shared/components/LazyOnView";

const Skills = dynamic(() => import("@/src/features/portfolio/components/skills"), {
  ssr: false,
  loading: () => (
    <div className="container mt-12 lg:mt-24" aria-hidden>
      <div className="h-10 w-36 rounded bg-slate-200/60 dark:bg-white/10" />
      <div className="mt-4 h-40 rounded-2xl bg-slate-200/40 dark:bg-white/5" />
    </div>
  ),
});

export default function SkillsSection() {
  return (
    <LazyOnView rootMargin="200px">
      <Skills />
    </LazyOnView>
  );
}
