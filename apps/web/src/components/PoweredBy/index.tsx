import Image from 'next/image';
import type { FC } from 'react';

const PoweredBy: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex justify-end items-center gap-2 text-lg-custom mt-2 ${className}`}>
      Powered by
      <div className="relative h-[2rem] w-[6rem]">
        <Image src="/assets/images/firefox-logo.png" alt="Firefox logo" fill sizes="10vw" />
      </div>
    </div>
  );
};

export default PoweredBy;
