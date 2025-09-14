import type { FC } from 'react';
import Image from 'next/image';
import { Button } from '@heroui/react';

const BaBIntro: FC = () => {
  return (
    <div className="p-4 flex flex-col h-full @variant landscape:flex-row @variant landscape:gap-32 @variant landscape:pl-16 @variant landscape:pr-16 @variant landscape:pt-[7.5rem] @variant landscape:pb-40">
      <div className="mb-2 flex-shrink-0 @variant landscape:mb-0 @variant landscape:flex-1">
        <Image
          src="/assets/images/Billionaire-Logo.svg"
          alt="Billionaire Logo"
          width={213}
          height={104}
          className="w-[10rem] h-[5rem] -rotate-[8deg] @variant landscape:w-[22.375rem] @variant landscape:h-[11rem] @variant landscape:-rotate-[15deg]"
        />
      </div>
      <div className="flex-1 flex flex-col items-center text-center justify-center min-h-0 @variant landscape:flex-1 @variant landscape:items-start @variant landscape:text-left @variant landscape:justify-start">
        <h1 className="text-2xl font-extrabold mb-3 @variant landscape:text-4xl-custom @variant landscape:mb-6">
          Make Space a Better Place. Add a Billionaire.
        </h1>
        <p className="mb-4 font-sharp font-semibold text-sm leading-[140%] text-[#F8F6F4] @variant landscape:mb-8 @variant landscape:text-lg">
          Why should billionaires be the only ones sending billionaires to space? WE want to send
          billionaires to space! Build your own and reclaim your data independence!
        </p>
        <div className="flex flex-col items-center w-full gap-3 @variant landscape:items-start @variant landscape:gap-0">
          <Button
            type="button"
            className="border border-[var(--colors-common-teal-500)] font-bold text-sm text-[var(--colors-common-teal-500)] rounded-full w-[calc(100%-2rem)] max-w-[24.3125rem] h-10 cursor-pointer hover:text-[var(--primary-charcoal)] hover:bg-[var(--colors-common-teal-500)] transition-colors duration-300 rotate-[2.259deg] @variant landscape:text-base @variant landscape:h-12 @variant landscape:w-[24.3125rem]"
          >
            Make a Custom Billionaire
          </Button>
          <Button
            type="button"
            className="border border-[var(--colors-common-teal-500)] font-bold text-sm text-[var(--colors-common-teal-500)] rounded-full w-[calc(100%-2rem)] max-w-[24.3125rem] h-10 cursor-pointer hover:text-[var(--primary-charcoal)] hover:bg-[var(--colors-common-teal-500)] transition-colors duration-300 -rotate-[1.772deg] @variant landscape:mt-6 @variant landscape:text-base @variant landscape:h-12 @variant landscape:w-[24.3125rem] @variant landscape:ml-16"
          >
            Get a Surprise Billionaire
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaBIntro;
