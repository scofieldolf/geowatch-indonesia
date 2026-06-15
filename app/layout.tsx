import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "GeoWatch Indonesia",
  description: "Peta Interaktif Gunung Api Aktif & Potensi Panas Bumi Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${inter.variable} ${newsreader.variable} antialiased bg-slate-950 text-slate-100 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
