import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';

export interface BentoScaleProps extends BentoProps {}

const BentoScale: FC<BentoProps> = ({ image }) => {
  return (
    <Bento
      image={image}
      className="bg-gray-100 p-8 flex items-center justify-center h-full group"
      imageClassName="transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10"
    />
  );
};

export default BentoScale;
