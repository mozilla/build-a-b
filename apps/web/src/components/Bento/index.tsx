import { FC, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';

export interface BentoProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
  priority?: boolean;
  imageClassName?: string;
}

const defaultBentoStyle =
  'bg-charcoal border-common-ash border-[0.125rem] overflow-hidden relative rounded-[0.75rem]';
const defaultImageStyle = 'absolute inset-0 z-0 object-cover';

const Bento: FC<BentoProps> = ({
  className,
  children,
  image,
  imageAlt,
  priority,
  imageClassName,
}) => {
  const parentClassName = [defaultBentoStyle, className].filter(Boolean).join(' ');
  const imgClassName = [defaultImageStyle, imageClassName].filter(Boolean).join(' ');
  return (
    <div className={parentClassName}>
      {image && (
        <Image
          src={image}
          alt={imageAlt ?? ''}
          fill
          sizes="100vw"
          className={imgClassName}
          priority={priority}
        />
      )}
      {children}
    </div>
  );
};

export default Bento;
