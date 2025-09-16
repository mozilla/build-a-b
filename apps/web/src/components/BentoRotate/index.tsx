import { FC } from 'react';
import Bento from '../Bento';
import Image from 'next/image';

const BentoRotate: FC = () => {
  return (
    <Bento className="group h-full py-8 bg-secondary-gray flex flex-col justify-center items-center cursor-pointer">
      <Image
        src="/assets/images/icons/plus.svg"
        width={60}
        height={70}
        className="group-hover:rotate-15 transition-transform duration-300"
        alt=""
      />
      <span className="text-charcoal mt-2 font-extrabold group-hover:-translate-y-0.5">
        Coming Soon
      </span>
    </Bento>
  );
};

export default BentoRotate;
