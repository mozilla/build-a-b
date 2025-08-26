// import { getAllFlags } from '@/app/flags';
import Layout from '@/components/Layout';
import Container from '@/components/Container';

export default async function Home() {
  // const flags = await getAllFlags();

  return (
    <Layout>
      <Container>
        <h1>Welcome to our website</h1>
        <p>Initial implementation for a microsite</p>
      </Container>
    </Layout>
  );
}
