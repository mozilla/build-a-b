/**
 * Game configuration - deck composition and rules
 */

import type { CardType } from '../types';
import CardBackImage from '../assets/cards/card-back.webp';

// Import all card images
import Common1 from '../assets/cards/common-1.webp';
import Common2 from '../assets/cards/common-2.webp';
import Common3 from '../assets/cards/common-3.webp';
import Common4 from '../assets/cards/common-4.webp';
import Common5 from '../assets/cards/common-5.webp';

import LsAiPlatform from '../assets/cards/ls-ai-platform.webp';
import LsEnergyGrid from '../assets/cards/ls-energy-grid.webp';
import LsGovernment from '../assets/cards/ls-government.webp';
import LsNewspaper from '../assets/cards/ls-newspaper.webp';
import LsRocketCompany from '../assets/cards/ls-rocket-company.webp';

import FirewallEmpathy from '../assets/cards/firewall-empathy.webp';
import FirewallOpen from '../assets/cards/firewall-open.webp';
import FirewallRecall from '../assets/cards/firewall-recall.webp';
import FirewallSmacker from '../assets/cards/firewall-smacker.webp';

import MoveBuyout from '../assets/cards/move-buyout.webp';
import MoveTakeover from '../assets/cards/move-takeover.webp';
import MoveTantrum from '../assets/cards/move-tantrum.webp';
import MoveTheft from '../assets/cards/move-theft.webp';

import Tracker1 from '../assets/cards/tracker-1.webp';
import Tracker2 from '../assets/cards/tracker-2.webp';
import Tracker3 from '../assets/cards/tracker-3.webp';

import Blocker1 from '../assets/cards/blocker-1.webp';
import Blocker2 from '../assets/cards/blocker-2.webp';

import DataGrab from '../assets/cards/data-grab.webp';

export interface GameConfig {
  cardsPerPlayer: number; // Cards each player starts with
  launchStacksToWin: number; // Launch stacks needed to win
  deckComposition: CardType[]; // Array of all card types to include
}

/**
 * Default game configuration
 * Total: 64 cards (32 per player)
 */
export const DEFAULT_GAME_CONFIG = {
  cardsPerPlayer: 32,
  launchStacksToWin: 3,
  deckComposition: [
    // Common cards (5 unique types) - 8 copies each = 40 total
    {
      typeId: 'common-1',
      name: 'Common Data: Secret Spyware',
      imageUrl: Common1,
      value: 1,
      isSpecial: false,
      count: 8,
      specialActionDescription: 'Adds 1 point to turn value.',
    },
    {
      typeId: 'common-2',
      name: 'Common Data: Hidden Pixel',
      imageUrl: Common2,
      value: 2,
      isSpecial: false,
      count: 8,
      specialActionDescription: 'Adds 2 points to turn value.',
    },
    {
      typeId: 'common-3',
      name: 'Common Data: Cafe Pirates!',
      imageUrl: Common3,
      value: 3,
      isSpecial: false,
      count: 8,
      specialActionDescription: 'Adds 3 points to turn value.',
    },
    {
      typeId: 'common-4',
      name: 'Common Data: Email Trail',
      imageUrl: Common4,
      value: 4,
      isSpecial: false,
      count: 8,
      specialActionDescription: 'Adds 4 points to turn value.',
    },
    {
      typeId: 'common-5',
      name: 'Common Data: Cookie Crumbs',
      imageUrl: Common5,
      value: 5,
      isSpecial: false,
      count: 8,
      specialActionDescription: 'Adds 5 points to turn value.',
    },

    // Launch Stack cards (5 unique) - 1 of each = 5 cards
    // Value 0 (auto-lose hand but collect stack), triggers another play
    {
      typeId: 'ls-ai-platform',
      name: 'Launch Stack: Launch AI Platform to Parent Your Kids.',
      imageUrl: LsAiPlatform,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'No point value. Collect 3 Launch Stack cards to win!',
      count: 1,
    },
    {
      typeId: 'ls-energy-grid',
      name: 'Launch Stack: Divert the Entire Energy Grid',
      imageUrl: LsEnergyGrid,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'No point value. Collect 3 Launch Stack cards to win!',
      count: 1,
    },
    {
      typeId: 'ls-government',
      name: 'Launch Stack: Set up a Shadow Government',
      imageUrl: LsGovernment,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'No point value. Collect 3 Launch Stack cards to win!',
      count: 1,
    },
    {
      typeId: 'ls-newspaper',
      name: 'Launch Stack: Buy a Newspaper and Shut it Down',
      imageUrl: LsNewspaper,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'No point value. Collect 3 Launch Stack cards to win!',
      count: 1,
    },
    {
      typeId: 'ls-rocket-company',
      name: 'Launch Stack: Buy a Rocket Company',
      imageUrl: LsRocketCompany,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'No point value. Collect 3 Launch Stack cards to win!',
      count: 1,
    },

    // Firewall cards (4 unique) - 1 of each = 4 cards
    // Value 6 (higher than common cards)
    {
      typeId: 'firewall-empathy',
      name: 'Firewall: Forced Empathy',
      imageUrl: FirewallEmpathy,
      value: 6,
      isSpecial: true,
      specialType: 'forced_empathy',
      specialActionDescription: 'Immediately trade decks with your opponent.',
      count: 1,
    },
    {
      typeId: 'firewall-open',
      name: 'Firewall: Open What You Want',
      imageUrl: FirewallOpen,
      value: 6,
      isSpecial: true,
      specialType: 'open_what_you_want',
      specialActionDescription:
        'On your next hand, peek at your top three cards and pick the one you want to play.',
      count: 1,
    },
    {
      typeId: 'firewall-recall',
      name: 'Firewall: Mandatory Recall',
      imageUrl: FirewallRecall,
      value: 6,
      isSpecial: true,
      specialType: 'mandatory_recall',
      specialActionDescription:
        'If you win this hand, your opponent shuffles Launch Stack cards back into their deck.',
      count: 1,
    },
    {
      typeId: 'firewall-smacker',
      name: 'Firewall: Tracker Smacker',
      imageUrl: FirewallSmacker,
      value: 6,
      isSpecial: true,
      specialType: 'tracker_smacker',
      specialActionDescription:
        'Block opponent Billionaire Move and Tracker effects for the remainder of this turn.',
      count: 0,
    },

    // Move cards (4 unique) - 1 of each = 4 cards
    // All value 6 (same as firewalls)
    {
      typeId: 'move-buyout',
      name: 'Billionaire Move: Leveraged Buyout',
      imageUrl: MoveBuyout,
      value: 6,
      isSpecial: true,
      specialType: 'leveraged_buyout',
      specialActionDescription:
        "If you win this hand, take 2 cards from from the top of your opponent's deck and add to yours.",
      count: 1,
    },
    {
      typeId: 'move-takeover',
      name: 'Billionaire Move: Hostile Takeover',
      imageUrl: MoveTakeover,
      value: 6,
      isSpecial: true,
      specialType: 'hostile_takeover',
      specialActionDescription: 'Opponent instantly goes to war against this 6, winner takes all.',
      count: 1,
    },
    {
      typeId: 'move-tantrum',
      name: 'Billionaire Move: Temper Tantrum',
      imageUrl: MoveTantrum,
      value: 6,
      isSpecial: true,
      specialType: 'temper_tantrum',
      specialActionDescription:
        "If you lose this hand, steal 2 cards from your opponent's win pile.",
      count: 1,
    },
    {
      typeId: 'move-theft',
      name: 'Billionaire Move: Patent Theft',
      imageUrl: MoveTheft,
      value: 6,
      isSpecial: true,
      specialType: 'patent_theft',
      specialActionDescription:
        'If you win this hand, steal 1 Launch Stack card from your opponent.',
      count: 1,
    },

    // Tracker cards (3 unique) - 2 copies each = 6 cards
    // Values: 1, 2, 3 (confirmed from CARDS.md), triggers another play
    {
      typeId: 'tracker-1',
      name: 'Tracker: Cross Site Stalker',
      imageUrl: Tracker1,
      value: 1,
      isSpecial: true,
      specialType: 'tracker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Boosts your turn value by 1.',
      count: 2,
    },
    {
      typeId: 'tracker-2',
      name: 'Tracker: Social Snooper',
      imageUrl: Tracker2,
      value: 2,
      isSpecial: true,
      specialType: 'tracker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Boosts your turn value by 2.',
      count: 2,
    },
    {
      typeId: 'tracker-3',
      name: 'Tracker: Cursed Cursor',
      imageUrl: Tracker3,
      value: 3,
      isSpecial: true,
      specialType: 'tracker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Boosts your turn value by 3.',
      count: 2,
    },

    // Blocker cards (2 unique) - 2 copies each = 4 cards
    // Value 0 (confirmed from CARDS.md), triggers another play
    {
      typeId: 'blocker-1',
      name: 'Blocker: Enhanced Tracking Protection',
      imageUrl: Blocker1,
      value: 0,
      isSpecial: true,
      specialType: 'blocker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Subtract from opponents turn value by 1.',
      count: 2,
    },
    {
      typeId: 'blocker-2',
      name: 'Blocker: Total Cookie Protection',
      imageUrl: Blocker2,
      value: 0,
      isSpecial: true,
      specialType: 'blocker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Subtract from opponents turn value by 2.',
      count: 2,
    },

    // Data Grab cards - 3 copies
    // Value 0, physical mechanic (skip for MVP or adapt for digital)
    {
      typeId: 'data-grab',
      name: 'Data Grab',
      imageUrl: DataGrab,
      value: 0,
      isSpecial: true,
      specialType: 'data_grab',
      specialActionDescription: 'Quick, tap the cards to grab as many as you can!',
      count: 2,
    },
  ],
} as const satisfies GameConfig;

/**
 * Union type of all valid card typeIds in the game
 * Extracted from the DEFAULT_GAME_CONFIG for type safety and autocomplete
 */
export type CardTypeId = (typeof DEFAULT_GAME_CONFIG.deckComposition)[number]['typeId'];

/**
 * Instant effect types that trigger immediately
 */
export const INSTANT_EFFECTS = new Set(['forced_empathy', 'tracker_smacker', 'hostile_takeover']);

/**
 * Card back image (shared across all cards)
 */
export const CARD_BACK_IMAGE = CardBackImage;
