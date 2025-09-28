"use client";

import { usePathname } from "next/navigation";

import Footer from "./Footer";

export default function FooterGuard() {
  const pathname = usePathname();
  if (pathname?.startsWith("/hire-me")) return null;
  return <Footer />;
}
