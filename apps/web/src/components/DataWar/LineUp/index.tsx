import Bento from '@/components/Bento';
import CardGallery from '@/components/DataWar/CardGallery';

const LineUp = () => {
  const CardData = {
    cards: [
      {
        cardTitle: 'Common Data',
        cardImgSrc: '/assets/images/cards/card-01.webp',
        cardImgAlt: 'Common Data Card',
        cardDesc: 'This card gives you points.',
      },
      {
        cardTitle: 'Trackers',
        cardImgSrc: '/assets/images/cards/card-02.webp',
        cardImgAlt: 'Trackers Card',
        cardDesc: 'This card boosts your point total.',
      },
      {
        cardTitle: 'Firewalls',
        cardImgSrc: '/assets/images/cards/card-03.webp',
        cardImgAlt: 'Firewalls Card',
        cardDesc: 'Follow instructions for some chaotic-good.',
      },
      {
        cardTitle: 'Billionaire Moves',
        cardImgSrc: '/assets/images/cards/card-04.webp',
        cardImgAlt: 'Billionaire Moves Card',
        cardDesc: 'Follow instructions for a little chaotic-evil.',
      },
      {
        cardTitle: 'Data Grab',
        cardImgSrc: '/assets/images/cards/card-05.webp',
        cardImgAlt: 'Data Grab Card',
        cardDesc: 'Quick! Grab as many cards from the play area as you can!',
      },
      {
        cardTitle: 'Launch Stacks',
        cardImgSrc: '/assets/images/cards/card-06.webp',
        cardImgAlt: 'Launch Stacks Card',
        cardDesc: 'No value (but essential). Collect 3 + 1 Billionaire to win!',
      },
      {
        cardTitle: 'Billionaires',
        cardImgSrc: '/assets/images/cards/card-07.webp',
        cardImgAlt: 'Billionaires Card',
        cardDesc: 'No value, collect and use special effects but save 1 to win!',
      },
      {
        cardTitle: 'One Way Ticket to Space',
        cardImgSrc: '/assets/images/cards/card-08.webp',
        cardImgAlt: 'One Way Ticket to Space Card',
        cardDesc: 'Price: 1 Billionaire + 3 Launch Stacks.',
      },
      {
        cardTitle: 'Blockers',
        cardImgSrc: '/assets/images/cards/card-09.webp',
        cardImgAlt: 'Blockers Card',
        cardDesc: 'Go on the offensive with these expansion pack exclusives.',
      },
      {
        cardTitle: 'Blanks',
        cardImgSrc: '/assets/images/cards/card-10.webp',
        cardImgAlt: 'Blanks Card',
        cardDesc: 'Hey, Billionaires make up rules all the time. Go nuts.',
      },
    ],
  };

  return (
    <Bento
      className="bg-cover bg-[url(/assets/images/background-dark-gray.webp)] landscape:bg-[url(/assets/images/background-dark-gray.webp)] 
                        relative portrait:mt-8 mb-4 landscape:mb-8 pl-3 pr-4 pt-4 pb-4 landscape:pl-12 landscape:pr-12
                        landscape:pt-12 landscape:pb-12"
    >
      <div>
        <h1 className="text-title-1 landscape:text-5xl-custom">The Lineup</h1>
        <p className="text-sm-custom">Meet the cards of Data War.</p>
      </div>

      <CardGallery cards={CardData.cards} />
    </Bento>
  );
};

export default LineUp;
