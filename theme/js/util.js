/* ═══════════════════════════════════════════════════════════════════════════
   util.js — maths and DOM helpers shared by every figure.

   Figures animate from these functions only. No sprite sheets, no baked frame
   sequences, no animation library: every visual is a pure function of a
   scalar, which is what makes scrubbing, resizing and reduced-motion free.
   ═══════════════════════════════════════════════════════════════════════════ */

export const clamp  = (v, lo = 0, hi = 1) => v < lo ? lo : v > hi ? hi : v;
export const lerp   = (a, b, t) => a + (b - a) * t;
export const TAU    = Math.PI * 2;

/** Map v from [a,b] to [0,1], clamped. The workhorse of act choreography. */
export const norm = (v, a, b) => clamp((v - a) / (b - a || 1));

/** Sub-range of a progress value: stage(t, .2, .6) is 0 before .2, 1 after .6. */
export const stage = (t, a, b) => norm(t, a, b);

/* ── Easing ─────────────────────────────────────────────────────────────── */
export const easeInOut   = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOut     = t => 1 - Math.pow(1 - t, 3);
export const easeIn      = t => t * t * t;
export const smoothstep  = t => t * t * (3 - 2 * t);
export const easeOutBack = t => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
/** Non-monotonic: 0 → 1 → 0. For things that appear and leave within one act. */
export const pulse = t => Math.sin(clamp(t) * Math.PI);

/* ── Deterministic randomness ───────────────────────────────────────────────
   Figures must render identically on every load and at every scroll position,
   so nothing may call Math.random(). mulberry32 gives a seeded stream instead.
   ─────────────────────────────────────────────────────────────────────────── */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller, drawn from a seeded stream. */
export function gaussian(rand) {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

/* ── Colour ─────────────────────────────────────────────────────────────────
   Read the palette from CSS custom properties so figures and stylesheets can
   never drift apart: change tokens.css and every diagram follows.
   ─────────────────────────────────────────────────────────────────────────── */
let paletteCache = null;
export function palette() {
  if (paletteCache) return paletteCache;
  const cs = getComputedStyle(document.documentElement);
  const read = n => cs.getPropertyValue(n).trim();
  paletteCache = {
    paper:  read('--paper'),  paperSunk: read('--paper-sunk'), rule: read('--rule'),
    ruleStrong: read('--rule-strong'),
    ink:    read('--ink'),    inkMuted: read('--ink-muted'),   inkFaint: read('--ink-faint'),
    accent: read('--accent'), accentDeep: read('--accent-deep'),
    shell:  read('--enc-shell'),  cargo: read('--enc-cargo'),  cas:  read('--enc-cas'),
    sgrna:  read('--enc-sgrna'),  resist: read('--enc-resist'), dead: read('--enc-dead'),
    mutate: read('--enc-mutate'),
  };
  return paletteCache;
}
export const resetPalette = () => { paletteCache = null; };

/** '#B4531F' → 'rgba(180,83,31,0.4)'. Canvas needs alpha at draw time. */
export function alpha(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* ── DOM ────────────────────────────────────────────────────────────────── */
export const SVGNS = 'http://www.w3.org/2000/svg';

/** el('circle', {cx: 4, r: 2, fill: 'red'}) — attributes, not properties. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) node.appendChild(c);
  return node;
}

export function svg(viewBox, attrs = {}) {
  return el('svg', { viewBox, preserveAspectRatio: 'xMidYMid meet',
                     xmlns: SVGNS, ...attrs });
}

/** One source of truth for device pixel ratio, capped so we never over-allocate. */
export const dpr = (max = 2) => Math.min(window.devicePixelRatio || 1, max);

/** Size a canvas for the device pixel ratio without over-allocating. */
export function fitCanvas(canvas, rect, maxDpr = 2) {
  const d = dpr(maxDpr);
  const w = Math.max(1, Math.round(rect.width  * d));
  const h = Math.max(1, Math.round(rect.height * d));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return ctx;
}

/**
 * Map a 0..100 viewBox onto the canvas rect, centred and aspect-preserving,
 * composing the device-pixel-ratio scale in one setTransform. Call at the top
 * of every canvas render, then draw in viewBox units and forget about pixels.
 */
export function viewTransform(g, rect, span = 100) {
  const d = dpr();
  const s = Math.min(rect.width, rect.height) / span;
  const ox = (rect.width  - span * s) / 2;
  const oy = (rect.height - span * s) / 2;
  g.setTransform(d * s, 0, 0, d * s, d * ox, d * oy);
  return s;
}

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
