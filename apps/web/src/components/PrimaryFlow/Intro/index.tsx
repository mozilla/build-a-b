'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { Button } from '@heroui/react';

export interface IntroProps {
  title: string;
  description: string;
  createAvatarCtaText: string;
  randomAvatarCtaText: string;
}

// TODO: Implement image positioning for mobile once we have designs ready.
const floatingImages = [
  {
    id: 1,
    className:
      'hidden @variant landscape:block absolute top-[2rem] left-[2rem] w-[9.3125rem] h-[13.875rem]',
    style: { animation: 'float 3s ease-in-out infinite' },
  },
  {
    id: 2,
    className:
      'hidden @variant landscape:block absolute bottom-[11rem] right-[1rem] w-[10.6875rem] h-[12.6625rem] scale-x-[-1]',
    style: { animation: 'float 4s ease-in-out infinite 0.5s' },
  },
  {
    id: 3,
    className:
      'hidden @variant landscape:block absolute top-[13rem] left-[20rem] w-[7.9375rem] h-[7.71875rem] z-1',
    style: { animation: 'float 3.5s ease-in-out infinite 1s' },
  },
  {
    id: 4,
    className:
      'hidden @variant landscape:block absolute top-[-0.5rem] right-[5rem] w-[6.8125rem] h-[7.9375rem]',
    style: { animation: 'float 5s ease-in-out infinite 1.5s' },
  },
  {
    id: 5,
    className:
      'hidden @variant landscape:block absolute bottom-[10rem] left-[-3rem] w-[6.39375rem] h-[6.39375rem] rotate-[18deg]',
    style: { animation: 'float 2.8s ease-in-out infinite 2s' },
  },
  {
    id: 6,
    className:
      'hidden @variant landscape:block absolute top-[-2rem] right-[29rem] w-[6.39375rem] h-[6.39375rem] rotate-[-139deg]',
    style: { animation: 'float 4.2s ease-in-out infinite 0.8s' },
  },
  {
    id: 7,
    className:
      'hidden @variant landscape:block absolute bottom-[-2rem] left-[2.5rem] w-[11.21875rem] h-[11.21875rem] rotate-[17deg]',
    style: { animation: 'float 3.8s ease-in-out infinite 1.2s' },
  },
  {
    id: 8,
    className:
      'hidden @variant landscape:block absolute bottom-[0rem] right-[18rem] w-[10.42375rem] h-[10.42375rem] rotate-[12deg]',
    style: { animation: 'float 4.5s ease-in-out infinite 0.3s' },
  },
  {
    id: 9,
    className:
      'hidden @variant landscape:block absolute bottom-[-1rem] right-[28rem] w-[14.0625rem] h-[14.0625rem] rotate-[-5.7deg]',
    style: { animation: 'float 3.2s ease-in-out infinite 1.8s' },
  },
  {
    id: 10,
    className:
      'hidden @variant landscape:block absolute top-[1.5rem] right-[-4rem] w-[8.125rem] h-[8.125rem] rotate-[-18.5deg]',
    style: { animation: 'float 4.8s ease-in-out infinite 0.7s' },
  },
  {
    id: 11,
    className:
      'hidden @variant landscape:block absolute top-[1rem] left-[21.2rem] w-[5.5rem] h-[8.375rem] z-1',
    style: { animation: 'float 3.6s ease-in-out infinite 2.2s' },
  },
];

const Intro: FC<IntroProps> = ({
  title,
  description,
  createAvatarCtaText,
  randomAvatarCtaText,
}) => {
  return (
    <div className="relative p-4 flex flex-col h-full overflow-hidden @variant landscape:flex-row @variant landscape:gap-32 @variant landscape:px-16 @variant landscape:pt-[6rem] @variant landscape:pb-40">
      {/* Floating Images */}
      {floatingImages.map(({ id, className, style }) => (
        <div key={id} className={className} style={style}>
          <Image
            src={`/assets/images/intro-modal/${id}.png`}
            alt={`Floating character ${id}`}
            fill
            className="object-contain"
          />
        </div>
      ))}

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
          {title}
        </h1>
        <p className="mb-4 font-sharp font-semibold text-sm leading-[140%] text-[#F8F6F4] @variant landscape:mb-8 @variant landscape:text-lg">
          {description}
        </p>
        <div className="flex flex-col items-center w-full gap-3 @variant landscape:items-start @variant landscape:gap-0">
          <Button
            type="button"
            className="border border-accent font-bold text-sm text-accent rounded-full w-[calc(100%-2rem)] max-w-[24.3125rem] h-10 cursor-pointer hover:text-charcoal hover:bg-accent transition-colors duration-300 rotate-[2.259deg] @variant landscape:text-base @variant landscape:h-12 @variant landscape:w-[24.3125rem]"
          >
            {createAvatarCtaText}
          </Button>
          <Button
            type="button"
            className="border border-accent font-bold text-sm text-accent rounded-full w-[calc(100%-2rem)] max-w-[24.3125rem] h-10 cursor-pointer hover:text-charcoal hover:bg-accent transition-colors duration-300 -rotate-[1.772deg] @variant landscape:mt-6 @variant landscape:text-base @variant landscape:h-12 @variant landscape:w-[24.3125rem] @variant landscape:ml-16"
          >
            {randomAvatarCtaText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Intro;
