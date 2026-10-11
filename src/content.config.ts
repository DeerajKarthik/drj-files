import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { motifs } from './utils/illustrations';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    section: z.enum(['research', 'creative']),
    tags: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    /** Built-in illustration for this post. Defaults to one picked from the section and slug. */
    motif: z.enum(motifs).optional(),
    cover: z.string().optional(),
    coverHover: z.string().optional(),
    coverAlt: z.string().optional(),
    coverCaption: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    math: z.boolean().default(false),
  }),
});

export const collections = { writing };
