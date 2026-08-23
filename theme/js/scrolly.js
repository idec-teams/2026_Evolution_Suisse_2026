/* ═══════════════════════════════════════════════════════════════════════════
   scrolly.js — the pinned scroll-story engine.

   One sticky stage, N text panels scrolling past it. A single scroll listener,
   throttled through requestAnimationFrame, decides which act is on stage and
   how far through it we are.

   Progress is measured from THE PANELS' OWN GEOMETRY, not from an assumed
   equal division of the scroll track. Each act's span runs from its panel's
   top to the next panel's top; a focus line fixed at 42% of the viewport
   sweeps through those spans, giving

       active act i  = the span containing the focus line
       local t       = how far the focus line has travelled through that span

   Deriving it this way keeps the drawing and the prose in lockstep no matter
   what the CSS does with panel heights, gaps or padding. (Dividing the track
   into N equal parts looks equivalent and is not: panel spacing is set in CSS,
   so the two drift apart and the stage ends up illustrating the wrong
   paragraph.)

   Because every figure renders as a pure function of t, scrubbing backwards,
   resizing mid-scroll and deep-linking all work with no extra machinery, and
   the reduced-motion path is simply "render each act at t = 1 and never
   attach the listener".

   No scroll-jacking: the page scrolls at its natural rate throughout.
   ═══════════════════════════════════════════════════════════════════════════ */

import { clamp } from './util.js';
import { instantiate } from './figure.js';

export function initScrolly(section) {
  if (!section) return null;

  const stage  = section.querySelector('[data-scrolly-stage]');
  const canvas = section.querySelector('[data-scrolly-canvas]');
  const svgHost= section.querySelector('[data-scrolly-svg]');
  const label  = section.querySelector('[data-scrolly-label]');
  const panels = [...section.querySelectorAll('[data-act]')];
  if (!stage || !panels.length) return null;

  const viewport = section.querySelector('.scrolly__viewport') || stage;

  /* Acts 2 and 3 deliberately share one canvas layer: the dCas9 complexes
     captured during silencing must be the same particles the shell sweeps up
     during rescue. That continuity is the whole reason for a single pinned
     stage rather than one figure per section. */
  const acts = panels.map((panel, i) => {
    const id = panel.dataset.act;
    const inst = instantiate(id, viewport, { canvas, svgHost, warn: true });
    if (inst?.ctx.svg) inst.ctx.svg.style.opacity = i === 0 ? '1' : '0';
    return { id, panel, inst, index: i };
  }).filter(a => a.inst);

  if (!acts.length) return null;

  const N = acts.length;
  let current = -1;

  const showAct = i => {
    if (i === current) return;
    current = i;
    acts.forEach((a, j) => {
      a.panel.classList.toggle('is-active', j === i);
      if (a.inst.ctx.svg) a.inst.ctx.svg.style.opacity = j === i ? '1' : '0';
    });
    if (label) label.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Reduced motion ───────────────────────────────────────────────────────
     The stage un-sticks (see home.css), every act renders at its end-state,
     and the page reads as a plain illustrated article. Never a blank frame. */
  function renderStatic() {
    acts.forEach(a => {
      a.panel.classList.add('is-active');
      if (a.inst.ctx.svg) a.inst.ctx.svg.style.opacity = '1';
      a.inst.render(1);
    });
    if (label) label.textContent = '';
  }

  let ticking = false;

  /* Where the story "reads from", as a fraction of viewport height. Taken from
     the --scrolly-focus custom property so the CSS owns it: beside the stage on
     desktop (0.42), below the pinned stage on mobile (~0.76). Hard-coding it
     here would desync the active act from the visible paragraph at any
     breakpoint where the stage is not alongside the text. */
  const focusFraction = () => {
    const v = parseFloat(getComputedStyle(section).getPropertyValue('--scrolly-focus'));
    return Number.isFinite(v) ? v : 0.42;
  };

  function update() {
    ticking = false;
    const focus = window.innerHeight * focusFraction();

    /* Span boundaries: each act owns the distance from its own panel top to the
       next panel's top. The last act runs to the end of the section, so the
       final figure completes rather than freezing mid-animation. */
    const tops = acts.map(a => a.panel.getBoundingClientRect().top);
    const sectionBottom = section.getBoundingClientRect().bottom;

    let i = 0;
    for (let k = 0; k < N; k++) if (tops[k] <= focus) i = k;

    const start = tops[i];
    const end   = i + 1 < N ? tops[i + 1] : sectionBottom;
    const span  = end - start;

    showAct(i);
    acts[i].inst.render(span > 0 ? clamp((focus - start) / span) : 0);
  }

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  const onResize = () => { acts.forEach(a => a.inst.resize()); update(); };

  function attach() {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize, { passive: true });
    section.setAttribute('data-scrolly-ready', '');
    update();
  }
  function detach() {
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onResize);
  }

  function applyMode() {
    detach();
    if (reduce.matches) { section.removeAttribute('data-scrolly-ready'); renderStatic(); }
    else attach();
  }

  applyMode();
  reduce.addEventListener?.('change', applyMode);

  return { acts, update, destroy: () => { detach(); acts.forEach(a => a.inst.destroy()); } };
}
