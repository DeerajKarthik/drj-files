import { onPage } from './lifecycle';

let cleanup: (() => void) | undefined;

onPage(() => {
  cleanup?.();
  cleanup = undefined;
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const article = document.querySelector<HTMLElement>('[data-article]');
  if (!bar || !article) return;

  let ticking = false;
  const update = (): void => {
    ticking = false;
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.5;
    const done = Math.min(1, Math.max(0, (window.innerHeight * 0.25 - rect.top) / Math.max(total, 1)));
    bar.style.transform = `scaleX(${done.toFixed(4)})`;
  };
  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
  cleanup = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
});
