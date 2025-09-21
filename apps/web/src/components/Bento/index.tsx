import { FC, ReactNode } from 'react';
import Image, { StaticImageData, ImageProps } from 'next/image';
import clsx from 'clsx';

export interface BentoProps {
  className?: string;
  children?: ReactNode;
  image?: StaticImageData | string;
  imageSrcLandscape?: StaticImageData | string;
  imageSrcPortrait?: StaticImageData | string;
  imageAlt?: string;
  imageAltLandscape?: string;
  imageAltPortrait?: string;
  imageClassName?: string;
  priority?: boolean;
  bgEffect?: boolean;
  imageProps?: Partial<ImageProps>;
  imagePropsPortrait?: Partial<ImageProps>;
  imagePropsLandscape?: Partial<ImageProps>;
}

const defaultStyle =
  'relative bg-charcoal border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem]';

const Bento: FC<BentoProps> = ({
  className,
  children,
  image,
  imageSrcLandscape,
  imageSrcPortrait,
  imageAlt,
  imageAltLandscape,
  imageAltPortrait,
  imageClassName,
  priority,
  bgEffect,
  imageProps,
  imagePropsPortrait,
  imagePropsLandscape,
  ...restProps
}) => (
  <div className={clsx(defaultStyle, className)}>
    {image && (
      <Image
        src={image}
        alt={imageAlt ?? ''}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={clsx(
          'absolute inset-0 object-cover', // Expand to cover the entire card
          bgEffect &&
            'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
          imageClassName,
        )}
        priority={priority}
        aria-hidden={!imageAlt}
        {...imageProps}
      />
    )}
    {imageSrcLandscape && (
      <Image
        src={imageSrcLandscape}
        alt={imageAlt ?? ''}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={clsx(
          'portrait:hidden absolute inset-0 object-cover', // Expand to cover the entire card
          bgEffect &&
            'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
          imageClassName,
        )}
        priority={priority}
        aria-hidden={!imageAlt}
        {...imagePropsLandscape}
      />
    )}
    {imageSrcPortrait && (
      <Image
        src={imageSrcPortrait}
        alt={imageAltPortrait ?? ''}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={clsx(
          'landscape:hidden absolute inset-0 object-cover', // Expand to cover the entire card
          bgEffect &&
            'transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10',
          imageClassName,
        )}
        priority={priority}
        aria-hidden={!imageAltPortrait}
        {...imagePropsPortrait}
      />
    )}
    {children}
  </div>
);

export default Bento;
