import { FC, Fragment, ReactElement } from 'react';
import Bento, { BentoProps } from '../Bento';
import { IconCardProps } from '../IconCard';

export interface CardsSectionProps extends BentoProps {
  cards: ReactElement<IconCardProps>[];
}

const CardsSection: FC<CardsSectionProps> = ({ className, image, cards, children }) => {
  return (
    <section className="mb-4 landscape:mb-8">
      <Bento image={image} className={className}>
        <div className="relative p-4 landscape:p-12 flex flex-col gap-4">
          {children}
          <div className="flex flex-col landscape:flex-row gap-5 landscape:gap-10 justify-between mt-4 flex-wrap">
            {cards.map((card, index) => (
              <Fragment key={index}>{card}</Fragment>
            ))}
          </div>
        </div>
      </Bento>
    </section>
  );
};

export default CardsSection;
