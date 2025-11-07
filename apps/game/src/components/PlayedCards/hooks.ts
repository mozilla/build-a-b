import { useLayoutEffect, useRef, useState } from 'react';
import { getPhysicalDeckOwner } from './utils';

interface Offset {
  x: number;
  y: number;
}

/**
 * Custom hook to measure deck and play area positions for accurate animations
 * Handles deck swap logic and responsive updates
 */
export function useDeckMeasurements(
  owner: 'player' | 'cpu',
  isSwapped: boolean,
  cardsLength: number,
  winner: 'player' | 'cpu' | null,
) {
  const playAreaRef = useRef<HTMLDivElement>(null);
  const [deckOffset, setDeckOffset] = useState<Offset | null>(null);
  const [collectionOffset, setCollectionOffset] = useState<Offset>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!playAreaRef.current) return;

    const measure = () => {
      const playAreaRect = playAreaRef.current!.getBoundingClientRect();

      // Measure deck corresponding to this PlayedCards owner
      // IMPORTANT: After deck swap (isSwapped), physical deck positions are reversed
      const physicalDeckOwner = getPhysicalDeckOwner(owner, isSwapped);
      const deckSelector = `[data-measure-target="${physicalDeckOwner}"]`;
      const deckEl = document.querySelector(deckSelector) as HTMLElement | null;

      if (deckEl) {
        const d = deckEl.getBoundingClientRect();
        setDeckOffset({
          x: d.left + d.width / 2 - (playAreaRect.left + playAreaRect.width / 2),
          y: d.top + d.height / 2 - (playAreaRect.top + playAreaRect.height / 2),
        });
      }

      // Measure the winning deck (if any)
      if (winner) {
        const winningDeckOwner = getPhysicalDeckOwner(winner, isSwapped);
        const winningDeckEl = document.querySelector(
          `[data-measure-target="${winningDeckOwner}"]`,
        ) as HTMLElement | null;

        if (winningDeckEl) {
          const w = winningDeckEl.getBoundingClientRect();
          setCollectionOffset({
            x: w.left + w.width / 2 - (playAreaRect.left + playAreaRect.width / 2),
            y: w.top + w.height / 2 - (playAreaRect.top + playAreaRect.height / 2),
          });
        }
      }
    };

    measure();

    const onResize = () => requestAnimationFrame(measure);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [owner, isSwapped, cardsLength, winner]);

  return { playAreaRef, deckOffset, collectionOffset };
}

/**
 * Custom hook to track card batches and landing state
 * Manages batch IDs, landed cards, and cleanup on round end
 */
export function useBatchTracking(cards: Array<{ card: { id: string } }>) {
  const prevCardCountRef = useRef(cards.length);
  const batchIdRef = useRef(0);
  const cardBatchMapRef = useRef<Record<string, number>>({});
  const elementRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const settledZRef = useRef<Record<string, number>>({});
  const [landedMap, setLandedMap] = useState<Record<string, boolean>>({});

  useLayoutEffect(() => {
    // Detect any cards that don't yet have a batch assigned and assign them a new batch id
    const unassigned = cards.filter((c) => !(c.card.id in cardBatchMapRef.current));
    if (unassigned.length > 0) {
      batchIdRef.current += 1;
      const newBatchId = batchIdRef.current;
      for (const c of unassigned) {
        cardBatchMapRef.current[c.card.id] = newBatchId;
      }
    }

    // If the card array shrank, a round ended — reset all tracking state
    if (cards.length < prevCardCountRef.current) {
      setLandedMap({});
      cardBatchMapRef.current = {};
      settledZRef.current = {};
    }

    prevCardCountRef.current = cards.length;
  }, [cards]);

  return {
    batchIdRef,
    cardBatchMapRef,
    elementRefs,
    settledZRef,
    landedMap,
    setLandedMap,
  };
}
