/* ═══════════════════════════════════════════════════════════════════════════
   complexes.js — the dCas9·sgRNA particle field shared by acts 2 and 3.

   Acts 2 and 3 draw onto the SAME canvas layer, from this same particle
   array, so the complexes that clamp onto the operator during silencing are
   visibly the same objects the shell sweeps up during rescue. That continuity
   is the reason the homepage uses one pinned stage instead of one figure per
   section.

   Positions are a pure function of (progress, particle seed): no integration,
   no accumulated state, so scrubbing backwards is exact.
   ═══════════════════════════════════════════════════════════════════════════ */

import { rng, TAU, lerp, clamp, norm, easeInOut } from '../util.js';

export const COUNT = 24;

/* ── Shared stage geometry, in viewBox (0..100) units ──────────────────────
   The 0..100 box is mapped onto min(width, height) of the stage, which on a
   desktop hero is ~700 px — so one unit is ~7 px. Keep strokes under ~1.5
   units and features inside roughly 22..78 or the drawing reads as clip-art.
   ────────────────────────────────────────────────────────────────────────── */

/** Cytoplasm bounds — complexes must diffuse inside the cell, not around it. */
export const CELL = { x: 13, y: 17, w: 74, h: 66, r: 22 };

/** Operator site on the resistance gene. */
export const OPERATOR = { x: 50, y: 64 };
/** Shell centre, where captured complexes end up in act 3. */
export const SHELL = { x: 50, y: 43 };

/** Deterministic per-particle constants. */
export function makeComplexes(seed = 11) {
  const r = rng(seed);
  const pad = 6;   // keep the whole glyph, tail included, off the membrane
  return Array.from({ length: COUNT }, (_, i) => ({
    i,
    // Brownian home position, confined to the cytoplasm.
    hx: CELL.x + pad + r() * (CELL.w - pad * 2),
    hy: CELL.y + pad + r() * (CELL.h - pad * 2),
    ax: 2.5 + r() * 6,    ay: 2.5 + r() * 5.5,
    fx: 0.6 + r() * 1.9,  fy: 0.6 + r() * 1.9,
    ph: r() * TAU,
    // Which complexes reach the operator, and in what order
    binds: r() < 0.55,
    bindAt: 0.18 + r() * 0.45,
    slot: (r() - 0.5) * 11,
    // Capture order during act 3
    captureAt: r() * 0.5,
    capR: 2 + r() * 5.5,
    capA: r() * TAU,
    size: 1.2 + r() * 0.7,
  }));
}

/**
 * Position a complex at diffusion phase `d` (a free-running clock in [0,∞)),
 * bind progress `b` in [0,1], and capture progress `c` in [0,1].
 * Returns {x, y, bound, captured}.
 */
export function placeComplex(p, d, b, c) {
  // Free diffusion: two incommensurate sinusoids, deterministic in d.
  const fx = p.hx + Math.sin(d * p.fx + p.ph) * p.ax;
  const fy = p.hy + Math.cos(d * p.fy + p.ph * 1.7) * p.ay;

  let x = fx, y = fy, bound = 0;
  if (p.binds) {
    bound = easeInOut(norm(b, p.bindAt, p.bindAt + 0.3));
    x = lerp(fx, OPERATOR.x + p.slot, bound);
    y = lerp(fy, OPERATOR.y, bound);
  }

  let captured = 0;
  if (c > 0) {
    captured = easeInOut(norm(c, p.captureAt, p.captureAt + 0.42));
    x = lerp(x, SHELL.x + Math.cos(p.capA) * p.capR, captured);
    y = lerp(y, SHELL.y + Math.sin(p.capA) * p.capR, captured);
  }

  return { x, y, bound, captured };
}

/** Draw one complex: a dCas9 lobe with its sgRNA tail. */
export function drawComplex(g, p, pos, pal, alphaFn, opacity = 1) {
  const s = p.size;
  g.globalAlpha = opacity;

  // sgRNA — a short curved tail
  g.strokeStyle = pal.sgrna;
  g.lineWidth = 0.5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(pos.x - s * 0.2, pos.y + s * 0.2);
  g.quadraticCurveTo(pos.x - s * 1.9, pos.y + s * 1.1, pos.x - s * 2.4, pos.y - s * 0.4);
  g.stroke();

  // dCas9 — bilobed
  g.fillStyle = pal.cas;
  g.beginPath();
  g.arc(pos.x, pos.y, s, 0, TAU);
  g.fill();
  g.fillStyle = alphaFn(pal.cas, 0.5);
  g.beginPath();
  g.arc(pos.x + s * 0.55, pos.y - s * 0.5, s * 0.6, 0, TAU);
  g.fill();

  g.globalAlpha = 1;
}
