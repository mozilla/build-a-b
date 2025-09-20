import { FC, ReactNode } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { BentoProps } from '../Bento';

export interface BentoDualProps extends BentoProps {
  back: ReactNode;
  effect: 'flip' | 'fade';
  disabled?: boolean;
}

const wrapperFlipClasses =
  'relative w-full h-full backface-hidden transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]';
const wrapperFadeClasses = '';

const baseBentoClasses =
  'absolute w-full h-full border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem] bg-charcoal';

const frontFlipCardClasses = 'absolute w-full h-full backface-hidden';
const backFlipCardClasses = `${frontFlipCardClasses} [transform:rotateY(180deg)]`;

const frontFadeCardClasses = 'absolute inset-0';
const backFadeCardClasses =
  'absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100 z-10';

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
  const wrapperEffectClasses = effect == 'flip' ? wrapperFlipClasses : wrapperFadeClasses;

  const wrapperClasses = disabled ? clsx(className) : clsx(wrapperEffectClasses, className);
  const frontCardClasses = clsx(
    effect === 'flip' ? frontFlipCardClasses : frontFadeCardClasses,
  );
  const backCardClasses = clsx(
    effect === 'flip' ? backFlipCardClasses : backFadeCardClasses,
  );

  return (
    <div className={`group [perspective:1000px] rounded-[0.75rem] w-full h-full ${disabled ? '' : 'cursor-pointer'}`}>
      <div className={wrapperClasses}>
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
          <div className="absolute inset-0 z-1">{children}</div>
        </div>
        {/* Back Face */}
        {disabled ? 
          null : (
          <div className={`${baseBentoClasses} ${backCardClasses}`}>{back}</div>
        )}
      </div>
    </div>
  );
};

export default BentoDual;
