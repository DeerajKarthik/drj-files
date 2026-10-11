import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { coffeeMark, gearPath } from './illustrations';
import { config } from '../config';

const require = createRequire(import.meta.url);
const font = (weight: 400 | 700): Buffer =>
  readFileSync(require.resolve(`@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-${weight}-normal.woff`));

const INK = '#1c1815';
const MUTED = '#4d4337';
const WIDTH = 1200;
const HEIGHT = 630;

/** Emblem as a data-URI SVG (satori cannot resolve CSS variables). */
function emblemUri(): string {
  const eyes = coffeeMark.eyes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${INK}" stroke="none"/>`).join('');
  const nodes = coffeeMark.nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#d3c291"/>`).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">` +
    `<path d="${gearPath(16, 92, 78)}"/><circle cx="100" cy="100" r="72" stroke-width="2"/>` +
    `<path d="${coffeeMark.saucer}"/><path d="${coffeeMark.handle}"/><path d="${coffeeMark.cup}" fill="#d3c291"/>` +
    `<path d="${coffeeMark.steam}"/><path d="${coffeeMark.link}" stroke-width="2"/>${nodes}<path d="${coffeeMark.face}"/>${eyes}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children, ...extra },
});

export interface OgInput {
  title: string;
  description: string;
  tag: string;
  date?: string;
}

/** Renders a parchment-style 1200x630 card as PNG. */
export async function renderOg({ title, description, tag, date }: OgInput): Promise<Buffer> {
  const size = title.length > 70 ? 46 : title.length > 40 ? 56 : 68;
  const tree = el(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      padding: 28,
      background: '#202527',
    },
    el(
      'div',
      {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 44,
        border: `3px solid ${INK}`,
        backgroundImage: 'radial-gradient(ellipse at 50% 45%, #d3c291 30%, #c19f55 130%)',
        color: INK,
      },
      [
        el('div', { justifyContent: 'space-between', alignItems: 'center' }, [
          el('div', { border: `2px solid ${INK}`, padding: '8px 18px', fontSize: 24, fontWeight: 700, letterSpacing: 4 }, tag),
          el('div', { fontSize: 24, color: MUTED }, date ?? ''),
        ]),
        el('div', { alignItems: 'center', gap: 40 }, [
          el('div', { flexDirection: 'column', flex: 1, gap: 22 }, [
            el('div', { fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: 0.5 }, title),
            el('div', { fontSize: 26, lineHeight: 1.4, color: MUTED }, description),
          ]),
          { type: 'img', props: { src: emblemUri(), width: 230, height: 230, style: { opacity: 0.9 } } },
        ]),
        el('div', { borderTop: `2px solid ${INK}`, paddingTop: 18, justifyContent: 'space-between', fontSize: 24 }, [
          el('div', { fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }, config.siteName),
          el('div', { color: MUTED }, config.tagline),
        ]),
      ],
    ),
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'IBM Plex Mono', data: font(400), weight: 400, style: 'normal' },
      { name: 'IBM Plex Mono', data: font(700), weight: 700, style: 'normal' },
    ],
  });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
