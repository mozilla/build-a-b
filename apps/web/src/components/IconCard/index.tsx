import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import Image, { StaticImageData } from 'next/image';

export interface IconCardProps extends BentoProps {
  icon: StaticImageData | string;
  iconAlt?: string;
}

const IconCard: FC<IconCardProps> = ({ image, icon, iconAlt = '', children }) => {
  return (
    <Bento image={image} className="border-none rounded-xl flex-1">
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
