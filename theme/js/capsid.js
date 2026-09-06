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

  /* Capsomers: the 12 pentamers and 30 hexamers the shell is actually built
     from. Encapsulins do not assemble one protomer at a time, and a drawing
     that shows single subunits docking is telling the wrong story — so the
     scroll story floats capsomers and lets them fly home.

     Each capsomer's centre in shell coordinates is a constant, so it is
     computed once here rather than every frame. */
  const byCap = new Map();
  subs.forEach((s, i) => {
    if (!byCap.has(s.cap)) byCap.set(s.cap, []);
    byCap.get(s.cap).push(i);
  });
  const capCentre = new Map();
  for (const [cap, list] of byCap) {
    let x = 0, y = 0, z = 0;
    for (const i of list) {
      const s = subs[i], o = ops[s.op], ch = chains[s.ch];
      for (let k = 0; k < ch.shapeN; k++) {
        const p = apply3(o.m, ch.shape[k * 3], ch.shape[k * 3 + 1], ch.shape[k * 3 + 2]);
        x += p[0] / R + o.w[0]; y += p[1] / R + o.w[1]; z += p[2] / R + o.w[2];
      }
    }
    const n = list.length * chains[subs[list[0]].ch].shapeN;
    capCentre.set(cap, [x / n, y / n, z / n]);
  }

  /** Deterministic per-subunit roll, for "is this one mutated yet". */
  const mutRoll = subs.map((_, i) => rng(i * 7717 + 31)());
  /** Where a mutation patch sits along a subunit's trace. */
  const mutAt = subs.map((_, i) => rng(i * 4441 + 17)());

  const L = (() => { const v = [-0.45, -0.62, 0.65], n = Math.hypot(...v);
                     return v.map(x => x / n); })();

  /**
   * @param g    2D context, already scaled to CSS pixels
   * @param W,H  CSS size of the drawing surface
   * @param yaw  rotation about the vertical axis, radians
   * @param st   style — see STYLE above
   * @param opt  { scale, cx, cy, explode, alpha, skipCaps, mut, mutHue }
   *             explode moves subunits out along their own radial vector, which
   *             is how the hero opens the shell; alpha fades the whole drawing.
   *             skipCaps omits capsomers the caller is drawing itself — the
   *             scroll story flies seven of them in by hand and lets this fill
   *             in the rest. mut (0..1) is the fraction of subunits carrying a
   *             mutation patch, drawn in mutHue.
   */
  function draw(g, W, H, yaw, st, opt = {}) {
    const S  = opt.scale ?? Math.min(W, H) * 0.40;
    const CX = opt.cx ?? W / 2, CY = opt.cy ?? H / 2;
    const explode = opt.explode ?? 0;
    const gain = opt.alpha ?? 1;
    if (gain <= 0.004) return;
    const skip = opt.skipCaps;
    const mut = opt.mut ?? 0;
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
      if (skip?.has(s.cap)) continue;
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
        const drawn = shrink(path, 0.9);
        stroke(g, drawn, {
          passes: 1,
          width: st.width * 0.34,
          alpha: st.alpha * 0.42 * ink * st.trace * gain,
          wobble: st.wobble * 0.3, taper: 0.55, seed: s.seed + 5, colour: st.colour,
        });
        if (mut > 0 && opt.mutHue) mutPatch(g, drawn, subs.indexOf(s), st, mut, gain, opt.mutHue);
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

  /**
   * A short stretch of one subunit's backbone, in the mutation hue.
   *
   * Mutations land on a sequence, so they are drawn ON the chain rather than as
   * a marker beside it — a few residues of a protomer coloured, in the same
   * line the rest of the drawing uses. Which subunits carry one is a fixed
   * per-subunit roll against `mut`, so patches accumulate as the fraction rises
   * instead of flickering between frames.
   */
  function mutPatch(g, path, idx, st, mut, gain, hue) {
    if (idx < 0 || mutRoll[idx] > mut) return;
    const span = Math.max(4, Math.round(path.length * 0.13));
    const a = Math.floor(mutAt[idx] * (path.length - span));
    stroke(g, path.slice(a, a + span), {
      passes: 3, width: st.width * 0.62,
      alpha: Math.min(1, st.alpha * 0.95) * gain,
      wobble: st.wobble * 0.25, taper: 0.35, seed: idx * 53 + 9, colour: hue,
    });
  }

  /** Where a capsomer sits on screen, so a caller can fly one to its place. */
  function capsomerScreen(cap, yaw, tilt, S, CX, CY) {
    const V = viewMatrix(yaw, tilt);
    const c = capCentre.get(cap);
    const p = apply3(V, c[0], c[1], c[2]);
    return [CX + p[0] * S, CY + p[1] * S, p[2]];
  }

  /**
   * One capsomer — a real pentamer or hexamer — drawn as a free-floating unit
   * centred at (cx, cy).
   *
   * The subunits keep their true arrangement within the capsomer; only the
   * capsomer's own centre is moved. That is what makes the assembly honest: fly
   * one of these to capsomerScreen(cap, yaw, tilt, ...) with the shell's own
   * yaw and tilt and it lands exactly where draw() would have put it, because
   * both are the same points under the same rotation.
   */
  function drawCapsomer(g, cap, yaw, tilt, st, opt = {}) {
    const list = byCap.get(cap);
    if (!list) return;
    const S = opt.scale ?? 40, CX = opt.cx ?? 0, CY = opt.cy ?? 0;
    const gain = opt.alpha ?? 1;
    if (gain <= 0.004) return;
    const mut = opt.mut ?? 0;
    const V = viewMatrix(yaw, tilt);
    const centre = capCentre.get(cap);

    const placed = list.map(i => {
      const s = subs[i], o = ops[s.op], ch = chains[s.ch];
      const M = mul3(V, o.m);
      const w = apply3(V, o.w[0] - centre[0], o.w[1] - centre[1], o.w[2] - centre[2]);
      const to = (arr, k) => {
        const p = apply3(M, arr[k * 3], arr[k * 3 + 1], arr[k * 3 + 2]);
        return [CX + (p[0] / R + w[0]) * S, CY + (p[1] / R + w[1]) * S];
      };
      let z = 0;
      for (let k = 0; k < ch.shapeN; k++) {
        z += apply3(M, ch.shape[k * 3], ch.shape[k * 3 + 1], ch.shape[k * 3 + 2])[2] / R;
      }
      return { i, s, ch, to, z: z / ch.shapeN + w[2] };
    }).sort((a, b) => a.z - b.z);

    for (const { i, s, ch, to } of placed) {
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
        const drawn = shrink(path, 0.9);
        stroke(g, drawn, { passes: 1, width: st.width * 0.5,
                           alpha: st.alpha * 0.62 * st.trace * gain,
                           wobble: st.wobble * 0.3, taper: 0.55,
                           seed: s.seed + 5, colour: st.colour });
        if (mut > 0 && opt.mutHue) mutPatch(g, drawn, i, st, mut, gain, opt.mutHue);
      }
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

  return {
    draw, drawCapsomer, capsomerScreen,
    capsomers: [...byCap.keys()],
    isPenton: cap => data.capKind[cap] === 0,
    subunitCount: subs.length,
  };
}
