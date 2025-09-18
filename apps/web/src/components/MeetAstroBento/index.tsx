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
        container: 'w-[20.375rem] h-[10.25rem] landscape:w-[26.6875rem] landscape:h-[7.6875rem]', // 326x164px and 427x123px in rem
        body: 'h-[calc(8.699rem-4px)] landscape:h-[calc(6.1365rem-4px)]' // Adjusted body height to account for header
      };
    }
    return {
      container: active ? 'w-full' : 'w-[20.3125rem]',
      body: 'h-[10.825rem]'
    };
  };

  const sizeClasses = getSizeClasses();
  return (
    <div
      className={`z-[1] ${sizeClasses.container} rounded-[0.532rem] p-[2px] ${active ? 'bg-gradient-to-r from-secondary-blue to-secondary-purple' : 'bg-charcoal group-hover:bg-gradient-to-r group-hover:from-secondary-blue group-hover:to-secondary-purple'} transition-all duration-500`}
    >
      <div className="rounded-[calc(0.532rem-2px)] overflow-hidden bg-transparent">
        <div
          id="header"
          className={`flex h-[1.551rem] px-[0.709rem] flex-row justify-start items-center shrink-0 self-stretch rounded-t-[calc(0.532rem-2px)] border-b-2 ${active ? 'border-b-transparent bg-gradient-to-r from-secondary-blue to-secondary-purple' : 'border-charcoal group-hover:border-transparent bg-gradient-to-r from-secondary-blue to-secondary-purple group-hover:bg-common-ash'} transition-all duration-500`}
        >
          <ThreeDots
            dotClassName={`${active ? 'border-common-ash' : 'border-charcoal group-hover:border-common-ash'} transition-colors duration-500`}
          />
        </div>
        <div
          id="body"
          className={`relative flex ${sizeClasses.body} flex-col justify-center items-start flex-1 self-stretch rounded-b-[0.532rem] overflow-hidden transition-all duration-500`}
        >
          <div
            className={`absolute inset-0 ${active ? 'opacity-0' : 'bg-gradient-to-r from-secondary-blue to-secondary-purple group-hover:opacity-0'} transition-opacity duration-500`}
          ></div>
          <div
            className={`absolute inset-0 bg-common-ash ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-500`}
          ></div>
          <div
            className={`absolute inset-0 z-10 px-[1.476rem] py-[0.984rem] flex flex-col justify-center items-start gap-0.5 ${active ? '-translate-y-4 opacity-0' : 'translate-y-0 group-hover:-translate-y-4 opacity-100 group-hover:opacity-0'} transition-all duration-700`}
          >
            <span className="block text-common-ash text-2xl font-extrabold leading-8 whitespace-pre-line">
              {defaultContent}
            </span>
          </div>
          <div
            className={`absolute inset-0 z-10 flex flex-col justify-center items-start gap-0.5 px-[1.476rem] py-[0.984rem] ${active ? 'translate-y-0 opacity-100' : 'translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100'} transition-all duration-700`}
          >
            <span className="text-charcoal text-lg font-medium leading-6">{activeContent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetAstroBento;
