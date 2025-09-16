import Bento from '@/components/Bento';
import LogoPage from '@/components/LogoPage';
import HeaderMenu from '@/components/HeaderMenu';
import SocialNetwork from '@/components/SocialNetwork';

const Header = () => {
  return (
    <Bento
      className="h-16 landscape:h-[10.9375rem]
                    mb-3 landscape:mb-8
                    bg-no-repeat gap-[30px] bg-cover bg-[url(/assets/images/NightSky.svg)]"
    >
      <LogoPage/>
      <HeaderMenu/>
      <SocialNetwork />
    </Bento>
  );
};

export default Header;
