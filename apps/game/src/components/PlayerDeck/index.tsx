import { BILLIONAIRES } from '@/config/billionaires';
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
  billionaireId,
}) => {
  const currentBillionaire = BILLIONAIRES.find((b) => b.id === billionaireId);

  return (
    <div className="grid grid-cols-3 place-items-center w-full">
      {/** Avatar */}
      {currentBillionaire ? (
        <div className="w-[6.5rem] h-[6.5rem] max-w-[104px] max-h-[104px] rounded-full overflow-hidden border-2 border-transparent mr-2">
          <img
            src={currentBillionaire.imageSrc}
            alt={currentBillionaire.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div />
      )}
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
