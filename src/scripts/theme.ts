import { themeColors, type ThemeName } from '../config';
import { onPage, qsa } from './lifecycle';

const root = document.documentElement;
const current = (): ThemeName => (root.dataset.theme === 'night' ? 'night' : 'paper');

function sync(): void {
  const night = current() === 'night';
  for (const button of qsa('[data-theme-toggle]')) button.setAttribute('aria-pressed', String(night));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[current()]);
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element) || !event.target.closest('[data-theme-toggle]')) return;
  const next: ThemeName = current() === 'night' ? 'paper' : 'night';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* storage unavailable: the choice lasts for this page view only */
  }
  sync();
});

document.addEventListener('astro:after-swap', sync);
onPage(sync);
