const Header = () => {
  return (
    <>
      <div
        className="flex flex-col h-16 landscape:h-[10.9375rem] portrait:h-[2.98rem] relative
                   items-center justify-center w-full border-[var(--colors-common-ash)] rounded-[0.75rem]
                   portrait:rounded-[0.3rem] border-[0.125rem] portrait:border-[0.035rem] portrait:mt-[1.15rem] landscape:mt-[4rem]
                   bg-no-repeat bg-cover bg-[url(/assets/images/NightSky.svg)]"
      ></div>
    </>
  );
};

export default Header;
