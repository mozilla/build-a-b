import { createClient } from '@sanity/client';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 60; // Revalidate this page every 60 seconds

export const metadata: Metadata = {
  title: 'Posts (ISR)',
  description: 'List of blog posts with ISR',
};

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
};

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: true,
});

export default async function ISRPostsPage() {
  const query = `*[_type == "post"]{_id, title, slug}`;
  const posts: Post[] = await client.fetch(query);

  return (
    <main className="prose mx-auto py-8">
      <h1>Posts (ISR)</h1>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>
            <Link href={`/posts/${post.slug.current}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
