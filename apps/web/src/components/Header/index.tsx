import Bento from '@/components/Bento';
import Image from 'next/image';

const Header = () => {
  return (
    <Bento
      className="h-16 landscape:h-[10.9375rem]
                    mb-3 landscape:mb-8
                    bg-no-repeat bg-cover bg-[url(/assets/images/NightSky.svg)]"
    >
      <div className="flex flex-col justify-between w-[6.125rem] h-[3rem]">
        <span className="flex">
          <Image
            src="/assets/images/Billionaire-Logo.svg"
            fill={true}
            alt="Billionaire Header Logo"
            style={{ objectFit: 'fill' }}
          />
        </span>
        <div className="flex">
          <Image src="/assets/images/MobileMenu.svg" fill={true} alt="Mobile Menu" />
        </div>
      </div>
    </Bento>
  );
};

export default Header;
