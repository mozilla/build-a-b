import { FC, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';
import clsx from 'clsx';

export interface BentoProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
  priority?: boolean;
  imageClassName?: string;
}

const defaultStyle =
  'relative bg-charcoal border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem]';
const defaultImageStyle = 'absolute inset-0 z-0 object-cover';

const Bento: FC<BentoProps> = ({
  className,
  children,
  image,
  imageAlt,
  priority,
  imageClassName,
}) => (
  <div className={clsx(defaultStyle, className)}>
    {image && (
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        sizes="100vw"
        className={clsx(defaultImageStyle, imageClassName)}
        priority={priority}
      />
    )}
    {children}
  </div>
);

export default Bento;
