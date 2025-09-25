import { FC, ReactNode } from 'react';
import Bento, { BentoProps } from '../Bento';

export interface HeroProps extends BentoProps {
  ariaLabel: string;
  children: ReactNode;
}

const Hero: FC<HeroProps> = ({ children, ariaLabel, image, imageSrcPortrait, imageAlt }) => {
  return (
    <section role="banner" aria-label={ariaLabel}>
      <Bento
        image={image}
        imageSrcPortrait={imageSrcPortrait}
        imageAlt={imageAlt}
        priority
        className="landscape:aspect-[164/67] mb-4 landscape:mb-8"
        imageSizes="100vw"
        imageClassName="object-[right_center]"
      >
        {children}
      </Bento>
    </section>
  );
};

export default Hero;
