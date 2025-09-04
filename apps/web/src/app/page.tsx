// import { getAllFlags } from '@/app/flags';
import Layout from '@/components/Layout';
import Container from '@/components/Container';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Header2 from '@/components/Header2';

export default async function Home() {
  // const flags = await getAllFlags();

  return (
    <Layout>
      <Container>
        <div
          className="absolute w-screen min-h-screen top-0 left-0 shrink-0 bg-cover md:bg-cover
                   bg-[url(/assets/images/Grid.svg)]"
        ></div>
        <div
          className="absolute left-0 top-0 md:bg-cover bg-[url(/assets/images/grain-main.svg)]
                   shrink-0 w-screen min-h-screen mix-blend-soft-light"
        ></div>

        <div className="flex flex-col justify-center">
          <Header />
          <div className="mt-[2rem] min-h-[2rem]"></div>

          <Card
            className="flex h-[40rem] border-red border-[0.4rem] rounded-[4rem]"
            childStyle="flex h-[40rem] border-red border-[0.4rem] rounded-[4rem]"
            image="/assets/images/Avatar3ZoomMobile.svg"
            imageWidth={30 * 16}
            imageHeight={30 * 16}
            imageAlt="Background Image"
          >
            <Header2 />
          </Card>
        </div>
      </Container>
    </Layout>
  );
}
