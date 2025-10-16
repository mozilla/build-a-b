import type { Metadata } from 'next';
import Script from 'next/script';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import { Providers } from './providers';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { evaluateFlag } from './flags';
import AnalyticsListener from '@/components/AnalyticsListener';
import { Suspense } from 'react';
import { socials } from '@/utils/constants';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if DataWar feature is enabled
  const isDataWarEnabled = await evaluateFlag('showDataWar');

  // Create navigation links conditionally
  const baseLinks = [
    { href: '/', label: 'Home', title: 'Go home', trackableEvent: 'click_home' },
    {
      href: '/twitchcon',
      label: 'Twitchcon',
      title: 'Learn about Twitchcon',
      trackableEvent: 'click_twitchcon',
    },
    // { href: '/space-launch', label: 'Space Launch', title: 'More about Space Launch', trackableEvent: 'click_space_launch' },
  ];

  const dataWarLink = {
    href: '/datawar',
    label: 'Data War',
    title: 'Play our game Data War',
    trackableEvent: 'click_datawar',
  };
  const links = isDataWarEnabled ? [...baseLinks, dataWarLink] : baseLinks;

  const navigationData = {
    links,
    socials,
    ctaCopy:
      'This experience uses AI and prioritizes open-source models, guided by stimulus from paid artists and prompt engineers. Billionaires feed your data into AI, we use it to hand the power back to you.',
    ctaLabel: 'Build a Billionaire',
  };
  return (
    <html lang="en" className={`scroll-smooth ${sharpSans.variable}`} data-scroll-behavior="smooth">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-GBTX3GFPFP'}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-GBTX3GFPFP'}', { send_page_view: false });
          `}
        </Script>
      </head>
      <body className="bg-background text-foreground">
        <Suspense>
          <AnalyticsListener />
        </Suspense>
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
