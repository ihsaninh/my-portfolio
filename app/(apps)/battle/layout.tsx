import { Metadata } from "next";

import { SWRegister } from "@/src/features/battle/components";

export const metadata: Metadata = {
  title: "Battle Arena | Ihsan Nurul Habib - Portfolio",
  description:
    "Challenge your friends in real-time knowledge battles! Create or join quiz battles on various topics.",
  keywords: [
    "battle",
    "quiz",
    "real-time",
    "multiplayer",
    "knowledge",
    "competition",
    "AI",
    "interactive",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Battle Arena",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-touch-icon": "/images/battle-icon.svg",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Battle Arena",
  },
  openGraph: {
    title: "Battle Arena - Real-time Knowledge Battles",
    description:
      "Challenge your friends in real-time knowledge battles! Create or join quiz battles on various topics.",
    type: "website",
    url: "https://ihsaninh.com/battle",
    images: [
      {
        url: "/images/battle-og-image.png",
        width: 1200,
        height: 630,
        alt: "Battle Arena - Real-time Knowledge Battles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Battle Arena - Real-time Knowledge Battles",
    description:
      "Challenge your friends in real-time knowledge battles! Create or join quiz battles on various topics.",
    images: ["/images/battle-og-image.png"],
  },
};

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SWRegister />
      {children}
    </>
  );
}
