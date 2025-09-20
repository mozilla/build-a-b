import clsx from 'clsx';
import { FC, ReactNode } from 'react';

export interface WindowProps {
  children: ReactNode;
  className?: string;
}

const Window: FC<WindowProps> = ({ children, className }) => {
  return (
    <div className="h-full w-full bg-gradient-to-r from-secondary-blue to-secondary-purple">
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-gray-303">
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
      </div>
      <div className={clsx('h-[calc(100%-1.75rem)] flex flex-col justify-center', className)}>
        {children}
      </div>
    </div>
  );
};

export default Window;
