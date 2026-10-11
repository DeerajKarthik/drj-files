import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { config } from '../config';
import { absoluteUrl } from '../utils/paths';
import { getPosts } from '../utils/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: config.siteName,
    description: config.description,
    site: context.site ?? 'http://localhost:4321',
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: absoluteUrl(`/writing/${post.id}`),
      categories: [post.data.section, ...post.data.tags],
      author: config.author,
    })),
    customData: `<language>${config.locale}</language>`,
  });
}
