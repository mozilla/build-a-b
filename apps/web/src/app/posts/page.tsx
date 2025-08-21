import { createClient } from '@sanity/client';
import Link from 'next/link';
import type { Metadata } from 'next';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: true,
});

export const metadata: Metadata = {
  title: 'Posts',
  description: 'List of blog posts',
};

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
};

export default async function PostsPage() {
  const query = `*[_type == "post"]{_id, title, slug}`;
  const posts: Post[] = await client.fetch(query);

  return (
    <main className="prose mx-auto py-8">
      <h1>Posts</h1>
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
