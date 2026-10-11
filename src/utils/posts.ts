import { getCollection, type CollectionEntry } from 'astro:content';
import { sections, type SectionKey } from '../config';
import { readingTime } from './readingTime';
import { slugify } from './slug';
import { href } from './paths';

export type Post = CollectionEntry<'writing'>;

/** All publishable posts, newest first. Drafts show in dev only. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const postHref = (post: Post): string => href(`/writing/${post.id}`);
export const postMinutes = (post: Post): number => readingTime(post.body);
export const sectionTag = (post: Post): string => sections[post.data.section].tag;
export const sectionLabel = (key: SectionKey): string => sections[key].label;

/** Featured posts first, then the rest, each group newest first. */
export function orderForGrid(posts: Post[]): Post[] {
  return [...posts.filter((p) => p.data.featured), ...posts.filter((p) => !p.data.featured)];
}

export function postsInSection(posts: Post[], key: SectionKey): Post[] {
  return posts.filter((p) => p.data.section === key);
}

export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getUTCFullYear();
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, list]) => ({ year, posts: list }));
}

export interface TagInfo {
  tag: string;
  slug: string;
  count: number;
}

export function collectTags(posts: Post[]): TagInfo[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugify(tag);
      const entry = counts.get(slug);
      counts.set(slug, { tag: entry?.tag ?? tag, count: (entry?.count ?? 0) + 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, { tag, count }]) => ({ tag, slug, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function postsWithTag(posts: Post[], slug: string): Post[] {
  return posts.filter((p) => p.data.tags.some((t) => slugify(t) === slug));
}

/** Up to `limit` other posts ranked by shared tags, then recency. */
export function relatedPosts(posts: Post[], current: Post, limit = 3): Post[] {
  const mine = new Set(current.data.tags.map(slugify));
  return posts
    .filter((p) => p.id !== current.id)
    .map((p) => ({ post: p, score: p.data.tags.filter((t) => mine.has(slugify(t))).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map((x) => x.post);
}

/** Previous / next within the post's section in chronological order. */
export function sectionNeighbours(posts: Post[], current: Post): { prev?: Post; next?: Post; list: Post[] } {
  const list = postsInSection(posts, current.data.section).sort(
    (a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf(),
  );
  const i = list.findIndex((p) => p.id === current.id);
  return { prev: list[i - 1], next: list[i + 1], list };
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date): string => dateFmt.format(d).toUpperCase();
export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);
