'use client';

import { FC, ReactNode, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { BentoProps } from '../Bento';

export interface BentoDualProps extends BentoProps {
  back: ReactNode;
  effect: 'flip' | 'fade';
  disabled?: boolean;
}

const baseBentoClasses =
  'absolute w-full h-full border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem] bg-charcoal';

const frontFlipCardClasses = 'absolute w-full h-full backface-hidden';
const backFlipCardClasses = `${frontFlipCardClasses} [transform:rotateY(180deg)]`;

const frontFadeCardClasses = 'absolute inset-0';
const getBackFadeCardClasses = (isFlipped: boolean) =>
  `absolute inset-0 transition-opacity duration-700 z-10 ${isFlipped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;

const BentoDual: FC<BentoDualProps> = ({
  className,
  children,
  back,
  image,
  imageAlt,
  bgEffect,
  effect = 'flip',
  disabled,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamic wrapper classes based on effect and touch state
  const getWrapperClasses = () => {
    if (disabled) return clsx(className);

    const baseClasses =
      'relative w-full h-full backface-hidden transition-transform duration-700 [transform-style:preserve-3d]';

    if (effect === 'flip') {
      const flipClasses = isFlipped
        ? '[transform:rotateY(180deg)]'
        : 'group-hover:[transform:rotateY(180deg)]';
      return clsx(baseClasses, flipClasses, className);
    }

    return clsx(baseClasses, className);
  };

  const frontCardClasses = clsx(effect === 'flip' ? frontFlipCardClasses : frontFadeCardClasses);
  const backCardClasses =
    effect === 'flip' ? backFlipCardClasses : getBackFadeCardClasses(isFlipped);

  const handleTouch = () => {
    if (!disabled) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`group perspective-distant landscape:perspective-[100rem] rounded-[0.75rem] w-full h-full`}
      onTouchEnd={handleTouch}
    >
      <div className={getWrapperClasses()}>
        {/* Front Face */}
        <div className={`${baseBentoClasses} ${disabled ? '' : frontCardClasses}`}>
          {image && (
            <Image
              src={image}
              alt={imageAlt ?? ''}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={clsx(
                'absolute inset-0 z-0 object-cover',
                bgEffect &&
                  'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
              )}
            />
          )}
          {/* Flip Icon - Portrait Only */}
          {disabled ? null : (
            <div className="absolute top-0 right-0 z-20 portrait:block landscape:hidden">
              <Image
                src="/assets/images/icons/flip.svg"
                alt="Flip card"
                width={24}
                height={24}
                className="w-[2.625rem] h-[2.625rem]"
              />
            </div>
          )}
          <div className="absolute inset-0 z-1">{children}</div>
        </div>
        {/* Back Face */}
        {disabled ? null : <div className={`${baseBentoClasses} ${backCardClasses}`}>{back}</div>}
      </div>
    </div>
  );
};

export default BentoDual;
