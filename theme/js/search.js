/* ═══════════════════════════════════════════════════════════════════════════
   search.js — overlay chrome only.

   MkDocs' own search/main.js does all the work: it self-initialises on load,
   spins up search/worker.js from the `base_url` global set in base.html, reads
   #mkdocs-search-query, and writes into #mkdocs-search-results. We only open
   and close the dialog around it.
   ═══════════════════════════════════════════════════════════════════════════ */

export function initSearch() {
  const modal = document.querySelector('[data-search-modal]');
  const input = document.getElementById('mkdocs-search-query');
  if (!modal || !input) return;

  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    input.focus();
    input.select();
  };
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus();
  };

  for (const btn of document.querySelectorAll('[data-search-open]')) {
    btn.addEventListener('click', open);
  }
  for (const btn of modal.querySelectorAll('[data-search-close]')) {
    btn.addEventListener('click', close);
  }

  addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) { e.preventDefault(); close(); }
    // "/" and Cmd/Ctrl-K, but never while the user is typing somewhere else.
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)
                   || document.activeElement?.isContentEditable;
    if (!typing && modal.hidden && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k'))) {
      e.preventDefault();
      open();
    }
  });

  // Keep focus inside the dialog while it is open.
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const items = [...modal.querySelectorAll('a[href], button, input')].filter(n => !n.disabled);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
