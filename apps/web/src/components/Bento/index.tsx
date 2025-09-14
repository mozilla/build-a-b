import { FC, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';

export interface BentoProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
  priority?: boolean;
}

const defaultBentoStyle =
  'bg-color-[var(--primary-charcoal)] border border-[var(--colors-common-ash)] border-[0.125rem] overflow-hidden relative rounded-[0.75rem] w-full ';

const Bento: FC<BentoProps> = ({ className, children, image, imageAlt, priority }) => {
  const parentClassName = [defaultBentoStyle, className].filter(Boolean).join(' ');

  return (
    <div className={parentClassName}>
      {image && (
        <Image
          src={image}
          alt={imageAlt ?? ''}
          fill
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover"
          priority={priority}
        />
      )}
      {/* Pass children straight through */}
      {children}
    </div>
  );
};

export default Bento;
