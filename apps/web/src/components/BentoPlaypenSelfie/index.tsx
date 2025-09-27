'use client';

import { FC, useState } from 'react';
import Bento from '../Bento';
import Image from 'next/image';
import { Button } from '@heroui/react';
import { generateAvatarSelfie } from '@/utils/actions/generate-avatar-selfie';
import { usePrimaryFlowContext } from '../PrimaryFlow/PrimaryFlowContext';
import ProgressBar from '../ProgressBar';

const BentoPlaypenSelfie: FC = () => {
  const { setAvatarData } = usePrimaryFlowContext();
  const [isGeneratingSelfie, setIsGeneratingSelfie] = useState(false);
  return (
    <Bento
      className={`h-full py-8 flex flex-col justify-center items-center gap-2 border-accent!
                 relative group hover:cursor-pointer
                 ${
                   isGeneratingSelfie
                     ? 'bg-gradient-to-br from-common-ash to-accent'
                     : 'bg-common-ash! hover:bg-gradient-to-br hover:bg-gradient-to-r hover:from-secondary-blue hover:to-secondary-purple'
                 }`}
    >
      <Image
        src="/assets/images/icons/camera.webp"
        width={60}
        height={70}
        className="group-hover:-rotate-5 transition-transform duration-300 h-auto w-auto"
        alt=""
        priority
      />
      {!isGeneratingSelfie ? (
        <Button
          onPress={async () => {
            try {
              setIsGeneratingSelfie(true);
              const selfie = await generateAvatarSelfie();
              if (!selfie) return;

              setAvatarData((data) => {
                if (!data) return data;

                return { ...data, selfies: [...data.selfies, selfie] };
              });
            } catch (e) {
              // Do nothing.
            } finally {
              setIsGeneratingSelfie(false);
            }
          }}
          className="secondary-button border-charcoal text-charcoal group-hover:bg-accent group-hover:border-accent group-hover:-rotate-5 group-hover:scale-105 transition-transform duration-300"
        >
          Take a space selfie
        </Button>
      ) : (
        <ProgressBar duration={12000} />
      )}
    </Bento>
  );
};

export default BentoPlaypenSelfie;
