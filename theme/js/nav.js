/* ═══════════════════════════════════════════════════════════════════════════
   nav.js — mobile drawer, sticky masthead state, scroll-spy TOC.
   ═══════════════════════════════════════════════════════════════════════════ */

export function initDrawer() {
  const toggle  = document.querySelector('[data-drawer-toggle]');
  const drawer  = document.querySelector('[data-drawer]');
  const scrim   = document.querySelector('[data-drawer-close]');
  if (!toggle || !drawer) return;

  const setOpen = open => {
    drawer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (scrim) scrim.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) drawer.querySelector('a')?.focus();
  };

  toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
  scrim?.addEventListener('click', () => setOpen(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  // Following a link inside the drawer should close it.
  drawer.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
}

export function initMasthead() {
  const bar = document.querySelector('[data-masthead]');
  if (!bar) return;
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(
    ([e]) => bar.classList.toggle('is-stuck', !e.isIntersecting)
  ).observe(sentinel);
}

/** Highlight the TOC entry for the heading currently in view. */
export function initTocSpy() {
  const links = [...document.querySelectorAll('.toc__link')];
  if (!links.length) return;

  const byId = new Map();
  for (const a of links) {
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const target = document.getElementById(id);
    if (target) byId.set(target, a);
  }
  if (!byId.size) return;

  let active = null;
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const a = byId.get(e.target);
      if (!a || a === active) continue;
      active?.classList.remove('is-current');
      a.classList.add('is-current');
      active = a;
    }
  }, { rootMargin: '-12% 0px -72% 0px', threshold: 0 });

  byId.forEach((_, heading) => io.observe(heading));
}
