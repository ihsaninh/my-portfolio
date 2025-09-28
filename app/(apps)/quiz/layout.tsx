import type { Metadata } from "next";
import Script from "next/script";

import { breadcrumbJsonLd } from "@/src/shared/lib/seo";

export const metadata: Metadata = {
  title: "Interactive Quiz – Frontend Developer",
  description:
    "Test your programming knowledge with AI-powered interactive quizzes. Get instant feedback and compete on the leaderboard.",
  alternates: { canonical: "/quiz" },
  openGraph: {
    title: "Interactive Quiz – Frontend Developer",
    description:
      "Test your programming knowledge with AI-powered interactive quizzes and compete on the leaderboard.",
    url: "/quiz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Quiz – Frontend Developer",
    description:
      "Test your programming knowledge with AI-powered interactive quizzes and compete on the leaderboard.",
  },
};

export default function QuizLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Script
        id="ld-breadcrumb-quiz"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: "https://ihsaninh.com/" },
              {
                name: "Interactive Quiz",
                item: "https://ihsaninh.com/quiz",
              },
            ])
          ),
        }}
      />
      {/* Full-page experience without default layout */}
      <div className="isolate">{children}</div>
    </>
  );
}
