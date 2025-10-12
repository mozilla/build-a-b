'use client';

import { useEffect, useState } from 'react';
import { setCookie, getCookie } from 'cookies-next';
import { Button } from '@heroui/react';

export default function PhysicalDeckButton() {
  const COOKIE_NAME = 'physical_deck_desire';
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue === 'true') {
      setAcknowledged(true);
    }
  }, []);

  const handleClick = () => {
    setCookie(COOKIE_NAME, 'true', { maxAge: 60 * 60 * 24 * 365 }); // 1 year
    setAcknowledged(true);
  };

  return (
    <Button
      onPress={handleClick}
      title="Express interest for a physical deck"
      className={`secondary-button landscape:w-fit
                  border-charcoal text-charcoal hover:border-charcoal
                  hover:bg-charcoal hover:text-common-ash
                  before:content-[""] before:inline-block before:w-4 before:h-4 before:mr-2
                  before:bg-current before:mask-[url(/assets/images/icons/hand.svg)]
                  before:mask-no-repeat before:mask-center before:mask-contain
                  ${acknowledged ? 'bg-charcoal text-common-ash pointer-events-none' : ''}`}
    >
      {acknowledged ? 'Desire acknowledged!' : 'I Want a Physical Deck!'}
    </Button>
  );
}
