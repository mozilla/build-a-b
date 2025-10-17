import clsx from 'clsx';
import Image from 'next/image';
import { FC, PropsWithChildren } from 'react';

interface ScrimProps extends PropsWithChildren {
  className?: string;
}

const Scrim: FC<ScrimProps> = ({ className, children }) => {
  return (
    <div className={clsx('relative', className)}>
      <Image
        src="/assets/images/scrim.webp"
        alt=""
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Scrim;
