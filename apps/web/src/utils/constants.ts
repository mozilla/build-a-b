import type { AvatarBentoProps } from '@/components/PrimaryFlow/AvatarBento';

export const BUCKET_NAME = 'billionaires';
export const COOKIE_NAME = 'user_id';
export const ID_HISTORY_COOKIE = 'id_history';
export const DEFAULT_AVATAR_WIDTH = 500;
export const DEFAULT_AVATAR_HEIGHT = 1200;
export const SELFIES_LIMIT = 5;

export const avatarBentoData: AvatarBentoProps = {
  primaryFlowData: {
    triggerClassNames:
      'absolute left-[5rem] landscape:left-[8.125rem] top-[17rem] landscape:top-[18.5rem] px-[3rem] landscape:px-[2.125rem] py-[0.75rem] bg-charcoal/30 rotate-[9deg] landscape:rotate-0 transition-[bg-color, color] transition-transform duration-600 group-hover:rotate-[-12deg] group-hover:bg-accent group-hover:text-charcoal',
    ctaText: 'Get Started',
    title: 'Make Earth a Better Place. Launch a Billionaire.',
    description:
      'When Billionaires harvest your data for ego trips to space, it makes the internet and everything connected to it worse. Build your own Billionaire and send them safely off-planet (one-way).',
    createAvatarCtaText: 'Start Building Your Billionaire',
    randomAvatarCtaText: 'Create a Random Billionaire',
  },
  imageSrcLandscape: '/assets/images/avatar-square.webp',
  imageSrcPortrait: '/assets/images/avatar-portrait.png',
  imageAlt: '', // Decorative image
};

export const actionTypes = ['share', 'save', 'restart'] as const;
