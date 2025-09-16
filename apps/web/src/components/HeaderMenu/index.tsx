'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HeaderMenu = () => {

    const pathname = usePathname();
    const links = [
        { href: '/', label: 'Home', title: 'Go to home' },
        { href: '/twitchcon', label: 'Twitchcon', title: 'Learn about Twitchcon' },
        { href: '/space-launch', label: 'Space Launch', title: 'More about Space Launch' },
        { href: '/datawar', label: 'Card Game', title: 'Play our game Data War' },
    ];

    return(
        <div className="main-navigation 
            font-sharp text-[0.75rem] font-bold uppercase">
            <nav aria-label="Main Navigation" className='hidden landscape:flex h-full justify-end'>
                <ul className='flex flex-row content-center justify-end items-center font-bold gap-3 text-[var(--colors-common-teal-500)]'>
                    {links.map(({href, label, title})=>(
                        <li key={href}>
                            <Link
                                href={href}
                                title={title}
                                aria-label={title}
                                aria-current={pathname === href ? 'page' : undefined}
                                className="inline-block p-3 py-2 text-nav-item 
                                        transform transition-all duration-300
                                        hover:-rotate-5
                                        hover:bg-gradient-to-r
                                        hover:form-accent
                                        hover:to-secondary-blue
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