import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/src/components/shared/Header';
import Footer from '@/src/components/shared/Footer';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ihsan Nurul Habib - Frontend Developer',
  description: 'Personal portfolio of Ihsan Nurul Habib, a frontend developer specializing in Next.js, React, and modern web technologies.',
  authors: [{ name: 'Ihsan Nurul Habib' }],
  keywords: [
    'Ihsan Nurul Habib',
    'Frontend Developer',
    'React Developer',
    'Next.js Developer',
    'Web Developer Portfolio',
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className}`}>
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
