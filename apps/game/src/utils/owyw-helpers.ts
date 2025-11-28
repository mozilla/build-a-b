/**
 * OWYW (Open What You Want) Helper Functions
 * Centralized logic for detecting and handling OWYW card effects
 */

import type { PlayerType } from '@/types/game';

interface PlayerState {
  playedCardsInHand: Array<{ card: { specialType?: string }; isFaceDown: boolean }>;
  playedCard?: { specialType?: string } | null;
}

interface GameState {
  openWhatYouWantActive: PlayerType | null;
  player: PlayerState;
  cpu: PlayerState;
  hostileTakeoverDataWar: boolean;
}

interface OWYWDetectionResult {
  hasOWYW: boolean;
  owyWPlayer: PlayerType | null;
  isFromPreviousTurn: boolean;
}

/**
 * Detects if OWYW should be triggered during DataWar face-up phase
 * Returns which player has OWYW and whether it's already been used
 */
export function detectDataWarOWYW(state: GameState): OWYWDetectionResult {
  const { openWhatYouWantActive, player, cpu, hostileTakeoverDataWar } = state;

  // Determine who plays face-up cards in DataWar
  const playerHasHT = player.playedCard?.specialType === 'hostile_takeover';
  const cpuHasHT = cpu.playedCard?.specialType === 'hostile_takeover';

  const playerPlaysFaceUp = !(playerHasHT && hostileTakeoverDataWar);
  const cpuPlaysFaceUp = !(cpuHasHT && hostileTakeoverDataWar);

  // Check if OWYW is already active (from previous turn)
  const hasActivePlayerOWYW = openWhatYouWantActive === 'player' && playerPlaysFaceUp;
  const hasActiveCpuOWYW = openWhatYouWantActive === 'cpu' && cpuPlaysFaceUp;

  if (hasActivePlayerOWYW) {
    return { hasOWYW: true, owyWPlayer: 'player', isFromPreviousTurn: true };
  }
  if (hasActiveCpuOWYW) {
    return { hasOWYW: true, owyWPlayer: 'cpu', isFromPreviousTurn: true };
  }

  // Check who played OWYW this turn (in playedCardsInHand)
  // Only consider OWYW as "active" if it's the LAST face-up card (not used yet)
  const currentPlayerFaceUpCards = player.playedCardsInHand.filter((c) => !c.isFaceDown);
  const currentCpuFaceUpCards = cpu.playedCardsInHand.filter((c) => !c.isFaceDown);

  const playerOwywIndex = currentPlayerFaceUpCards.findIndex(
    (c) => c.card.specialType === 'open_what_you_want',
  );
  const cpuOwywIndex = currentCpuFaceUpCards.findIndex(
    (c) => c.card.specialType === 'open_what_you_want',
  );

  // Check if OWYW is the LAST face-up card (meaning not used yet)
  const playerPlayedOWYW =
    playerOwywIndex !== -1 && playerOwywIndex === currentPlayerFaceUpCards.length - 1;
  const cpuPlayedOWYW =
    cpuOwywIndex !== -1 && cpuOwywIndex === currentCpuFaceUpCards.length - 1;

  if (playerPlayedOWYW && playerPlaysFaceUp) {
    return { hasOWYW: true, owyWPlayer: 'player', isFromPreviousTurn: false };
  }
  if (cpuPlayedOWYW && cpuPlaysFaceUp) {
    return { hasOWYW: true, owyWPlayer: 'cpu', isFromPreviousTurn: false };
  }

  return { hasOWYW: false, owyWPlayer: null, isFromPreviousTurn: false };
}
