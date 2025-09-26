import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

interface ScrimProps extends PropsWithChildren {
  className?: string;
}

const Scrim: FC<ScrimProps> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        "bg-[url('/assets/images/scrim.webp')] bg-cover bg-no-repeat bg-center",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Scrim;
