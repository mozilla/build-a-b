import Bento from '@/components/Bento';
import Window from '@/components/Window';
import Image from 'next/image';
import Link from 'next/link';

const floatingImages = [
  {
    asset: 'animations/floater-footer.webp',
    className: 'absolute top-0 left-[14rem] h-25 w-25 rotate-[25deg] animate-float-tilt',
  },
  {
    asset: 'choice-cards/crypto.king.svg',
    className: 'absolute top-[3rem] left-[38rem] h-15 w-15 rotate-[25deg] animate-float-tilt-left',
  },
  {
    asset: 'astronaut.webp',
    className: 'absolute top-[2rem] right-[10rem] h-30 w-30 animate-float-tilt',
  },
  {
    asset: 'choice-cards/sea.lord.svg',
    className: 'absolute top-[12rem] right-[2rem] h-25 w-25 -rotate-[25deg] animate-float-tilt',
  },
  {
    asset: 'animations/flier2-header.webp',
    className:
      'absolute bottom-[2rem] right-[10rem] h-25 w-25 -rotate-[10deg] animate-float-tilt-left',
  },
  {
    asset: 'choice-cards/data.mine.svg',
    className:
      'absolute bottom-[3rem] left-[30rem] h-15 w-15 -rotate-[10deg] animate-float-tilt-right',
  },
  {
    asset: 'upside-down.webp',
    className: 'absolute bottom-[3rem] left-[7rem] h-40 w-40 -rotate-[10deg] animate-float-tilt',
  },
  {
    asset: 'choice-cards/chaos.svg',
    className: 'absolute top-[13rem] left-[5rem] h-15 w-15 -rotate-[10deg] animate-float-tilt-left',
  },
];

export default function NotFound() {
  return (
    <Bento
      image="/assets/images/nebula.webp"
      className="mb-4 landscape:mb-8 flex justify-between items-center p-8 landscape:p-20"
    >
      <Bento className="border-none max-w-[56rem] mx-auto">
        <Window className="bg-common-ash p-4">
          <div className="p-2 landscape:p-12 flex justify-center items-center flex-col-reverse landscape:flex-row gap-8">
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-nav-item text-charcoal">404 - PAGE NOT FOUND</h1>
              <h2 className="text-title-1 text-charcoal">You&apos;ve entered the void.</h2>
              <p className="text-body-regular text-charcoal">
                This place is crowded with Billionaires, sorry not sorry. Let&apos;s get you back
                down to earth.
              </p>
              <Link
                href="/"
                title="Back to home page"
                className="secondary-button border-charcoal text-charcoal hover:bg-charcoal hover:text-common-ash"
              >
                Billionaire Blast Off Home
              </Link>
            </div>
            <div>
              <figure className="relative w-[13.375rem] h-[6.5625rem] -rotate-[12deg]">
                <Image
                  src="/assets/images/bbo-logo.webp"
                  fill
                  sizes="80vw"
                  alt="Billionaire Blast Off logo"
                />
              </figure>
            </div>
          </div>
        </Window>
      </Bento>
      <div id="404-animations" className="portrait:hidden absolute inset-0 pointer-events-none">
        {floatingImages.map(({ asset, className }, index) => (
          <div
            key={index}
            className={className}
            style={{ animationDuration: `${6 + Math.random() * 6}s` }}
          >
            <Image
              src={`/assets/images/${asset}`}
              alt=""
              fill
              sizes="(max-width: 768px) 30vw, 20vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </Bento>
  );
}
