import Bento from '@/components/Bento';
import Window from '@/components/Window';
import Image from 'next/image';
import Link from 'next/link';

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
    </Bento>
  );
}
