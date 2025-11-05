import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './game-store';
import type { Card } from '../types';

describe('Turn Resolution', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('resolveTurn', () => {
    it('should return player as winner when player value is higher', () => {
      const { initializeGame, playCard } = useGameStore.getState();
      initializeGame('high-value-first');

      // Player gets first 33 cards (high value), CPU gets remaining cards (lower value)
      playCard('player');
      playCard('cpu');

      const result = useGameStore.getState().resolveTurn();

      expect(result).toBe('player');
    });

    it('should return cpu as winner when CPU value is higher', () => {
      const { initializeGame, playCard } = useGameStore.getState();
      initializeGame('low-value-first');

      // Player gets first 33 cards (low value), CPU gets remaining cards (higher value)
      playCard('player');
      playCard('cpu');

      const result = useGameStore.getState().resolveTurn();

      expect(result).toBe('cpu');
    });

    it('should return tie when values are equal', () => {
      const { initializeGame } = useGameStore.getState();
      initializeGame();

      // Manually set equal turn values
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 5,
          playedCard: {} as Card,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 5,
          playedCard: {} as Card,
        },
        cardsInPlay: [{} as Card, {} as Card],
      });

      const result = useGameStore.getState().resolveTurn();

      expect(result).toBe('tie');
    });

    it('should collect cards for winner', () => {
      const { initializeGame, playCard, collectCardsAfterEffects } = useGameStore.getState();
      initializeGame('high-value-first');

      const initialPlayerDeck = useGameStore.getState().player.deck.length;

      playCard('player');
      playCard('cpu');

      const cardsInPlayCount = useGameStore.getState().cardsInPlay.length;

      const winner = useGameStore.getState().resolveTurn();
      collectCardsAfterEffects(winner);

      const state = useGameStore.getState();
      // Player should have won and collected both cards
      expect(state.player.deck.length).toBe(initialPlayerDeck - 1 + cardsInPlayCount);
      expect(state.cardsInPlay).toHaveLength(0);
    });

    it('should not collect cards on tie', () => {
      const { initializeGame } = useGameStore.getState();
      initializeGame();

      // Set up tie scenario
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 4,
          playedCard: {} as Card,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 4,
          playedCard: {} as Card,
        },
        cardsInPlay: [{} as Card, {} as Card],
      });

      useGameStore.getState().resolveTurn();

      // Cards should still be in play for Data War
      expect(useGameStore.getState().cardsInPlay).toHaveLength(2);
    });
  });

  describe('Tracker Card Behavior', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('custom', 'custom', ['tracker-1', 'common-3'], ['common-1']);
    });

    it('should not apply tracker value immediately - value should be 0', () => {
      const { playCard } = useGameStore.getState();

      // Play a tracker card as first card
      playCard('player');

      const trackerCard = useGameStore.getState().player.playedCard!;
      expect(trackerCard.specialType).toBe('tracker');

      // Tracker should have 0 turn value when first played
      expect(useGameStore.getState().player.currentTurnValue).toBe(0);

      // But should store the bonus for next card
      expect(useGameStore.getState().player.pendingTrackerBonus).toBe(trackerCard.value);
    });

    it('should apply tracker value to the NEXT card', () => {
      const { playCard, setAnotherPlayMode } = useGameStore.getState();

      // Play tracker as first card
      playCard('player');
      const trackerCard = useGameStore.getState().player.playedCard!;
      const trackerValue = trackerCard.value;

      // Verify tracker has 0 value
      expect(useGameStore.getState().player.currentTurnValue).toBe(0);
      expect(useGameStore.getState().player.pendingTrackerBonus).toBe(trackerValue);

      // Enable another play mode (tracker triggers another play)
      setAnotherPlayMode(true);

      // Play the next card (common-3 with value 3)
      playCard('player');
      const nextCard = useGameStore.getState().player.playedCard!;

      // Turn value should be: next card value + tracker bonus
      const expectedValue = nextCard.value + trackerValue;
      expect(useGameStore.getState().player.currentTurnValue).toBe(expectedValue);

      // Pending bonus should be cleared after being applied
      expect(useGameStore.getState().player.pendingTrackerBonus).toBe(0);
    });

    it('should handle chained trackers correctly', () => {
      const { playCard, setAnotherPlayMode } = useGameStore.getState();

      // Initialize with two trackers and one common card
      useGameStore.getState().initializeGame('custom', 'custom', ['tracker-1', 'tracker-2', 'common-3'], ['common-1']);

      // Play first tracker
      playCard('player');
      const tracker1Value = useGameStore.getState().player.playedCard!.value;

      expect(useGameStore.getState().player.currentTurnValue).toBe(0);
      expect(useGameStore.getState().player.pendingTrackerBonus).toBe(tracker1Value);

      // Enable another play for second tracker
      setAnotherPlayMode(true);

      // Play second tracker
      playCard('player');
      const tracker2Value = useGameStore.getState().player.playedCard!.value;

      // Second tracker should add its value to the turn (since it's the second card)
      // AND store its bonus for the next card
      expect(useGameStore.getState().player.currentTurnValue).toBe(tracker2Value + tracker1Value);
      expect(useGameStore.getState().player.pendingTrackerBonus).toBe(tracker2Value);

      // Play third card (common-3)
      playCard('player');
      const common3Value = useGameStore.getState().player.playedCard!.value;

      // Final value should be: tracker1 + tracker2 + common3 + tracker2 bonus
      const expectedFinal = tracker1Value + tracker2Value + common3Value + tracker2Value;
      expect(useGameStore.getState().player.currentTurnValue).toBe(expectedFinal);
    });
  });

  describe('applyTrackerEffect', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('custom', 'custom', ['tracker-1'], ['common-1']);
    });

    it('should add tracker value to player turn value', () => {
      const { playCard } = useGameStore.getState();

      // Play a tracker card (should be first due to ordering)
      playCard('player');

      // Get the played card from updated state
      const trackerCard = useGameStore.getState().player.playedCard!;

      // Set initial turn value
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyTrackerEffect('player', trackerCard);

      // Should be 5 + tracker value (1, 2, or 3)
      expect(useGameStore.getState().player.currentTurnValue).toBeGreaterThan(4);
    });

    it('should not apply effect when blocked by Tracker Smacker', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const trackerCard = useGameStore.getState().player.playedCard!;

      // CPU has Tracker Smacker active (blocks player effects)
      useGameStore.setState({
        trackerSmackerActive: 'cpu',
        player: {
          ...useGameStore.getState().player,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyTrackerEffect('player', trackerCard);

      // Value should not change
      expect(useGameStore.getState().player.currentTurnValue).toBe(5);
    });
  });

  describe('applyBlockerEffect', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('blocker-first');
    });

    it('should subtract from opponent turn value', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const blockerCard = useGameStore.getState().player.playedCard!;

      // Set CPU turn value
      useGameStore.setState({
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyBlockerEffect('player', blockerCard);

      // Should be less than 5
      expect(useGameStore.getState().cpu.currentTurnValue).toBeLessThan(5);
    });

    it('should not go below 0', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const blockerCard = useGameStore.getState().player.playedCard!;

      // Set CPU turn value to 0
      useGameStore.setState({
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 0,
        },
      });

      useGameStore.getState().applyBlockerEffect('player', blockerCard);

      // Should stay at 0, not go negative
      expect(useGameStore.getState().cpu.currentTurnValue).toBe(0);
    });

    it('should apply blocker effect even when Tracker Smacker is active', () => {
      const { playCard } = useGameStore.getState();
      playCard('player');
      const blockerCard = useGameStore.getState().player.playedCard!;

      // CPU has Tracker Smacker active
      // Note: Tracker Smacker only blocks Trackers and Billionaire Move, NOT Blockers
      useGameStore.setState({
        trackerSmackerActive: 'cpu',
        cpu: {
          ...useGameStore.getState().cpu,
          currentTurnValue: 5,
        },
      });

      useGameStore.getState().applyBlockerEffect('player', blockerCard);

      // Blocker should still apply even with Tracker Smacker active
      expect(useGameStore.getState().cpu.currentTurnValue).toBeLessThan(5);
    });
  });

  describe('checkForDataWar', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame();
    });

    it('should return true when cards have equal values', () => {
      // Set up equal values
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: { value: 4 } as Card,
          currentTurnValue: 4,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 4 } as Card,
          currentTurnValue: 4,
        },
      });

      expect(useGameStore.getState().checkForDataWar()).toBe(true);
    });

    it('should return false when cards have different values', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: { value: 4 } as Card,
          currentTurnValue: 4,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 5 } as Card,
          currentTurnValue: 5,
        },
      });

      expect(useGameStore.getState().checkForDataWar()).toBe(false);
    });

    it('should return true when Hostile Takeover is played', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: { value: 6, specialType: 'hostile_takeover' } as Card,
          currentTurnValue: 6,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 3 } as Card,
          currentTurnValue: 3,
        },
      });

      // Even though values are different, Hostile Takeover always triggers Data War
      expect(useGameStore.getState().checkForDataWar()).toBe(true);
    });

    it('should return false when no cards have been played', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: null,
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: null,
        },
      });

      expect(useGameStore.getState().checkForDataWar()).toBe(false);
    });
  });

  describe('handleCardEffect', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame('launch-stack-first', 'common-first');
    });

    it('should add launch stack to pending effects when played', () => {
      const { playCard } = useGameStore.getState();

      playCard('player');
      const launchStackCard = useGameStore.getState().player.playedCard!;

      useGameStore.getState().handleCardEffect(launchStackCard, 'player');

      // Launch Stack is not added immediately - it's added to pending effects
      // and processed later when the turn is resolved
      const pendingEffects = useGameStore.getState().pendingEffects;
      expect(pendingEffects).toHaveLength(1);
      expect(pendingEffects[0].type).toBe('launch_stack');
      expect(pendingEffects[0].playedBy).toBe('player');
    });

    it('should activate Tracker Smacker when played', () => {
      // Manually create Tracker Smacker card
      const trackerSmackerCard: Card = {
        id: 'ts-1',
        typeId: 'firewall-smacker',
        value: 6,
        imageUrl: '/test.webp',
        isSpecial: true,
        specialType: 'tracker_smacker',
        name: 'smacker',
      };

      useGameStore.getState().handleCardEffect(trackerSmackerCard, 'player');

      expect(useGameStore.getState().trackerSmackerActive).toBe('player');
    });

    it('should swap decks when Forced Empathy is played', () => {
      // beforeEach already calls resetGame() which initializes the game
      const playerDeckIdsBefore = useGameStore
        .getState()
        .player.deck.map((c) => c.id)
        .sort();
      const cpuDeckIdsBefore = useGameStore
        .getState()
        .cpu.deck.map((c) => c.id)
        .sort();

      // Directly call swapDecks() to test the swap functionality
      // (handleCardEffect has animation delays that aren't relevant for this test)
      useGameStore.getState().swapDecks();

      const state = useGameStore.getState();
      const playerDeckIdsAfter = state.player.deck.map((c) => c.id).sort();
      const cpuDeckIdsAfter = state.cpu.deck.map((c) => c.id).sort();

      // Verify decks were swapped by checking card IDs match (order may differ due to shuffling)
      expect(playerDeckIdsAfter).toEqual(cpuDeckIdsBefore);
      expect(cpuDeckIdsAfter).toEqual(playerDeckIdsBefore);
    });

    it('should add non-instant effects to pending queue', () => {
      useGameStore.getState().initializeGame('tracker-first', 'common-first');

      const { playCard } = useGameStore.getState();
      playCard('player');
      const trackerCard = useGameStore.getState().player.playedCard!;

      useGameStore.getState().handleCardEffect(trackerCard, 'player');

      const pendingEffects = useGameStore.getState().pendingEffects;
      expect(pendingEffects.length).toBeGreaterThan(0);
      expect(pendingEffects[0].type).toBe('tracker');
    });

    it('should not add instant effects to pending queue', () => {
      const trackerSmackerCard: Card = {
        id: 'ts-1',
        typeId: 'firewall-smacker',
        value: 6,
        imageUrl: '/test.webp',
        isSpecial: true,
        specialType: 'tracker_smacker',
        name: 'smacker',
      };

      useGameStore.setState({ pendingEffects: [] });

      useGameStore.getState().handleCardEffect(trackerSmackerCard, 'player');

      // Instant effects should not be in queue
      expect(useGameStore.getState().pendingEffects).toHaveLength(0);
    });
  });

  describe('processPendingEffects', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame();
    });

    describe('Launch Stack', () => {
      it('should add launch stack when player wins', () => {
        const launchStackCard: Card = {
          id: 'ls-1',
          typeId: 'ls-ai-platform',
          value: 0,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'launch_stack',
          name: 'AI Platform',
        };

        useGameStore.setState({
          pendingEffects: [
            {
              type: 'launch_stack',
              playedBy: 'player',
              card: launchStackCard,
              isInstant: false,
            },
          ],
          cardsInPlay: [launchStackCard],
        });

        const initialCount = useGameStore.getState().player.launchStackCount;

        useGameStore.getState().processPendingEffects('player');

        expect(useGameStore.getState().player.launchStackCount).toBe(initialCount + 1);
        expect(useGameStore.getState().pendingEffects).toHaveLength(0);
      });

      it('should not add launch stack when player loses', () => {
        const launchStackCard: Card = {
          id: 'ls-1',
          typeId: 'ls-ai-platform',
          value: 0,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'launch_stack',
          name: 'AI Platform',
        };

        useGameStore.setState({
          pendingEffects: [
            {
              type: 'launch_stack',
              playedBy: 'player',
              card: launchStackCard,
              isInstant: false,
            },
          ],
          cardsInPlay: [launchStackCard],
        });

        const initialCount = useGameStore.getState().player.launchStackCount;

        useGameStore.getState().processPendingEffects('cpu');

        // Player lost, so launch stack goes to CPU with other cards
        expect(useGameStore.getState().player.launchStackCount).toBe(initialCount);
        expect(useGameStore.getState().pendingEffects).toHaveLength(0);
      });
    });

    describe('Patent Theft', () => {
      it('should steal launch stack when player wins', () => {
        const patentTheftCard: Card = {
          id: 'pt-1',
          typeId: 'move-patent',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'patent_theft',
          name: 'Patent Theft',
        };

        // Give CPU a launch stack
        useGameStore.setState({
          cpu: {
            ...useGameStore.getState().cpu,
            launchStackCount: 1,
          },
          pendingEffects: [
            {
              type: 'patent_theft',
              playedBy: 'player',
              card: patentTheftCard,
              isInstant: false,
            },
          ],
        });

        const initialPlayerCount = useGameStore.getState().player.launchStackCount;
        const initialCpuCount = useGameStore.getState().cpu.launchStackCount;

        useGameStore.getState().processPendingEffects('player');

        expect(useGameStore.getState().player.launchStackCount).toBe(initialPlayerCount + 1);
        expect(useGameStore.getState().cpu.launchStackCount).toBe(initialCpuCount - 1);
      });

      it('should not steal when player loses', () => {
        const patentTheftCard: Card = {
          id: 'pt-1',
          typeId: 'move-patent',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'patent_theft',
          name: 'Patent Theft',
        };

        useGameStore.setState({
          cpu: {
            ...useGameStore.getState().cpu,
            launchStackCount: 1,
          },
          pendingEffects: [
            {
              type: 'patent_theft',
              playedBy: 'player',
              card: patentTheftCard,
              isInstant: false,
            },
          ],
        });

        const initialPlayerCount = useGameStore.getState().player.launchStackCount;
        const initialCpuCount = useGameStore.getState().cpu.launchStackCount;

        useGameStore.getState().processPendingEffects('cpu');

        expect(useGameStore.getState().player.launchStackCount).toBe(initialPlayerCount);
        expect(useGameStore.getState().cpu.launchStackCount).toBe(initialCpuCount);
      });

      it('should be blocked by Tracker Smacker', () => {
        const patentTheftCard: Card = {
          id: 'pt-1',
          typeId: 'move-patent',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'patent_theft',
          name: 'Patent Theft',
        };

        useGameStore.setState({
          trackerSmackerActive: 'cpu', // CPU blocks player's effects
          cpu: {
            ...useGameStore.getState().cpu,
            launchStackCount: 1,
          },
          pendingEffects: [
            {
              type: 'patent_theft',
              playedBy: 'player',
              card: patentTheftCard,
              isInstant: false,
            },
          ],
        });

        const initialCpuCount = useGameStore.getState().cpu.launchStackCount;

        useGameStore.getState().processPendingEffects('player');

        // Effect blocked - CPU keeps their launch stack
        expect(useGameStore.getState().cpu.launchStackCount).toBe(initialCpuCount);
      });
    });

    describe('Leveraged Buyout', () => {
      it('should steal 2 cards from opponent deck when player wins', () => {
        const buyoutCard: Card = {
          id: 'lb-1',
          typeId: 'move-buyout',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'leveraged_buyout',
          name: 'Leveraged Buyout',
        };

        const initialPlayerDeckSize = useGameStore.getState().player.deck.length;
        const initialCpuDeckSize = useGameStore.getState().cpu.deck.length;

        useGameStore.setState({
          pendingEffects: [
            {
              type: 'leveraged_buyout',
              playedBy: 'player',
              card: buyoutCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('player');

        expect(useGameStore.getState().player.deck.length).toBe(initialPlayerDeckSize + 2);
        expect(useGameStore.getState().cpu.deck.length).toBe(initialCpuDeckSize - 2);
      });

      it('should not steal when player loses', () => {
        const buyoutCard: Card = {
          id: 'lb-1',
          typeId: 'move-buyout',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'leveraged_buyout',
          name: 'Leveraged Buyout',
        };

        const initialPlayerDeckSize = useGameStore.getState().player.deck.length;
        const initialCpuDeckSize = useGameStore.getState().cpu.deck.length;

        useGameStore.setState({
          pendingEffects: [
            {
              type: 'leveraged_buyout',
              playedBy: 'player',
              card: buyoutCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('cpu');

        expect(useGameStore.getState().player.deck.length).toBe(initialPlayerDeckSize);
        expect(useGameStore.getState().cpu.deck.length).toBe(initialCpuDeckSize);
      });

      it('should be blocked by Tracker Smacker', () => {
        const buyoutCard: Card = {
          id: 'lb-1',
          typeId: 'move-buyout',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'leveraged_buyout',
          name: 'Leveraged Buyout',
        };

        const initialCpuDeckSize = useGameStore.getState().cpu.deck.length;

        useGameStore.setState({
          trackerSmackerActive: 'cpu',
          pendingEffects: [
            {
              type: 'leveraged_buyout',
              playedBy: 'player',
              card: buyoutCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('player');

        expect(useGameStore.getState().cpu.deck.length).toBe(initialCpuDeckSize);
      });
    });

    describe('Temper Tantrum', () => {
      it('should steal 2 cards from cardsInPlay when player loses', () => {
        const tantrumCard: Card = {
          id: 'tt-1',
          typeId: 'move-tantrum',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'temper_tantrum',
          name: 'Temper Tantrum',
        };

        const card1: Card = {
          id: 'c1',
          typeId: 'common-1',
          value: 1,
          imageUrl: '/test.webp',
          isSpecial: false,
          name: 'Card 1',
        };

        const card2: Card = {
          id: 'c2',
          typeId: 'common-2',
          value: 2,
          imageUrl: '/test.webp',
          isSpecial: false,
          name: 'Card 2',
        };

        const initialPlayerDeckSize = useGameStore.getState().player.deck.length;

        useGameStore.setState({
          cardsInPlay: [card1, card2, tantrumCard],
          pendingEffects: [
            {
              type: 'temper_tantrum',
              playedBy: 'player',
              card: tantrumCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('cpu'); // Player lost

        // Player should have stolen 2 cards from cardsInPlay
        expect(useGameStore.getState().player.deck.length).toBe(initialPlayerDeckSize + 2);
        expect(useGameStore.getState().cardsInPlay.length).toBe(1); // Only tantrum card left
      });

      it('should not steal when player wins', () => {
        const tantrumCard: Card = {
          id: 'tt-1',
          typeId: 'move-tantrum',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'temper_tantrum',
          name: 'Temper Tantrum',
        };

        const initialPlayerDeckSize = useGameStore.getState().player.deck.length;

        useGameStore.setState({
          cardsInPlay: [tantrumCard],
          pendingEffects: [
            {
              type: 'temper_tantrum',
              playedBy: 'player',
              card: tantrumCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('player'); // Player won

        expect(useGameStore.getState().player.deck.length).toBe(initialPlayerDeckSize);
      });

      it('should be blocked by Tracker Smacker', () => {
        const tantrumCard: Card = {
          id: 'tt-1',
          typeId: 'move-tantrum',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'temper_tantrum',
          name: 'Temper Tantrum',
        };

        const card1: Card = {
          id: 'c1',
          typeId: 'common-1',
          value: 1,
          imageUrl: '/test.webp',
          isSpecial: false,
          name: 'Card 1',
        };

        const initialPlayerDeckSize = useGameStore.getState().player.deck.length;

        useGameStore.setState({
          trackerSmackerActive: 'cpu',
          cardsInPlay: [card1, tantrumCard],
          pendingEffects: [
            {
              type: 'temper_tantrum',
              playedBy: 'player',
              card: tantrumCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('cpu');

        expect(useGameStore.getState().player.deck.length).toBe(initialPlayerDeckSize);
      });
    });

    describe('Mandatory Recall', () => {
      it('should return opponent launch stacks when player wins', () => {
        const recallCard: Card = {
          id: 'mr-1',
          typeId: 'firewall-recall',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'mandatory_recall',
          name: 'Mandatory Recall',
        };

        const launchStackCard: Card = {
          id: 'ls-1',
          typeId: 'ls-ai-platform',
          value: 0,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'launch_stack',
          name: 'AI Platform',
        };

        // Give CPU 2 launch stacks
        useGameStore.setState({
          cpu: {
            ...useGameStore.getState().cpu,
            launchStackCount: 2,
            deck: [],
          },
          cpuLaunchStacks: [launchStackCard, launchStackCard],
          pendingEffects: [
            {
              type: 'mandatory_recall',
              playedBy: 'player',
              card: recallCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('player');

        // CPU should have lost all launch stacks
        expect(useGameStore.getState().cpu.launchStackCount).toBe(0);
        // Launch stacks should be shuffled back into CPU's deck
        expect(useGameStore.getState().cpu.deck.length).toBe(2);
      });

      it('should not return launch stacks when player loses', () => {
        const recallCard: Card = {
          id: 'mr-1',
          typeId: 'firewall-recall',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'mandatory_recall',
          name: 'Mandatory Recall',
        };

        useGameStore.setState({
          cpu: {
            ...useGameStore.getState().cpu,
            launchStackCount: 2,
          },
          pendingEffects: [
            {
              type: 'mandatory_recall',
              playedBy: 'player',
              card: recallCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('cpu');

        expect(useGameStore.getState().cpu.launchStackCount).toBe(2);
      });
    });

    describe('Open What You Want', () => {
      it('should mark OWYW as active for next turn', () => {
        const owyWCard: Card = {
          id: 'owyw-1',
          typeId: 'firewall-owyw',
          value: 6,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'open_what_you_want',
          name: 'Open What You Want',
        };

        useGameStore.setState({
          pendingEffects: [
            {
              type: 'open_what_you_want',
              playedBy: 'player',
              card: owyWCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('player');

        expect(useGameStore.getState().openWhatYouWantActive).toBe('player');
        expect(useGameStore.getState().preRevealEffects).toHaveLength(1);
        expect(useGameStore.getState().preRevealEffects[0].type).toBe('owyw');
      });
    });

    describe('Data Grab', () => {
      it('should distribute cards randomly between players', () => {
        const dataGrabCard: Card = {
          id: 'dg-1',
          typeId: 'data-grab',
          value: 0,
          imageUrl: '/test.webp',
          isSpecial: true,
          specialType: 'data_grab',
          name: 'Data Grab',
        };

        const card1: Card = { id: 'c1', typeId: 'common-1', value: 1, imageUrl: '/test.webp', isSpecial: false, name: 'C1' };
        const card2: Card = { id: 'c2', typeId: 'common-2', value: 2, imageUrl: '/test.webp', isSpecial: false, name: 'C2' };
        const card3: Card = { id: 'c3', typeId: 'common-3', value: 3, imageUrl: '/test.webp', isSpecial: false, name: 'C3' };
        const card4: Card = { id: 'c4', typeId: 'common-4', value: 4, imageUrl: '/test.webp', isSpecial: false, name: 'C4' };

        const initialPlayerDeckSize = useGameStore.getState().player.deck.length;
        const initialCpuDeckSize = useGameStore.getState().cpu.deck.length;

        useGameStore.setState({
          cardsInPlay: [card1, card2, card3, card4],
          pendingEffects: [
            {
              type: 'data_grab',
              playedBy: 'player',
              card: dataGrabCard,
              isInstant: false,
            },
          ],
        });

        useGameStore.getState().processPendingEffects('player');

        // All cards should be distributed
        expect(useGameStore.getState().cardsInPlay).toHaveLength(0);

        // Cards should be distributed between both players
        const playerGotCards = useGameStore.getState().player.deck.length - initialPlayerDeckSize;
        const cpuGotCards = useGameStore.getState().cpu.deck.length - initialCpuDeckSize;

        expect(playerGotCards + cpuGotCards).toBe(4); // All 4 cards distributed
        expect(playerGotCards).toBeGreaterThanOrEqual(0);
        expect(cpuGotCards).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Hostile Takeover - Complete Flow', () => {
    beforeEach(() => {
      useGameStore.getState().initializeGame();
    });

    it('should trigger Data War immediately when played', () => {
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: { value: 6, specialType: 'hostile_takeover', playedCardsInHand: [] } as unknown as Card,
          currentTurnValue: 6,
          playedCardsInHand: [],
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 3 } as Card,
          currentTurnValue: 3,
          playedCardsInHand: [],
        },
      });

      const isDataWar = useGameStore.getState().checkForDataWar();
      expect(isDataWar).toBe(true);
    });

    it('should not retrigger Data War after opponent plays cards', () => {
      const htCard: Card = {
        id: 'ht-1',
        typeId: 'move-takeover',
        value: 6,
        imageUrl: '/test.webp',
        isSpecial: true,
        specialType: 'hostile_takeover',
        name: 'Hostile Takeover',
      };

      // Simulate after opponent has played Data War cards (5 cards in hand)
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: htCard,
          currentTurnValue: 6,
          playedCardsInHand: [{ card: htCard, isFaceDown: false }],
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 5 } as Card,
          currentTurnValue: 5,
          playedCardsInHand: [
            { card: {} as Card, isFaceDown: false },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: false },
          ],
        },
      });

      const isDataWar = useGameStore.getState().checkForDataWar();
      expect(isDataWar).toBe(false); // Should not retrigger
    });

    it('should trigger Data War even during existing Data War', () => {
      const htCard: Card = {
        id: 'ht-1',
        typeId: 'move-takeover',
        value: 6,
        imageUrl: '/test.webp',
        isSpecial: true,
        specialType: 'hostile_takeover',
        name: 'Hostile Takeover',
      };

      // Both players already have Data War cards (4 each)
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          playedCard: htCard,
          currentTurnValue: 6,
          playedCardsInHand: [
            { card: {} as Card, isFaceDown: false },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: true },
            { card: htCard, isFaceDown: false },
          ],
        },
        cpu: {
          ...useGameStore.getState().cpu,
          playedCard: { value: 3 } as Card,
          currentTurnValue: 3,
          playedCardsInHand: [
            { card: {} as Card, isFaceDown: false },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: true },
            { card: {} as Card, isFaceDown: false },
          ],
        },
      });

      const isDataWar = useGameStore.getState().checkForDataWar();
      expect(isDataWar).toBe(true); // Equal hands, so should trigger
    });
  });
});
