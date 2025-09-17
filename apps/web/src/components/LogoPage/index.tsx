import Image from 'next/image';
import Link from 'next/link';

const LogoPage = () => {
    return (
        
        <div className='logo-container '>
            <span className='rotate-5 landscape:-rotate-5 flex flex-row content-center h-full items-center justify-end'>
                <Link href="/home" tabIndex={0} className='flex flex-row content-center'>
                    <Image 
                        src="/assets/images/Billionaire-Logo.svg" 
                        alt='Billionaire Logo'
                        width={373}
                        height={220}
                        className='max-w-[4.125rem] landscape:max-w-[14rem]'
                    />
                </Link>
            </span>
        </div>
        
    );
};

export default LogoPage;