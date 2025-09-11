import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: 'Billionaire Blast-Off',
  description: '',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
    <body className="bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}