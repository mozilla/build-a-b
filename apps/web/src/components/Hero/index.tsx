import HeaderBanner from '@/components/HeaderBanner';

const Hero = () => {
  return (
    <div className="hero-container flex flex-col shrink-0 w-full min-h-screen">
      <div className="hero-grid absolute w-screen min-h-screen top-0 left-0 shrink-0 bg-cover bg-[url(/hero/grid.png)]"></div>
      <div
        className="hero-background absolute left-0 top-0 bg-[url(/hero/grain-main-1440x1024.png)] shrink-0
                   w-screen min-h-screen mix-blend-soft-light"
      ></div>

      <div className="hero-content flex flex-col max-w-[82rem] justify-center">
        <HeaderBanner />
      </div>
    </div>
  );
};

export default Hero;
