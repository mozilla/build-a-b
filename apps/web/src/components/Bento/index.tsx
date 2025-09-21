import { FC, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';
import clsx from 'clsx';

export interface BentoProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
  imageClassName?: string;
  imageSizes?: string;
  priority?: boolean;
  bgEffect?: boolean;
}

const defaultStyle =
  'relative bg-charcoal border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem]';

const Bento: FC<BentoProps> = ({
  className,
  children,
  image,
  imageAlt,
  imageClassName,
  imageSizes,
  priority,
  bgEffect,
}) => (
  <div className={clsx(defaultStyle, className)}>
    {image && (
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        sizes={imageSizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={clsx(
          'absolute inset-0 object-cover', // Expand to cover the entire card
          bgEffect &&
            'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
          imageClassName,
        )}
        priority={priority}
        aria-hidden={!imageAlt}
      />
    )}
    {children}
  </div>
);

export default Bento;
