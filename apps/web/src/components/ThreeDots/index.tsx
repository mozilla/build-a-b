import type { FC } from 'react';

interface ThreeDotsProps {
  className?: string;
  dotClassName?: string;
  white?: boolean;
}

const ThreeDots: FC<ThreeDotsProps> = ({ className = '', dotClassName = '', white = false }) => {
  const baseBorderColor = white ? 'border-white' : 'border-charcoal';

  return (
    <div className={`flex flex-row justify-start items-center gap-[0.355rem] ${className}`}>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`w-[0.516rem] h-[0.516rem] shrink-0 rounded-full border-[0.089rem] ${baseBorderColor} ${dotClassName}`}
        />
      ))}
    </div>
  );
};

export default ThreeDots;
