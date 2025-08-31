// import { getAllFlags } from '@/app/flags';
import Layout from '@/components/Layout';
import Container from '@/components/Container';

import Hero from '@/components/Hero';

export default async function Home() {
  // const flags = await getAllFlags();

  return (
    <Layout>
      <Container>
        <Hero />
      </Container>
    </Layout>
  );
}
