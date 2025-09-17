import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface SocialNetworkProps {
  socials: {
    href: string;
    title: string;
    alt: string;
    src: string;
  }[];
  isInModal: boolean;
}

const SocialNetwork: FC<SocialNetworkProps> = ({ socials, isInModal }) => {
  const navClass = isInModal
    ? 'social-network flex content-center'
    : 'social-network hidden landscape:flex content-center';

  return (
    <nav className={navClass} aria-label="Social media links">
      <ul className="flex flex-row content-center justify-center items-center gap-x-4">
        {socials.map(({ href, title, alt, src }) => (
          <li key={href}>
            <Link
              href={href}
              target="_blank"
              title={title}
              aria-label={title}
              className="relative inline-flex
                                    items-center justify-center
                                    rounded-full overflow-hidden 
                                    transition-transform duration-300
                                    hover:-rotate-30 group"
            >
              <Image src={src} alt={alt} width={42} height={42} className="" />
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
    </nav>
  );
};

export default SocialNetwork;
