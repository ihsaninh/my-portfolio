import "./globals.css";

import { Outfit, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { AnalyticsTracker } from "@/src/components/analytics";
import GoogleAnalytics from "@/src/components/analytics/GoogleAnalytics";
import Footer from "@/src/components/shared/Footer";
import Header from "@/src/components/shared/Header";
import { metadata } from "@/src/lib/metadata";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${outfit.className} ${jetbrainsMono.variable}`}>
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
            <main className="py-8 mt-16 lg:mt-24">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
