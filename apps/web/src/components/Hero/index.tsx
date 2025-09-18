import { FC, ReactNode } from 'react';
import Bento, { BentoProps } from '../Bento';

export interface HeroProps extends BentoProps {
  children: ReactNode;
}

const Hero: FC<HeroProps> = ({ children, image, imageAlt }) => {
  return (
    <section>
      <Bento image={image} imageAlt={imageAlt} priority className="aspect-[328/139] mb-8">
        {children}
      </Bento>
    </section>
  );
};

export default Hero;
