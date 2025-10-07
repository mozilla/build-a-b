import { FC, PropsWithChildren } from 'react';
import Bento from '@/components/Bento';


export interface SimpleItemCardProps extends PropsWithChildren {
    title: string;
    prefixTitle?: string;
    image: string;
    imageAlt: string;
}

const SimpleItemCard:FC<SimpleItemCardProps> =({
    children,
    title,
    prefixTitle,
    image,
    imageAlt
}) =>{

    return(
        <div className='mt-10'>
            <div className='flex flex-row items-center'>
                <div className='w-full landscape:w-[45%] flex flex-row items-center'>
                    {prefixTitle && (
                        <div 
                            className='text-xl-custom landscape:text-3xl-custom  w-1/6 text-center'
                        >
                            <span className='block rounded-full border-2 w-12 h-12 leading-12 landscape:w-15 landscape:h-15 landscape:leading-14'>{prefixTitle}</span>
                        </div>
                    )}
                    <h2 className='text-title-1 w-5/6'>{title}</h2>

                </div>
                <div></div>
            </div>
            <div className='flex flex-col landscape:flex-row landscape:justify-between mt-5 gap-4'>
                <div className='w-full landscape:w-2/6'>
                    <Bento
                        image={image}
                        imageAlt={imageAlt}
                        className='aspect-[441/441]'
                    >

                    </Bento>
                </div>
                <div className='pl-0 landscape:pl-8 w-full landscape:w-4/6'>
                    {children}
                </div>
            </div>

        </div>
    );
};

export default SimpleItemCard;