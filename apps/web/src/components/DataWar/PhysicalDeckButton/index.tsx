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

  if (acknowledged) {
    return (
      <div className="text-common-teal flex items-center gap-2">
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.8719 1.27813C15.2984 1.67188 15.2984 2.36094 14.8719 2.75469L6.47187 11.1547C6.07812 11.5813 5.38906 11.5813 4.99531 11.1547L0.795312 6.95469C0.36875 6.56094 0.36875 5.87188 0.795312 5.47813C1.18906 5.05156 1.87812 5.05156 2.27187 5.47813L5.75 8.92344L13.3953 1.27813C13.7891 0.851563 14.4781 0.851563 14.8719 1.27813Z"
            fill="#329971"
          />
        </svg>
        <p>
          Roger that! Follow <strong>@firefox</strong> for future deck drops!
        </p>
      </div>
    );
  }

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
