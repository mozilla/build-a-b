import type { Metadata } from 'next';
import Script from 'next/script';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import { Providers } from './providers';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sharpSans = localFont({
  src: [
    {
      path: '../../public/assets/fonts/Sharp Sans Thin.woff',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Thin Italic.woff',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Light Italic.woff',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Italic.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Medium Italic.woff',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Semibold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Semibold Italic.woff',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/assets/fonts/SharpSansBold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Bold Italic.woff',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans Extrabold.woff',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/Sharp Sans ExtraBold Italic.woff',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-sharp-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://billionaireblastoff.firefox.com/?utm_source=bbomicrosite&utm_medium=referral&utm_campaign=bbo',
  ),
  title: "Firefox Billionaire Blast Off - It's a Space Race!",
  description:
    'Build a Billionaire, check out our new game, Data War, and join us at TwitchCon to send our Billionaires into space.',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    siteName: 'Billionaire Blast Off Powered by Firefox',
    title: 'Make Earth a better place. Launch a Billionaire.',
    description:
      'Build a Billionaire, check out our new game, Data War, and join us at TwitchCon to send our Billionaires into space.',
    images: [
      {
        url: '/assets/images/opengraph/home.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/images/opengraph/home.jpg'],
  },
};

const navigationData = {
  links: [
    { href: '/', label: 'Home', title: 'Go to home' },
    { href: '/twitchcon', label: 'Twitchcon', title: 'Learn about Twitchcon' },
    // { href: '/space-launch', label: 'Space Launch', title: 'More about Space Launch' },
    { href: '/datawar', label: 'Data War', title: 'Play our game Data War' },
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
  ctaCopy:
    'This experience uses AI and prioritizes open-source models, guided by stimulus from paid artists and prompt engineers. Billionaires feed your data into AI, we use it to hand the power back to you.',
  ctaLabel: 'Build a Billionaire',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${sharpSans.variable}`} data-scroll-behavior="smooth">
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
