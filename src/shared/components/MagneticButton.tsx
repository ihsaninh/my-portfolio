"use client";

import Link from "next/link";
import { MouseEvent, ReactNode, useRef, useState } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  href?: string;
  download?: boolean;
  ariaLabel?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const MagneticButton = ({
  children,
  className = "",
  onClick,
  variant = "primary",
  href,
  download,
  ariaLabel,
  target,
  type = "button",
  disabled = false,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const getVariantClass = () => {
    switch (variant) {
      case "primary":
        return "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg hover:shadow-xl";
      case "outline":
        return "border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10";
      case "ghost":
        return "hover:bg-slate-100 dark:hover:bg-white/5";
      default:
        return "";
    }
  };

  const commonProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: ref as any,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className: `magnetic-btn px-6 py-3 rounded-full font-medium transition-transform duration-200 ease-out active:scale-95 flex items-center justify-center gap-2 ${getVariantClass()} ${className}`,
    style: { transform: `translate(${position.x}px, ${position.y}px)` },
    "aria-label": ariaLabel,
  };

  if (href) {
    if (download || target === "_blank") {
      return (
        <a
          href={href}
          download={download}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          {...commonProps}
        >
          <span className="relative z-10 flex items-center gap-2 pointer-events-none">
            {children}
          </span>
        </a>
      );
    }
    return (
      <Link href={href} {...commonProps} onClick={onClick}>
        <span className="relative z-10 flex items-center gap-2 pointer-events-none">
          {children}
        </span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} type={type} disabled={disabled} {...commonProps}>
      <span className="relative z-10 flex items-center gap-2 pointer-events-none">
        {children}
      </span>
    </button>
  );
};
