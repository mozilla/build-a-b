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

          <Card
            className="flex relative w-[5.5rem] h-[5.5rem] landscape:h-[20rem] landscape:w-[20rem]
                       border-[0.028rem] rounded-[0.25rem] landscape:rounded-[0.75rem] landscape:mt-[4.8rem]
                       mt-[1.23rem]"
            image="/assets/images/sample/Avatar3ZoomMobile.svg"
            imageAlt="Background Image"
          >
            <Header2 />
          </Card>
        </div>
      </Container>
    </Layout>
  );
}
