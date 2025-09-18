import { FC, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';
import clsx from 'clsx';

export interface BentoProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
  priority?: boolean;
  bgEffect?: boolean;
}

const defaultStyle =
  'relative bg-charcoal border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem]';

const Bento: FC<BentoProps> = ({ className, children, image, imageAlt, priority, bgEffect }) => (
  <div className={clsx(defaultStyle, className)}>
    {image && (
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        sizes="100vw"
        className={clsx(
          'absolute inset-0 object-cover', // Expand to cover the entire card
          bgEffect &&
            'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
        )}
        priority={priority}
        aria-hidden={!imageAlt}
      />
    )}
    {children}
  </div>
);

export default Bento;
