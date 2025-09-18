import { FC, ReactNode } from 'react';
import Bento, { BentoProps } from '../Bento';

export interface HeroProps extends BentoProps {
  children: ReactNode;
}

const Hero: FC<HeroProps> = ({ children, image, imageAlt, priority, bgEffect }) => {
  return (
    <section>
      <Bento image={image} imageAlt={imageAlt} bgEffect priority>
        {children}
      </Bento>
    </section>
  );
};

export default Hero;
