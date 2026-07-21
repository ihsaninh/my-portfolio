import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";

import CopyCodeClient from "@/src/features/portfolio/components/blog/CopyCodeClient";
import QueryProvider from "@/src/shared/components/providers/QueryProvider";
import { SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/src/shared/lib/constants";
import { personJsonLd, websiteJsonLd } from "@/src/shared/lib/seo";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ihsan Nurul Habib - Frontend Developer",
  description:
    "Personal portfolio of Ihsan Nurul Habib, a frontend developer specializing in Next.js, React, and modern web technologies.",
  authors: [{ name: SITE_AUTHOR }],
  keywords: [
    "Ihsan Nurul Habib",
    "Frontend Developer",
    "React Developer",
    "Next.js Developer",
    "Web Developer Portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ihsan Nurul Habib - Frontend Developer",
    description:
      "Personal portfolio of Ihsan Nurul Habib, a frontend developer specializing in Next.js, React, and modern web technologies.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ihsan Nurul Habib - Frontend Developer",
    description:
      "Personal portfolio of Ihsan Nurul Habib, a frontend developer specializing in Next.js, React, and modern web technologies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              personJsonLd({
                name: SITE_AUTHOR,
                url: SITE_URL,
                jobTitle: "Frontend Developer",
                sameAs: [
                  "https://github.com/ihsaninh",
                  "https://www.linkedin.com/in/ihsaninh",
                ],
              }),
            ),
          }}
        />
        <script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              websiteJsonLd({
                url: SITE_URL,
                name: SITE_NAME,
                publisherName: SITE_AUTHOR,
              }),
            ),
          }}
        />
      </head>
      <body>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <CopyCodeClient />
            <div aria-hidden className="app-bg" />
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
