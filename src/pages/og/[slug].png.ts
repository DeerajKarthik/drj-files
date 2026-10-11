import type { APIRoute, GetStaticPaths } from 'astro';
import { config } from '../../config';
import { renderOg, type OgInput } from '../../utils/og';
import { formatDate, getPosts, sectionTag } from '../../utils/posts';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts();
  const fallback: OgInput = { title: config.siteName, description: config.tagline, tag: 'NOTEBOOK' };
  return [
    { params: { slug: 'default' }, props: { card: fallback } },
    ...posts.map((post) => ({
      params: { slug: post.id },
      props: {
        card: {
          title: post.data.title,
          description: post.data.description,
          tag: sectionTag(post),
          date: formatDate(post.data.pubDate),
        } satisfies OgInput,
      },
    })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props['card'] as OgInput);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
