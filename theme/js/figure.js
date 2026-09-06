/* ═══════════════════════════════════════════════════════════════════════════
   figure.js — the figure module contract and registry.

   ── The contract ──────────────────────────────────────────────────────────
   Every figure on this site, whether a homepage act or a one-off diagram on a
   results page, is an object with these four methods:

     {
       id: 'cell-scene',
       mount(ctx)        build DOM once. Called before the first render.
       render(t, ctx)    t in [0,1] -> set attributes / redraw.
                         MUST be pure and idempotent: calling render(0.4) twice
                         must look the same, and calling it after render(0.9)
                         must look identical to reaching 0.4 by scrolling down.
                         This is what makes reverse-scrubbing and reduced-motion
                         work with no extra code.
       resize(ctx)       recompute layout-dependent geometry. Optional.
       destroy()         drop listeners. Optional.
     }

   `ctx` carries:
     root     the element the author annotated — read your data-* attrs here
     frame    the sized drawing surface (may be the same element)
     svg      an <svg> mounted in the frame, when needs includes 'svg'
     canvas   / c2d  a sized 2D context, when needs includes 'canvas'
     rect     the frame's current size
     palette  the --enc-* tokens, read from CSS

   ── Adding a figure ───────────────────────────────────────────────────────
     1. Write theme/js/figures/my-figure.js exporting the object above.
     2. Register it in theme/js/figures/index.js.
     3. Reference it from Markdown:
          <figure class="scrollyfig" data-figure="my-figure" markdown>
          Fig N. Caption.
          </figure>
        ...or as a scroll story: one <section class="act" data-act="..."> per
        act, or a single figure for the whole story via
        <section data-scrolly data-scrolly-scene="my-figure">.

   A typo in the name fails soft: nothing mounts, the caption still shows, and
   the rest of the page is unaffected.
   ═══════════════════════════════════════════════════════════════════════════ */

import { fitCanvas, palette, svg as makeSvg } from './util.js';

const registry = new Map();

export function register(fig) {
  if (!fig || !fig.id) throw new Error('figure.register: missing id');
  registry.set(fig.id, fig);
}
export const get = id => registry.get(id);
export const has = id => registry.has(id);

/**
 * Turn an authored block into a drawable figure.
 *
 * Authors write only a caption inside <figure ... markdown>, so md_in_html
 * hands us a <figure> whose sole content is a <p>. Two things must happen
 * before anything can be drawn:
 *
 *   1. A sized frame has to exist. A bare <canvas> appended to the <figure>
 *      inherits no dimensions, so it collapses to the caption's aspect ratio
 *      and the drawing renders as a sliver.
 *   2. The frame must come FIRST and the caption must follow it, or the
 *      caption sits above its own figure.
 *
 * The authored content is also promoted to a real <figcaption>, so writers get
 * correct figure semantics without having to type the tag.
 */
function prepareFigure(root) {
  let frame = root.querySelector(':scope > .figure__frame');
  if (frame) return frame;

  if (root.tagName === 'FIGURE' && !root.querySelector(':scope > figcaption')) {
    const caption = document.createElement('figcaption');
    while (root.firstChild) caption.appendChild(root.firstChild);
    root.appendChild(caption);
  }

  frame = document.createElement('div');
  frame.className = 'figure__frame';
  if (root.dataset.ratio) frame.style.aspectRatio = root.dataset.ratio.replace('/', ' / ');
  root.prepend(frame);
  return frame;
}

/**
 * Build the ctx a figure needs and call mount(). Returns an instance handle,
 * or null if the id is unknown (the fail-soft path).
 */
export function instantiate(id, root, opts = {}) {
  const fig = registry.get(id);
  if (!fig) {
    if (opts.warn !== false) {
      console.warn(`[figure] no module registered for "${id}" — caption only.`);
    }
    return null;
  }

  const needs = fig.needs || 'svg';

  // Standalone <figure> blocks need a sized frame to draw into; the homepage
  // stage supplies its own canvas/svg hosts via opts.
  // `root` stays the element the author annotated, so figures can always read
  // their own data-* attributes from it. `frame` is the sized surface we draw
  // into, and it is what gets measured.
  const frame = (opts.canvas || opts.svgHost) ? root : prepareFigure(root);

  const ctx = { root, frame, palette: palette(),
                rect: frame.getBoundingClientRect() };

  if (needs.includes('canvas')) {
    ctx.canvas = opts.canvas || Object.assign(document.createElement('canvas'), {
      ariaHidden: 'true',
    });
    if (!opts.canvas) frame.appendChild(ctx.canvas);
    ctx.c2d = fitCanvas(ctx.canvas, ctx.rect);
  }
  if (needs.includes('svg')) {
    ctx.svgHost = opts.svgHost || frame;
    ctx.svg = makeSvg(fig.viewBox || '0 0 100 100');
    ctx.svgHost.appendChild(ctx.svg);
  }

  fig.mount(ctx);

  const inst = {
    id,
    fig,
    ctx,
    render(t) { fig.render(t, ctx); },
    resize() {
      ctx.rect = frame.getBoundingClientRect();
      if (ctx.canvas) ctx.c2d = fitCanvas(ctx.canvas, ctx.rect);
      fig.resize?.(ctx);
    },
    destroy() { fig.destroy?.(ctx); },
  };
  inst.render(0);
  return inst;
}

/**
 * Mount every standalone [data-figure] block outside the scroll story and
 * drive it from its own visibility: 0 when it enters, 1 when centred.
 */
export function mountStandalone(scope = document) {
  const nodes = scope.querySelectorAll('[data-figure]:not([data-scrolly] [data-figure])');
  if (!nodes.length) return [];

  const instances = [];
  for (const node of nodes) {
    const inst = instantiate(node.dataset.figure, node);
    if (inst) { instances.push(inst); node.dataset.figureMounted = ''; }
  }
  if (!instances.length) return instances;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    // Static, meaningful end-state rather than a blank frame.
    instances.forEach(i => i.render(1));
    return instances;
  }

  // A figure's own progress: 0 as it enters from below, 1 once it is centred.
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const inst of instances) {
      const r = inst.ctx.root.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const centre = r.top + r.height / 2;
      inst.render(Math.min(1, Math.max(0, 1 - (centre - vh * 0.42) / (vh * 0.72))));
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { instances.forEach(i => i.resize()); update(); }, { passive: true });
  update();

  return instances;
}
