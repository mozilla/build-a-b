import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import Image, { StaticImageData } from 'next/image';
import clsx from 'clsx';

export interface IconCardProps extends BentoProps {
  icon: StaticImageData | string;
  iconAlt?: string;
  wrapperClassName?: string;
}

const IconCard: FC<IconCardProps> = ({
  className,
  wrapperClassName,
  image,
  icon,
  iconAlt = '',
  children,
}) => {
  return (
    <Bento image={image} className={clsx('border-none rounded-xl flex-1', className)}>
      <div className={clsx('relative p-6 flex flex-col gap-2 h-full', wrapperClassName)}>
        <div className="relative w-[4rem] h-[4rem]">
          <Image src={icon} alt={iconAlt} fill sizes="4rem" className="icon-card" />
        </div>
        {children}
      </div>
    </Bento>
  );
};

export default IconCard;
