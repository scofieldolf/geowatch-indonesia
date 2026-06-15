import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
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
        className={`${inter.variable} ${lora.variable} antialiased bg-slate-950 text-slate-100 font-serif`}
      >
        {children}
      </body>
    </html>
  );
}
