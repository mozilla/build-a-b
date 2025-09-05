const Header = () => {
  return (
    <>
      <div
        className="flex flex-col h-16 landscape:h-[10.9375rem] h-[2.95rem] relative
                   items-center justify-center w-full border-[var(--colors-common-ash)] rounded-[0.20rem]
                   landscape:rounded-[0.75rem] border-[0.03rem] landscape:border-[0.035rem]
                   portrait:mt-[1.15rem] landscape:mt-[4rem] bg-no-repeat bg-cover bg-[url(/assets/images/NightSky.svg)]"
      ></div>
    </>
  );
};

export default Header;
