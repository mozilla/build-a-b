import { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return (
    <div className="flex flex-col mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">{children}</div>
  );
};

export default Container;
