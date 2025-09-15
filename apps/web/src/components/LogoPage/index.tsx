import Image from 'next/image';
import Link from 'next/link';

const LogoPage = () => {
    return (
        
        <div className='logo-container landscape:w-[16%] justify-end'>
            {/* Mobile Logo */}
            <span className='hidden xs:max-lg:flex lg:hidden mobile-logo rotate-5 flex-row content-center h-full items-center justify-end'>
                <Link href="/home" tabIndex={0}>
                    <Image 
                        src="/assets/images/Billionaire-Logo.svg" 
                        alt='Billionaire Logo'
                        width={210}
                        height={103}
                    />
                </Link>
            </span>
            {/* Desktop logo*/}
            <span className='hidden lg:flex desktop-logo flex flex-row content-center h-full items-center justify-end'>
                <Link href="/home" tabIndex={0} className='flex flex-row content-center'>
                    <Image 
                        src="/assets/images/Billionaire-Logo.svg" 
                        alt='Billionaire Logo'
                        width={210}
                        height={103}
                    />
                </Link>
            </span>
        </div>
        
    );
};

export default LogoPage;