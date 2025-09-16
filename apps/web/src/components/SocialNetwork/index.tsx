import Link from 'next/link';
import Image from 'next/image';



const SocialNetwork = () => {

const socials = [
    {
      href: 'https://www.tiktok.com/@firefox',
      title: 'Visit our TikTok',
      alt: 'TikTok',
      src: '/assets/images/SocialButtons/TikTok.svg',
    },
    {
      href: 'https://www.instagram.com/firefox/',
      title: 'Check our Instagram',
      alt: 'Instagram',
      src: '/assets/images/SocialButtons/Instagram.svg',
    },
    {
      href: 'https://www.youtube.com/firefoxchannel',
      title: 'Watch our YouTube channel',
      alt: 'YouTube',
      src: '/assets/images/SocialButtons/Youtube.svg',
    },
  ];


    return (
        <div className="social-network hidden landscape:flex content-center"
            aria-label='Social media links'>
            <ul className='flex flex-row content-center justify-center items-center gap-x-4'>
                {socials.map(({href, title, alt, src})=>(
                    <li key={href}>
                        <Link
                            href={href}
                            target='_blank'
                            title={title}
                            aria-label={title}
                            className="relative inline-flex
                                    items-center justify-center
                                    rounded-full overflow-hidden 
                                    transition-transform duration-300
                                    hover:-rotate-30 group"   
                        >
                            <Image 
                                src={src}
                                alt={alt}
                                width={42}
                                height={42}
                                className='w-8 landscape:w-10'
                            />
                            <span
                                className="absolute inset-0
                                            bg-gradient-to-br from-transparent to-secondary-blue
                                            opacity-0 group-hover:opacity-70
                                            transition-opacity duration-300" 
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SocialNetwork;