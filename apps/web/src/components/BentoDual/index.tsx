import { FC, ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';
import clsx from 'clsx';
import { BentoProps } from '../Bento';

export interface BentoDualProps extends BentoProps {
  back: ReactNode;
  effect: 'flip' | 'fade';
}

const baseBentoClasses =
  'w-full h-full border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem] bg-charcoal';

const frontFlipCardClasses = 'absolute w-full h-full backface-hidden';
const backFlipCardClasses = `absolute w-full h-full backface-hidden [transform:rotateY(180deg)]`;

const BentoDual: FC<BentoDualProps> = ({
  className,
  children,
  back,
  image,
  imageAlt,
  bgEffect,
  effect = 'flip',
}) => {
  const wrapperEffectClasses =
    effect == 'flip' && back
      ? 'relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]'
      : 'w-full h-full';

  const wrapperClasses = clsx(wrapperEffectClasses, className);
  const frontCardClasses = clsx(baseBentoClasses, frontFlipCardClasses);
  const backCardClasses = clsx(baseBentoClasses, backFlipCardClasses);

  return (
    <div className="group [perspective:1000px] rounded-[0.75rem] w-full h-full cursor-pointer">
      <div className={wrapperClasses}>
        {/* Front Face */}
        <div className={frontCardClasses}>
          {image && (
            <Image
              src={image}
              alt={imageAlt ?? ''}
              fill
              sizes="100vw"
              className={clsx(
                'absolute inset-0 z-0 object-cover',
                bgEffect &&
                  'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
              )}
            />
          )}
          {children}
        </div>
        {/* Back Face */}
        <div className={backCardClasses}>{back}</div>
      </div>
    </div>
  );
};

export default BentoDual;
