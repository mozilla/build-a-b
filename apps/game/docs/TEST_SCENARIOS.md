# Data War - Test Scenarios Reference

This document provides comprehensive test scenarios for all game mechanics and special effect cards. Use this as a reference when writing tests for the game store, state machine, and UI components.

Each scenario includes the specific `initializeGame()` call needed to set up the test conditions.

## Available Deck Order Strategies

```typescript
type DeckOrderStrategy =
  | 'random'              // Standard Fisher-Yates shuffle
  | 'tracker-first'       // Tracker cards at top of deck
  | 'firewall-first'      // Firewall cards at top
  | 'move-first'          // Move cards at top
  | 'blocker-first'       // Blocker cards at top
  | 'launch-stack-first'  // Launch stack cards at top
  | 'special-first'       // All special cards at top
  | 'common-first'        // Common cards at top
  | 'high-value-first'    // Sort by value (5→1)
  | 'low-value-first'     // Sort by value (1→5)
  | 'owyw-first'          // OWYW cards at top
  | 'custom';             // Custom ordering with typeIds array

// Usage:
initializeGame(playerStrategy?, cpuStrategy?, playerCustomOrder?, cpuCustomOrder?)
```

## Table of Contents
1. [Basic Game Mechanics](#basic-game-mechanics)
2. [Launch Stack Cards](#launch-stack-cards)
3. [Firewall Cards](#firewall-cards)
4. [Move Cards](#move-cards)
5. [Tracker Cards](#tracker-cards)
6. [Blocker Cards](#blocker-cards)
7. [Data Grab](#data-grab)
8. [Card Interactions](#card-interactions)
9. [Data War Scenarios](#data-war-scenarios)
10. [Win Conditions](#win-conditions)
11. [Edge Cases](#edge-cases)

---

## Basic Game Mechanics

### Turn Resolution

#### Scenario: Player wins with higher value
- **Init**: `initializeGame('high-value-first', 'low-value-first')`
- **Setup**: Player plays Common-5 (value 5), CPU plays Common-3 (value 3)
- **Expected**: `resolveTurn()` returns `'player'`
- **Expected**: Player collects both cards after effects processing

#### Scenario: CPU wins with higher value
- **Init**: `initializeGame('low-value-first', 'high-value-first')`
- **Setup**: Player plays Common-2 (value 2), CPU plays Common-4 (value 4)
- **Expected**: `resolveTurn()` returns `'cpu'`
- **Expected**: CPU collects both cards after effects processing

#### Scenario: Tie triggers Data War
- **Init**: `initializeGame()` (random, then manually set equal values)
- **Setup**: Player plays Common-4 (value 4), CPU plays Common-4 (value 4)
- **Expected**: `resolveTurn()` returns `'tie'`
- **Expected**: `checkForDataWar()` returns `true`
- **Expected**: State machine transitions to `data_war` state

#### Scenario: Cards collected only after effects processing
- **Init**: `initializeGame('high-value-first')`
- **Setup**: Player plays Common-5, CPU plays Common-3
- **Expected**: After `resolveTurn()`, cards remain in `cardsInPlay`
- **Expected**: After `processPendingEffects()` and `collectCardsAfterEffects()`, cards are transferred to winner's deck

### Card Play

#### Scenario: Play card from top of deck
- **Init**: `initializeGame()`
- **Setup**: Player has 33 cards in deck
- **Action**: `playCard('player')`
- **Expected**:
  - `player.playedCard` is the top card
  - `player.deck` has 32 cards
  - Card is added to `cardsInPlay`
  - `player.currentTurnValue` equals card value

#### Scenario: Empty deck protection
- **Init**: Not needed (manually set empty deck)
- **Setup**: Player has 0 cards in deck
- **Action**: `playCard('player')`
- **Expected**: No crash, logs error in development mode

#### Scenario: Normal mode sets value
- **Init**: `initializeGame('common-first')`
- **Setup**: `anotherPlayMode = false`, player has 5 cards
- **Action**: `playCard('player')` with Common-3 (value 3)
- **Expected**: `player.currentTurnValue = 3` (replaces previous value)

#### Scenario: Another play mode adds value
- **Init**: `initializeGame('tracker-first', 'common-first')`
- **Setup**: `anotherPlayMode = true`, `player.currentTurnValue = 2` (from Tracker)
- **Action**: `playCard('player')` with Common-3 (value 3)
- **Expected**: `player.currentTurnValue = 5` (2 + 3)

---

## Launch Stack Cards

**Card Count**: 5 unique cards (ls-ai-platform, ls-energy-grid, ls-government, ls-newspaper, ls-rocket-company)
**Card Value**: 0
**Effect**: Collect 3 and win the game
**Triggers Another Play**: Yes

### Core Functionality

#### Scenario: Collect Launch Stack
- **Init**: `initializeGame('launch-stack-first', 'common-first')`
- **Setup**: Player plays Launch Stack card
- **Action**: `handleCardEffect(launchStackCard, 'player')`
- **Expected**:
  - `player.launchStackCount` increments by 1
  - Launch Stack card is added to `playerLaunchStacks` array
  - Launch Stack card is removed from `cardsInPlay`
  - Card will NOT be collected by turn winner

#### Scenario: Launch Stack triggers another play
- **Init**: `initializeGame('launch-stack-first', 'common-first')`
- **Setup**: Player plays Launch Stack (value 0)
- **Expected**:
  - `anotherPlayMode = true`
  - `activePlayer = 'player'`
  - Player plays another card immediately
  - Second card's value is the turn value (Launch Stack value 0 is ignored)

#### Scenario: Win with 3 Launch Stacks
- **Init**: `initializeGame('launch-stack-first', 'common-first')`
- **Setup**: Player has 2 Launch Stacks, plays third Launch Stack card
- **Action**: `addLaunchStack('player')`
- **Expected**:
  - `player.launchStackCount = 3`
  - `winner = 'player'`
  - `winCondition = 'launch_stacks'`
  - Game ends immediately

#### Scenario: Launch Stack + Common card combo
- **Init**: `initializeGame('custom', 'common-first', ['ls-ai-platform', 'common-4'])`
- **Setup**: Player plays Launch Stack (value 0), then Common-4 (value 4)
- **Expected**:
  - First card: `anotherPlayMode = true`, `currentTurnValue = 0`
  - Second card: `anotherPlayMode = false`, `currentTurnValue = 4`
  - Turn resolves with player value = 4

### Interactions

#### Scenario: Launch Stack vs Launch Stack
- **Init**: `initializeGame('launch-stack-first', 'launch-stack-first')`
- **Setup**: Player plays Launch Stack, CPU plays Launch Stack
- **Expected**:
  - Both players increment launch stack count
  - Both play another card
  - Turn resolves based on second cards

#### Scenario: Launch Stack removed from deck in win condition check
- **Init**: Not needed (manually set state)
- **Setup**: Player has 0 cards in deck, 0 played card, 3 launch stacks collected
- **Action**: `checkWinCondition()`
- **Expected**: Player has not lost (Launch Stacks count as player's cards)

---

## Firewall Cards

### Firewall: Empathy (forced_empathy)

**Card Value**: 6
**Effect Type**: Instant
**Effect**: Swap decks between players

#### Scenario: Basic deck swap
- **Init**: `initializeGame('tracker-first', 'common-first')`
- **Setup**: Player has [A, B, C] cards, CPU has [X, Y, Z] cards
- **Action**: Player plays Forced Empathy
- **Expected**:
  - `forcedEmpathySwapping = true` (animation state)
  - After animation delay (2.3s):
    - `player.deck = [X, Y, Z]`
    - `cpu.deck = [A, B, C]`
    - `deckSwapCount` increments by 1
    - `forcedEmpathySwapping = false`

#### Scenario: Swap doesn't affect launch stacks
- **Init**: `initializeGame('custom', 'common-first', ['firewall-empathy'])`
- **Setup**: Player has 2 launch stacks, CPU has 1 launch stack
- **Action**: Forced Empathy is played
- **Expected**:
  - Only `deck` arrays are swapped
  - `player.launchStackCount` remains 2
  - `cpu.launchStackCount` remains 1
  - Launch stack collections stay with original owner

#### Scenario: Multiple swaps tracked
- **Init**: `initializeGame('custom', 'common-first', ['firewall-empathy', 'firewall-empathy'])`
- **Setup**: Forced Empathy played twice in game
- **Expected**:
  - First swap: `deckSwapCount = 1` (odd = swapped state)
  - Second swap: `deckSwapCount = 2` (even = back to normal)
  - Visual positions correct after each swap

#### Scenario: Forced Empathy vs Forced Empathy
- **Init**: `initializeGame('custom', 'custom', ['firewall-empathy'], ['firewall-empathy'])`
- **Setup**: Both players play Forced Empathy in same turn
- **Expected**:
  - Both effects trigger (instant effects)
  - Decks swap twice (net result: no swap)
  - `deckSwapCount = 2`

### Firewall: Open (open_what_you_want)

**Card Value**: 6
**Effect Type**: Queued (pre-reveal)
**Effect**: On next play, look at top 3 cards and choose which to play

#### Scenario: Player activates OWYW
- **Init**: `initializeGame('owyw-first', 'common-first')`
- **Setup**: Player plays Firewall: Open and wins turn
- **Action**: `processPendingEffects('player')`
- **Expected**:
  - `openWhatYouWantActive = 'player'`
  - Pre-reveal effect added: `{ type: 'owyw', playerId: 'player', requiresInteraction: true }`

#### Scenario: Player interaction flow
- **Init**: `initializeGame('owyw-first', 'common-first')`
- **Setup**: `openWhatYouWantActive = 'player'`, next turn begins
- **Action**: State machine reaches `pre_reveal` state
- **Expected**:
  1. `prepareOpenWhatYouWantCards('player')` called
  2. `openWhatYouWantCards` contains top 3 cards from player deck
  3. Animation plays for 2 seconds
  4. User prompted to tap deck
  5. Modal shows 3 cards in Swiper carousel
  6. User selects card
  7. Selected card moves to top of deck
  8. Unselected 2 cards shuffled and added to bottom
  9. Selected card played automatically in revealing phase

#### Scenario: CPU auto-selects card
- **Init**: `initializeGame('common-first', 'owyw-first')`
- **Setup**: `openWhatYouWantActive = 'cpu'`, next turn begins
- **Expected**:
  1. `prepareOpenWhatYouWantCards('cpu')` called
  2. Random card auto-selected from top 3
  3. No animation or modal shown
  4. Selected card moves to top, others to bottom
  5. Immediately transitions to revealing phase

#### Scenario: OWYW doesn't trigger if no top 3 cards
- **Init**: Not needed (manually set 2 cards in deck)
- **Setup**: Player has only 2 cards left, `openWhatYouWantActive = 'player'`
- **Expected**: Show available cards (2 instead of 3), user selects from available

#### Scenario: OWYW card order preserved
- **Init**: `initializeGame('custom', 'common-first', ['tracker-3', 'common-5', 'blocker-1'])`
- **Setup**: Top 3 cards are [Tracker-3, Common-5, Blocker-1], player selects Common-5
- **Expected**:
  - Common-5 moves to position 0 (top)
  - Tracker-3 and Blocker-1 shuffled randomly
  - New deck order: [Common-5, ...rest of deck, shuffled(Tracker-3, Blocker-1)]

#### Scenario: OWYW effect cleared after use
- **Init**: `initializeGame('owyw-first', 'common-first')`
- **Setup**: Player uses OWYW to select card
- **Expected**:
  - `openWhatYouWantActive = null`
  - `openWhatYouWantCards = []`
  - `showOpenWhatYouWantModal = false`
  - `preRevealEffects` cleared

### Firewall: Recall (mandatory_recall)

**Card Value**: 6
**Effect Type**: Queued
**Effect**: If win, opponent shuffles all Launch Stacks back into deck

#### Scenario: Player wins with Mandatory Recall
- **Init**: `initializeGame('custom', 'launch-stack-first', ['firewall-recall', 'common-5'])`
- **Setup**: Player plays Mandatory Recall, CPU has 2 Launch Stacks
- **Action**: Player wins turn, `processPendingEffects('player')` called
- **Expected**:
  - `cpu.launchStackCount` reduced to 0
  - 2 Launch Stack cards from `cpuLaunchStacks` shuffled back into `cpu.deck`
  - `cpuLaunchStacks = []`

#### Scenario: Player loses with Mandatory Recall
- **Init**: `initializeGame('custom', 'high-value-first', ['firewall-recall', 'common-2'])`
- **Setup**: Player plays Mandatory Recall, CPU wins turn
- **Expected**: No effect (condition not met)

#### Scenario: Opponent has no Launch Stacks
- **Init**: `initializeGame('custom', 'common-first', ['firewall-recall', 'common-5'])`
- **Setup**: Player plays Mandatory Recall, CPU has 0 Launch Stacks
- **Expected**: No effect, no errors

#### Scenario: Recall multiple Launch Stacks
- **Init**: `initializeGame('custom', 'launch-stack-first', ['firewall-recall', 'common-5'])`
- **Setup**: Player wins with Mandatory Recall, CPU has all 5 Launch Stacks
- **Expected**:
  - All 5 Launch Stack cards returned to CPU's deck
  - `cpu.launchStackCount = 0`
  - `cpuLaunchStacks = []`
  - Cards shuffled randomly into deck

### Firewall: Smacker (tracker_smacker)

**Card Value**: 6
**Effect Type**: Instant
**Effect**: Negate all opponent Tracker/Blocker and certain Move effects for remainder of turn

#### Scenario: Blocks opponent tracker
- **Init**: `initializeGame('tracker-first', 'custom', undefined, ['firewall-smacker'])`
- **Setup**: Player plays Tracker-2, CPU plays Tracker Smacker
- **Expected**:
  - `trackerSmackerActive = 'cpu'`
  - Player's tracker effect negated: `player.currentTurnValue = 0` (tracker value ignored)
  - Player's `playerTurnState` reset to `'normal'`

#### Scenario: Blocks opponent blocker
- **Init**: `initializeGame('blocker-first', 'custom', undefined, ['firewall-smacker'])`
- **Setup**: Player plays Blocker-2, CPU plays Tracker Smacker
- **Expected**:
  - Blocker effect on CPU negated
  - `cpu.currentTurnValue` unchanged
  - Player's `playerTurnState` reset to `'normal'`

#### Scenario: Doesn't block own trackers
- **Init**: `initializeGame('common-first', 'custom', undefined, ['firewall-smacker', 'tracker-3'])`
- **Setup**: CPU plays Tracker Smacker and Tracker-3 in same turn
- **Expected**: CPU's Tracker-3 still works (not blocked by own Tracker Smacker)

#### Scenario: Blocks Leveraged Buyout
- **Init**: `initializeGame('custom', 'custom', ['move-buyout', 'common-5'], ['firewall-smacker', 'common-3'])`
- **Setup**: Player plays Leveraged Buyout and wins, CPU has Tracker Smacker active
- **Expected**: Leveraged Buyout effect doesn't trigger (blocked)

#### Scenario: Blocks Patent Theft
- **Init**: `initializeGame('custom', 'custom', ['move-theft', 'common-5'], ['firewall-smacker', 'common-3'])`
- **Setup**: Player plays Patent Theft and wins, CPU has Tracker Smacker active
- **Expected**: Patent Theft effect doesn't trigger (blocked)

#### Scenario: Blocks Temper Tantrum
- **Init**: `initializeGame('custom', 'custom', ['move-tantrum', 'common-2'], ['firewall-smacker', 'common-5'])`
- **Setup**: Player plays Temper Tantrum and loses, CPU has Tracker Smacker active
- **Expected**: Temper Tantrum effect doesn't trigger (blocked)

#### Scenario: Doesn't block Mandatory Recall, Data Grab, or Forced Empathy
- **Init**: `initializeGame('firewall-first', 'custom', undefined, ['firewall-smacker'])`
- **Setup**: Player plays these cards, CPU has Tracker Smacker active
- **Expected**: Effects still trigger (not in blocked list)

#### Scenario: Tracker Smacker cleared after turn
- **Init**: `initializeGame('custom', 'common-first', ['firewall-smacker', 'common-5'])`
- **Setup**: `trackerSmackerActive = 'player'`, turn ends
- **Expected**: `trackerSmackerActive` reset to `null` for next turn

---

## Move Cards

### Move: Buyout (leveraged_buyout)

**Card Value**: 6
**Effect Type**: Queued
**Effect**: If win, steal 2 cards from top of opponent's deck

#### Scenario: Player wins with Leveraged Buyout
- **Init**: `initializeGame('custom', 'common-first', ['move-buyout', 'common-5'])`
- **Setup**: Player plays Leveraged Buyout, CPU has 10 cards in deck
- **Action**: Player wins turn, `processPendingEffects('player')` called
- **Expected**:
  - Top 2 cards from `cpu.deck` moved to `player.deck`
  - `cpu.deck.length` reduced by 2
  - `player.deck.length` increased by 2

#### Scenario: Player loses with Leveraged Buyout
- **Init**: `initializeGame('custom', 'high-value-first', ['move-buyout', 'common-2'])`
- **Setup**: Player plays Leveraged Buyout, CPU wins turn
- **Expected**: No effect (condition not met)

#### Scenario: Opponent has only 1 card
- **Init**: Not needed (manually set CPU to 1 card)
- **Setup**: Player wins with Leveraged Buyout, CPU has 1 card in deck
- **Expected**:
  - 1 card stolen (not 2)
  - No error from trying to steal non-existent second card

#### Scenario: Opponent has no cards
- **Init**: Not needed (manually set CPU to 0 cards)
- **Setup**: Player wins with Leveraged Buyout, CPU has 0 cards in deck
- **Expected**: No effect, no errors

#### Scenario: Blocked by Tracker Smacker
- **Init**: `initializeGame('custom', 'custom', ['move-buyout', 'common-5'], ['firewall-smacker', 'common-3'])`
- **Setup**: Player plays Leveraged Buyout, CPU has Tracker Smacker active
- **Expected**: Effect doesn't trigger even if player wins

### Move: Takeover (hostile_takeover)

**Card Value**: 6
**Effect Type**: Instant
**Effect**: Instant war (Data War) ignoring trackers, blockers, and normal ties

#### Scenario: Hostile Takeover triggers war regardless of values
- **Init**: `initializeGame('custom', 'common-first', ['move-takeover'])`
- **Setup**: Player plays Hostile Takeover (value 6), CPU plays Common-2 (value 2)
- **Expected**:
  - `checkForDataWar()` returns `true` even though values different
  - State machine transitions to `data_war` state
  - Normal comparison ignored

#### Scenario: Hostile Takeover ignores trackers
- **Init**: `initializeGame('custom', 'common-first', ['tracker-3', 'move-takeover'])`
- **Setup**: Player plays Tracker-3 + Hostile Takeover (total would be 9), CPU plays Common-5
- **Expected**:
  - Tracker value ignored in comparison
  - Data War triggered based on Hostile Takeover's base value 6
  - Tracker still allows another play

#### Scenario: Hostile Takeover ignores blockers
- **Init**: `initializeGame('custom', 'common-first', ['blocker-2', 'move-takeover'])`
- **Setup**: Player plays Blocker-2 + Hostile Takeover, CPU plays Common-5
- **Expected**:
  - Blocker effect negated (opponent value not reduced)
  - Data War triggered
  - Trackers and blockers from both players ignored

#### Scenario: Hostile Takeover vs Hostile Takeover
- **Init**: `initializeGame('custom', 'custom', ['move-takeover'], ['move-takeover'])`
- **Setup**: Both players play Hostile Takeover
- **Expected**:
  - Data War triggered
  - Both cards have value 6, so war continues until different values played

#### Scenario: Hostile Takeover in Data War
- **Init**: `initializeGame('custom', 'common-first', ['common-4', 'common-4', 'common-4', 'move-takeover'])`
- **Setup**: Data War triggered, player plays Hostile Takeover as 4th card
- **Expected**: Hostile Takeover triggers another war (war continues)

### Move: Tantrum (temper_tantrum)

**Card Value**: 6
**Effect Type**: Queued
**Effect**: If lose, steal 2 cards from winner's win pile

#### Scenario: Player loses with Temper Tantrum
- **Init**: `initializeGame('custom', 'high-value-first', ['move-tantrum', 'common-2'])`
- **Setup**: Player plays Temper Tantrum (value 6), CPU plays Firewall (value 6+) and wins
- **Action**: `processPendingEffects('cpu')` called
- **Expected**:
  - First 2 cards from `cardsInPlay` moved to player's deck
  - Remaining cards in `cardsInPlay` collected by CPU
  - Player steals before CPU collects

#### Scenario: Player wins with Temper Tantrum
- **Init**: `initializeGame('custom', 'low-value-first', ['move-tantrum', 'common-5'])`
- **Setup**: Player plays Temper Tantrum and wins turn
- **Expected**: No effect (condition not met - must lose)

#### Scenario: Only 1 card in win pile
- **Init**: Not needed (manually set cardsInPlay)
- **Setup**: Player loses with Temper Tantrum, only 1 card in `cardsInPlay`
- **Expected**: Steal 1 card (not 2), no errors

#### Scenario: Tie with Temper Tantrum
- **Init**: `initializeGame('custom', 'custom', ['move-tantrum', 'common-4'], ['common-4'])`
- **Setup**: Player plays Temper Tantrum, tie occurs (Data War)
- **Expected**: Effect queued but doesn't trigger on tie

#### Scenario: Blocked by Tracker Smacker
- **Init**: `initializeGame('custom', 'custom', ['move-tantrum', 'common-2'], ['firewall-smacker', 'common-5'])`
- **Setup**: Player plays Temper Tantrum and loses, CPU has Tracker Smacker active
- **Expected**: Effect doesn't trigger

### Move: Theft (patent_theft)

**Card Value**: 6
**Effect Type**: Queued
**Effect**: If win, steal 1 Launch Stack from opponent

#### Scenario: Player wins with Patent Theft
- **Init**: `initializeGame('custom', 'launch-stack-first', ['move-theft', 'common-5'])`
- **Setup**: Player plays Patent Theft, CPU has 2 Launch Stacks
- **Action**: Player wins turn, `processPendingEffects('player')` called
- **Expected**:
  - `player.launchStackCount` increases by 1
  - `cpu.launchStackCount` decreases by 1

#### Scenario: Player loses with Patent Theft
- **Init**: `initializeGame('custom', 'high-value-first', ['move-theft', 'common-2'])`
- **Setup**: Player plays Patent Theft, CPU wins turn
- **Expected**: No effect (condition not met)

#### Scenario: Opponent has no Launch Stacks
- **Init**: `initializeGame('custom', 'common-first', ['move-theft', 'common-5'])`
- **Setup**: Player wins with Patent Theft, CPU has 0 Launch Stacks
- **Expected**: No effect, no errors

#### Scenario: Steal to trigger win
- **Init**: `initializeGame('custom', 'launch-stack-first', ['move-theft', 'common-5'])`
- **Setup**: Player has 2 Launch Stacks (manually set), plays Patent Theft and wins, steals 1 from CPU
- **Expected**:
  - `player.launchStackCount = 3`
  - `winner = 'player'`
  - `winCondition = 'launch_stacks'`

#### Scenario: Blocked by Tracker Smacker
- **Init**: `initializeGame('custom', 'custom', ['move-theft', 'common-5'], ['firewall-smacker', 'common-3'])`
- **Setup**: Player plays Patent Theft, CPU has Tracker Smacker active
- **Expected**: Effect doesn't trigger even if player wins

---

## Tracker Cards

**Card Count**: 3 unique cards (Tracker +1, +2, +3)
**Card Values**: 1, 2, 3 respectively
**Effect**: Add tracker value to turn total, play another card
**Triggers Another Play**: Yes

### Core Functionality

#### Scenario: Tracker adds to turn value
- **Init**: `initializeGame('custom', 'common-first', ['tracker-2', 'common-3'])`
- **Setup**: Player plays Tracker-2 (value 2), then Common-3 (value 3)
- **Expected**:
  - After Tracker: `anotherPlayMode = true`, `currentTurnValue = 2`, `playerTurnState = 'tracker'`
  - After Common: `anotherPlayMode = false`, `currentTurnValue = 5` (2 + 3)

#### Scenario: Multiple trackers stack
- **Init**: `initializeGame('custom', 'common-first', ['tracker-1', 'tracker-2', 'common-4'])`
- **Setup**: Player plays Tracker-1, Tracker-2, then Common-4
- **Expected**:
  - First Tracker: `currentTurnValue = 1`
  - Second Tracker: `currentTurnValue = 3` (1 + 2)
  - Common: `currentTurnValue = 7` (3 + 4)

#### Scenario: Tracker blocked by Tracker Smacker
- **Init**: `initializeGame('custom', 'custom', ['tracker-3'], ['firewall-smacker'])`
- **Setup**: Player plays Tracker-3, CPU has Tracker Smacker active
- **Expected**:
  - Tracker's value contribution negated: `player.currentTurnValue = 0`
  - Still triggers another play (but value not added)
  - `playerTurnState = 'normal'` (not 'tracker')

#### Scenario: Tracker negated by Hostile Takeover
- **Init**: `initializeGame('custom', 'custom', ['tracker-2', 'common-3'], ['move-takeover'])`
- **Setup**: Player plays Tracker-2 + Common-3 (total 5), CPU plays Hostile Takeover
- **Expected**:
  - Tracker value ignored for comparison
  - Hostile Takeover triggers Data War regardless of tracker

### Edge Cases

#### Scenario: Tracker with no cards left
- **Init**: Not needed (manually set 1 card deck)
- **Setup**: Player has 1 card (Tracker-2), plays it
- **Expected**:
  - Tracker played: `anotherPlayMode = true`
  - No second card to play (deck empty)
  - Turn value = 2 (just the tracker)

#### Scenario: Tracker + Launch Stack
- **Init**: `initializeGame('custom', 'common-first', ['tracker-2', 'ls-ai-platform'])`
- **Setup**: Player plays Tracker-2, then Launch Stack
- **Expected**:
  - First play: `currentTurnValue = 2`
  - Second play: `currentTurnValue = 2` (Launch Stack value 0, doesn't add)
  - Launch Stack collected, another play triggered
  - Third play: normal card

#### Scenario: Tracker + Blocker combo
- **Init**: `initializeGame('custom', 'common-first', ['tracker-2', 'blocker-1'])`
- **Setup**: Player plays Tracker-2 + Blocker-1
- **Expected**:
  - First: `playerTurnState = 'tracker'`, `currentTurnValue = 2`
  - Second: `cpuTurnState = 'blocker'`, opponent value reduced by 1
  - `currentTurnValue` remains 2 (blocker has 0 value)

---

## Blocker Cards

**Card Count**: 2 unique cards (Blocker -1, -2)
**Card Values**: 0 (blockers themselves have no value)
**Effect**: Subtract from opponent's turn value, play another card
**Triggers Another Play**: Yes

### Core Functionality

#### Scenario: Blocker subtracts from opponent
- **Init**: `initializeGame('custom', 'custom', ['blocker-2', 'common-3'], ['common-5'])`
- **Setup**: Player plays Blocker-2, then Common-3; CPU plays Common-5
- **Expected**:
  - After blocker: `cpuTurnState = 'blocker'`, `cpu.currentTurnValue = 3` (5 - 2)
  - After player's second card: `player.currentTurnValue = 3` (blocker 0 + common 3)
  - Turn value comparison: 3 vs 3 (tie)

#### Scenario: Blocker can't reduce below 0
- **Init**: `initializeGame('custom', 'custom', ['blocker-2'], ['common-1'])`
- **Setup**: Player plays Blocker-2, CPU plays Common-1 (value 1)
- **Expected**:
  - `cpu.currentTurnValue = 0` (not -1)
  - Blocker reduction stops at 0

#### Scenario: Multiple blockers stack
- **Init**: `initializeGame('custom', 'common-first', ['blocker-1', 'blocker-2', 'common-3'])`
- **Setup**: Player plays Blocker-1, Blocker-2, then Common-3
- **Expected**:
  - Opponent value reduced by 3 total (1 + 2)
  - Player turn value = 3 (only the common card)

#### Scenario: Blocker blocked by Tracker Smacker
- **Init**: `initializeGame('custom', 'custom', ['blocker-2'], ['firewall-smacker'])`
- **Setup**: Player plays Blocker-2, CPU has Tracker Smacker active
- **Expected**:
  - Blocker effect negated (opponent value not reduced)
  - Still triggers another play
  - `cpuTurnState = 'normal'` (not 'blocker')

#### Scenario: Blocker negated by Hostile Takeover
- **Init**: `initializeGame('custom', 'custom', ['blocker-2', 'common-4'], ['move-takeover'])`
- **Setup**: Player plays Blocker-2 + Common-4, CPU plays Hostile Takeover
- **Expected**:
  - Blocker effect ignored
  - Hostile Takeover triggers Data War

### Edge Cases

#### Scenario: Blocker + Tracker combo
- **Init**: `initializeGame('custom', 'common-first', ['blocker-1', 'tracker-2', 'common-3'])`
- **Setup**: Player plays Blocker-1 + Tracker-2 + Common-3
- **Expected**:
  - Opponent value reduced by 1
  - Player value = 5 (tracker 2 + common 3, blocker 0)
  - Both `playerTurnState = 'tracker'` and `cpuTurnState = 'blocker'`

#### Scenario: Both players play blockers
- **Init**: `initializeGame('blocker-first', 'blocker-first')`
- **Setup**: Player plays Blocker-2, CPU plays Blocker-1
- **Expected**:
  - Player's opponent (CPU) reduced (but blocker has 0 value, so net = 0)
  - CPU's opponent (player) reduced (but blocker has 0 value, so net = 0)
  - Both play second cards
  - Values compared based on second cards

---

## Data Grab

**Card Count**: 3 cards
**Card Value**: 0
**Effect Type**: Queued
**Effect**: Randomly distribute all cards in play between both players

### Core Functionality

#### Scenario: Basic data grab distribution
- **Init**: `initializeGame('custom', 'special-first', ['data-grab', 'common-5', 'common-4'])`
- **Setup**: 8 cards in play (4 common + special effects), player plays Data Grab and wins
- **Action**: `processPendingEffects('player')` called
- **Expected**:
  - All cards in `cardsInPlay` shuffled randomly
  - Cards split alternating: even indices to player, odd to CPU (or vice versa)
  - `cardsInPlay = []` after distribution
  - Both players receive roughly equal cards

#### Scenario: Odd number of cards
- **Init**: `initializeGame('custom', 'common-first', ['data-grab', 'common-3', 'common-2'])`
- **Setup**: 5 cards in play, Data Grab played
- **Expected**:
  - One player gets 3 cards, other gets 2
  - Distribution is random

#### Scenario: Data Grab with 2 cards
- **Init**: `initializeGame('custom', 'custom', ['data-grab'], ['common-3'])`
- **Setup**: Only 2 cards in play, Data Grab played
- **Expected**:
  - Each player gets 1 card
  - No winner takes all

#### Scenario: Data Grab doesn't care about winner
- **Init**: `initializeGame('custom', 'high-value-first', ['data-grab', 'common-2'])`
- **Setup**: Player plays Data Grab and loses turn
- **Expected**: Data Grab still distributes cards randomly (no winner condition)

#### Scenario: Multiple Data Grabs in turn
- **Init**: `initializeGame('custom', 'custom', ['data-grab'], ['data-grab'])`
- **Setup**: Both players play Data Grab
- **Expected**:
  - Both effects processed in order
  - First Data Grab distributes cards
  - Second Data Grab has no cards to distribute (already distributed)

---

## Card Interactions

### Complex Combos

#### Scenario: Tracker + Tracker + Blocker
- **Init**: `initializeGame('custom', 'common-first', ['tracker-2', 'tracker-1', 'blocker-2', 'common-3'])`
- **Setup**: Player plays Tracker-2, Tracker-1, Blocker-2, then Common-3
- **Expected**:
  - Player value = 6 (tracker 2 + tracker 1 + blocker 0 + common 3)
  - Opponent value reduced by 2

#### Scenario: Launch Stack + Tracker + Common
- **Init**: `initializeGame('custom', 'common-first', ['ls-ai-platform', 'tracker-3', 'common-4'])`
- **Setup**: Player plays Launch Stack (collect), then Tracker-3, then Common-4
- **Expected**:
  - Launch Stack collected (count +1), triggers another play
  - Tracker adds to value (3), triggers another play
  - Common card played (value 4)
  - Final turn value = 7 (3 + 4)

#### Scenario: Forced Empathy + OWYW
- **Init**: `initializeGame('custom', 'common-first', ['firewall-empathy', 'firewall-open'])`
- **Setup**: Player plays Forced Empathy, then OWYW in same turn
- **Expected**:
  - Decks swap immediately
  - OWYW queued for next turn
  - On next turn, player sees top 3 from their NEW deck (was CPU's)

#### Scenario: Mandatory Recall + Patent Theft
- **Init**: `initializeGame('custom', 'launch-stack-first', ['firewall-recall', 'move-theft', 'common-5'])`
- **Setup**: Player plays both, CPU has 2 Launch Stacks, player wins
- **Expected**:
  - Mandatory Recall: CPU loses all Launch Stacks (shuffled into deck)
  - Patent Theft: No effect (CPU has 0 Launch Stacks now)

#### Scenario: Temper Tantrum + Leveraged Buyout
- **Init**: `initializeGame('custom', 'custom', ['move-tantrum', 'common-2'], ['move-buyout', 'common-5'])`
- **Setup**: Player plays Temper Tantrum, CPU plays Leveraged Buyout, CPU wins
- **Expected**:
  - CPU collects Leveraged Buyout (steals 2 from player deck)
  - Player's Temper Tantrum triggers (steals 2 from win pile)
  - Net: cards redistributed

### Tracker Smacker Interactions

#### Scenario: Tracker Smacker vs multiple effects
- **Init**: `initializeGame('custom', 'custom', ['tracker-2', 'blocker-1', 'move-theft'], ['firewall-smacker'])`
- **Setup**: Player plays Tracker-2 + Blocker-1 + Patent Theft, CPU plays Tracker Smacker
- **Expected**:
  - Tracker negated (value not added)
  - Blocker negated (opponent value not reduced)
  - Patent Theft blocked (even if player wins)

#### Scenario: Tracker Smacker vs Hostile Takeover
- **Init**: `initializeGame('custom', 'custom', ['tracker-3', 'move-takeover'], ['firewall-smacker'])`
- **Setup**: Player plays Tracker-3 + Hostile Takeover, CPU plays Tracker Smacker
- **Expected**:
  - Tracker value ignored by Hostile Takeover anyway (instant effect)
  - Hostile Takeover triggers war
  - Tracker Smacker has no effect on Hostile Takeover

#### Scenario: Tracker Smacker late in turn
- **Init**: `initializeGame('custom', 'custom', ['tracker-2', 'common-3'], ['common-4', 'firewall-smacker'])`
- **Setup**: Player plays Tracker-2 first, CPU plays Tracker Smacker second
- **Expected**:
  - When Tracker Smacker activates, it immediately recalculates values
  - Player's tracker value retroactively negated
  - `player.currentTurnValue` reset to 0

### Hostile Takeover Interactions

#### Scenario: Hostile Takeover + Tracker ignored
- **Init**: `initializeGame('custom', 'custom', ['tracker-3', 'move-takeover'], ['common-4'])`
- **Setup**: Player plays Tracker-3 + Hostile Takeover, CPU plays Common-4
- **Expected**:
  - Tracker value (3) not added for comparison
  - Hostile Takeover base value (6) compared
  - Data War triggered
  - Tracker still allows another play

#### Scenario: Hostile Takeover + Blocker ignored
- **Init**: `initializeGame('custom', 'custom', ['blocker-2', 'move-takeover'], ['common-5'])`
- **Setup**: Player plays Blocker-2 + Hostile Takeover, CPU plays Common-5
- **Expected**:
  - Blocker doesn't reduce opponent value
  - Hostile Takeover triggers war
  - Blockers ignored entirely

#### Scenario: Hostile Takeover after multiple data wars (complex)
- **Init**:
```typescript
initializeGame(
  'custom',
  'custom',
  [
    'ls-ai-platform',
    'common-3',
    'move-tantrum',
    'tracker-1',
    'tracker-2',
    'tracker-3',
    'common-2',
    'move-theft',
    'data-grab',
    'data-grab',
    'common-4',
  ],
  [
    'ls-government',
    'common-1',
    'firewall-recall',
    'blocker-1',
    'blocker-2',
    'move-buyout',
    'common-2',
    'ls-newspaper',
    'ls-energy-grid',
    'ls-rocket-company',
    'move-takeover',
  ],
);
```
- **Setup**: High complexity scenario with multiple data wars and special effect cards. CPU plays Hostile Takeover as face-up card after 2+ data wars.
- **Expected**:
  - HT triggers one-sided data war regardless of previous data war count
  - No data war animation plays (instant effect)
  - CPU auto-plays data war cards (player clicks manually)
  - All trackers/blockers ignored during HT data war
  - HT player wins all data war cards automatically

---

## Data War Scenarios

### Basic Data War

#### Scenario: Equal values trigger war
- **Init**: `initializeGame()` (random, then manually set equal cards)
- **Setup**: Player plays Common-4, CPU plays Common-4
- **Expected**:
  - `checkForDataWar()` returns `true`
  - State machine transitions to `data_war.animating`
  - "DATA WAR!" animation shows for 2 seconds

#### Scenario: Data War card sequence
- **Init**: `initializeGame()` (random)
- **Setup**: Data War triggered
- **Expected**:
  1. Both players play 3 cards face down (prompts user to tap deck 3 times)
  2. Both players play 1 card face up
  3. Values compared
  4. Winner collects all 10 cards (2 + 3 + 3 + 1 + 1)

#### Scenario: Data War tie continues
- **Init**: `initializeGame('common-first', 'common-first')`
- **Setup**: Data War triggered, final face-up cards are equal (Common-3 vs Common-3)
- **Expected**:
  - Another Data War triggered
  - Process repeats

#### Scenario: Data War with special effects
- **Init**: `initializeGame('custom', 'common-first', ['common-3', 'common-3', 'common-3', 'tracker-2'])`
- **Setup**: Data War triggered, player's face-up card is Tracker-2
- **Expected**:
  - Tracker allows another play during war
  - Tracker value adds to war total
  - Winner determined after all plays

### Edge Cases

#### Scenario: Data War with insufficient cards
- **Init**: Not needed (manually set to 2 cards)
- **Setup**: Player has only 2 cards left, Data War triggered
- **Expected**:
  - Player plays all remaining cards
  - If runs out before completing war sequence, player loses

#### Scenario: Hostile Takeover in Data War
- **Init**: `initializeGame('custom', 'common-first', ['common-4', 'common-4', 'common-4', 'move-takeover'])`
- **Setup**: Data War triggered, player plays Hostile Takeover as face-up card
- **Expected**:
  - Another war triggered immediately
  - Process continues until different values

---

## Win Conditions

### All Cards Win

#### Scenario: Player collects all cards
- **Init**: Not needed (manually set state)
- **Setup**: CPU has 0 cards in deck, 0 played card, 0 Launch Stacks
- **Action**: `checkWinCondition()`
- **Expected**:
  - `winner = 'player'`
  - `winCondition = 'all_cards'`
  - Game ends

#### Scenario: CPU collects all cards
- **Init**: Not needed (manually set state)
- **Setup**: Player has 0 cards in deck, 0 played card, 0 Launch Stacks
- **Action**: `checkWinCondition()`
- **Expected**:
  - `winner = 'cpu'`
  - `winCondition = 'all_cards'`
  - Game ends

#### Scenario: Launch Stacks count as cards
- **Init**: Not needed (manually set state)
- **Setup**: Player has 0 cards in deck, 0 played card, but has 2 Launch Stacks collected
- **Action**: `checkWinCondition()`
- **Expected**: Player has NOT won (Launch Stacks count towards total cards)

### Launch Stack Win

#### Scenario: Player gets 3rd Launch Stack
- **Init**: `initializeGame('launch-stack-first', 'common-first')`
- **Setup**: Player has 2 Launch Stacks (manually set), collects 3rd
- **Action**: `addLaunchStack('player')`
- **Expected**:
  - `winner = 'player'`
  - `winCondition = 'launch_stacks'`
  - Game ends immediately (doesn't wait for turn to complete)

#### Scenario: Patent Theft triggers win
- **Init**: `initializeGame('custom', 'launch-stack-first', ['move-theft', 'common-5'])`
- **Setup**: Player has 2 Launch Stacks (manually set), plays Patent Theft, wins turn, steals 1 from CPU
- **Expected**:
  - `player.launchStackCount = 3`
  - `winner = 'player'`
  - `winCondition = 'launch_stacks'`

#### Scenario: Mandatory Recall prevents win
- **Init**: `initializeGame('custom', 'launch-stack-first', ['firewall-recall', 'common-5'])`
- **Setup**: CPU has 3 Launch Stacks (manually set), player plays Mandatory Recall and wins
- **Expected**:
  - CPU's Launch Stacks returned to deck
  - `cpu.launchStackCount = 0`
  - CPU does not win (lost all stacks)

---

## Edge Cases

### Empty Deck Scenarios

#### Scenario: Play card with empty deck
- **Init**: Not needed (manually set empty deck)
- **Setup**: Player has 0 cards in deck
- **Action**: `playCard('player')`
- **Expected**: No crash, error logged in dev mode

#### Scenario: Win condition checked before play
- **Init**: Not needed (manually set 1 card each)
- **Setup**: Player has 1 card left, CPU has 0 cards
- **Expected**: Win condition checked and game ends before playing final card

### State Machine Edge Cases

#### Scenario: Reset game mid-turn
- **Init**: `initializeGame()`
- **Action**: `send({ type: 'RESET_GAME' })`
- **Expected**:
  - All state reset
  - Machine returns to `welcome` state
  - Zustand store reset

#### Scenario: Quit game during Data War
- **Init**: `initializeGame()`
- **Setup**: Data War in progress
- **Action**: `send({ type: 'QUIT_GAME' })`
- **Expected**:
  - Machine returns to `welcome` state
  - Game state preserved (can resume)

### Special Effect Edge Cases

#### Scenario: Effect processed after player eliminated
- **Init**: Not needed (manually set)
- **Setup**: Player has 0 cards, Leveraged Buyout effect pending
- **Expected**: No crash, effect skipped gracefully

#### Scenario: Multiple pre-reveal effects queued
- **Init**: `initializeGame('custom', 'common-first', ['firewall-open', 'firewall-open'])`
- **Setup**: Player plays 2 OWYW cards and wins both turns
- **Expected**:
  - First OWYW processed on next turn
  - Second OWYW processed on turn after that
  - Effects processed in order

#### Scenario: Pre-reveal effect with empty deck
- **Init**: Not needed (manually set 2 cards)
- **Setup**: Player has 2 cards left, OWYW active
- **Expected**: Show 2 cards instead of 3, allow selection

### UI State Edge Cases

#### Scenario: Pause during special effect animation
- **Init**: `initializeGame('custom', 'common-first', ['firewall-empathy'])`
- **Action**: Pause game during Forced Empathy swap animation
- **Expected**:
  - Animation pauses
  - State preserved
  - Resume continues animation

#### Scenario: Open hand viewer during opponent turn
- **Init**: `initializeGame()`
- **Action**: Open CPU hand viewer while CPU is playing
- **Expected**:
  - Game pauses
  - Hand viewer shows current state
  - Close to resume

---

## Test Coverage Checklist

Use this checklist to ensure comprehensive test coverage:

### Basic Mechanics
- [ ] Play card from deck
- [ ] Collect cards after turn
- [ ] Turn value calculation
- [ ] Win condition checks
- [ ] Data War trigger
- [ ] Another play mode

### Launch Stack Cards (5 cards)
- [ ] Collect Launch Stack
- [ ] Trigger another play
- [ ] Win with 3 stacks
- [ ] Launch Stack removed from cards in play
- [ ] Launch Stack vs Launch Stack

### Firewall Cards (4 cards)
- [ ] Forced Empathy deck swap
- [ ] OWYW player interaction
- [ ] OWYW CPU auto-select
- [ ] Mandatory Recall on win
- [ ] Tracker Smacker blocks effects

### Move Cards (4 cards)
- [ ] Leveraged Buyout steal on win
- [ ] Hostile Takeover triggers war
- [ ] Temper Tantrum steal on loss
- [ ] Patent Theft steal Launch Stack

### Tracker Cards (3 cards)
- [ ] Tracker adds to value
- [ ] Tracker triggers another play
- [ ] Multiple trackers stack
- [ ] Tracker blocked by Tracker Smacker

### Blocker Cards (2 cards)
- [ ] Blocker subtracts from opponent
- [ ] Blocker triggers another play
- [ ] Blocker can't go below 0
- [ ] Blocker blocked by Tracker Smacker

### Data Grab (3 cards)
- [ ] Random distribution
- [ ] Odd number of cards
- [ ] Both players play Data Grab

### Interactions
- [ ] Tracker + Tracker + Blocker
- [ ] Hostile Takeover + Trackers/Blockers
- [ ] Tracker Smacker + multiple effects
- [ ] Forced Empathy + OWYW
- [ ] Mandatory Recall + Patent Theft
- [ ] Temper Tantrum + Leveraged Buyout

### Edge Cases
- [ ] Empty deck handling
- [ ] Insufficient cards for Data War
- [ ] Reset during game
- [ ] Pre-reveal with empty deck
- [ ] Multiple pre-reveal effects
- [ ] Effect with eliminated player

---

## Quick Reference: initializeGame Strategies

| Strategy | Description | Common Use Cases |
|----------|-------------|------------------|
| `'random'` | Standard shuffle | Production games, general testing |
| `'tracker-first'` | Trackers at top | Test tracker mechanics |
| `'firewall-first'` | Firewalls at top | Test firewall effects |
| `'move-first'` | Moves at top | Test move card effects |
| `'blocker-first'` | Blockers at top | Test blocker mechanics |
| `'launch-stack-first'` | Launch stacks at top | Test win condition |
| `'special-first'` | All specials at top | Test special interactions |
| `'common-first'` | Commons at top | Baseline comparisons |
| `'high-value-first'` | High values first | Test player advantage |
| `'low-value-first'` | Low values first | Test CPU advantage |
| `'owyw-first'` | OWYW at top | Test OWYW specifically |
| `'custom'` | Exact order via array | Precise test scenarios |

**Example Custom Order**:
```typescript
initializeGame(
  'custom',
  'common-first',
  ['tracker-3', 'firewall-empathy', 'common-5'],  // Player gets these first
  undefined                                        // CPU uses common-first
);
```

---

**Total Special Effect Cards**: 20 unique special cards (17 types of effects)
**Total Test Scenarios**: 120+ scenarios
**Current Test Coverage**: ~30% (basic mechanics + some special effects)
**Target Test Coverage**: 100% of special effects + all interactions
