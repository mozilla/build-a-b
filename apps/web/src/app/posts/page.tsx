import { createClient } from '@sanity/client';
import Link from 'next/link';
import type { Metadata } from 'next';

// Skip static generation for this page since Sanity may not be configured
export const dynamic = 'force-dynamic';

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
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

  // Check if Sanity is configured
  if (!projectId || !dataset || projectId === 'undefined' || dataset === 'undefined') {
    return (
      <main className="prose mx-auto py-8">
        <h1>Posts</h1>
        <p>Sanity CMS is not configured. Please set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET environment variables.</p>
      </main>
    );
  }

  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion: '2025-01-01',
      useCdn: true,
    });

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
  } catch (error) {
    return (
      <main className="prose mx-auto py-8">
        <h1>Posts</h1>
        <p>Error loading posts: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </main>
    );
  }
}
