import { FC } from 'react';
import Bento, { BentoProps } from '../Bento';

const BentoScale: FC<BentoProps> = ({ image }) => {
  return <Bento image={image} className="aspect-square group" bgEffect />;
};

export default BentoScale;
