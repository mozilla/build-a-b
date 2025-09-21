import { FC } from 'react';
import Bento from '../Bento';
import Image from 'next/image';

const BentoPlaypenComingSoon: FC = () => {
  return (
    <Bento className="group h-full py-8 bg-secondary-gray flex flex-col justify-center items-center cursor-pointer">
      <Image
        src="/assets/images/icons/plus.webp"
        width={60}
        height={70}
        className="group-hover:rotate-15 transition-transform duration-300 h-auto"
        alt=""
      />
      <span className="text-charcoal mt-2 font-extrabold">Coming Soon</span>
    </Bento>
  );
};

export default BentoPlaypenComingSoon;
