import { FC, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';

interface CardProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
}

const defaultCardStyle =
  'relative overflow-hidden border border-white bg-[var(--primary-charcoal)]';

const Card: FC<CardProps> = ({ className, children, image, imageAlt }) => {
  const parentClassName = [defaultCardStyle, className].filter(Boolean).join(' ');

  return (
    <div className={parentClassName}>
      {image && (
        <Image
          src={image}
          alt={imageAlt ?? ''}
          fill
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover"
        />
      )}
      {/* Pass children straight through */}
      {children}
    </div>
  );
};

export default Card;
