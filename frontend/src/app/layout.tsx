import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/store/ReduxProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nosh — Dish Management Dashboard',
  description: 'Dish dashboard featuring draft editing, backend validation, and optimistic concurrency control.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-white text-black flex flex-col">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
