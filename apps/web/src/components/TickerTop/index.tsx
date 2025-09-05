import { TickerItem, tickerData } from '@/data/tickerData';

const TickerTop = () => {
  return (
    <div
      className="relative flex w-full h-[0.907rem] landscape:h-[4rem] rounded-[0.2022rem]
                 landscape:rounded-[0.75rem] border-[0.00944rem] landscape:border-[0.035rem] 
                 mt-[0.5394rem] landscape:mt-[2rem] py-[0.295rem] items-center landscape:items-center
                 bg-gradient-to-r from-[var(--secondary-blue)] to-[var(--secondary-purple)]
                 shrink-0 landscape:shrink-0"
    >
      <div className="flex w-full px-[0.5625] whitespace-nowrap overflow-hidden landscape:overflow-hidden">
        <div className="flex animate-scroll landscape:gap-[1.75rem]">
          {[...tickerData, ...tickerData].map((item: TickerItem) => (
            <div
              key={`${item.id}-${Math.random()}`}
              className="flex landscape:gap-[3.5rem] items-center mx-auto landscape:mx-auto h-full"
            >
              <span
                className="flex items-center text-white text-[0.32236rem] landscape:text-[1.2rem] font-bold uppercase
                         text-sm landscape:tracking-[0.096]"
              >
                {item.text}
              </span>
              <span className="mx-2 text-[0.5394rem] landscape:text-[2rem]">{item.emoji}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickerTop;
