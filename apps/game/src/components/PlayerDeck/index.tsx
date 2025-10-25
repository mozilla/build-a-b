import type { FC } from 'react';
import { DeckPile } from '../DeckPile';
import { TurnValue } from '../TurnValue';
import type { PlayerDeckProps } from './types';

export const PlayerDeck: FC<PlayerDeckProps> = ({
  deckLength,
  handleDeckClick,
  turnValue,
  turnValueState,
  owner,
  tooltipContent,
}) => {
  return (
    <div className="grid grid-cols-3 place-items-center w-full">
      {/** Avatar */}
      <div />
      {/** Deck */}
      <DeckPile
        cardCount={deckLength}
        owner={owner}
        onClick={handleDeckClick}
        showTooltip={!!tooltipContent}
        tooltipContent={tooltipContent}
      />
      {/** Turn points */}
      <TurnValue value={turnValue} state={turnValueState} />
    </div>
  );
};
