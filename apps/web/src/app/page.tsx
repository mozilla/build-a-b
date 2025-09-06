// import { getAllFlags } from 'flags'
import Container from '@/components/Container';
import Header from '@/components/Header';

export default async function Home() {
  // const flags = await getAllFlags();

  return (
    <Container>
      <Header />
      <main className="grid grid-cols-12 grid-rows-6 gap-8">
        <div className="col-span-7 row-span-2">
          {/* Avatar Bento */}
        </div>
        <div className="col-span-5 row-span-3 col-start-8">
          {/* Large Teaser Bento */}
        </div>
        <div className="col-span-7 row-start-3">
          {/* Action Buttons */}
        </div>
        <div className="col-span-4 row-start-4">
          {/* BBOOWYW Bento */}
        </div>
        <div className="col-span-4 row-span-2 col-start-5 row-start-4">
          {/* Small Teaser Bento (Data War) */}
        </div>
        <div className="col-span-4 row-span-2 col-start-9 row-start-4">
          {/* Small Teaser Bento (Twitchcon) */}
        </div>
        <div className="col-span-4 row-span-2 row-start-5">
          {/* Gallery Bento (Large) */}
        </div>
        <div className="col-span-2 col-start-5 row-start-6">
          {/* Gallery Bento (Small) */}
        </div>
        <div className="col-span-2 col-start-7 row-start-6">
          {/* Gallery Bento (Small) */}
        </div>
        <div className="col-span-2 col-start-9 row-start-6">
          {/* Gallery Bento (Small) */}
        </div>
        <div className="col-span-2 col-start-11 row-start-6">
          {/* Gallery Bento (Small) */}
        </div>
      </main>
    </Container>
  );
}
