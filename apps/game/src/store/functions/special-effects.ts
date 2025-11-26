/**
 * Special Effects Processing Functions
 * Handles card effects, including playCard, effect processing, and tracker/blocker logic
 */

import { ANIMATION_DURATIONS, getGameSpeedAdjustedDuration } from '@/config/animation-timings';
import { TRACKS } from '@/config/audio-config';
import type {
  Card,
  CardValue,
  Player,
  PlayerType,
  SpecialEffect,
  CardDistribution,
  GameStore,
  SetState,
  GetState,
} from '@/types';
import { applyBlockerModifier, isEffectBlocked } from '@/utils/card-comparison';

export function createSpecialEffectsActions(set: SetState, get: GetState) {
  return {
    /**
     * Plays a card from a player's deck
     * Handles card value calculation, tracker/blocker effects, and turn state
     * @param playerId - The player playing the card
     */
    playCard: (playerId: PlayerType) => {
      const playerState = get()[playerId];
      const [card, ...remainingDeck] = playerState.deck;

      if (!card) {
        // This shouldn't happen - win condition should have caught it before calling playCard
        get().logEvent('PLAY_CARD', `${playerId} has no cards to play`, undefined, 'error');
        return;
      }

      const opponentId = playerId === 'player' ? 'cpu' : 'player';

      // Log card play
      get().logEvent(
        'PLAY_CARD',
        `${playerId.toUpperCase()} played ${card.name} (${card.value})`,
        card.specialType ? `Special: ${card.specialType}` : undefined,
        'info',
      );

      /**
       * Helper: Determines if a tracker/blocker card's effect should be negated
       * Effects are negated if:
       * 1. Tracker Smacker is active (blocks opponent's trackers/blockers), OR
       * 2. HT effect applies (only on first/original card, not data war face-up cards)
       */
      const isTrackerBlockerNegated = (cardType: string | undefined): boolean => {
        if (cardType !== 'tracker' && cardType !== 'blocker') {
          return false;
        }

        // Check if blocked by Tracker Smacker
        const blockedBySmacker = isEffectBlocked(get().trackerSmackerActive, playerId);

        // Check if we're in a Hostile Takeover data war
        const inHTDataWar = get().hostileTakeoverDataWar;

        // Check if opponent has HT (their HT ignores this player's tracker/blocker)
        const opponentState = get()[opponentId];
        const opponentHasHT = opponentState.playedCard?.specialType === 'hostile_takeover';

        // HT effect only negates the FIRST card (original play)
        // During data war portion (face-up card after face-down), effects should work normally
        const isFirstCard = playerState.playedCardsInHand.length === 0;
        const htNegationApplies = (inHTDataWar || opponentHasHT) && isFirstCard;

        return blockedBySmacker || htNegationApplies;
      };

      // Determine if this card's value should be negated
      const shouldNegateValue = isTrackerBlockerNegated(card.specialType);

      // Calculate the effective card value (0 if negated, otherwise normal value)
      // Trackers now display their value immediately (just like any other card)
      let effectiveCardValue = shouldNegateValue ? 0 : card.value;

      // APPLY PENDING BLOCKER PENALTY FROM EARLIER IN SAME TURN
      // If in anotherPlayMode (second+ card), apply any pending blocker penalty
      if (get().anotherPlayMode && playerState.pendingBlockerPenalty > 0) {
        effectiveCardValue = (effectiveCardValue - playerState.pendingBlockerPenalty) as CardValue;
      }

      // In "another play" mode, ADD to existing value
      // In normal mode, SET the value
      const newTurnValue = playerState.currentTurnValue + effectiveCardValue;

      // Play turn value SFX if value changed and is non-zero
      if (effectiveCardValue !== 0 && playerId === 'player') {
        get().playAudio(TRACKS.TURN_VALUE);
      }

      const newPlayedCardsInHand = [...playerState.playedCardsInHand, { card, isFaceDown: false }];

      // Determine turn states based on card effects
      const updates: Partial<GameStore> = {
        [playerId]: {
          ...playerState,
          playedCard: card,
          playedCardsInHand: newPlayedCardsInHand,
          deck: remainingDeck,
          currentTurnValue: newTurnValue,
          // CLEAR pending penalties after applying (only if in anotherPlayMode)
          pendingTrackerBonus: 0, // No longer used - trackers show value immediately
          pendingBlockerPenalty: get().anotherPlayMode ? 0 : playerState.pendingBlockerPenalty,
        },
        cardsInPlay: [...get().cardsInPlay, card],
      };

      // Handle tracker card: Set turn state and active effects for display
      if (card.specialType === 'tracker' && !shouldNegateValue) {
        const turnStateKey = playerId === 'player' ? 'playerTurnState' : 'cpuTurnState';
        updates[turnStateKey] = 'tracker';

        // Add to active effects for display purposes
        const newActiveEffects = [
          ...playerState.activeEffects,
          {
            type: 'tracker' as const,
            value: card.value,
            source: playerId,
          },
        ];

        // Update active effects for display (tracker value is now immediately visible in currentTurnValue)
        updates[playerId] = {
          ...(updates[playerId] as Player),
          activeEffects: newActiveEffects,
        };
      }

      // Set turn state for blocker (affects opponent's turn value display)
      // Blocker logic stays in handleCardEffect (applies immediately to opponent)
      if (card.specialType === 'blocker' && !shouldNegateValue) {
        const turnStateKey = opponentId === 'player' ? 'playerTurnState' : 'cpuTurnState';
        updates[turnStateKey] = 'blocker';
      }

      // Update anotherPlayExpected flag
      // If this card triggers another play, we're expecting more cards
      // If this card doesn't trigger another play and we're in anotherPlayMode, sequence is ending
      if (card.triggersAnotherPlay) {
        updates.anotherPlayExpected = true;
      } else if (get().anotherPlayMode) {
        updates.anotherPlayExpected = false;
      }

      set(updates);
    },

    /**
     * Applies tracker effect to a player
     * Note: Tracker value is already added to currentTurnValue in playCard()
     * This function only tracks the effect for display purposes
     * @param playerId - The player with the tracker
     * @param trackerCard - The tracker card
     */
    applyTrackerEffect: (playerId: PlayerType, trackerCard: Card) => {
      const player = get()[playerId];

      // Check if effect is blocked by Tracker Smacker
      if (isEffectBlocked(get().trackerSmackerActive, playerId)) {
        return;
      }

      // Note: The tracker value is already added to currentTurnValue in playCard()
      // This function only tracks the effect for display purposes

      // Add to active effects
      const newActiveEffects = [
        ...player.activeEffects,
        {
          type: 'tracker' as const,
          value: trackerCard.value,
          source: playerId,
        },
      ];

      set({
        [playerId]: {
          ...player,
          activeEffects: newActiveEffects,
        },
      });
    },

    /**
     * Applies blocker effect to opponent
     * Subtracts blocker value from opponent's turn value
     * @param playerId - The player playing the blocker
     * @param blockerCard - The blocker card
     */
    applyBlockerEffect: (playerId: PlayerType, blockerCard: Card) => {
      // Blocker affects the opponent
      const opponentId = playerId === 'player' ? 'cpu' : 'player';
      const opponent = get()[opponentId];

      // Note: Blocker cards are NOT affected by Tracker Smacker
      // Tracker Smacker only blocks Trackers and Billionaire Move effects

      // Apply blocker modifier (subtract from opponent's turn value)
      const newValue = applyBlockerModifier(opponent.currentTurnValue, blockerCard);

      // Add to opponent's active effects
      const newActiveEffects = [
        ...opponent.activeEffects,
        {
          type: 'blocker' as const,
          value: blockerCard.value,
          source: playerId,
        },
      ];

      set({
        [opponentId]: {
          ...opponent,
          currentTurnValue: newValue,
          activeEffects: newActiveEffects,
        },
      });
    },

    /**
     * Handles special card effects
     * Routes effects to appropriate handlers or queues them for later processing
     * @param card - The card being played
     * @param playedBy - The player who played the card
     */
    handleCardEffect: (card: Card, playedBy: PlayerType) => {
      // Handle special card effects
      if (!card.isSpecial || !card.specialType) {
        return;
      }

      // Create special effect
      const effect: SpecialEffect = {
        type: card.specialType,
        playedBy,
        card,
        isInstant: [
          'forced_empathy',
          'tracker_smacker',
          'hostile_takeover',
          'tracker', // Instant - no animation, just value modifier
          'blocker', // Instant - no animation, just value modifier
        ].includes(card.specialType),
      };

      // If instant effect, we'll handle it immediately in the machine
      // Otherwise, add to pending effects queue
      if (!effect.isInstant) {
        get().addPendingEffect(effect);
      }

      // Handle specific effects
      switch (card.specialType) {
        case 'tracker':
          // NO LONGER APPLY TRACKER EFFECT HERE
          // Tracker logic is now handled in playCard() (store bonus for next card)
          break;
        case 'blocker': {
          // KEEP BLOCKER LOGIC - applies immediately to opponent
          const { player: p, cpu: c } = get();
          const hostileTakeoverInPlay =
            p.playedCard?.specialType === 'hostile_takeover' ||
            c.playedCard?.specialType === 'hostile_takeover';

          // Only ignore blocker if HT is in play AND it's the ORIGINAL play
          // Original play: BOTH players have exactly 1 card (before Data War starts)
          // Once Data War cards are added, blockers should work normally
          const isOriginalPlay =
            p.playedCardsInHand.length === 1 && c.playedCardsInHand.length === 1;
          const shouldIgnoreDueToHT = hostileTakeoverInPlay && isOriginalPlay;

          if (!shouldIgnoreDueToHT) {
            get().applyBlockerEffect(playedBy, card);
          }
          // If Hostile Takeover is in play on first Data War, blocker effect is ignored
          break;
        }
        case 'launch_stack':
          // DON'T add launch stack immediately
          // It will be added in processPendingEffects if the player wins the turn
          break;
        case 'tracker_smacker':
          get().setTrackerSmackerActive(playedBy);
          // Animation will be queued and played sequentially
          break;
        case 'hostile_takeover':
          // Animation will be queued and played sequentially
          break;
        case 'leveraged_buyout':
          // Animation will be queued and played sequentially
          break;
        case 'patent_theft':
          // Animation will be queued and played sequentially
          break;
        case 'temper_tantrum':
          // Animation will be queued and played sequentially
          break;
        case 'mandatory_recall':
          // Animation will be queued and played sequentially
          break;
        case 'open_what_you_want':
          // Animation will be queued and played sequentially
          break;
        case 'forced_empathy':
          // Block game transitions during Forced Empathy animation
          set({ blockTransitions: true });

          // Wait for card to settle on board before showing animation overlay
          // Use instant animation delay for consistency with other instant animations
          setTimeout(() => {
            // STEP 1: Show video overlay (decks don't move yet)
            get().setShowForcedEmpathyAnimation(true);

            // STEP 2: After video ends, hide video and start deck pile animation
            setTimeout(() => {
              get().setShowForcedEmpathyAnimation(false);
              get().setForcedEmpathySwapping(true);

              // STEP 3: After deck piles finish moving (DURATION only, no delay), swap decks and hide animation
              setTimeout(() => {
                get().swapDecks(); // Swaps deck data and increments deckSwapCount
                get().setForcedEmpathySwapping(false);

                // Wait for deck swap to visually settle before unblocking game
                setTimeout(() => {
                  // Unblock game transitions now that animation is fully complete
                  set({ blockTransitions: false });

                  // Only call callback if no animations are queued
                  // If animations are queued (e.g., OWYW), let the queue system handle the callback
                  const { animationQueue, animationCompletionCallback, isPlayingQueuedAnimation } =
                    get();
                  if (
                    animationCompletionCallback &&
                    animationQueue.length === 0 &&
                    !isPlayingQueuedAnimation
                  ) {
                    set({ animationCompletionCallback: null });
                    animationCompletionCallback();
                  }
                }, ANIMATION_DURATIONS.FORCED_EMPATHY_SETTLE_DELAY);
              }, ANIMATION_DURATIONS.FORCED_EMPATHY_SWAP_DURATION);
            }, ANIMATION_DURATIONS.FORCED_EMPATHY_VIDEO_DURATION);
          }, getGameSpeedAdjustedDuration(ANIMATION_DURATIONS.INSTANT_ANIMATION_DELAY)); // Use instant animation delay for consistency
          break;
        // Other effects will be handled when processing pending effects
      }
    },

    /**
     * Adds an effect to the pending effects queue
     */
    addPendingEffect: (effect: SpecialEffect) => {
      set({ pendingEffects: [...get().pendingEffects, effect] });
    },

    /**
     * Clears all pending effects
     */
    clearPendingEffects: () => {
      set({ pendingEffects: [] });
    },

    /**
     * Sets the Tracker Smacker active state
     * Immediately recalculates turn values for any blocked tracker cards
     * @param playerId - The player who played Tracker Smacker (or null to deactivate)
     */
    setTrackerSmackerActive: (playerId: PlayerType | null) => {
      set({ trackerSmackerActive: playerId });

      // Immediately recalculate turn values for any blocked tracker cards
      // This handles the case where Tracker Smacker is played in the same turn as opponent's tracker
      // NOTE: Tracker Smacker only blocks TRACKERS and BILLIONAIRE MOVE effects, NOT blockers
      const { player, cpu } = get();

      // Check if player's card should be negated (only trackers)
      if (player.playedCard) {
        const isPlayerBlocked = isEffectBlocked(playerId, 'player');
        if (isPlayerBlocked && player.playedCard.specialType === 'tracker') {
          set({
            player: {
              ...player,
              currentTurnValue: 0,
              pendingTrackerBonus: 0, // CLEAR pending tracker bonus (blocked)
              activeEffects: [], // CLEAR active effects for display
            },
            playerTurnState: 'normal', // Reset to normal UI state
          });
        }
      }

      // Check if CPU's card should be negated (only trackers)
      if (cpu.playedCard) {
        const isCpuBlocked = isEffectBlocked(playerId, 'cpu');
        if (isCpuBlocked && cpu.playedCard.specialType === 'tracker') {
          set({
            cpu: {
              ...cpu,
              currentTurnValue: 0,
              pendingTrackerBonus: 0, // CLEAR pending tracker bonus (blocked)
              activeEffects: [], // CLEAR active effects for display
            },
            cpuTurnState: 'normal', // Reset to normal UI state
          });
        }
      }
    },

    /**
     * Processes pending effects after turn resolution
     * Categorizes effects into priority groups for sequential processing
     * @param winner - The winner of the turn
     * @returns true if post-resolution animations were queued, false otherwise
     */
    processPendingEffects: (winner: PlayerType | 'tie'): boolean => {
      const { pendingEffects } = get();

      // Categorize effects into priority groups for sequential processing
      // Order: 1) Non-interactive (buyout, theft, recall) → 2) Interactive (tantrum) → 3) Launch Stack
      const nonInteractiveEffects: SpecialEffect[] = [];
      const interactiveEffects: SpecialEffect[] = [];
      const launchStackEffects: SpecialEffect[] = [];

      for (const effect of pendingEffects) {
        // Check if effect is blocked by Tracker Smacker
        if (
          isEffectBlocked(get().trackerSmackerActive, effect.playedBy) &&
          (effect.type === 'tracker' ||
            effect.type === 'leveraged_buyout' ||
            effect.type === 'patent_theft' ||
            effect.type === 'temper_tantrum')
        ) {
          continue;
        }

        switch (effect.type) {
          // Immediate effects - process now, don't queue
          case 'data_grab': {
            // Mini-game handles distribution via finalizeDataGrabResults()
            const { cardsInPlay } = get();
            if (cardsInPlay.length === 0) break;

            // Fallback: Random distribution if mini-game wasn't played
            const shuffledCards = [...cardsInPlay].sort(() => Math.random() - 0.5);
            const playerCards: Card[] = [];
            const cpuCards: Card[] = [];
            shuffledCards.forEach((card, index) => {
              if (index % 2 === 0) playerCards.push(card);
              else cpuCards.push(card);
            });

            const player = get().player;
            const cpu = get().cpu;
            set({
              player: { ...player, deck: [...player.deck, ...playerCards] },
              cpu: { ...cpu, deck: [...cpu.deck, ...cpuCards] },
              cardsInPlay: [],
            });
            break;
          }

          // Non-interactive effects - queue for sequential processing
          case 'leveraged_buyout':
          case 'patent_theft':
          case 'mandatory_recall':
            nonInteractiveEffects.push(effect);
            break;

          // Interactive effects - queue after non-interactive
          case 'temper_tantrum':
          case 'open_what_you_want':
            interactiveEffects.push(effect);
            break;

          // Launch Stack - always last
          case 'launch_stack':
            launchStackEffects.push(effect);
            break;
        }
      }

      // Combine in priority order: non-interactive → interactive → launch_stack
      const orderedEffects = [
        ...nonInteractiveEffects,
        ...interactiveEffects,
        ...launchStackEffects,
      ];

      // Calculate launch stacks going to winner for rocket timing
      const launchStacksForWinner = launchStackEffects.filter((effect) => {
        const wonByPlayer = winner === effect.playedBy;
        const lostByPlayer = winner !== 'tie' && winner !== effect.playedBy;
        return wonByPlayer || lostByPlayer;
      }).length;

      set({
        effectsQueue: orderedEffects,
        effectsWinner: winner,
        launchStacksForWinnerCount: launchStacksForWinner,
      });

      // Clear pending effects
      get().clearPendingEffects();

      // Start sequential processing
      if (orderedEffects.length > 0) {
        get().processNextEffect();
        return true;
      }

      return false;
    },

    /**
     * Processes the next effect in the sequential effects queue
     * Handles animations and callbacks for each effect type
     */
    processNextEffect: () => {
      const {
        effectsQueue,
        effectsWinner: winner,
        dataGrabPlayerLaunchStacks,
        dataGrabCPULaunchStacks,
      } = get();

      // If no more effects, do final card collection
      if (effectsQueue.length === 0) {
        const launchStacksForWinner = get().launchStacksForWinnerCount;
        // Release blockTransitions before card collection since all effects are done
        set({ blockTransitions: false });
        get().collectCardsAfterEffects(winner || 'tie', launchStacksForWinner);
        return;
      }

      // Get next effect and update queue
      const effect = effectsQueue[0];
      const remainingEffects = effectsQueue.slice(1);
      set({ effectsQueue: remainingEffects });

      // Queue animation and set callback to process effect + continue
      switch (effect.type) {
        case 'leveraged_buyout':
          // Buyout only triggers when the player who played it WINS
          if (winner === effect.playedBy) {
            get().queueAnimation('move_buyout', effect.playedBy);
            set({
              animationCompletionCallback: () => {
                const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
                // stealCards will animate the cards and call processNextEffect when done
                get().stealCards(opponentId, effect.playedBy, 2);
              },
            });
          } else {
            // Effect didn't trigger, continue to next effect
            get().processNextEffect();
          }
          break;

        case 'patent_theft': {
          // Theft only triggers when the player who played it WINS and opponent has launch stacks
          const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
          if (winner === effect.playedBy && get()[opponentId].launchStackCount > 0) {
            get().queueAnimation('move_theft', effect.playedBy);
            set({
              animationCompletionCallback: () => {
                const stolenCard = get().stealLaunchStackStart(opponentId);
                if (stolenCard) {
                  get().stealLaunchStackComplete(effect.playedBy, stolenCard);
                }
                // Continue to next effect
                get().processNextEffect();
              },
            });
          } else {
            // Effect didn't trigger (lost or no launch stacks to steal), continue to next effect
            get().processNextEffect();
          }
          break;
        }

        case 'mandatory_recall': {
          // Recall only triggers when the player who played it WINS and opponent has launch stacks
          const opponentId = effect.playedBy === 'player' ? 'cpu' : 'player';
          if (winner === effect.playedBy && get()[opponentId].launchStackCount > 0) {
            get().queueAnimation('firewall_recall', effect.playedBy);
            set({
              animationCompletionCallback: () => {
                const launchStackCount = get()[opponentId].launchStackCount;

                if (launchStackCount > 0) {
                  set({ recallReturnCount: launchStackCount });
                  get().removeLaunchStacks(opponentId, launchStackCount);
                  // Animation shows from opponent's side (they're losing the cards)
                  get().queueAnimation('mandatory_recall_won', opponentId);
                }
                // Continue to next effect
                get().processNextEffect();
              },
            });
          } else {
            // Effect didn't trigger (lost or no launch stacks to recall), continue to next effect
            get().processNextEffect();
          }
          break;
        }

        case 'temper_tantrum':
          // Tantrum only triggers when the player who played it LOSES
          if (winner && winner !== 'tie' && winner !== effect.playedBy) {
            get().queueAnimation('move_tantrum', effect.playedBy);
            set({
              animationCompletionCallback: () => {
                const loser = effect.playedBy;
                const actualWinner = winner as PlayerType;

                if (loser === 'player') {
                  // PLAYER LOSES: Show modal - modal close will call processNextEffect
                  get().initializeTemperTantrumSelection(actualWinner);
                  // Don't call processNextEffect here - modal will handle continuation
                  return;
                } else {
                  // CPU LOSES: Automatic selection from winner's played cards
                  const currentState = get();
                  const playerCards = currentState.player.playedCardsInHand.map((pcs) => pcs.card);
                  const cpuCards = currentState.cpu.playedCardsInHand.map((pcs) => pcs.card);
                  const winnerCards = actualWinner === 'player' ? playerCards : cpuCards;

                  // CPU prioritizes stealing launch stacks, then random regular cards
                  const launchStacks = winnerCards.filter((c) => c.specialType === 'launch_stack');
                  const regularCards = winnerCards.filter((c) => c.specialType !== 'launch_stack');
                  const shuffledRegular = [...regularCards].sort(() => Math.random() - 0.5);

                  // Take launch stacks first, then fill with random regular cards
                  const cardsToSteal = [
                    ...launchStacks.slice(0, 2),
                    ...shuffledRegular.slice(0, Math.max(0, 2 - launchStacks.length)),
                  ];

                  if (cardsToSteal.length > 0) {
                    // Separate into launch stacks and regular cards
                    const stolenLaunchStacks = cardsToSteal.filter(
                      (card) => card.specialType === 'launch_stack',
                    );
                    const stolenRegularCards = cardsToSteal.filter(
                      (card) => card.specialType !== 'launch_stack',
                    );

                    // Remove stolen cards from cardsInPlay
                    const stolenCardIds = new Set(cardsToSteal.map((c) => c.id));
                    const updatedCardsInPlay = currentState.cardsInPlay.filter(
                      (card) => !stolenCardIds.has(card.id),
                    );

                    // Add stolen regular cards to CPU's deck (loser is always 'cpu' in this branch)
                    set({
                      cpu: {
                        ...currentState.cpu,
                        deck: [...currentState.cpu.deck, ...stolenRegularCards],
                      },
                      cardsInPlay: updatedCardsInPlay,
                    });

                    // Set destination override for stolen Launch Stacks
                    if (stolenLaunchStacks.length > 0) {
                      const stolenLaunchStackIds = new Set(stolenLaunchStacks.map((ls) => ls.id));
                      const currentQueue = get().effectsQueue;
                      const updatedQueue = currentQueue.map((e) => {
                        if (e.type === 'launch_stack' && stolenLaunchStackIds.has(e.card.id)) {
                          return { ...e, destinationOverride: loser };
                        }
                        return e;
                      });
                      set({ effectsQueue: updatedQueue });
                    }

                    // Create distributions for animation (cards go from board to loser's deck)
                    const distributions: CardDistribution[] = cardsToSteal.map((card) => ({
                      card,
                      destination: loser,
                      source: { type: 'board' as const },
                    }));

                    // Set callback to continue after animation
                    set({
                      animationCompletionCallback: () => {
                        // Remove stolen cards from playedCardsInHand
                        const currentState = get();
                        set({
                          player: {
                            ...currentState.player,
                            playedCardsInHand: currentState.player.playedCardsInHand.filter(
                              (pcs) => !stolenCardIds.has(pcs.card.id),
                            ),
                          },
                          cpu: {
                            ...currentState.cpu,
                            playedCardsInHand: currentState.cpu.playedCardsInHand.filter(
                              (pcs) => !stolenCardIds.has(pcs.card.id),
                            ),
                          },
                        });
                        get().processNextEffect();
                      },
                    });

                    // Use visual-only collection animation (decks already updated)
                    get().collectCardsDistributed(distributions, actualWinner, true, 0, true);
                    return;
                  }
                }
                // Continue to next effect (only if no cards to steal)
                get().processNextEffect();
              },
            });
          } else {
            // Tantrum player won or tied - no effect, continue to next
            get().processNextEffect();
          }
          break;

        case 'open_what_you_want':
          // OWYW triggers regardless of win/loss - player chooses card on next turn
          // Set up pre-reveal effect FIRST (before animation) so it's ready when state machine checks
          get().setOpenWhatYouWantActive(effect.playedBy);
          get().addPreRevealEffect({
            type: 'owyw',
            playerId: effect.playedBy,
            requiresInteraction: effect.playedBy === 'player',
          });

          // Then queue animation
          get().queueAnimation('open_what_you_want', effect.playedBy);
          set({
            animationCompletionCallback: () => {
              // Continue to next effect
              get().processNextEffect();
            },
          });
          break;

        case 'launch_stack': {
          // Gather all launch_stack effects (current one + remaining in queue)
          const remainingQueue = get().effectsQueue;
          const allLaunchStacks = [
            effect,
            ...remainingQueue.filter((e) => e.type === 'launch_stack'),
          ];

          // Play ONE animation for all launch stacks
          get().queueAnimation('launch_stack', effect.playedBy);
          set({
            animationCompletionCallback: () => {
              // Process ALL launch_stack effects
              for (const lsEffect of allLaunchStacks) {
                // Use destination override if set (e.g., stolen by Temper Tantrum)
                if (lsEffect.destinationOverride) {
                  get().addLaunchStack(lsEffect.destinationOverride, lsEffect.card);
                } else {
                  // Check if this specific launch stack was collected in Data Grab
                  const matchedByCPU = dataGrabCPULaunchStacks.find(
                    (c) => c.card.id === lsEffect.card.id,
                  );
                  const matchedByPlayer = dataGrabPlayerLaunchStacks.find(
                    (c) => c.card.id === lsEffect.card.id,
                  );

                  if (matchedByCPU) {
                    get().addLaunchStack('cpu', matchedByCPU.card);
                  } else if (matchedByPlayer) {
                    get().addLaunchStack('player', matchedByPlayer.card);
                  } else if (winner === lsEffect.playedBy) {
                    // Won - goes to player who played it
                    get().addLaunchStack(lsEffect.playedBy, lsEffect.card);
                  } else if (winner !== 'tie') {
                    // Lost - goes to winner
                    const winnerId = lsEffect.playedBy === 'player' ? 'cpu' : 'player';
                    get().addLaunchStack(winnerId, lsEffect.card);
                  }
                }
              }

              // Remove remaining launch_stack effects from queue
              const filteredQueue = get().effectsQueue.filter((e) => e.type !== 'launch_stack');
              set({ effectsQueue: filteredQueue });

              // Continue to next effect
              get().processNextEffect();
            },
          });
          break;
        }
      }
    },

    /**
     * Clears all active effects for a player
     */
    clearActiveEffects: (playerId: PlayerType) => {
      const playerState = get()[playerId];

      set({
        [playerId]: {
          ...playerState,
          activeEffects: [],
        },
      });
    },
  };
}
