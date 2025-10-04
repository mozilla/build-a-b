import BasicInstructions from "@/components/DataWar/BasicInstructions";
import CountDown from "@/components/CountDown";
import { Suspense } from 'react';
import GetStarted, { type GetStartedProps } from '@/components/PrimaryFlow/GetStarted';
import { avatarBentoData } from '@/utils/constants';


export default async function Page() {
    return (
        <>
        <BasicInstructions/>
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