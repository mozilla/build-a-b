import {
  FC,
  ReactNode,
  cloneElement,
  isValidElement,
  ReactElement,
  Children,
  Fragment,
} from 'react';
import Image, { StaticImageData } from 'next/image';

interface CardProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
}

interface ChildProps {
  className?: string;
  [key: string]: any;
}

const defaultCardStyle =
  'relative overflow-hidden border border-white bg-[var(--primary-charcoal)]';

const Card: FC<CardProps> = ({ className, children, image, imageAlt }) => {
  const parentClassName = [defaultCardStyle, className].filter(Boolean).join(' ');

  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement(child) && child.type !== Fragment) {
      const el = child as ReactElement<ChildProps>;
      const merged = [el.props.className, 'relative z-10'].filter(Boolean).join(' ');
      return cloneElement(el, { className: merged });
    }

    // If it's a Fragment or a text node, wrap so we can apply z-10 safely
    if (child === null || child === undefined || child === false) return null;
    return <div className="relative z-10">{child as ReactNode}</div>;
  });

  return (
    <div className={parentClassName}>
      {image && (
        <Image
          src={image}
          alt={imageAlt ?? ''}
          fill
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover"
        />
      )}
      {childrenWithProps}
    </div>
  );
};

export default Card;
