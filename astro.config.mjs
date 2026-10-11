import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { shikiThemes, titleTransformer } from './shiki.config.mjs';

const site = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
const base = process.env.PUBLIC_BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  prefetch: { prefetchAll: false },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [rehypeKatex, { output: 'htmlAndMathml' }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { class: 'heading-anchor', ariaLabel: 'Link to this section' },
          content: { type: 'text', value: '#' },
        },
      ],
    ],
    shikiConfig: {
      themes: shikiThemes,
      defaultColor: false,
      transformers: [titleTransformer],
    },
  },
});
