"use client";

import { usePathname } from "next/navigation";

import FooterGuard from "./FooterGuard";
import Header from "./Header";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isHireMePage = pathname === "/hire-me";
  const isQuizPage = pathname.startsWith("/quiz");
  const isBattlePage = pathname.startsWith("/battle");

  if (isHireMePage || isQuizPage || isBattlePage) {
    // Full-page layout for hire-me, quiz, and battle pages (no header/footer)
    return <>{children}</>;
  }

  // Standard layout for other pages
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="py-8 mt-0 lg:mt-8">{children}</main>
      <FooterGuard />
    </div>
  );
}
