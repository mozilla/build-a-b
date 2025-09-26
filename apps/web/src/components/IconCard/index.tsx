import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';
import Image, { StaticImageData } from 'next/image';
import Scrim from '../Scrim';
import clsx from 'clsx';

export interface IconCardProps extends BentoProps {
  icon: StaticImageData | string;
  iconAlt?: string;
  iconEffect?: boolean;
  wrapperClassName?: string;
  addScrim?: boolean;
}

const IconCard: FC<IconCardProps> = ({
  className,
  wrapperClassName,
  image,
  icon,
  iconAlt = '',
  iconEffect,
  addScrim,
  children,
}) => {
  const baseClass = 'relative p-6 flex flex-col gap-2 h-full rounded-xl justify-center';
  const cardContent = (
    <>
      <div className="relative w-[4rem] h-[4rem]">
        <Image
          src={icon}
          alt={iconAlt}
          fill
          sizes="10vw"
          className={iconEffect ? 'animate-float-tilt' : ''}
          style={{ animationDuration: `${6 + Math.random() * 4}s` }}
        />
      </div>
      {children}
    </>
  );

  return (
    <Bento
      image={image}
      imageClassName="rounded-xl"
      className={clsx('border-none flex-1 overflow-visible', className)}
    >
      {addScrim ? (
        <Scrim className={clsx(baseClass, wrapperClassName)}>{cardContent}</Scrim>
      ) : (
        <div className={clsx(baseClass, wrapperClassName)}>{cardContent}</div>
      )}
    </Bento>
  );
};

export default IconCard;
