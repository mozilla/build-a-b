import { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}
//  mx-auto sm:px-4 sm:py-6 md:px-8 md:py-8 lg:px-12 lg:py-10 xl:px-16 xl:py-12
const Layout = ({ children }: LayoutProps) => {
  return (
    <main role="main" aria-label="Main content area" className="w-full min-h-screen flex flex-col">
      {children}
    </main>
  );
};

export default Layout;
