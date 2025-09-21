import Link from 'next/link';
import { FC } from 'react';
import Bento from '@/components/Bento';

export interface ImageGalleryProps {
  images: {
    alt: string;
    src: string;
    href?: string;
    title?: string;
  }[];
}

const ImageGallery: FC<ImageGalleryProps> = ({ images }) => (
  <section className="mb-4 landscape:mb-8 flex flex-row flex-wrap justify-between gap-y-4 landscape:gap-8">
    {images.map(({ href, title, alt, src }, index) => {
      const img = (
        <Bento
          image={src}
          imageAlt=""
          className="w-[10.5rem] landscape:w-[19rem] border-none aspect-square"
        />
      );
      return (
        <div key={index} className="relative">
          {href ? (
            <Link
              href={href}
              target="_blank"
              title={title}
              aria-label={alt}
              className="w-full h-full"
            >
              {img}
            </Link>
          ) : (
            img
          )}
        </div>
      );
    })}
  </section>
);

export default ImageGallery;
