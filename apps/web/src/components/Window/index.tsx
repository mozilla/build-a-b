import clsx from 'clsx';
import Image from 'next/image';
import { FC, ReactNode } from 'react';

export interface WindowProps {
  children: ReactNode;
  className?: string;
  flip?: boolean;
}

const Window: FC<WindowProps> = ({ children, className, flip }) => {
  return (
    <div className="h-full w-full bg-gradient-to-r from-secondary-blue to-secondary-purple">
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-gray-303">
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
        {flip && (
          <Image
            src="/assets/images/icons/flip.svg"
            alt="Flip card"
            width={24}
            height={24}
            className="portrait:block landscape:hidden w-[2.625rem] h-[2.625rem] my-[-0.8125rem] mr-[-0.75rem] ml-auto"
          />
        )}
      </div>
      <div className={clsx('h-full flex flex-col justify-center', className)}>{children}</div>
    </div>
  );
};

export default Window;
