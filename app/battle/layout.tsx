import { Metadata } from "next";

import SWRegister from "./sw-register";

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
