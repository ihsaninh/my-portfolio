"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  rootMargin?: string;
  once?: boolean;
};

export default function LazyOnView({ children, rootMargin = "200px", once = true }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin, threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [rootMargin, once, visible]);

  return <div ref={ref}>{visible ? children : null}</div>;
}

