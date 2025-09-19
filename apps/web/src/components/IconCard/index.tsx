import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import Image, { StaticImageData } from 'next/image';
import clsx from 'clsx';

export interface IconCardProps extends BentoProps {
  icon: StaticImageData | string;
  iconAlt?: string;
}

const IconCard: FC<IconCardProps> = ({ className, image, icon, iconAlt = '', children }) => {
  return (
    <Bento image={image} className={clsx('border-none rounded-xl flex-1', className)}>
      <div className="relative p-6 flex flex-col gap-2">
        <div className="relative w-[4rem] h-[4rem]">
          <Image src={icon} alt={iconAlt} fill />
        </div>
        {children}
      </div>
    </Bento>
  );
};

export default IconCard;
