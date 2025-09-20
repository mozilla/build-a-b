import Link from 'next/link';
import {FC} from 'react';
import Image from 'next/image';
import Bento from '@/components/Bento';

export interface ImageGalleryProps{
    images: {
        alt: string;
        src: string;
        href: string;
  }[];
}


const ImageGallery: FC<ImageGalleryProps> = ({images}) => {
    const imagesToDisplay = images.slice(0, 4);
    return(
        <section
            className='mb-4 landscape:mb-8'
        >
            <div 
                className='gallery-container flex 
                            flex-row flex-wrap
                            landscape:flex-nowrap
                            justify-between gap-4'
            >
                {imagesToDisplay.map(({ href, alt, src}) => (
                    <div
                        key={href}
                        className='gallery-image-item flex
                                    flex-row
                                    rounded-[0.75rem] relative'
                    >
                        {href.length > 0 && (
                            <Link
                                href={href}
                                target='_blank'
                                title={alt}
                                aria-label={alt}
                                className='w-full h-full'
                            >

                                <Bento
                                    image={src}
                                    imageAlt={alt}
                                    className='w-[10.5rem] landscape:w-[18rem] border-none aspect-square' 
                                />

                            </Link>
                        )}

                        {href.length === 0 && (
                            <Bento
                                image={src}
                                imageAlt=''
                                className='w-[10.5rem] landscape:w-[18rem] border-none aspect-square' 
                            />
                        )}
                    </div>
                ))}
            </div>

        </section>
    );
};

export default ImageGallery;

