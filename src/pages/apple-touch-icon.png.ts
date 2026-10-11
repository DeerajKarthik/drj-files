import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { coffeeMark, gearPath } from '../utils/illustrations';

export const GET: APIRoute = async () => {
  const eyes = coffeeMark.eyes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#1c1815" stroke="none"/>`).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#d3c291"/>` +
    `<g transform="translate(100 100) scale(.82) translate(-100 -100)" fill="none" stroke="#1c1815" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">` +
    `<path d="${gearPath(12, 92, 78)}"/><path d="${coffeeMark.saucer}"/><path d="${coffeeMark.handle}"/>` +
    `<path d="${coffeeMark.cup}" fill="#e6d9b0"/><path d="${coffeeMark.steam}"/>${eyes}</g></svg>`;
  const png = await sharp(Buffer.from(svg)).resize(180, 180).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
