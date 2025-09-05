import { FC, ReactNode } from 'react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface HeaderProps {
  className?: string;
  image?: StaticImport | string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  [key: string]: any /* Any additional props */;
}

const Header: FC<HeaderProps> = ({
  className,
  image,
  imageHeight,
  imageWidth,
  imageAlt,
}): ReactNode => {
  const style = className !== undefined ? className : '';
  return (
    <>
      <div
        className="relative z-10 w-[4rem] h-[0.5rem] text-[0.41rem] landscape:text-[1.475rem]
                      landscape:w-[13.8rem] landscape:h-[2rem]"
      >
        Header 2 component
      </div>
    </>
  );
};

export default Header;
