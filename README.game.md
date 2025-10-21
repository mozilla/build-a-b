# Data War - Game Design Document

A digital card game based on the classic "War" card game, themed around billionaires and data privacy for Mozilla's "Open What You Want" campaign.

## Table of Contents

- [Game Overview](#game-overview)
- [Game Rules](#game-rules)
- [Card Types](#card-types)
- [Win Conditions](#win-conditions)
- [Game Components](#game-components)
- [Technical Architecture](#technical-architecture)
- [Timeline & Scope](#timeline--scope)

---

## Game Overview

**Data War** is a mobile-first, single-player card game where players compete against a CPU opponent. The game is a variation of the traditional "War" card game with special cards and unique mechanics centered around collecting "launch stacks" to send a billionaire to space.

### Core Gameplay Loop

1. Players choose a billionaire character and background
2. Each turn, both player and CPU reveal a card
3. Higher card value wins the round and takes both cards
4. Special cards trigger unique effects
5. Win by either collecting all cards (~74) OR collecting 3 launch stacks

---

## Game Rules

### Basic Mechanics

- **Card Comparison**: Each turn, both players reveal a card. The higher number (1-5) wins both cards.
- **Deck Management**: Cards won are added to the winner's deck. The game tracks total cards in each player's possession.
- **Turn System**: Player vs CPU, with turns alternating automatically.
- **Ties**: When cards have equal value, additional cards are laid out (similar to traditional "War").

### Special Card Effects

Special cards (tracker cards) trigger unique effects when played:

1. **Play Again**: Player immediately draws and plays another card (rapid succession)
2. **Point Subtraction**: Subtracts 1 point from opponent's play value for that turn
3. **Forced Empathy**: Instant effect - swaps entire card decks between player and opponent
4. **Launch Stack**: Special win condition card (collect 3 to win)

### Visual Feedback

- **Tooltips + Pulses**: Guide users on what to do next
- **Turn Values**: Displayed for both player and opponent
- **Card Counters**: Show number of cards in each deck
- **Animations**: Card flipping, special effects, launch sequences

---

## Card Types

### 1. Common Data Cards
- **Values**: 1-5
- **Function**: Basic numbered cards for value comparison
- **Quantity**: Most of the deck (~74 total cards estimated)

### 2. Tracker Cards (Special Effect Cards)
- **Visual Indicator**: Tooltip prompts user to click for effect details
- **Effect Modal**: Pop-up shows cards played and explains the special effect
- **Types**:
  - **Play Again Card**: Allows immediate additional card play
  - **Point Subtraction Card**: Reduces opponent's turn value by 1
  - **Forced Empathy Card**: Instant deck swap
  - **Launch Stack Card**: Contributes to alternate win condition

---

## Win Conditions

Players can win the game in **two ways**:

### 1. Collect All Cards
- Traditional "War" win condition
- Acquire all ~74 cards from opponent
- Triggers victory animation and billionaire launch sequence

### 2. Collect 3 Launch Stacks
- Special win condition unique to Data War
- Play 3 "Launch Stack" cards throughout the game
- Each launch stack card's icon flies into the launch stack indicator
- Triggers victory animation and billionaire launch sequence

### Victory Sequence
1. Billionaire character animation flying to space
2. End screen with options:
   - Share with friends
   - Play again
   - Quit
3. Call-to-action to download Firefox browser

---

## Game Components

The game consists of four major component systems:

### 1. Setup & Instructions

**Initial User Experience:**
- **Character Selection**: Choose billionaire character (e.g., Savannah Blair)
- **Background Selection**: Choose visual theme (e.g., asteroids background)
- **Quick-Start Guide**:
  - Available before and during gameplay
  - "One, two, three. Deal me in" section
  - Explains win conditions and basic rules
  - Accessible via pause menu

**UI Elements:**
- Pause button
- Menu (contains quick-start guide, audio toggle, background change)
- Tooltips for guidance

### 2. Game Board (Tableau)

**Main Play Area Components:**
- **Billionaire Icon**: Player's chosen character
- **Launch Stack Indicators**: Shows progress toward 3 launch stacks (0/3, 1/3, 2/3, 3/3)
- **Player Deck Area**:
  - Card deck (face down)
  - Played card area (face up)
  - Card counter
- **Opponent Deck Area**:
  - CPU's card deck (face down)
  - CPU's played card area (face up)
  - Card counter
- **Turn Value Displays**: Shows current turn values for both players
- **Effect Modals**: Pop-ups for special card explanations

### 3. Cards System

**Card Rendering:**
- Front face design (shows value 1-5)
- Back face design (consistent design for all cards)
- Special card indicators (tracker cards)
- Card flip animations

**Card States:**
- In deck (face down)
- Revealed (face up)
- In play (comparison state)
- Won (moving to winner's deck)

**Card Management:**
- Track cards in each player's deck/hand
- Shuffle mechanics
- Deal mechanics
- Win pile management

### 4. Game Logic

**Core Systems:**

**Turn Management:**
- Track whose turn it is
- Handle card reveals (player + CPU)
- Compare card values
- Determine round winner
- Update card counts

**Special Card Logic:**
- Detect tracker cards
- Trigger appropriate effects:
  - Play Again: Allow immediate next draw
  - Point Subtraction: Modify turn value calculation
  - Forced Empathy: Swap deck references
  - Launch Stack: Increment launch counter + animation
- Handle effect animations and modals

**Win Condition Checking:**
- Monitor total cards in each deck (win at ~74)
- Monitor launch stack count (win at 3)
- Trigger victory sequence when condition met

**CPU AI:**
- Simple automated card flipping (no complex decision-making)
- Triggers card reveals automatically
- No strategic AI required for MVP

**Animation Orchestration:**
- Card flip sequences (CSS-based)
- Special effect animations (potentially Lottie files)
- Launch stack icon animations
- Victory/space launch sequence
- Timing coordination between events

---

## Technical Architecture

### Rendering Location

The game is rendered at the `/game` route of the main Mozilla "Billionaire Blast-Off" microsite:

- **URL Path**: `https://yourdomain.com/game`
- **Architecture**: Separate Vite/React SPA embedded within the Next.js application
- **Isolation**: Runs as an independent React application (separate from Next.js React instance)
- **Serving**: Static files served from Next.js public directory at `/assets/game/`
- **Routing**: Next.js middleware (in `apps/web/src/middleware.ts`) handles URL rewrites from `/game` to `/assets/game/index.html`

### Development Environment

- **Local Dev**: Standalone Vite dev server at `http://localhost:5173`
- **Production**: Automatically built and embedded during Next.js build process
- **Platform**: Mobile-first design (desktop shows phone screen with background)

### Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite with Rolldown (high-performance bundler)
- **Styling**: Tailwind CSS v4
- **Animations**:
  - CSS for card interactions and simple effects
  - Potentially Lottie files for complex animations (rocket launch, etc.)
- **Game Logic**: Pure JavaScript/TypeScript (client-side only)

### Implementation Approach

**Modular Event System:**
- Break down into individual "events" or actions:
  - Click and reveal cards
  - Compare values
  - Transfer cards
  - Trigger special effects
  - Update UI counters
- Link events together to form game flow

**State Management:**
- Track player deck
- Track CPU deck
- Track launch stack count
- Track current turn state
- Track special effect states

**No Server-Side Logic:**
- Fully client-side implementation
- No stats tracking or persistence (MVP)
- No anti-cheat concerns (no awards/incentives)
- No multiplayer for MVP

---

## Timeline & Scope

### MVP Deliverable (November 20, 2025)

**In Scope:**
- ✅ Player vs CPU gameplay
- ✅ Mobile-only design
- ✅ All card types and special effects
- ✅ Both win conditions
- ✅ Character and background selection
- ✅ Quick-start guide/instructions
- ✅ Core animations (card flips, special effects, victory sequence)
- ✅ Audio toggle
- ✅ Share functionality
- ✅ Firefox CTA

**Out of Scope (MVP):**
- ❌ Multiplayer functionality (future consideration for 2026)
- ❌ Desktop-specific layout (phone screen on desktop only)
- ❌ Stats tracking
- ❌ User accounts/persistence
- ❌ Leaderboards

### UAT Timeline
- UAT start: ~1 week before November 20
- Final delivery: Ideally November 18 (before Thanksgiving)

### Asset Delivery
- Design team provides Lottie files for animations
- Plug-and-play approach for animations
- Assets delivered in tandem with development

---

## Design System

- Design housed in working Figma file
- Includes all card types
- Includes all backgrounds
- Includes prototyping details
- Lottie file animations for complex sequences
- CSS animations for simple interactions

---

## Future Considerations

**Multiplayer (2026 Potential):**
- Would require separate investment
- Depends on interest generated at Twitchcon
- Depends on microsite performance
- Would need server-side implementation
- Currently outside budget and scope

**Platform Expansion:**
- Current: Mobile-only
- Potential: Full desktop layouts (future)

---

## Development Notes

- Game instructions should contain all card type details
- Animations for end sequences still in progress
- Basic card flipping mechanics are finalized
- ~6 additional cards being designed with animations
- Focus on rapid iteration and modular development
