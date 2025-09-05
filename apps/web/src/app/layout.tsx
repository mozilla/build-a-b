import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Billionaire Blast-Off',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/sharp-sans" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
