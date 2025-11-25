/**
 * DeckDebugPanel - Draggable debug panel showing deck and played card contents
 */

import { useGameStore } from '@/store/game-store';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { type FC, useState } from 'react';
import { Tooltip } from '../Tooltip';
import { Text } from '../Text';
import type { Card } from '@/types';

interface CardBadgeProps {
  card: Card;
  isFaceDown?: boolean;
  colorClass: string;
  isDraggable?: boolean;
}

const CardBadge: FC<CardBadgeProps> = ({ card, isFaceDown = false, colorClass, isDraggable = false }) => {
  const content = (
    <span
      className={`text-[10px] font-mono px-1 py-0.5 rounded ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-help'} ${colorClass}`}
    >
      {isFaceDown ? '?' : card.value}
      {card.isSpecial && '⭐'}
    </span>
  );

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
      {content}
    </Tooltip>
  );
};

interface DraggableCardRowProps {
  card: Card;
  index: number;
  colorScheme: 'red' | 'blue';
  onMoveToTop: () => void;
}

const DraggableCardRow: FC<DraggableCardRowProps> = ({ card, index, colorScheme, onMoveToTop }) => {
  const bgColor = colorScheme === 'red' ? 'bg-red-900/30' : 'bg-blue-900/30';
  const hoverColor = colorScheme === 'red' ? 'hover:bg-red-900/50' : 'hover:bg-blue-900/50';
  const borderColor = colorScheme === 'red' ? 'border-red-600/40' : 'border-blue-600/40';
  const textColor = colorScheme === 'red' ? 'text-red-200' : 'text-blue-200';

  return (
    <div
      className={`${bgColor} ${hoverColor} ${borderColor} border rounded px-2 py-1.5 transition-colors flex items-center gap-2`}
    >
      {/* Drag Handle */}
      <span className="text-gray-500 text-xs">⋮⋮</span>
      
      {/* Position Number */}
      <span className="text-gray-400 font-mono text-xs w-5 flex-shrink-0">
        #{index + 1}
      </span>

      {/* Card Value */}
      <span className={`${textColor} font-mono font-bold text-xs w-6 flex-shrink-0 text-center`}>
        {card.value}
      </span>

      {/* Card Name */}
      <span className="text-gray-300 text-xs flex-1 truncate">
        {card.name}
      </span>

      {/* Special Indicator */}
      {card.isSpecial && (
        <span className="text-yellow-400 text-xs flex-shrink-0">⭐</span>
      )}

      {/* Move to Top Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMoveToTop();
        }}
        className="text-gray-400 hover:text-green-400 cursor-pointer text-xs flex-shrink-0 transition-colors"
        title="Move to top of deck"
      >
        ↑
      </button>
    </div>
  );
};

export const DeckDebugPanel: FC = () => {
  const player = useGameStore((state) => state.player);
  const cpu = useGameStore((state) => state.cpu);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragControls = useDragControls();

  const handlePlayerDeckReorder = (newOrder: Card[]) => {
    useGameStore.setState({
      player: {
        ...player,
        deck: newOrder,
      },
    });
  };

  const handleCpuDeckReorder = (newOrder: Card[]) => {
    useGameStore.setState({
      cpu: {
        ...cpu,
        deck: newOrder,
      },
    });
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragListener={false}
      className="fixed top-20 right-4 z-[999] bg-black/90 border-2 border-green-500 rounded-lg shadow-2xl backdrop-blur-sm"
      style={{ width: isMinimized ? '200px' : '500px', maxWidth: '95vw' }}
    >
      {/* Header */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="bg-green-500/20 border-b-2 border-green-500 p-2 cursor-move flex items-center justify-between"
      >
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
        <div className="p-4 max-h-[84dvh] overflow-y-auto">
          {/* Combined Played Cards Section */}
          <div className="border-b border-gray-700 pb-4 mb-4">
            <Text variant="badge-xs" className="text-gray-400 font-mono mb-2">
              Played Cards:
            </Text>
            <div className="grid grid-cols-2 gap-3">
              {/* CPU Played Cards - Left */}
              <div>
                <Text variant="badge-xs" className="text-red-400 font-mono mb-1 text-center">
                  🤖 CPU
                </Text>
                <div className="bg-red-900/20 border border-red-500/30 rounded p-2 min-h-[60px]">
                  {cpu.playedCardsInHand.length === 0 ? (
                    <Text variant="badge-xs" className="text-gray-500 font-mono text-center">
                      None
                    </Text>
                  ) : (
                    <div className="flex flex-wrap gap-1 justify-center">
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

              {/* Player Played Cards - Right */}
              <div>
                <Text variant="badge-xs" className="text-blue-400 font-mono mb-1 text-center">
                  👤 PLAYER
                </Text>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2 min-h-[60px]">
                  {player.playedCardsInHand.length === 0 ? (
                    <Text variant="badge-xs" className="text-gray-500 font-mono text-center">
                      None
                    </Text>
                  ) : (
                    <div className="flex flex-wrap gap-1 justify-center">
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
                Deck: <span className="text-gray-500 text-[9px]">(drag rows to reorder)</span>
              </Text>
              <div className="bg-red-900/10 border border-red-500/30 rounded p-2 max-h-64 overflow-y-auto overflow-x-hidden">
                {cpu.deck.length === 0 ? (
                  <Text variant="badge-xs" className="text-gray-500 font-mono">
                    Empty
                  </Text>
                ) : (
                  <Reorder.Group
                    as="div"
                    axis="y"
                    values={cpu.deck}
                    onReorder={handleCpuDeckReorder}
                    className="space-y-1"
                    layoutScroll
                    style={{ overflowY: 'visible' }}
                  >
                    {cpu.deck.map((card, idx) => (
                      <Reorder.Item
                        key={card.id}
                        value={card}
                        className="relative"
                        style={{ cursor: 'grab' }}
                        whileDrag={{ 
                          cursor: 'grabbing',
                          scale: 1.02,
                          zIndex: 1000
                        }}
                      >
                        <DraggableCardRow
                          card={card}
                          index={idx}
                          colorScheme="red"
                          onMoveToTop={() => {
                            const newDeck = [...cpu.deck];
                            const [movedCard] = newDeck.splice(idx, 1);
                            newDeck.unshift(movedCard);
                            handleCpuDeckReorder(newDeck);
                          }}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
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
                Deck: <span className="text-gray-500 text-[9px]">(drag rows to reorder)</span>
              </Text>
              <div className="bg-blue-900/10 border border-blue-500/30 rounded p-2 max-h-64 overflow-y-auto overflow-x-hidden">
                {player.deck.length === 0 ? (
                  <Text variant="badge-xs" className="text-gray-500 font-mono">
                    Empty
                  </Text>
                ) : (
                  <Reorder.Group
                    as="div"
                    axis="y"
                    values={player.deck}
                    onReorder={handlePlayerDeckReorder}
                    className="space-y-1"
                    layoutScroll
                    style={{ overflowY: 'visible' }}
                  >
                    {player.deck.map((card, idx) => (
                      <Reorder.Item
                        key={card.id}
                        value={card}
                        className="relative"
                        style={{ cursor: 'grab' }}
                        whileDrag={{ 
                          cursor: 'grabbing',
                          scale: 1.02,
                          zIndex: 1000
                        }}
                      >
                        <DraggableCardRow
                          card={card}
                          index={idx}
                          colorScheme="blue"
                          onMoveToTop={() => {
                            const newDeck = [...player.deck];
                            const [movedCard] = newDeck.splice(idx, 1);
                            newDeck.unshift(movedCard);
                            handlePlayerDeckReorder(newDeck);
                          }}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
};

