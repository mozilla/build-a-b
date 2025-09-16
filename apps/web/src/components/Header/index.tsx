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
      <div className='header-container flex justify-between h-full pl-4 pr-4 landscape:pl-8 landscape:pr-8'>
        <div className='left-side flex flex-row h-full'>
          <LogoPage/>
        </div>
        <div className='right-side flex flex-row gap-x-3'>
          <HeaderMenu/>
          <SocialNetwork />
        </div>
      </div>
    </Bento>
  );
};

export default Header;
