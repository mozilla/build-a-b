import Link from 'next/link';

const SocialNetwork = () => {
    return (
        <div className="social-network hidden lg:block w-[15%] flex content-center"
            aria-label='Social media links'>
            <ul className='flex flex-row content-center justify-center items-center gap-[8px]'>
                <li>
                    <Link className='w-[40px] h-[40px] block transition 
                        bg-no-repeat bg-[url(/assets/images/SocialButtons/Tiktok.svg)]
                        hover:bg-[url(/assets/images/SocialButtons/Tiktok-hover.svg)]
                        hover:-rotate-20' 
                        href='https://www.tiktok.com/@firefox' 
                        target='_blank'
                        aria-label="Follow us on TikTok (opens in new tab)"
                        rel="noopener noreferrer">

                    </Link>
                </li>
                <li>
                    <Link className='w-[40px] h-[40px] block transition 
                        bg-no-repeat bg-[url(/assets/images/SocialButtons/Instagram.svg)]
                        hover:bg-[url(/assets/images/SocialButtons/Instagram-hover.svg)]
                        hover:-rotate-20' 
                        href='https://www.instagram.com/firefox' 
                        target='_blank'
                        aria-label="Follow us on Instagram (opens in new tab)"
                        rel="noopener noreferrer">

                    </Link>
                </li>
                <li>
                    <Link className='w-[40px] h-[40px] block transition 
                        bg-no-repeat bg-[url(/assets/images/SocialButtons/Youtube.svg)]
                        hover:bg-[url(/assets/images/SocialButtons/Youtube-hover.svg)]
                        hover:-rotate-20' 
                        href='https://youtube.com/firefoxchannel' 
                        target='_blank'
                        aria-label="Subscribe on Youtube (opens in new tab)"
                        rel="noopener noreferrer">

                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default SocialNetwork;