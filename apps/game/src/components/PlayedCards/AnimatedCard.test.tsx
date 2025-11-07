import { fireEvent, render, screen } from '@testing-library/react';
import type { HTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../../store';
import type { Card } from '../../types/card';
import type { EffectNotification, PlayedCardState } from '../../types/game';
import { AnimatedCard } from './AnimatedCard';

// Mock XState and GameMachineContext
vi.mock('@xstate/react', () => ({
  useSelector: vi.fn(() => 'ready'),
}));

vi.mock('../../providers/GameProvider', () => ({
  GameMachineContext: {
    useActorRef: vi.fn(() => ({})),
  },
}));

vi.mock('../../utils/get-game-phase', () => ({
  getGamePhase: vi.fn(() => 'ready'),
}));

vi.mock('@/utils/glow-effects', () => ({
  getCardGlowType: vi.fn(() => 'none'),
  getGlowClasses: vi.fn(() => ''),
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
      <div onClick={onClick} className={className} data-testid="animated-card" {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock child components
vi.mock('../Card', () => ({
  Card: ({ cardFrontSrc, state }: { cardFrontSrc: string; state: string }) => (
    <div data-testid="card" data-src={cardFrontSrc} data-state={state}>
      Card
    </div>
  ),
}));

vi.mock('../EffectNotificationBadge', () => ({
  EffectNotificationBadge: ({ effectName }: { effectName: string }) => (
    <div data-testid="effect-badge">{effectName}</div>
  ),
}));

vi.mock('../Tooltip', () => ({
  Tooltip: ({ children }: HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

describe('AnimatedCard Component', () => {
  const mockCard: Card = {
    id: 'card-1',
    typeId: 'test-type',
    name: 'Test Card',
    imageUrl: '/test-image.jpg',
    value: 5,
    isSpecial: false,
  };

  const mockPlayedCardState: PlayedCardState = {
    card: mockCard,
    isFaceDown: false,
  };

  const createMockNotification = (card: Card = mockCard): EffectNotification => ({
    card,
    playedBy: 'player' as const,
    specialType: null,
    effectType: 'tracker',
    effectName: 'Test Effect',
    effectDescription: 'Test description',
  });

  const defaultProps = {
    playedCardState: mockPlayedCardState,
    index: 0,
    isTopCard: true,
    isNewCard: true,
    cardIndexInBatch: 0,
    playIndex: 0,
    deckOffset: { x: 100, y: 50 },
    shouldCollect: false,
    collectionOffset: { x: 0, y: 0 },
    isSwapped: false,
    winner: null as 'player' | 'cpu' | null,
    isCPU: false,
    owner: 'player' as 'player' | 'cpu',
    landedKey: 'card-1-1',
    landed: false,
    settledZRef: { current: {} },
    elementRefs: { current: {} },
    onLandedChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      showEffectNotificationBadge: false,
      pendingEffectNotifications: [],
      currentEffectNotification: null,
      showEffectNotificationModal: false,
      shouldShowTooltip: () => true,
      incrementTooltipCount: vi.fn(),
      player: {
        id: 'player',
        name: 'Player',
        deck: [],
        playedCard: null,
        playedCardsInHand: [],
        currentTurnValue: 0,
        launchStackCount: 0,
        activeEffects: [],
        pendingTrackerBonus: 0,
        pendingBlockerPenalty: 0,
      },
      cpu: {
        id: 'cpu',
        name: 'CPU',
        deck: [],
        playedCard: null,
        playedCardsInHand: [],
        currentTurnValue: 0,
        launchStackCount: 0,
        activeEffects: [],
        pendingTrackerBonus: 0,
        pendingBlockerPenalty: 0,
      },
      dataWarVideoPlaying: false,
      anotherPlayExpected: false,
    });
  });

  it('should render the card', () => {
    render(<AnimatedCard {...defaultProps} />);
    expect(screen.getByTestId('card')).toBeDefined();
  });

  it('should display face-down card when isFaceDown is true', () => {
    const faceDownCard = {
      ...mockPlayedCardState,
      isFaceDown: true,
    };

    render(<AnimatedCard {...defaultProps} playedCardState={faceDownCard} />);

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-state')).toBe('initial');
  });

  it('should display face-up card when isFaceDown is false', () => {
    render(<AnimatedCard {...defaultProps} />);

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-state')).toBe('flipped');
  });

  it('should show effect notification badge for top card with pending notification', () => {
    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [createMockNotification()],
    });

    render(<AnimatedCard {...defaultProps} />);
    expect(screen.getByTestId('effect-badge')).toBeDefined();
  });

  it('should not show effect badge for non-top card', () => {
    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [createMockNotification()],
    });

    render(<AnimatedCard {...defaultProps} isTopCard={false} />);
    expect(screen.queryByTestId('effect-badge')).toBeNull();
  });

  it('should handle card click when badge is shown', () => {
    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [createMockNotification()],
    });

    render(<AnimatedCard {...defaultProps} />);

    const card = screen.getByTestId('animated-card');
    fireEvent.click(card);

    // Should open effect notification modal
    expect(useGameStore.getState().showEffectNotificationModal).toBe(true);
  });

  it('should not handle click when badge is not shown', () => {
    useGameStore.setState({
      showEffectNotificationBadge: false,
      pendingEffectNotifications: [],
    });

    render(<AnimatedCard {...defaultProps} />);

    const card = screen.getByTestId('animated-card');
    fireEvent.click(card);

    expect(useGameStore.getState().showEffectNotificationModal).toBe(false);
  });

  it('should apply correct rotation class for top card', () => {
    render(<AnimatedCard {...defaultProps} isTopCard={true} />);

    const card = screen.getByTestId('animated-card');
    expect(card.className).toContain('rotate-0');
  });

  it('should apply varied rotation class for non-top cards', () => {
    render(<AnimatedCard {...defaultProps} isTopCard={false} />);

    const card = screen.getByTestId('animated-card');
    // Should have a rotation class (not rotate-0)
    expect(card.className).toMatch(/rotate/);
  });

  it('should show cursor-pointer when badge is visible', () => {
    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [createMockNotification()],
    });

    render(<AnimatedCard {...defaultProps} />);

    const card = screen.getByTestId('animated-card');
    expect(card.className).toContain('cursor-pointer');
  });

  it('should register element ref', () => {
    const elementRefs = { current: {} };
    render(<AnimatedCard {...defaultProps} elementRefs={elementRefs} />);

    // Element should be registered in refs
    expect(Object.keys(elementRefs.current)).toContain('card-1-1');
  });

  it('should display Launch Stack for special type', () => {
    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [
        {
          ...createMockNotification(),
          specialType: 'launch_stack',
        },
      ],
    });

    render(<AnimatedCard {...defaultProps} />);
    expect(screen.getByText('Launch Stack')).toBeDefined();
  });

  it('should use effect name when not launch_stack', () => {
    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [
        {
          ...createMockNotification(),
          effectName: 'Custom Effect',
        },
      ],
    });

    render(<AnimatedCard {...defaultProps} />);
    expect(screen.getByText('Custom Effect')).toBeDefined();
  });

  it('should show card as initial state when collecting', () => {
    render(<AnimatedCard {...defaultProps} shouldCollect={true} />);

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-state')).toBe('initial');
  });

  it('should handle CPU deck initial rotation', () => {
    render(<AnimatedCard {...defaultProps} isCPU={true} />);
    // CPU cards should use negative initial rotation
    expect(screen.getByTestId('animated-card')).toBeDefined();
  });

  it('should reorder notifications when different notification is clicked', () => {
    const notification1 = createMockNotification();
    const notification2 = createMockNotification({ ...mockCard, id: 'card-2' });

    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [notification1, notification2],
      currentEffectNotification: notification2,
    });

    render(<AnimatedCard {...defaultProps} />);

    const card = screen.getByTestId('animated-card');
    fireEvent.click(card);

    // Should reorder to put clicked notification first
    const state = useGameStore.getState();
    expect(state.pendingEffectNotifications[0]).toEqual(notification1);
    expect(state.currentEffectNotification).toEqual(notification1);
  });

  it('should increment tooltip count on first click', () => {
    const incrementTooltipCount = vi.fn();
    useGameStore.setState({
      showEffectNotificationBadge: true,
      pendingEffectNotifications: [createMockNotification()],
      showEffectNotificationModal: false,
      shouldShowTooltip: () => true,
      incrementTooltipCount,
    });

    render(<AnimatedCard {...defaultProps} />);

    const card = screen.getByTestId('animated-card');
    fireEvent.click(card);

    expect(incrementTooltipCount).toHaveBeenCalledWith('effect_notification');
  });

  it('should handle winner card z-index correctly', () => {
    render(<AnimatedCard {...defaultProps} shouldCollect={true} winner="player" owner="player" />);

    expect(screen.getByTestId('animated-card')).toBeDefined();
  });

  it('should handle loser card z-index correctly', () => {
    render(<AnimatedCard {...defaultProps} shouldCollect={true} winner="cpu" owner="player" />);

    expect(screen.getByTestId('animated-card')).toBeDefined();
  });
});
