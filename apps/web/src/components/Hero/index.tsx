import HeaderBanner from '@/components/HeaderBanner';

const Hero = () => {
  return (
    <div className="hero-container flex flex-col shrink-0 w-full min-h-screen sm:w-full md:w-full">
      <div
        className="hero-grid absolute w-screen min-h-screen top-0 left-0 shrink-0 bg-cover md:bg-cover
                   bg-[url(/assets/images/Grid.svg)]"
      ></div>
      <div
        className="hero-background absolute left-0 top-0 md:bg-cover bg-[url(/assets/images/grain-main.svg)]
                   shrink-0 w-screen min-h-screen mix-blend-soft-light"
      ></div>

      <div className="hero-content flex flex-col justify-center">
        <HeaderBanner />
      </div>
    </div>
  );
};

export default Hero;
