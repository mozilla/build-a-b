import CountDown from '@/components/CountDown';
import { Suspense } from 'react';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import { avatarBentoData } from '@/utils/constants';
import Link from 'next/link';
import { evaluateFlag } from '@/app/flags';
import { notFound } from 'next/navigation';

export default async function Page() {
  // Check if DataWar feature is enabled
  const isDataWarEnabled = await evaluateFlag('showDataWar');
  
  if (!isDataWarEnabled) {
    notFound();
  }
  return (
    <>
      <section className="h-20 flex items-center justify-center pb-8">
        <Link href="/datawar/instructions" className="primary-button">
          Go to DataWar Instructions!
        </Link>
      </section>
      <CountDown
        targetDate="2025-10-18T10:20:30-07:00"
        cta={
          <Suspense fallback={<div>Loading...</div>}>
            <GetStarted
              {...(avatarBentoData.primaryFlowData as GetStartedProps)}
              ctaText="Build a Billionaire"
              triggerClassNames="secondary-button"
            />
          </Suspense>
        }
      />
    </>
  );
}
