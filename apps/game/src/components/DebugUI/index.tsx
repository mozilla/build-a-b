/**
 * Debug UI Component - For testing card scenarios
 * Allows manual card selection for player and CPU decks
 * Toggle by typing "debug" (works regardless of focus)
 */

import { Button } from '@/components/Button';
import Text from '@/components/Text';
import { DEFAULT_GAME_CONFIG, type CardTypeId } from '@/config/game-config';
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
  const keySequenceRef = useRef('');
  const initializeGame = useGameStore((state) => state.initializeGame);
  const showDataGrabCookies = useGameStore((state) => state.showDataGrabCookies);
  const setShowDataGrabCookies = useGameStore((state) => state.setShowDataGrabCookies);

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
                       fixed bottom-0 left-0 right-0 h-[80vh] z-[10000]
                       md:relative md:w-[600px] md:max-h-[80vh] md:bottom-auto md:left-auto md:right-auto
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
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <p className="font-semibold mb-2 text-cyan-300">🍪 Visual Options:</p>
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
                    <p className="text-xs text-gray-400 font-medium">Selected cards (in order):</p>
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
                    <p className="text-xs text-gray-400 font-medium">Selected cards (in order):</p>
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
