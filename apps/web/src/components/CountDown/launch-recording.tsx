import Bento from '../Bento';
import Image from 'next/image';
import LinkButton from '../LinkButton';

const LaunchRecording = () => {
  const youtubePlayer = (
    <iframe
      className="w-full h-full"
      src="https://www.youtube.com/embed/-Mz8xJW4CNE?si=jJlbWqskMlMnpPtg"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  );

  return (
    <Bento
      className="landscape:aspect-[164/67]"
      image="/assets/images/space.webp"
      imageSizes="100vw"
    >
      <div
        className="relative aspect-[179/310] landscape:aspect-[164/67] p-4 landscape:p-12
                        bg-gradient-to-t from-black from-[20%] to-transparent
                        landscape:bg-gradient-to-r flex gap-4 flex-col landscape:flex-row"
      >
        <div className="flex flex-col gap-6 justify-center flex-1 pb-40 landscape:pb-0">
          <h6 className="text-nav-item">Watch The Space Launch</h6>
          <h1 className="text-title-1 text-5xl-custom landscape:text-6xl-custom">
            Bye bye, Billionaires!
          </h1>
          <div className="w-full aspect-video landscape:hidden">{youtubePlayer}</div>
          <p className="text-body-small">
            We did it, everyone. The Billionaires are now all safely off-planet and out of your
            personal data. Thanks to everybody who came by our TwitchCon booth or watched the launch
            online. Now, go be your quirky, curious, clever, creative selves and Open What You Want.
          </p>
          <LinkButton
            href="https://www.firefox.com/?utm_source=bbomicrosite&utm_medium=referral&utm_campaign=bbo"
            target="_blank"
            trackableEvent="click_firefox_owyw_logo"
            className="relative block w-60 h-22 mx-auto landscape:mx-0"
          >
            <Image
              src="/assets/images/firefox-open-white.webp"
              fill
              sizes="50vw"
              alt=""
              style={{ objectFit: 'contain' }}
            />
          </LinkButton>
        </div>
        <div className="hidden landscape:flex flex-col justify-center w-[40%]">
          <div className="w-full aspect-video">{youtubePlayer}</div>
        </div>
      </div>
    </Bento>
  );
};

export default LaunchRecording;
