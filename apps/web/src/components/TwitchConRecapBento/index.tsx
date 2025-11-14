import Image from 'next/image';
import LinkButton from '@/components/LinkButton';

export default function TwitchConRecapBento({
  version: _version,
}: {
  version: 'phase2c' | 'phase4';
}) {
  return (
    <div className="relative h-full w-full border-common-ash border-[0.125rem] overflow-hidden rounded-[0.75rem] bg-charcoal">
      {/* Background Image - positioned top right */}
      <div className="absolute inset-0 pointer-events-none rounded-[0.75rem]">
        <Image
          src="/assets/images/blast-twitchcon.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-top-right"
          style={{ objectPosition: 'top right' }}
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col gap-4 items-start justify-end p-10">
        <p className="text-nav-item text-common-ash">TWITCHCON RECAP</p>
        <h2 className="text-title-1 text-3xl-custom text-common-ash">Two launches in one</h2>
        <p className="text-body-large text-common-ash">
          We launched a new card game, Data War, and we launched a little ship full of Billionaires
          into space. Couldn&apos;t join us IRL at TwitchCon? Quell your FOMO right here.
        </p>
        <LinkButton
          href="/twitchcon"
          title="Go to TwitchCon recap"
          className="secondary-button border-accent text-accent hover:bg-accent hover:text-charcoal active:bg-accent active:text-charcoal"
          trackableEvent="click_twitchcon_recap_cta"
        >
          TwitchCon Recap
        </LinkButton>
      </div>
    </div>
  );
}
