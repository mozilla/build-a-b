/**
 * Debug UI Component - For testing card scenarios
 * Allows manual card selection for player and CPU decks
 * Toggle by typing "debug" (works regardless of focus)
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerCards, setPlayerCards] = useState<CardTypeId[]>([]);
  const [cpuCards, setCpuCards] = useState<CardTypeId[]>([]);
  const [winnerSelection, setWinnerSelection] = useState<'player' | 'cpu'>('player');
  const [winnerBillionaire, setWinnerBillionaire] = useState<BillionaireId>('chaz');
  
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
    setIsExpanded(false);
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
      alert('No Data Grab cards found in decks!');
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

    alert(`Moved Data Grab card from position ${closestIndex + 1} to top of ${targetDeck} deck!`);
  };

  const debugUI = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-[100] font-sans md:bottom-4 md:right-4 isolate"
        >
          {!isExpanded ? (
            // Collapsed state - small floating button
            <Button onPress={() => setIsExpanded(true)} title="Open Debug UI">
              Debug
            </Button>
          ) : (
            // Expanded state - drawer on mobile, panel on desktop
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-gray-900 text-white rounded-t-lg md:rounded-lg shadow-2xl 
                       fixed bottom-0 left-0 right-0 h-[80dvh] z-[10000]
                       md:relative md:w-[37.5rem] md:max-h-[80dvh] md:bottom-auto md:left-auto md:right-auto
                       overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-neutral-700 px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">Debug Panel</h2>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="hover:bg-purple-700 rounded p-1 transition-colors"
                  title="Minimize"
                >
                  <XIcon />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Instructions */}
                <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 border border-gray-700">
                  <p className="font-semibold mb-2 text-purple-300">💡 Card Deck Builder:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Select cards in the order you want them in each deck</li>
                    <li>Selected cards will be at the top of the deck</li>
                    <li>Remaining deck slots will be filled randomly</li>
                    <li>Leave empty for fully random decks</li>
                    <li>Press ↑ ↑ ↓ ↓ to toggle this panel</li>
                  </ul>
                </div>

                {/* Debug Options */}
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-3">
                  <p className="font-semibold text-cyan-300">⚙️ Debug Options:</p>

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
                        checked={showDataGrabCookies}
                        onChange={(e) => setShowDataGrabCookies(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">Show floating cookies during Data Grab</span>
                    </label>
                  </div>
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

                  {/* Trigger Data Grab Button */}
                  <div className="pt-2 border-t border-gray-700">
                    <button
                      onClick={handleTriggerDataGrab}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition-colors text-sm"
                      title="Move a Data Grab card to the top of the deck"
                    >
                      🃏 Trigger Data Grab on Next Play
                    </button>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      Moves a Data Grab card to the top of the deck with most Data Grab cards (or player deck if tied)
                    </p>
                  </div>
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
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="border-t border-gray-700 px-4 py-4 flex items-stretch justify-end bg-gray-800 shrink-0">
                <Button
                  disabled
                  // onPress={handleSkipToGame}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 mr-4 disabled:grayscale-100"
                  title="Skip all intro/setup screens and start gameplay immediately"
                >
                  Skip to Game
                </Button>
                <button
                  onClick={handleApply}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-2.5 rounded-lg transition-all shadow-lg"
                  title="Start a new game with the selected cards"
                >
                  Initialize Game
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render using portal to bypass overflow-hidden on parent containers
  return typeof document !== 'undefined' ? createPortal(debugUI, document.body) : null;
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
