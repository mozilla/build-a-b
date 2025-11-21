/**
 * DeckDebugPanel - Draggable debug panel showing deck and played card contents
 */

import { useGameStore } from '@/store/game-store';
import { motion } from 'framer-motion';
import { type FC, useState } from 'react';
import { Tooltip } from '../Tooltip';
import { Text } from '../Text';
import type { Card } from '@/types';

interface CardBadgeProps {
  card: Card;
  isFaceDown?: boolean;
  colorClass: string;
}

const CardBadge: FC<CardBadgeProps> = ({ card, isFaceDown = false, colorClass }) => {
  return (
    <Tooltip
      content={
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-32 h-auto rounded"
        />
      }
      placement="top"
      delay={200}
      classNames={{
        base: ['!z-[9999]'], // Force above everything including debug panel
      }}
      style={{
        zIndex: 9999, // Inline style to ensure it takes precedence
      }}
    >
      <span
        className={`text-[10px] font-mono px-1 py-0.5 rounded cursor-help ${colorClass}`}
      >
        {isFaceDown ? '?' : card.value}
        {card.isSpecial && '⭐'}
      </span>
    </Tooltip>
  );
};

export const DeckDebugPanel: FC = () => {
  const player = useGameStore((state) => state.player);
  const cpu = useGameStore((state) => state.cpu);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      className="fixed top-20 right-4 z-[999] bg-black/90 border-2 border-green-500 rounded-lg shadow-2xl backdrop-blur-sm"
      style={{ width: isMinimized ? '200px' : '400px' }}
    >
      {/* Header */}
      <div className="bg-green-500/20 border-b-2 border-green-500 p-2 cursor-move flex items-center justify-between">
        <Text variant="body-small" className="text-green-400 font-mono font-bold">
          🃏 DECK DEBUG
        </Text>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-green-400 hover:text-green-300 px-2 py-1 text-xs font-mono"
        >
          {isMinimized ? '▼' : '▲'}
        </button>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* CPU Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Text variant="body-small" className="text-red-400 font-mono font-bold">
                🤖 CPU
              </Text>
              <Text variant="badge-xs" className="text-red-300 font-mono">
                ({cpu.deck.length} cards)
              </Text>
            </div>

            {/* CPU Deck */}
            <div className="mb-3">
              <Text variant="badge-xs" className="text-gray-400 font-mono mb-1">
                Deck:
              </Text>
              <div className="bg-red-900/20 border border-red-500/30 rounded p-2 max-h-32 overflow-y-auto">
                {cpu.deck.length === 0 ? (
                  <Text variant="badge-xs" className="text-gray-500 font-mono">
                    Empty
                  </Text>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {cpu.deck.map((card, idx) => (
                      <CardBadge
                        key={`${card.id}-${idx}`}
                        card={card}
                        colorClass="bg-red-600/30"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CPU Played Cards */}
            <div>
              <Text variant="badge-xs" className="text-gray-400 font-mono mb-1">
                Played Cards:
              </Text>
              <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                {cpu.playedCardsInHand.length === 0 ? (
                  <Text variant="badge-xs" className="text-gray-500 font-mono">
                    None
                  </Text>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {cpu.playedCardsInHand.map((pcs, idx) => (
                      <CardBadge
                        key={`${pcs.card.id}-${idx}`}
                        card={pcs.card}
                        isFaceDown={pcs.isFaceDown}
                        colorClass={
                          pcs.isFaceDown
                            ? 'bg-gray-600/50 text-gray-400'
                            : 'bg-red-600/50 text-red-200'
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Player Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Text variant="body-small" className="text-blue-400 font-mono font-bold">
                👤 PLAYER
              </Text>
              <Text variant="badge-xs" className="text-blue-300 font-mono">
                ({player.deck.length} cards)
              </Text>
            </div>

            {/* Player Deck */}
            <div className="mb-3">
              <Text variant="badge-xs" className="text-gray-400 font-mono mb-1">
                Deck:
              </Text>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2 max-h-32 overflow-y-auto">
                {player.deck.length === 0 ? (
                  <Text variant="badge-xs" className="text-gray-500 font-mono">
                    Empty
                  </Text>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {player.deck.map((card, idx) => (
                      <CardBadge
                        key={`${card.id}-${idx}`}
                        card={card}
                        colorClass="bg-blue-600/30"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Player Played Cards */}
            <div>
              <Text variant="badge-xs" className="text-gray-400 font-mono mb-1">
                Played Cards:
              </Text>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                {player.playedCardsInHand.length === 0 ? (
                  <Text variant="badge-xs" className="text-gray-500 font-mono">
                    None
                  </Text>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {player.playedCardsInHand.map((pcs, idx) => (
                      <CardBadge
                        key={`${pcs.card.id}-${idx}`}
                        card={pcs.card}
                        isFaceDown={pcs.isFaceDown}
                        colorClass={
                          pcs.isFaceDown
                            ? 'bg-gray-600/50 text-gray-400'
                            : 'bg-blue-600/50 text-blue-200'
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

