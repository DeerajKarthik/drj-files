/** Delegated copy buttons: code blocks ([data-copy-code]) and the share row ([data-copy-url]). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

document.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-copy-code], [data-copy-url]');
  if (!button) return;

  let text = '';
  if (button.hasAttribute('data-copy-code')) {
    text = button.closest('[data-codeblock]')?.querySelector('pre')?.textContent ?? '';
  } else {
    text = new URL(location.pathname, location.href).href;
  }
  const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]') ?? button.querySelector<HTMLElement>('[data-copy-status]');
  const ok = await copyText(text.replace(/\n$/, ''));
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  const original = label?.dataset.original ?? label?.textContent ?? '';
  if (label) {
    label.dataset.original = original;
    label.textContent = ok ? 'Copied' : 'Failed';
  }
  if (status) status.textContent = ok ? 'Copied to clipboard' : 'Copy failed';
  window.setTimeout(() => {
    if (label) label.textContent = original;
    if (status) status.textContent = '';
  }, 1800);
});
