'use client';

import { Button } from '@heroui/react';
import Image from 'next/image';
import type { FC } from 'react';
import MeetAstroBento from '../../MeetAstroBento';

export interface AvatarViewProps {
  /**
   * The avatar image url.
   */
  url: string;
  /**
   * Avatar name
   */
  name: string;
  /**
   * Avatar attributes.
   */
  attributes: string;
}

{
  /* TODO: Implement action handlers */
}
const actions = [
  { name: 'share', onPress: () => {} },
  { name: 'save', onPress: () => {} },
  { name: 'restart', onPress: () => {} },
];
const actionButtonStyles =
  'min-w-[6.0625rem] px-[0.625rem] border border-[var(--colors-common-teal-500)] font-bold text-[0.875rem] leading-[1.25rem] text-[var(--colors-common-teal-500)] rounded-full h-[2rem] cursor-pointer hover:text-[var(--primary-charcoal)] hover:bg-[var(--colors-common-teal-500)] transition-colors duration-300 gap-[0.375rem] flex items-center justify-center [&:hover_img]:brightness-50';

/**
 * Client side avatar view to use with the AvatarBento.
 */
const AvatarView: FC<AvatarViewProps> = ({ url, name, attributes }) => {
  return (
    <div className="absolute inset-[1.5rem] flex flex-col gap-[1.5rem] md:flex-row md:items-center z-20">
      <div className="w-full max-w-[23.4375rem] h-[23.4375rem] mx-auto md:mx-0 md:flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={url}
          alt="Avatar"
          width={375}
          height={375}
          className="w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-[3deg]"
        />
      </div>
      <div className="flex-1 flex flex-col gap-[1rem]">
        <MeetAstroBento
          activeContent={
            <div className="flex flex-col gap-1">
              <span className="text-[var(--primary-charcoal)] text-lg font-bold leading-6">
                Meet <span className="text-[var(--secondary-purple)]">{name}</span>
              </span>
              <span className="text-[var(--primary-charcoal)] text-base font-normal leading-5">
                Your <span className="font-bold">{attributes}</span> Billionaire
              </span>
            </div>
          }
          active
        />
        <div className="flex gap-[0.5rem]">
          {actions.map(({ name, onPress }) => (
            <Button
              key={name}
              type="button"
              className={actionButtonStyles}
              onPress={onPress}
              startContent={
                <Image
                  src={`/assets/images/${name}-icon.svg`}
                  alt=""
                  width={20}
                  height={20}
                  className="w-[1.25rem] h-[1.25rem]"
                />
              }
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarView;
