/* ═══════════════════════════════════════════════════════════════════════════
   capsid.js — draws the real QtEncapsulin shell in graphite.

   Consumes theme/data/capsid.json (built by tools/structures/build_capsid.py):
   4 chain templates, 60 icosahedral operators, and a penton/hexon label per
   subunit derived from the deposited symmetry group.

   ── Why it can afford 240 real subunits ──────────────────────────────────
   The view rotation is folded into each of the 60 operators ONCE per frame.
   After that every one of the ~15 000 structural points costs a single 3x3
   matrix-vector product. Transforming each subunit separately would repeat
   the same 60 rotations 240 times over.

   Everything here is a pure function of (yaw, style): no state between frames,
   so the same code drives a clock in the hero, scroll progress in the acts,
   and a single still frame under prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════════════ */

import { stroke, hatch, hull2d, smoothClosed, shrink } from './pencil.js';
import { rng, clamp, TAU } from './util.js';

/** Rx(tilt) · Ry(yaw), row-major. Exported so a figure can put another
    structure into the SAME orientation — the complex inside the shell. */
export function viewMatrix(yaw, tilt) {
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  return [ca, 0, sa,
          st * sa, ct, -st * ca,
          -ct * sa, st, ct * ca];
}
const mul3 = (A, B) => {
  const C = new Array(9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
  return C;
};
const apply3 = (M, x, y, z) => [
  M[0] * x + M[1] * y + M[2] * z,
  M[3] * x + M[4] * y + M[5] * z,
  M[6] * x + M[7] * y + M[8] * z,
];

/** The project's graphite style, chosen from the round-2 style frames.

    Structure over silhouette: the subunit outline is nearly dropped (0.18) and
    the drawing is carried by the real Ca traces, the icosahedral construction
    cage, and a strong ghost of the far hemisphere. No hatching — at this line
    weight the backbone supplies all the density the drawing needs.

    Figures override individual keys; they do not restate the whole object, so
    a change here reaches every drawing on the site. */
export const STYLE = {
  passes: 3, width: 1.95, alpha: 1, wobble: 0.75,
  hatchMax: 0, hatchGap: 2.4,
  k: 0.76, far: 0.5, rim: 0,
  outline: 0.18,
  trace: 1,
  pentonInk: 1,
  capRing: 0,
  icosa: 1,
  tilt: 0.38,
  colour: '#3A3733',
};

export function createCapsid(data) {
  const Q = data.q, CQ = data.chainQ, R = data.radiusAngstrom;
  const jr = rng(6688);

  // Chain templates, in Angstrom, with one fixed jitter offset per point.
  // The jitter belongs to the structure and is rotated with it, so the drawing
  // turns rather than boils. See the note at the top of pencil.js.
  const unpack = (flat, n, jitter) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) out[i] = flat[i] / CQ + (jr() - 0.5) * jitter;
    return out;
  };
  const chains = data.chains.map(c => ({
    shape: unpack(c.shape, c.shapeN, R * 0.010),
    trace: unpack(c.trace, c.traceN, R * 0.006),
    shapeN: c.shapeN, traceN: c.traceN,
  }));

  const ops = data.ops.map(o => ({
    m: o.m.map(v => v / Q),
    w: o.w.map(v => v / Q),          // already includes the centre subtraction
  }));
  const subs = data.subunits.map(([op, ch, cap, k], i) =>
    ({ op, ch, cap, penton: k === 0, seed: i * 131 + 7 }));
  const caps = data.caps.map(c => c.map(v => v / Q));

  const L = (() => { const v = [-0.45, -0.62, 0.65], n = Math.hypot(...v);
                     return v.map(x => x / n); })();

  /**
   * @param g    2D context, already scaled to CSS pixels
   * @param W,H  CSS size of the drawing surface
   * @param yaw  rotation about the vertical axis, radians
   * @param st   style — see STYLE above
   * @param opt  { scale, cx, cy, explode, alpha } — explode moves subunits out
   *             along their own radial vector, which is how the hero opens the
   *             shell; alpha fades the whole drawing as it opens.
   */
  function draw(g, W, H, yaw, st, opt = {}) {
    const S  = opt.scale ?? Math.min(W, H) * 0.40;
    const CX = opt.cx ?? W / 2, CY = opt.cy ?? H / 2;
    const explode = opt.explode ?? 0;
    const gain = opt.alpha ?? 1;
    if (gain <= 0.004) return;
    const V = viewMatrix(yaw, st.tilt);

    // One combined matrix per operator, reused by every subunit that shares it.
    const OM = ops.map(o => ({ m: mul3(V, o.m), w: apply3(V, o.w[0], o.w[1], o.w[2]) }));

    // Depth-sort on the transformed centroid so near subunits overdraw far ones.
    const items = subs.map(s => {
      const o = OM[s.op], ch = chains[s.ch];
      let x = 0, y = 0, z = 0;
      for (let i = 0; i < ch.shapeN; i++) {
        const p = apply3(o.m, ch.shape[i * 3], ch.shape[i * 3 + 1], ch.shape[i * 3 + 2]);
        x += p[0]; y += p[1]; z += p[2];
      }
      const n = ch.shapeN * R;
      return { s, o, ch, c: [x / n + o.w[0], y / n + o.w[1], z / n + o.w[2]] };
    }).sort((a, b) => a.c[2] - b.c[2]);

    if (st.icosa > 0) drawIcosa(g, V, S, CX, CY, st, gain * gain);

    const capPoly = st.capRing > 0 ? new Map() : null;

    for (const it of items) {
      const { s, o, ch, c } = it;
      const near = c[2] > -0.04;
      if (!near && st.far <= 0) continue;

      // Explode: push the subunit out along the radial direction it already has.
      const e = explode > 0 ? 1 + explode * 1.6 : 1;
      const ex = explode > 0 ? c[0] * (e - 1) * R : 0;
      const ey = explode > 0 ? c[1] * (e - 1) * R : 0;
      const ez = explode > 0 ? c[2] * (e - 1) * R : 0;

      const to = (arr, i) => {
        const p = apply3(o.m, arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]);
        return [CX + ((p[0] + ex) / R + o.w[0]) * S,
                CY + ((p[1] + ey) / R + o.w[1]) * S];
      };

      const shape = [];
      for (let i = 0; i < ch.shapeN; i++) shape.push(to(ch.shape, i));
      let poly = hull2d(shape);
      if (poly.length < 3) continue;
      poly = smoothClosed(shrink(poly, st.k), 2);

      if (capPoly && near) {
        const bag = capPoly.get(s.cap) || [];
        for (const p of shape) bag.push(p);
        capPoly.set(s.cap, bag);
      }

      const n = Math.hypot(...c);
      const lam = Math.pow(clamp((c[0] / n * L[0] + c[1] / n * L[1] + c[2] / n * L[2])
                                 * -0.5 + 0.5), 1.4);
      // Pentons are drawn harder. Nothing else marks the 12 five-fold axes, and
      // without them an icosahedral lattice reads as an undifferentiated mesh.
      const ink = s.penton ? st.pentonInk : 1;

      if (near && st.hatchMax > 0 && st.outline > 0) {
        hatch(g, poly, { angle: -0.62, density: lam * st.hatchMax * ink * gain, gap: st.hatchGap,
                         width: st.width * 0.5, alpha: 0.42, seed: s.seed, colour: st.colour });
      }
      if (st.outline > 0) {
        stroke(g, poly, {
          passes: near ? st.passes : 1,
          width: st.width * st.outline * (near ? 1 : 0.6) * (s.penton ? Math.min(ink, 1.5) : 1),
          alpha: (near ? st.alpha * st.outline * ink : st.far) * gain,
          wobble: near ? st.wobble : st.wobble * 0.5,
          close: true, taper: 0.4, seed: s.seed, colour: st.colour,
        });
      }
      // Backbone detail is near-side only. An encapsulin protomer has long
      // extended arms that reach across its neighbours, so 240 overlapping
      // traces read as a hairball; the far hemisphere keeps its silhouette
      // ghost and nothing else.
      if (st.trace > 0 && near) {
        const path = [];
        for (let i = 0; i < ch.traceN; i++) path.push(to(ch.trace, i));
        stroke(g, shrink(path, 0.9), {
          passes: 1,
          width: st.width * 0.34,
          alpha: st.alpha * 0.42 * ink * st.trace * gain,
          wobble: st.wobble * 0.3, taper: 0.55, seed: s.seed + 5, colour: st.colour,
        });
      }
    }

    if (capPoly) {
      for (const [cap, pts] of capPoly) {
        const ring = smoothClosed(shrink(hull2d(pts), 0.94), 2);
        if (ring.length < 3) continue;
        const penton = data.capKind[cap] === 0;
        stroke(g, ring, {
          passes: 2, width: st.width * (penton ? 0.95 : 0.7),
          alpha: st.capRing * gain * (penton ? 1 : 0.65),
          wobble: st.wobble * 0.8, close: true, taper: 0.5,
          seed: cap * 617 + 3, colour: st.colour,
        });
      }
    }

    if (st.rim > 0) {
      const rim = [];
      for (let a = 0; a < 64; a++)
        rim.push([CX + Math.cos(a / 64 * TAU) * S * 1.035,
                  CY + Math.sin(a / 64 * TAU) * S * 1.035]);
      stroke(g, rim, { passes: 2, width: st.width * 0.9, alpha: st.rim * gain, wobble: 1.1,
                       close: true, taper: 0.6, seed: 4242, colour: st.colour });
    }
  }

  /** The icosahedron through the 12 pentamer centres, as construction lines. */
  function drawIcosa(g, V, S, CX, CY, st, gain) {
    const v = caps.slice(0, 12).map(p => apply3(V, p[0], p[1], p[2]));
    for (const [i, j] of data.icosaEdges) {
      const a = v[i], b = v[j];
      // Fade edges running around the back so the cage reads as a solid.
      const depth = clamp(((a[2] + b[2]) / 2 + 1) / 2);
      stroke(g, [[CX + a[0] * S, CY + a[1] * S], [CX + b[0] * S, CY + b[1] * S]], {
        passes: 1, width: st.width * 0.35, alpha: st.icosa * gain * (0.25 + 0.75 * depth),
        wobble: 0.9, taper: 0.7, seed: i * 71 + j * 13, colour: st.colour,
      });
    }
  }

  /**
   * One subunit on its own, centred wherever the caller wants it.
   *
   * The scroll story needs free protomers floating in the cytoplasm before they
   * assemble. They are the SAME geometry as the shell's subunits — same chain,
   * same silhouette — just detached from their operator's position, so a reader
   * recognises the loose pieces as the thing the shell is made of.
   *
   * @param i     subunit index; picks which of the four chain conformations
   * @param M     3x3 row-major orientation for this loose copy
   * @param opt   { cx, cy, scale (px per unit-radius), alpha }
   */
  function drawFree(g, i, M, st, opt = {}) {
    const s = subs[i % subs.length], ch = chains[s.ch];
    const S = opt.scale ?? 40, CX = opt.cx ?? 0, CY = opt.cy ?? 0;
    const gain = opt.alpha ?? 1;
    if (gain <= 0.004) return;

    // Recentre on the chain's own centroid so the subunit spins about itself
    // rather than about the (absent) shell centre.
    let mx = 0, my = 0, mz = 0;
    for (let k = 0; k < ch.shapeN; k++) {
      mx += ch.shape[k * 3]; my += ch.shape[k * 3 + 1]; mz += ch.shape[k * 3 + 2];
    }
    mx /= ch.shapeN; my /= ch.shapeN; mz /= ch.shapeN;

    const to = (arr, k) => {
      const p = apply3(M, arr[k * 3] - mx, arr[k * 3 + 1] - my, arr[k * 3 + 2] - mz);
      return [CX + p[0] / R * S, CY + p[1] / R * S];
    };

    const shape = [];
    for (let k = 0; k < ch.shapeN; k++) shape.push(to(ch.shape, k));
    const poly = smoothClosed(shrink(hull2d(shape), st.k), 2);
    if (poly.length >= 3 && st.outline > 0) {
      stroke(g, poly, { passes: 2, width: st.width * st.outline * 3.5,
                        alpha: st.alpha * st.outline * 3.2 * gain, wobble: st.wobble,
                        close: true, taper: 0.4, seed: s.seed, colour: st.colour });
    }
    if (st.trace > 0) {
      const path = [];
      for (let k = 0; k < ch.traceN; k++) path.push(to(ch.trace, k));
      stroke(g, shrink(path, 0.9), { passes: 1, width: st.width * 0.5,
                                     alpha: st.alpha * 0.62 * st.trace * gain,
                                     wobble: st.wobble * 0.3, taper: 0.55,
                                     seed: s.seed + 5, colour: st.colour });
    }
  }

  return { draw, drawFree, subunitCount: subs.length };
}
