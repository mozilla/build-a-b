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
 * Total: 66 cards (33 per player)
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  cardsPerPlayer: 33,
  launchStacksToWin: 3,
  deckComposition: [
    // Common cards (5 unique types) - 8 copies each = 40 total
    {
      typeId: 'common-1',
      imageUrl: Common1,
      value: 1,
      isSpecial: false,
      count: 8,
    },
    {
      typeId: 'common-2',
      imageUrl: Common2,
      value: 2,
      isSpecial: false,
      count: 8,
    },
    {
      typeId: 'common-3',
      imageUrl: Common3,
      value: 3,
      isSpecial: false,
      count: 8,
    },
    {
      typeId: 'common-4',
      imageUrl: Common4,
      value: 4,
      isSpecial: false,
      count: 8,
    },
    {
      typeId: 'common-5',
      imageUrl: Common5,
      value: 5,
      isSpecial: false,
      count: 8,
    },

    // Launch Stack cards (5 unique) - 1 of each = 5 cards
    // Value 0 (auto-lose hand but collect stack), triggers another play
    {
      typeId: 'ls-ai-platform',
      imageUrl: LsAiPlatform,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'Collect 3 and you win the game.',
      count: 1,
    },
    {
      typeId: 'ls-energy-grid',
      imageUrl: LsEnergyGrid,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'Collect 3 and you win the game.',
      count: 1,
    },
    {
      typeId: 'ls-government',
      imageUrl: LsGovernment,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'Collect 3 and you win the game.',
      count: 1,
    },
    {
      typeId: 'ls-newspaper',
      imageUrl: LsNewspaper,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'Collect 3 and you win the game.',
      count: 1,
    },
    {
      typeId: 'ls-rocket-company',
      imageUrl: LsRocketCompany,
      value: 0,
      isSpecial: true,
      specialType: 'launch_stack',
      triggersAnotherPlay: true,
      specialActionDescription: 'Collect 3 and you win the game.',
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
      specialActionDescription:
        'All players immediately pass their decks one position to the right (instant).',
      count: 1,
    },
    {
      typeId: 'firewall-open',
      imageUrl: FirewallOpen,
      value: 6,
      isSpecial: true,
      specialType: 'open_what_you_want',
      specialActionDescription:
        'On your next play, look at the top 3 cards of your deck and arrange them in any order (exclude face-down War cards).',
      count: 1,
    },
    {
      typeId: 'firewall-recall',
      imageUrl: FirewallRecall,
      value: 6,
      isSpecial: true,
      specialType: 'mandatory_recall',
      specialActionDescription:
        'If you win this hand, all opponents shuffle Launch Stacks back into their decks.',
      count: 1,
    },
    {
      typeId: 'firewall-smacker',
      imageUrl: FirewallSmacker,
      value: 6,
      isSpecial: true,
      specialType: 'tracker_smacker',
      specialActionDescription:
        'Negate all opponent Tracker and Billionaire Move effects for the remainder of this turn (instant).',
      count: 1,
    },

    // Move cards (4 unique) - 1 of each = 4 cards
    // All value 6 (same as firewalls)
    {
      typeId: 'move-buyout',
      imageUrl: MoveBuyout,
      value: 6,
      isSpecial: true,
      specialType: 'leveraged_buyout',
      specialActionDescription:
        'If you win this hand, take 2 cards from the top of all opponent decks and add them to yours.',
      count: 1,
    },
    {
      typeId: 'move-takeover',
      imageUrl: MoveTakeover,
      value: 6,
      isSpecial: true,
      specialType: 'hostile_takeover',
      specialActionDescription:
        'All opponents instantly go to WAR against this 6; winner takes all. Ignores Trackers, Blockers, and ties on original play.',
      count: 1,
    },
    {
      typeId: 'move-tantrum',
      imageUrl: MoveTantrum,
      value: 6,
      isSpecial: true,
      specialType: 'temper_tantrum',
      specialActionDescription:
        "If you lose this hand, steal 2 cards from the winner's win pile before they collect them.",
      count: 1,
    },
    {
      typeId: 'move-theft',
      imageUrl: MoveTheft,
      value: 6,
      isSpecial: true,
      specialType: 'patent_theft',
      specialActionDescription:
        'If you win this hand, steal 1 Launch Stack card from any opponent.',
      count: 1,
    },

    // Tracker cards (3 unique) - 2 copies each = 6 cards
    // Values: 1, 2, 3 (confirmed from CARDS.md), triggers another play
    {
      typeId: 'tracker-1',
      imageUrl: Tracker1,
      value: 1,
      isSpecial: true,
      specialType: 'tracker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Add 1 point to the value of your play.',
      count: 2,
    },
    {
      typeId: 'tracker-2',
      imageUrl: Tracker2,
      value: 2,
      isSpecial: true,
      specialType: 'tracker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Add 2 points to the value of your play.',
      count: 2,
    },
    {
      typeId: 'tracker-3',
      imageUrl: Tracker3,
      value: 3,
      isSpecial: true,
      specialType: 'tracker',
      triggersAnotherPlay: true,
      specialActionDescription: 'Add 3 points to the value of your play.',
      count: 2,
    },

    // Blocker cards (2 unique) - 2 copies each = 4 cards
    // Value 0 (confirmed from CARDS.md), triggers another play
    {
      typeId: 'blocker-1',
      imageUrl: Blocker1,
      value: 0,
      isSpecial: true,
      specialType: 'blocker',
      triggersAnotherPlay: true,
      specialActionDescription:
        'Subtract 1 point from the value of all opponent plays (this card has no value).',
      count: 2,
    },
    {
      typeId: 'blocker-2',
      imageUrl: Blocker2,
      value: 0,
      isSpecial: true,
      specialType: 'blocker',
      triggersAnotherPlay: true,
      specialActionDescription:
        'Subtract 2 points from the value of all opponent plays (this card has no value).',
      count: 2,
    },

    // Data Grab cards - 3 copies
    // Value 0, physical mechanic (skip for MVP or adapt for digital)
    {
      typeId: 'data-grab',
      imageUrl: DataGrab,
      value: 0,
      isSpecial: true,
      specialType: 'data_grab',
      specialActionDescription:
        'Everyone grabs as many cards from the play area as possible.',
      count: 3,
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
