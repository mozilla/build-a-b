import { FC, ReactNode, cloneElement, isValidElement, ReactElement } from 'react';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface CardsProps {
  className?: string;
  childStyle?: string;
  children?: ReactNode;
  image?: StaticImport | string;
  imageAlt?: string;
  imageFillSize?: boolean;
}

interface ChildProps {
  className?: string;
  childStyle?: string;
  children?: ReactNode;
  image?: StaticImport | string;
  imageAlt?: string;
  ImageFillSize?: boolean;
  [key: string]: any /* Any additional props */;
}

const defaultCardStyle =
  'border-[var(--colors-common-ash)] border-[0.03rem] landscape:border-[0.035rem] \
                          rounded-[0.20rem] landscape:rounded-[0.75rem] bg-[var(--colors-common-ash)]';

const Card: FC<CardsProps> = ({
  className,
  childStyle,
  children,
  image,
  imageAlt,
  imageFillSize,
}) => {
  const parentStyle = className !== '' || className !== undefined ? className : defaultCardStyle;
  const imageFill = imageFillSize;
  /**
   * Clone children and inject props
   */
  const childrenWithProps =
    children && isValidElement(children)
      ? cloneElement(children as ReactElement<ChildProps>, {
          childStyle,
          image,
          imageAlt,
        })
      : children;

  return (
    <div className={parentStyle}>
      {image !== undefined ? (
        <div className={childStyle}>
          <Image src={image} alt={imageAlt!} fill={imageFill} style={{ objectFit: 'cover' }} />
        </div>
      ) : null}
      {childrenWithProps}
    </div>
  );
};

export default Card;
