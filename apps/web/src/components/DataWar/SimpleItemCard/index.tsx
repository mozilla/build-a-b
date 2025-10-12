'use client';

import { FC, PropsWithChildren, useRef, useEffect, useState, useLayoutEffect  } from 'react';
import { motion, useSpring, useMotionValue  } from 'framer-motion';
import Bento from '@/components/Bento';

export interface SimpleItemCardProps extends PropsWithChildren {
    title: string;
    prefixTitle?: string;
    image: string;
    imageAlt: string;
    addAnimation: boolean; 
}

const SimpleItemCard:FC<SimpleItemCardProps> =({
    children,
    title,
    prefixTitle,
    image,
    imageAlt,
    addAnimation,

}) =>{

    const TOP_PX = 0;
    const contentMT = 60;
    const sectionRef = useRef<HTMLElement | null>(null);
    const asideRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    
    const [maxShift, setMaxShift] = useState(0);
    const [sectionStartY, setSectionStartY] = useState(0);

    const y = useMotionValue(0);
    const ySmooth = useSpring(y, { stiffness: 300, damping: 40, mass: 0.5 });

    useLayoutEffect(() => {
        const computeSectionStart = () => {
            if (!sectionRef.current) return;
            if (window.matchMedia('(orientation: portrait)').matches) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const absTop = window.scrollY + rect.top;
            setSectionStartY(Math.max(0, absTop - TOP_PX));
        };
        computeSectionStart();
        window.addEventListener("resize", computeSectionStart);
        return () => window.removeEventListener("resize", computeSectionStart);
    }, []);

    useEffect(() => {
        const measure = () => {
            if (window.matchMedia('(orientation: portrait)').matches) return;
            const asideH = asideRef.current?.offsetHeight ?? 0;
            const contentH = (contentRef.current?.offsetHeight ?? 0) + contentMT;
            const vhAvail = window.innerHeight - TOP_PX;
            const visibleAsideH = Math.min(asideH, vhAvail);
            const maxAllowed = Math.max(0, contentH - visibleAsideH);
            const desired = Infinity;
            setMaxShift(Math.min(maxAllowed, desired));
        };    
        
        measure();
        const ro = new ResizeObserver(measure);
        if (asideRef.current) ro.observe(asideRef.current);
        if (contentRef.current) ro.observe(contentRef.current);
        window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };

    }, []);

    useEffect(() => {
        const onScroll = () => {
            if (window.matchMedia('(orientation: portrait)').matches) {
                y.set(0);
                return;
            }
            const delta = window.scrollY - sectionStartY;
            const next = Math.max(0, Math.min(delta, maxShift));
            y.set(next);
            
        };
        if (window.matchMedia('(orientation: landscape)').matches) {
            onScroll();
            window.addEventListener("scroll", onScroll, { passive: true });
        }
        
        
        return () => window.removeEventListener("scroll", onScroll);
    }, [sectionStartY, maxShift, y]);


    const dataForAside = (
                    <div className=''>
                        <div className='w-full'>
                            <div className='flex items-center flex-row mb-4'>
                                {prefixTitle && (
                                    <div className="text-xl-custom landscape:text-3xl-custom w-1/6 text-center">
                                        <span className="grid place-items-center rounded-full border-2 w-12 h-12 landscape:w-15 landscape:h-15">
                                            {prefixTitle}
                                        </span>
                                    </div>
                                )}
                                <h2 className="text-title-1 w-5/6">{title}</h2>

                            </div>
                        </div>                    
                        <Bento
                            image={image}
                            imageAlt={imageAlt}
                            className="aspect-[441/441]"
                        />
                    </div>

    );

    return(
        <section ref={sectionRef} className='mt-10 landscape:mt-20'>
            
            <div className='grid grid-cols-1 gap-4 landscape:grid-cols-3 landscape:gap-8 '>
                <aside 
                    className='landscape:col-span-1 landscape:sticky landscape:top-0 self-start'
                    style={{ top: TOP_PX}}
                    ref={asideRef}
                >
                    {addAnimation == true ? (
                        <motion.div style={{y: ySmooth, willChange: 'transform' }}>
                            {dataForAside}
                        </motion.div>
                    ) : (
                        <>
                            {dataForAside}
                        </>
                    ) }
                </aside>

                <div ref={contentRef} className='landscape:col-span-2 landscape:pl-8 mt-0 landscape:mt-15'>
                    {children}
                </div>
            </div>


        </section>
    );
};

export default SimpleItemCard;
