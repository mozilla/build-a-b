"use client";
import { useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import HeaderMenu from '@/components/HeaderMenu';
import SocialNetwork from '@/components/SocialNetwork';
import {HeaderProps} from '@/components/Header';
import { FC } from 'react';

const MobileMenu:FC<HeaderProps> = ({ links, socials, ctaCopy, ctaLabel }) => {
    const [open, setOpen] = useState(false);
    const closeIcon = "/assets/images/close-icon.svg";
    const srcIcon = open ? closeIcon : "/assets/images/icons/menuMobile.svg";
    const altText = open ? "Close Menu" : "Open Menu";

    return (
        <div className="mobile-menu flex flex-row center-content items-center landscape:hidden">
            <div className="button-section">
                <button
                    onClick={() => setOpen(!open)}
                    className=""
                >
                    <Image
                        src={srcIcon}
                        width={24}
                        height={24} 
                        alt={altText}
                    />
                </button>
            </div>

            { open && (
                <div role="dialog" 
                className="fixed top-0 left-0 w-full 
                    bg-white shadow-md border-t h-dvh z-50
                    bg-[url(/assets/images/back_mobile.png)]
                    bg-no-repeat bg-center bg-cover p-8">
                    <div className="modal-container relative flex flex-col">
                        <div className="close-button absolute z-60 right-0">
                            <button onClick={() => setOpen(false)}>
                                <Image
                                    src={closeIcon}
                                    width={24}
                                    height={24} 
                                    alt={altText}
                                />
                            </button>
                        </div>

                        <div className='logo-container'>
                            <span className='flex'>
                                <Link href="/home" tabIndex={0} className='flex flex-row content-center'>
                                    <Image 
                                        src="/assets/images/Billionaire-Logo.svg" 
                                        alt='Billionaire Logo'
                                        width={373}
                                        height={220}
                                        className=''
                                        />
                                </Link>
                            </span>
                        </div>

                        <div className="menu-section pt-6">
                            <HeaderMenu
                                links={links}
                                isHorizontal={false}
                                isInModal={true}
                            />
                        </div>
                        <div className="social-media-section pt-6">
                            <SocialNetwork
                                socials={socials}
                                isInModal={true}
                            />
                        </div>
                        <div className="additional-data pt-6 text-[0.75rem]">
                            <p className="mb-4">
                                {ctaCopy.map((line, inx) => (
                                    <span key={inx}>
                                    {inx > 0 ? <br /> : null}
                                    {line}
                                    </span>
                                ))}                                
                            </p>
                            <Link href="#" className="rounded-button" title="Build an avatar now">
                                {ctaLabel}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileMenu;