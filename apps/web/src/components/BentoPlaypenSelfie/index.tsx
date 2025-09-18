import { FC } from 'react';
import Bento from '../Bento';
import Image from 'next/image';

const BentoPlaypenSelfie: FC = () => {
  return (
    <Bento
      className="h-full py-8 flex flex-col justify-center items-center gap-2 bg-common-ash! border-accent!
                 relative group hover:bg-gradient-to-br hover:bg-gradient-to-r hover:from-secondary-blue hover:to-secondary-purple
                 hover:cursor-pointer"
    >
      <Image
        src="/assets/images/icons/camera.svg"
        width={60}
        height={70}
        className="group-hover:-rotate-5 transition-transform duration-300"
        alt=""
      />
      <button className="rounded-button border-charcoal text-charcoal group-hover:bg-accent group-hover:border-accent group-hover:-rotate-5 group-hover:scale-105 transition-transform duration-300">
        Take a space selfie
      </button>
    </Bento>
  );
};

export default BentoPlaypenSelfie;
