import type { CardFeatureProps } from './CardFeature';

// Import card images
import blocker1 from '@/assets/cards/blocker-1.webp';
import common1 from '@/assets/cards/common-1.webp';
import dataGrab from '@/assets/cards/data-grab.webp';
import firewallEmpathy from '@/assets/cards/firewall-empathy.webp';
import lsRocketCompany from '@/assets/cards/ls-rocket-company.webp';
import moveTakeover from '@/assets/cards/move-takeover.webp';
import tracker1 from '@/assets/cards/tracker-1.webp';

export const cardFeatures: Omit<CardFeatureProps, 'className'>[] = [
  {
    cardTitle: 'Common Data',
    cardImgSrc: common1,
    cardDesc: 'This card gives you points.',
  },
  {
    cardTitle: 'Trackers',
    cardImgSrc: tracker1,
    cardDesc: 'These cards boost your point total.',
  },
  {
    cardTitle: 'Blockers',
    cardImgSrc: blocker1,
    cardDesc: 'These cards subtract from your opponents total.',
  },
  {
    cardTitle: 'Firewalls',
    cardImgSrc: firewallEmpathy,
    cardDesc: 'Follow instructions for some <span class="italic">chaotic-good</span>.',
  },
  {
    cardTitle: 'Billionaire Moves',
    cardImgSrc: moveTakeover,
    cardDesc: 'Follow instructions for a little <span class="italic">chaotic-evil</span>.',
  },
  {
    cardTitle: 'Launch Stacks',
    cardImgSrc: lsRocketCompany,
    cardDesc: 'No value (but essential). Collect 3 to win!',
  },
  {
    cardTitle: 'Data Grab',
    cardImgSrc: dataGrab,
    cardDesc: 'Quick!. Grab as many cards as you can!',
  },
];
