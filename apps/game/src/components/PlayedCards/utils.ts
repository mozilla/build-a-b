/**
 * Utility functions for PlayedCards component
 */

/**
 * Calculate the render order for cards to ensure proper DOM stacking
 * Current batch cards are rendered last (top-first) for correct paint order
 */
export function calculateRenderOrder(
  totalCards: number,
  currentBatchId: number,
  cardBatchMap: Record<string, number>,
  cardIds: string[],
): number[] {
  const indices = Array.from({ length: totalCards }, (_, i) => i);
  const batchIndices = indices.filter((i) => (cardBatchMap[cardIds[i]] ?? 0) === currentBatchId);
  // Sort batch indices so top-most (highest original index) renders first
  batchIndices.sort((a, b) => b - a);
  const otherIndices = indices.filter((i) => !batchIndices.includes(i));
  return [...otherIndices, ...batchIndices];
}

/**
 * Get all indices of cards that belong to the same batch
 */
export function getBatchCardIndices(
  cards: Array<{ card: { id: string } }>,
  batchId: number,
  cardBatchMap: Record<string, number>,
): number[] {
  const indices: number[] = [];
  cards.forEach((c, i) => {
    if ((cardBatchMap[c.card.id] ?? 0) === batchId) {
      indices.push(i);
    }
  });
  return indices;
}

/**
 * Assign a settled z-index value for a landed card
 * Returns the next available z-index, capped at maxZ
 */
export function assignSettledZIndex(
  settledZMap: Record<string, number>,
  baseZ: number,
  maxZ: number,
): number {
  const existingZs = Object.values(settledZMap);
  const maxSettled = existingZs.length ? Math.max(...existingZs) : baseZ;
  let assigned = maxSettled + 1;
  if (assigned > maxZ) assigned = maxZ;
  return assigned;
}

/**
 * Generate a stable key for a card instance based on card ID and batch ID
 */
export function generateLandedKey(cardId: string, batchId: number): string {
  return `${cardId}-${batchId}`;
}

/**
 * Get rotation class for a card based on its position and ID
 */
export function getRotationClass(
  isTopCard: boolean,
  cardId: string,
  index: number,
  rotationClasses: readonly string[],
): string {
  if (isTopCard) return 'rotate-0';
  return rotationClasses[(cardId.charCodeAt(0) + index * 7) % rotationClasses.length];
}

/**
 * Calculate physical deck owner accounting for deck swap
 */
export function getPhysicalDeckOwner(
  logicalOwner: 'player' | 'cpu',
  isSwapped: boolean,
): 'player' | 'cpu' {
  if (!isSwapped) return logicalOwner;
  return logicalOwner === 'cpu' ? 'player' : 'cpu';
}
