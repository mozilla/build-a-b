'use client';

import PlaypenPopup from '@/components/PlaypenPopup';
import PlaypenRestart from '@/components/PlaypenPopup/PlaypenRestart';
import PlaypenSave from '@/components/PlaypenPopup/PlaypenSave';
import PlaypenShare from '@/components/PlaypenPopup/PlaypenShare';
import { type Action, type ActionType, type ActionTypeOrNull, type AvatarData } from '@/types';
import { Button } from '@heroui/react';
import Image from 'next/image';
import { Fragment, useEffect, useMemo, useState, type FC } from 'react';
import BrowserBento from '../../BrowserBento';
import { actionTypes } from '@/utils/constants';

const actionButtonStyles =
  'min-w-[6.0625rem] px-[0.625rem] border border-accent font-bold text-[0.875rem] leading-[1.25rem] text-accent rounded-full h-[2rem] cursor-pointer hover:text-charcoal hover:bg-accent transition-colors duration-300 gap-[0.375rem] flex items-center justify-center [&:hover_img]:brightness-50';

/**
 * Client side avatar view to use with the AvatarBento.
 */
const AvatarView: FC<AvatarData> = ({
  url,
  name,
  bio,
  uuid,
  instragramAsset,
  originalRidingAsset,
  selfies,
  selfieAvailability
}) => {
  const [navigatorShareAvailable, setNavigatorShareAvailable] = useState<boolean>(false);
  const [actionType, setActionType] = useState<ActionTypeOrNull>(null);

  useEffect(() => {
    /**
     * Feature detected and prop drilled to eliminate flash of conditional
     * rendering within the consuming AvatarShare component.
     */
    setNavigatorShareAvailable(
      'canShare' in navigator && navigator.canShare({ title: 'feature-detect' }),
    );
  }, []);

  const handleModalClose = (open: boolean) => {
    if (!open) setActionType(null);
  };

  const actions: Record<ActionType, Action> = useMemo(
    () => ({
      share: {
        onPress: () => setActionType('share'),
        content: {
          title: 'Your Billionaire Vault',
          description:
            'This is your gallery of Billionaire antics. Every cringe, every flex, every pixel of excess—saved for your scrolling pleasure.',
        },
      },
      save: {
        onPress: () => setActionType('save'),
        content: {
          title: 'Your All Access Pass',
          description:
            'Here’s your personal portal to everything you’ve amassed — bully Billionaires, playpen pandemonium, and exclusive content. Use the link or scan the QR code to return to your collection anytime.',
        },
      },
      restart: {
        onPress: () => setActionType('restart'),
        content: {
          title: 'Ready for a do-over?',
          description:
            'If so, this old Billionaire’s empire stays in your gallery, but it’s retired from the launchpad. All new creations blast off with your new Billionaire, whoever they may be.',
        },
      },
    }),
    [],
  );

  return (
    <div className="absolute inset-[1.5rem] flex flex-col gap-[1.5rem] md:flex-row md:items-center z-20">
      <div className="w-full max-w-[23.4375rem] h-[23.4375rem] mx-auto md:mx-0 md:flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={url}
          alt="Billionaire"
          width={375}
          height={375}
          className="w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:rotate-[3deg] object-cover"
          style={{ objectPosition: 'center 5%' }}
        />
      </div>
      <div className="flex-1 flex flex-col gap-[1rem]">
        <div className="w-[19.0625rem]">
          <BrowserBento white>
            <div className="flex flex-col gap-1 p-[1.5rem]">
              <span className="text-charcoal text-base font-semibold leading-6">
                Meet <span className="text-secondary-purple font-extrabold capitalize">{name}</span>
                , your {bio}
              </span>
            </div>
          </BrowserBento>
        </div>
        <div className="flex gap-[0.5rem]">
          {actionTypes.map((actionName) => {
            const action = actions[actionName];

            return (
              <Fragment key={actionName}>
                <Button
                  type="button"
                  className={actionButtonStyles}
                  onPress={action.onPress}
                  startContent={
                    <Image
                      src={`/assets/images/${actionName}-icon.svg`}
                      alt=""
                      width={20}
                      height={20}
                      className="w-[1.25rem] h-[1.25rem]"
                    />
                  }
                >
                  {actionName}
                </Button>
                <PlaypenPopup
                  title={action.content.title}
                  isOpen={actionType === actionName}
                  onOpenChange={handleModalClose}
                >
                  {actionName === 'share' && (
                    <PlaypenShare<ActionType>
                      action={action}
                      navigatorShareAvailable={navigatorShareAvailable}
                      avatar={{
                        url,
                        name,
                        bio,
                        uuid,
                        instragramAsset,
                        originalRidingAsset,
                        selfies,
                        selfieAvailability
                      }}
                      setActionType={setActionType}
                      saveActionValue="save"
                    />
                  )}
                  {actionName === 'save' && <PlaypenSave action={action} />}
                  {actionName === 'restart' && (
                    <PlaypenRestart
                      action={action}
                      avatar={{
                        url,
                        name,
                        bio,
                        uuid,
                        instragramAsset,
                        originalRidingAsset,
                        selfies,
                        selfieAvailability
                      }}
                      onCancel={() => setActionType(null)}
                    />
                  )}
                </PlaypenPopup>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvatarView;
