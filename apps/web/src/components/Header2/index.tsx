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
      <div className={style}></div>
    </>
  );
};

export default Header;
