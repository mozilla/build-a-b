import { ReactNode } from 'react';

//  px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
export interface ContainerProps {
  children: ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return <div className="flex flex-col w-full max-w-7xl mx-auto">{children}</div>;
};

export default Container;
