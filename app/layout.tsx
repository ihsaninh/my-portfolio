import "./globals.css";

import { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { AnalyticsTracker } from "@/src/components/analytics";
import GoogleAnalytics from "@/src/components/analytics/GoogleAnalytics";
import Footer from "@/src/components/shared/Footer";
import Header from "@/src/components/shared/Header";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <GoogleAnalytics />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AnalyticsTracker />
          <div aria-hidden className="app-bg" />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="py-8 mt-0 lg:mt-8">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
