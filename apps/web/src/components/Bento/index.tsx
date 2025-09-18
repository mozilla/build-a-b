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
const defaultImageStyle = 'absolute inset-0 z-0 object-cover';

const Bento: FC<BentoProps> = ({ className, children, image, imageAlt, priority, bgEffect }) => (
  <div className={clsx(defaultStyle, className)}>
    {image && (
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={clsx(
          defaultImageStyle,
          bgEffect &&
            'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
        )}
        priority={priority}
      />
    )}
    {children}
  </div>
);

export default Bento;
