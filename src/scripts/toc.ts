import { onPage, qsa } from './lifecycle';

let cleanup: (() => void) | undefined;

function init(): void {
  cleanup?.();
  cleanup = undefined;

  const links = qsa<HTMLAnchorElement>('[data-toc-link]');
  const rail = document.querySelector<HTMLElement>('[data-toc-rail]');
  if (links.length === 0) return;

  const ids = [...new Set(links.map((l) => decodeURIComponent(l.hash.slice(1))))];
  const headings = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
  if (headings.length === 0) return;

  const marker = rail?.querySelector<HTMLElement>('[data-toc-marker]');
  let activeId = '';

  const setActive = (id: string): void => {
    if (id === activeId) return;
    activeId = id;
    for (const link of links) {
      if (decodeURIComponent(link.hash.slice(1)) === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    const railLink = rail?.querySelector<HTMLElement>('[aria-current="location"]');
    if (marker) {
      if (railLink) {
        marker.style.transform = `translateY(${railLink.offsetTop}px)`;
        marker.style.height = `${railLink.offsetHeight}px`;
        marker.dataset.visible = 'true';
        const list = railLink.closest<HTMLElement>('[data-toc-scroll]');
        if (list) {
          const top = railLink.offsetTop;
          if (top < list.scrollTop || top + railLink.offsetHeight > list.scrollTop + list.clientHeight) {
            list.scrollTop = top - list.clientHeight / 2;
          }
        }
      } else {
        delete marker.dataset.visible;
      }
    }
  };

  /** The section "crossing the middle of the viewport" is the last heading at or above the midline. */
  const compute = (): void => {
    const middle = window.innerHeight / 2;
    let found = '';
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= middle) found = heading.id;
      else break;
    }
    setActive(found);
  };

  // A heading crossing the midline is the only event that can change the active section.
  // Browsers do not report crossings of a zero-height root, so the root is the viewport's upper half
  // (its lower edge is the midline); `scrollend` catches jumps that skip a heading entirely.
  const observer = new IntersectionObserver(compute, { rootMargin: '0px 0px -50% 0px', threshold: 0 });
  for (const heading of headings) observer.observe(heading);
  compute();

  const onClick = (event: Event): void => {
    const link = (event.currentTarget as HTMLAnchorElement | null)?.hash.slice(1);
    if (link) setActive(decodeURIComponent(link));
  };
  for (const link of links) link.addEventListener('click', onClick);
  window.addEventListener('resize', compute, { passive: true });
  window.addEventListener('scrollend', compute);

  cleanup = () => {
    observer.disconnect();
    for (const link of links) link.removeEventListener('click', onClick);
    window.removeEventListener('resize', compute);
    window.removeEventListener('scrollend', compute);
  };
}

onPage(init);
