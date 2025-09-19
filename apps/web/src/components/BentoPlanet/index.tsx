import { FC } from 'react';
import BentoDual from '../BentoDual';
import clsx from 'clsx';
import Image from 'next/image';

export interface BentoPlanetProps {
  className?: string;
}

const BentoPlanet: FC<BentoPlanetProps> = ({ className }) => {
  const back = (
    <div className="relative rounded-[0.75rem] w-full h-full">
      <Image
        src="/assets/images/placeholders/planet.jpg"
        alt={''}
        fill
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover scale-140"
      />
      <div className="flex flex-col gap-4 p-4 relative rounded-[0.75rem] w-full h-full bg-white/50 justify-center items-center text-center">
        <h2 className="text-charcoal text-title-1">How would your avatar live in space?</h2>
        <Image src="/assets/images/icons/camera.webp" width={60} height={70} alt="" />
        <h2 className="text-charcoal text-xl font-extrabold">Take a Space Selfie</h2>
      </div>
    </div>
  );

  return (
    <BentoDual
      className={clsx('aspect-square', className)}
      image="/assets/images/placeholders/planet.jpg"
      effect="flip"
      back={back}
    />
  );
};

export default BentoPlanet;
