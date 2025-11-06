import type { PlayedCardState, PlayerType } from '../../types/game';

export type PlayedCardsProps = {
  cards: PlayedCardState[];
  owner: PlayerType; // 'player' or 'cpu' to determine animation direction
};
