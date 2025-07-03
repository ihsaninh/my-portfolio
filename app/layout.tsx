import { Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/src/components/shared/Header';
import Footer from '@/src/components/shared/Footer';
import { AnalyticsTracker } from '@/src/components/analytics';
import GoogleAnalytics from '@/src/components/analytics/GoogleAnalytics';
import { metadata } from '@/src/lib/metadata';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${outfit.className}`}>
        <AnalyticsTracker />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="container mx-auto px-4 py-8 mt-16 lg:mt-24">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}