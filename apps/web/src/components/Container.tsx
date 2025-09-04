import { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return (
    <div
      className="flex flex-col w-full max-w-[var(--container-width-portrait)]
                 landscape:max-w-[var(--container-width-landscape)] mx-auto"
    >
      {children}
    </div>
  );
};

export default Container;
