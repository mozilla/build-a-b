import Link from 'next/link';
import { FC } from 'react';
import Bento from '@/components/Bento';

export interface ImageGalleryProps {
  images: {
    alt: string;
    src: string;
    href?: string;
    title?: string;
    isVideo: boolean;
    videoPosterPath?: string;
  }[];
}

const ImageGallery: FC<ImageGalleryProps> = ({ images }) => (
  <section className="mb-4 landscape:mb-8 flex flex-row flex-wrap justify-between gap-y-4 landscape:gap-8">
    {images.map(({ href, title, alt, src, isVideo, videoPosterPath }, index) => {
      const img = (
        <Bento
          image={src}
          imageAlt=""
          className="w-[10.5rem] landscape:w-[19rem] border-none aspect-square"
        />
      );

      const video = (
        <div 
          className='overflow-hidden w-[10.5rem] landscape:w-[19rem] border-none aspect-square relative'
        >
          <video
            src={src}
            width={640}
            height={640}
            poster={videoPosterPath}
            muted
            loop
            playsInline
            controls
            preload='metadata'
            className='block rounded-[0.75rem]'
          >
            Your browser does not support HTML5 video.
          </video>
        </div>
      );
      
      return (
        <div key={index} className="relative">
          {isVideo ? (
            video
          ): (href ? (
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
          ))}

        </div>
      );
    })}
  </section>
);

export default ImageGallery;
