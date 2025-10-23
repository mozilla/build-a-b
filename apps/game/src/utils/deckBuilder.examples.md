# Deck Builder - Testing Strategies

The deck builder now supports parametrized ordering strategies for testing purposes.

## Available Strategies

- `'random'` - Standard Fisher-Yates shuffle (default)
- `'tracker-first'` - Tracker cards at top of deck
- `'firewall-first'` - Firewall cards at top (Forced Empathy, Tracker Smacker, etc.)
- `'move-first'` - Move cards at top (Hostile Takeover, Patent Theft, etc.)
- `'blocker-first'` - Blocker cards at top
- `'launch-stack-first'` - Launch stack cards at top
- `'special-first'` - All special cards at top
- `'common-first'` - Common cards at top
- `'high-value-first'` - Sort by value (5→1)
- `'low-value-first'` - Sort by value (1→5)

## Usage Examples

### In Components

```typescript
import { useGameStore } from '../stores/gameStore';

function TestComponent() {
  const initializeGame = useGameStore((state) => state.initializeGame);

  // Initialize with tracker cards first for player
  const testTrackerCards = () => {
    initializeGame('tracker-first', 'random');
  };

  // Initialize with firewall cards first for player
  const testFirewallCards = () => {
    initializeGame('firewall-first', 'random');
  };

  // Both players get special cards first
  const testSpecialCards = () => {
    initializeGame('special-first', 'special-first');
  };

  // Player gets high-value cards, CPU gets low-value cards
  const testValueDifference = () => {
    initializeGame('high-value-first', 'low-value-first');
  };

  return (
    <div>
      <button onClick={testTrackerCards}>Test Tracker Cards</button>
      <button onClick={testFirewallCards}>Test Firewall Cards</button>
      <button onClick={testSpecialCards}>Test Special Cards</button>
      <button onClick={testValueDifference}>Test Value Difference</button>
    </div>
  );
}
```

### Direct Function Usage

```typescript
import { initializeGameDeck } from '../utils/deckBuilder';
import { DEFAULT_GAME_CONFIG } from '../config/gameConfig';

// Default random shuffle
const { playerDeck, cpuDeck } = initializeGameDeck(DEFAULT_GAME_CONFIG);

// Player gets launch stacks first
const result1 = initializeGameDeck(
  DEFAULT_GAME_CONFIG,
  'launch-stack-first',
  'random'
);

// Both get special cards first
const result2 = initializeGameDeck(
  DEFAULT_GAME_CONFIG,
  'special-first',
  'special-first'
);
```

### In Tests

```typescript
import { describe, it, expect } from 'vitest';
import { initializeGameDeck } from '../utils/deckBuilder';
import { DEFAULT_GAME_CONFIG } from '../config/gameConfig';

describe('Tracker Card Functionality', () => {
  it('should trigger play-again effect when tracker card is played', () => {
    // Initialize with tracker cards first
    const { playerDeck } = initializeGameDeck(
      DEFAULT_GAME_CONFIG,
      'tracker-first'
    );

    // First card should be a tracker
    expect(playerDeck[0].specialType).toBe('tracker');

    // Test your tracker logic here
  });
});

describe('Firewall Card Functionality', () => {
  it('should swap decks when Forced Empathy is played', () => {
    // Initialize with firewall cards first
    const { playerDeck } = initializeGameDeck(
      DEFAULT_GAME_CONFIG,
      'firewall-first'
    );

    // Find the Forced Empathy card at the top
    const forcedEmpathyCard = playerDeck.find(
      (card) => card.specialType === 'forced_empathy'
    );

    expect(forcedEmpathyCard).toBeDefined();
    // Test your Forced Empathy logic here
  });
});
```

### Reset Game with Strategy

```typescript
import { useGameStore } from '../stores/gameStore';

function GameControls() {
  const resetGame = useGameStore((state) => state.resetGame);

  // Reset with specific strategy for testing
  const handleResetWithTrackers = () => {
    resetGame('tracker-first', 'random');
  };

  return <button onClick={handleResetWithTrackers}>Reset with Trackers</button>;
}
```

## Debug Menu Example

You can create a debug menu to quickly test different scenarios:

```typescript
import { useGameStore } from '../stores/gameStore';

function DebugMenu() {
  const initializeGame = useGameStore((state) => state.initializeGame);

  const strategies = [
    'random',
    'tracker-first',
    'firewall-first',
    'move-first',
    'blocker-first',
    'launch-stack-first',
    'special-first',
    'common-first',
    'high-value-first',
    'low-value-first',
  ] as const;

  return (
    <div className="debug-menu">
      <h3>Player Deck Strategy:</h3>
      {strategies.map((strategy) => (
        <button
          key={strategy}
          onClick={() => initializeGame(strategy, 'random')}
        >
          {strategy}
        </button>
      ))}
    </div>
  );
}
```

## Production vs Development

In production, always use `'random'` strategy:

```typescript
// Production
initializeGame(); // Uses 'random' by default

// Development/Testing
if (process.env.NODE_ENV === 'development') {
  initializeGame('tracker-first'); // Test specific scenario
}
```
