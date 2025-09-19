import { FC, ReactNode } from 'react';
import Bento, { BentoProps } from '../Bento';

export interface CardsSectionProps extends BentoProps {
  cards: ReactNode;
}

const CardsSection: FC<CardsSectionProps> = ({ image, cards, children }) => {
  return (
    <section className="mb-4 landscape:mb-8">
      <Bento image={image}>
        <div className="relative p-12 flex flex-col gap-4">
          {children}
          <div className="flex flex-col landscape:flex-row gap-5 landscape:gap-10 justify-between mt-4">
            {cards}
          </div>
        </div>
      </Bento>
    </section>
  );
};

export default CardsSection;
