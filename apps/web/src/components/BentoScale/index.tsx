import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';

export interface BentoScaleProps extends BentoProps {}

const BentoScale: FC<BentoProps> = ({ image }) => {
  return (
    <Bento
      image={image}
      className="aspect-square group"
      imageClassName="transition-transform duration-500 ease-out group-hover:scale-120 group-hover:rotate-10"
    />
  );
};

export default BentoScale;
