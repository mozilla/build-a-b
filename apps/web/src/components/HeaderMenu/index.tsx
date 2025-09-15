import Link from 'next/link';

const HeaderMenu = () => {
    return(
        <div className="main-navigation hidden lg:block landscape:w-[70%] 
            font-(family-name:--font-sharp-sans) text-[16px] font-bold uppercase">
            <nav aria-label="Main Navigation" className='flex h-full justify-end'>
                <ul className='flex flex-row content-center justify-end items-center gap-[60px] text-[var(--colors-common-teal-500)]'>
                    <li>
                        <Link href="/home" 
                            aria-label='Go to Homepage'
                            className='block transition menu-item-hover hover:-rotate-5' 
                            tabIndex={0}>Home</Link>
                    </li>
                    <li>
                        <Link 
                            href="/twitchcon"
                            aria-label='Go to TwitchCon page' 
                            className='block transition menu-item-hover hover:-rotate-5' 
                            tabIndex={0}>TwitchCon</Link>
                    </li>
                    <li>
                        <Link 
                            href="/space-launch" 
                            aria-label='Go to Space Launch page'
                            className='block transition menu-item-hover hover:-rotate-5' 
                            tabIndex={0}>Space Launch</Link>
                    </li>
                    <li>
                        <Link 
                            href="/datawar" 
                            aria-label='Go to Card Game page'
                            className='block transition menu-item-hover hover:-rotate-5' 
                            tabIndex={0}>Card Game</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default HeaderMenu;