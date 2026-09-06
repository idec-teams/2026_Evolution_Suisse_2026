/* ═══════════════════════════════════════════════════════════════════════════
   parts.js — draws any structure that was reduced to named parts.

   One renderer serves the dCas9·sgRNA repressor (5F9R) and the MutaT7
   polymerase (1MSW), because after the build step they are the same shape of
   thing: named backbone paths, optional silhouette samples, Angstrom
   coordinates on one shared scale. A second near-identical module would have
   drifted from this one within a week.

   Parts are drawn independently so an act can fade the DNA and keep the
   protein, or move the guide and the protein together while the gene stays
   behind. Coordinates share the capsid's scale, so when a shell closes around
   the repressor the size relationship is the real one — an 89 A complex inside
   a 190 A shell — rather than whatever composed well.
   ═══════════════════════════════════════════════════════════════════════════ */

import { stroke, hull2d, smoothClosed, shrink } from './pencil.js';
import { rng } from './util.js';

/* ── Presets ────────────────────────────────────────────────────────────────
   The protein is the setting; the nucleic acid is the subject. Drawn at equal
   weight a complex collapses into one scribble, so protein backbones are held
   to roughly half the ink and the guide is the darkest line in the drawing —
   a reader has to be able to follow it through the protein.
   `order` puts the thing that must stay readable last, so nothing overdraws it.
   ─────────────────────────────────────────────────────────────────────────── */

export const REPRESSOR = {
  weights: {
    rec:           { w: 0.85, a: 0.62, outline: 1.00, seed: 11 },
    nuc:           { w: 0.85, a: 0.62, outline: 1.00, seed: 23 },
    sgrna:         { w: 1.70, a: 1.00, outline: 0,    seed: 37 },
    dna_target:    { w: 1.30, a: 0.82, outline: 0,    seed: 53 },
    dna_nontarget: { w: 1.30, a: 0.82, outline: 0,    seed: 67 },
  },
  order: ['dna_target', 'dna_nontarget', 'nuc', 'rec', 'sgrna'],
  duplex: ['dna_target', 'dna_nontarget'],
};

export const POLYMERASE = {
  weights: {
    pol:             { w: 0.85, a: 0.58, outline: 1.00, seed: 81 },
    dna_template:    { w: 1.30, a: 0.85, outline: 0,    seed: 93 },
    dna_nontemplate: { w: 1.30, a: 0.85, outline: 0,    seed: 97 },
    rna:             { w: 1.70, a: 1.00, outline: 0,    seed: 71 },
  },
  order: ['dna_template', 'dna_nontemplate', 'pol', 'rna'],
  duplex: ['dna_template', 'dna_nontemplate'],
};

export function createParts(data, preset) {
  const { weights, order, duplex } = preset;
  const Q = data.q, jr = rng(4242);

  const unpack = (flat, n, jitter) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) out[i] = flat[i] / Q + (jr() - 0.5) * jitter;
    return out;
  };
  const parts = {};
  for (const [name, p] of Object.entries(data.parts)) {
    parts[name] = {
      segments: p.segments.map(s => ({ n: s.n, p: unpack(s.p, s.n, 0.9) })),
      shape: p.shapeN ? unpack(p.shape, p.shapeN, 1.4) : null,
      shapeN: p.shapeN,
    };
  }
  const anchors = Object.fromEntries(
    Object.entries(data.anchors).map(([k, v]) => [k, v.map(x => x / Q)]));

  /** Base-pair rungs, from real proximity rather than an assumed register:
      a duplex only reads as a duplex once the two strands are tied together. */
  const rungs = (() => {
    if (!duplex) return [];
    const A = parts[duplex[0]]?.segments[0], B = parts[duplex[1]]?.segments[0];
    if (!A || !B) return [];
    const out = [];
    for (let i = 0; i < A.n; i += 3) {
      let best = -1, bd = 24 * 24;
      for (let j = 0; j < B.n; j++) {
        const dx = A.p[i*3] - B.p[j*3], dy = A.p[i*3+1] - B.p[j*3+1],
              dz = A.p[i*3+2] - B.p[j*3+2];
        const d = dx*dx + dy*dy + dz*dz;
        if (d < bd) { bd = d; best = j; }
      }
      if (best >= 0) out.push([i, best]);
    }
    return out;
  })();

  /**
   * @param M     3x3 row-major view rotation (from the caller, so the complex
   *              can share the capsid's orientation when it sits inside one)
   * @param opt   { scale, cx, cy, offset:[x,y,z] in Angstrom, parts:{name:0..1} }
   */
  function draw(g, M, st, opt = {}) {
    const S = opt.scale ?? 1, CX = opt.cx ?? 0, CY = opt.cy ?? 0;
    const [ox, oy, oz] = opt.offset ?? [0, 0, 0];
    const vis = opt.parts ?? {};
    const gain = opt.alpha ?? 1;
    if (gain <= 0.004) return;

    const to = (arr, i) => {
      const x = arr[i*3] + ox, y = arr[i*3+1] + oy, z = arr[i*3+2] + oz;
      return [CX + (M[0]*x + M[1]*y + M[2]*z) * S,
              CY + (M[3]*x + M[4]*y + M[5]*z) * S];
    };

    for (const name of order) {
      const part = parts[name];
      if (!part) continue;
      const v = vis[name] ?? 1;
      if (v <= 0.004) continue;
      const cfg = weights[name];
      if (!cfg) continue;
      const alpha = st.alpha * cfg.a * gain * v;

      if (part.shape && st.outline > 0 && cfg.outline > 0) {
        const pts = [];
        for (let i = 0; i < part.shapeN; i++) pts.push(to(part.shape, i));
        const poly = smoothClosed(shrink(hull2d(pts), 0.94), 2);
        if (poly.length >= 3) {
          stroke(g, poly, {
            passes: 2, width: st.width * cfg.outline * 0.8,
            alpha: alpha * st.outline * 4.2,   // the lobes need more silhouette
            wobble: st.wobble, close: true, taper: 0.4,
            seed: cfg.seed, colour: st.colour,
          });
        }
      }

      for (let k = 0; k < part.segments.length; k++) {
        const seg = part.segments[k], path = [];
        for (let i = 0; i < seg.n; i++) path.push(to(seg.p, i));
        stroke(g, path, {
          passes: st.passes >= 3 ? 2 : 1,
          width: st.width * cfg.w * 0.55,
          alpha: alpha * 0.9, wobble: st.wobble * 0.35, taper: 0.5,
          seed: cfg.seed + k * 7, colour: st.colour,
        });
      }
    }

    const dv = duplex ? Math.min(vis[duplex[0]] ?? 1, vis[duplex[1]] ?? 1) : 0;
    if (dv > 0.004 && rungs.length) {
      const A = parts[duplex[0]].segments[0], B = parts[duplex[1]].segments[0];
      for (const [i, j] of rungs) {
        stroke(g, [to(A.p, i), to(B.p, j)], {
          passes: 1, width: st.width * 0.35,
          alpha: st.alpha * 0.5 * gain * dv, wobble: st.wobble * 0.3,
          taper: 0.4, seed: i * 31 + 5, colour: st.colour,
        });
      }
    }
  }

  /** Where a grip is, in Angstrom, for figures that draw the two handles. */
  const anchor = name => anchors[name];

  return { draw, anchor, span: data.spanAngstrom };
}
