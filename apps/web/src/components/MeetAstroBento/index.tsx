import type { FC, ReactNode } from 'react';
import ThreeDots from '../ThreeDots';

export interface MeetAstroBentoProps {
  /**
   * Default Content.
   */
  defaultContent?: ReactNode;
  /**
   * Content to be displayed on hover.
   */
  activeContent?: ReactNode;
  /**
   * Whether the component should be displayed in active state (white background, black borders).
   */
  active?: boolean;
  /**
   * Size variant for specific use cases
   */
  size?: 'default' | 'completion';
  /**
   * Optional classes for the outter container.
   */
  className?: string;
}

const MeetAstroBento: FC<MeetAstroBentoProps> = ({
  defaultContent,
  activeContent,
  active = false,
  size = 'default',
}) => {
  // Size classes based on variant
  const getSizeClasses = () => {
    if (size === 'completion') {
      return {
        container: 'w-[20.375rem] h-[10.25rem] landscape:w-[26.6875rem] landscape:h-[7.6875rem]',
        body: 'h-[calc(8.699rem-4px)] landscape:h-[calc(6.1365rem-4px)]',
      };
    }

    return {
      container: active ? 'w-full' : 'w-[20.3125rem]',
      body: 'h-[10.825rem]',
    };
  };

  return (
    <div
      className={`z-[1] w-full h-full rounded-[0.532rem] p-[0.125rem] 
                  ${
                    active
                      ? 'bg-gradient-to-r from-secondary-blue to-secondary-purple'
                      : 'bg-charcoal group-hover:bg-gradient-to-r group-hover:from-secondary-blue group-hover:to-secondary-purple'
                  } 
                  transition-all duration-500`}
    >
      <div className="flex flex-col rounded-[0.407rem] overflow-hidden bg-transparent h-full w-full">
        <div
          id="meet-astro-header"
          className={`flex flex-row justify-start items-center shrink-0 self-stretch 
                      rounded-t-[0.407rem] h-[1.551rem] px-[0.709rem] border-b-2 
                      ${
                        active
                          ? 'border-b-transparent bg-gradient-to-r from-secondary-blue to-secondary-purple'
                          : 'border-charcoal group-hover:border-transparent bg-gradient-to-r from-secondary-blue to-secondary-purple group-hover:bg-common-ash'
                      } 
                      transition-all duration-500`}
        >
          <ThreeDots
            dotClassName={`${active ? 'border-common-ash' : 'border-charcoal group-hover:border-common-ash'} transition-colors duration-500`}
          />
        </div>
        <div
          id="meet-astro-body"
          className={`relative flex flex-col grow justify-center items-start flex-1 self-stretch rounded-b-[0.532rem] overflow-hidden transition-all duration-500 w-full`}
        >
          <div
            className={`absolute inset-0 ${active ? 'opacity-0' : 'bg-gradient-to-r from-secondary-blue to-secondary-purple group-hover:opacity-0'} transition-opacity duration-500`}
          ></div>
          <div
            className={`absolute inset-0 bg-common-ash ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-500`}
          ></div>
          <div
            className={`absolute inset-0 z-10 px-[1.375rem] py-[0.984rem] flex flex-col justify-center items-start gap-0.5 ${active ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'} transition-all duration-700`}
          >
            <span className="block text-common-ash text-2xl-custom font-extrabold leading-8 whitespace-pre-line">
              {defaultContent}
            </span>
          </div>
          <div
            className={`absolute inset-0 z-10 flex flex-col justify-center items-start gap-0.5 px-[1.476rem] py-[0.984rem] ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-700`}
          >
            <span className="text-charcoal text-sm-custom font-semibold leading-6">
              {activeContent}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetAstroBento;
