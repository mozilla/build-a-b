import { FC } from 'react';
import Link from 'next/link';

export interface TickerItem {
  id?: number;
  text: string;
  emoji?: string;
  hashtag?: string;
  href?: string;
}

export interface TickerProps {
  items?: TickerItem[];
  'aria-label'?: string;
}

const Ticker: FC<TickerProps> = ({ items, 'aria-label': ariaLabel }) => {
  const tickerData = items;

  const isHref = tickerData?.some((item) => item.href);

  return (
    <div
      role="marquee"
      aria-live="polite"
      aria-label={ariaLabel || 'Live updates ticker'}
      className="relative flex w-full h-[2.375rem] landscape:h-[4rem] rounded-[0.75rem]
                 landscape:rounded-[0.75rem] border-[0.125rem] landscape:border-[0.125rem]
                 border-common-ash landscape:border-common-ash
                 mt-[0.75rem] landscape:mt-[2rem] py-[0.295rem] items-center landscape:items-center
                 bg-gradient-to-r from-secondary-blue to-secondary-purple
                 shrink-0 landscape:shrink-0"
    >
      <div
        aria-hidden="true"
        className="flex w-full whitespace-nowrap overflow-hidden landscape:overflow-hidden"
      >
        <div
          role="list"
          aria-label="Scrolling ticker items"
          className={`flex ${isHref ? 'animate-scroll-with-pause' : 'animate-scroll-without-pause'}`}
        >
          {[...tickerData!, ...tickerData!].map((item: TickerItem, index: number) => (
            <div
              role="listitem"
              arial-label={`${item.text} ${item.hashtag ? `with hashtag ${item.hashtag}` : ''}`}
              key={`${item.id}-${index}`}
              className="flex items-center gap-[0.875rem] landscape:gap-[3.5rem] mx-auto landscape:mx-auto h-full"
            >
              <span
                role="text"
                aria-label={item.text}
                className={`flex mx-auto w-full items-center text-white text-[0.85rem] landscape:text-[1.2rem] font-bold uppercase
                           tracking-[0.068rem] landscape:tracking-[0.068rem] ${item.hashtag ? 'underline' : 'no-underline'}`}
              >
                {item.hashtag && item.href ? (
                  <Link
                    className="flex ml-[0.8rem] landscape:ml-[1.75rem]"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow ${item.text} on social media - opens in a new window.`}
                  >
                    {item.text}
                  </Link>
                ) : (
                  <span
                    role="text"
                    aria-label={item.text}
                    className="flex ml-[0.875rem] landscape:ml-[1.75rem]"
                  >
                    {item.text}
                  </span>
                )}
              </span>
              <span aria-hidden="true" className="mx-auto text-[1rem] landscape:text-[1.875rem]">
                {item.emoji}
              </span>
              {item.hashtag && (
                <>
                  <span
                    role="text"
                    aria-label={`Hashtag ${item.hashtag}`}
                    className="text-white mx-auto text-[0.8125rem] landscape:text-[1.08125rem] font-bold"
                  >
                    {item.hashtag}
                  </span>
                  <span aria-hidden="true" className="mx-2 text-[1rem] landscape:text-[1.875rem]">
                    {item.emoji}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ticker;
