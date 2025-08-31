import { JSX } from 'react';
import Image from 'next/image';

export interface AvatarProps {
  path?: string;
  width?: number;
  height?: number;
  alt?: string;
}

const Avatar = ({ path, width, height, alt }: AvatarProps): JSX.Element => {
  return (
    <Image
      className="absolute top-[42px] left-[78px] aspect-[49/73] animate-[bounce_2.5s_ease-in_infinite]"
      src={path!}
      width={width}
      height={height}
      alt={alt!}
    ></Image>
  );
};

export default Avatar;
