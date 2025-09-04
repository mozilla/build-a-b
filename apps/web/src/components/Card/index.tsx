import { FC, ReactNode, cloneElement, isValidElement, ReactElement } from 'react';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface CardsProps {
  className?: string;
  childStyle?: string;
  children?: ReactNode;
  image?: StaticImport | string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
}

interface ChildProps {
  className?: string;
  childStyle?: string;
  children?: ReactNode;
  image?: StaticImport | string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  [key: string]: any /* Any additional props */;
}

const defaultCardStyle =
  'border-[var(--colors-common-ash)] border-[0.03rem] landscape:border-[0.035rem] \
                          rounded-[0.20rem] landscape:rounded-[0.75rem] bg-[var(--colors-common-ash)]';

const Card: FC<CardsProps> = ({
  className,
  children,
  image,
  imageHeight,
  imageWidth,
  imageAlt,
}) => {
  const parentStyle = className !== '' || className !== undefined ? className : defaultCardStyle;
  /**
   * Clone children and inject props
   */
  const childrenWithProps =
    children && isValidElement(children)
      ? cloneElement(children as ReactElement<ChildProps>, {
          className,
          image,
          imageHeight,
          imageWidth,
          imageAlt,
        })
      : children;

  return (
    <div>
      {image !== undefined ? (
        <div className="absolute">
          <Image src={image} width={imageWidth} height={imageHeight} alt={imageAlt!} />
        </div>
      ) : null}
      {childrenWithProps}
    </div>
  );
};

export default Card;
