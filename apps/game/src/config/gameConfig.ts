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
import Win from '../assets/cards/win.webp';

export interface GameConfig {
  cardsPerPlayer: number; // Cards each player starts with
  launchStacksToWin: number; // Launch stacks needed to win
  deckComposition: CardType[]; // Array of all card types to include
}

/**
 * Default game configuration
 * Total: 64 cards (32 per player)
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  cardsPerPlayer: 32,
  launchStacksToWin: 3,
  deckComposition: [
    // Common cards (5 unique types) - repeated to fill 64 total cards
    // Total: 44 common cards (to make 64 total with 20 special cards)
    {
      typeId: 'common-1',
      imageUrl: Common1,
      value: 1,
      isSpecial: false,
      count: 9,
    },
    {
      typeId: 'common-2',
      imageUrl: Common2,
      value: 2,
      isSpecial: false,
      count: 9,
    },
    {
      typeId: 'common-3',
      imageUrl: Common3,
      value: 3,
      isSpecial: false,
      count: 9,
    },
    {
      typeId: 'common-4',
      imageUrl: Common4,
      value: 4,
      isSpecial: false,
      count: 9,
    },
    {
      typeId: 'common-5',
      imageUrl: Common5,
      value: 5,
      isSpecial: false,
      count: 8,
    },

    // Launch Stack cards (5 unique) - 1 of each = 5 cards
    // Value 0 means they don't participate in comparison (auto-lose hand but collect stack)
    {
      typeId: 'ls-ai-platform',
      imageUrl: LsAiPlatform,
      value: 3,
      isSpecial: true,
      specialType: 'launch_stack',
      count: 1,
    },
    {
      typeId: 'ls-energy-grid',
      imageUrl: LsEnergyGrid,
      value: 3,
      isSpecial: true,
      specialType: 'launch_stack',
      count: 1,
    },
    {
      typeId: 'ls-government',
      imageUrl: LsGovernment,
      value: 3,
      isSpecial: true,
      specialType: 'launch_stack',
      count: 1,
    },
    {
      typeId: 'ls-newspaper',
      imageUrl: LsNewspaper,
      value: 3,
      isSpecial: true,
      specialType: 'launch_stack',
      count: 1,
    },
    {
      typeId: 'ls-rocket-company',
      imageUrl: LsRocketCompany,
      value: 3,
      isSpecial: true,
      specialType: 'launch_stack',
      count: 1,
    },

    // Firewall cards (4 unique) - 1 of each = 4 cards
    // Value 6 (higher than common cards)
    {
      typeId: 'firewall-empathy',
      imageUrl: FirewallEmpathy,
      value: 6,
      isSpecial: true,
      specialType: 'forced_empathy',
      count: 1,
    },
    {
      typeId: 'firewall-open',
      imageUrl: FirewallOpen,
      value: 6,
      isSpecial: true,
      specialType: 'open_what_you_want',
      count: 1,
    },
    {
      typeId: 'firewall-recall',
      imageUrl: FirewallRecall,
      value: 6,
      isSpecial: true,
      specialType: 'mandatory_recall',
      count: 1,
    },
    {
      typeId: 'firewall-smacker',
      imageUrl: FirewallSmacker,
      value: 6,
      isSpecial: true,
      specialType: 'tracker_smacker',
      count: 1,
    },

    // Move cards (4 unique) - 1 of each = 4 cards
    // Value 6 (same as firewalls)
    {
      typeId: 'move-buyout',
      imageUrl: MoveBuyout,
      value: 6,
      isSpecial: true,
      specialType: 'leveraged_buyout',
      count: 1,
    },
    {
      typeId: 'move-takeover',
      imageUrl: MoveTakeover,
      value: 6,
      isSpecial: true,
      specialType: 'hostile_takeover',
      count: 1,
    },
    {
      typeId: 'move-tantrum',
      imageUrl: MoveTantrum,
      value: 2,
      isSpecial: true,
      specialType: 'temper_tantrum',
      count: 1,
    },
    {
      typeId: 'move-theft',
      imageUrl: MoveTheft,
      value: 3,
      isSpecial: true,
      specialType: 'patent_theft',
      count: 1,
    },

    // Tracker cards (3 unique) - 1 of each = 3 cards
    // Values: 2, 3, 4 (MVP assumption)
    {
      typeId: 'tracker-1',
      imageUrl: Tracker1,
      value: 2,
      isSpecial: true,
      specialType: 'tracker',
      count: 1,
    },
    {
      typeId: 'tracker-2',
      imageUrl: Tracker2,
      value: 3,
      isSpecial: true,
      specialType: 'tracker',
      count: 1,
    },
    {
      typeId: 'tracker-3',
      imageUrl: Tracker3,
      value: 4,
      isSpecial: true,
      specialType: 'tracker',
      count: 1,
    },

    // Blocker cards (2 unique) - 1 of each = 2 cards
    // Values: 2, 3 (MVP assumption)
    {
      typeId: 'blocker-1',
      imageUrl: Blocker1,
      value: 2,
      isSpecial: true,
      specialType: 'blocker',
      count: 1,
    },
    {
      typeId: 'blocker-2',
      imageUrl: Blocker2,
      value: 3,
      isSpecial: true,
      specialType: 'blocker',
      count: 1,
    },

    // Other special cards (2 unique) - 1 of each = 2 cards
    // Data Grab: Skipped until we have clear definition (placeholder with value 4)
    // Win card: Victory screen card, not playable (placeholder with value 5)
    {
      typeId: 'data-grab',
      imageUrl: DataGrab,
      value: 4,
      isSpecial: false, // Not implementing special effect for now
      count: 1,
    },
    {
      typeId: 'win',
      imageUrl: Win,
      value: 5,
      isSpecial: false, // Victory card, not playable
      count: 1,
    },
  ],
};

/**
 * Instant effect types that trigger immediately
 */
export const INSTANT_EFFECTS = new Set([
  'forced_empathy',
  'tracker_smacker',
  'hostile_takeover',
]);

/**
 * Card back image (shared across all cards)
 */
export const CARD_BACK_IMAGE = CardBackImage;
