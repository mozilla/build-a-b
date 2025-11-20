import type { CardFeatureProps } from './CardFeature';

// Import card images
import blocker1 from '@/assets/cards/blocker-1.webp';
import blocker2 from '@/assets/cards/blocker-2.webp';
import common1 from '@/assets/cards/common-1.webp';
import common2 from '@/assets/cards/common-2.webp';
import common3 from '@/assets/cards/common-3.webp';
import common4 from '@/assets/cards/common-4.webp';
import common5 from '@/assets/cards/common-5.webp';
import dataGrab from '@/assets/cards/data-grab.webp';
import firewallEmpathy from '@/assets/cards/firewall-empathy.webp';
import firewallRecall from '@/assets/cards/firewall-recall.webp';
import firewallSmacker from '@/assets/cards/firewall-smacker.webp';
import firewallOpen from '@/assets/cards/firewall-open.webp';
import lsEnergyGrid from '@/assets/cards/ls-energy-grid.webp';
import lsAiPlatform from '@/assets/cards/ls-ai-platform.webp';
import lsNewspaper from '@/assets/cards/ls-newspaper.webp';
import lsRocketCompany from '@/assets/cards/ls-rocket-company.webp';
import lsGovernment from '@/assets/cards/ls-government.webp';
import moveTakeover from '@/assets/cards/move-takeover.webp';
import moveTantrum from '@/assets/cards/move-tantrum.webp';
import moveTheft from '@/assets/cards/move-theft.webp';
import moveBuyout from '@/assets/cards/move-buyout.webp';
import tracker1 from '@/assets/cards/tracker-1.webp';
import tracker2 from '@/assets/cards/tracker-2.webp';
import tracker3 from '@/assets/cards/tracker-3.webp';

export const cardFeatures: Omit<CardFeatureProps, 'className'>[] = [
  {
    cardTotalNumber: '8 cards',
    cardType: 'Common Data:',
    cardTitle: 'Secret Spyware',
    cardImgSrc: common1,
    cardDesc: "Don't look now, but we've got company.",
  },
  {
    cardTotalNumber: '8 cards',
    cardType: 'Common Data:',
    cardTitle: 'Hidden Pixel',
    cardImgSrc: common2,
    cardDesc: "Now you see me...actually no, you don't see me.",
  },
  {
    cardTotalNumber: '8 cards',
    cardType: 'Common Data:',
    cardTitle: 'Cafe Pirates!',
    cardImgSrc: common3,
    cardDesc: 'That "free" coffeeshop WiFi wasn\'t free.',
  },
  {
    cardTotalNumber: '8 cards',
    cardType: 'Common Data:',
    cardTitle: 'Email Trail',
    cardImgSrc: common4,
    cardDesc: 'Who knew an address made you easy to find?',
  },
  {
    cardTotalNumber: '8 cards',
    cardType: 'Common Data:',
    cardTitle: 'Cookie Crumbs',
    cardImgSrc: common5,
    cardDesc: 'This is how you get ants. (And trackers.)',
  },
  {
    cardTotalNumber: '2 cards',
    cardType: 'Tracker:',
    cardTitle: 'Cross Site Stalker',
    cardImgSrc: tracker1,
    cardDesc: 'Boosts your turn value by 1. Play again.',
  },
  {
    cardTotalNumber: '2 cards',
    cardType: 'Tracker:',
    cardTitle: 'Social Snooper',
    cardImgSrc: tracker2,
    cardDesc: 'Boosts your turn value by 2. Play again.',
  },
  {
    cardTotalNumber: '2 cards',
    cardType: 'Tracker:',
    cardTitle: 'Cursed Cursor',
    cardImgSrc: tracker3,
    cardDesc: 'Boosts your turn value by 3. Play again.',
  },
  {
    cardTotalNumber: '2 cards',
    cardType: 'Blocker:',
    cardTitle: 'Enhanced Tracking Protection',
    cardImgSrc: blocker1,
    cardDesc: 'Subtract from opponents turn value by 1. Play again.',
  },
  {
    cardTotalNumber: '2 cards',
    cardType: 'Blocker:',
    cardTitle: 'Total Cookie Protection',
    cardImgSrc: blocker2,
    cardDesc: 'Subtract from opponents turn value by 2. Play again.',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Firewall:',
    cardTitle: 'Forced Empathy',
    cardImgSrc: firewallEmpathy,
    cardDesc: 'Immediately trade decks with your opponent.',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Firewall:',
    cardTitle: 'Mandatory Recall',
    cardImgSrc: firewallRecall,
    cardDesc:
      'If you win this hand, your opponent shuffles Launch Stack cards back into their deck.',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Firewall:',
    cardTitle: 'Tracker Smacker',
    cardImgSrc: firewallSmacker,
    cardDesc: 'Block opponent Billionaire Move and Tracker effects for the remainder of this turn.',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Firewall:',
    cardTitle: 'Open What You Want',
    cardImgSrc: firewallOpen,
    cardDesc: 'On your next hand, peek at your top three cards and pick the one you want to play.',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Billionaire Move:',
    cardTitle: 'Hostile Takeover',
    cardImgSrc: moveTakeover,
    cardDesc: 'Opponent instantly goes to war against this 6, winner takes all.',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Billionaire Move:',
    cardTitle: 'Temper Tantrum',
    cardImgSrc: moveTantrum,
    cardDesc: "If you lose this hand, steal 2 cards from your opponent's win pile.",
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Billionaire Move:',
    cardTitle: 'Patent Theft',
    cardImgSrc: moveTheft,
    cardDesc: 'If you win this hand, steal 1 Launch Stack card from your opponent.',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Billionaire Move:',
    cardTitle: 'Leveraged Buyout',
    cardImgSrc: moveBuyout,
    cardDesc:
      "If you win this hand, take 2 cards from the top of your opponent's deck and add to yours.",
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Launch Stack:',
    cardTitle: 'Divert the Entire Energy Grid',
    cardImgSrc: lsEnergyGrid,
    cardDesc: 'No point value. Collect 3 Launch Stack cards to win!',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Launch Stack:',
    cardTitle: 'Launch AI Platform to Parent Your Kids',
    cardImgSrc: lsAiPlatform,
    cardDesc: 'No point value. Collect 3 Launch Stack cards to win!',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Launch Stack:',
    cardTitle: 'Buy a Newspaper and Shut it Down',
    cardImgSrc: lsNewspaper,
    cardDesc: 'No point value. Collect 3 Launch Stack cards to win!',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Launch Stack:',
    cardTitle: 'Buy a Rocket Company',
    cardImgSrc: lsRocketCompany,
    cardDesc: 'No point value. Collect 3 Launch Stack cards to win!',
  },
  {
    cardTotalNumber: '1 card',
    cardType: 'Launch Stack:',
    cardTitle: 'Set up a Shadow Government',
    cardImgSrc: lsGovernment,
    cardDesc: 'No point value. Collect 3 Launch Stack cards to win!',
  },
  {
    cardTotalNumber: '3 cards',
    cardTitle: 'Data Grab',
    cardImgSrc: dataGrab,
    cardDesc: 'Quick, tap the cards to grab as many as you can!',
  },
];
