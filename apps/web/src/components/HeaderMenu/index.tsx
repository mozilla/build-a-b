'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

export interface HeaderMenuProps {
  links: {
    href: string;
    label: string;
    title: string;
  }[];
}

const HeaderMenu: FC<HeaderMenuProps> = ({ links }) => {

    const pathname = usePathname();


    return(
        <div className="main-navigation 
            font-sharp text-[0.75rem] font-bold uppercase">
            <nav aria-label="Main Navigation" className='text-accent uppercase font-bold hidden landscape:flex h-full justify-end'>
                <ul className='flex flex-row content-center justify-end items-center font-bold gap-3'>
                    {links.map(({href, label, title})=>(
                        <li key={href}>
                            <Link
                                href={href}
                                title={title}
                                aria-label={title}
                                aria-current={pathname === href ? 'page' : undefined}
                                className="inline-block p-3 py-2 text-nav-item 
                                        transform transition-all duration-300
                                        origin-left
                                        hover:-rotate-3 hover:translate-y-1
                                        hover:bg-gradient-to-r hover:from-accent hover:to-secondary-blue
                                        hover:bg-clip-text
                                        hover:text-transparent"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}

                </ul>
            </nav>
        </div>
    );
};

export default HeaderMenu;