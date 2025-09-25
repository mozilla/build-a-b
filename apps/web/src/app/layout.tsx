import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';
import { Providers } from './providers';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Billionaire Blast-Off',
  description: '',
  icons: {
    icon: '/favicon.svg',
  },
};

const navigationData = {
  links: [
    { href: '/', label: 'Home', title: 'Go to home' },
    { href: '/twitchcon', label: 'Twitchcon', title: 'Learn about Twitchcon' },
    // { href: '/space-launch', label: 'Space Launch', title: 'More about Space Launch' },
    // { href: '/datawar', label: 'Game', title: 'Play our game Data War' },
  ],
  socials: [
    {
      href: 'https://www.tiktok.com/@firefox',
      title: 'Visit our TikTok',
      alt: 'TikTok',
      src: '/assets/images/social/tiktok.svg',
    },
    {
      href: 'https://www.instagram.com/firefox/',
      title: 'Check our Instagram',
      alt: 'Instagram',
      src: '/assets/images/social/instagram.svg',
    },
    {
      href: 'https://www.threads.com/@firefox',
      title: 'Check our Threads',
      alt: 'Threads',
      src: '/assets/images/social/threads.svg',
    },
    {
      href: 'https://www.youtube.com/firefoxchannel',
      title: 'Watch our YouTube channel',
      alt: 'YouTube',
      src: '/assets/images/social/youtube.svg',
    },
  ],
  ctaCopy: ['Big Tech wants to own your orbit.', 'We say—go launch yourself!'],
  ctaLabel: 'Build a Billionaire',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GBTX3GFPFP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GBTX3GFPFP');
          `}
        </Script>
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <Container>
            <Header
              links={navigationData.links}
              socials={navigationData.socials}
              ctaCopy={navigationData.ctaCopy}
              ctaLabel={navigationData.ctaLabel}
            />
            {children}
            <Footer
              links={navigationData.links}
              socials={navigationData.socials}
              ctaCopy={navigationData.ctaCopy}
              ctaLabel={navigationData.ctaLabel}
            />
          </Container>
        </Providers>
      </body>
    </html>
  );
}
