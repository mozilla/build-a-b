import { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return (
    <div className="flex flex-col w-full px-[1rem] max-w-[82rem] mx-auto max-xl:px-[1rem]">
      {children}
    </div>
  );
};

export default Container;
