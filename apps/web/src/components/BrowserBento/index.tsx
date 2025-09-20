import type { FC, ReactNode } from 'react';
import ThreeDots from '../ThreeDots';

export interface BrowserBentoProps {
  /**
   * Whether the component should be displayed in active state (white background, gradient borders).
   */
  inverse?: boolean;
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
}

const BrowserBento: FC<BrowserBentoProps> = ({
  inverse = false,
  white = false,
  gradient = false,
  className,
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
        <ThreeDots dotClassName={`${inverse ? 'border-common-ash' : 'border-charcoal'}`} />
      </div>
      <div
        id="browser-bento-body"
        className={`relative flex flex-col grow justify-center items-start flex-1 self-stretch 
                      rounded-b-[0.407rem] overflow-hidden w-full
                      ${inverse || white ? 'bg-common-ash' : 'bg-gradient-to-r from-secondary-blue to-secondary-purple'}
                    `}
      >
        {children}
      </div>
    </div>
  );
};

export default BrowserBento;
