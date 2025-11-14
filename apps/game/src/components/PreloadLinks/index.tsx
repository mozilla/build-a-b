/**
 * PreloadLinks Component
 *
 * Adds native browser <link rel="preload"> hints for critical assets.
 * This tells the browser to prioritize these assets at the network level,
 * complementing our JavaScript-based preloading strategy.
 *
 * Benefits:
 * - Browser starts downloading before JavaScript executes
 * - Higher priority in browser's internal request queue
 * - Better HTTP/2 multiplexing and prioritization
 */
import nightskyBg from '@/assets/backgrounds/color_nightsky.webp';
import { BILLIONAIRES } from '@/config/billionaires';
import { type FC, useEffect } from 'react';

// Track if links have been added globally (prevents duplicates in StrictMode)
let linksAdded = false;

interface PreloadLinksProps {
  /**
   * Whether to enable preload hints
   * @default true
   */
  enabled?: boolean;
}

export const PreloadLinks: FC<PreloadLinksProps> = ({ enabled = true }) => {
  useEffect(() => {
    if (!enabled || linksAdded) {
      if (import.meta.env.DEV && linksAdded) {
        console.log('🔗 Preload links already added (skipping duplicate)');
      }
      return;
    }

    // Critical assets - needed immediately
    const criticalAssets = [
      { href: nightskyBg, as: 'image' as const },
      ...BILLIONAIRES.map((b) => ({ href: b.imageSrc, as: 'image' as const })),
    ];

    criticalAssets.forEach(({ href, as }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      link.setAttribute('fetchpriority', 'high');
      link.setAttribute('data-preload-hint', 'true');
      document.head.appendChild(link);
    });

    linksAdded = true;

    // Note: We don't remove links on unmount to keep them active
  }, [enabled]);

  return null;
};
