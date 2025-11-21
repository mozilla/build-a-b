/**
 * EventLogPanel - Draggable debug panel showing real-time game events
 */

import { useGameStore } from '@/store/game-store';
import type { GameEvent } from '@/store/types';
import { motion } from 'framer-motion';
import { type FC, useState, useEffect, useRef } from 'react';
import { Text } from '../Text';

export const EventLogPanel: FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const logEvent = useGameStore((state) => state.logEvent);

  // Subscribe to events from the store
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.eventLog && state.eventLog.length > 0) {
        setEvents([...state.eventLog]);
      }
    });

    return unsubscribe;
  }, []);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const handleClearLog = () => {
    useGameStore.setState({ eventLog: [] });
    setEvents([]);
  };

  const getLevelColor = (level: GameEvent['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLevelIcon = (level: GameEvent['level']) => {
    switch (level) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return '•';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      className="fixed top-20 left-4 z-[999] bg-black/90 border-2 border-cyan-500 rounded-lg shadow-2xl backdrop-blur-sm"
      style={{ width: isMinimized ? '200px' : '500px', maxWidth: '95vw' }}
    >
      {/* Header */}
      <div className="bg-cyan-500/20 border-b-2 border-cyan-500 p-2 cursor-move flex items-center justify-between">
        <Text variant="body-small" className="text-cyan-400 font-mono font-bold">
          📋 EVENT LOG
        </Text>
        <div className="flex items-center gap-2">
          {!isMinimized && (
            <>
              <button
                onClick={handleClearLog}
                className="text-cyan-400 hover:text-cyan-300 px-2 py-1 text-xs font-mono bg-cyan-900/30 hover:bg-cyan-900/50 rounded transition-colors"
                title="Clear log"
              >
                Clear
              </button>
              <label className="flex items-center gap-1 text-xs font-mono text-cyan-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-3 h-3 cursor-pointer"
                />
                Auto
              </label>
            </>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-cyan-400 hover:text-cyan-300 px-2 py-1 text-xs font-mono"
          >
            {isMinimized ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div 
          ref={scrollContainerRef}
          className="p-3 max-h-[60vh] overflow-y-auto font-mono text-xs"
        >
          {events.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No events logged yet...
            </div>
          ) : (
            <div className="space-y-1">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-900/50 border border-gray-700/50 rounded p-2 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className={`${getLevelColor(event.level)} flex-shrink-0 font-bold`}>
                      {getLevelIcon(event.level)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-gray-500 text-[10px] flex-shrink-0">
                          {formatTime(event.timestamp)}
                        </span>
                        <span className="text-cyan-400 font-semibold flex-shrink-0">
                          [{event.type}]
                        </span>
                        <span className={`${getLevelColor(event.level)} break-words flex-1`}>
                          {event.message}
                        </span>
                      </div>
                      {event.details && (
                        <div className="text-gray-500 text-[10px] mt-1 ml-4 break-words">
                          {event.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
