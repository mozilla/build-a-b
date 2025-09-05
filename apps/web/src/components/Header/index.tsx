import Bento from '@/components/Bento';

const Header = () => {
  return (
    <Bento
      className="h-16 landscape:h-[10.9375rem]
                    mb-3 landscape:mb-8
                    bg-no-repeat bg-cover bg-[url(/assets/images/NightSky.svg)]"
    ></Bento>
  );
};

export default Header;
