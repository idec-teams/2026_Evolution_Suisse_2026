/* ═══════════════════════════════════════════════════════════════════════════
   pencil.js — the graphite look. Canvas 2D only, no images, no library.

   A pencil line is not a wobbly line. Three things make it read as graphite:

     1. Multiple passes. A drawn edge is 2–3 strokes that nearly coincide.
        One jittered stroke reads as a shaky vector line; three read as pencil.
     2. Pressure. Width and darkness vary along the stroke and taper at the
        ends, because a hand accelerates into a line and lifts out of it.
     3. Tooth. The paper grain breaks the stroke up. One tiled noise layer
        over the whole stage does this more cheaply and more convincingly than
        per-stroke texture.

   ── Why jitter lives in the structure, not on the screen ──────────────────
   Offsetting points by noise at draw time makes a rotating object "boil":
   every frame redraws a *different* drawing. Instead, each structural point
   carries a fixed 3-D jitter vector, assigned once from a seeded stream and
   projected along with the point it belongs to. The result rotates like a
   single drawing on a turning page. Deliberate boil is available separately
   via `boil` (see stepPhase) for a hand-animated feel.
   ═══════════════════════════════════════════════════════════════════════════ */

import { rng, TAU, clamp, lerp } from './util.js';

/* ── Stroke ──────────────────────────────────────────────────────────────── */

/**
 * One graphite stroke through `pts` ([[x,y],...] in draw units).
 *
 * opt.passes    how many near-coincident strokes (2 = line, 3 = emphasis)
 * opt.width     nominal width; each pass varies around it
 * opt.alpha     nominal darkness; each pass varies around it
 * opt.wobble    per-pass offset, in draw units. This is the pass-to-pass
 *               scatter only — structural jitter belongs to the points.
 * opt.taper     0..1, how much the ends lighten
 * opt.close     close the path (with overshoot, so the join stays visible)
 * opt.seed      stable per-object seed; the same seed redraws identically
 */
export function stroke(g, pts, opt = {}) {
  if (pts.length < 2) return;
  const { passes = 2, width = 0.5, alpha = 0.7, wobble = 0.35,
          taper = 0.5, close = false, seed = 1, colour = '#3A3733' } = opt;

  for (let p = 0; p < passes; p++) {
    const rand = rng(seed * 7919 + p * 104729);
    // Per-pass constant offset plus a slow drift: two strokes of the same
    // edge diverge gradually rather than staying parallel.
    const ox = (rand() - 0.5) * wobble * 2, oy = (rand() - 0.5) * wobble * 2;
    const dx = (rand() - 0.5) * wobble, dy = (rand() - 0.5) * wobble;
    const w  = width * lerp(0.75, 1.15, rand());
    const a  = alpha * lerp(0.55, 1.0, rand());

    g.beginPath();
    const n = pts.length;
    const last = close ? n : n - 1;
    for (let i = 0; i <= last; i++) {
      const u = i / last;
      const q = pts[i % n];
      const x = q[0] + ox + dx * u, y = q[1] + oy + dy * u;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    if (close) {
      // Overshoot: a hand does not stop exactly on the start point.
      const q0 = pts[0], q1 = pts[1 % n];
      g.lineTo(q0[0] + ox + dx + (q1[0] - q0[0]) * 0.18,
               q0[1] + oy + dy + (q1[1] - q0[1]) * 0.18);
    }
    g.lineWidth = w;
    g.strokeStyle = colour;
    // Taper is applied as a whole-pass alpha ramp rather than per-segment
    // gradients: at these line widths the difference is invisible and the
    // cost is one setter instead of a gradient object per stroke.
    g.globalAlpha = a * lerp(1, 0.7, taper * (p / Math.max(1, passes - 1)));
    g.stroke();
  }
  g.globalAlpha = 1;
}

/* ── Shading ─────────────────────────────────────────────────────────────── */

/**
 * Parallel hatching clipped to a convex polygon, drawn as short graphite
 * strokes rather than a fill. `density` 0..1 sets line spacing and darkness
 * together — the way pressing harder and hatching tighter go together on paper.
 */
export function hatch(g, poly, opt = {}) {
  const { angle = -0.6, density = 0.5, width = 0.35, alpha = 0.5,
          seed = 1, colour = '#3A3733', gap = 1.0 } = opt;
  if (density <= 0.02 || poly.length < 3) return;

  const ca = Math.cos(angle), sa = Math.sin(angle);
  // Rotate into hatch-aligned space, scan in v, un-rotate the intersections.
  let vmin = Infinity, vmax = -Infinity;
  const rot = poly.map(([x, y]) => {
    const v = -x * sa + y * ca;
    if (v < vmin) vmin = v;
    if (v > vmax) vmax = v;
    return [x * ca + y * sa, v];
  });

  const spacing = gap / lerp(0.6, 2.4, density);
  const rand = rng(seed * 2654435761);
  const a = alpha * lerp(0.45, 1, density);

  for (let v = vmin + spacing * rand(); v < vmax; v += spacing) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < rot.length; i++) {
      const [u1, v1] = rot[i], [u2, v2] = rot[(i + 1) % rot.length];
      if ((v1 <= v) === (v2 <= v)) continue;
      const u = u1 + (u2 - u1) * (v - v1) / (v2 - v1);
      if (u < lo) lo = u;
      if (u > hi) hi = u;
    }
    if (!(hi > lo)) continue;
    // Pull the ends in a little and let them vary: hatching that reaches the
    // outline exactly reads as a machine fill.
    const inset = (hi - lo) * lerp(0.04, 0.16, rand());
    const u0 = lo + inset, u1 = hi - inset * lerp(0.5, 1.5, rand());
    if (u1 <= u0) continue;
    g.beginPath();
    g.moveTo(u0 * ca - v * sa, u0 * sa + v * ca);
    g.lineTo(u1 * ca - v * sa, u1 * sa + v * ca);
    g.lineWidth = width * lerp(0.7, 1.3, rand());
    g.strokeStyle = colour;
    g.globalAlpha = a * lerp(0.5, 1, rand());
    g.stroke();
  }
  g.globalAlpha = 1;
}

/* ── Geometry helpers ────────────────────────────────────────────────────── */

/** Monotone-chain 2-D convex hull. Points may be reused; input is not kept. */
export function hull2d(pts) {
  if (pts.length < 4) return pts.slice();
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = src => {
    const h = [];
    for (const q of src) {
      while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop();
      h.push(q);
    }
    h.pop();
    return h;
  };
  return build(p).concat(build(p.reverse()));
}

/**
 * Chaikin corner-cutting on a closed polygon. A convex hull of sampled atoms
 * is a spiky thing; two rounds of Chaikin turn it into the rounded lobe a
 * subunit actually reads as, without inventing detail the structure lacks.
 */
export function smoothClosed(poly, rounds = 2) {
  let p = poly;
  for (let r = 0; r < rounds; r++) {
    if (p.length < 3) return p;
    const out = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25],
               [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    p = out;
  }
  return p;
}

/** Scale a polygon about its own centroid. Subunit Ca clouds interdigitate;
    drawing every hull at full size buries the lattice under overlap. */
export function shrink(poly, k) {
  let cx = 0, cy = 0;
  for (const q of poly) { cx += q[0]; cy += q[1]; }
  cx /= poly.length; cy /= poly.length;
  return poly.map(q => [cx + (q[0] - cx) * k, cy + (q[1] - cy) * k]);
}

/* ── Paper ───────────────────────────────────────────────────────────────── */

/**
 * A tile of paper tooth, built once and reused as a repeating pattern.
 * Drawn OVER the artwork at low alpha: grain sits on top of graphite on real
 * paper, and painting it underneath leaves the strokes looking printed.
 */
let grainTile = null;
export function grain(g, w, h, { alpha = 0.055, scale = 1 } = {}) {
  if (!grainTile) {
    const S = 128;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const gc = c.getContext('2d');
    const img = gc.createImageData(S, S);
    const rand = rng(20260906);
    for (let i = 0; i < S * S; i++) {
      // Two octaves: fine tooth plus a slow blotch, so tiling is not obvious.
      const n = rand() * 0.75 + rand() * 0.25;
      const v = 255 * (1 - n);
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255 * n * 0.9;
    }
    gc.putImageData(img, 0, 0);
    grainTile = c;
  }
  const pat = g.createPattern(grainTile, 'repeat');
  g.save();
  g.globalAlpha = alpha;
  g.globalCompositeOperation = 'multiply';
  g.scale(scale, scale);
  g.fillStyle = pat;
  g.fillRect(0, 0, w / scale, h / scale);
  g.restore();
}

/**
 * Hand-animation boil: quantise a continuous clock to N frames per second so
 * the drawing is re-jittered on twos rather than every frame. Returns an
 * integer to fold into stroke seeds. `fps = 0` disables boil (steady drawing).
 */
export const stepPhase = (nowMs, fps = 0) =>
  fps > 0 ? Math.floor(nowMs / (1000 / fps)) : 0;

/* ── Projection ──────────────────────────────────────────────────────────── */

/**
 * Rotate about Y then tilt about X, and project orthographically. Orthographic
 * rather than perspective on purpose: a technical drawing of a symmetric
 * particle should not have a near side that is larger than its far side.
 * Returns [x, y, z] with z increasing towards the viewer.
 */
export function project(p, yaw, tilt, scale, cx, cy) {
  const cy0 = Math.cos(yaw), sy = Math.sin(yaw);
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const x1 = p[0] * cy0 + p[2] * sy;
  const z1 = -p[0] * sy + p[2] * cy0;
  const y1 = p[1] * ct - z1 * st;
  const z2 = p[1] * st + z1 * ct;
  return [cx + x1 * scale, cy + y1 * scale, z2];
}

export { TAU, clamp, lerp };
