import clsx from 'clsx';
import { FC } from 'react';
import Image from 'next/image';

export interface SimpleCardProps {
    imageSrc: string;
    imageAlt: string;
    text: string;
    className?: string;

}
const defaultStyles = 'flex gap-4 p-6 landscape:flex-row landscape:content-center items-center rounded-xl landscape:gap-4 landscape:p-10 bg-gradient-to-r from-[#FFEA80] to-[#FF8A50]';

const SimpleCard:FC<SimpleCardProps> = ({imageAlt, imageSrc, text, className}) => {
    const classData = clsx(defaultStyles, className);
    return (
        <div className={classData}>
            <div className='block relative landscape:w-[4rem]'>
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    width={180}
                    height={180}
                    className=''

                />
            </div>
            <div>
                <p>{text}</p>
            </div>
        </div>
    );
};

export default SimpleCard;