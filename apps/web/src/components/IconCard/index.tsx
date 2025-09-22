import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import Image, { StaticImageData } from 'next/image';
import clsx from 'clsx';

export interface IconCardProps extends BentoProps {
  icon: StaticImageData | string;
  iconAlt?: string;
  iconEffect?: boolean;
  wrapperClassName?: string;
}

const IconCard: FC<IconCardProps> = ({
  className,
  wrapperClassName,
  image,
  icon,
  iconAlt = '',
  iconEffect,
  children,
}) => {
  return (
    <Bento
      image={image}
      imageClassName="rounded-xl"
      className={clsx('border-none flex-1 overflow-visible', className)}
    >
      <div className={clsx('relative p-6 flex flex-col gap-2 h-full rounded-xl', wrapperClassName)}>
        <div className="relative w-[4rem] h-[4rem]">
          <Image
            src={icon}
            alt={iconAlt}
            fill
            sizes="10vw"
            className={iconEffect ? 'animate-float-tilt' : ''}
          />
        </div>
        {children}
      </div>
    </Bento>
  );
};

export default IconCard;
