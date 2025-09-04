import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <main
      role="main"
      aria-label="Main content area"
      className="w-full min-h-screen flex flex-col mx-auto sm:w-full"
    >
      {children}
    </main>
  );
};

export default Layout;
