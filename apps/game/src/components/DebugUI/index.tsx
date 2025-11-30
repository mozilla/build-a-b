/**
 * Debug UI Component - For testing card scenarios
 * Allows manual card selection for player and CPU decks
 * Toggle with arrow keys: ↑ ↑ ↓ ↓ (keyboard) or swipe: ↑ ↑ ↓ ↓ (mobile)
 */

import { Button } from '@/components/Button';
import Text from '@/components/Text';
import { BILLIONAIRES, type BillionaireId } from '@/config/billionaires';
import { DEFAULT_GAME_CONFIG, type CardTypeId } from '@/config/game-config';
import { DATA_GRAB_CONFIG } from '@/config/data-grab-config';
import { GameMachineContext } from '@/providers/GameProvider';
import { useGameStore } from '@/store/game-store';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DeckDebugPanel } from '../DeckDebugPanel';
import { EventLogPanel } from '../EventLogPanel';

interface CardOption {
  typeId: CardTypeId;
  name: string;
  value: number;
  specialType?: string;
}

// Simple SVG Icons
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export function DebugUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playerCards, setPlayerCards] = useState<CardTypeId[]>([]);
  const [cpuCards, setCpuCards] = useState<CardTypeId[]>([]);
  const [winnerSelection, setWinnerSelection] = useState<'player' | 'cpu'>('player');
  const [winnerBillionaire, setWinnerBillionaire] = useState<BillionaireId>('chaz');
  const [showDeckDebug, setShowDeckDebug] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeckBuilderMinimized, setIsDeckBuilderMinimized] = useState(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Data Grab animation config state
  const [fallDuration, setFallDuration] = useState<number>(DATA_GRAB_CONFIG.CARD_FALL_DURATION_MS);
  const [speedVariation, setSpeedVariation] = useState<number>(DATA_GRAB_CONFIG.CARD_SPEED_VARIATION_PERCENT);
  const [initialDelay, setInitialDelay] = useState<number>(DATA_GRAB_CONFIG.INITIAL_CARD_DELAY_MS);
  const [delayMin, setDelayMin] = useState<number>(DATA_GRAB_CONFIG.CARD_DELAY_INCREMENT_MIN_MS);
  const [delayMax, setDelayMax] = useState<number>(DATA_GRAB_CONFIG.CARD_DELAY_INCREMENT_MAX_MS);
  
  const keySequenceRef = useRef('');
  const actorRef = GameMachineContext.useActorRef();
  const initializeGame = useGameStore((state) => state.initializeGame);
  const showDataGrabCookies = useGameStore((state) => state.showDataGrabCookies);
  const setShowDataGrabCookies = useGameStore((state) => state.setShowDataGrabCookies);
  const gameSpeedMultiplier = useGameStore((state) => state.gameSpeedMultiplier);
  const setGameSpeedMultiplier = useGameStore((state) => state.setGameSpeedMultiplier);

  // Card options from config
  const cardOptions: CardOption[] = DEFAULT_GAME_CONFIG.deckComposition.map((card) => ({
    typeId: card.typeId,
    name: card.name,
    value: card.value,
    specialType: 'specialType' in card ? card.specialType : undefined,
  }));

  // Toggle debug UI with arrow key sequence (up, up, down, down)
  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout>;
    const targetSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only track arrow keys
      if (e.key.startsWith('Arrow')) {
        const prev = keySequenceRef.current;
        const newSequence = prev + e.key + ',';

        // Check if sequence matches the target
        const currentKeys = newSequence.split(',').filter((k) => k);
        const isMatch = targetSequence.every((key, index) => currentKeys[index] === key);

        if (isMatch && currentKeys.length === targetSequence.length) {
          setIsOpen((prev) => !prev);
          keySequenceRef.current = ''; // Reset after trigger
        } else {
          keySequenceRef.current = newSequence;
        }

        // Reset sequence after 3 seconds of inactivity
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          keySequenceRef.current = '';
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(resetTimer);
    };
  }, []); // Empty dependency array - only set up once

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Toggle debug UI with touch swipe sequence (up, up, down, down) for mobile
  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout>;
    const targetSwipeSequence = ['SwipeUp', 'SwipeUp', 'SwipeDown', 'SwipeDown'];
    let touchStartY = 0;
    let touchStartTime = 0;
    const swipeThreshold = 50; // Minimum distance in pixels to register as swipe
    const swipeTimeThreshold = 300; // Maximum time in ms for a swipe gesture

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaTime = touchEndTime - touchStartTime;

      // Only register quick, definitive swipes
      if (Math.abs(deltaY) > swipeThreshold && deltaTime < swipeTimeThreshold) {
        const swipeDirection = deltaY > 0 ? 'SwipeUp' : 'SwipeDown';
        const prev = keySequenceRef.current;
        const newSequence = prev + swipeDirection + ',';

        // Check if sequence matches the target
        const currentSwipes = newSequence.split(',').filter((k) => k);
        const isMatch = targetSwipeSequence.every(
          (swipe, index) => currentSwipes[index] === swipe
        );

        if (isMatch && currentSwipes.length === targetSwipeSequence.length) {
          setIsOpen((prev) => !prev);
          keySequenceRef.current = ''; // Reset after trigger
        } else {
          keySequenceRef.current = newSequence;
        }

        // Reset sequence after 3 seconds of inactivity
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          keySequenceRef.current = '';
        }, 3000);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(resetTimer);
    };
  }, []);

  const handleAddPlayerCard = (typeId: CardTypeId) => {
    setPlayerCards((prev) => [...prev, typeId]);
  };

  const handleAddCpuCard = (typeId: CardTypeId) => {
    setCpuCards((prev) => [...prev, typeId]);
  };

  const handleRemovePlayerCard = (index: number) => {
    setPlayerCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCpuCard = (index: number) => {
    setCpuCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPlayer = () => {
    setPlayerCards([]);
  };

  const handleClearCpu = () => {
    setCpuCards([]);
  };

  const handleApply = () => {
    // If no cards selected, use random
    if (playerCards.length === 0 && cpuCards.length === 0) {
      initializeGame('random', 'random');
    } else {
      // Use custom strategy with selected cards
      const playerStrategy = playerCards.length > 0 ? 'custom' : 'random';
      const cpuStrategy = cpuCards.length > 0 ? 'custom' : 'random';
      initializeGame(
        playerStrategy,
        cpuStrategy,
        playerCards.length > 0 ? playerCards : undefined,
        cpuCards.length > 0 ? cpuCards : undefined,
      );
    }
    setIsMinimized(true);
  };

  const handleInstantWin = () => {
    const store = useGameStore.getState();

    // Set the winner and winCondition in the store
    store.winner = winnerSelection;
    store.winCondition = 'all_cards';

    // Set the appropriate billionaire based on winner
    if (winnerSelection === 'player') {
      store.selectedBillionaire = winnerBillionaire;
    } else {
      store.cpuBillionaire = winnerBillionaire;
    }

    // Trigger the game_over phase transition
    actorRef.send({ type: 'WIN' });
  };

  const handleApplyDataGrabConfig = () => {
    // Apply the config changes by directly mutating the config object
    // @ts-expect-error - Mutating const config for debug purposes
    DATA_GRAB_CONFIG.CARD_FALL_DURATION_MS = fallDuration;
    // @ts-expect-error - Mutating const config for debug purposes
    DATA_GRAB_CONFIG.CARD_SPEED_VARIATION_PERCENT = speedVariation;
    // @ts-expect-error - Mutating const config for debug purposes
    DATA_GRAB_CONFIG.INITIAL_CARD_DELAY_MS = initialDelay;
    // @ts-expect-error - Mutating const config for debug purposes
    DATA_GRAB_CONFIG.CARD_DELAY_INCREMENT_MIN_MS = delayMin;
    // @ts-expect-error - Mutating const config for debug purposes
    DATA_GRAB_CONFIG.CARD_DELAY_INCREMENT_MAX_MS = delayMax;
  };

  const handleResetDataGrabConfig = () => {
    setFallDuration(3000);
    setSpeedVariation(20);
    setInitialDelay(500);
    setDelayMin(250);
    setDelayMax(750);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    // Clear any existing timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    // Auto-hide after 10 seconds
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 10000);
  };

  const handleTriggerDataGrab = () => {
    const store = useGameStore.getState();
    const { player, cpu } = store;

    // Find all data grab cards in both decks
    const playerDataGrabIndices: number[] = [];
    const cpuDataGrabIndices: number[] = [];

    player.deck.forEach((card, index) => {
      if (card.specialType === 'data_grab') {
        playerDataGrabIndices.push(index);
      }
    });

    cpu.deck.forEach((card, index) => {
      if (card.specialType === 'data_grab') {
        cpuDataGrabIndices.push(index);
      }
    });

    // Determine which deck has more data grab cards
    let targetDeck: 'player' | 'cpu';
    let targetIndices: number[];

    if (playerDataGrabIndices.length > cpuDataGrabIndices.length) {
      targetDeck = 'player';
      targetIndices = playerDataGrabIndices;
    } else if (cpuDataGrabIndices.length > playerDataGrabIndices.length) {
      targetDeck = 'cpu';
      targetIndices = cpuDataGrabIndices;
    } else {
      // Tie - use player deck
      targetDeck = 'player';
      targetIndices = playerDataGrabIndices;
    }

    if (targetIndices.length === 0) {
      showToast('❌ No Data Grab cards found in decks!');
      return;
    }

    // Find the data grab card closest to the top (smallest index)
    const closestIndex = Math.min(...targetIndices);

    // Move that card to the top of the deck
    const deck = targetDeck === 'player' ? [...player.deck] : [...cpu.deck];
    const [dataGrabCard] = deck.splice(closestIndex, 1);
    deck.unshift(dataGrabCard); // Add to beginning

    // Update the store
    if (targetDeck === 'player') {
      useGameStore.setState({
        player: {
          ...player,
          deck,
        },
      });
    } else {
      useGameStore.setState({
        cpu: {
          ...cpu,
          deck,
        },
      });
    }

    showToast(`✅ Moved Data Grab card from position ${closestIndex + 1} to top of ${targetDeck} deck!`);
  };

  const handleTriggerLaunchStack = () => {
    const store = useGameStore.getState();
    const { player, cpu } = store;

    // Find all launch stack cards in both decks
    const playerLaunchStackIndices: number[] = [];
    const cpuLaunchStackIndices: number[] = [];

    player.deck.forEach((card, index) => {
      if (card.specialType === 'launch_stack') {
        playerLaunchStackIndices.push(index);
      }
    });

    cpu.deck.forEach((card, index) => {
      if (card.specialType === 'launch_stack') {
        cpuLaunchStackIndices.push(index);
      }
    });

    // Determine which deck has more launch stack cards
    let targetDeck: 'player' | 'cpu';
    let targetIndices: number[];

    if (playerLaunchStackIndices.length > cpuLaunchStackIndices.length) {
      targetDeck = 'player';
      targetIndices = playerLaunchStackIndices;
    } else if (cpuLaunchStackIndices.length > playerLaunchStackIndices.length) {
      targetDeck = 'cpu';
      targetIndices = cpuLaunchStackIndices;
    } else {
      // Tie - use player deck
      targetDeck = 'player';
      targetIndices = playerLaunchStackIndices;
    }

    if (targetIndices.length === 0) {
      showToast('❌ No Launch Stack cards found in decks!');
      return;
    }

    // Find the launch stack card closest to the top (smallest index)
    const closestIndex = Math.min(...targetIndices);

    // Move that card to the top of the deck
    const deck = targetDeck === 'player' ? [...player.deck] : [...cpu.deck];
    const [launchStackCard] = deck.splice(closestIndex, 1);
    deck.unshift(launchStackCard); // Add to beginning

    // Update the store
    if (targetDeck === 'player') {
      useGameStore.setState({
        player: {
          ...player,
          deck,
        },
      });
    } else {
      useGameStore.setState({
        cpu: {
          ...cpu,
          deck,
        },
      });
    }

    showToast(`✅ Moved Launch Stack card from position ${closestIndex + 1} to top of ${targetDeck} deck!`);
  };

  const handleTriggerForcedEmpathy = () => {
    const store = useGameStore.getState();
    const { player, cpu } = store;

    // Check if Forced Empathy is already on the table (played)
    const isForcedEmpathyPlayed = 
      player.playedCardsInHand.some((pcs) => pcs.card.specialType === 'forced_empathy') ||
      cpu.playedCardsInHand.some((pcs) => pcs.card.specialType === 'forced_empathy');

    if (isForcedEmpathyPlayed) {
      showToast('⚠️ Forced Empathy is already on the table!');
      return;
    }

    // Find Forced Empathy in player deck
    const playerForcedEmpathyIndex = player.deck.findIndex(
      (card) => card.specialType === 'forced_empathy'
    );

    // Find Forced Empathy in CPU deck
    const cpuForcedEmpathyIndex = cpu.deck.findIndex(
      (card) => card.specialType === 'forced_empathy'
    );

    if (playerForcedEmpathyIndex === -1 && cpuForcedEmpathyIndex === -1) {
      showToast('❌ Forced Empathy card not found in any deck!');
      return;
    }

    // Move card to top of the deck it's in
    if (playerForcedEmpathyIndex !== -1) {
      const deck = [...player.deck];
      const [forcedEmpathyCard] = deck.splice(playerForcedEmpathyIndex, 1);
      deck.unshift(forcedEmpathyCard); // Add to beginning

      useGameStore.setState({
        player: {
          ...player,
          deck,
        },
      });

      showToast(`✅ Moved Forced Empathy from position ${playerForcedEmpathyIndex + 1} to top of player deck!`);
    } else if (cpuForcedEmpathyIndex !== -1) {
      const deck = [...cpu.deck];
      const [forcedEmpathyCard] = deck.splice(cpuForcedEmpathyIndex, 1);
      deck.unshift(forcedEmpathyCard); // Add to beginning

      useGameStore.setState({
        cpu: {
          ...cpu,
          deck,
        },
      });

      showToast(`✅ Moved Forced Empathy from position ${cpuForcedEmpathyIndex + 1} to top of CPU deck!`);
    }
  };

  const handleTriggerTemperTantrum = () => {
    const store = useGameStore.getState();
    const { player, cpu } = store;

    // Check if Temper Tantrum is already on the table (played)
    const isTemperTantrumPlayed = 
      player.playedCardsInHand.some((pcs) => pcs.card.specialType === 'temper_tantrum') ||
      cpu.playedCardsInHand.some((pcs) => pcs.card.specialType === 'temper_tantrum');

    if (isTemperTantrumPlayed) {
      showToast('⚠️ Temper Tantrum is already on the table!');
      return;
    }

    // Find Temper Tantrum in player deck
    const playerTemperTantrumIndex = player.deck.findIndex(
      (card) => card.specialType === 'temper_tantrum'
    );

    // Find Temper Tantrum in CPU deck
    const cpuTemperTantrumIndex = cpu.deck.findIndex(
      (card) => card.specialType === 'temper_tantrum'
    );

    if (playerTemperTantrumIndex === -1 && cpuTemperTantrumIndex === -1) {
      showToast('❌ Temper Tantrum card not found in any deck!');
      return;
    }

    // Move card to top of the deck it's in
    if (playerTemperTantrumIndex !== -1) {
      const deck = [...player.deck];
      const [temperTantrumCard] = deck.splice(playerTemperTantrumIndex, 1);
      deck.unshift(temperTantrumCard); // Add to beginning

      useGameStore.setState({
        player: {
          ...player,
          deck,
        },
      });

      showToast(`✅ Moved Temper Tantrum from position ${playerTemperTantrumIndex + 1} to top of player deck!`);
    } else if (cpuTemperTantrumIndex !== -1) {
      const deck = [...cpu.deck];
      const [temperTantrumCard] = deck.splice(cpuTemperTantrumIndex, 1);
      deck.unshift(temperTantrumCard); // Add to beginning

      useGameStore.setState({
        cpu: {
          ...cpu,
          deck,
        },
      });

      showToast(`✅ Moved Temper Tantrum from position ${cpuTemperTantrumIndex + 1} to top of CPU deck!`);
    }
  };

  const handleTriggerHostileTakeover = () => {
    const store = useGameStore.getState();
    const { player, cpu } = store;

    // Check if Hostile Takeover is already on the table (played)
    const isHostileTakeoverPlayed = 
      player.playedCardsInHand.some((pcs) => pcs.card.specialType === 'hostile_takeover') ||
      cpu.playedCardsInHand.some((pcs) => pcs.card.specialType === 'hostile_takeover');

    if (isHostileTakeoverPlayed) {
      showToast('⚠️ Hostile Takeover is already on the table!');
      return;
    }

    // Find Hostile Takeover in player deck
    const playerHostileTakeoverIndex = player.deck.findIndex(
      (card) => card.specialType === 'hostile_takeover'
    );

    // Find Hostile Takeover in CPU deck
    const cpuHostileTakeoverIndex = cpu.deck.findIndex(
      (card) => card.specialType === 'hostile_takeover'
    );

    if (playerHostileTakeoverIndex === -1 && cpuHostileTakeoverIndex === -1) {
      showToast('❌ Hostile Takeover card not found in any deck!');
      return;
    }

    // Move card to top of the deck it's in
    if (playerHostileTakeoverIndex !== -1) {
      const deck = [...player.deck];
      const [hostileTakeoverCard] = deck.splice(playerHostileTakeoverIndex, 1);
      deck.unshift(hostileTakeoverCard); // Add to beginning

      useGameStore.setState({
        player: {
          ...player,
          deck,
        },
      });

      showToast(`✅ Moved Hostile Takeover from position ${playerHostileTakeoverIndex + 1} to top of player deck!`);
    } else if (cpuHostileTakeoverIndex !== -1) {
      const deck = [...cpu.deck];
      const [hostileTakeoverCard] = deck.splice(cpuHostileTakeoverIndex, 1);
      deck.unshift(hostileTakeoverCard); // Add to beginning

      useGameStore.setState({
        cpu: {
          ...cpu,
          deck,
        },
      });

      showToast(`✅ Moved Hostile Takeover from position ${cpuHostileTakeoverIndex + 1} to top of CPU deck!`);
    }
  };

  const debugUI = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed top-4 right-4 z-[var(--z-debug-panel)] bg-gray-900 text-white rounded-lg shadow-2xl backdrop-blur-sm border-2 border-purple-500"
          style={{ width: isMinimized ? '200px' : '600px', maxWidth: '95vw' }}
        >
          {/* Header */}
          <div className="bg-purple-500/20 border-b-2 border-purple-500 px-4 py-2 flex items-center justify-between cursor-move shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-purple-300">Debug Panel</h2>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-purple-700 rounded p-1 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '▼' : '▲'}
            </button>
          </div>

          {/* Content - Scrollable */}
          {!isMinimized && (
            <div className="p-4 max-h-[80vh] overflow-y-auto space-y-4">
                {/* Gameplay Options */}
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-3">
                  <p className="font-semibold text-cyan-300">⚙️ Gameplay Options:</p>

                  {/* Game Speed Control */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Game Speed: {gameSpeedMultiplier.toFixed(1)}x
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={gameSpeedMultiplier}
                        onChange={(e) => setGameSpeedMultiplier(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <button
                        onClick={() => setGameSpeedMultiplier(1)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
                        title="Reset to normal speed"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0.1x (Slowest)</span>
                      <span>0.5x</span>
                      <span>1.0x (Normal)</span>
                    </div>
                    <p className="text-xs text-gray-400 italic">
                      Affects delays and viewing times (not CSS animations or videos)
                    </p>
                  </div>

                  {/* Visual Options */}
                  <div className="pt-2 border-t border-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={showDeckDebug}
                        onChange={(e) => setShowDeckDebug(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">Show Deck Debug Panel 🃏</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={showEventLog}
                        onChange={(e) => setShowEventLog(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">Show Event Log 📋</span>
                    </label>
                  </div>
                </div>

                {/* Card Deck Builder - Collapsible */}
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <button 
                    onClick={() => setIsDeckBuilderMinimized(!isDeckBuilderMinimized)}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-750 transition-colors rounded-t-lg"
                  >
                    <p className="font-semibold text-purple-300">💡 Card Deck Builder</p>
                    <span className="text-purple-300 text-sm">
                      {isDeckBuilderMinimized ? '▼' : '▲'}
                    </span>
                  </button>
                  
                  {!isDeckBuilderMinimized && (
                    <div className="p-3 pt-0 space-y-4">
                      {/* Instructions */}
                      <div className="text-sm text-gray-300">
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Select cards in the order you want them in each deck</li>
                          <li>Selected cards will be at the top of the deck</li>
                          <li>Remaining deck slots will be filled randomly</li>
                          <li>Leave empty for fully random decks</li>
                          <li>Press ↑ ↑ ↓ ↓ (keyboard) or swipe ↑ ↑ ↓ ↓ (mobile) to toggle this panel</li>
                        </ul>
                      </div>

                  {/* Player Deck */}
                  <div className="space-y-3 bg-purple-900/20 rounded-lg p-2 border border-purple-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-purple-300">👤 Player Deck ({playerCards.length} cards)</h3>
                      {playerCards.length > 0 && (
                        <button
                          onClick={handleClearPlayer}
                          className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors font-medium"
                          title="Remove all player cards"
                        >
                          <TrashIcon />
                          Clear All
                        </button>
                      )}
                    </div>

                    <CardSelector options={cardOptions} onSelect={handleAddPlayerCard} />

                    {/* Selected cards */}
                    {playerCards.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-medium">
                          Selected cards (in order):
                        </p>
                        <div className="bg-gray-800/50 rounded-lg p-2 space-y-1.5">
                          {playerCards.map((typeId, index) => {
                            const card = cardOptions.find((c) => c.typeId === typeId);
                            return (
                              <div
                                key={`player-${index}`}
                                className="flex items-center justify-between bg-gray-700 rounded px-3 py-2 text-sm hover:bg-gray-650 transition-colors"
                              >
                                <span className="font-medium">
                                  <span className="text-purple-400">#{index + 1}</span> {card?.name}{' '}
                                  <span className="text-gray-400">(Val: {card?.value})</span>
                                </span>
                                <button
                                  onClick={() => handleRemovePlayerCard(index)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                  title="Remove this card"
                                >
                                  <XIcon />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CPU Deck */}
                  <div className="space-y-3 bg-blue-900/20 rounded-lg p-2 border border-blue-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-blue-300">🤖 CPU Deck ({cpuCards.length} cards)</h3>
                      {cpuCards.length > 0 && (
                        <button
                          onClick={handleClearCpu}
                          className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors font-medium"
                          title="Remove all CPU cards"
                        >
                          <TrashIcon />
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Add card selector - at top for easy access */}
                    <CardSelector options={cardOptions} onSelect={handleAddCpuCard} />

                    {/* Selected cards */}
                    {cpuCards.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-medium">
                          Selected cards (in order):
                        </p>
                        <div className="bg-gray-800/50 rounded-lg p-2 space-y-1.5">
                          {cpuCards.map((typeId, index) => {
                            const card = cardOptions.find((c) => c.typeId === typeId);
                            return (
                              <div
                                key={`cpu-${index}`}
                                className="flex items-center justify-between bg-gray-700 rounded px-3 py-2 text-sm hover:bg-gray-650 transition-colors"
                              >
                                <span className="font-medium">
                                  <span className="text-blue-400">#{index + 1}</span> {card?.name}{' '}
                                  <span className="text-gray-400">(Val: {card?.value})</span>
                                </span>
                                <button
                                  onClick={() => handleRemoveCpuCard(index)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                  title="Remove this card"
                                >
                                  <XIcon />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-stretch justify-end gap-2 pt-2 border-t border-gray-700">
                    <Button
                      disabled
                      // onPress={handleSkipToGame}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 disabled:grayscale-100"
                      title="Skip all intro/setup screens and start gameplay immediately"
                    >
                      Skip to Game
                    </Button>
                    <button
                      onClick={handleApply}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-2 rounded-lg transition-all shadow-lg"
                      title="Start a new game with the selected cards"
                    >
                      Initialize Game
                    </button>
                  </div>
                    </div>
                  )}
                </div>

                {/* Data Grab Configuration */}
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-3">
                  <p className="font-semibold text-green-300">🎯 Data Grab Config:</p>
                  
                  {/* Fall Duration */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                      Card Fall Duration: {fallDuration}ms
                    </label>
                    <input
                      type="number"
                      min="500"
                      max="10000"
                      step="100"
                      value={fallDuration}
                      onChange={(e) => setFallDuration(parseInt(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    />
                  </div>

                  {/* Speed Variation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                      Speed Variation: ±{speedVariation}%
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="5"
                      value={speedVariation}
                      onChange={(e) => setSpeedVariation(parseInt(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    />
                  </div>

                  {/* Initial Delay */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                      Initial Delay: {initialDelay}ms
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      step="50"
                      value={initialDelay}
                      onChange={(e) => setInitialDelay(parseInt(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    />
                  </div>

                  {/* Delay Increment Range */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                      Delay Increment Min: {delayMin}ms
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="50"
                      value={delayMin}
                      onChange={(e) => setDelayMin(parseInt(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-300">
                      Delay Increment Max: {delayMax}ms
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="50"
                      value={delayMax}
                      onChange={(e) => setDelayMax(parseInt(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    />
                  </div>

                  {/* Visual Options */}
                  <div className="pt-2 border-t border-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={showDataGrabCookies}
                        onChange={(e) => setShowDataGrabCookies(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">Show floating cookies during Data Grab</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleApplyDataGrabConfig}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-colors text-sm"
                      title="Apply these values to Data Grab config"
                    >
                      Apply Config
                    </button>
                    <button
                      onClick={handleResetDataGrabConfig}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
                      title="Reset to default values"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Trigger Card Events */}
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-3">
                  <p className="font-semibold text-purple-300">🃏 Trigger Card Events:</p>
                  
                  <button
                    onClick={handleTriggerDataGrab}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors text-sm"
                    title="Move a Data Grab card to the top of the deck"
                  >
                    Trigger Data Grab on Next Play
                  </button>

                  <button
                    onClick={handleTriggerLaunchStack}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded transition-colors text-sm"
                    title="Move a Launch Stack card to the top of the deck"
                  >
                    Trigger Launch Stack on Next Play
                  </button>

                  <button
                    onClick={handleTriggerForcedEmpathy}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition-colors text-sm"
                    title="Move Forced Empathy card to the top of the deck"
                  >
                    Trigger Forced Empathy on Next Play
                  </button>

                  <button
                    onClick={handleTriggerTemperTantrum}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors text-sm"
                    title="Move Temper Tantrum card to the top of the deck"
                  >
                    Trigger Temper Tantrum on Next Play
                  </button>

                  <button
                    onClick={handleTriggerHostileTakeover}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition-colors text-sm"
                    title="Move Hostile Takeover card to the top of the deck"
                  >
                    Trigger Hostile Takeover on Next Play
                  </button>

                  {/* Toast Message */}
                  <AnimatePresence>
                    {toastMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-700 border border-gray-600 rounded p-3 text-sm text-gray-200"
                      >
                        {toastMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Instant Win Controls */}
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="font-semibold mb-3 text-yellow-300">🏆 Instant Win:</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Winner:</label>
                      <select
                        value={winnerSelection}
                        onChange={(e) => setWinnerSelection(e.target.value as 'player' | 'cpu')}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm cursor-pointer"
                      >
                        <option value="player">Player</option>
                        <option value="cpu">CPU</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Billionaire:</label>
                      <select
                        value={winnerBillionaire}
                        onChange={(e) => setWinnerBillionaire(e.target.value as BillionaireId)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm cursor-pointer"
                      >
                        {BILLIONAIRES.map((billionaire) => (
                          <option key={billionaire.id} value={billionaire.id}>
                            {billionaire.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleInstantWin}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded transition-colors"
                      title="Instantly trigger game win with selected winner and billionaire"
                    >
                      Trigger Win
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
      )}
    </AnimatePresence>
  );

  // Render using portal to bypass overflow-hidden on parent containers
  return typeof document !== 'undefined' ? (
    <>
      {createPortal(debugUI, document.body)}
      {showDeckDebug && createPortal(<DeckDebugPanel />, document.body)}
      {showEventLog && createPortal(<EventLogPanel />, document.body)}
    </>
  ) : null;
}

interface CardSelectorProps {
  options: CardOption[];
  onSelect: (typeId: CardTypeId) => void;
}

function CardSelector({ options, onSelect }: CardSelectorProps) {
  const [value, setValue] = useState('');

  const handleSelectionChange = (key: React.Key | null) => {
    if (key) {
      onSelect(key as CardTypeId);
      setValue('');
    }
  };

  return (
    <Autocomplete
      aria-label="search"
      placeholder="Search"
      inputValue={value}
      onInputChange={setValue}
      onSelectionChange={handleSelectionChange}
      listboxProps={{
        className: 'bg-neutral-800',
      }}
    >
      {options.map((option) => (
        <AutocompleteItem
          key={option.typeId}
          textValue={option.name}
          className="border-t border-b border-neutral-500/30"
        >
          <Text as="div" variant="body-small" weight="medium" color="text-common-ash">
            <div className="flex flex-col">
              <span className="font-bold">{option.name}</span>
              <span className="text-xs text-default-400">
                Value: {option.value}
                {option.specialType && ` • ${option.specialType}`}
              </span>
            </div>
          </Text>
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
