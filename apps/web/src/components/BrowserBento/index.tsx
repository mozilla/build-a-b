import type { FC, ReactNode } from 'react';
import ThreeDots from '../ThreeDots';
import Image from 'next/image';

export interface BrowserBentoProps {
  /**
   * Whether the component should be displayed in active state (white background, gradient borders).
   */
  inverse?: boolean;
  /**
   * A specific element that should be inversed.
   */
  inverseElement?: 'dots';
  /**
   * Whether the component should be displayed in white state (white background, black borders).
   */
  white?: boolean;
  /**
   * Whether the component should be displayed in gradient state (gradient background, black borders).
   */
  gradient?: boolean;
  /**
   * Optional classes for the outter container.
   */
  className?: string;
  /**
   * Child elements to render.
   */
  children?: ReactNode;
  /**
   * Whether the component should display a flip icon.
   */
  flips?: boolean;
  /**
   * An optional classname to replace the body bg color.
   */
  bodyBg?: string;
}

const BrowserBento: FC<BrowserBentoProps> = ({
  inverse = false,
  inverseElement,
  white = false,
  gradient = false,
  flips = false,
  className,
  bodyBg,
  children,
}) => {
  return (
    <div
      className={`flex flex-col rounded-[0.532rem] p-[0.125rem] 
                  ${inverse ? 'bg-gradient-to-r from-secondary-blue to-secondary-purple' : ''}
                  ${white || gradient ? 'bg-charcoal' : ''} 
                  ${className}`}
    >
      <div
        id="browser-bento-header"
        className={`flex flex-row justify-start items-center shrink-0 self-stretch 
                      rounded-t-[0.407rem] h-[1.551rem] px-[0.709rem] mb-0.5
                      ${inverse || gradient ? 'bg-gradient-to-r from-secondary-blue to-secondary-purple' : ''}
                      ${white ? 'bg-common-ash' : ''}
                      `}
      >
        <ThreeDots
          dotClassName={`${inverse || inverseElement === 'dots' ? 'border-common-ash' : 'border-charcoal'}`}
        />
        {flips && (
          <Image
            src="/assets/images/icons/flip.svg"
            alt="Flip card"
            width={24}
            height={24}
            className="absolute landscape:hidden w-[2.25rem] h-[2.25rem] -top-1 right-0"
          />
        )}
      </div>
      <div
        id="browser-bento-body"
        className={`relative flex flex-col grow justify-center items-start flex-1 self-stretch 
                      rounded-b-[0.407rem] overflow-hidden w-full
                      ${bodyBg || (inverse || white ? 'bg-common-ash' : 'bg-gradient-to-r from-secondary-blue to-secondary-purple')}
                    `}
      >
        {children}
      </div>
    </div>
  );
};

export default BrowserBento;
