import type { APIContext } from 'astro';
import { href } from '../utils/paths';

export function GET(context: APIContext) {
  const site = context.site ?? new URL('http://localhost:4321');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(href('/sitemap-index.xml'), site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
