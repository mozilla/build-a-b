import { FC, PropsWithChildren } from 'react';

const Window: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-full w-full bg-gradient-to-r from-secondary-blue to-secondary-purple">
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-gray-303">
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
        <span className="w-2.5 h-2.5 rounded-full border-2"></span>
      </div>
      <div className="h-full flex flex-col justify-center">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Window;
