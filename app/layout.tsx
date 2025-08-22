import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";

import CopyCodeClient from "@/src/components/blog/CopyCodeClient";
import Footer from "@/src/components/shared/Footer";
import Header from "@/src/components/shared/Header";
import { personJsonLd, websiteJsonLd } from "@/src/lib/seo";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ihsaninh.com"),
  title: "Ihsan Nurul Habib - Frontend Developer",
  description:
    "Personal portfolio of Ihsan Nurul Habib, a frontend developer specializing in Next.js, React, and modern web technologies.",
  authors: [{ name: "Ihsan Nurul Habib" }],
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
    url: "https://ihsaninh.com",
    siteName: "Ihsan Nurul Habib — Portfolio",
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
                name: "Ihsan Nurul Habib",
                url: "https://ihsaninh.com",
                jobTitle: "Frontend Developer",
                sameAs: [
                  "https://github.com/ihsaninh",
                  "https://www.linkedin.com/in/ihsaninh",
                ],
              })
            ),
          }}
        />
        <script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              websiteJsonLd({
                url: "https://ihsaninh.com",
                name: "Ihsan Nurul Habib — Portfolio",
                publisherName: "Ihsan Nurul Habib",
              })
            ),
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CopyCodeClient />
          <div aria-hidden className="app-bg" />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="py-8 mt-0 lg:mt-8">{children}</main>
            <Footer />
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
