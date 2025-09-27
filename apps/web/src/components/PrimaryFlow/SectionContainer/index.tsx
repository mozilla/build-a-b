'use client';

import { useState } from 'react';
import BrowserBento from '@/components/BrowserBento';


const SectionContainer = (
    { 
    }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const handleTouch = () => {
        if (window.matchMedia('(hover: none)').matches) {

            setIsFlipped(!isFlipped);
            setIsMobile(true);
        }
    };
    const styleForCard = !isMobile ? 'opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto' 
                : (!isFlipped ? 'opacity-0' : 'opacity-100' )
    return (
            <div className='h-full w-full block' onClick={handleTouch}>
              <div
                className="absolute z-20 bottom-0 w-full h-[14.3125rem] px-4 pb-4
                              landscape:bottom-[12.9375rem] landscape:right-[3rem] landscape:px-0 landscape:pb-0
                              landscape:w-[20.5625rem] landscape:h-[12.625rem]"
              >
                <div className="relative w-full h-full">
                  <BrowserBento gradient className="absolute h-full">
                    <span className="block text-common-ash text-2xl-custom font-extrabold px-[1.375rem]">
                      Unlimited power. Zero accountability. What could go wrong?
                    </span>
                  </BrowserBento>
                  <BrowserBento
                    inverse
                    className={`absolute h-full pointer-events-none transition-opacity duration-500 ${styleForCard}`}
                  >
                    <span className="text-charcoal text-sm-custom font-semibold p-6">
                      Unlike Big Tech Billionaires watching your every click, Firefox lets you play
                      (and browse) with privacy as the default. So let&apos;s build our own little
                      Billionaires and send them off-planet for good.
                    </span>
                  </BrowserBento>
                </div>
              </div>
            </div>
      
    );
};

export default SectionContainer;