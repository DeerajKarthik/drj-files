// Copies the KaTeX stylesheet and woff2 fonts into public/katex so the CSS can be
// linked only on posts that contain math (see BaseHead.astro).
import { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve('katex/dist/katex.min.css'));
const out = join(process.cwd(), 'public', 'katex');

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'fonts'), { recursive: true });

for (const file of readdirSync(join(dist, 'fonts'))) {
  if (file.endsWith('.woff2')) cpSync(join(dist, 'fonts', file), join(out, 'fonts', file));
}

// Keep only the woff2 source of each @font-face: every browser we target supports it.
const css = readFileSync(join(dist, 'katex.min.css'), 'utf8').replace(
  /src:url\((fonts\/[^)]+\.woff2)\) format\("woff2"\),url\([^)]+\) format\("woff"\),url\([^)]+\) format\("truetype"\)/g,
  'src:url($1) format("woff2")',
);
writeFileSync(join(out, 'katex.min.css'), css);
